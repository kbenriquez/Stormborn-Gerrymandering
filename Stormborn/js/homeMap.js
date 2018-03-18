var statesLayer;
//THIS IS THE HOVER INFORMATION ON THE TOP RIGHT OF THE MAP
var districtInfo = L.control();
var stateInfo = L.control();
//Used to check zoom level of map to display the correct layer
var zoomCheck = 0;
var chart;
var chart2;
var mapZoom=5;
function highlightFeature(e){
    var layer = e.target;
    var isState = false;
    console.log(layer);
    layer.setStyle(
        {
            weight: STATE_BORDER_WEIGHT,
            color: HIGHLIGHT_COLOR,
            fillColor: HIGHLIGHT_COLOR,
           fillOpacity: STATE_FILL_OPACITY
        }
    );
    if(layer.feature.properties){
        if(layer.feature.properties.STATE){
            isState = true;
        }
        //state tooltip
        if(isState){
        	selectedStateFP = e.target.feature.properties.STATE;
        	loadStateHover(layer);
                console.log("THIS IS A STATE?");
        }
        //district tooltip
        else{
            var props = layer.feature.properties;
            if(props[getCDVarName(selectedYear)]){
            	selectedDistrict = props[getCDVarName(selectedYear)];
            	selectedStateFP = props.STATEFP;
                districtInfo.update(layer.feature.properties, layer.feature.geometry, layer.feature);
                //loadDistrictHover(layer);
            }
        }
    }
}
function getCDVarName(year){
	if(year == 2016){
		return "CD115FP"
	}
	else if(year == 2014){
		return "CD114FP"
	}
        else if(year == 2012){
		return "CD113FP"
	}
	else if(year == 2010){
		return "CD"
	}
        else if(year == 2008){
		return "CD"
	}
        else if(year == 2006){
		return "CD"
	}
        else if(year == 2004){
		return "CD"
	}
        else if(year == 2002){
		return "CD"
	}
        else if(year == 2000){
		return "CD"
	}
        else if(year == 1998){
		return "CD"
	}
        else if(year == 1996){
		return "CD"
	}
        else if(year == 1994){
		return "CD"
	}
        else if(year == 1992){
		return "CD"
	}
}
function resetHighlight(e){
    statesLayer.resetStyle(e.target);
    stateInfo.update();
}
function districtResetHighlight(e){
    districtsLayer.resetStyle(e.target);
}
function zoomToFeature(e){
    map.setView([e.latlng.lat, e.latlng.lng], DISTRICT_ZOOM);
    if(e.target.feature.properties.STATE){
        document.getElementById('stateSelect').value = e.target.feature.properties.STATE;
        selectedStateFP = e.target.feature.properties.STATE;
        loadStateSelect();
    }
    //When you click on a district
    else{
        document.getElementById('stateSelect').value = e.target.feature.properties.STATEFP;
        //Used to be selectedDistrict = e.target.feature.properties.CD115FP;
        selectedDistrict = e.target.feature.properties[getCDVarName(selectedYear)];
        loadDistrictSelect(); 
        
    }
    $("#stateSelect").trigger("change");
}
function statesOnEachFeature(feature, layer){
    layer.on(
        {
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        }
    );
}
function districtsOnEachFeature(feature, layer){
    layer.on(
        {
            mouseover: highlightFeature,
            mouseout: districtResetHighlight,
            click: zoomToFeature
        }
    );
}
//DEFAULT LOOK OF STATE SHAPES
function statesStyle(feature){
    return{
        fillColor: DEFAULT_COLOR,
        weight: STATE_BORDER_WEIGHT,
        color: BORDER_COLOR,
        fillOpacity:STATE_FILL_OPACITY
    }
}
                       
//DEFAULT LOOK OF DISTRICT SHAPES
function districtsStyle(feature){
    return{
        fillColor: DEFAULT_COLOR,
        weight: DISTRICT_BORDER_WEIGHT,
        color: BORDER_COLOR,
        fillOpacity: DISTRICT_FILL_OPACITY
    }
}
                        
//CREATE THE NEW MAP
var map = L.map('map', {scrollWheelZoom:false}).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
//CREATE AND ADD THE MAP LAYER
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: MAPBOX_ATTRIBUTION,
    maxZoom: MAP_MAXZOOM,
    id: MAPBOX_ID,
    accessToken: MAPBOX_ACCESS_TOKEN,
    noWrap: true
}).addTo(map);

statesLayer = L.geoJson(states, 
    {
        style: statesStyle,
        onEachFeature: statesOnEachFeature
    }
).addTo(map);


stateInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

stateInfo.update = function (props, perimeter, area) {
    this._div.innerHTML = 'Zoom level = ' + map.getZoom() + '<br>' + 
    //If cursor is hovering above a shape
    (props ? '<b>' + (props.NAME ? props.NAME + '<br />' : '') + '</b>'
    + '<br><b>Perimeter:</b> ' + getPerimeter(perimeter) + 'km'
    + '<br><b>Area:</b> ' + ((turf.area(area) !== 0) ? (turf.area(area).toFixed(2)) + 'm<sup>2</sup>' : 'N/A' )
    + '<br><b>Polsby-Popper Measure:</b> ' + (getPerimeter(perimeter) ? (getCompactness(area, perimeter)) : 'N/A')
   // + '<br><b>Minimum-Bounding Circle Measure:</b> ' + getMinimumBoundingCircleMeasure(area)
    + '<br><b>Schwartzberg Measure:</b> ' + getSchwartzbergMeasure(perimeter, area)
    + '<br><b>Republican Votes:</b> ' +stateHoverResult.totalRepVotes
    + '<br><b>Democratic Votes:</b> ' +stateHoverResult.totalDemVotes
    + '<br><b>Republican Seats:</b> ' +getEntryValueFromOuter(stateHoverResult, "seats", "REPUBLICAN")
    + '<br><b>Democratic Seats:</b> ' +getEntryValueFromOuter(stateHoverResult, "seats", "DEMOCRATIC")
    //Else
    : 'Hover over a state');
};
stateInfo.addTo(map);                        
                        
districtInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

districtInfo.update = function (props, perimeter, area) {
    this._div.innerHTML = 'Zoom level = ' + map.getZoom() + '<br>' +
    (props ? 
    (props.STATEFP ? ('<b>State</b>/District: ' + '<b>' + statesDict[props.STATEFP] + '</b> ' + props[getCDVarName(selectedYear)] + '<br>'): '')
    + '<br><b>Perimeter:</b> ' + getPerimeter(perimeter) + 'km'
    + '<br><b>Area:</b> ' + ((turf.area(area) !== 0) ? (turf.area(area).toFixed(2)) + 'm<sup>2</sup>' : 'N/A' )
    + '<br><br>----Compactness Ratios----'
    + '<br><b>Polsby-Popper Measure:</b> ' + (getPerimeter(perimeter) ? (getCompactness(area, perimeter)) : 'N/A')
//    + '<br><b>Minimum-Bounding Circle Measure:</b> ' + getMinimumBoundingCircleMeasure(area)
    //+ '<br><b>Schwartzberg Measure:</b> ' + getSchwartzbergMeasure(perimeter, area)
    ////+ '<br><b>Republican Votes:</b> ' + getEntryValueFromOuter(districtHoverResult, "votes", "REPUBLICAN") 
    //+ '<br><b>Democratic Votes:</b> '  + getEntryValueFromOuter(districtHoverResult, "votes", "DEMOCRATIC") 
    //+ '<br><b>Efficiency Gap:</b> ' + districtHoverResult["districtEfficiencyGap"]
    //+ '<br><b>Dem Wasted Votes:</b> ' + getEntryValueFromOuter(districtHoverResult, "wastedVotes", "DEMOCRATIC") 
    //+ '<br><b>Rep Wasted Votes:</b> ' + getEntryValueFromOuter(districtHoverResult, "wastedVotes", "REPUBLICAN") 
    //Else
    : 'Hover over a district');
};
                        

map.on('zoomend', function(e) {
	mapZoom = map.getZoom();
    getHomeGeoLayer(mapZoom);
	// getDistrictsBorder(selectedYear, map.getZoom())
});

//For home page
function getHomeGeoLayer(zoomLevel){
    if (zoomLevel >= DISTRICT_ZOOM) {
        if (zoomCheck == 0) {
            map.removeControl(stateInfo);
            districtsLayer = L.geoJson(districts, {
                style: districtsStyle,
                onEachFeature: districtsOnEachFeature
            });
            districtsLayer.addTo(map);
            districtInfo.addTo(map);
            zoomCheck = 1;
        }
    } else if (zoomLevel < DISTRICT_ZOOM) { 
        if (zoomCheck == 1) {
            map.removeLayer(districtsLayer);
            map.removeControl(districtInfo);
            statesLayer = L.geoJson(states, {
                style: statesStyle,
                onEachFeature: statesOnEachFeature
            });
            zoomCheck = 0;
            stateInfo.addTo(map);
        }
    }
}


////CREATE THE CHART AND BIND TO DIV WITH HTML ID 'chart'
//chart = c3.generate({
//    bindto: '#chart',
//    data: {
//        // iris data from R
//        columns: [
//            ['data1', 30],
//            ['data2', 120],
//        ],
//        type : 'pie',
//        onclick: function (d, i) { console.log("onclick", d, i); },
//        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
//        onmouseout: function (d, i) { console.log("onmouseout", d, i); }
//    }
//});
//
//chart2 = c3.generate({
//    bindto: '#chart2',
//    data: {
//        // iris data from R
//        columns: [
//            ['data1', 30],
//            ['data2', 120],
//        ],
//        type : 'pie',
//        onclick: function (d, i) { console.log("onclick", d, i); },
//        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
//        onmouseout: function (d, i) { console.log("onmouseout", d, i); }
//    }
//});
//var chart3 = c3.generate({
//    bindto: '#chart3',
//    data: {
//        // iris data from R
//        columns: [
//            ['data1', 60, 40],
//            ['data2', 120, 100],
//        ],
//        type : 'pie',
//        onclick: function (d, i) { console.log("onclick", d, i); },
//        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
//        onmouseout: function (d, i) { console.log("onmouseout", d, i); }
//    }
//});
//
////CHART TRANSFORMATIONS
//
////FIRST TRANSFORMATION - LOADS NEW DATA ONTO THE PIE CHART
//setTimeout(function () {
//    chart.load({
//        columns: [
//            ["setosa", 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2],
//            ["versicolor", 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3],
//            ["virginica", 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8],
//        ]
//    });
//}, 1500);
//
////SECOND TRANSFORMATION - REMOVES 'data1' AND 'data2' FROM THE PIE CHART
//setTimeout(function () {
//    chart.unload({
//        ids: 'data1'
//    });
//    chart.unload({
//        ids: 'data2'
//    });
//}, 2500);
////THIRD TRANSFORMATION - CONVERTS THE PIE CHART INTO A DONUT CHART
//setTimeout(function () {
//    chart.transform('donut');
//}, 4000);
//
////ON BUTTON CLICK, RESIZE THE CHART AND TRANSFORM TO AREA-SPLINE CHART
//function expandGraph(){
//    chart.resize({height:300, width:900})
//    chart.transform('area-spline');
//}
//
//function minimizeGraph(){
//    chart.resize({height:300, width:300})
//    chart.transform('pie');
//}
//
//function yoyo(){
//    chart.resize({height:300, width:900})
//    chart.transform('bar')
//}