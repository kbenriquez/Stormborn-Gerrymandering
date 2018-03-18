var districtPopulation; //This will hold the population and properties of the last selected district
var statePopulation; ///This will hold the population and properties of the last selected state
const DEMOGRAPHIC_NAME = "demographicName";
const POPULATION_AMOUNT = "populationAmount";
const RACE_POPULATION = "racePopulation";
const AGE_POPULATION = "agePopulation";
const SOCIO_ECONOMIC_POPULATION = "socioEconomicPopulation";

//id's for the pie graphs
const PIE_ONE = "#pie-one";
const PIE_TWO = "#pie-two";
const PIE_THREE = "#pie-three";

//Constants for graph types
const POPULATION_CHART_TYPE = "pie";

/*Create a 2D array that can be put into C3, this format: columns: [
            ['data1', 30],
            ['data2', 120],
        ],*/
function getChartColumns(pPArray){ //pP: populationProperty
	columns = [];
	for(var i=0; i < pPArray.length; i++){
		columns[i] = [];
		columns[i][0] = pPArray[i][DEMOGRAPHIC_NAME];
		columns[i][1] = pPArray[i][POPULATION_AMOUNT];
	}
	return columns;
}

function createDistrictCharts(){
	var diststateName =statesDict[districtPopulation["stateFP"]];
	var distNum = districtPopulation["districtNum"];
	var totalPopulation = districtPopulation["totalPopulation"];
	var raceArray = districtPopulation[RACE_POPULATION];
	var ageArray = districtPopulation[AGE_POPULATION];
	var socioEconomicArray = districtPopulation[SOCIO_ECONOMIC_POPULATION];
	var raceColumns = getChartColumns(raceArray);
	var ageColumns = getChartColumns(ageArray);
	var socioEconomicColumns = getChartColumns(socioEconomicArray);
	generateChart(raceColumns, POPULATION_CHART_TYPE, PIE_ONE);
	generateChart(ageColumns, POPULATION_CHART_TYPE, PIE_TWO);
	generateChart(socioEconomicColumns, POPULATION_CHART_TYPE, PIE_THREE);
}

function createStateCharts(){
	var raceArray = statePopulation[RACE_POPULATION];
	var ageArray = statePopulation[AGE_POPULATION];
	var socioEconomicArray = statePopulation[SOCIO_ECONOMIC_POPULATION];
	var raceColumns = getChartColumns(raceArray);
	var ageColumns = getChartColumns(ageArray);
	var socioEconomicColumns = getChartColumns(socioEconomicArray);
	generateChart(raceColumns, POPULATION_CHART_TYPE, PIE_ONE);
	generateChart(ageColumns, POPULATION_CHART_TYPE, PIE_TWO);
	generateChart(socioEconomicColumns, POPULATION_CHART_TYPE, PIE_THREE);
}


function generateChart(chartColumns,chartType,id){
	var chart = c3.generate({
		size: {
			height:500,
			width:300
		},
		bindto: id,
		data: {
			// iris data from R
			columns: chartColumns,
			type : chartType,
		},
		//Credit to https://stackoverflow.com/questions/30603381/d3-show-number-instead-of-percentages-on-pie-chart
		tooltip: {
			 format: {
		            title: function (d) { return 'Data ' + d; },
		            value: function (value, ratio, id) {
		                var format = id === 'data1' ? d3.format(',') : d3.format('');
		                return format(value);
		            }
//		            value: d3.format(',') // apply this format to both y and y2
		        }
		}
	});
	return chart
}

var qq = c3.generate({
    bindto: '#qq',
    data: {
      columns: [
        ['data1', 30, 200, 100, 400, 150, 250],
        ['data2', 50, 20, 10, 40, 15, 25, 100000]
      ],
      type: 'pie'
    }
});
var qqq = c3.generate({
    bindto: '#qqq',
    data: {
      columns: [
        ['data1', 30, 200, 100, 400, 150, 250],
        ['data2', 50, 20, 10, 40, 15, 25]
      ],
      type: 'pie'
    }
});
var qqqq = c3.generate({
    bindto: '#qqqq',
    data: {
      columns: [
        ['data1', 30, 200, 100, 400, 150, 250,1002],
        ['data2', 50, 20, 10, 40, 15, 25]
      ],
      type: 'pie'
    }
});
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