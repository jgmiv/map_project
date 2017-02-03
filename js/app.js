"use strict";
var map;
var markers = [];
var marker;
var largeInfoWindow;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 33.209979,
            lng: -87.571085
        },
        zoom: 15
    });

    largeInfoWindow = new google.maps.InfoWindow();

    placeMarkers();

    ko.applyBindings(new ViewModel());

}

var currentPlaces = [{
geometry: {
    lat: 33.207634,
    lng: -87.550510
},
properties: 'Bryant-Denny Stadium'
}, {
geometry: {
    lat: 33.209875,
    lng: -87.546295
},
properties: 'Denny Chimes'
}, {
geometry: {
    lat: 33.213905,
    lng: -87.530016
},
properties: 'Rhoads Stadium',
image: 'https://s-media-cache-ak0.pinimg.com/236x/72/c6/0a/72c60a830cdd8e8e60cb9a1e1e959793.jpg'
}, {
geometry: {
    lat: 33.210787,
    lng: -87.532373
},
properties: 'Soccer Stadium', 
image: "https://www.interiordecorating.com/images/products/1732-3757_z.jpg",
}, {
geometry: {
    lat: 33.204686,
    lng: -87.538614
},
properties: 'Sewell-Thomas Stadium',
image: 'http://wbrc.images.worldnow.com/images/9925769_G.jpg'
},{
 geometry: {
    lat: 33.202945,
    lng: -87.539768
},
properties: 'Coleman Colliseum',
image: 'http://s3.amazonaws.com/rolltide.com/images/2016/6/21/8626767.jpeg'
}, {
geometry: {
    lat: 33.206623,
    lng: -87.539650
},
properties: 'Bryant Museum'
}];


var placeMarkers = function(){

var bounds = new google.maps.LatLngBounds();

for (var i = 0; i < currentPlaces.length; i++) {

    var position = currentPlaces[i].geometry;
    var title = currentPlaces[i].properties;
    var image = currentPlaces[i].image;
    var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        image: image,
        animation: google.maps.Animation.BOUNCE,
        id: i
    });

    markers.push(marker);
    
    marker.addListener('click', function() {
        var self = this;
        populateInfoWindow(this, largeInfoWindow);
        toggleBounce(this);

    // marker.setAnimation(google.maps.Animation.BOUNCE);
    // setTimeout(function(){self.setAnimation(null); }, 750);    

    });

    bounds.extend(markers[i].position);
    // currentPlaces[i].marker = marker;
    // marker.addListener('click', toggleBounce);
    function toggleBounce(currentMarker) {
    for (var i = 0; i < markers.length; i ++)

        currentMarker.setAnimation(null);

        if (currentMarker) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(currentMarker){ currentMarker.setAnimation(null); }, 750,(marker));
        }
}
}

map.fitBounds(bounds);


function populateInfoWindow (marker, infowindow) {

            // Check to make sure the infowindow is not already opened on this marker.
if (infowindow.marker != marker) {
  // Clear the infowindow content to give the streetview time to load.
  infowindow.setContent('');
  infowindow.marker = marker;
  // Make sure the marker property is cleared if the infowindow is closed.
  infowindow.addListener('closeclick', function() {
    infowindow.marker = null;
  });
  var streetViewService = new google.maps.StreetViewService();
  var radius = 50;
  // In case the status is OK, which means the pano was found, compute the
  // position of the streetview image, then calculate the heading, then get a
  // panorama from that and set the options
  function getStreetView(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {
      var nearStreetViewLocation = data.location.latLng;
      var heading = google.maps.geometry.spherical.computeHeading(
        nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
      var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), panoramaOptions);
    } else {
        var infowindowHTML =  '<div>' + marker.title + '</div>' + "<img width = '80' src =" + marker.image + ">";
        infowindow.setContent(infowindowHTML);

    }
  }
  // +'<div>No Street View Found</div>'
  // Use streetview service to get the closest streetview image within
  // 50 meters of the markers position
  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  // Open the infowindow on the correct marker.
  infowindow.open(map, marker);
}

};


}


var Places = function(data) {
    var self = this;
    self.place = ko.observable(data.geometry);
    self.title = ko.observable(data.properties);
    self.image = ko.observable(data.image);
};

var ViewModel = function() {

    var self = this;

    this.placesList = ko.observableArray([]);
    self.markers = ko.observableArray([]);

    currentPlaces.forEach(function(item) {
        self.placesList.push(new Places(item));
    });

    this.currentPlace = ko.observable(this.placesList()[0]);

    this.setPlace = function(clickedPlaces){
        self.currentPlace(clickedPlaces);
    };

    self.currentPlace = function() {
        populateInfoWindow(this, infowindow);
    };

    this.setMarker = function(clickedPlaces) {
        self.currentPlace(clickedPlaces);
    };


    
}