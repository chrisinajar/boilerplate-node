// This is the browser side js...
$(function() {

/*
TODO:

Make the failure / success messages of swatted batches more apparent
Chain the actions in Y coord order and break the chain on a failure, make apparent in the UI
save/load swat batches

*/

$("#dropPad").css({
	minHeight: window.innerHeight-50
});

success = function() {
	var msg = success.ar[Math.round(Math.random()*success.ar.length)];

	$("#result").text(msg);
	$("button").removeAttr("disabled");
};

success.ar = [
	'Success!',
	'It Worked!',
	'Heck Yeah!',
	'Great Success!',
	'This was a triumph.'
];

$("#forecastButton").click(function() {
	var self = $(this);
	self.attr("disabled", "disabled");
	var data = {
		quantity: $("#forecastQuantity").val(),
		random: $("#forecastRandomize").attr('checked') === 'checked'
	};
	$.ajax({
		url: '/api/forecast',
		data: data,
		success: function() {
			success();
		},
		error: function() {
			$("#result").text('Fail!');
			self.removeAttr("disabled");
		}
	});
});

$("#replenButton").click(function() {
	var self = $(this);
	self.attr("disabled", "disabled");
	var data = {
		priority: $("#replenPriority").val()
	};
	var sku = $("#replenSku").val();
	if (sku.length > 0)
		data.sku = sku;
	var layers = $("#replenLayers").val();
	if (layers.length > 0)
		data.layers = layers;
	$.ajax({
		url: '/api/replenishment',
		data: data,
		success: function() {
			success();
		},
		error: function() {
			$("#result").text('Fail!');
			self.removeAttr("disabled");
		}
	});
});

$(".module").draggable({
	helper:'clone'
});

// make the dimentions constant so that when we clone it, 
// the new parent container doesn't mess with it's size
$(".module").each(function() {
	var self = $(this);
	self.css({
		width: self.width(),
		height: self.height(),
	});
});
$("#dropPad").droppable({
	accept: ".module",
	// Add the shadow when it's in range
	over: function(event, ui) {
		console.log(ui);
		ui.helper.removeClass('dropped');
		if (!ui.helper.hasClass('hovering'))
			ui.helper.addClass('hovering');
	},
	// Remove the shadow when it leaves us
	out: function(event, ui) {
		ui.helper.removeClass('dropped');
		ui.helper.removeClass('hovering');
	},
	// When a module is dropped on the bay.
	// We need to make a copy of the object since they always delete themselves
	drop: function(event, ui) {
		ui.helper.removeClass('hovering');
		if (!ui.helper.hasClass('dropped')) {
			ui.helper.addClass('dropped');
			// Clone the dragging object so that the position works correctly
			var newMod = $(ui.helper).clone();
			$(this).append(newMod);
			// Make the pasted object draggable, and make sure it deletes itself aswell
			// when it lands, it will call this drop function as well.
			newMod.draggable({
				stop: function(event, ui) {
					console.log('newmod end', arguments);
					newMod.remove();
				}
			});
		}
	}
});

// Swat button
$("#swat").click(function() {
	// Click all of the buttons so that the actions happen. Let the backend modules handle concurrency
	$(".module.dropped .doit").click();
	
	// make it look cool
	$("#dropPad").css({
		backgroundColor: '#E96767'
	});
	$("#dropPad")
		.stop(true)
		.animate({
			backgroundColor: '#F6E0E0'
		}, 1000);
});

});

