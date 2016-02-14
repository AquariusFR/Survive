
var isChrome = !!navigator.webkitGetUserMedia;

var sendChannel, receiveChannel;

var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var closeButton = document.getElementById("closeButton");
// startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;
// startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

var createButton = document.getElementById("createButton");
createButton.onclick = createConnection;
var joinButton = document.getElementById("joinButton");
joinButton.onclick = joinConnection;

var STUN = {
	url : isChrome ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
};

var TURN = {
	url : 'turn:homeo@turn.bistri.com:80',
	credential : 'homeo'
};
// DTLS/SRTP is preferred on chrome
// to interop with Firefox
// which supports them by default

var DtlsSrtpKeyAgreement = {
	DtlsSrtpKeyAgreement : true
};
var RtpDataChannels = {
	RtpDataChannels : true
};

var optional = {
	optional : [ DtlsSrtpKeyAgreement, RtpDataChannels ]
};

var iceServers = {
	iceServers : [ STUN, TURN ]
};
var callRPC = function() {
	createConnection();
};

var servers = iceServers;
function trace(text) {
	console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

function createConnection() {
	window.peerConnection = new webkitRTCPeerConnection(servers, optional);
	trace('Created local peer connection object peerConnection');

	try {
		// Reliable Data Channels not yet supported in Chrome
		sendChannel = peerConnection.createDataChannel("sendDataChannel", {
			reliable : false
		});
		trace('Created send data channel');
	} catch (e) {
		alert('Failed to create data channel. '
				+ 'You need Chrome M25 or later with RtpDataChannel enabled'
				+ e.message);
		trace('createDataChannel() failed with exception: ' + e.message);
	}
	peerConnection.onicecandidate = gotLocalCandidate;
	sendChannel.onopen = handleSendChannelStateChange;
	sendChannel.onclose = handleSendChannelStateChange;

	/*window.remotePeerConnection = new webkitRTCPeerConnection(servers, optional);
	trace('Created remote peer connection object remotePeerConnection');

	remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	remotePeerConnection.ondatachannel = gotReceiveChannel;
*/
	peerConnection.createOffer(gotLocalDescription);
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
	peerConnection.close();
	remotePeerConnection.close();
	peerConnection = null;
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
	var sdp = desc.sdp
	sdp = sdp.replace(/\+/g, '_PLUS_');
	var sdpLines = sdp.split('\r\n');
	var string = JSON.stringify(sdpLines);
	string = string.replace(/\+/g, '_PLUS_');
	xhr.get("./createSession.php?s=" + string, createSessionCallback);
	//trace('Offer from peerConnection \n' + desc.sdp);

	peerConnection.setLocalDescription(desc);
}

function createSessionCallback(result) {
	var call = document.querySelector('#call');
	call.innerHTML = result.response;
}

function joinConnection() {
	var invite = document.getElementById("invite").value;

	xhr.get("./getSession.php?ts=" + invite, joinSessionCallback);
	
}

function joinSessionCallback(result) {
	var compressed = result.response;
	var cleaned = compressed.replace(/\\/g, 'ANTI');

	cleaned = cleaned.replace(/_PLUS_/g, '+');
	cleaned = cleaned.replace(/ANTI"/g, '"');
	
	// var string = LZString.decompressFromUTF16(compressed);
	var sdpLines = JSON.parse(cleaned);
	sdp = sdpLines.join('\r\n');
	

	var desc = {sdp:sdp, type: "offer"};
	
	window.remotePeerConnection = new webkitRTCPeerConnection(servers, optional);
	trace('Created remote peer connection object remotePeerConnection');
	remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
	remotePeerConnection.ondatachannel = gotReceiveChannel;


	try {
		var answerDesc = new RTCSessionDescription(desc);
		remotePeerConnection.setRemoteDescription(answerDesc);
		remotePeerConnection.createAnswer(gotRemoteDescription);
	} catch (e) {
		alert('Failed to create data channel. '
				+ 'You need Chrome M25 or later with RtpDataChannel enabled'
				+ e.message);
		trace('createDataChannel() failed with exception: ' + e.message);
	}
	
}
var gotRemoteDescription = function(desc) {
	//trace('Answer from remotePeerConnection \n' + desc.sdp);
	remotePeerConnection.setRemoteDescription(desc);
}

function gotLocalCandidate(event) {
	trace('local ice callback');
	if (event.candidate) {
		//remotePeerConnection.addIceCandidate(event.candidate);
		trace('Local ICE candidate: \n' + event.candidate.candidate);
	}
}

function gotRemoteIceCandidate(event) {
	trace('remote ice callback');
	if (event.candidate) {
		peerConnection.addIceCandidate(event.candidate);
		//trace('Remote ICE candidate: \n ' + event.candidate.candidate);
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
		var _data = "HELLO WORLD !!!";
		sendChannel.send(_data);
		trace('Sent data: ' + _data);
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