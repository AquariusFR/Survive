try {

	/**
	 * Utilitaire pour XMLHttpRequest
	 *
	 * readyState :
	 * ------------------------------
	 *  UNSENT            : 0
	 *	OPENED            : 1
	 *	HEADERS_RECEIVED  : 2
	 *	LOADING           : 3
	 *	DONE              : 4
	 *
	 */
	function XHR() {}



	XHR.prototype = {};

	XHR.prototype.testAvailable = function(url, callBackFunction) {
		if (window.XMLHttpRequest) {

			var oXhr = new XMLHttpRequest();
			if ("withCredentials" in oXhr)
				oXhr.open("GET", url, true);
			else if (typeof XDomainRequest != "undefined") {
				oXhr = new XDomainRequest();
				oXhr.open("GET", url);
			} else {
				oXhr = null;
			}
			oXhr.onreadystatechange = function() {

				switch (oXhr.readyState) {

					case 4:
						if (oXhr.status == 200 || oXhr.status == 204) {
							callBackFunction(true);
						} else {
							console.error("XHR GET error ", "[" + oXhr.status + "] ", oXhr.statusText);
							callBackFunction(false);
						}
						oXhr = null;
						break;

					default:
						break;
				}
			};
			oXhr.send();
		}
	};

	/**
	 * Méthode XMLHttpRequest POST
	 *
	 * @param url
	 * @param header
	 * @param data
	 */
	XHR.prototype.post = function(url, header, data, callBackFunction, callBackParameters) {

		if (window.XMLHttpRequest) {

			var oXhr = new XMLHttpRequest();
			oXhr.onreadystatechange = function() {

				switch (oXhr.readyState) {

					case 4:
						if (oXhr.status == 200 || oXhr.status == 204) {
							if (callBackFunction != null && typeof(callBackFunction) != 'undefined') {
								if (callBackParameters != null && typeof(callBackParameters) != 'undefined') {
									callBackFunction(oXhr, callBackParameters);
								} else {
									callBackFunction(oXhr);
								}
							}
						} else {
							console.error(url + " : XHR POST error ", "[" + oXhr.status + "] ", oXhr.statusText);
						}
						break;

					default:
						console.log("[" + oXhr.readyState + "] " + oXhr.status + ":" + oXhr.statusText);
						break;
				}
			};

			oXhr.open("POST", url, true);
			for (var key in header) {
				if (header[key] != null && typeof(header[key]) != 'undefined') {
					oXhr.setRequestHeader(key, header[key]);
				}
			};
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");     
			oXhr.send("data="+data);
		}
	};

	/**
	 * Méthode XMLHttpRequest GET
	 *
	 * @param url
	 * @param callBackFunction
	 */
	XHR.prototype.get = function(url, callBackFunction, callBackParameters) {

		if (window.XMLHttpRequest) {

			var oXhr = new XMLHttpRequest();
			if ("withCredentials" in oXhr)
				oXhr.open("GET", url, true);
			else if (typeof XDomainRequest != "undefined") {
				oXhr = new XDomainRequest();
				oXhr.open("GET", url);
			} else {
				oXhr = null;
			}
			oXhr.onreadystatechange = function() {

				switch (oXhr.readyState) {

					case 4:
						if (oXhr.status == 200 || oXhr.status == 204) {
							if (callBackFunction != null && typeof(callBackFunction) != 'undefined') {
								if (callBackParameters != null && typeof(callBackParameters) != 'undefined') {
									callBackFunction(oXhr, callBackParameters);
								} else {
									callBackFunction(oXhr);
								}
							}
						} else {
							console.error(url + " : XHR GET error ", "[" + oXhr.status + "] ", oXhr.statusText);
						}
						oXhr = null;
						break;

					default:
						break;
				}
			};
			//oXhr.open("GET", url, true);
			//Content-Type: application/json
			//oXhr.setRequestHeader("Content-Type", "application/javascript");
			oXhr.send();
		}
	};

	/**
	 * Méthode XMLHttpRequest PUT
	 *
	 * @param url
	 * @param header can be null
	 * @param data
	 * @param callBackFunction	can be null
	 */
	XHR.prototype.put = function(url, header, data, callBackFunction) {

		if (window.XMLHttpRequest) {

			var oXhr = new XMLHttpRequest();
			oXhr.onreadystatechange = function() {

				switch (oXhr.readyState) {

					case 4:
						if (oXhr.status == 200 || oXhr.status == 204) {
							if (callBackFunction != null && typeof(callBackFunction) != 'undefined') {
								if (callBackParameters != null && typeof(callBackParameters) != 'undefined') {
									callBackFunction(oXhr, callBackParameters);
								} else {
									callBackFunction(oXhr);
								}
							}
						} else {
							console.error("XHR GET error ", "[" + oXhr.status + "] ", oXhr.statusText);
						}
						oXhr = null;
						break;

					default:
						break;
				}
			};

			oXhr.open("PUT", url, true);
			if (header != null) {
				for (var key in header) {
					if (header[key] != null && typeof(header[key]) != 'undefined') {
						oXhr.setRequestHeader(key, header[key]);
					}
				};
			}
			oXhr.send(data);
		}
	};

	var xhr = new XHR();

} catch (e) {
	console.error("Exception in xhr.js " + e);
}

xhrLoaded = true;