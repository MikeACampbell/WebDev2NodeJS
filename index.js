var express = require('express');
var app = express();
var url = require('url');
var router = express.Router();

app.set('port', (process.env.PORT || 5000));

app.use('/', express.static(__dirname + '/public'));


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// Stuff for DB start



var pg = require("pg"); // This is the postgres database connection module.
//const connectionString = "postgres://ta_user:ta_pass@localhost:5433/onlinestore";
const connectionString = DATABASE_URL;

app.get('/getItem', function(request, response) {
	getItem(request, response);
});

app.get('/getItemsFromDb', function(request, response) {
	console.log("Getting all items from DB");

	var client = new pg.Client(connectionString);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "SELECT itemname, itemprice FROM item";

		var query = client.query(sql, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}

			console.log("Found result: " + JSON.stringify(result.rows));
			response.end(JSON.stringify(result.rows));

			
		});
	});

});

app.get('/getOrdersFromDb', function(request, response) {
	console.log("Getting all Orders from DB");

	var client = new pg.Client(connectionString);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "SELECT items FROM orders";

		var query = client.query(sql, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}

			console.log("Found result: " + JSON.stringify(result.rows));
			response.end(JSON.stringify(result.rows));

			
		});
	});

});




function getItemsFromDb(request, response) {
	console.log("Getting all items from DB");

	var client = new pg.Client(connectionString);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "SELECT * FROM item";

		var query = client.query(sql, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}

			console.log("Found result: " + JSON.stringify(result.rows));
			
			return result;

			
		});
	});

}


function getItem(request, response) {

	var id = 1;

	getItemFromDb(id, function(error, result) {

		if (error || result == null || result.length != 1) {
			response.status(500).json({success: false, data: error});
		} else {
			var item = result[0];
			response.status(200).json(result[0]);
		}
	});
}

function getItemFromDb(id, callback) {
	console.log("Getting person from DB with id: " + id);

	var client = new pg.Client(connectionString);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "SELECT * FROM item WHERE id = $1::int";
		var params = [id];

		var query = client.query(sql, params, function(err, result) {

			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}

			console.log("Found result: " + JSON.stringify(result.rows));

			callback(null, result.rows);
		});
	});

}





app.get('/getRate', function(request, response) {
	handleMath(request, response);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function handleMath(request, response) {
	var requestUrl = url.parse(request.url, true);

	console.log("Query parameters: " + JSON.stringify(requestUrl.query));

	var weight = Number(requestUrl.query.weight);	
	var postageType = requestUrl.query.PostageType;
	
	computePostage(response, weight, postageType);
}


function computePostage(response, weight, postageType){
	
	var postage = 0; 
	
	if (postageType == "LettersStamped"){
		
		if (weight <= 1)
		{
			postage = 0.49;
			
		}
		else if (weight <= 2)
		{
			postage = 0.71;
			
		}
		else if (weight <= 3)
		{
			postage = 0.91;
			
		}
		else if (weight <= 3.5)
		{
			postage = 0.91;
			
		}
		else if (weight <= 4)
		{
			postage = 1.61;
			
		}else if (weight <= 5)
		{
			postage = 1.82;
			
		}else if (weight <= 6)
		{
			postage = 2.03;
			
		}else if (weight <= 7)
		{
			postage = 2.24;
			
		}else if (weight <= 8)
		{
			postage = 2.45;
			
		}
		else if (weight <= 9)
		{
			postage = 2.66;
			
		}
		else if (weight <= 10)
		{
			postage = 2.87;
			
		}
		else if (weight <= 11)
		{
			postage = 3.08;
			
		}
		else if (weight <= 12)
		{
			postage = 3.29;
			
		}
		else if (weight <= 13)
		{
			postage = 3.51;
		}
			
	}
	else if (postageType == "LettersMettered"){
		
			if (weight <= 1)
		{
			postage = 0.46;
			
		}
		else if (weight <= 2)
		{
			postage = 0.67;
			
		}
		else if (weight <= 3)
		{
			postage = 0.88;
			
		}
		else if (weight <= 3.5)
		{
			postage = 1.09;
			
		}
		else if (weight <= 4)
		{
			postage = 1.61;
			
		}else if (weight <= 5)
		{
			postage = 1.82;
			
		}else if (weight <= 6)
		{
			postage = 2.03;
			
		}else if (weight <= 7)
		{
			postage = 2.24;
			
		}else if (weight <= 8)
		{
			postage = 2.45;
			
		}
		else if (weight <= 9)
		{
			postage = 2.66;
			
		}
		else if (weight <= 10)
		{
			postage = 2.87;
			
		}
		else if (weight <= 11)
		{
			postage = 3.08;
			
		}
		else if (weight <= 12)
		{
			postage = 3.29;
			
		}
		else if (weight <= 13)
		{
			postage = 3.51;
			
		}
		
		
		
	}
	else if (postageType == "LargeEnvelopes"){
		
			if (weight <= 1)
		{
			postage = 0.98;
			
		}
		else if (weight <= 2)
		{
			postage = 1.19;
			
		}
		else if (weight <= 3)
		{
			postage = 1.41;
			
		}
		else if (weight <= 4)
		{
			postage = 1.61;
			
		}else if (weight <= 5)
		{
			postage = 1.82;
			
		}else if (weight <= 6)
		{
			postage = 2.03;
			
		}else if (weight <= 7)
		{
			postage = 2.24;
			
		}else if (weight <= 8)
		{
			postage = 2.45;
			
		}
		else if (weight <= 9)
		{
			postage = 2.66;
			
		}
		else if (weight <= 10)
		{
			postage = 2.87;
			
		}
		else if (weight <= 11)
		{
			postage = 3.08;
			
		}
		else if (weight <= 12)
		{
			postage = 3.29;
			
		}
		else if (weight <= 13)
		{
			postage = 3.51;
			
		}
		
		
	}
	else if (postageType == "Parcels"){
		
				if (weight <= 1)
		{
			postage = 2.67;
			
		}
		else if (weight <= 2)
		{
			postage = 2.67;
			
		}
		else if (weight <= 3)
		{
			postage = 2.67;
			
		}
		else if (weight <= 4)
		{
			postage = 2.67;
			
		}else if (weight <= 5)
		{
			postage = 2.85;
			
		}else if (weight <= 6)
		{
			postage = 3.03;
			
		}else if (weight <= 7)
		{
			postage = 3.21;
			
		}else if (weight <= 8)
		{
			postage = 3.29;
			
		}
		else if (weight <= 9)
		{
			postage = 3.57;
			
		}
		else if (weight <= 10)
		{
			postage = 3.75;
			
		}
		else if (weight <= 11)
		{
			postage = 3.93;
			
		}
		else if (weight <= 12)
		{
			postage = 4.11;
			
		}
		else if (weight <= 13)
		{
			postage = 4.29;
			
		}
		
		
	}
	
	var params = {weight: weight, PostageType: postageType, cost: postage};
	
	response.render('pages/results', params);
	
}