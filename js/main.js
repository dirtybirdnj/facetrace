'use strict';

function previewFile() {
  var uploadContainer = document.querySelector('#uploadContainer');
  var greyscale = document.querySelector('#imgGreyscale');
  var preview = document.querySelector('#imgSubmit');
  var greyscale = document.querySelector('#imgGreyscale');
  var file    = document.querySelector('#imgToProcess').files[0];
  var reader  = new FileReader();

  reader.onloadend = function () {
    
  	$(uploadContainer).slideUp();
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
  var brightness = document.querySelector('#imgBrightness');
  var contrast = document.querySelector('#imgContrast');  

  Caman('#imgGreyscale',preview.src, function(){

    this.resize({width: 260});
    
    if(contrast.value != 0) this.contrast(contrast.value);
    if(brightness.value != 0) this.brightness(brightness.value);
 
    this.render();

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

function convertSVG(){

	var greyscale = document.querySelector('#imgGreyscale');
	var svgContainer = document.querySelector('#svgContainer');

	console.log(greyscale.toDataURL('image/png'));

	Potrace.loadImageFromUrl(greyscale.toDataURL('image/png'));
	//Potrace.loadImageFromFile(greyscale.toDataURL('image/png'));
	Potrace.process(function(){
		svgContainer.innerHTML = Potrace.getSVG(1);
	});

}