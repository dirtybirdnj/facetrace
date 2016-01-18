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
		this.btnCaptureTrace = document.querySelector('#captureTrace');

	},

	events: function () {

		$(this.btnUploadNew).on('click',this.newImageInput.bind(this));
		$(this.imageInput).on('change',this.handleImageInput.bind(this));
		$(this.btnCaptureTrace).on('click',this.addCompositeLayer.bind(this));
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
	    
		FaceTrace.preview.src = reader.result;
		
		//Initially greyscale the image, no processing yet
		FaceTrace.processImage();

	  }

	  if (file) {
	    reader.readAsDataURL(file);
	  } else {
	    preview.src = "";
	  }


	},

	resetAllSettings: function(event){



	},

	processImage: function(event){
	
		//Make sure we are always painting on a fresh canvas
		this.replaceCanvasDiv();

		Caman(this.imageProcessed,this.preview.src, function(){

			this.resize({width: 500});
			this.greyscale();
			this.brightness(FaceTrace.brightness.value);
			this.contrast(FaceTrace.contrast.value);			
			this.exposure(FaceTrace.exposure.value);
			this.clip(FaceTrace.clip.value);

			this.render(function(){

				//console.log(this.toBase64());
				//FaceTrace.imageProcessedBase64.src = this.toBase64();
				FaceTrace.bitmapToSVG(this.toBase64());


			});

		});

		return;

	},

	bitmapToSVG: function(base64ImageData){

		this.svgContainer.innerHTML = '';

		Potrace.setParameter({
			turnpolicy: "minority",
			turdsize: 20,
			optcurve: true,
			opttolerance: 1

		});
		//Potrace.loadImageFromUrl(this.imageProcessed.toDataURL('image/png'));
		Potrace.loadImageFromUrl(base64ImageData);
		Potrace.process(function(){
			
			FaceTrace.svgContainer.innerHTML = Potrace.getSVG(1);
			FaceTrace.svgShapesToTrace();
		});

	},
	svgShapesToTrace: function(event){

		var PotraceOutput = this.svgContainer.children[0].children[0];
		PotraceOutput.setAttribute('fill','none');
		PotraceOutput.setAttribute('stroke','#0000FF');

	},

	addCompositeLayer: function(event){

		var activeTrace = this.svgContainer.children[0].children[0];
		activeTrace.setAttribute('stroke','#000000');
		this.compositeSVG.appendChild(activeTrace);
	}

};

	$(function() {

		FaceTrace.init();

		$("#imgBrightnessValue").slider({});
		$("#imgContrastValue").slider({});  
		$("#imgExposureValue").slider({});  
		$("#imgClipValue").slider({});

		//When one of the sliders is clicked and dragged
		$('#imageSettings').on('change','.imageSettingSlider',function(event){
		  
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