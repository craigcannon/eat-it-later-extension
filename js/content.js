/*
	Extension
	Developed By Michael Levinez

	version 1.0.0
*/

(function($) {
	/*
		Extension module
	*/

	function Extension(data) {
		return this.load(data);
	}

	Extension.prototype = {
		constructor: Extension,
		load: function(data) {
			/*Read all properties dynamically*/
			var $this = this;

			chrome.runtime.sendMessage({
				type: 'readProperty',
				property: 'app_settings',
				default: {}
			}, function(settings) {
				$this.data = $.extend($appDefaults, JSON.parse(typeof settings === 'string' ? settings : null));
			});

			return this;
		},
		save: function(data) {
			/*Create data to store to sheet*/
			var result = {},
				domains = this.data.domains.replace(/\s+/g, '').split(','), domainPassed = true,	/*Get allowed domains*/
				filtering = $(this.data.filtering), filteringPassed = true;							/*Get filtering requirements*/

			/*Fill data with values*/
			result[this.data.urlId] = data.url;
			result[this.data.nameId] = (($(this.data.nameSl).text() || '').match(/\w+$/) || [])[0];
			result[this.data.productId] = ($(this.data.productSl).text() || '').replace(/^[\s\r\n]+(.*)[\s\r\n]+$/g, '$1');

			domains.forEach(function(domain) {
				/* Test if string is domain */
				if((/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i).test(domain)) {
					/*Test string is in current url*/
					if(document.URL.indexOf(domain) < 0) domainPassed = false;
				}
			});

			/*Process filtering*/
			if(this.data.filtering && !filtering.length) filteringPassed = false;

			/*If domain and filtering passed*/
			if(domainPassed && filteringPassed) {
				/*Send message to background with sheet data*/
				chrome.extension.sendMessage({
					type: 'addToSheet',
					key: this.data.formId,
					data: result
				}, function(response) {
					/*Show message*/
					window.extensionMessage.show(response.status == 'success' ? 'Url has been saved.' : 'Something was wrong:(');
				});

				/*Show message*/
				window.extensionMessage.show('Saving url..');
			}

			/*Show error message if domain or filtering error*/
			if(!domainPassed) window.extensionMessage.show('Allowed only "'+(domains.join(', '))+'".');
			else if(!filteringPassed) window.extensionMessage.show('Selectors don\'t match "'+(this.data.filtering)+'".');
		}
	}

	/*
		Message module
	*/

	function Message( data ) {
		this.data = $.extend({
			top: 10,
			hide: 4500
		}, data);
		
		/*Create message structure*/
		this.msg = $('<div/>', {id: 'urlsaver-widget-message'}).appendTo('body');
		this.msgText = $('<div/>', {class: 'urlsaver-widget-message-text'}).appendTo( this.msg );
	}
	Message.prototype = {
		constructor: Message,
		show: function( text ) {
			/*Show message and hide it after "hide" period(ms)*/
			this.msgText.html( text ).parent().css('top', this.data.top);
			clearTimeout(this.timer);
			this.timer = setTimeout($.proxy(this.hide, this), this.data.hide);

			return this;
		},
		hide: function() {
			/*Hide message*/
			this.msg.css('top', '');
			clearTimeout(this.timer);

			return this;
		}
	}

	$(function() {
		window.extensionMessage = new Message();	/*Create new instance of message widget*/
		window.extension = new Extension();			/*Create new instance of main script*/
	});
})(Zepto);

/*Add event listener*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	/*Catch messages and check if called method exists in main script i.e. load(:19) method*/
	if($.isFunction(window.extension[request.type])) {
		window.extension[request.type].call(window.extension, request, sender);
	}
});