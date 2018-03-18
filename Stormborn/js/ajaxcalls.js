/**
 * 
 */
const baseURL = "http://localhost:8080/Gerrymander/webapi";
const electionResultURL = "/election_result/single/";
const districtHoverURL = "/district/tooltip";
const stateHoverURL = "/state/tooltip";
const openHomePageURL = "/home/init";
const stateTestURL = "/state/test";
const loadYearURL = "/select/year"
const loadDistrictSelectURL = "/district/information"
const loadStateSelectURL = "/state/information"
const loadLoginURL = "/user/login"	
const loadLogoutURL = "/user/logout"
const loadRegisterURL = "/user/register"
const loadUserInfoURL = "/user/info";
const loadUserEditURL = "/user/edit";
var lastResponse;

function loadElectionResult(){
	$.ajax({
	    url: baseURL + electionResultURL,
	    type: 'get',
	    data: { 
	        stateFP:selectedStateFP,
	        year:selectedYear, 
	        districtNum:selectedDistrict
	      },
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	         	lastResponse = data;
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});
}


function loadDistrictHover(layer){
	$.ajax({
	    url: baseURL + districtHoverURL,
	    type: 'get',
	    data: { 
	        stateFP:selectedStateFP,
	        year:selectedYear, 
	        districtNum:selectedDistrict
	      },
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	         	districtHoverResult = data;
	            districtInfo.update(layer.feature.properties, layer.feature.geometry, layer.feature);
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});
}

function loadStateHover(layer){
	$.ajax({
	    url: baseURL + stateHoverURL,
	    type: 'get',
	    data: { 
	        stateFP:selectedStateFP,
	        year:selectedYear
	      },
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	         	stateHoverResult = data;
	         	stateInfo.update(layer.feature.properties, layer.feature.geometry, layer.feature);
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});
}


function loadHomePage(){
	$.ajax({
	    url: baseURL + openHomePageURL,
	    type: 'get',
	    data: { 
	        currentYear:CURRENT_YEAR, 
	      },
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	         	lastResponse = data;
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});
}

function loadYear(){
	$.ajax({
	    url: baseURL + loadYearURL,
	    type: 'get',
	    data: { 
	        selectedYear:selectedYear, 
	      },
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	         	lastResponse = data;
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});
}

function loadMultiTestResult(){
	$.ajax({
	    url: baseURL + stateTestURL,
	    type: 'get',
	    data: { 
	        stateFP:selectedStateFP,
	        selectedYear:selectedYear, 
	        efficiency:efficiencyChecked,
	        excess:excessChecked,
	        lopsided:lopsidedChecked,
	        reliable:reliableChecked
	      },
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	        	multiTestResults = data;
	        	stateRunTests();
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});
}

function loadDistrictSelect(){
	$.ajax({
	    url: baseURL + loadDistrictSelectURL,
	    type: 'get',
	    data: { 
	        stateFP:selectedStateFP,
	        districtNum:selectedDistrict,
	        selectedYear:selectedYear
	      },
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	        	console.log("it worked");
	        	districtPopulation = data;
	        	createDistrictCharts();
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});
}

function loadStateSelect(){
	$.ajax({
	    url: baseURL + loadStateSelectURL,
	    type: 'get',
	    data: { 
	        stateFP:selectedStateFP,
	        selectedYear:selectedYear
	      },
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	        	statePopulation = data;
	        	createStateCharts();
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});	
	
}

function loadLogin(){
	getLogin();
	getPassword();
	lastResponse = undefined;
	var loginObj = {"username":loginUsername, "password":loginPassword}
	$.ajax({
	    url: baseURL + loadLoginURL,
	    type: 'post',
	    data: JSON.stringify(loginObj),
	    contentType: "application/json; charset=utf-8",  
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	        	console.log("Got here too");
	        	currentUser = data;
	        	if(currentUser != undefined){
	        		console.log("got here");
	        		finishLogin();
	        	}
	        },
	        204: function() {
	        	console.log("Also got here");
        		location.reload();
		    },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
		
	});	
	
}

function loadLogout(){
	getLogin();
	getPassword();
	$.ajax({
	    url: baseURL + loadLogoutURL,
	    type: 'post',
	    
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	        	currentUser = undefined;
	        	lastResponse = data;
	        	if(currentUser != undefined){
	        		console.log("Logout successful");
	        	}
	        	location.reload();
	       
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});	
	
}

function loadUserInfo(){
	getLogin();
	getPassword();
	$.ajax({
	    url: baseURL + loadUserInfoURL,
	    type: 'get',
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	        	currentUser = data;
	        	if(currentUser == undefined){
	        		console.log("No user");
	        	}
	        	else{
	        		finishLogin();
	        	}
	       
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});	
}

function loadRegister(){
	getFirstName();
	getLastName()
	getRegisterUsername();
	getRegisterPassword();
	getRegisterEmail();
	getPassword();
	var registerObj = {
			"email": registerEmail,
		    "firstName": registerFirstName,
		    "lastName": registerLastName,
		    "password": registerPassword,
		    "username": registerUsername
	};
	$.ajax({
	    url: baseURL + loadRegisterURL,
	    type: 'post',
	    data: JSON.stringify(registerObj),
	    contentType: "application/json; charset=utf-8",  
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	        	currentUser = data;
	        	if(currentUser == undefined){
	        		console.log("User already exists Show an error message");
	        	}
	        	else{
	        		finishRegister();
	        	}
	       
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});	
}

function loadUserEdit(){
	getFirstName();
	getLastName()
	getRegisterUsername();
	getRegisterPassword();
	getRegisterEmail();
	getPassword();
	if(registerPassword == ""){
		registerPassword = currentUser.password;
	}
	var userEditObj = {
			"email": registerEmail,			
		    "firstName": registerFirstName,
		    "hasPermission": currentUser.hasPermission,
		    "isVerified": currentUser.isVerified,
		    "lastName": registerLastName,
		    "password": registerPassword,
		    "userID": currentUser.userID,
		    "userRole": currentUser.userRole,
		    "username": registerUsername
		    
	};
	$.ajax({
	    url: baseURL + loadUserEditURL,
	    type: 'put',
	    data: JSON.stringify(userEditObj),
	    contentType: "application/json; charset=utf-8",  
	    dataType: 'json',
	    statusCode: {
	        200: function(data){
	        	currentUser = data;
	        	if(currentUser == undefined){
	        		console.log("Something went wrong");
	        	}
	        	else{
	        		console.log("Update it");
	        	}
	       
	        },
	    	404: function() {
	          alert( "page not found" );
	    	}
	    }
	});	
}

//Credit: https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
//This is used to load the contents of a json file into a variable
function loadJSON(callback, fileName) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    console.log('data/'+fileName);
    xobj.open('GET', 'data/' +fileName, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
