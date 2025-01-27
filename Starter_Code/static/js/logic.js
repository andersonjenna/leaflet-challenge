// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [37.7749, -122.4194],
  zoom: 5
}).addLayer(basemap);

// Then add the 'basemap' tile layer to the map.
let baseMaps = {
  "Street Map": streetmap,
  "OpenStreet Map": basemap
};

let overlays = {};

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      fillColor: getColor(feature.geometry.coordinates[2]),
      weight: 0.5,
      opacity: 1,
      color: "black",
      fillOpacity: 0.8,
      radius: getRadius(feature.properties.mag)
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 500) return "#8B0000";
    if (depth > 200) return "#FF4500";
    if (depth > 100) return "#FF6347";
    if (depth > 50) return "#FFD700";
    if (depth > 20) return "#32CD32";
    return "#00FF00";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude * 4;
  }

// Add a GeoJSON layer to the map once the file is loaded.
  let earthquakeLayer = L.geoJson(data, {

  // Turn each feature into a circleMarker on the map. 
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,

    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`
        <h4>Earthquake Information</h4>
        <p><strong>Location:</strong> ${feature.properties.place}</p>
        <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
        <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>
      `);
    }

  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(map);

  overlays["Earthquakes"] = earthquakeLayer;

// Create a legend control object.
  if (!window.legend) {
    window.legend = L.control({
      position: "bottomright"
    });

// Then add all the details for the legend
    window.legend.onAdd = function (map) {
      let div = L.DomUtil.create("div", "info legend");

      div.style.backgroundColor = "white";
      div.style.padding = "10px";
      div.style.borderRadius = "5px";
      div.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.2)";

      // Initialize depth intervals and colors for the legend
      let depthIntervals = [
        { range: '500+ km', color: '#8B0000' },
        { range: '200-500 km', color: '#FF4500' },
        { range: '100-200 km', color: '#FF6347' },
        { range: '50-100 km', color: '#FFD700' },
        { range: '20-50 km', color: '#32CD32' },
        { range: '0-20 km', color: '#00FF00' }
      ];

      // Loop through our depth intervals to generate a label with a colored square for each interval.

      let labels = [];
      for (let i = 0; i < depthIntervals.length; i++) {
        labels.push(
          `<i style="background:${depthIntervals[i].color}; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i> ${depthIntervals[i].range}`
        );
      }

      div.innerHTML = labels.join('<br>');
      return div;
    };

    window.legend.addTo(map);
  }

  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    function tectonicStyle() {
      return {
        color: "orange",
        weight: 2,
        opacity: 1
      };
    }

    // Then add the tectonic_plates layer to the map.
    let tectonicLayer = L.geoJson(plate_data, {
      style: tectonicStyle
    }).addTo(map);
    overlays["Tectonic Plates"] = tectonicLayer;
  });

});
