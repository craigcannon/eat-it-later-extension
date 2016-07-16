chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.type) {
		case 'getActiveTabInfo':
			chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
				if(tabs[0]) sendResponse(request.property ? tabs[0][!tabs[0].hasOwnProperty(request.property) ? 'url' : request.property] : tabs[0]);
			});
		break;

		case 'sendActiveTabMsg':
			request.type = request.action;
			delete request.action;

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				if(tabs[0] && tabs[0].url.indexOf('chrome://') < 0) {
					chrome.tabs.sendMessage(tabs[0].id, request, function(response) {
						sendResponse(response);
					});
				}

				return true;
			});
		break;

		case 'ajax':
			ajax(request, sendResponse);
		break;

		case 'addToSheet':
			ajax({
				query: {
					url: 'https://docs.google.com/forms/d/'+request.key+'/formResponse?embedded=true',
					type: 'post',
					data: request.data
				}
			}, sendResponse);

			return true;
		break;

		default: {
			function argsContext(args) {
				if(args) {
					return $.map(args, function(v, i) {
						var matches = typeof v === 'string' ? v.match(/{(.+)}/) : v;
						return matches[1] ? new Function('request, sender', 'return '+matches[1]+';').call(this, request, sender) : v;
					});
				} else return [];
			}

			var args = argsContext(request.arguments);

			if(request.callback === true) args.push(sendResponse);

			chrome[request.action ? request.action : ''][request.function ? request.function : ''].apply(this, args);

			return true;
		}
	}

	return true;
});