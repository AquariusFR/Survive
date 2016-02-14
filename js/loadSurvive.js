var surviveLoaded = false;
var mouseManagerLoaded = false;
var xhrLoaded = false;
var pathFindLoaded = false;
var preloaderLoaded = false;

var callRPC = function() {
	createConnection();
};

function trace(text) {
	console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

function createConnection() {
	var servers = null;
	window.localPeerConnection = new webkitRTCPeerConnection(servers, {
		optional : [{
			RtpDataChannels : true
		}]
	});
	trace('Created local peer connection object localPeerConnection');

	try {
		// Reliable Data Channels not yet supported in Chrome
		sendChannel = localPeerConnection.createDataChannel("sendDataChannel", {
			reliable : false
		});
		trace('Created send data channel');
	} catch (e) {
		alert('Failed to create data channel. ' + 'You need Chrome M25 or later with RtpDataChannel enabled');
		trace('createDataChannel() failed with exception: ' + e.message);
	}
	localPeerConnection.onicecandidate = gotLocalCandidate;
	sendChannel.onopen = handleSendChannelStateChange;
	sendChannel.onclose = handleSendChannelStateChange;

	window.remotePeerConnection = new webkitRTCPeerConnection(servers, {
		optional : [{
			RtpDataChannels : true
		}]
	});
	trace('Created remote peer connection object remotePeerConnection');

	remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	remotePeerConnection.ondatachannel = gotReceiveChannel;

	localPeerConnection.createOffer(gotLocalDescription);
	startButton.disabled = true;
	closeButton.disabled = false;
}

function sendData() {
	var data = document.getElementById("dataChannelSend").value;
	sendChannel.send(data);
	trace('Sent data: ' + data);
}

function closeDataChannels() {
	trace('Closing data channels');
	sendChannel.close();
	trace('Closed data channel with label: ' + sendChannel.label);
	receiveChannel.close();
	trace('Closed data channel with label: ' + receiveChannel.label);
	localPeerConnection.close();
	remotePeerConnection.close();
	localPeerConnection = null;
	remotePeerConnection = null;
	trace('Closed peer connections');
	startButton.disabled = false;
	sendButton.disabled = true;
	closeButton.disabled = true;
	dataChannelSend.value = "";
	dataChannelReceive.value = "";
	dataChannelSend.disabled = true;
	dataChannelSend.placeholder = "Press Start, enter some text, then press Send.";
}

function gotLocalDescription(desc) {
	localPeerConnection.setLocalDescription(desc);
	trace('Offer from localPeerConnection \n' + desc.sdp);
	remotePeerConnection.setRemoteDescription(desc);
	remotePeerConnection.createAnswer(gotRemoteDescription);
}

function gotRemoteDescription(desc) {
	remotePeerConnection.setLocalDescription(desc);
	trace('Answer from remotePeerConnection \n' + desc.sdp);
	localPeerConnection.setRemoteDescription(desc);
}

function gotLocalCandidate(event) {
	trace('local ice callback');
	if (event.candidate) {
		remotePeerConnection.addIceCandidate(event.candidate);
		trace('Local ICE candidate: \n' + event.candidate.candidate);
	}
}

function gotRemoteIceCandidate(event) {
	trace('remote ice callback');
	if (event.candidate) {
		localPeerConnection.addIceCandidate(event.candidate);
		trace('Remote ICE candidate: \n ' + event.candidate.candidate);
	}
}

function gotReceiveChannel(event) {
	trace('Receive Channel Callback');
	receiveChannel = event.channel;
	receiveChannel.onmessage = handleMessage;
	receiveChannel.onopen = handleReceiveChannelStateChange;
	receiveChannel.onclose = handleReceiveChannelStateChange;
}

function handleMessage(event) {
	trace('Received message: ' + event.data);
	document.getElementById("dataChannelReceive").value = event.data;
}

function handleSendChannelStateChange() {
	var readyState = sendChannel.readyState;
	trace('Send channel state is: ' + readyState);
	if (readyState == "open") {
		dataChannelSend.disabled = false;
		dataChannelSend.focus();
		dataChannelSend.placeholder = "";
		sendButton.disabled = false;
		closeButton.disabled = false;
	} else {
		dataChannelSend.disabled = true;
		sendButton.disabled = true;
		closeButton.disabled = true;
	}
}

function handleReceiveChannelStateChange() {
	var readyState = receiveChannel.readyState;
	trace('Receive channel state is: ' + readyState);
}

'use strict';
var baseurl = './';
var map = {
	lines : []
};
var loadedTiles = 0;
var animations = {};
var items = {};
var imagesUrl = {
	A1 : "tiles/A1/r_0.png",
	D2 : "tiles/D2/r_0.png",
	B1 : "tiles/B1/r_0.png",
	B2 : "tiles/B2/r_0.png",
	cursor : "sprite/FF7Cursor.png",
	attack : "sprite/attack.png",
	doorGreen0Open : "doors/open-door-token-green/r_0.png",
	doorGreen90Open : "doors/open-door-token-green/r_90.png",
	doorGreen0Closed : "doors/closed-door-token-green/r_0.png",
	doorGreen90Closed : "doors/closed-door-token-green/r_90.png"
}; // rendre totalement dynamique en parsant la map
var launchButton = document.createElement("button");
// document.body.appendChild(launchButton);
var maxWatchCount = 100;
var watchCount = 0;
var head = document.getElementsByTagName("head")[0];
var survive = 0;
var xhrStatus = true;
var spriteToLoad = -1;
var loadedSprite = 0;

var launchWatcher = function() {
	setTimeout(loaderWatcher, 100);
};

var loaderWatcher = function() {
	if (surviveLoaded == true && mouseManagerLoaded == true && xhrLoaded == true && pathFindLoaded == true && preloaderLoaded == true && hudManager == true && menuManager == true && collision == true &&
			entityLoaded == true && itemLoaded == true) {
		surviveIsLoaded();
	} else {
		watchCount = watchCount + 1;
		if (watchCount > maxWatchCount) {
			// erreur !
			console.error("script pas charge a� temps");
		} else {
			setTimeout(loaderWatcher, 100);
		}
	}
};
var loadJavascript = function(url, id) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = baseurl + "/" + url;
	head.appendChild(script);
	return script;
};
var loadJSON = function(url, id) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = baseurl + "/" + url;
	head.appendChild(script);
	return script;
};

var surviveIsLoaded = function() {
	var options = {
		width : 1000,
		height : 2100
	};
	var survivediv = document.getElementById("survivediv");
	survive = getSurvive(survivediv, options);

	xhr.testAvailable(baseurl + "index.html", checkAjax);

};

var checkAjax = function(_status) {
	xhrStatus = _status;
	loadAsyncJSON("img/sprite/items.json", "loadItemsInfosCallback");
};
var loadAsyncJSON = function(url, callback) {
	if (xhrStatus) {
		xhr.get(baseurl + url, window[callback]);
	} else {
		loadJSON("json.php?s=" + url + "&c=" + callback);
	}
};

var loadItemsInfosCallback = function(result) {
	var s = result.response;

	if (xhrStatus) {
		itemsJSON = JSON.parse(s);
	} else {
		itemsJSON = s;
	}

	items = itemsJSON;

	imagesUrl["items"] = itemsJSON.url;
	loadAsyncJSON("maps/testMap.json", "loadMapCallBack");
};

var loadMapCallBack = function(result) {
	var s = result.response;

	if (xhrStatus) {
		map = JSON.parse(s);
	} else {
		map = s;
	}

	var lines = map.lines;
	for (var iLine = 0; iLine < lines.length; iLine++) {
		var line = lines[iLine];
		for (var iColumn = 0; iColumn < line.length; iColumn++) {
			var tile = line[iColumn];
			var pos = {
				line : iLine,
				column : iColumn
			};
			var json = "img/tiles/" + tile + ".json";
			if (xhrStatus) {
				xhr.get("./" + json, loadTileCallBack, pos);
			} else {
				loadJSON("json.php?s=" + json + "&c=loadTileCallBack&v=" + JSON.stringify(pos));
			}
		};
	};
};
var loadTileCallBack = function(result, d) {
	console.log(d);

	var s = result.response;
	var tile = {};
	if (xhrStatus) {
		tile = JSON.parse(s);
	} else {
		tile = s;
		d = JSON.parse(d);
	}

	map.lines[d.line][d.column] = tile;
	loadedTiles++;
	if (map.length < loadedTiles) {
		spriteToLoad = 3;
		spriteLoaded = 0;
		loadAsyncJSON("img/sprite/marco.json", "loadAnimationsInfosCallback");
		loadAsyncJSON("img/sprite/ZombieBrain.json", "loadAnimationsInfosCallback");
		loadAsyncJSON("img/sprite/FatZombie.json", "loadAnimationsInfosCallback");
	}
};

var loadAnimationsInfosCallback = function(result) {
	var s = result.response;

	if (xhrStatus) {
		animation = JSON.parse(s);
	} else {
		animation = s;
	}

	animations[animation.id] = animation;
	imagesUrl[animation.id] = animation.url;
	loadedSprite++;
	if (loadedSprite >= spriteToLoad) {
		prelaunch();
	}
};
function prelaunch() {
	var imagesArray = [];
	for ( var imageKey in imagesUrl) {
		imagesArray.push(surviveImageHost + imagesUrl[imageKey]);
	}

	progress.setAttribute('max', Object.keys(imagesArray).length);
	progress.setAttribute('value', 0);
	document.body.appendChild(progress);
	var legend = document.createElement('span');
	document.body.appendChild(legend);

	new preLoader(imagesArray, {
		onProgress : function(img, imageEl, index) {
			// fires every time an image is done or errors.
			// imageEl will be falsy if error
			console.log('just ' + (!imageEl ? 'failed: ' : 'loaded: ') + img);

			var percent = Math.floor((100 / this.queue.length) * this.completed.length);

			// update the progress element
			legend.innerHTML = '<span>' + index + ' / ' + this.queue.length + ' (' + percent + '%)</span>';
			progress.value = index;
			// can access any propery of this
			console.log(this.completed.length + this.errors.length + ' / ' + this.queue.length + ' done');
		},
		onComplete : function(loaded, errors) {
			// fires when whole list is done. cache is primed.
			console.log('done', loaded);
			// imageContainer.style.display = 'block';
			progress.style.display = 'none';
			legend.style.display = 'none';
			launch();

			if (errors) {
				console.log('the following failed', errors);
			}
		}
	});
};

function launch() {

	survive.launch({
		loadAnimations : animations
	});
	
	var entityFactory=survive.launch({getEntityFactory:1});
	entityFactory.loadAnimations(animations);
	var survivorA = entityFactory.createSurvivor("MACHETE !", "marco", 0);
	var zombie1 = entityFactory.createWalker("Rob Zombie", 0);
	var zombie2 = entityFactory.createWalker("Zombie U", 1);
	var zombie3 = entityFactory.createWalker("Zombie U 2", 2);
	var zombie4 = entityFactory.createWalker("Zombie U 3", 3);
	var zombie5 = entityFactory.createWalker("Zombie U 4", 4);
	var zombie6 = entityFactory.createWalker("Zombie pathfind", 5);
	var fattie = entityFactory.createFattie("Big Mutha fucka !", 6);

	survivorA.addToInventory(theItemFactory.createBFG(), 0);
	survivorA.addToInventory(theItemFactory.create9mm(), 4);
	survivorA.addToInventory(theItemFactory.createKnife(), 2);

	survive.launch({
		loadImages : imagesUrl
	});
	survive.launch({
		loadMap : map
	});
	survive.launch({
		loadItems : items
	});
	survive.launch({
		start : true
	});
	survive.launch({
		setSurvivorLocation : {
			survivor : survivorA,
			"position" : [10, 10],
			"location" : "A1_0"
		}
	});
	survive.launch({
		setZombieLocation : {
			zombie : zombie1,
			"position" : [10, 10],
			"location" : "D2_1"
		}
	});
	survive.launch({
		setZombieLocation : {
			zombie : zombie2,
			"position" : [15, 15],
			"location" : "D2_2"
		}
	});
	survive.launch({
		setZombieLocation : {
			zombie : zombie3,
			"position" : [2, 10],
			"location" : "A1_4"
		}
	});
	survive.launch({
		setZombieLocation : {
			zombie : zombie4,
			"position" : [0, 15],
			"location" : "A1_5"
		}
	});
	survive.launch({
		setZombieLocation : {
			zombie : zombie5,
			"position" : [10, 25],
			"location" : "A1_5"
		}
	});
	survive.launch({
		setZombieLocation : {
			zombie : zombie6,
			"position" : [10, 10],
			"location" : "D2_9"
		}
	});
	survive.launch({
		setZombieLocation : {
			zombie : fattie,
			"position" : [10, 10],
			"location" : "B2_10"
		}
	});
	survive.launch({
		setSelectedZone : 'A1_0'
	});
	survive.launch({
		setActionLeft : {
			survivor : survivorA,
			actionLeft : 3
		}
	});
	survivorA.equiped[0] = 0;
	launchButton.style.display = "none";
};
var surviveLoaded = false, mouseManagerLoaded = false, xhrLoaded = false, pathFindLoaded = false, preloaderLoaded = false, hudManager = false, menuManager = false, collision = false;
var entityLoaded = false, itemLoaded = false

loadJavascript('js/entity.js', 'mouseManager');
loadJavascript('js/item.js', 'mouseManager');
loadJavascript('js/survive.js', 'mouseManager');
loadJavascript('js/mouseManager.js', 'mouseManager');
loadJavascript('js/xhr.js', 'mouseManager');
loadJavascript('js/pathfind.js', 'mouseManager');
loadJavascript('js/preloader.js', 'mouseManager');
loadJavascript('js/hudManager.js', 'mouseManager');
loadJavascript('js/menuManager.js', 'mouseManager');
loadJavascript('js/collision.js', 'mouseManager');
loaderWatcher();