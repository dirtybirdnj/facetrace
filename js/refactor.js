'use strict';

var FaceTrace = {
	init: function () {
		this.elements();
		this.events();
	},

	elements: function () {

		this.imageInput = document.querySelector('#imgToProcess');
		this.uploadContainer = document.querySelector('#uploadContainer');

		//Image processing container and sliders
		this.imageSettings = document.querySelector('#imageSettings');
		this.preview = document.querySelector('#imgSubmit');
		this.brightness = document.querySelector('#imgBrightnessValue');
		this.contrast = document.querySelector('#imgContrastValue');
		this.targetCanvas = document.querySelector('#imgGreyscale');

		//Original 
		this.preview = document.querySelector('#imgSubmit');
		
		//Processed Image and Container
		this.imageProcessedContainer = document.querySelector('#imgProcessedContainer');
		this.imageProcessed = document.querySelector('#imgProcessed');

		this.imageProcessedBase64 = document.querySelector('#imgProcessOutput');

		//Initial Bitmap to SVG conversion
		this.svgContainer = document.querySelector('#svgContainer');		

	},

	events: function () {
		//this.$batchQaStartForm.on('submit', this.onBatchQaStartFormSubmit.bind(this));
		$(this.imageInput).on('change',this.handleImageInput.bind(this));
	},

	imageProcessedProto: function(){
			var div = document.createElement('canvas');
			div.setAttribute('id','imgProcessed');
			div.setAttribute('class','previewImage');
			return div;
	},

	replaceCanvasDiv: function(){

		var targetCanvas = document.querySelector('#imgProcessed');

		this.imageProcessedContainer.removeChild(targetCanvas);
		this.imageProcessedContainer.appendChild(this.imageProcessedProto());
		this.imageProcessed = this.imageProcessedContainer.children[0];

	},

	handleImageInput: function(event){

	  var file    = this.imageInput.files[0];
	  var reader  = new FileReader();

	  reader.onloadend = function (scope) {
	    
		$(FaceTrace.uploadContainer).slideUp();
		$(FaceTrace.imageSettings).slideDown();
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

	processImage: function(event){
	
		//Make sure we are always painting on a fresh canvas
		this.replaceCanvasDiv();

		Caman(this.imageProcessed,this.preview.src, function(){

			this.resize({width: 500});
			this.greyscale();
			if(FaceTrace.brightness.value != 0) this.brightness(FaceTrace.brightness.value);
			if(FaceTrace.contrast.value != 0) this.brightness(FaceTrace.contrast.value);			

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

	}

};

	$(function() {

		FaceTrace.init();

		$("#imgBrightnessValue").slider({});
		$("#imgContrastValue").slider({});  
		$("#imgExposure").slider({});  
		$("#imgClip").slider({});

		$('#imageSettings').on('change','.imageSettingSlider',function(event){
		  
		  var targetInput = $(event.target).parent().parent().find('.displaySetting');
		  var displayInput = $(event.target).parent().parent().find('.displaySetting');


		  targetInput.prop('value',event.target.value);

		  displayInput.val(event.target.value);

		  console.log(event.target.value);

		  FaceTrace.processImage();

		});

		$('.settingSliderForm').on('click','.btnModifySetting',function(event){


			var targetInput = $(event.target).parent().parent().find('.displaySetting');
			var targetSlider = $(event.target).parent().parent().parent().parent().find('.imageSettingSlider');
			var newValue = parseInt(targetInput.val()) + parseInt($(event.target).prop('value'))

			targetInput.val(newValue);
			targetSlider.slider('setValue',newValue);

			FaceTrace.processImage();

		}); 	

});