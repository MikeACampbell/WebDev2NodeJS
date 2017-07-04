$(document).on('click', "#store-button", function () {
    $.ajax({
        type: 'GET',
        url: process.env.DATABASE_URL,
		success: function (result) {
		
		document.getElementById("divResults").innerHTML = result;
		
        },
    });
});


$(document).on('click', "#order-button", function () {
    $.ajax({
        type: 'GET',
        url: 'https://localhost:5000/getOrdersFromDb',
		success: function (result) {
		
		document.getElementById("divResults").innerHTML = result;
		
        },
    });
});
	
	