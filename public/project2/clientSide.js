$(document).on('click', "#store-button", function () {
    $.ajax({
        type: 'GET',
        url: '/getItemsFromDb',
		success: function (result) {
		
		document.getElementById("divResults").innerHTML = result;
		
        },
    });
});


$(document).on('click', "#order-button", function () {
    $.ajax({
        type: 'GET',
        url: '/getOrdersFromDb',
		success: function (result) {
		
		document.getElementById("divResults").innerHTML = result;
		
        },
    });
});
	
	