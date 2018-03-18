const LOGIN_USERNAME = "#login-username";
const LOGIN_PASSWORD = "#login-password";
const REGISTER_FIRST_NAME = "#register-first-name";
const REGISTER_LAST_NAME = "#register-last-name";
const REGISTER_USERNAME = "#register-username";
const REGISTER_PASSWORD = "#register-password";
const REGISTER_EMAIL = "#register-email";
const REGISTER_BUTTON = "#register-btn";
var loginUsername = undefined;
var loginPassword = undefined;
var registerUsername = undefined;
var registerFirstName = undefined;
var registerLastName = undefined;
var registerPassword = undefined;
var registerEmail = undefined;


var currentUser = undefined;



function hideRegister() {
    var x = document.getElementById("myDIV");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function getLogin(){
	loginUsername = $(LOGIN_USERNAME).val();
	console.log(loginUsername);
}

function getPassword(){
	loginPassword = $(LOGIN_PASSWORD).val();
	console.log(loginPassword);
}

function verifyLogin() {
	loadLogin();
}

function finishLogin(){
	  
	   document.getElementById("log-in").innerHTML =
	           "<ul>"
	           + "<li style=\"display: inline;\"><p class=\"nav-p\">Hello, " + currentUser.firstName + "</p></li>"
	           + "<li style=\"display: inline;\"><button id=\"logoutBtn\"class=\"zoomButton\"><b>Log Out</b></button></li>"
	           + "</ul>"
	   $("#logoutBtn").click(function(evt){
	       		evt.preventDefault();
	       		loadLogout();
	       	})
	       	
	   if($("#userEditHeader").length!=0){
		   initializeUserEdit()
	   }
}

function initializeUserEdit(){
	console.log("initializing user edit page");
	$(REGISTER_FIRST_NAME).val(currentUser.firstName);
	$(REGISTER_LAST_NAME).val(currentUser.lastName);
	$(REGISTER_USERNAME).val(currentUser.username);
	$(REGISTER_EMAIL).val(currentUser.email);
}


function getFirstName(){
	registerFirstName = $(REGISTER_FIRST_NAME).val();
	console.log(registerFirstName);
}

function getLastName(){
	registerLastName = $(REGISTER_LAST_NAME).val();
	console.log(registerLastName);
}
function getRegisterUsername(){
	registerUsername = $(REGISTER_USERNAME).val();
	console.log(registerUsername);
}
function getRegisterPassword(){
	registerPassword = $(REGISTER_PASSWORD).val();
	console.log(registerPassword);
}
function getRegisterEmail(){
	registerEmail = $(REGISTER_EMAIL).val();
	console.log(registerEmail);
}

function finishRegister(){
	console.log("Need to update the GUI to say the user has been created.");
	
}

$(document).ready(function (){
		
	loadUserInfo();

	$("#loginBtn").click(function(evt){
		evt.preventDefault();	
		verifyLogin();
		return false;


	});
	
	$("#register-btn").click(function(evt){
		evt.preventDefault();	
		hideRegister();
		loadRegister();
		return false;


	});
	
	$("#update-btn").click(function(evt){
		evt.preventDefault();	
		loadUserEdit();
		return false;


	});


});

