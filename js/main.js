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
    displaySVG();

  }

  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
}

function convertGreyscale(){

  var preview = document.querySelector('#imgSubmit');
  
  Caman('#imgGreyscale',preview.src, function(){

  	this.saturation(-100).render();

  });

}

function displaySVG(){

	var greyscale = document.querySelector('#imgGreyscale');
	var svgContainer = document.querySelector('#svgContainer');

	//Potrace.loadImageFromUrl(greyscale.toDataURL('image/png'));
	Potrace.loadImageFromFile(greyscale.toDataURL('image/png'));
	Potrace.process(function(){
		svgContainer.innerHTML = Potrace.getSVG(1);
	});

}