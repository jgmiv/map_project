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

    var largeInfoWindow = new google.maps.InfoWindow();
    placeMarkers();

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
        properties: 'Rhoads Stadium'
    }, {
        geometry: {
            lat: 33.210787,
            lng: -87.532373
        },
        properties: 'Soccer Stadium'
    }, {
        geometry: {
            lat: 33.204686,
            lng: -87.538614
        },
        properties: 'Sewell-Thomas Stadium'
    }, {
        geometry: {
            lat: 33.207634,
            lng: -87.550510
        },
        properties: 'Kinshasa'
    }, {
        geometry: {
            lat: 33.202945,
            lng: -87.539768
        },
        properties: 'Sydney'
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

            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.BOUNCE,
                id: i
            });

            markers.push(marker);
            
            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfoWindow);
                toggleBounce();

            });

            bounds.extend(markers[i].position);
            // currentPlaces[i].marker = marker;
            // marker.addListener('click', toggleBounce);
        }

        map.fitBounds(bounds);
    

        function toggleBounce() {
            for (var i = 0; i < markers.length; i ++)

                var currentMarker = null;

                if (currentMarker) {
                    currentMarker.setAnimation(null);
                } else {

                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
        }


        function populateInfoWindow (marker, infowindow) {

        };
    }


    var Places = function(data) {
        this.place = ko.observable(data.geometry);
        this.title = ko.observable(data.properties);
    };

    var ViewModel = function() {

        var self = this;

        this.placesList = ko.observableArray([]);
        // self.markers = ko.observableArray([]);

        currentPlaces.forEach(function(item) {
            self.placesList.push(new Places(item));
        });

        this.currentPlace = ko.observable(this.placesList());

        this.setPlace = function(clickedPlaces){
        	self.currentPlace(clickedPlaces);
        };

        self.currentPlace = function() {
            populateInfoWindow(this, infowindow);
        };

        this.setMarker = function(clickedPlaces) {
            sel.currentPlace(clickedPlaces);
        };


        ko.applyBindings(new ViewModel());
    }