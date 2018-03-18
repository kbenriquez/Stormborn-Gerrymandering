//Reference: https://gist.github.com/wavded/1250983/bf7c1c08f7b1596ca10822baeb8049d7350b0a4b
var stateFPToStateName =
    {
   "01": "Alabama",
   "02": "Alaska",
   "04": "Arizona",
   "05": "Arkansas",
   "06": "California",
   "08": "Colorado",
   "09": "Connecticut",
   "10": "Delaware",
   "11": "District of Columbia",
   "12": "Florida",
   "13": "Geogia",
   "15": "Hawaii",
   "16": "Idaho",
   "17": "Illinois",
   "18": "Indiana",
   "19": "Iowa",
   "20": "Kansas",
   "21": "Kentucky",
   "22": "Louisiana",
   "23": "Maine",
   "24": "Maryland",
   "25": "Massachusetts",
   "26": "Michigan",
   "27": "Minnesota",
   "28": "Mississippi",
   "29": "Missouri",
   "30": "Montana",
   "31": "Nebraska",
   "32": "Nevada",
   "33": "New Hampshire",
   "34": "New Jersey",
   "35": "New Mexico",
   "36": "New York",
   "37": "North Carolina",
   "38": "North Dakota",
   "39": "Ohio",
   "40": "Oklahoma",
   "41": "Oregon",
   "42": "Pennsylvania",
   "44": "Rhode Island",
   "45": "South Carolina",
   "46": "South Dakota",
   "47": "Tennessee",
   "48": "Texas",
   "49": "Utah",
   "50": "Vermont",
   "51": "Virginia",
   "53": "Washington",
   "54": "West Virginia",
   "55": "Wisconsin",
   "56": "Wyoming"
}


var selectedState = undefined;
var selectedStateFP = undefined ;
const CURRENT_YEAR = 2016;
var selectedYear = CURRENT_YEAR;
var selectedDistrict = undefined;
var selectedView = 'country';
var efficiencyChecked = false;
var excessChecked = false;
var lopsidedChecked = false;
var reliableChecked = false;
var districtHoverResult;
var stateHoverResult;



//String for Views
const COUNTRY= "country";
const STATE = "state";
const DISTRICT = "district";

//Strings for Tests
const EFFICIENCY_GAP = "efficiency";
const EXCESS_SEATS = "excess";
const LOPSIDED_OUTCOMES = "lopsided";
const RELIABLE_WINS = "reliable";
const AGGREGATE = "aggregate"; //Can't keep the # here, because setting attribute adds it automatically

//Strings for Selectors
const TEST_RESULTS_SECTION = "#test-results";
const COUNTRY_RESULTS_SECTION = "#country-results";
const STATE_RESULTS_SECTION = "#state-results";
const AGGREGATE_RESULTS_SECTION = "#aggregates";


var aggregates = {
    [EFFICIENCY_GAP]: {},
    [EXCESS_SEATS]: {},
    [LOPSIDED_OUTCOMES]: {},
    [RELIABLE_WINS]: {}
};

//Keep track of the next ID to make for the newest aggregate table
var aggregateIDCounter = 0; 

function addAggregate(test,headRow,dataRow){
    if(aggregates[test][selectedYear] == undefined){
        var $newTable = $("<table></table>");
        $newTable.append(headRow);
        $newTable.append(dataRow);
        //Set an ID for the counter so that future aggregate additions can find it in the DOM
        aggregateIDCounter++;
        $newTable.attr("id",AGGREGATE + aggregateIDCounter); //
        aggregates[test][year] = [AGGREGATE + aggregateIDCounter, selectedState]; //The first element is always the ID
        //Add the table to the document
        $(AGGREGATE_RESULTS_SECTION).append($newTable);
        console.log($newTable);
    }
    else{//Search through the list for this year. If the state already exists, quit.
        var i;
        for(i = 0; i < aggregates[test][year].length; i++){
            if(aggregates[test][year][i] == selectedState){
                return;
            }
        }
        //This is the table we will need to append to, the first element in the array is always the ID of the existing table
        var tableID = aggregates[test][year][0];
        //At this point i has become the newest index of the array, store the state name so future aggregate
        //additions can now this state already exists
        aggregates[test][year][i] = selectedState;
        $("#"+tableID).append(dataRow);
    }
}
function getHeaderRow(test){
    switch(test){
        case EFFICIENCY_GAP:
        return efficiencyGapHeader();
        break;
        case EXCESS_SEATS:
        break;
        case LOPSIDED_OUTCOMES:
        break;
        case RELIABLE_WINS:
        return reliableWinsHeader();
        break;       
    }
}

var multiTestResults; 

//If what you return from here is equal to s, you can set the table by doing
// $(".aggregates table").html(s);
function efficiencyGapHeader(){
    year = selectedYear;
    if(year % 2 != 0){
        year--;
    }
    return '<tr>'
    + '<th rowspan=2>State</th>'
    + '<th colspan=2>Efficiency Gap in '+year+'</th>' 
    + '<th colspan=2>Efficiency Gap in ' +(year - 2)+'</th>'
   + '<th colspan=2>Efficiency Gap in '+(year - 4)+'</th>' 
    + '</tr>' +
    '<tr>'
    + '<th>Efficiency Gap </th> <th>Gerrymandered</th>' 
    + '<th>Efficiency Gap </th> <th>Gerrymandered</th>'
   + '<th>Efficiency Gap </th> <th>Gerrymandered</th>' 
    + '</tr>'

}
function efficiencyGapRow(testResults){
    var efficiencyResults = [];
    
    for(var i = 0; i < testResults.length; i++){
        efficiencyResults[i*2] = testResults[i].efficiencyGap.toFixed(3);
        efficiencyResults[i*2+1] = testResults[i].efficiencyPass.toFixed(3);
    }
    //Don't put return on separate line, it makes the whole function void
    return '<tr><td>'+selectedState+'</td><td>'+efficiencyResults[0]+'</td><td>'+efficiencyResults[1]+'</td> <td>'+efficiencyResults[2]
        +'</td><td>'+efficiencyResults[3]+'</td><td>'+efficiencyResults[4]+'</td><td>'+efficiencyResults[5]+'</td></tr>'
}

function lopsidedOutcomesHeader(){
    year = selectedYear;
    if(year % 2 != 0){
        year--;
    }
    return '<tr>'
    + '<th rowspan="2">State</th>'
    + '<th colspan="2">Lopsided Outcomes in '+year+'</th>'
    + '<th colspan="2">Lopsided Outcomes in ' +(year - 2)+'</th>'
   + '<th colspan="2">Lopsided Outcomes in '+(year - 4)+'</th>' 
    + '</tr>'
    +
     '<tr>'
    +'<th>T Score</th> <th>Gerrymandered</th>'
    +'<th>T Score</th> <th>Gerrymandered</th>'
    +'<th>T Score</th> <th>Gerrymandered</th>'
  +'</tr>'
}
function lopsidedOutcomesRow(testResults){
    var lopsidedResults = [];
    
    for(var i = 0; i < testResults.length; i++){
        lopsidedResults[i*2] = testResults[i].tTestValue;
        lopsidedResults[i*2+1] = testResults[i].lopsidedPass;
    }
    
    return '<tr><td>'+selectedState+'</td><td>'+lopsidedResults[0]+'</td><td>'
        +lopsidedResults[1]+'</td> <td>'+lopsidedResults[2]+'</td><td>'
            +lopsidedResults[3]+'</td> <td>'+lopsidedResults[4]+'</td><td>'
            +lopsidedResults[5]+'</td></tr>';
    
}


function excessSeatsHeader(){
    year = selectedYear;
    if(year % 2 != 0){
        year--;
    }
    return '<tr>'
    + '<th rowspan="2">State</th>'
    + '<th colspan="3">Excess Seats in '+year+'</th>'
    + '<th colspan="3">Excess Seats in ' +(year - 2)+'</th>'
   + '<th colspan="3">Excess Seats in '+(year - 4)+'</th>' 
    + '</tr>'
    +
     '<tr>'
    +'<th>Expected Seats</th> <th>Actual Seats</th> <th>Gerrymandered</th>'
    +'<th>Expected Seats</th> <th>Actual Seats</th> <th>Gerrymandered</th>'
    +'<th>Expected Seats</th> <th>Actual Seats</th> <th>Gerrymandered</th>'
    +'</tr>'
}
function excessSeatsRow(testResults){
    var excessResults = [];
    
    for(var i = 0; i < testResults.length; i++){
        excessResults[i*3] = testResults[i].expectedSeats;
        excessResults[i*3+1] = testResults[i].actualSeats;
        excessResults[i*3+2] = testResults[i].excessPass;
    }
    
    return '<tr><td>'+selectedState+'</td><td>'+excessResults[0]+'</td><td>'
        +excessResults[1]+'</td> <td>'+excessResults[2]+'</td><td>'
            +excessResults[3]+'</td> <td>'+excessResults[4]+'</td><td>'
            +excessResults[5]+'</td><td>'+excessResults[6]+'</td><td>'
            +excessResults[7]+'</td><td>'+excessResults[8]+ '</td></tr>';
    
}



function reliableWinsHeader(){
    year = selectedYear;
    if(year % 2 != 0){
        year--;
    }
    return '<tr>'
    + '<th rowspan="2">State</th>'
    + '<th colspan="3">Reliable Wins in '+year+'</th>'
    + '<th colspan="3">Reliable Wins in ' +(year - 2)+'</th>'
   + '<th colspan="3">Reliable Wins in '+(year - 4)+'</th>' 
    + '</tr>'
    +
     '<tr>'
    +'<th>Mean-Median<br> Difference</th> <th>Significance<br> Level</th> <th>Gerrymandered</th>'
    +'<th>Mean-Median<br> Difference</th> <th>Significance<br> Level</th> <th>Gerrymandered</th>'
    +'<th>Mean-Median<br> Difference</th> <th>Significance<br> Level</th> <th>Gerrymandered</th>'  
  +'</tr>'
}
function reliableWinsRow(testResults){
    var reliableResults = [];
    
    for(var i = 0; i < testResults.length; i++){
        reliableResults[i*3] = getEntryValueFromOuter(testResults[i],"meanMedianDifference","DEMOCRATIC").toFixed(3);
        reliableResults[i*3+1] = getEntryValueFromOuter(testResults[i],"significanceLevel","DEMOCRATIC").toFixed(6);
        reliableResults[i*3+2] = testResults[i].reliablePass;
    }
    
    return '<tr><td>'+selectedState+'</td><td>'+reliableResults[0]+'</td><td>'
        +reliableResults[1]+'</td> <td>'+reliableResults[2]+'</td><td>'
            +reliableResults[3]+'</td> <td>'+reliableResults[4]+'</td><td>'
            +reliableResults[5]+'</td><td>'+reliableResults[6]+'</td><td>'
            +reliableResults[7]+'</td><td>'+reliableResults[8]+'</td>+</tr>';
    
}

function createTable(type){
    var $newTable = $("<table></table>");
    var headRow = "";
    var dataRow = "";
    switch(type){
        case EFFICIENCY_GAP:
        headRow = efficiencyGapHeader();
        dataRow = efficiencyGapRow(multiTestResults);
        break;
        case EXCESS_SEATS:
        headRow = excessSeatsHeader();
        dataRow = excessSeatsRow(multiTestResults);
        break;    
        case LOPSIDED_OUTCOMES:
        headRow = lopsidedOutcomesHeader();
        //This is not integrated with backend yet
        dataRow = lopsidedOutcomesRow(multiTestResults);
        break;    
        case RELIABLE_WINS:
        headRow = reliableWinsHeader();
        dataRow = reliableWinsRow(multiTestResults);
        break;
        default:
        return; //Don't add a table if an invalid type was entered.    
    }
    $newTable.append(headRow);
    $newTable.append(dataRow);
    $(STATE_RESULTS_SECTION).append($newTable);
    //Now add this row to an aggregate table
    addAggregate(type,headRow,dataRow);
    
}

function clearPreviousCountryResults(){
    $(COUNTRY_RESULTS_SECTION + " table").remove();
}

function clearPreviousStateResults(){
    $(STATE_RESULTS_SECTION + " table").remove();
}
function clearAggregateTables(){
	$(AGGREGATE_RESULTS_SECTION + " table").remove();
    $(AGGREGATE_RESULTS_SECTION).hide();
    aggregates[EFFICIENCY_GAP] ={};
    aggregates[EXCESS_SEATS] ={};
    aggregates[LOPSIDED_OUTCOMES] ={};
    aggregates[RELIABLE_WINS] ={};
    aggregateIDCounter = 0;
}


function stateRunTests(){
     $(STATE_RESULTS_SECTION).show();
    
    if(selectedState == undefined || selectedYear == undefined){
        return;
    }
    clearPreviousStateResults();
    
    if(efficiencyChecked){
        createTable(EFFICIENCY_GAP);
    }
    if(excessChecked){
        createTable(EXCESS_SEATS);
    }
    if(lopsidedChecked){
        createTable(LOPSIDED_OUTCOMES);
    }
    if(reliableChecked){
        createTable(RELIABLE_WINS);
    }
    
    $(AGGREGATE_RESULTS_SECTION).show();
}

$(document).ready(function ()
{
        hideRegister();
	clearPreviousStateResults();
	clearAggregateTables();
	loadHomePage();
	
  $("#checkboxEfficiency:checkbox").change(function ()
     {
       if(this.checked){
        efficiencyChecked = true;
       }
       else{
           efficiencyChecked = false;
       }
     });
  $("#checkboxExcess:checkbox").change(function ()
     {
       if(this.checked){
        excessChecked = true;
       }
       else{
           excessChecked = false;
       }
     });    
  $("#checkboxLopsided:checkbox").change(function ()
     {
       if(this.checked){
        lopsidedChecked = true;
       }
       else{
           lopsidedChecked = false;
       }
     });      
    $("#checkboxReliable:checkbox").change(function ()
     {
       if(this.checked){
        reliableChecked = true;
       }
       else{
           reliableChecked = false;
       }
     });
     $("#stateSelect").change(function ()
     {
    	 selectedStateFP = this.value;
         selectedState = stateFPToStateName[this.value];
     });
    $("#yearSelect").change(function ()
     {
        var year = this.value;
        
        if(year>20){
            year = 19 + year;
        }
        else{
            year = 20 + year;
        }
        
        selectedYear = year;
        selectedYear = parseInt(selectedYear);
        getDistrictsBorder(selectedYear);                       //get correspinding CD
        console.log(selectedYear);
        
        
        
        loadYear();
        console.log(selectedYear);
     });
    
    $("#run-test-button").click(function(){
        loadMultiTestResult(); 
    })
    $("#clear-button").click(function(){
        clearAggregateTables();
    })
    $(STATE_RESULTS_SECTION).hide();
    $(COUNTRY_RESULTS_SECTION).hide();
    $(AGGREGATE_RESULTS_SECTION).hide();
});
