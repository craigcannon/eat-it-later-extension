$(function() {
	var tmp,
		url = $('#url'),
		save = $('#save');

	chrome.extension.sendMessage({
		type: 'getActiveTabInfo'
	}, function(tab) {
		tmp = tab.url;
		url.val(tmp);
	});

	save.on('click', function(e) {
		chrome.extension.sendMessage({
			type: 'sendActiveTabMsg',
			action: 'save',
			url: tmp
		}, function() {
			window.close();
		});

		e.preventDefault();
	});
});