$(function() {
	var form = $('form'),																			/*Get form*/
		done = $('.success'),																		/*Get success label*/
		options = $('*[name]', form), json = {},													/*Get inputs, set json object*/
		settings = localStorage.getItem('app_settings'),											/*Get all saved properties*/
		data = $.extend($appDefaults, JSON.parse(typeof settings === 'string' ? settings : null));	/*Merge saved props with $appDefaults from functions.js*/

	if(data) {
		/*Set values to getted inputs by type*/
		$.each(options, function(n, opt) {
			switch(opt.type) {
				case 'checkbox': opt.checked = (data[opt.name] || opt.checked); break;	/*For checkboxes*/
				default: opt.value = (data[opt.name] || opt.value);						/*For default fields*/
			}
		});
	}

	form.on('submit', function() {
		/*Store changes to storage*/
		save(form.serializeObject(), function() {
			/*
				Call "load" method from main script instance in content.js from background.js
				will refresh main script and get new settigns after saving in options window
			*/
			chrome.extension.sendMessage({
				type: 'sendTabMsg',
				action: 'load'
			});
			done.show();	/*Show success label*/
		});

		return false;
	});

	done.hide();	/*Hide success label*/
});