const DEFAULT_LAT = 40.7128;
const DEFAULT_LNG = -74.0059;
const DEFAULT_ZOOM = 5;
const DEFAULT_COLOR = '#f00';
const BORDER_COLOR  = '#000';
const HIGHLIGHT_COLOR  = '#fff';
const STATE_BORDER_WEIGHT = 3;
const STATE_FILL_OPACITY = 0.2;
const DISTRICT_BORDER_WEIGHT = 1;
const DISTRICT_FILL_OPACITY = 0.0;
const COUNTRY_LAT = 39.8283;
const COUNTRY_LNG = -98.5795;
const COUNTRY_ZOOM = 4;
const STATE_ZOOM = 5;
const DISTRICT_ZOOM = 7;
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoia2JlbnJpcXVleiIsImEiOiJjajhkcDQxYnowcnhrMndybDVweG93dGQzIn0.MZZ6FzauHLOs3LhZwRKjbg';
const MAPBOX_ATTRIBUTION = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';
const MAP_MAXZOOM = 18;
const MAPBOX_ID = 'mapbox.streets';
var districts = undefined;
var statesDict = {
    01: 'Al',
    02: 'AK',
    04: 'AZ',
    05: 'AR',
    06: 'CA',
    08: 'CO',
    09: 'CT',
    10: 'DE',
    11: 'DC',
    12: 'FL',
    13: 'GA',
    15: 'HI',
    16: 'ID',
    17: 'IL',
    18: 'IN',
    19: 'IA',
    20: 'KS',
    21: 'KY',
    22: 'LA',
    23: 'ME',
    24: 'MD',
    25: 'MA',
    26: 'MI',
    27: 'MN',
    28: 'MS',
    29: 'MO',
    30: 'MT',
    31: 'NE',
    32: 'NV',
    33: 'NH',
    34: 'NJ',
    35: 'NM',
    36: 'NY',
    37: 'NC',
    38: 'ND',
    39: 'OH',
    40: 'OK',
    41: 'OR',
    42: 'PA',
    44: 'RI',
    45: 'SC',
    46: 'SD',
    47: 'TN',
    48: 'TX',
    49: 'UT',
    50: 'VT',
    51: 'VA',
    53: 'WA',
    54: 'WV',
    55: 'WI',
    56: 'WY'
}     

//The three zoom buttons
function zoomToCountry(){
    map.setView([COUNTRY_LAT, COUNTRY_LNG], COUNTRY_ZOOM);
    chart = c3.generate({
        bindto: '#chart',
        data: {
            // iris data from R
            columns: [
                ["country1", 10, 20, 30, 44],
                ["country2", 11,22,33,44,55],
                ["country", 12,21,31,41,51]
            ],
            type : 'pie',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
    });
}

function zoomToStates(){
    map.setZoom(STATE_ZOOM);
    chart = c3.generate({
        bindto: '#chart',
        data: {
            // iris data from R
            columns: [
                ["state1", 15, 23, 34, 48],
                ["state2", 17,27,37,42,52],
                ["state3", 17,27,37,47,57]
            ],
            type : 'pie',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
    });
}
function zoomToDistricts(){
    map.setZoom(DISTRICT_ZOOM);
    chart = c3.generate({
        bindto: '#chart',
        data: {
            // iris data from R
            columns: [
                ["district1", 5],
                ["district2", 900000],
                ["district3", 16863]
            ],
            type : 'pie',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
    });
}

function getPerimeter(e){
    //If not a multipolygon
    if(e.coordinates.length == 1){
        return (turf.lineDistance(turf.linestring(e.coordinates[0])) * 1000).toFixed(2);
    }
    else{
        var sum = 0;
        for(i = 0; i < e.coordinates.length; i++){
            sum = sum + (turf.lineDistance(turf.linestring(e.coordinates[i][0]))*1);
        }
        return (sum*1000);
    }
}
function getCircle(e){
    var radius = e/(2*Math.PI)
    return (Math.PI * (radius * radius)).toFixed(2)
}
function getCompactness(area, perimeter){
    return (turf.area(area) / getCircle(getPerimeter(perimeter))).toFixed(5);
}
     
//For SuperDistrictPage
function getSuperDistrictGeoLayer(zoomLevel){
    if (zoomLevel >= DISTRICT_ZOOM) {
        if (zoomCheck == 0) {
            districtsLayer = L.geoJson(districts, {
                style: districtsStyle,
                onEachFeature: districtsOnEachFeature
            });
            districtsLayer.addTo(map);
            map.removeLayer(superDistrictLayerGroup);
            superDistrictLayerGroup.addTo(map);   
            zoomCheck = 1;
        }
    }else if (zoomLevel < DISTRICT_ZOOM) {
        if (zoomCheck == 1) {
            map.removeLayer(districtsLayer);
            statesLayer = L.geoJson(states, {
                style: statesStyle,
                onEachFeature: statesOnEachFeature
            });
            zoomCheck = 0;
        }
    }
}


function getDistrictsBorder(year){
	if(year == 2016){
        console.log(1666);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response   
            getHomeGeoLayer(mapZoom);
            zoomToStates();
        },"CD2016.geojson");
}
else if(year == 2014){
        console.log(1444);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response  
            zoomToStates();
        },"cb_2015_cd_114.geojson"); //Or use this if problematic cb_2014_cd114.geojson
}
    else if(year == 2012){
        console.log(1222);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response
            zoomToStates();
        },"cb_2013_cd113.geojson");
    }
    else if(year == 2010){
        console.log(1000);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response 
            zoomToStates();
        },"cb_2010_cd111.geojson");
    }
    else if(year == 2008){
        console.log(0888);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response 
            zoomToStates();
        },"cb_2010_cd111.geojson");
    }
    else if(year == 2006){
        console.log(0666);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response 
            zoomToStates();
        },"110th_cd.geojson");
    }
    else if(year == 2004){
        console.log(0444);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response   
            zoomToStates();
        },"109th_cd.geojson");
    }
    else if(year == 2002){
        console.log(0222);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response   
            zoomToStates();
        },"108th_cd.geojson");
    }
    else if(year == 2000){
        console.log(0000);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response   
            zoomToStates();
        },"107th_cd.geojson");
    }
    else if(year == 1998){
        console.log(9888);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response   
            zoomToStates();
        },"106th_cd.geojson");
    }
    else if(year == 1996){
        console.log(9666);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response  
            zoomToStates();
        },"105th_cd.geojson");
    }
    else if(year == 1994){
        console.log(9444);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response  
            zoomToStates();
        },"104th_cd.geojson");
    }
    else if(year == 1992){
        console.log(9222);
        loadJSON(function(response) {
        // Parse JSON string into object
            districts = JSON.parse(response); //JSON response   
            zoomToStates();
        },"103rd_cd.geojson");
    }

	
}

function getMinimumBoundingCircleMeasure(e){
    var maxDiameter = 0;
    var from;
    var to;
    if(e.geometry.coordinates.length == 1){
        for(i = 0; i < e.geometry.coordinates[0].length; i++){
            for(j = i+1; j < e.geometry.coordinates[0].length; j++){
                from = turf.point([e.geometry.coordinates[0][i][0], e.geometry.coordinates[0][i][1]]);
                to = turf.point([e.geometry.coordinates[0][j][0], e.geometry.coordinates[0][j][1]]);
                if(turf.distance(from, to, 'kilometers') > maxDiameter){
                    maxDiameter = turf.distance(from, to, 'kilometers');
                }
            }
        }
    }
    else{
        for(p = 0; p < e.geometry.coordinates.length; p++){
           for(i = p; i < e.geometry.coordinates.length; i ++){
                for(j = 0; j < e.geometry.coordinates[p][0].length; j++){
                    for(k = j + 1; k < e.geometry.coordinates[i][0].length; k++){
                        from = turf.point([e.geometry.coordinates[p][0][j][0], e.geometry.coordinates[p][0][j][1]]);
                        to = turf.point([e.geometry.coordinates[i][0][k][0], e.geometry.coordinates[i][0][k][1]]);
                        if(turf.distance(from, to, 'kilometers') > maxDiameter){
                            maxDiameter = turf.distance(from, to, 'kilometers');
                        }
                    }
                }
            }
        }
    }
    var radius = (maxDiameter*1000) / 2;
    var circleArea = Math.PI * radius * radius;
    return (turf.area(e)/circleArea).toFixed(5);
}

function getSchwartzbergMeasure(perimeter, area){
    var circlePerimeter = 2 * Math.PI * (Math.sqrt(turf.area(area)/Math.PI));
    return (getPerimeter(perimeter)/circlePerimeter).toFixed(5);
}

function simplify(n){
    return n.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
}

$(document).ready(function ()
		{
	console.log(selectedYear);
	getDistrictsBorder(selectedYear);
	
});

