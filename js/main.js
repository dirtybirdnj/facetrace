'use strict';


$(function() { 

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
      
      processImg();

  });  

});

function previewFile() {
  var uploadContainer = document.querySelector('#uploadContainer');
  var imageSettings = document.querySelector('#imageSettings');
  var greyscale = document.querySelector('#imgGreyscale');
  var preview = document.querySelector('#imgSubmit');
  var file    = document.querySelector('#imgToProcess').files[0];
  var reader  = new FileReader();

  reader.onloadend = function () {
    
  	$(uploadContainer).slideUp();
    $(imageSettings).slideDown();
    preview.src = reader.result;
    convertGreyscale();

    // convertGreyscale().then(function()
    // 	{ displaySVG(); }, 
    // 	{  }
    // );


  }

  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
}

function processImg(){
  
  var preview = document.querySelector('#imgSubmit');

  var brightness = document.querySelector('#imgBrightnessValue');
  var contrast = document.querySelector('#imgContrastValue');

  var targetCanvas = document.querySelector('#imgGreyscale');

  //targetCanvas.clearRect(0, 0, targetCanvas.width, targetCanvas.height);  

  Caman('#imgGreyscale',preview.src, function(){


    this.resize({width: 260});
    
    if(contrast.value != 0) this.contrast(contrast.value);
    if(brightness.value != 0) this.brightness(brightness.value);
 
    console.log('contrast: ' + contrast.value, 'brightness: ' + brightness.value)

    this.render();
    convertSVG();


  });

}

function convertGreyscale(){

  var preview = document.querySelector('#imgSubmit');
  
  Caman('#imgGreyscale',preview.src, function(){

    this.resize({width: 260});
    
  //  this.contrast(50);
  //  //this.sharpen(100);
  //  this.brightness(5);
  //  //this.noise(50);
  //  //this.exposure(50);
  //  //this.gamma(3);
    this.greyscale();
    this.render();

  });

  return;

}

function svgShapeToTrace(){

  var svgContainer = $('#svgContainer').children();
  var traceContainer = document.querySelector('#traceContainer');
  traceContainer.innerHTML = svgContainer[0];

  var traceSVG = $('#traceContainer').children();

  $(traceSVG[0]).prop('fill','none');
  $(traceSVG[0]).prop('stroke','#000000');

}

function convertSVG(){

	var greyscale = document.querySelector('#imgGreyscale');
	var svgContainer = document.querySelector('#svgContainer');

  svgContainer.innerHTML = '';

	Potrace.loadImageFromUrl(greyscale.toDataURL('image/png'));
	Potrace.process(function(){
		svgContainer.innerHTML = Potrace.getSVG(1);
    //svgShapeToTrace();
	});

}


