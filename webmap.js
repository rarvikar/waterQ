// Import packages
const L = require("leaflet");
require("leaflet-sidebar-v2");
const parseGeoraster = require("georaster");
const GeoRasterLayer = require("georaster-layer-for-leaflet");
const chroma = require("chroma-js");
const geoblaze = require("geoblaze");
const { names } = require("debug");
require("leaflet-basemaps");

// Array for Date Select Menu
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Get the DIVs for TSS and DOC select menus.
var tss_select_div = document.getElementById("tss_date_select");
var doc_select_div = document.getElementById("doc_date_select");

// Array for Color Scale select menu
const color_scales = ["Accent", "BrBG", "Greys", "Pastel1", "Pastel2", "PiYG", "Dark2", "RdYlBu", "RdYlGn", "Spectral", "Set1", "Set2", "Set3", "YlGnBu", "Viridis", "Paired", "PuBuGn", "YlOrRd"];
// console.log(color_scales);

// Get the DIVs for TSS and DOC select menus.
var tss_color_div = document.getElementById("tss_color_select");
var doc_color_div = document.getElementById("doc_color_select");


// Populate month-select menus
add_month_values(months, tss_select_div);
add_month_values(months, doc_select_div);

// Populate color-scale select menus
add_color_values(color_scales, tss_color_div);
add_color_values(color_scales, doc_color_div);

// A function to populate month-select menus from the 'months' array.
function add_month_values(months, div_id) {
	for(x=0; x < months.length; x++) {
		var opt = months[x];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		div_id.appendChild(el);
	}
}

// A function to populate the Color Scale menu from the 'color_scales' array. 
function add_color_values(color_scales, clr_div_id) {
	for(cs=0; cs < color_scales.length; cs++) {
		var opts = color_scales[cs];
		var els = document.createElement("option");
		els.textContent = opts;
		els.value = opts;
		clr_div_id.appendChild(els);
	}
}

// Get the DIVs for the opacity sliders
var tss_opacity_div = document.getElementById("tss_slide");
var doc_opacity_div = document.getElementById("doc_slide");

// Add the basemap tiles to your web map
const map = L.map('map', { zoomControl: false }).setView([26.4708, 80.3764], 15);

//document.getElementById('headerdiv').style.border = "solid #ecf0f1"; // Add border to the 'headerdiv' div
//document.getElementById('map').style.border = "solid #ecf0f1"; // Add border to the 'map' div
document.getElementById('map').style.cursor = 'crosshair' //Change default cursor

// Create and add a 'LayerGroup' to the map
const layerGroup = L.layerGroup().addTo(map);
var active_layer = "";
var active_month = "";
var tiffArray = [];
var layerArray = [];

// Add BaseMaps using Leaflet-basemaps library
mapLink = '<a href="http://www.esri.com/">Esri</a>';
wholink = 'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

var basemaps = [ 
		L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: '&copy; '+mapLink+', '+wholink,
			maxZoom: 20,
			minZoom: 0, 
			label: 'ESRI World'
		}),
		L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 20,
			minZoom: 0,
			label: 'Carto CDN'
		}),
		L.tileLayer('//{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: 'abcd',
			maxZoom: 20,
			minZoom: 0,
			label: 'Toner Lite'
		}),
		// L.tileLayer('//{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
		// 	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
		// 	subdomains: 'abcd',
		// 	maxZoom: 20,
		// 	minZoom: 0,
		// 	label: 'Toner'
		// }),
		L.tileLayer('//{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			subdomains: 'abcd',
			maxZoom: 16,
			minZoom: 1,
			label: 'Watercolor'
		}),
		L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 20,
			minZoom: 0,
			label: 'OSM DE'
		}),
		L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 22,
			minZoom: 0,
			label: 'OSM B/W'
		}),            
];

map.addControl(L.control.basemaps({
		basemaps: basemaps,
		tileX: 0,  // tile X coordinate
		tileY: 0,  // tile Y coordinate
		tileZ: 1   // tile zoom level
}));

// Add the sidebar object
var sidebar = L.control.sidebar({ container: 'sidebar', autopan: true })
            .addTo(map)
            .open('home');

// Adds a popup marker to the webmap for GGL address
// L.circleMarker([26.470544959358843, 80.37629493475352]).addTo(map).bindPopup(
// 		'Shuklaganj New Ganga Bridge<br>' + 
// 		'Shuklaganj Bridge Rd.<br>' +
// 		'OEF Colony<br>' + 
// 		'Kanpur Cantonment<br>' +
// 		'Kanpur<br><br>' + 
//     'Uttar Pradesh<br><br>' + 
// 		'Tel: 416-9795000 Ext. 5192'
// 	);//.openPopup();

const urls = {
	"description": "A collection of URLs of GeoTIFF stored on S3",
	"images": [ 
		{ 
			"type": "tss",
			"url": "https://geobucket2021.s3.ap-south-1.amazonaws.com/jan_wq_clean_crs.tif",
			"month": "January"
		},
		{	
			"type": "tss",
			"url":"https://geobucket2021.s3.ap-south-1.amazonaws.com/feb_wq_clean_crs.tif",
			"month": "February"
		},
		{ 
			"type": "doc",
			"url": "https://geobucket2021.s3.ap-south-1.amazonaws.com/doc_jan_clean_crs.tif",
			"month": "January"
		},
		{
			"type": "doc",
			"url":"https://geobucket2021.s3.ap-south-1.amazonaws.com/doc_feb_clean_crs.tif",
			"month": "February"
		}
	]
}

//console.log(urls.images.find(e => e.type === "tss" & e.month === "January").url);
//console.log(urls.images.filter(e => e.type === "tss").find(e => e.month === "February").url);

const urlArray = ["https://geobucket2021.s3.ap-south-1.amazonaws.com/jan_wq_clean_crs.tif",
									"https://geobucket2021.s3.ap-south-1.amazonaws.com/feb_wq_clean_crs.tif",
									"https://geobucket2021.s3.ap-south-1.amazonaws.com/doc_jan_clean_crs.tif",
									"https://geobucket2021.s3.ap-south-1.amazonaws.com/doc_feb_clean_crs.tif"];

// First fetch all layers from AWS and then add January TSS layer to the map after a delay of 3 seconds
fetchLayers(urlArray);
setTimeout(() => {  layerGroup.addLayer(layerArray[0]); 
										console.log("Added TSS Layer for January"); 
										active_layer = "Total Suspended Solids"; 
										active_month = "January"; 
										info.update(); }, 2750);


// Fetch the raster files across the network using URLs and store them into the an array of 'georasters' called 'tiffArray'. The simplest use of fetch() takes one argument — the path to the resource you want to fetch -- and returns a Promise containing the response (a HTTP Response object). We convert the response into an arrayBuffer object and pass it to the parseGeoraster() method to create a 'georaster' object that is added to the 'tiffArray'. We then create a new GeoRasterLayer using the 'georaster' object and also define a Color Scale. The new GeoRasterLayer is added to the 'layerArray' for GeoRasterLayers. We end up with 2 arrays - A 'tiffLayer' array for storing all 'georaster' objects and a 'layerArray' array fr storing all 'GeoRasterLayers'. 

// PLEASE NOTE : Currently we fetch all the TIFFs serially, one after the other, using a for loop within a single service worker running in the background. This logic needs to be changed to implement parallel fetching (and parsing) of all TIFFs.
function fetchLayers(urls) {
	console.log("Starting Layer fetch");
	//console.log(chroma.brewer);
	for(var i=0; i < urls.length; i++) 
	{
		fetch(urls[i])
		.then(response => response.arrayBuffer())
		.then(arrayBuffer => {
			parseGeoraster(arrayBuffer).then(georaster => {
				//console.log("georaster:", georaster);
				tiffArray.push(georaster);
				console.log("Added georaster to tiffArray." + "Total = " + tiffArray.length);
				const min = georaster.mins[0];
				const max = georaster.maxs[0];
				const range = georaster.ranges[0];

				// console.log(chroma.brewer);
				const scale = chroma.scale("viridis").mode("lab");
				const layer = new GeoRasterLayer({
						georaster: georaster,
						opacity: 1,
						pixelValuesToColorFn: function(pixelValues) {
							const pixelValue = pixelValues[0]; // there's just one band in this raster
							// if there's zero value, don't return a color
							if (pixelValue === 0) return null;
							// scale to 0 - 1 used by chroma
							const scaledPixelValue = (pixelValue - min) / range;
							const color = scale(scaledPixelValue).hex();
							return color;
						},  
						resolution: 512 // optional parameter for adjusting display resolution
				});
				//console.log("layer:", layer);
				//layer.addTo(map);
				layerArray.push(layer);
				console.log("Added a Georaster Layer to Array." + "Total layers = " + layerArray.length);							
			});
		});
	}
}

// Handle onchange events for month select menu using the 'addTssLayerOnDate' and 'addDocLayerOnDate' functions.
tss_select_div.onchange = function() {addTssLayerOnDate(this.value)};
doc_select_div.onchange = function() {addDocLayerOnDate(this.value)};

// Handle onchange events for Color-Scale select menu using the 'changeColor' function.
tss_color_div.onchange = function() {changeColor(this.value)};
doc_color_div.onchange = function() {changeColor(this.value)};

// Handle onchange event for Opacity Slider using the 'changeOpacity' function.
tss_opacity_div.onchange = function() {changeOpacity(this.value)};
doc_opacity_div.onchange = function() {changeOpacity(this.value)};

function addTssLayerOnDate(v) {
	switch(v) {
		case "January": case "March": case "May": case "July":  case "September": case "November":
			layerGroup.clearLayers();
			layerGroup.addLayer(layerArray[0]);
			changeOpacity(document.getElementById("tss_slide").value);
			active_layer = "Total Suspended Solids";
			active_month = "January";
			info.update();
			tss_select_div.size = 1;
			tss_select_div.blur();
			break;
		case "February": case "April": case "June": case "August": case "October": case "December":
			layerGroup.clearLayers();
			layerGroup.addLayer(layerArray[1]);
			changeOpacity(document.getElementById("tss_slide").value);
			active_layer = "Total Suspended Solids";
			active_month = "February";
			info.update();
			tss_select_div.size = 1;
			tss_select_div.blur();
			break;
	}
}

function addDocLayerOnDate(v) {
	switch(v) {
		case "January": case "March": case "May": case "July":  case "September": case "November":
			layerGroup.clearLayers();
			layerGroup.addLayer(layerArray[2]);
			changeOpacity(document.getElementById("doc_slide").value);
			active_layer = "Dissolved Organic Carbon";
			active_month = "January";
			info.update();
			doc_select_div.size = 1;
			doc_select_div.blur();
			break;
		case "February": case "April": case "June": case "August": case "October": case "December":
			layerGroup.clearLayers();
			layerGroup.addLayer(layerArray[3]);
			changeOpacity(document.getElementById("doc_slide").value);
			active_layer = "Dissolved Organic Carbon";
			active_month = "February";
			info.update();
			doc_select_div.size = 1;
			doc_select_div.blur();
			break;
	}
}

function changeColor(v) {
	var currentTiff = getCurrentLayer();
	const min = currentTiff.mins[0];
	const max = currentTiff.maxs[0];
	const range = currentTiff.ranges[0];

	const scale = chroma.scale(v).mode("lab");

	const layer = new GeoRasterLayer({
		georaster: currentTiff,
		opacity: 1,
		pixelValuesToColorFn: function(pixelValues) {
			const pixelValue = pixelValues[0]; // there's just one band in this raster
			// if there's zero value, don't return a color
			if (pixelValue === 0) return null;
			// scale to 0 - 1 used by chroma
			const scaledPixelValue = (pixelValue - min) / range;
			const color = scale(scaledPixelValue).hex();
			return color;
		},  
		resolution: 512 // optional parameter for adjusting display resolution
	});
	
	layerGroup.clearLayers();

	if (active_layer === "Total Suspended Solids" & active_month === "January") {
		layerArray.splice(0,1,layer);
		layerGroup.addLayer(layerArray[0]);
		changeOpacity(document.getElementById("tss_slide").value);
		tss_color_div.size = 1;
		tss_color_div.blur();
	} else if (active_layer === "Total Suspended Solids" & active_month === "February") {
			layerArray.splice(1,1,layer);
			layerGroup.addLayer(layerArray[1]);
			changeOpacity(document.getElementById("tss_slide").value);
			tss_color_div.size = 1;
			tss_color_div.blur();
	} else if (active_layer === "Dissolved Organic Carbon" & active_month === "January") {
			layerArray.splice(2,1,layer);
			layerGroup.addLayer(layerArray[2]);
			changeOpacity(document.getElementById("doc_slide").value);
			doc_color_div.size = 1;
			doc_color_div.blur();
	} else {
			layerArray.splice(3,1,layer);
			layerGroup.addLayer(layerArray[3]);
			changeOpacity(document.getElementById("doc_slide").value);
			doc_color_div.size = 1;
			doc_color_div.blur();
	}
}

function changeOpacity(v) {
	layerGroup.eachLayer(function(layer){
		layer.setOpacity(v);
	});
}
// Get no. of layers in map
// let l = 0;
// map.eachLayer(function(){ l += 1; });
// console.log('Map has', l, 'layers.');


// A function that checks the current layer in the L.LayerGroup and returns the corresponding TIFF
function getCurrentLayer() {
	var curr_lg_array = layerGroup.getLayers();
	// Since the only element loaded in LayerGroup is the current layer, 
	// get it from the Array as Array[0] that was returned by getLayers(). 
	var curr_lg_lyr = curr_lg_array[0];
	switch(curr_lg_lyr) {
		case layerArray[0]:
			console.log("getCurrentLayer - Layer Loaded: January TSS. Fetching the corresponding georaster object.");
			return tiffArray[0];
			break;
		case layerArray[1]:
			console.log("getCurrentLayer - Layer Loaded: February TSS. Fetching the corresponding georaster object.");
			return tiffArray[1];
			break;
		case layerArray[2]:
			console.log("getCurrentLayer - Layer Loaded: January DOC. Fetching the corresponding georaster object.");
			return tiffArray[2];
			break;
		case layerArray[3]:
			console.log("getCurrentLayer - Layer Loaded: February DOC. Fetching the corresponding georaster object.");
			return tiffArray[3];
			break;
	}
	// if (curr_lg_lyr === layerArray[0]) {
	// 	console.log("Layer Loaded: January TSS");
	// 	return tiffArray[0];
	// } else if (curr_lg_lyr === layerArray[1]) {
	// 	console.log("Layer Loaded: February TSS");
	// 	return tiffArray[1];
	// }
}

// A bitwise OR operator can be used to truncate floating point figures (really fast) 
// It works for positives as well as negatives:
function float2int (value) {
	return value | 0;
} 

// Display raster value at lnglat using GeoBlaze and convert raster-value from float to int. From the function, call the getCurrentLayer() method to retrieve the 'georaster' object (from 'tiffArray') for the current layer inside the 'L.LayerGroup'.
map.on('click', function(evt) {
	const latlng = map.mouseEventToLatLng(evt.originalEvent);
	//console.log(latlng);
	var loadedTiff = getCurrentLayer();
	info.update(float2int(geoblaze.identify(loadedTiff, [latlng.lng, latlng.lat])));
	//console.log(float2int(geoblaze.identify(loadedTiff, [latlng.lng, latlng.lat])));
});		
		

// Info Control Div code
const info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this.update();
	return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
	//console.log("Running INFO DIV update", props);
	this._div.innerHTML = '<br><h2>SUMMARY</h2><br>' + '<hr>' + '<br>' + '<h3>Selected Parameter :</h3>' + active_layer + '<br>' + '<br><h3>Month :</h3>' + active_month + '<br>' + (props ? '<br>' + '<hr>' + '<br>' + '<h3>Value :</h3>' + '<ins>' + props + ' mg/L' + '</ins>' : '<br><p style="color: rgba(0,136,169,1)"><b><i>Click on a point to display value</b></i></p>');
};

// Add the Info Control to Map
info.addTo(map);