"use strict";
//Global variables
var map;
var markers = [];
var marker;
var largeInfoWindow;
var vm;
// Initilizes the map
function initMap() {
    vm = new ViewModel();
    var placeLatlng = {
        lat: 33.209979,
        lng: -87.571085
    };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: placeLatlng
    });

    largeInfoWindow = new google.maps.InfoWindow();

    ko.applyBindings(vm);
    placeMarkers();



}

//Model
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
        lat: 33.2133867,
        lng: -87.5304115
    },
    properties: 'Rhoads Stadium',
    image: 'https://s-media-cache-ak0.pinimg.com/236x/72/c6/0a/72c60a830cdd8e8e60cb9a1e1e959793.jpg'
}, {
    geometry: {
        lat: 33.210780,
        lng: -87.532379
    },
    properties: 'Alabama Soccer Stadium',
    image: "https://www.interiordecorating.com/images/products/1732-3757_z.jpg",
}, {
    geometry: {
        lat: 33.204686,
        lng: -87.538614
    },
    properties: 'Sewell-Thomas Stadium',
    image: 'http://wbrc.images.worldnow.com/images/9925769_G.jpg'
}, {
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


var placeMarkers = function() {

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
            animation: google.maps.Animation.DROP,
            id: i
        });

        vm.placesList()[i].marker = marker;

        markers.push(marker);

        marker.addListener('click', function() {
            var self = this;
            populateInfoWindow(this, largeInfoWindow);
            toggleBounce(this);

        });



        bounds.extend(markers[i].position);

        function toggleBounce(currentMarker) {
            currentMarker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                currentMarker.setAnimation(null);
            }, 1400);
        }
    }

        map.fitBounds(bounds);

    //getting data from wikipedia..
    //concept from the class videos tutorial..



    function populateInfoWindow(marker, infowindow) {

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
                    //Provides panorama view if available.
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
                    //Provides an image if no street view is available.
                } else {
                    var infowindowHTML = '<div>' + marker.title + '</div>' + "<img width = '80' src =" + marker.image + ">";
                    infowindow.setContent(infowindowHTML);

                }
            }
            // Use streetview service to get the closest streetview image within
            // 50 meters of the markers position
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);
            wikiLinks();


            function wikiLinks() {
                var $wikiHeaderElem = $('#wikipedia-header')
                var wikiRequestTimeout = setTimeout(function() {
                    $wikiHeaderElem.text("failed to load wikipedia resources");
                }, 4000);

                var wikipediaEndPointUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json';

                $.ajax({
                    url: wikipediaEndPointUrl,
                    data: {
                        "action": "opensearch",
                        "search": marker.title,
                        "format": "json",
                    },
                    dataType: "jsonp",
                    success: function(response) {
                        vm.wikiInfo({

                            title: response[0],
                            url: response[3][0]
                        });

                        clearTimeout(wikiRequestTimeout);

                    }
                });

            }



        }

    }


};


var Place = function(data) {
    this.place = ko.observable(data.geometry);
    this.title = ko.observable(data.properties);
    this.image = ko.observable(data.image);
    this.marker = ko.observable();

};
//ViewModel 
var ViewModel = function() {

    var self = this;

    this.placesList = ko.observableArray([]);
    this.markers = ko.observableArray([]);
    this.filterTxt = ko.observable("");
    // this.wikiLinks = ko.observableArray([]);
    this.wikiInfo = ko.observable();



    currentPlaces.forEach(function(placeItem) {
        self.placesList.push(new Place(placeItem));
    });

    // currentPlaces.forEach(function(article) {
    //     self.wikiLinks().push(new Place(article));
    //     // console.log(wikiLinks);
    // });

    markers.forEach(function(marker, i) {
        self.placesList()[i].markers = marker;
        // console.log(marker);
    });

    // self.wikiLinks().forEach(function(article, i) {
    //     self.placesList()[i].wikiLinks = article;
    //     // console.log(article);
    // });

    this.currentPlace = ko.observable(this.placesList()[0]);
    // console.log(self.currentPlace);

    this.placesList.marker = ko.observable(this.placesList()[0]);

    // this.wikiLinks.marker = ko.observable(this.wikiLinks()[0]);

    this.changePlace = function(clickedPlace) {
        self.currentPlace(clickedPlace);
        // console.log(clickedPlace)
    };

    this.setPlace = function(clickedPlace) {
        self.showPlace(clickedPlace);
        google.maps.event.trigger(clickedPlace.marker, 'click');
        map.setCenter(clickedPlace.marker.position);
        map.setZoom(17);
    };

    this.showPlace = function(location) {
        self.currentPlace(location);

    };

    //filter the items using the filter text
    self.filterPlaces = ko.computed(function() {
        // console.log(self.filterPlaces);
        var filter = self.filterTxt().toLowerCase();
        if (!filter) {
            for (var i = markers.length - 1; i >= 0; i--) {
                markers[i].setVisible(true); //get all the markers back
            }
            return self.placesList();
        } else {
            return ko.utils.arrayFilter(self.placesList(), function(placeItem) {

                var i = currentPlaces.indexOf(placeItem.title());

                if (placeItem.title().toLowerCase().indexOf(filter) === -1) {

                    placeItem.marker.setVisible(false);


                } else {

                    placeItem.marker.setVisible(true);

                }

                return placeItem.title().toLowerCase().indexOf(filter) != -1;
            });
        }

    });
};

function googleSuccess() {
    if (typeof google !== 'undefined') {
        ko.applyBindings(vm);
    }
    else {

        googleError();
    }

};

function googleError() {
    
    alert('Google Maps has failed to load.  Please contact Google @ google.com.');
};
/*
* Open the drawer when the menu ison is clicked.
*/

var menu = document.querySelector('#menu');
var main = document.querySelector('main');
var drawer = document.querySelector('#drawer');

menu.addEventListener('click', function(e) {
drawer.classList.toggle('open');
e.stopPropagation();
});
main.addEventListener('click', function() {
drawer.classList.remove('open');
});


