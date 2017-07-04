$(document).on('click', "#store-button", function () {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:5000/getItemsFromDb',
		success: function (result) {
		
		document.getElementById("divResults").innerHTML = result;
		
        },
    });
});


$(document).on('click', "#order-button", function () {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:5000/getOrdersFromDb',
		success: function (result) {
		
		document.getElementById("divResults").innerHTML = result;
		
        },
    });
});
	
	