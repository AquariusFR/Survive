var loaded = false;
var fps = 24;
var baseurl = 'http://aquarius.host22.com/survive/';
var surviveImageHost = baseurl + "img/";
// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame || function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
})();

function extractUrlParams() {
	var t = location.search.substring(1).split('&');
	var f = [];
	for (var i = 0; i < t.length; i++) {
		var x = t[i].split('=');
		f[x[0]] = x[1];
	}
	return f;
}

var testAnimation = function(_canvas, _debug) {
	'use strict';
	var debug = _debug;
	var canvasAnimation = _canvas;
	var _ = {};
	_ = {

		init : function() {
			var canvasOverlay = document.getElementById("canvasOverlay");
			var canvasOverlayContext = canvasOverlay.getContext('2d');
			var spriteName = extractUrlParams()["sprite"];

			if (typeof spriteName == 'undefined') {
				console.error("no sprite defined");
				return;
			}
			canvasAnimation.onclick = _.freeze;
			this.contextOverlay = canvasAnimation.getContext('2d');
			this.contextAnimation = canvasOverlayContext;

			this.contextAnimation.webkitImageSmoothingEnabled = false;
			this.contextAnimation.mozImageSmoothingEnabled = false;
			this.contextAnimation.imageSmoothingEnabled = false; // future
			this.contextOverlay.webkitImageSmoothingEnabled = false;
			this.contextOverlay.mozImageSmoothingEnabled = false;
			this.contextOverlay.imageSmoothingEnabled = false; // future
			xhr.get(baseurl + "img/sprite/"
					+ spriteName + ".json", _.loadAnimationsInfosCallback);
		},

		isFreeze : false,
		contextAnimation : 0,
		contextOverlay : 0,
		images : {},
		animations : {},
		isAllImagesLoaded : false,
		imageToLoad : -1,
		imageLoaded : -1,
		currentFrame : 0,
		isSpriteAssigned : false,
		currentSrite : {
			id : 1,
			"name" : "testSprite",
			sprite : "__",
			acDelta : 0,
			lastUpdateTime : 0,
			position : [ 50, 50 ],
			callback : false,
			"backward" : false,
			state : 0,
			"currentAnimation" : -1,
			"currentFrame" : 3,
			"previousFrame" : -1,
			"reverseAnim" : false
		},

		changeState : function() {
			_.changeStateInContext();
		},
		snapshot : function() {
			_.snapshotInContext();
		},
		clearSnapshot : function() {
			_.clearSnapshotInContext();
		},
		clearSnapshotInContext : function() {
			_.eraseFrame(this.snapShotframeIndex, this.contextOverlay);
		},
		snapshotInContext : function() {
			var _sprite = this.currentSrite;
			this.snapShotframeIndex = _sprite.currentFrame;
			_.drawTransparentFrame(this.snapShotframeIndex);
		},
		changeStateInContext : function() {
			this.currentSrite.state = this.currentSrite.state + 1;

			this.contextAnimation.clearRect(0, // (this.x * 32) - (this.largeur
												// / 2) + 16,// Point de
												// destination (depend de la
												// taille du personnage)
			0, // (this.y * 32) - this.hauteur + 24, // Point de destination
				// (depend de la taille du personnage)
			1000, 1000);
		},

		loadAnimationsInfosCallback : function(result) {
			_.loadAnimationsInfosCallbackInContext(result);
		},
		loadAnimationsInfosCallbackInContext : function(result) {
			var s = result.response;
			var animation = JSON.parse(s);
			this.animations[animation.id] = animation;
			var _images = {};
			_images[animation.id] = animation.url;
			this.currentSrite.sprite = animation.id;
			_.loadImages(_images);
		},
		start : function() {
			_.refreshAnimation(this);
		},
		freeze : function() {
			this.isFreeze = !this.isFreeze;
		},
		// methode raffraichissant l'animation (les sprites)
		refreshAnimation : function() {
			requestAnimFrame(function() {
				_.refreshAnimation();
			});
			_.refreshAnimationInContext();
		},
		refreshAnimationInContext : function() {
			if (!this.isAllImagesLoaded) {
				console.log('all images are still not loaded');
				return;
			}
			if (!this.isSpriteAssigned) {
				this.isSpriteAssigned = true;
				_.updateAnimations();
				return;
			}
			if (this.isFreeze) {
				return;
			}
			this.currentFrame = this.currentFrame + 1;
			_.eraseSurvivors();
			_.drawSurvivors();
		},
		notifyImageLoaded : function(_k, _i) {
			this.images[_k] = _i;
			console.log(_k + '  image loaded');
			this.imageLoaded++;
			if (this.imageLoaded == this.imageToLoad) {
				console.log('all images ressources loaded');
				this.isAllImagesLoaded = true;
			}
		},
		// affichage d'une notification
		loadImages : function(_imagesToLoad) {

			this.isAllImagesLoaded = false;
			this.imageLoaded = 0;
			this.imageToLoad = Object.keys(_imagesToLoad).length;

			for ( var imageKey in _imagesToLoad) {
				var currentUrl = _imagesToLoad[imageKey];
				var img = new Image();
				img.onload = function(_k, _s) {
					_.notifyImageLoaded(_k, _s);
				}(imageKey, img);
				img.src = surviveImageHost + currentUrl;
			}
		},
		// affichage d'une notification
		loadAnimations : function(_animations) {
			this.animations = _animations;
		},
		// affichage d'une notification
		updateAnimations : function() {
			for ( var animationKey in this.animations) {
				var currentSprite = this.animations[animationKey];
				currentSprite.img = this.images[currentSprite.id];
				_.preRenderAnimation(currentSprite);
			}
		},
		setSurvivorLocation : function(_survivorLocation) {

			var survivorZone = _.findZoneById(_survivorLocation.location);
			var survivorX = _survivorLocation.position[0] + 2
					* survivorZone.segments[0][0] + 5
					+ (survivorZone.offsetX * 500);
			var survivorY = _survivorLocation.position[1] + 2
					* survivorZone.segments[0][1] + 5
					+ (survivorZone.offsetY * 500);

			_survivorLocation.survivor.position[0] = survivorX;
			_survivorLocation.survivor.position[1] = survivorY;

			this.survivors.push(_survivorLocation.survivor);
		},
		getAnimation : function(_animations, state) {
			for (var i = 0; i < _animations.length; i++) {
				var currentAnimation = _animations[i];
				if (currentAnimation.state == state) {
					return currentAnimation;
				}
			}
			console.log("state " + state + " not found");
			return -1;
		},
		eraseSurvivors : function() {
			_.eraseSprite();
		},
		drawSurvivors : function() {
			_.drawSprite();
		},
		incrementFrame : function() {
			var _sprite = this.currentSrite;
			var frameIndex = _sprite.currentFrame;

			_.eraseFrame(frameIndex, this.contextAnimation);
			var totalFrame = _sprite.currentAnimation.frames.length - 1;
			if (frameIndex >= totalFrame) {
				frameIndex = -1;
			}
			frameIndex++;
			_.drawFrame(frameIndex);
			_sprite.currentFrame = frameIndex;

		},
		decrementFrame : function() {
			var _sprite = this.currentSrite;
			var frameIndex = _sprite.currentFrame;
			_.eraseFrame(frameIndex, this.contextAnimation);
			var totalFrame = _sprite.currentAnimation.frames.length - 1;
			if (frameIndex <= 0) {
				frameIndex = totalFrame + 1;
			}
			frameIndex--;
			_.drawFrame(frameIndex);
			_sprite.currentFrame = frameIndex;
		},
		incrementOffsetX : function() {
			var _sprite = this.currentSrite;
			var frameIndex = _sprite.currentFrame;
			_.eraseFrame(frameIndex, this.contextAnimation);

			_sprite.currentAnimation.frames[frameIndex][4]++;
			_.drawFrame(frameIndex);
		},
		decrementOffsetX : function() {
			var _sprite = this.currentSrite;
			var frameIndex = _sprite.currentFrame;
			_.eraseFrame(frameIndex, this.contextAnimation);

			_sprite.currentAnimation.frames[frameIndex][4]--;
			_.drawFrame(frameIndex);
		},
		incrementOffsetY : function() {
			var _sprite = this.currentSrite;
			var frameIndex = _sprite.currentFrame;
			_.eraseFrame(frameIndex, this.contextAnimation);

			_sprite.currentAnimation.frames[frameIndex][5]++;
			_.drawFrame(frameIndex);
		},
		decrementOffsetY : function() {
			var _sprite = this.currentSrite;
			var frameIndex = _sprite.currentFrame;
			_.eraseFrame(frameIndex, this.contextAnimation);

			_sprite.currentAnimation.frames[frameIndex][5]--;
			_.drawFrame(frameIndex);
		},
		eraseSprite : function() {
			var _sprite = this.currentSrite;
			var frameToErase = _sprite.previousFrame;
			if (_sprite.previousFrame == -1) {
				return;
			}
			var currentAnimation = _sprite.currentAnimation;
			var spriteInfos = this.animations[_sprite.sprite];
			var availableAnimation = spriteInfos.animations;
			if (currentAnimation == -1
					|| currentAnimation.state != _sprite.state) {
				currentAnimation = _.getAnimation(availableAnimation,
						_sprite.state);
				_sprite.currentAnimation = currentAnimation;
				if (currentAnimation == -1) {
					console.log("no animation found");
					_sprite.currentAnimation = _.getAnimation(
							availableAnimation, 0);
					_sprite.state = 0;
					return;
				}
			}
			var frameIndex = frameToErase;

			if (frameIndex < 0) {
				frameIndex = 0;
				_sprite.currentFrame = frameIndex;
			}
			if (frameIndex > (currentAnimation.frames.length - 1)) {
				frameIndex = currentAnimation.frames.length - 1;
				_sprite.currentFrame = frameIndex;
			}
			_.eraseFrame(frameIndex, this.contextAnimation);
		},
		drawSprite : function() {
			var _sprite = this.currentSrite;
			if (_sprite == false) {
				return;
			}
			var currentAnimation = _sprite.currentAnimation;
			var spriteInfos = this.animations[_sprite.sprite];
			var availableAnimation = spriteInfos.animations;

			if (currentAnimation == -1
					|| currentAnimation.state != _sprite.state) {
				currentAnimation = _.getAnimation(availableAnimation,
						_sprite.state);
				_sprite.currentAnimation = currentAnimation;
				if (currentAnimation == -1) {
					console.log("no animation found");
					_sprite.currentAnimation = _.getAnimation(
							availableAnimation, 0);
					_sprite.state = 0;
				}
			}

			var step = currentAnimation.step;

			var delta = Date.now() - _sprite.lastUpdateTime;
			_sprite.lastUpdateTime = Date.now();
			if (_sprite.acDelta > step) {
				_sprite.acDelta = 0;
				// on passe � l'image suivante

				if (currentAnimation.reverse) {
					// sur la derniere frame on inverse le sens de l'animation
					if (_sprite.reverseAnim) {
						_sprite.currentFrame = _sprite.currentFrame - 1;
						if (_sprite.currentFrame <= 0) {
							_sprite.reverseAnim = false;
						}
						// si derni�re
						if (_sprite.currentFrame >= (currentAnimation.frames.length - 1)) {
							_sprite.reverseAnim = true;
							_sprite.currentFrame = currentAnimation.frames.length - 2;
						}
					} else {
						_sprite.currentFrame = _sprite.currentFrame + 1;
						if (_sprite.currentFrame == currentAnimation.frames.length) {
							_sprite.reverseAnim = true;
							_sprite.currentFrame = currentAnimation.frames.length - 2;
						}
					}
				} else {
					_sprite.currentFrame = _sprite.currentFrame + 1;
					if (_sprite.currentFrame >= (currentAnimation.frames.length - 1)) {
						if (currentAnimation.loop) {
							_sprite.currentFrame = 0;
						} else {
							_sprite.currentFrame = currentAnimation.frames.length - 1;
							if (_sprite.callback != false) {

								_.eraseSprite(_sprite);
								_sprite.callback(_sprite, this);
								return;
							}
						}
					}
				}
			} else {
				_sprite.acDelta += delta;
			}

			// ceinture et bretelle
			if (_sprite.currentFrame >= currentAnimation.frames.length) {
				_sprite.currentFrame = currentAnimation.frames.length - 1;
			}
			_sprite.previousFrame = _sprite.currentFrame;
			_sprite.previousPosition = _sprite.position;
			_.drawFrame(_sprite.currentFrame);
		},
		// dessine une frame
		eraseFrame : function(_frameIndex, _ctx) {
			var _sprite = this.currentSrite;
			var currentAnimation = _sprite.currentAnimation;
			var currentFrame = currentAnimation.frames[_frameIndex];

			var width = currentFrame[2];
			var height = currentFrame[3];
			var offsetX = currentFrame[4];
			var offsetY = currentFrame[5];
			var positionX = _sprite.previousPosition[0] + offsetX * 2;
			var positionY = _sprite.previousPosition[1] - offsetY * 2;
			_ctx.clearRect(positionX - 5, // (this.x * 32) - (this.largeur /
											// 2) + 16,// Point de destination
											// (depend de la taille du
											// personnage)
			positionY - 5, // (this.y * 32) - this.hauteur + 24, // Point de
							// destination (depend de la taille du personnage)
			10 + (width * 2), // Taille du rectangle destination (c'est la
								// taille du personnage)
			10 + (height * 2) // Taille du rectangle destination (c'est la
								// taille du personnage)
			);
			_ctx.clearRect(5, 1, 200, 15);
		},
		// dessine une frame
		drawFrame : function(_frameIndex) {
			var _sprite = this.currentSrite;
			var currentAnimation = _sprite.currentAnimation;
			var currentFrame = currentAnimation.frames[_frameIndex];
			var offsetX = currentFrame[4];
			var offsetY = currentFrame[5];
			var positionX = _sprite.position[0] + offsetX * 2;
			var positionY = _sprite.position[1] - offsetY * 2;
			var width = currentFrame[2];
			var height = currentFrame[3];
			var ctx = this.contextAnimation;
			ctx.fillStyle = "rgba(200,250,200,1)";
			ctx.fillRect(positionX, positionY, width * 2, height * 2);
			ctx.fillStyle = "rgba(1,1,1,.9)";
			ctx.drawImage(currentFrame.canvas, positionX, // (this.x * 32) -
															// (this.largeur /
															// 2) + 16,// Point
															// de destination
															// (depend de la
															// taille du
															// personnage)
			positionY // (this.y * 32) - this.hauteur + 24, // Point de
						// destination (depend de la taille du personnage)
			);

			var text = _frameIndex + "/" + (currentAnimation.frames.length - 1)
					+ " " + currentAnimation.state + "/"
					+ currentAnimation.name + " [" + currentFrame[0] + ","
					+ currentFrame[1] + "," + currentFrame[2] + ","
					+ currentFrame[3] + "," + currentFrame[4] + ","
					+ currentFrame[5] + "]";

			ctx.fillText(text, 5, 10);
		},
		// dessine la frame d'avant en transparent
		drawTransparentFrame : function(_frameIndex) {
			var _sprite = this.currentSrite;
			var currentAnimation = _sprite.currentAnimation;
			var currentFrame = currentAnimation.frames[_frameIndex];
			var offsetX = currentFrame[4];
			var offsetY = currentFrame[5];
			var positionX = _sprite.position[0] + offsetX * 2;
			var positionY = _sprite.position[1] - offsetY * 2;
			var ctx = this.contextOverlay;
			ctx.clearRect(0, // (this.x * 32) - (this.largeur / 2) + 16,//
								// Point de destination (depend de la taille du
								// personnage)
			0, // (this.y * 32) - this.hauteur + 24, // Point de destination
				// (depend de la taille du personnage)
			1000, 1000);
			ctx.globalAlpha = 0.4;
			ctx.drawImage(currentFrame.canvas, positionX, // (this.x * 32) -
															// (this.largeur /
															// 2) + 16,// Point
															// de destination
															// (depend de la
															// taille du
															// personnage)
			positionY // (this.y * 32) - this.hauteur + 24, // Point de
						// destination (depend de la taille du personnage)
			);
		},
		// affichage d'une notification
		preRenderAnimation : function(_currentSprite) {
			var currentAnimations = _currentSprite.animations;

			console.debug("Prerendering " + _currentSprite.id);

			for (var a = 0; a < currentAnimations.length; a++) {
				var currentAnimation = currentAnimations[a];

				console.debug("Prerendering " + _currentSprite.id
						+ ", animation " + currentAnimation.name + "/"
						+ currentAnimation.state);
				var frames = currentAnimation.frames;
				for (var f = 0; f < frames.length; f++) {
					console.debug("Prerendering frame n:" + f);
					var currentFrame = frames[f];

					var spriteX = currentFrame[0];
					var spriteY = currentFrame[1];
					var width = currentFrame[2];
					var height = currentFrame[3];

					var frameCanvas = document.createElement('canvas');
					frameCanvas.width = width * 2;
					frameCanvas.height = height * 2;
					var currentCtx = frameCanvas.getContext('2d');
					currentCtx.webkitImageSmoothingEnabled = false;
					currentCtx.mozImageSmoothingEnabled = false;
					currentCtx.imageSmoothingEnabled = false; // future

					currentCtx.drawImage(_currentSprite.img, spriteX, // Point
																		// d'origine
																		// du
																		// rectangle
																		// source
																		// �
																		// prendre
																		// dans
																		// notre
																		// image
					spriteY, // Point d'origine du rectangle source � prendre
								// dans notre image
					width, // Taille du rectangle source (c'est la taille du
							// personnage)
					height, // Taille du rectangle source (c'est la taille du
							// personnage)
					0, // Point de destination
					0, // Point de destination
					width * 2, // Taille du rectangle destination (c'est la
								// taille du personnage)
					height * 2 // Taille du rectangle destination (c'est la
								// taille du personnage)
					);

					currentFrame["canvas"] = frameCanvas;
				}
				;
			}
			;
		}
	};
	_.init();
	return {
		launch : function(args) {
			if (args.log) {
				console.log(args.log);
			} else if (args.loadImages) {
				_.loadImages(args.loadImages);
			} else if (args.loadAnimations) {
				_.loadAnimations(args.loadAnimations);
			} else if (args.setSurvivorLocation) {
				_.setSurvivorLocation(args.setSurvivorLocation);
			} else if (args.start) {
				_.start(args.start);
			} else if (args.freeze) {
				_.freeze();
			} else if (args.incrementFrame) {
				_.incrementFrame();
			} else if (args.decrementFrame) {
				_.decrementFrame();
			} else if (args.incrementOffsetX) {
				_.incrementOffsetX();
			} else if (args.decrementOffsetX) {
				_.decrementOffsetX();
			} else if (args.incrementOffsetY) {
				_.incrementOffsetY();
			} else if (args.decrementOffsetY) {
				_.decrementOffsetY();
			} else if (args.changeState) {
				_.changeState();
			} else if (args.snapshot) {
				_.snapshot();
			} else if (args.clearSnapshot) {
				_.clearSnapshot();
			} else {
				console.log('function not recognized ');
			}
		}
	};
};

surviveLoaded = true;
var canvasAnimation = document.getElementById("canvasAnimation");
survive = testAnimation(canvasAnimation, true);
survive.launch({
	start : true
});