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
		
		//Processed Image
		this.imageProcessed = document.querySelector('#imgProcessed');

		//Initial Bitmap to SVG conversion
		this.svgContainer = document.querySelector('#svgContainer');		

	},

	events: function () {
		//this.$batchQaStartForm.on('submit', this.onBatchQaStartFormSubmit.bind(this));
		$(this.imageInput).on('change',this.handleImageInput.bind(this));
	},

	handleImageInput: function(event){

	  var file    = this.imageInput.files[0];
	  var reader  = new FileReader();

	  reader.onloadend = function (scope) {
	    
		$(FaceTrace.uploadContainer).slideUp();
		$(FaceTrace.imageSettings).slideDown();
		FaceTrace.preview.src = reader.result;
		
		FaceTrace.convertGreyscale();

	  }

	  if (file) {
	    reader.readAsDataURL(file);
	  } else {
	    preview.src = "";
	  }


	},

	convertGreyscale: function(event){

		Caman(this.imageProcessed,this.preview.src, function(){

			this.resize({width: 500});
			this.greyscale();
			this.render();

			FaceTrace.bitmapToSVG();

		});

		return;		
	},

	processImage: function(event){

		
	},

	bitmapToSVG: function(event){

		this.svgContainer.innerHTML = '';

		Potrace.loadImageFromUrl(this.imageProcessed.toDataURL('image/png'));
		Potrace.process(function(){
			
			FaceTrace.svgContainer.innerHTML = Potrace.getSVG(1);
			FaceTrace.svgShapesToTrace();
		});

	},
	svgShapesToTrace: function(event){

		var PotraceOutput = this.svgContainer.children[0].children[0];
		PotraceOutput.setAttribute('fill','none');
		PotraceOutput.setAttribute('stroke','#000000');

	}

};

	$(function() {

		FaceTrace.init();
		//Mousetrap.bind('enter', function() { $('#btnBatchQAStart').click(); });

	  $("#imgBrightnessValue").slider({
	    tooltip: 'always'
	  });

	  $("#imgContrastValue").slider({
	    tooltip: 'always'
	  });  

	  $("#imgExposure").slider({
	    tooltip: 'always'
	  });  

	  $("#imgClip").slider({
	    tooltip: 'always'
	  });

	  $('#imageSettings').on('change','.imageSettingSlider',function(){
	      
	      //FaceTrace.UI.processImg();

	  });  	

});