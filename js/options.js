$(function() {
	var form = $('form'),
		done = $('.success'),
		options = $('*[name]', form), slider = null, json = {},
		settings = localStorage.getItem('app_settings'),
		data = $.extend($appDefaults, JSON.parse(typeof settings === 'string' ? settings : null));;

	if(data) {
		$.each(options, function(n, opt) {
			switch(opt.type) {
				case 'checkbox': opt.checked = (data[opt.name] || opt.checked);
				default: opt.value = (data[opt.name] || opt.value);
			}
		});
	}

	form.on('submit', function() {
		save(form.serializeObject(), function() {
			done.show();
		});

		return false;
	});

	done.hide();
});