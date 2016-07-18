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
			var value = {},
				domains = this.data.domains.replace(/\s+/g, '').split(','), domainPassed = true,
				filtering = $(this.data.filtering), filteringPassed = true;
			value[this.data.fieldId] = data.url;

			domains.forEach(function(domain) {
				/*Test if string is domain*/
				if((/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i).test(domain)) {
					/*Test string is in current url*/
					if(document.URL.indexOf(domain) < 0) domainPassed = false;
				}
			});

			if(this.data.filtering && !filtering.length) filteringPassed = false;

			if(domainPassed && filteringPassed) {
				chrome.extension.sendMessage({
					type: 'addToSheet',
					key: this.data.formId,
					data: value
				}, function(response) {
					window.extensionMessage.show(response.status == 'success' ? 'Url has been saved.' : 'Something was wrong:(');
				});

				window.extensionMessage.show('Saving url..');
			}

			if(!domainPassed) window.extensionMessage.show('Allowed only "'+(domains.join(', '))+'".');
			if(!filteringPassed) window.extensionMessage.show('Selectors don\'t match "'+(this.data.filtering)+'".');
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
		
		this.msg = $('<div/>', {id: 'urlsaver-widget-message'}).appendTo('body');
		this.msgText = $('<div/>', {class: 'urlsaver-widget-message-text'}).appendTo( this.msg );
	}
	Message.prototype = {
		constructor: Message,
		show: function( text ) {
			this.msgText.html( text ).parent().css('top', this.data.top);
			clearTimeout(this.timer);
			this.timer = setTimeout($.proxy(this.hide, this), this.data.hide);

			return this;
		},
		hide: function() {
			this.msg.css('top', '');
			clearTimeout(this.timer);

			return this;
		}
	}

	$(function() {
		window.extensionMessage = new Message();
		window.extension = new Extension();
	});
})(Zepto);

/*Add event listener*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if($.isFunction(window.extension[request.type])) {
		window.extension[request.type].call(window.extension, request, sender);
	}
});