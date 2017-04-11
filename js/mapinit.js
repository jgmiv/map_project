"use strict";
var map;

var marker = [];

function initMap() {

	vm = new ViewModel();

	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 33.209979, lng: -87.571085},
	  zoom: 15
	  });

ko.applybindings(vm);	
}
