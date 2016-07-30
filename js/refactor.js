'use strict';

var FaceTrace = {
	init: function () {
		this.elements();
		this.events();
	},

	elements: function () {


		this.btnUploadNew = document.querySelector('#btnUploadNew');
		this.imageInput = document.querySelector('#imgToProcess');
		this.uploadContainer = document.querySelector('#uploadContainer');

		//Image processing container and sliders
		this.imageSettings = document.querySelector('#imageSettings');
		this.preview = document.querySelector('#imgSubmit');
		this.brightness = document.querySelector('#imgBrightnessValue');
		this.contrast = document.querySelector('#imgContrastValue');
		this.exposure = document.querySelector('#imgExposureValue');
		this.clip = document.querySelector('#imgClipValue');		
		this.targetCanvas = document.querySelector('#imgGreyscale');

		//Original 
		this.preview = document.querySelector('#imgSubmit');
		
		//Processed Image and Container
		this.imageProcessedContainer = document.querySelector('#imgProcessedContainer');
		this.imageProcessed = document.querySelector('#imgProcessed');

		this.imageProcessedBase64 = document.querySelector('#imgProcessOutput');

		//Initial Bitmap to SVG conversion
		this.svgContainer = document.querySelector('#svgContainer');

		//Composite SVG
		this.compositeSVG = document.querySelector('#traceComposite');

		//Workspace
		this.workspace = document.querySelector('#workspace');

		//Capture single trace button
		this.btnCaptureTrace = document.querySelector('#captureTrace');

		//Download SVG Button
		this.btnDownloadSVG = document.querySelector('#btnDownloadSVG');
		this.downloadSVGTarget = document.querySelector('#downloadSVGTarget');

		//Step Mode toggle buttons
		this.$stepModeToggleBtns = $('.toggleStepMode');
		this.stepModeSetting = document.querySelector('#stepModeValue');

		//Potrace Turnpolicy
		this.$potraceTurnpolicyBtns = $('.btnPotraceTurnpolicy');
		this.potraceTurnpolicy = document.querySelector('#potraceTurnpolicyValue');

		//Potrace OptCurve
		this.$potraceOptcurveBtns = $('.potraceOptcurveSetting');
		this.potraceOptcurveValue = document.querySelector('#potraceOptcurveValue');

		//Potrace Sliders: Turdsize, Alphamax, Opttolerance
		this.potraceTurdsize = document.querySelector('#potraceTurdsizeValue');
		this.potraceAlphamax = document.querySelector('#potraceAlphamaxValue');
		this.potraceOpttolerance = document.querySelector('#potraceOpttoleranceValue');				

	},

	events: function () {

		$(this.btnUploadNew).on('click',this.newImageInput.bind(this));
		$(this.imageInput).on('change',this.handleImageInput.bind(this));
		$(this.btnCaptureTrace).on('click',this.addCompositeLayer.bind(this));
		$(this.$stepModeToggleBtns).on('click',this.toggleStepMode.bind(this));
		$(this.$potraceTurnpolicyBtns).on('click',this.applyPotraceTurnpolicy.bind(this));
		$(this.$potraceOptcurveBtns).on('click',this.applyPotraceOptcurve.bind(this));
		$(this.btnDownloadSVG).on('click',this.downloadSVG.bind(this));
	},

	// New Canvas Prototype Element
	imageProcessedProto: function(){

			var div = document.createElement('canvas');
			div.setAttribute('id','imgProcessed');
			div.setAttribute('class','previewImage');
			return div;
	},

	// Replaces the canvas div before each Caman process, so the image updates properly
	replaceCanvasDiv: function(){

		var targetCanvas = document.querySelector('#imgProcessed');

		this.imageProcessedContainer.removeChild(targetCanvas);
		this.imageProcessedContainer.appendChild(this.imageProcessedProto());
		this.imageProcessed = this.imageProcessedContainer.children[0];

	},

	newImageInput: function(event){

		$(this.imageInput).trigger('click');

	},

	handleImageInput: function(event){

	  var file    = this.imageInput.files[0];
	  var reader  = new FileReader();

	  reader.onloadend = function (scope) {
	    
	    FaceTrace.btnCaptureTrace.disabled = false;
	    $(FaceTrace.btnCaptureTrace).toggleClass('btn-default btn-success');
	    //$(FaceTrace.btnUploadNew).toggleClass('btn-primary btn-default');
	    $(FaceTrace.btnUploadNew).hide();
		FaceTrace.preview.src = reader.result;
		
		//Initially greyscale the image for display
		FaceTrace.processImage();

	  }

	  if (file) {
	    reader.readAsDataURL(file);
	  } else {
	    preview.src = "";
	  }


	},

	processImage: function(event){
	
		//Make sure we are always painting on a fresh canvas
		this.replaceCanvasDiv();

		Caman(this.imageProcessed,this.preview.src, function(){

			//this.resize({width: 1000});
			this.greyscale();
			this.brightness(FaceTrace.brightness.value);
			this.contrast(FaceTrace.contrast.value);			
			this.exposure(FaceTrace.exposure.value);
			this.clip(FaceTrace.clip.value);

			this.render(function(){
				
				FaceTrace.bitmapToSVG(this.toBase64());
			
			});

		});

		return;

	},

	bitmapToSVG: function(base64ImageData){

		this.svgContainer.innerHTML = '';

		//var y = (x == 2 ? "yes" : "no");
		//var optCurve = false;
		//if(this.potraceOptcurveValue.value === 'true') optCurve = true;

		Potrace.setParameter({
			turnpolicy: this.potraceTurnpolicy.value,
			turdsize: this.potraceTurdsize.value,
			optcurve: (this.potraceOptcurveValue.value === 'true' ? true : false),
			alphamax: this.potraceAlphamax.value,
			opttolerance: this.potraceOpttolerance.value

		});

		Potrace.loadImageFromUrl(base64ImageData);
		Potrace.process(function(){
			
			FaceTrace.svgContainer.innerHTML = Potrace.getSVG(1,"curve");
			FaceTrace.svgShapesToTrace();
		});

	},
	svgShapesToTrace: function(event){

		var PotraceOutput = this.svgContainer.children[0].children[0];
		PotraceOutput.setAttribute('fill','none');
		PotraceOutput.setAttribute('stroke','#FF0000');

		//Default SVG size... no scaling
		this.workspace.setAttribute('width',this.imageProcessed.width + 100);
		this.workspace.setAttribute('height',this.imageProcessed.height + 100);

		//Set the background of the SVG?
		//this.workspace.setAttribute('style','background:url(data:image/png;base64,')
		//this.workspace.setAttribute('width','auto');
		//this.workspace.setAttribute('height','auto');
		//SCALING PLS... 
		//this.workspace.setAttribute('viewbox','0 0 ' + this.imageProcessed.width + ' ' + this.imageProcessed.height)

		this.drawWorkspace();

		//var existingTraces = $(this.compositeSVG).children();

	},

	addCompositeLayer: function(event){

		var activeTrace = this.svgContainer.children[0].children[0];

		//activeTrace.setAttribute('stroke','#000000');

		var firstWorkspaceTrace = this.workspace.children[0];
		firstWorkspaceTrace.setAttribute('stroke','#000000');

		var nodeCopy = activeTrace.cloneNode(true);
		nodeCopy.setAttribute('stroke','#000000');
		this.compositeSVG.appendChild(nodeCopy);



	},

	drawWorkspace: function(event){
	
		var activeTrace = this.svgContainer.children[0].children[0].cloneNode(true);
		var existingTraces = $(this.compositeSVG).children();

		//Clear the existing workspace
		while(this.workspace.firstChild){
			this.workspace.removeChild(this.workspace.firstChild);
		}

		//Add the active trace
		this.workspace.appendChild(activeTrace);

		//Add all the existing traces
		$.each(existingTraces,function(index,trace){

			var traceCopy = trace.cloneNode(true);
			FaceTrace.workspace.appendChild(traceCopy);

		});

		if(this.stepModeSetting.value == 'true'){

			this.addCompositeLayer();
		}

	},

	toggleStepMode: function(event){

		var newStepModeSetting = $(event.target).attr('stepmode');
		this.stepModeSetting.setAttribute('value',newStepModeSetting);		
		$(this.$stepModeToggleBtns).toggleClass('btn-primary');

	},

	applyPotraceTurnpolicy: function(event){

		//Remove btn-primray from all buttons
		$.each(this.$potraceTurnpolicyBtns,function(index, button){
			if($(button).hasClass('btn-primary')){
				$(button).removeClass('btn-primary');
				$(button).addClass('btn-default');
			}
		});

		//Add Primary to the clicked button
		$(event.target).addClass('btn-primary');

		var turnpolicy = event.target.getAttribute('value');
		this.potraceTurnpolicy.value = turnpolicy;		

		//Re-draw workspace with the new setting
		this.processImage();

	},
	applyPotraceOptcurve: function(event){


		//Toggle input button classes		
		$.each(this.$potraceOptcurveBtns,function(index, button){
			$(button).toggleClass('btn-primary btn-default');
		});

		this.potraceOptcurveValue.value = $(event.target).prop('value');

		//Re-draw workspace with the new setting
		this.processImage();


	},

	downloadSVG: function(event){

			var svg = this.workspace;

			//get svg source.
			var serializer = new XMLSerializer();
			var source = serializer.serializeToString(svg);

			//add name spaces.
			if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
			    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
			}
			if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
			    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
			}

			//add xml declaration
			source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

			//convert svg source to URI data scheme.
			var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);

			//set url value to a element's href attribute.
			this.downloadSVGTarget.href = url;

			console.log(url);

			window.location = url;



	}

};

	$(function() {

		FaceTrace.init();

		$("#imgBrightnessValue").slider({});
		$("#imgContrastValue").slider({});  
		$("#imgExposureValue").slider({});  
		$("#imgClipValue").slider({});
		$("#potraceTurdsizeValue").slider({});
		$("#potraceAlphamaxValue").slider({});
		$("#potraceOpttoleranceValue").slider({});				

		//When one of the image setting sliders is clicked and dragged
		$('#imageSettings').on('change','.imageSettingSlider',function(event){
		  
		  //Update the UI
		  $(event.target).parent().find('.displaySetting').prop('value',event.target.value);
		  FaceTrace.processImage();

		});

		//When one of the potrace setting sliders is clicked and dragged
		$('#potraceSettings').on('change','.potraceSettingSlider',function(event){
		  
		  //Update the UI
		  $(event.target).parent().find('.displaySetting').prop('value',event.target.value);
		  FaceTrace.processImage();

		});		

		//When one of the +, - or Reset buttons are clicked
		$('.settingSliderForm').on('click','.btnModifySetting',function(event){

			var targetInput = $(event.target).parent().parent().find('.displaySetting');
			var targetSlider = $(event.target).parent().parent().parent().parent().find('.imageSettingSlider');
			
			var displayInputValue = parseInt(targetInput.val());
			var buttonValue = parseInt($(event.target).prop('value'));

			var newValue = 0;

			if(buttonValue != 0){ newValue = displayInputValue + buttonValue; }

			targetInput.val(newValue);
			targetSlider.slider('setValue',newValue);

			FaceTrace.processImage();

		});	

});