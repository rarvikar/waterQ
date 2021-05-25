// Import packages
const L = require("leaflet");
require("leaflet-sidebar-v2");
const parseGeoraster = require("georaster");
const GeoRasterLayer = require("georaster-layer-for-leaflet");
const chroma = require("chroma-js");
const geoblaze = require("geoblaze");


// Adds the basemap tiles to your web map
const map = L.map('map', { zoomControl: false }).setView([26.4708, 80.3764], 15);

//document.getElementById('headerdiv').style.border = "solid #ecf0f1"; // Add border to the 'headerdiv' div
//document.getElementById('map').style.border = "solid #ecf0f1"; // Add border to the 'map' div
document.getElementById('map').style.cursor = 'crosshair' //Change default cursor

mapLink = '<a href="http://www.esri.com/">Esri</a>';
wholink = 'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
var esriLayer = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		//attribution: '&copy; '+mapLink+', '+wholink,
		maxZoom: 20,
}).addTo(map);

var cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	//attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

// Add the sidebar object
var sidebar = L.control.sidebar({ container: 'sidebar',autopan: true })
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

const urlArray = ["https://geobucket2021.s3.ap-south-1.amazonaws.com/jan_wq_clean_crs.tif",
									"https://geobucket2021.s3.ap-south-1.amazonaws.com/feb_wq_clean_crs.tif",
									"https://geobucket2021.s3.ap-south-1.amazonaws.com/doc_jan_clean_crs.tif",
									"https://geobucket2021.s3.ap-south-1.amazonaws.com/doc_feb_clean_crs.tif"]

const layerArray = [];
fetchLayers(urlArray);

//console.log(urls.images.find(e => e.type === "tss" & e.month === "January").url);
//console.log(urls.images.filter(e => e.type === "tss").find(e => e.month === "February").url);

// Fetch the raster file across the network and print it to the console. The simplest use of fetch() takes one argument — the path to the resource you want to fetch — and returns a Promise containing the response (a HTTP Response object).
function fetchLayers(urls) {
	console.log("Starting Layer fetch");
	for(var i=0; i < urls.length; i++) 
	{
		fetch(urls[i])
		.then(response => response.arrayBuffer())
		.then(arrayBuffer => {
			parseGeoraster(arrayBuffer).then(georaster => {
				// console.log("georaster:", georaster);

				const min = georaster.mins[0];
				const max = georaster.maxs[0];
				const range = georaster.ranges[0];

				// console.log(chroma.brewer);
				const scale = chroma.scale("viridis").mode("lab");

				const layer = new GeoRasterLayer({
						georaster: georaster,
						opacity: 0.9,
						pixelValuesToColorFn: function(pixelValues) {
							const pixelValue = pixelValues[0]; // there's just one band in this raster

							// if there's zero value, don't return a color
							if (pixelValue === 0) return null;

							// scale to 0 - 1 used by chroma
							const scaledPixelValue = (pixelValue - min) / range;

							const color = scale(scaledPixelValue).hex();

							return color;
						},  
						resolution: 256 // optional parameter for adjusting display resolution
				});
				//console.log("layer:", layer);
				layer.addTo(map);
				layerArray.push(layer);
				console.log("Added a layer to array." + "Total layers in array = " + layerArray.length);							
			});
		});
	}
}

// Get no. of layers in map
// let l = 0;
// map.eachLayer(function(){ l += 1; });
// console.log('Map has', l, 'layers.');
		

			// Uncomment to force map to fit bounds to the raster's bounds
			//map.fitBounds(layer.getBounds());

			// A bitwise OR operator can be used to truncate floating point figures (really fast) 
			// and it works for positives as well as negatives:
			// function float2int (value) {
			// 	return value | 0;
			// } 

			// // Display raster value at lnglat using GeoBlaze and convert type from float to int
			// map.on('click', function(evt) {
			// 	const latlng = map.mouseEventToLatLng(evt.originalEvent);
			// 	console.log(latlng);
			// 	info.update(float2int(geoblaze.identify(georaster, [latlng.lng, latlng.lat])));
			// });
		
		
		

// // Info Control Div code
// const info = L.control();

// info.onAdd = function (map) {
// 	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
// 	this.update();
// 	return this._div;
// };

// // method that we will use to update the control based on feature properties passed
// info.update = function (props) {
// 	this._div.innerHTML = "<br><h2></b>TSS and DOC Map" + "<h3>Layer Loaded: TSS</h3>" + (props ? '<b>' + props + 
// 	'</b><br />' : 'Click on a point to display value');
// };

// // Add the Info Control to Map
// info.addTo(map);