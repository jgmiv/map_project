"use strict";
//Global variables
var map;
var markers = [];
var marker;
var largeInfoWindow;
// Initilizes the map
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
        animation: google.maps.Animation.DROP,
        id: i
    });

    markers.push(marker);
    currentPlaces[i].marker = marker;
    
    marker.addListener('click', function() {
        var self = this;
        populateInfoWindow(this, largeInfoWindow);
        toggleBounce(this);
    });

    bounds.extend(markers[i].position);

    function toggleBounce(currentMarker) {
        currentMarker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){currentMarker.setAnimation(null) }, 1400);
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
        //Provides panorama view if available.
      var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), panoramaOptions);
      //Provides an image if no street view is available.
    } else {
        var infowindowHTML =  '<div>' + marker.title + '</div>' + "<img width = '80' src =" + marker.image + ">";
        infowindow.setContent(infowindowHTML);

    }
  }
  // Use streetview service to get the closest streetview image within
  // 50 meters of the markers position
  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  // placesList()[i].markers = marker
  // Open the infowindow on the correct marker.
  infowindow.open(map, marker);
}

};


}



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
    // console.log(this.filterTxt);
    


    currentPlaces.forEach(function(placeItem) {
        self.placesList.push( new Place
          (placeItem));
    });

    markers.forEach(function(marker, i) {
        self.placesList()[i].markers = marker;
        // console.log(marker);
    });

    this.currentPlace = ko.observable(this.placesList()[0]);
    // console.log(this.currentPlace);

    this.placesList.marker = ko.observable(this.placesList()[0]);

    this.changePlace = function(clickedPlace){
        self.currentPlace(clickedPlace);
        // console.log(clickedPlace)
    };

    this.setPlace = function (clickedPlace){
        self.showPlace(placesList.marker);
        google.maps.event.trigger(clickedPlace.markers, 'click');
        // console.log(clickedPlace.markers);
    };

    this.showPlace = function(populateInfoWindow) {
        self.currentPlace(marker, largeInfoWindow);
    };
    
   
    //filter the items using the filter text
    self.filterPlaces = ko.computed(function() {
      // console.log(self.filterPlaces);
      var filter = self.filterTxt().toLowerCase();
      if (!filter){
        for (var i = markers.length - 1; i >= 0; i--) {
                markers[i].setVisible(true); //get all the markers back
            };
        return self.placesList();
      } else {
          return ko.utils.arrayFilter(self.placesList(), function(placeItem) {

            var i = currentPlaces.indexOf(placeItem.title());

              if (placeItem.title().toLowerCase().indexOf(filter) === -1) {

                    placeItem.markers.setVisible(false);

                    map.setZoom(17);
                    map.setTimeout('map.setZoom(17)', marker);
                    map.panTo(placeItem.markers.position);
                    

                } else { 

                    placeItem.markers.setVisible(true);
                    
                }; 
                
            return placeItem.title().toLowerCase().indexOf(filter) != -1; 
          });
        }
    
    function loadData() {

          var $body = $('body');
          var $wikiHeaderElem = $('#wikipedia-header')
          var $wikiElem = $('#wikipedia-links');

          // clear out old data before new request
          $wikiElem.text("");

          // AJAX request to NYTimes.
          var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?fq=news_desk:("Sports")' + filterTxt + '&sort=newest&api-key=8c17a413d53040e4bab4cab149b90cb2'

          $.getJSON(nytimesUrl, function (data){

              $nytHeaderElem.text('New York Times Articles About ' + filterTxt);

              articles = data.response.docs;
              for (var i = 0; i < articles.length; i++) {
                  var article = articles[i];
                  $nytElem.append('<li class="article">'+ '<a href="'+article.web_url+'">'+article.headline.main+'</a>'+ '<p>' + article.snippet + '</p>'+'</li>');  
                           
              };
              //AJAX request error.
          }).error(function(e){
              $nytHeaderElem.text('New York Times Articles Could Not Be Loaded ');
          });

          var wikiRequestTimeout = setTimeout(function(){
            $wikiHeaderElem.text("failed to load wikipedia resources");
          }, 8000);

          var wikipediaEndPointUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+ filterTxt +'&format=json'

          $.ajax({
            url: wikipediaEndPointUrl,
            data: {
                "action": "opensearch",
                "search": filterTxt,
                "format": "json",
          },
          dataType: "jsonp",
          success: function (response) {
              console.log(response);
              linkDisplays = response[1];
              links = response[3];
              var articles = [];
              for (var index = 0; index < response[1].length; index++) {
                  articles.push(
                      "<li><a href=" + '"' + links[index] + '"' + ">" + linkDisplays[index] + "</a></li>");
              };
              $wikiElem.append(articles);
              clearTimeout(wikiRequestTimeout);
          }
      });


          return false;
      };

      $('#container').submit(loadData);


      });




    }