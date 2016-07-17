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
		var $this = this;

		this.data = $.extend($appDefaults, data);
	}

	Extension.prototype = {
		constructor: Extension,
		save: function(data) {
			var value = {}, domains = this.data.domains.replace(/\s+/g, '').split(','), allowed = true;
			value[this.data.fieldId] = data.url;

			domains.forEach(function(domain) {
				/*Test if string is domain*/
				if((/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i).test(domain)) {
					/*Test string is in current url*/
					if(document.URL.indexOf(domain) < 0) allowed = false;
				}
			});

			if(allowed) {
				chrome.extension.sendMessage({
					type: 'addToSheet',
					key: this.data.formId,
					data: value
				}, function(response) {
					window.extensionMessage.show(response.status == 'success' ? 'Url has been saved.' : 'Something was wrong:(');
				});

				window.extensionMessage.show('Saving url..');
			} else {
				window.extensionMessage.show('Allowed only "'+(domains.join(', '))+'".');
			}
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
		chrome.runtime.sendMessage({
			type: 'readProperty',
			property: 'app_settings',
			default: {}
		}, function(settings) {
			window.extensionMessage = new Message();
			window.extension = new Extension(JSON.parse(typeof settings === 'string' ? settings : null));
		});
	});
})(Zepto);

/*Add event listener*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if($.isFunction(window.extension[request.type])) {
		window.extension[request.type].call(window.extension, request, sender);
	}
});