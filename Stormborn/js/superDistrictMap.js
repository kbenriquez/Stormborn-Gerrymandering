var zoomCheck = 0;

var districtInfo = L.control();
var stateFPList = [];

var statesLayer;                        //initial states layer
var districtsLayer;                     //initial district layer
var districtStack = [];                 //polygons to be turned into a superdistrict
var newDistrict;                        //user created superdistrict
var newDistrictLayer;                   
var selectedDistrictStateFP;            
var selectedDistrict;                   //district to be highlighted in purple when selected
var selectedDistrictLayer;              
var selectedLayerGroup;                 //group of districts highlighted in purple
var superDistrictLayerGroup;            //group of all user created superdistricts
var aggSelectedDistricts;               //union of two valid selected districts
var selectedDistrictUnion = [];         //placeholder for taking the union of two districts
const SELECTED_FILL_COLOR = '#800080';  
const SELECTED_FILL_OPACITY = 0.3;      
const SUPERDISTRICT_FILL_OPACITY = 0.5;


//selectedLayerGroup = all currently selected districts
var lastClickedLayers = [];

var SDStateFP;
var SDNumDistsricts;
var SDInProgress = [];
var numOfDistricts = {
    01: 7,
    02: 1,
    04: 9,
    05: 4,
    06: 53,
    08: 7,
    09: 5,
    10: 1,
    12: 27,
    13: 14,
    15: 2,
    16: 2,
    17: 18,
    18: 9,
    19: 4,
    20: 4,
    21: 6,
    22: 6,
    23: 2,
    24: 8,
    25: 9,
    26: 14,
    27: 8,
    28: 4,
    29: 8,
    30: 1,
    31: 3,
    32: 4,
    33: 2,
    34: 12,
    35: 3,
    36: 27,
    37: 13,
    38: 1,
    39: 16,
    40: 5,
    41: 5,
    42: 18,
    44: 2,
    45: 7,
    46: 1,
    47: 9,
    48: 36,
    49: 4,
    50: 1,
    51: 11,
    53: 10,
    54: 3,
    55: 8,
    56: 1
}     

                       
//event when mouse cursor hovers over a shape
function highlightFeature(e){
    var layer = e.target;
    var isState = false;
    console.log(e.target.feature);
    layer.setStyle(
        {
        weight: STATE_BORDER_WEIGHT,
        color: HIGHLIGHT_COLOR,
        fillColor: HIGHLIGHT_COLOR,
        fillOpacity: STATE_FILL_OPACITY
        }
    );
    if(layer.feature.properties){
        if(layer.feature.properties.NAME){
            isState = true;
        }
        //state tooltip
        if(isState){
            stateInfo.update(layer.feature.properties, layer.feature.geometry, layer.feature);
        }
        //district tooltip
        else{
            var props = layer.feature.properties;
            if(props.CD115FP){
            	selectedDistrict = props.CD115FP;
            	selectedStateFP = props.STATEFP;
                districtInfo.update(layer.feature.properties, layer.feature.geometry, layer.feature);
            	//loadDistrictHover(layer);
            }
        }
    }
}
function selectedHighlightFeature(e){
    var layer = e.target;
    layer.setStyle(
            {
            weight: STATE_BORDER_WEIGHT,
            color: HIGHLIGHT_COLOR,
            fillColor: SELECTED_FILL_COLOR,
            fillOpacity: SELECTED_FILL_OPACITY
            }    
    );
} 
//event when mouse cursor leaves a shape
function resetHighlight(e){
    statesLayer.resetStyle(e.target);
    stateInfo.update();
}     
function districtResetHighlight(e){
    districtsLayer.resetStyle(e.target);
}
function superDistrictResetHighlight(e){
    newDistrictLayer.resetStyle(e.target);
}
function zoomToFeature(e){
    map.setView([e.latlng.lat, e.latlng.lng], 7);
    document.getElementById('stateSelect').value = e.target.feature.properties.STATE;  
    $("#stateSelect").trigger("change");
}


function selectDistrict(e){
    var valid = false;
    //Change the stateSelect dropdown value to the selected state
    console.log(e.target.feature.properties);
    document.getElementById('stateSelect').value = e.target.feature.properties.STATEFP;
    $("#stateSelect").trigger("change");
    
    if(districtStack.includes(e.target.feature) === true || e.target.feature.properties.isSuperDistrict == 1){
        //do nothing
        console.log("INCLUDED");
        console.log(districtStack);
    }
    else{
        selectedDistrictUnion.push(e.target.feature);
        if(selectedDistrictUnion.length > 1){
            //Check if selected district is valid (valid and within the same state)
            //
            //Coordinates structure of a polygon(coordinate[][][]): 
            //first array: number of polygons (Always 1)
            //second array: sets of coordinates
            //third array: [latitude, longitude]
            //
            //Coordinates structure of a MultiPolygon(coordinate[][][][]): 
            //first array: number of polygons of the multipolygon
            //second array: number of polygons (Always 1)
            //third array: sets of coordinates
            //fourth array: [latitude, longitude]

            //TODO: CREATE SPECIAL FUNCTION FOR DONUTS

            //If no multipolygons were selected
            if(selectedDistrictUnion[0].geometry.coordinates.length == 1 && selectedDistrictUnion[1].geometry.coordinates.length == 1){
                console.log("polygons");
                valid = polyPolyAdjCheck(e, valid);
            //If a multipolygon was selected next
            } else if(selectedDistrictUnion[0].geometry.coordinates.length == 1 && selectedDistrictUnion[1].geometry.coordinates.length > 1){
                console.log("polygon and multi");
                valid = polyMultiAdjCheck(e, valid);
            //If a multipolygon was selected first
            } else if(selectedDistrictUnion[0].geometry.coordinates.length > 1 && selectedDistrictUnion[1].geometry.coordinates.length == 1){
                console.log("multi and polygon");
                valid = multiPolyAdjCheck(e, valid);
            } else{
                valid = multiMultiAdjCheck(e, valid);
            }
            //get the union of the two selected districts
            if(valid){
                aggSelectedDistricts = turf.union(selectedDistrictUnion[0], selectedDistrictUnion[1])
                selectedDistrictUnion = []
                selectedDistrictUnion.push(aggSelectedDistricts);
            }
        }
        //First district to be selected, no validity checking needed
        if(selectedDistrictUnion.length == 1){
            districtStack.push(e.target.feature);
            valid = true;
            selectedDistrictStateFP = e.target.feature.properties.STATEFP;
        }
    }
    //If selected district is valid, show selected highlight
    if(valid){
        SDInProgress.push(e.target.feature.properties.CD115FP);
        selectedDistrict = e.target.feature;
        selectedDistrictLayer = L.geoJson(selectedDistrict, {
            style: selected,
            onEachFeature: selectedDistrictOnEachFeature
        });
        
        console.log("pushed");
        //update selected layer on the map
        map.removeLayer(selectedLayerGroup);
        selectedLayerGroup = selectedLayerGroup.addLayer(selectedDistrictLayer);
        selectedLayerGroup.addTo(map);
        
        //keep track of last clicked district
        lastClickedLayers.push(selectedDistrictLayer._leaflet_id);
        console.log(lastClickedLayers);
        valid = false;
    }
    else{
        selectedDistrictUnion.pop();
    }
}
//APPLY PREVIOUS FUNCTION ON EACH SHAPE ON THE GEOJSON
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
            click: selectDistrict
        }
    );
}
function selectedDistrictOnEachFeature(feature, layer){
    layer.on(
        {
            mouseover: selectedHighlightFeature,
            click: selectDistrict
        }
    );
}
function superDistrictsOnEachFeature(feature, layer){
    layer.on(
        {
            mouseover: highlightFeature,
            mouseout: superDistrictResetHighlight,
            click: selectDistrict
        }
    );
}
function statesStyle(feature){
    return{
        fillColor: DEFAULT_COLOR,
        weight: STATE_BORDER_WEIGHT,
        color: BORDER_COLOR,
        fillOpacity: STATE_FILL_OPACITY
    }
}
function districtsStyle(feature){
    return{
        fillColor: DEFAULT_COLOR,
        weight: DISTRICT_BORDER_WEIGHT,
        color: BORDER_COLOR,
        fillOpacity: DISTRICT_FILL_OPACITY
    }
}
function selected(feature){
    return{
        fillColor: SELECTED_FILL_COLOR,
        weight: STATE_BORDER_WEIGHT,
        color: HIGHLIGHT_COLOR,
        fillOpacity: SELECTED_FILL_OPACITY
    }
}
function superDistrictsStyle(feature){
    return{
        fillColor: SELECTED_FILL_COLOR,
        weight: DISTRICT_BORDER_WEIGHT,
        color: BORDER_COLOR,
        fillOpacity: SUPERDISTRICT_FILL_OPACITY
    }
}
                       
//CREATE THE NEW MAP
var map = L.map('map', {scrollWheelZoom: false}).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
//CREATE AND ADD THE LAYERS
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: MAPBOX_ATTRIBUTION,
    maxZoom: MAP_MAXZOOM,
    id: MAPBOX_ID,
    accessToken: MAPBOX_ACCESS_TOKEN,
    noWrap: true
}).addTo(map);
superDistrictLayerGroup = L.layerGroup().addTo(map);
selectedLayerGroup = L.layerGroup().addTo(map);
                       
//ADD THE FEATURES ONTO THE GEOJSON LAYER
statesLayer = L.geoJson(states, 
    {
        style: statesStyle,
        onEachFeature: statesOnEachFeature
    }
).addTo(map);
                                                      
//THIS IS THE HOVER INFORMATION ON THE TOP RIGHT OF THE MAP
districtInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};
// method that we will use to update the control based on feature properties passed
districtInfo.update = function (props, perimeter, area) {
    this._div.innerHTML = 'Zoom level = ' +  '<br>' + 
    (props ? 
    (props.STATEFP ? ('<b>State</b>/District: ' + '<b>' + statesDict[props.STATEFP] + '</b> ' + props.CD115FP + '<br>'): '')
    + '<br><b>Perimeter:</b> ' + getPerimeter(perimeter) + 'km'
    + '<br><b>Area:</b> ' + (turf.area(area) ? (turf.area(area).toFixed(2)) + 'm<sup>2</sup>' : 'N/A' )
    + '<br><b>Polsby-Popper Measure:</b> ' + (getPerimeter(perimeter) ? (getCompactness(area, perimeter)) : 'N/A')
    //+ '<br><b>Minimum-Bounding Circle Measure:</b> ' + getMinimumBoundingCircleMeasure(area)
    + '<br><b>Schwartzberg Measure:</b> ' + getSchwartzbergMeasure(perimeter, area)
    + '<br><b>Republican Votes:</b> '
    + '<br><b>Democratic Votes:</b> '
    + '<br><b>Republican Seats:</b> '
    + '<br><b>Democratic Seats:</b> '
    + '<br><b>Efficiency Gap:</b> '
    + '<br><b>Dem Wasted Votes:</b> '
    + '<br><b>Rep Wasted Votes:</b> '
    + '<br>GAOB'
    + 'STATEFP? === ' + props.STATEFP
    + (props.SDInProgress ? props.SDInProgress : "well")
    : 'Hover over a shape');
};

var stateInfo = L.control();
stateInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};
// method that we will use to update the control based on feature properties passed
stateInfo.update = function (props, perimeter, area) {
    this._div.innerHTML = 'Zoom level = ' + map.getZoom() + '<br>' + 
    (props ? 
    (props.NAME ? ('<b>' + props.NAME + '</b><br/>') : '')
    + (props.STATEFP ? ('<b>State</b>/District: ' + '<b>' + statesDict[props.STATEFP] + '</b> ' + props.CD115FP + '<br>'): '')
    + '<br><b>Perimeter:</b> ' + getPerimeter(perimeter) + 'km'
    + '<br><b>Area:</b> ' + (turf.area(area) ? (turf.area(area).toFixed(2)) + 'm<sup>2</sup>' : 'N/A' )
    + '<br><b>Polsby-Popper Measure:</b> ' + (getPerimeter(perimeter) ? (getCompactness(area, perimeter)) : 'N/A')
    //+ '<br><b>Minimum-Bounding Circle Measure:</b> ' + getMinimumBoundingCircleMeasure(area)
    + '<br><b>Schwartzberg Measure:</b> ' + getSchwartzbergMeasure(perimeter, area)
    + '<br><b>Republican Votes:</b> '
    + '<br><b>Democratic Votes:</b> '
    + '<br><b>Republican Seats:</b> '
    + '<br><b>Democratic Seats:</b> '
    + '<br><b>Efficiency Gap:</b> '
    + '<br><b>Dem Wasted Votes:</b> '
    + '<br><b>Rep Wasted Votes:</b> '
    + '<br>QKNE'
    : 'Hover over a shape');
};
stateInfo.addTo(map);



loadJSON(function(response) {
	// Parse JSON string into object
            districts = JSON.parse(response); //JSON response   
},"CD2016.geojson");

map.on('zoomend', function(e) {
    if (map.getZoom() >= DISTRICT_ZOOM) {
        if (zoomCheck == 0) {
            map.removeControl(stateInfo);
            districtsLayer = L.geoJson(districts, {
                style: districtsStyle,
                onEachFeature: districtsOnEachFeature
            });
            districtsLayer.addTo(map);
            districtInfo.addTo(map);
            map.removeLayer(superDistrictLayerGroup);
            superDistrictLayerGroup.addTo(map);   
            zoomCheck = 1;
        }
    }else if (map.getZoom() < DISTRICT_ZOOM) {
        if (zoomCheck == 1) {
            map.removeLayer(districtsLayer);
            map.removeControl(districtInfo);
            statesLayer = L.geoJson(states, {
                style: statesStyle,
                onEachFeature: statesOnEachFeature
            });
            stateInfo.addTo(map);
            zoomCheck = 0;
        }
    }
});

function makeSuperDistrict(){
    
    //HOUSE BILL CHECK
    if (districtStack.length >= 2){
        //ADD THE NEW GEOJSON
        newDistrict = turf.union(districtStack[0], districtStack[1]);
        
        //combine borders
        for (var i = 2; i < districtStack.length; i++){
            newDistrict = turf.union(newDistrict, districtStack[i]);
        }
        newDistrictLayer = L.geoJson(newDistrict, {
            style: superDistrictsStyle,
            onEachFeature: superDistrictsOnEachFeature
        });
        
        
        console.log("-", newDistrict);
        newDistrict.properties.isSuperDistrict = 1;
        console.log("+", newDistrictLayer);
        console.log("++", newDistrictLayer.e);
        SDInProgress = [];
        
        //Remove and re-add Super District Group Layer ()collection of geojson layers
        map.removeLayer(superDistrictLayerGroup);
        superDistrictLayerGroup = superDistrictLayerGroup.addLayer(newDistrictLayer);
        superDistrictLayerGroup.addTo(map);        
        
        //reset
        districtStack = [];
        map.removeLayer(selectedLayerGroup);
        selectedLayerGroup = L.layerGroup();
        selectedDistrictUnion = [];
    }
}
function removeSuperDistricts(){
    map.removeLayer(superDistrictLayerGroup);
    superDistrictLayerGroup = L.layerGroup();
    
    districtStack = [];
    map.removeLayer(selectedLayerGroup);
    selectedLayerGroup = L.layerGroup();
    selectedDistrictUnion = [];
    
}
function undo(){
    if(selectedLayerGroup != []){
        var lastSelectedID = lastClickedLayers.pop();
        selectedLayerGroup.eachLayer(function (layer) {
                if (layer._leaflet_id === lastSelectedID){
                    selectedLayerGroup.removeLayer(layer)
                }
        });	
    }
    if(districtStack != []){
        districtStack.pop();	
    }
    if(SDInProgress != []){
        SDInProgress.pop();
    }
    //temporarily disabled
    //map.removeLayer(superDistrictLayerGroup);
    //var temp = superDistrictLayerGroup.getLayers();
    //temp.pop();
    //superDistrictLayerGroup = L.layerGroup(temp);
    //superDistrictLayerGroup.addTo(map);
}
function polyPolyAdjCheck(e, valid){
    for(i = 0; i < selectedDistrictUnion[0].geometry.coordinates[0].length; i++){
        for(j = 0; j < selectedDistrictUnion[1].geometry.coordinates[0].length; j++){
            if((selectedDistrictUnion[0].geometry.coordinates[0][i][0] == selectedDistrictUnion[1].geometry.coordinates[0][j][0]
                    && selectedDistrictUnion[0].geometry.coordinates[0][i][1] == selectedDistrictUnion[1].geometry.coordinates[0][j][1])
                    && selectedDistrictStateFP == e.target.feature.properties.STATEFP){
                if(e.target.feature.properties.isSuperDistrict == undefined){
                    valid = true;
                    break;
                }
            }
        }
        if(valid){
            break;
        }
    }
    return valid;
}
function polyMultiAdjCheck(e, valid){
    for(i = 0; i < selectedDistrictUnion[0].geometry.coordinates[0].length; i++){
        for(l = 0; l < selectedDistrictUnion[1].geometry.coordinates.length; l++){
            for(j = 0; j < selectedDistrictUnion[1].geometry.coordinates[l][0].length; j++){
                if((selectedDistrictUnion[0].geometry.coordinates[0][i][0] == selectedDistrictUnion[1].geometry.coordinates[l][0][j][0]
                        && selectedDistrictUnion[0].geometry.coordinates[0][i][1] == selectedDistrictUnion[1].geometry.coordinates[l][0][j][1])
                        && selectedDistrictStateFP == e.target.feature.properties.STATEFP){
                    if(e.target.feature.properties.isSuperDistrict == undefined){
                        valid = true;
                        break;
                    }
                }
            }
            if(valid){
                break;
            }
        }
        if(valid){
            break;
        }
    }
    return valid;
}
function multiPolyAdjCheck(e, valid){
    for(p = 0; p < selectedDistrictUnion[0].geometry.coordinates.length; p++){
        for(i = 0; i < selectedDistrictUnion[0].geometry.coordinates[p][0].length; i++){
            for(j = 0; j < selectedDistrictUnion[1].geometry.coordinates[0].length; j++){
                if((selectedDistrictUnion[0].geometry.coordinates[p][0][i][0] == selectedDistrictUnion[1].geometry.coordinates[0][j][0]
                        && selectedDistrictUnion[0].geometry.coordinates[p][0][i][1] == selectedDistrictUnion[1].geometry.coordinates[0][j][1])
                        && selectedDistrictStateFP == e.target.feature.properties.STATEFP){
                    if(e.target.feature.properties.isSuperDistrict == undefined){
                        valid = true;
                        break;
                    }
                }
            }
            if(valid){
                break;
            }
        }
        if(valid){
            break;
        }
    }
    return valid;
}
function multiMultiAdjCheck(e, valid){
    for(p = 0; p < selectedDistrictUnion[0].geometry.coordinates.length; p++){
        for(i = 0; i < selectedDistrictUnion[0].geometry.coordinates[p][0].length; i++){
            for(l = 0; l < selectedDistrictUnion[1].geometry.coordinates.length; l++){
                for(j = 0; j < selectedDistrictUnion[1].geometry.coordinates[l][0].length; j++){
                    if((selectedDistrictUnion[0].geometry.coordinates[p][0][i][0] == selectedDistrictUnion[1].geometry.coordinates[l][0][j][0]
                            && selectedDistrictUnion[0].geometry.coordinates[p][0][i][1] == selectedDistrictUnion[1].geometry.coordinates[l][0][j][1])
                            && selectedDistrictStateFP == e.target.feature.properties.STATEFP){
                        if(e.target.feature.properties.isSuperDistrict == undefined){
                        //console.log("TOUCH");
                            valid = true;
                            break;
                        }
                    }
                }
                if(valid){
                    break;
                }
            }
            if(valid){
                break;
            }
        }
        if(valid){
            break;
        }
    }
    return valid;
}

