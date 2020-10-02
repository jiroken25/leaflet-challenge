// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plateJson = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// for color scale
function getColor(d) {
  return d > 90 ? '#FF4000' :
      d > 70  ? '#FF8000' :
      d > 50  ? '#FFBF00' :
      d > 30  ? '#FFFF00' :
      d > 10   ? '#BFFF00' :
      d > -10   ? '#80FF00' :
                  '#40FF00';
}




// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

 // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and magnitude/ time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "<br>Magnitude:" +feature.properties.mag +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" );
  }


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      	return L.circleMarker(latlng, {
        radius: feature.properties.mag * 3,
        // latlng["alt"] can return the depth
				fillColor: getColor(latlng["alt"]),
				color: "#000",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			});
    }
  
  });


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}





function createMap(earthquakes) {

  // Define lightmap, satelite map layers and outdoors
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  var satelitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-streets-v11",
    accessToken: API_KEY
  });

  var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });

  // get platetectonics data usign d3.json
  d3.json(plateJson, function(platedata) {
     var Platetectonics =  L.geoJson(platedata, {
        color: "#FFEFD5",
        weight: 2
    })
  
  


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "GrayScale": lightmap,
    "Satelite" : satelitemap,
    "Outdoors" : outdoorsmap,
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Point: earthquakes,
    PlateBoundaries: Platetectonics
  };

  // Create our map, giving it lightmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      35, -120
    ],
    zoom: 4,
    layers: [lightmap, earthquakes]
  });




  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'info legend'),
			grades = [-10, 10, 30, 50, 70, 90],
			labels = [],
			from, to;

		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(myMap);
});
};

