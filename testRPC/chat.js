
var isChrome = !!navigator.webkitGetUserMedia;
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
var peer = {};
var iceServers = {
	iceServers : [ STUN, TURN ]
};

var Offerer = {
	createOffer : function() {
		var peer = new webkitRTCPeerConnection(iceServers);

		offererDataChannel = peer.createDataChannel('channel', {});
		setChannelEvents(offererDataChannel);

		peer.onicecandidate = function(event) {
			if (event.candidate)
				registerCandidate(event.candidate);
		};

		peer.createOffer(function(sdp) {
			peer.setLocalDescription(sdp);
			registerSDP(sdp);
		});

		this.peer = peer;

		return this;
	},
	setRemoteDescription : function(sdp) {
		this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
	},
	addIceCandidate : function(candidate) {
		this.peer.addIceCandidate(new RTCIceCandidate({
			sdpMLineIndex : candidate.sdpMLineIndex,
			candidate : candidate.candidate
		}));
	}
};

var Answerer = {
	createAnswer : function(offerSDP) {
		var peer = new webkitRTCPeerConnection(iceServers);
		peer.ondatachannel = function(event) {
			answererDataChannel = event.channel;
			setChannelEvents(answererDataChannel);
		};

		peer.onicecandidate = function(event) {
			if (event.candidate){
				//Send_to_Other_Peer(event.candidate);
			}
		};

		peer.setRemoteDescription(new RTCSessionDescription(offerSDP));
		peer.createAnswer(function(sdp) {
			peer.setLocalDescription(sdp);
			//Send_to_Other_Peer(sdp);
		});

		this.peer = peer;

		return this;
	},
	addIceCandidate : function(candidate) {
		this.peer.addIceCandidate(new RTCIceCandidate({
			sdpMLineIndex : candidate.sdpMLineIndex,
			candidate : candidate.candidate
		}));
	}
};

var setChannelEvents = function(channel) {
    channel.onmessage = function (event) {
        var data = JSON.parse(event.data);
        console.log(data);
    };
    channel.onopen = function () {
        channel.push = channel.send;
        channel.send = function (data) {
            channel.push(JSON.stringify(data));
        };
    };

    channel.onerror = function (e) {
        console.error('channel.onerror', JSON.stringify(e, null, '\t'));
    };

    channel.onclose = function (e) {
        console.warn('channel.onclose', JSON.stringify(e, null, '\t'));
    };
}

var registerCandidate = function(_candidate) {
	console.log("heelo !" + _candidate);
};
var registerSDP = function(_sdp) {
	console.log(_sdp);

	var sdp = _sdp.sdp
	sdp = sdp.replace(/\+/g, '_PLUS_');
	var sdpLines = sdp.split('\r\n');
	var string = JSON.stringify(sdpLines);
	string = string.replace(/\+/g, '_PLUS_');
	xhr.get("./createSession.php?s=" + string, createSessionCallback);
};
function createSessionCallback(result) {
	var call = document.querySelector('#call');
	call.innerHTML = result.response;
}
var createConnection = function() {
	console.log("creatingConnection ...");

	var offerer = Offerer.createOffer();
	
};
var joinConnection = function() {
	var invite = document.getElementById("invite").value;
	xhr.get("./getSession.php?ts=" + invite, joinSessionCallback);
};
var joinSessionCallback=function(result) {
	var compressed = result.response;
	var cleaned = compressed.replace(/\\/g, 'ANTI');
	cleaned = cleaned.replace(/_PLUS_/g, '+');
	cleaned = cleaned.replace(/ANTI"/g, '"');
	var sdpLines = JSON.parse(cleaned);
	sdp = sdpLines.join('\r\n');
	var desc = {sdp:sdp, type: "offer"};
	var answerer = Answerer.createAnswer(desc);
}
var sendMessage=function() {
	console.log("sending " + dataChannelSend.value);
	console.log("peer " + this.peer);
}



var createButton = document.getElementById("createButton");
var joinButton = document.getElementById("joinButton");
var sendButton = document.getElementById("sendButton");
var dataChannelSend = document.getElementById("dataChannelSend");

createButton.onclick = createConnection;
joinButton.onclick = joinConnection;
sendButton.onclick = sendMessage;