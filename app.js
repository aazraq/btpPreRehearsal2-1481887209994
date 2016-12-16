/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


// Call the module required for dealing with SVP Functionalities
var svpClient = require('./modules/svpClient');

// Call the module required for the calculation of ETB
var etbCalculator = require('./modules/etbCalculator');

//The client ID retrieved from API Connect 
var apiConnectClientId = appEnv.PCV_CLIENT_ID;
var pcvQueryEventEndpoint = appEnv.PCV_ENDPOINT;

//A constant specifying the average time from Antwerp pilot station to terminal A
var AVERAGE_BERTHING_TIME = appEnv.AVG_BERTHING_TIME;

app.get('/calculateETB', function(req, res) {
	var objectId = req.query.objectId;
	var isWeather = req.query.isWeather;
	if (!isWeather || !objectId) {
		res.status(400).send();
	}

	svpClient.queryEvent(objectId,pcvQueryEventEndpoint, apiConnectClientId, function(error, event) {
		if (error) {
			res.status(500).send();
		} else {
			if (isWeather==='true') { //Calculate ETB taking weather condition into consideration
				res.send('Weather is still not implemented');
			} else { // Calculate ETB without taking weather condition
				var etb = etbCalculator.calculateETB(event, AVERAGE_BERTHING_TIME);
				res.send(etb);
			}			
		}
	});
});




// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
