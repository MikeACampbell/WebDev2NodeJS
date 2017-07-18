var express = require('express');
var app = express();
var url = require('url');
var router = express.Router();

var bcrypt = require('bcrypt'); //Handles Password Encryption
const saltRounds = 10;


var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var session = require('express-session')

// set up sessions
app.use(session({
  secret: 'my-super-secret-secret!',
  resave: false,
  saveUninitialized: true
}))

app.set('port', (process.env.PORT || 5000));

app.use('/', express.static(__dirname + '/public'));


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// Stuff for DB start

var pg = require("pg"); // This is the postgres database connection module.
const connectionString = process.env.DATABASE_URL || "postgres://ta_user:ta_pass@localhost:5433/onlinestore";
//const connectionString = process.env.DATABASE_URL;


//I don't think this is needed anymore.
app.post('/getItem', function(request, response) {
	getItem(request, response);
});

var allItems; 
	var total;

//Verifies that corrects any potential altering of prices then adds to order table. 
app.post('/verifyOrder', verify, check, function(request, response) {
	
	
	console.log(request.session.allItems);
	
	/*
	var sql = "INSERT INTO orders (items, userid, price, ordereddate, status) VALUES ($1, $2, $3, CURRENT_DATE, 0)";
	var query = client.query(sql, [allItems, request.session.user_id, total], function(err, result) {
		client.end(function(err) {
			if (err) throw err;
			});
			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}
			else{
				cartVerified = { success: true} ;
				console.log("Items: "+ allItems);
				console.log("Total: " + total.toFixed(2));
				
				
				
			}
						
		});
		*/

	
	
	
});
	
	
function check (request, response, next) {	
	//console.log(request.body);
	var temp1 = 0;
	cartVerified = { success: false} ;
	
	//console.log(request.session.user + " ID " + request.session.userID + " " + request.session.user_id + " " + request.session.userRole);

	var client = new pg.Client(connectionString);
		client.connect(function(err) {
			if (err) {
				console.log("Error connecting to DB: ")
				console.log(err);
				callback(err, null);
			}
			
			var sql = "SELECT item_id, itemname, itemprice FROM item";
			var query = client.query(sql, function(err, resultCart) { 
				client.end(function(err) { 
					if (err) throw err;
				});
					if (err) {
						console.log("Error in query: ")
						console.log(err);
						callback(err, null);
					}
					else
					{
						
						//console.log("Req " + req.body.clientCart.length);
						//console.log("Nothing " + resultCart.rows[0].item_id);
						//Again I know there's likely a better way to handle this, likely thought a third party tool.  just don't have the time to intergrate it, and given that I don't plan to implement a payment system.
						//I'm just saying this is a popular local store and they only do in store pickup
					
					
						 for(var x = 0; x < request.body.clientCart.length; x++)
						 {
							  for(var i = 0; i < resultCart.rowCount; i++)
							  {
									if(request.body.clientCart[x].item_id == resultCart.rows[i].item_id)
									{		
										temp1 = request.body.clientCart[x].price / request.body.clientCart[x].qty;
										if(temp1 != Number(resultCart.rows[i].itemprice.replace(/[^0-9\.]+/g,"")))
										{
											
											
											request.body.clientCart[x].price = resultCart.rows[i].itemprice * request.body.clientCart[x].qty;
											allItems = request.body.clientCart[x].item_name + " " + request.body.clientCart[x].qty + ", "; 
											total = total + Number(resultCart.rows[x].itemprice.replace(/[^0-9\.]+/g,"")) * request.body.clientCart[x].qty;
											//console.log(allItems);
										}
										else
										{
										var tempPrice = request.body.clientCart[x].price;
										allItems = allItems + request.body.clientCart[x].item_name + " " + request.body.clientCart[x].qty + ", "; 
										total = total + parseFloat(tempPrice);
										
										request.session.allItems = allItems;
										request.session.total	=	total;
										//console.log("Items: "+ allItems);
										//console.log("Total: " + total.toFixed(2));
										}
									}
								
									
								}
						}
						client.end();
						next();						
					}
				});	
		});		
}
	

function upLoad(items, price)
{
	

}
		


app.post('/getItemsFromDb', verify ,function(request, response) {
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

			//console.log("Found result: " + JSON.stringify(result.rows));
			response.json(result.rows);

			
		});
	});

});

app.post('/verify', function(request, response) {
	verifyOnLoad(request, response);
});


app.post('/getOrdersFromDb', verify, getOrders);


function getOrders(request, response)
{
	
	console.log("Getting all Orders from DB");

	var client = new pg.Client(connectionString);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		//Check User Role, if Admin pull all orders. If time permits add ablity to set order as shhipped.
		var sql = "SELECT * FROM orders INNER JOIN users on ($1) = orders.userID";

		var query = client.query(sql, [request.session.user_id], function(err, result) {
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
	
	
	
	
	
}



app.post('/registerUser', function(request, response) {
	console.log("Checking if User is already Logged in");
	
	
	
	
	console.log("Creating account");

	var uName = request.body.userName;
	var pword =  request.body.pword;
	
	var client = new pg.Client(connectionString);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "SELECT userID FROM users WHERE userName = ($1)";

		var query = client.query(sql, [uName], function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}
			
			console.log(result.rowCount);
			
			if (result.rowCount == 0)
			{
				console.log("New Username. Hasing Password")
				bcrypt.genSalt(saltRounds, function(err, salt) {
					bcrypt.hash(pword, salt, function(err, hash) {
       
					
						var client = new pg.Client(connectionString);

						client.connect(function(err) {
							if (err) {
								console.log("Error connecting to DB: ")
								console.log(err);
								callback(err, null);
							}

							var sql = "INSERT INTO USERS(username, pword, role) VALUES ($1, $2, 1)";

							var query = client.query(sql, [uName, hash], function(err, result2) {
								client.end(function(err){
									if (err) throw err;
								});
								if (err) {
									console.log("Error in query: ")
									console.log(err);
									callback(err, null);
								}
								
								if (result2.rowCount == 1)
								{
								console.log("Registration Complete");
								var logged = {succes: "success", username: uName};
								response.json(logged);
								}
							});
						});					
					});
				});	
			}
			else 
			{
				console.log("Username Already Exists. Displaying Error");
				var logged = {succes: "failed", username: ""};
				response.json(logged);
				
			}
			
		});
	});
});

app.post('/signInUser', function(request, response) {
	console.log("Logging in");
	
	var uName = request.body.userName;
	var pword =  request.body.pword;
	
			var client = new pg.Client(connectionString);
			client.connect(function(err) {
				if (err) {
					console.log("Error connecting to DB: ")
					console.log(err);
					callback(err, null);
				}
					var sql = "SELECT userid, pword, role FROM users WHERE userName = ($1)";
					var query = client.query(sql, [uName], function(err, result) {
						client.end(function(err) {
							if (err) throw err;
						});
							if (err) {
								console.log("Error in query: ")
								console.log(err);
								callback(err, null);
							}
							if (result.rowCount == 1) {

								var hash = result.rows[0].pword;
								
								bcrypt.compare(pword, hash, function(err, result2) {

									if (result2 == true)
									{
										//console.log(result.rows[0].userid);
										//console.log("Login Attempt by " + uName + " was succesful.");
										
										request.session.user = uName;
										request.session.userRole = result.rows[0].role;
										request.session.user_id = result.rows[0].userid;
										result3 = {success: true,
													userName: uName};
										response.json(result3);
										
									}
									else if (result2 == false)
									{
										
										console.log("Login Attempt by " + uName + " was unsuccesful.");
										result3 = {success: false};
										response.json(result3);
										
										
									}
									else 
									{
										//There shouldn't be any way for this to be triggered, but just in case I have it just defualt fails the login 
										console.log("Uh....well this is awkward. Somehow a boolean ended up being neither true or false. Let's just fail the login just in case.");
										result3 = {success: false};
										response.json(result3);
										
									}
								});
								
								
								
							}
								
					});
				});
	

});


app.post('/logoutUser', function(request, response) {
	var logoutResult = {success: false};
	
	if (request.session.user) {
		console.log("Logging out " + request.session.user);
		request.session.destroy();
		logoutResult = {success: true};
	}

	response.json(logoutResult);
	
});


//This handles maintaing a log in status per session. 

function verifyOnLoad(request, response) {
	var verifyResult = {success: false};
	
	if (request.session.user == request.body.userName)
	{
		console.log("verifed with Server that user is logged in.")
		verifyResult = {success: true};

	}
		response.json(verifyResult);
}


//This is a middleware function
function verify(request, response, next) {
	
	if (request.session.user)
	{
		next();

	}
	else{
		var result = {success:false, message: "Access Denied"};
		response.status(401).json(result);
}
}





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
			client.end(function(err) 
			{
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