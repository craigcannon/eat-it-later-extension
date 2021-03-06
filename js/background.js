chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.type) {
		/*Read all exesting values from extension storage*/
		case 'readAllProps':
			var archive = {}, keys = Object.keys(localStorage), i = 0, key;

			for (; key = keys[i]; i++) archive[key] = localStorage.getItem(key);

			sendResponse(archive);
		break;

		/*Read selected value from storage*/
		case 'readProperty': return sendResponse(readProperty(request.property, request.default)); break;

		/*Save selected value to storage*/
		case 'saveProperty': return sendResponse(localStorage[request.property] = request.value); break;
		
		/*Get all info from active tab*/
		case 'getActiveTabInfo':
			chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
				if(tabs[0]) sendResponse(request.property ? tabs[0][!tabs[0].hasOwnProperty(request.property) ? 'url' : request.property] : tabs[0]);
			});
		break;

		/*Sends message to tabs*/
		case 'sendTabMsg':
			request.type = request.action;
			delete request.action;

			chrome.tabs.query({}, function(tabs) {
				tabs.forEach(function(tab) {
					if(tab && tab.url.indexOf('chrome://') < 0) {
						chrome.tabs.sendMessage(tab.id, request, function(response) {
							sendResponse(request);
						});
					}
				});

				return true;
			});
		break;

		/*Create an ajax request*/
		case 'ajax':
			ajax(request, sendResponse);
		break;

		/*Adding data to sheet*/
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

		/*Run custom functions*/
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

/*Add icon click event*/
chrome.browserAction.onClicked.addListener(function( tab ) {
	chrome.tabs.sendMessage(tab.id, {type: 'save', url: tab.url});
});