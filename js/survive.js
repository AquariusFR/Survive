var loaded = false;
var fps = 24;
var baseurl = './';
var surviveImageHost = baseurl + "img/";
// shim layer with setTimeout fallback
window.requestAnimFrame = function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
}();

var global_xOrigin = -10;
var global_yOrigin = -1;

var getSurvive = function(_player, _options, _debug) {
	'use strict';
	var player = _player;
	var debug = _debug;
	var canvasHighlight = false;
	var options = _options;
	var _ = {};

	_ = {
		init: function() {

			var divPlayer = document.createElement('div');
			var canvasBackground = _.createCanvas(options);
			var canvasAnimation = _.createCanvas(options);
			var canvasContextualMenu = _.createCanvas(options);
			var canvasCombat = _.createCanvas(options);
			canvasHighlight = _.createCanvas(options);

			divPlayer.appendChild(canvasBackground);
			divPlayer.appendChild(canvasAnimation);
			divPlayer.appendChild(canvasHighlight);
			divPlayer.appendChild(canvasCombat);
			divPlayer.appendChild(canvasContextualMenu);

			player.appendChild(divPlayer);
			player.style.position = "relative";

			_.contextBackground = canvasBackground.getContext('2d');
			_.contextAnimation = canvasAnimation.getContext('2d');
			_.contextHighlight = canvasHighlight.getContext('2d');
			_.contextMenu = canvasContextualMenu.getContext('2d');
			_.contextCombat = canvasCombat.getContext('2d');
			_.contextBackground.webkitImageSmoothingEnabled = false;
			_.contextBackground.mozImageSmoothingEnabled = false;
			_.contextBackground.imageSmoothingEnabled = false; // future
			_.contextCombat.webkitImageSmoothingEnabled = false;
			_.contextCombat.mozImageSmoothingEnabled = false;
			_.contextCombat.imageSmoothingEnabled = false; // future

			// constructeur function(_htmlElement,
			// _mouseOverCallBack,_mouseMoveCallBack,_mouseOutCallBack,_clickCallBack){
			_.collision = collisionConstructor();
			_.mouseManager = buildMouseManager(canvasContextualMenu,_.checkBounds,_.checkBounds,_.checkBounds,_.click);
			_.hudManager = hudManagerConstructor(this.contextHighlight, this.collision, options);
			_.menuManager = menuManagerConstructor(this.contextMenu, this.hudManager, this.collision, this);
			_.entityFactory = entityFactoryConstructor(this.animations);
		},

		createCanvas: function(_options) {
			var canvas = document.createElement('canvas');
			canvas.width = _options.width;
			canvas.height = _options.height;
			canvas.style.position = "absolute";
			return canvas;
		},

		animations : {},
		options : _options,
		contextBackground: 0,
		contextAnimation: 0,
		contextHighlight: 0,
		contextCombat: 0,
		
		images: {},
		isAllImagesLoaded: false,
		isBoardDrawed: false,
		isSpriteAssigned: false,
		imageToLoad: -1,
		imageLoaded: -1,
		map: {},
		currentFrame: 0,
		survivors: [],
		zombies: [],
		corpses: [],
		zones: [],
		links: 0,
		doors: 0,
		mouseManager: false,
		hudManager:false,
		menuManager:false,
		collision:false,
		entityFactory:false,

		// methode raffraichissant l'animation (les sprites)
		refreshAnimation: function() {
			requestAnimFrame(function() {
				_.refreshAnimation();
			});
			_.refreshAnimationInScope();
		},
		refreshAnimationInScope: function() {
			if (!this.isAllImagesLoaded) {
				console.debug('all images are still not loaded');
				return;
			}
			if (!this.isSpriteAssigned) {
				_.isSpriteAssigned = true;
				_.updateItems();
				_.updatemap();
				_.updateDoors();
				_.updateAnimations();
				return;
			}
			if (!this.isBoardDrawed) {
				console.debug('drawingBoard !');
				_.isBoardDrawed = true;
				_.drawBoard();
				_.drawStaticSprites();
				return;
			}
			_.currentFrame = this.currentFrame + 1;

			if (this.currentFrame == 60) {
				_.currentFrame = 0;
				_.contextAnimation.clearRect(0,0,options.width,options.height);
/*
 * var rect = canvasHighlight.getBoundingClientRect();
 * 
 * console.debug('screen position ' + rect.left + ":" + rect.top); this.contextHighlight.fillRect(8 - rect.left ,8 - rect.top,150,100);
 */
			}

			_.eraseCorpses();
			_.eraseSurvivors();
			_.eraseZombies();
			_.drawCorpses();
			_.drawZombies();
			_.drawSurvivors();
			_.hudManager.launch({drawHUD:true});
			_.menuManager.launch({drawMenu:true});
			_.menuManager.launch({drawInventory:true});
			// _.drawHUD();
			_.drawText();
		},

		getCurrentSurvivor: function(){
			// TODO fonction a modifier une fois que l'on gere plusieurs survivants.
			return this.survivors[0];
		},

		// sauvegarde
		drawText: function() {
			// si il y a un text qui viens d'utre effacer, on
			// supprime le texte
			var textX = options.width / 2;
			var textY = 200;
			if (this.highLightText == false && this.previousHighLightText) {
				_.contextMenu.clearRect(textX, textY - 35, 300, 50);
				_.previousHighLightText = false;
				return;
			}

			if (!this.highLightText) {
				return;
			}
			// on affiche un texte
			_.previousHighLightText = true;
			var textDelta = Date.now() - this.highLightText.ts;
			_.contextMenu.fillStyle = "rgba(0,0,0,1)";
			_.contextMenu.font = "bold 32px 'Segoe UI'";
			// this.contextHighlight.textAlign = 'center';
			_.contextMenu.fillText(this.highLightText.text, textX, textY);

			if (this.highLightText.duration < textDelta) {
				_.highLightText = false;
			}
		},
		notifyImageLoaded: function(_k, _i) {
			_.images[_k] = _i;
			console.debug(_k + '  image loaded');
			_.imageLoaded++;
			if (this.imageLoaded == this.imageToLoad) {
				console.debug('all images ressources loaded');
				_.isAllImagesLoaded = true;
			}
		},
		// affichage d'une notification
		loadImages: function(_imagesToLoad) {

			_.isAllImagesLoaded = false;
			_.imageLoaded = 0;
			_.imageToLoad = Object.keys(_imagesToLoad).length;

			for (var imageKey in _imagesToLoad) {
				var currentUrl = _imagesToLoad[imageKey];
				var img = new Image();
				img.onload = function(_k, _s) {
					_.notifyImageLoaded(_k, _s);
				}(imageKey, img);
				img.src = surviveImageHost + currentUrl;
			}
		},
		// affichage d'une notification
		updateDoors: function() {
			for (var currentDoorKey in this.doors) {
				var currentZoneDoor = this.doors[currentDoorKey];

				for (var i = 0; i < currentZoneDoor.length; i++) {
					var currentDoor = currentZoneDoor[i];
					if (currentDoor.visible != "no") {
						if (currentDoor.status == "open") {
							currentDoor.img = this.images[currentDoor.urlOpen];
						} else {
							currentDoor.img = this.images[currentDoor.urlClosed];
						}

						var doorZone = _.findZoneById(currentDoorKey);
						var zombieX = currentDoor.x + 2 * doorZone.segments[0][0] + 5 + doorZone.offsetX * 500;
						var zombieY = currentDoor.y + 2 * doorZone.segments[0][1] + 5 + doorZone.offsetY * 500;
						currentDoor.x = zombieX;
						currentDoor.y = zombieY;
					}
				}
			}
		},
		// affichage d'une notification
		loadItems: function(_items) {
			_.items = _items;
		},
		// affichage d'une notification
		updateItems: function() {
			var itemsImage = this.images["items"];
			for (var itemSpriteKey in this.items.sprites) {
				var currentSpriteItem = this.items.sprites[itemSpriteKey];
				_.preRenderItem(currentSpriteItem, itemsImage);
			}
		},
		// affichage d'une notification
		preRenderItem: function(_currentSprite, _itemsImage) {
			console.debug("Prerendering " + _currentSprite.id);

			var _position = _currentSprite.position;
			var spriteX = _position[0];
			var spriteY = _position[1];
			var width = _position[2];
			var height = _position[3];

			var itemCanvas = document.createElement('canvas');
			var currentCtx = itemCanvas.getContext('2d');
			currentCtx.webkitImageSmoothingEnabled = false;
			currentCtx.mozImageSmoothingEnabled = false;
			currentCtx.imageSmoothingEnabled = false; // future

			currentCtx.drawImage(
				_itemsImage,
				spriteX,
				spriteY,
				width,
				height,
				0,
				0,
				width,
				height
			);
			_currentSprite.canvas = itemCanvas;
		},
		// setter
		loadAnimations: function(_animations) {
			_.animations = _animations;
		},
		// lance le prerendu de chaque sprite
		updateAnimations: function() {
			for (var animationKey in this.animations) {
				var currentSprite = this.animations[animationKey];
				currentSprite.img = this.images[currentSprite.id];
				_.preRenderAnimation(currentSprite);
			}
		},
		// affichage d'une notification
		preRenderAnimation: function(_currentSprite) {
			var currentAnimations = _currentSprite.animations;

			var growthfactorX = 2;
			var growthfactorY = 2;
			// var growthfactorX = Math.random() * 0.75 + 1.75;
			// var growthfactorY = Math.random() * 0.75 + 1.75;
			
			console.debug("Prerendering " + _currentSprite.id + " growth" + growthfactorX + ":" + growthfactorY);

			for (var a = 0; a < currentAnimations.length; a++) {
				var currentAnimation = currentAnimations[a];

				console.debug("Prerendering " + _currentSprite.id + ", animation " + currentAnimation.name + "/" + currentAnimation.state);
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

					currentCtx.drawImage(
						_currentSprite.img, spriteX, spriteY, width, height, 0, 0, width * growthfactorX, height * growthfactorY
					);

					currentFrame["canvas"] = frameCanvas;
				};
			};
		},
		// affichage d'une notification
		loadMap: function(_mapToLoad) {
			_.map = _mapToLoad;
			_.doors = _mapToLoad.doors;
			_.links = _mapToLoad.links;
			_.hudManager.launch({setLinks:this.links});
		},
		// affichage d'une notification
		updatemap: function() {
			_.zones = [];
			// this.mergedZones = this.map.mergedZones;

			for (var i = 0; i < this.map.lines.length; i++) {
				var currentLine = this.map.lines[i];
				_.loadLine(currentLine, i);
			}
			_.hudManager.launch({setZones:this.zones});
			_.hudManager.launch({setMergedZones:this.map.mergedZones});
		},
		// affichage d'une notification
		loadLine: function(_line, _lineNumber) {
			for (var tileI = 0; tileI < _line.length; tileI++) {
				var currentTile = _line[tileI];
				currentTile.img = this.images[currentTile.url];
				var currentZones = [];

				for (var zoneI = 0; zoneI < currentTile.zones.length; zoneI++) {
					var currentZone = currentTile.zones[zoneI];
					currentZone.offsetX = tileI;
					currentZone.offsetY = _lineNumber;
					currentZones.push(currentZone);
				}
				_.zones.push.apply(this.zones, currentZones);
			}
		},
		start: function() {
			_.hudManager.launch({setZombies:this.zombies});
			_.hudManager.launch({setSurvivors:this.survivors});
			_.menuManager.launch({setCursor:this.images["cursor"]});
			_.refreshAnimation(this);
		},
		setActionLeft: function(_survivor, _actionLeft) {
			_survivor.actions = _actionLeft;
		},
		setSurvivorLocation: function(_survivorLocation) {

			var survivorZone = _.findZoneById(_survivorLocation.location);
			var survivorX = _survivorLocation.position[0] + 2 * survivorZone.segments[0][0] + 5 + survivorZone.offsetX * 500;
			var survivorY = _survivorLocation.position[1] + 2 * survivorZone.segments[0][1] + 5 + survivorZone.offsetY * 500;

			var survivor = _survivorLocation.survivor;
			survivor.zone = survivorZone;
			survivor.position[0] = survivorX;
			survivor.position[1] = survivorY;

			_.survivors.push(survivor);
		},
		setZombieLocation: function(_zombieLocation) {

			var zombieZone = _.findZoneById(_zombieLocation.location);
			var zombieX = _zombieLocation.position[0] + 2 * zombieZone.segments[0][0] + 5 + zombieZone.offsetX * 500;
			var zombieY = _zombieLocation.position[1] + 2 * zombieZone.segments[0][1] + 5 + zombieZone.offsetY * 500;

			var zombie = _zombieLocation.zombie;
			zombie.zone = zombieZone;
			zombie.position[0] = zombieX;
			zombie.position[1] = zombieY;

			_.zombies.push(zombie);
		},
		getAnimation: function(_animations, state) {
			for (var i = 0; i < _animations.length; i++) {
				var currentAnimation = _animations[i];
				if (currentAnimation.state == state) {
					return currentAnimation;
				}
			}
			console.debug("state " + state + " not found");
			return -1;
		},
		// affichage des tuiles
		drawBoard: function() {
			for (var i = 0; i < this.map.lines.length; i++) {
				var currentLine = this.map.lines[i];
				_.drawLine(currentLine, i);
			}
		},
		// affichage d'une notification
		drawLine: function(_line, _lineNumber) {
			for (var column = 0; column < _line.length; column++) {
				var currentTile = _line[column];
				_.drawTile(currentTile, _lineNumber, column);
			}
		},
		// affichage d'une notification
		drawTile: function(_tile, _lineNumber, _column) {
			_.contextBackground.drawImage(_tile.img, 500 * _column + 5, 500 * _lineNumber + 5, 250 * 2, 250 * 2);
			console.debug('drawing image : ' + _tile.img.src + ", pos=" + 500 * _column + 1 + ":" + 500 * _lineNumber + 1);
		},


		// affichage des sprites statiques
		drawStaticSprites: function() {
			_.drawDoors();
		},
		eraseZombies: function() {
			var zombies = this.zombies;
			for (var zombieI = 0; zombieI < zombies.length; zombieI++) {
				var currentZombie = zombies[zombieI];
				if(currentZombie != false)
				{
					_.eraseSprite(currentZombie);
				}
			}
		},
		eraseCorpses: function() {
			var corpses = this.corpses;
			for (var zombieI = 0; zombieI < corpses.length; zombieI++) {
				var currentCorpse = corpses[zombieI];
				if(currentCorpse != false)
				{
					_.eraseSprite(currentCorpse);
				}
			}
		},
		eraseSurvivors: function() {
			for (var zombieI = 0; zombieI < this.survivors.length; zombieI++) {
				var currentSurvivor = this.survivors[zombieI];
				_.eraseSprite(currentSurvivor);
				if (currentSurvivor.moving) {
					_.contextMenu.clearRect(
						currentSurvivor.previousPosition[0] - 15,
						currentSurvivor.previousPosition[1] - 17,
						50,
						50
					);
				}
			}
		},
		drawZombies: function() {
			for (var zombieI = 0; zombieI < this.zombies.length; zombieI++) {
				var currentSurvivor = this.zombies[zombieI];
				_.drawSprite(currentSurvivor, _.drawZombieInfos, _.clearZombieInfos);
			}

			// clean dead survivors
			for (var i = this.zombies.length - 1; i >= 0; i--) {
				if (this.zombies[i] == false) {
					_.zombies.splice(i, 1);
				}
			}
		},
		drawCorpses: function() {
			for (var corpseI = 0; corpseI < this.corpses.length; corpseI++) {
				var currentCorpse = this.corpses[corpseI];
				_.drawSprite(currentCorpse, _.drawSurvivorInfos, _.clearSurvivorInfos);
			}
		},
		drawSurvivors: function() {
			for (var survivorI = 0; survivorI < this.survivors.length; survivorI++) {
				var currentSurvivor = this.survivors[survivorI];
				_.drawSprite(currentSurvivor, _.drawSurvivorInfos, _.clearSurvivorInfos);
			}

			// clean dead survivors
			for (var i = this.survivors.length - 1; i >= 0; i--) {
				if (this.survivors[i] == false) {
					_.survivors.splice(i, 1);
				}
			}
		},
		drawSurvivorInfos: function(currentSurvivor){
			if(_.menuManager.isMenuOpen()){return;}
			var _contextMenu = _.contextMenu;
			var x1 = currentSurvivor.position[0] + 5;
			var y1 = currentSurvivor.position[1] + 48*2;
			var _menuWidth = 200;
			var _menuHeight = 30;

			var actions = currentSurvivor.actions;
			var stamina = currentSurvivor.stamina;
			_contextMenu.save();
			var my_gradient = _contextMenu.createLinearGradient(x1, y1, x1 + _menuWidth, y1 + _menuHeight);
			my_gradient.addColorStop(0, "#005aab");
			my_gradient.addColorStop(1, "#010024");
			_contextMenu.fillStyle = my_gradient;

			_contextMenu.fillRect(x1, y1, _menuWidth, _menuHeight);
			_contextMenu.strokeStyle = "#dcd8cf";
			_contextMenu.lineWidth = 2;
			_contextMenu.strokeRect(x1, y1, _menuWidth, _menuHeight);

			_contextMenu.fillStyle = "#eaece9";
			_contextMenu.font = "bold 12px Arial";

			if(stamina < 1){
				_contextMenu.fillText("DEAD", x1 + 5, y1 + 20);
			}
			else{
				_contextMenu.fillText("HP : " + stamina + "/" + currentSurvivor.staminaMax, x1 + 5, y1 + 20);
				_contextMenu.fillText("AP : " + actions + "/" + currentSurvivor.actionsMax, x1 + 50, y1 + 20);
			}
			_contextMenu.restore();
		},
		clearSurvivorInfos: function(currentSurvivor){

			var x1 = currentSurvivor.position[0] + 4;
			var y1 = currentSurvivor.position[1] - 1 + (48*2);
			var _menuWidth = 202;
			var _menuHeight = 33;

			_.contextMenu.clearRect(x1, y1, _menuWidth, _menuHeight);
		},
		drawZombieInfos: function(currentZombie){

			var _contextMenu = _.contextMenu;
			var x1 = currentZombie.position[0] + 5;
			var y1 = currentZombie.position[1] + 48*2;
			var _menuWidth = 200;
			var _menuHeight = 30;

			var actions = currentZombie.actions;
			var stamina = currentZombie.stamina;
			_contextMenu.save();
			var my_gradient = _contextMenu.createLinearGradient(x1, y1, x1 + _menuWidth, y1 + _menuHeight);
			my_gradient.addColorStop(0, "#009aab");
			my_gradient.addColorStop(1, "#013024");
			_contextMenu.fillStyle = my_gradient;

			_contextMenu.fillRect(x1, y1, _menuWidth, _menuHeight);
			_contextMenu.strokeStyle = "#dcd8cf";
			_contextMenu.lineWidth = 2;
			_contextMenu.strokeRect(x1, y1, _menuWidth, _menuHeight);

			_contextMenu.fillStyle = "#eaece9";
			_contextMenu.font = "bold 12px Arial";

			_contextMenu.fillText("HP : " + stamina, x1 + 5, y1 + 20);
			_contextMenu.fillText("AP : " + actions, x1 + 50, y1 + 20);
			_contextMenu.fillText("Hit : " + currentZombie.damage, x1 + 100, y1 + 20);
			_contextMenu.restore();

		},
		clearZombieInfos: function(currentZombie){

			var x1 = currentZombie.position[0] + 4;
			var y1 = currentZombie.position[1] - 1 + (48*2);
			var _menuWidth = 202;
			var _menuHeight = 33;

			_.contextMenu.clearRect(x1, y1, _menuWidth, _menuHeight);
		},
		drawDoors: function() {
			for (var doorKey in this.doors) {
				var currentZone = this.doors[doorKey];

				for (var i = 0; i < currentZone.length; i++) {
					var door = currentZone[i];

					if (door.visible != "no") {
						_.drawStaticSprite(door);
					}
				};
			}
		},
		drawStaticSprite: function(_sprite) {
			// drawStaticSprite
			if (_sprite == false) {
				return;
			}
			var spriteX = _sprite.x;
			var spriteY = _sprite.y;
			var width = _sprite.w;
			var height = _sprite.h;
			var img = _sprite.img;;
			_.contextBackground.drawImage(
				img,
				spriteX, // Point d'origine du rectangle
						// source u prendre
							// dans notre image
				spriteY, // Point d'origine du rectangle
						// source u prendre
							// dans notre image
				width * 2, // Taille du rectangle source (c'est
						// la taille du
							// personnage)
				height * 2 // Taille du rectangle source (c'est
						// la taille du
							// personnage)
			);
			console.debug('drawing image : ' + img.src + ", pos=" + spriteX + ":" + spriteY);
			console.debug('img : ' + img);
		},
		eraseSprite: function(_sprite) {
			var frameToErase = _sprite.previousFrame;
			if (frameToErase == -1) {
				return;
			}
			var currentAnimation = _sprite.currentAnimation;
			var spriteInfos = this.animations[_sprite.sprite];
			var availableAnimation = spriteInfos.animations;
			if (currentAnimation == -1 || currentAnimation.state != _sprite.state) {
				currentAnimation = _.getAnimation(availableAnimation, _sprite.state);
				_sprite.currentAnimation = currentAnimation;
				if (currentAnimation == -1) {
					console.debug("no animation found");
					return;
				}
			}

			if (frameToErase < 0) {
				frameIndex = 0;
			}
			if (frameToErase > currentAnimation.frames.length - 1) {
				frameToErase = currentAnimation.frames.length - 1;
			}

			var currentSprite = currentAnimation.frames[frameToErase];

			var width = currentSprite[2];
			var height = currentSprite[3];
			var offsetX = currentSprite[4];
			var offsetY = currentSprite[5];
			var positionX = _sprite.previousPosition[0] + offsetX * 2;
			var positionY = _sprite.previousPosition[1] - offsetY * 2;
			_.contextAnimation.clearRect(
				positionX - 5, // (this.x * 32) - (this.largeur
						// / 2) + 16,//
								// Point de
								// destination
								// (depend de la
								// taille du
								// personnage)
				positionY - 5, // (this.y * 32) - this.hauteur
						// + 24, // Point
								// de
								// destination
								// (depend de la
								// taille du
								// personnage)
				10 + width * 2, // Taille du rectangle
							// destination (c'est la
									// taille
									// du
									// personnage)
				10 + height * 2
			);
		},
		drawSprite: function(_sprite, _onMouseOver, _onMouseOut) {
			if (_sprite == false) {
				return;
			}
			var currentAnimation = _sprite.currentAnimation;
			var spriteInfos = this.animations[_sprite.sprite];
			var availableAnimation = spriteInfos.animations;

			if (currentAnimation == -1 || currentAnimation.state != _sprite.state) {
				currentAnimation = _.getAnimation(availableAnimation, _sprite.state);
				_sprite.currentAnimation = currentAnimation;
				if (currentAnimation == -1) {
					console.debug("no animation found");
					return;
				}
			}

			var step = currentAnimation.step;

			var delta = Date.now() - _sprite.lastUpdateTime;
			_sprite.lastUpdateTime = Date.now();
			if (_sprite.acDelta > step) {
				_sprite.acDelta = 0;
				// on passe u l'image suivante

				if (currentAnimation.reverse) {
					// sur la derniere frame on inverse le
					// sens de l'animation
					if (_sprite.reverseAnim) {
						_sprite.currentFrame = _sprite.currentFrame - 1;
						if (_sprite.currentFrame <= 0) {
							_sprite.reverseAnim = false;
						}
						// si derniure
						if (_sprite.currentFrame >= currentAnimation.frames.length - 1) {
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
					if (_sprite.currentFrame >= currentAnimation.frames.length - 1) {
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

			if (_sprite.moving) {
				var speed = _sprite.speed;
				var fromX = _sprite.position[0];
				var fromY = _sprite.position[1];
				var toX = _sprite.to[0];
				var toY = _sprite.to[1];
				if (fromX < toX) {
					fromX = Math.min(toX, (fromX + speed));
				}
				if (fromY < toY) {
					fromY = Math.min(toY, (fromY + speed));
				}
				if (fromX > toX) {
					fromX = Math.max(toX, (fromX - speed));
				}
				if (fromY > toY) {
					fromY = Math.max(toY, (fromY - speed));
				}

				if (fromX == toX && fromY == toY) {
					_sprite.moving = false;
					_sprite.state = "0";
				}
				_sprite.position[0] = fromX;
				_sprite.position[1] = fromY;
			}

			// ceinture et bretelle
			if (_sprite.currentFrame >= currentAnimation.frames.length) {
				_sprite.currentFrame = currentAnimation.frames.length - 1;
			}
			_sprite.previousFrame = _sprite.currentFrame;
			_sprite.previousPosition = _sprite.position;
			var currentFrame = currentAnimation.frames[_sprite.currentFrame];

			var offsetX = currentFrame[4];
			var offsetY = currentFrame[5];
			var positionX = _sprite.position[0] + offsetX * 2;
			var positionY = _sprite.position[1] - offsetY * 2;


			_.contextAnimation.drawImage(
				currentFrame.canvas,
				positionX,
				positionY
			);
			if(_sprite.mouseOver && _sprite.mouseState != "over"){
				_sprite.mouseState = "over";
				_onMouseOver(_sprite);
				console.debug("Mouse over " + _sprite.id);
			} else if(!_sprite.mouseOver && _sprite.mouseState == "over"){
				_onMouseOut(_sprite);
				_sprite.mouseState = false;
				console.debug("Mouse out " + _sprite.id);
			}
		},
		// sauvegarde
		registerMouse: function(evt) {
			mousePos = _.captureMousePos(evt);
		},
		captureMousePos: function(evt) {
			var rect = canvasHighlight.getBoundingClientRect();
			return {
				x: evt.clientX - rect.left,
				y: evt.clientY - rect.top
			};
		},
		survivorsTurn: function() {
			var survivors = _.survivors;
			for (var int = 0; int < survivors.length; int++) {
				var survivor = survivors[int];
				
				if(survivor.stamina > 1)
				{
					survivor.actions = 3;
				}
				else{
					survivor.actions = -1;
				}
			}
		},
		zombiesTurn: function() {
			console.debug('Zombies Turn !');

			_.highLightText = {
				text: "Zombies Turn",
				duration: 800,
				ts: Date.now()
			};


			setTimeout(_.moveZombie, 1200, this)
		},
		moveZombie: function() {
			_.moveZombieInScope();
		},
		moveZombieInScope: function() {
			// check les differentes zones pour reperer les celles avec des zombies
			var zonesToMove = [];
			var zonesToAttack = [];
			var checkedZones = [];

			var hudManager = this.hudManager;
			
			// clone le tableau
			var zones = this.zones.slice();

			while ((zones.length-1)>0) {

				var int = zones.length-1;
				var currentZone = zones[int];
				console.log("checking zone " +currentZone.id);
				var zombiesOfZone = hudManager.zombiesInTargetZone(currentZone);
				var mergedZonesWith=hudManager.getMergedZonesWith(currentZone).slice();
				mergedZonesWith.push(currentZone);
				if(zombiesOfZone.length>0)
				{
					var survivorsOfZone = hudManager.survivorsInTargetZone(currentZone);
					if(survivorsOfZone.length>0){	
						var attackOrder = {
							currentZone: mergedZonesWith,
							zombiesOfZone: zombiesOfZone,
							survivorsOfZone: survivorsOfZone
						};
						
						zonesToAttack.push(attackOrder);
					}
					else{
						zonesToMove.push({
							currentZone: mergedZonesWith,
							zombiesOfZone: zombiesOfZone
						});
					}
				
				}

				// suppression de la zone ainsi que des zones mergees
			    for (var int2 = 0; int2 < mergedZonesWith.length; int2++) {
					var elementToRemove = mergedZonesWith[int2];
					var index = zones.indexOf(elementToRemove);
					if (index > -1) {
						console.log("  removing merged zone " +zones[index].id);
						zones.splice(index, 1);
					}
					
				}
			}
			for (var i = 0; i < zonesToMove.length; i++) {
				var zone = zonesToMove[i];
				_.moveZombieOfZone(zone.currentZone, zone.zombiesOfZone);
			};

			for (var i = 0; i < zonesToAttack.length; i++) {
				var zone = zonesToAttack[i];
				_.zombieAttackSurvivorsOfZone(zone.currentZone, zone.zombiesOfZone, zone.survivorsOfZone);
			};

			_.highLightText = {
				text: "Survivors Turn",
				duration: 1000,
				ts: Date.now()
			};
			_.survivorsTurn();
		},
		isDestinationZoneNotBlockedByADoor: function(_startZone, _endZone) {

			var startZone = _startZone;

			// on va pour le moment le faire arriver u la zone du
			// survivant.
			var endZone = _endZone;


			var zoneDoors = this.doors[startZone.id];
			if (typeof zoneDoors == 'undefined') {
				return true;
			}
			// si une porte separe la zone de depart et celle de
			// destination, on
			// bloque le zombie (le pauvre)
			for (var i = 0; i < zoneDoors.length; i++) {
				if (zoneDoors[i].to == endZone.id) {
					return zoneDoors[i].status == "open";
				}
			}
			return true;
		},
		zombieAttackSurvivorsOfZone: function(_currentZone, _zombies, _survivorsOfZone) {
			// pour le moment, les zombies vont attaquer au hasard
			for (var iAttackingZombie = 0; iAttackingZombie < _zombies.length; iAttackingZombie++) {
				var attackingZombie = _zombies[iAttackingZombie];

				var targetSurvivorI = Math.floor(Math.random() * _survivorsOfZone.length);
				var targetSurvivor = _survivorsOfZone[targetSurvivorI];
				console.debug(attackingZombie.name + ' attack ' + targetSurvivor.name);
				
				targetSurvivor.stamina --;
				
				if(targetSurvivor.stamina<1){
					console.debug(targetSurvivor.name + ' is dead !');
				};
			}
			
		},
		moveZombieOfZone: function(_currentZones, _zombies) {
			if (_zombies.length < 1) {
				console.debug('No zombie in ' + _currentZones.id);
				return;
			}

			var startZone = _currentZones[0];

			// on va pour le moment le faire arriver u la zone du
			// survivant.
			var endZone = this.hudManager.getSelectedZones()[0];

			// on inverse le depart et l'arrivee, car ce qui nous
			// intersse, c'est de connaitre le debut du chemin
			var paths = findPath(endZone.id, startZone.id, this.links);
			// var nextZones = paths[startZone.id];
			var nextZones = [];
			for (var int = 0; int < _currentZones.length; int++) {
				nextZones = paths[_currentZones[int].id];
				if (nextZones.length > 0) { break;}
			}

			if (nextZones.length == 1) {
				// deplacement du groupe de zombie a la case suivante
				var zombieDestination = _.findZoneById(nextZones[0]);

				if (_.isDestinationZoneNotBlockedByADoor(startZone, zombieDestination) == false) {
					console.debug('Zombies in ' + _currentZones.id + ' are blocked by a door ...');
					return;
				}

				for (var i = 0; i < _zombies.length; i++) {
					var zombieToMove = _zombies[i];
					zombieToMove.zone = zombieDestination;
					var zombieX = zombieToMove.position[0];
					var zombieY = zombieToMove.position[1];

					var p1 = _.pointInZone(zombieDestination, {
						x: zombieX,
						y: zombieY
					});
					var p2 = _.pointInZone(zombieDestination, {
						x: (zombieX + 77),
						y: zombieY
					});
					var p3 = _.pointInZone(zombieDestination, {
						x: (zombieX + 77),
						y: (zombieY + 77)
					});
					var p4 = _.pointInZone(zombieDestination, {
						x: zombieX,
						y: (zombieY + 77)
					});

					if (p1 && p2 && p3 && p4) {
						console.debug('sprite wiil be in the zone' + zombieDestination.id);
					} else {
						console.debug('sprite will be outside the zone' + zombieDestination.id);

						if (!p2) {
							zombieX = 2 * zombieDestination.segments[1][0] - 80 + zombieDestination.offsetX * 500 + i * 25;
						}
						if (!p4) {
							zombieY = 2 * zombieDestination.segments[2][1] - 80 + zombieDestination.offsetY * 500;
						}
					}

					zombieToMove.moving = true;
					zombieToMove.state = "3";
					zombieToMove.to[0] = zombieX;
					zombieToMove.to[1] = zombieY;
				}
			} else if (nextZones.length > 1) {
				console.debug('Zombies Separation !');
			} else {
				console.error(' No path ???');
			}

		},
		click: function() {
			_.clickInScope();
		},
		clickInScope: function() {
			var currentSurvivor = _.getCurrentSurvivor();

			// gestion du menu, si ouvert, on s'arrete la.
			if (_.menuManager.isMenuOpen()) {
				_.menuManager.launch({contextualMenuClick:currentSurvivor});
				return
			}
			if (_.menuManager.isInventoryOpen()) {
				var mouse=_.mouseManager.mouse();
				_.menuManager.launch({inventoryClick:{currentSurvivor:currentSurvivor,mouse:mouse}});
				return
			}
			if (_.checkClickExitCase(currentSurvivor)) {
				return
			}

			console.debug('clicked on zone' + this.clickedZone.id);

			var highLightedZones=this.hudManager.getHighLightedZones();
			var selectedZones=this.hudManager.getSelectedZones();
			var clickedOnSelfZone = _.isZoneInArrayZone(highLightedZones, selectedZones);

			// si on click sur une zone distante Et
			// que la zone n'est pas liee a la zone de depart.
			// on sort
			if (clickedOnSelfZone == false && this.hudManager.checkIfSelectedZoneIsLinkedWithHighligtedZone() == false) {
				return;
			}

			var actionToMove = 1 + _.zombiesInZone(selectedZones[0]).length;
			var notBlockedByDoor = _.checkIsBlockedByDoor();
			var moveAvailable = !clickedOnSelfZone && notBlockedByDoor && actionToMove <= currentSurvivor.actions;

			var menuOptions = this.menuManager.launch({buildContextMenu : {currentSurvivor:currentSurvivor, clickedOnSelfZone:clickedOnSelfZone, moveAvailable:moveAvailable, actionToMove:actionToMove, notBlockedByDoor:notBlockedByDoor, clickedZone:this.clickedZone}});
			// si une seule option on l'execute sans ouvrir le menu
			if (menuOptions.length == 1 && moveAvailable) {
				_.moveSurvivor();
				_.decreaseSurvivorActions(currentSurvivor, actionToMove);
				return;
			}
			if (menuOptions.length > 0) {
				var mouse=this.mouseManager.mouse();
				_.menuManager.launch({initializeMenu:mouse});
			}

			_.openingMenu = false;
			_.menuOpen = false;
			return;
		},
		checkIsBlockedByDoor: function() {
			// on check si la zone visee est en communication avec
			// celle
			// selectionee
			var selectedZones = this.hudManager.getSelectedZones();
			for (var i = 0; i < selectedZones.length; i++) {
				if (_.isDestinationZoneNotBlockedByADoor(selectedZones[i], this.clickedZone)) {
					return true;
				}
			}
			return false;
		},
		checkClickExitCase: function(_currentSurvivor) {
			// si aucune zone n'est selectionnee on s'arrete la
			_.clickedZone = this.hudManager.getHighLightedZones()[0];
			if (this.clickedZone == false) {
				console.debug('no zone clicked... Do nothing');
				return true;
			}

			// si au moment du click il n'y a plus d'actions
			// disponible on sort.
			if (_currentSurvivor.actions < 1) {
				console.debug('no more action !');
				_currentSurvivor.actions = 0;
				return true;
			}
			return false;
		},
		isZoneInArrayZone: function(_sourceArrayZone, _arrayZone) {

			for (var sI = 0; sI < _sourceArrayZone.length; sI++) {
				var _zone = _sourceArrayZone[sI];
				for (var i = 0; i < _arrayZone.length; i++) {
					if (_arrayZone[i].id == _zone.id) {
						return true;
					}
				};
			}
			return false;
		},
		decreaseSurvivorActions: function(_survivor, _actionPoint) {
			_survivor.actions = _survivor.actions - _actionPoint;
			if (_survivor.actions < 1) {
				console.debug('no more action !');
				_survivor.actions = 0;
				_.zombiesTurn();
				return;
			}
		},
		zombiesInZones: function(zones) {
			_.hudManager.zombiesInZones(zones);
		},
		// raccourci, a virer
		zombiesInZone: function(currentZone) {
			return this.hudManager.zombiesInTargetZone(currentZone);
		},
		makeNoise: function() {
			console.debug("NOISE !!");
		},
		openDoor: function() {
			_.openDoorInScope();
		},
		openDoorInScope : function() {

			var selectedZones = this.hudManager.getSelectedZones();
			for (var i = 0; i < selectedZones.length; i++) {
				var startZone = selectedZones[i];

				// on va pour le moment le faire arriver u la
				// zone du survivant.
				var endZone = this.clickedZone;
				var zoneDoors = this.doors[startZone.id];
				if (typeof zoneDoors == 'undefined') {
					return;
				}
				// si une porte separe la zone de depart et
				// celle de
				// destination, on bloque le zombie (le pauvre)
				for (var i = 0; i < zoneDoors.length; i++) {
					var currentDoor = zoneDoors[i];
					if (currentDoor.to == endZone.id) {
						if (currentDoor.status == "close") {
							currentDoor.status = "open";
							currentDoor.img = this.images[currentDoor.urlOpen];
							_.drawStaticSprites();
						}
						break;
					}
				}

				// ouverture de la porte dans l'autre sens
				var zoneDoors = this.doors[endZone.id];
				if (typeof zoneDoors == 'undefined') {
					return;
				}
				// si une porte separe la zone de depart et
				// celle de
				// destination, on bloque le zombie (le pauvre)
				for (var i = 0; i < zoneDoors.length; i++) {
					var currentDoor = zoneDoors[i];
					if (currentDoor.to == startZone.id) {
						if (currentDoor.status == "close") {
							currentDoor.status = "open";
							currentDoor.img = this.images[currentDoor.urlOpen];
							_.drawStaticSprites();
						}
						return;
					}
				}
			};
		},
		searchZone: function() {
			_.searchZoneInScope();
		},
		closeDoor: function() {
			_.closeDoorInScope();
		},
		moveSurvivor: function() {
			_.moveSurvivorInScope();
		},
		searchZoneInScope: function() {
			var mousePos=this.mouseManager.mouse();
			_.openingMenuFrame = 0;
			_.menuPosition.x = mousePos.x - 5;
			_.menuPosition.y = mousePos.y - 5;
			_.menuOptions = [{
				name: "Found [ITEM]",
				onlyText: true
			}, {
				name: "Take",
				action: function() {
					console.debug("Take something");
				},
				actionPoint: 0
			}, {
				name: "Discard",
				action: function() {
					console.debug("Discard something");
				},
				actionPoint: 0
			}];
			_.openingMenu = true;
			_.menuOpen = true;
		},
		closeDoorInScope: function() {
			var selectedZones = this.hudManager.getSelectedZones();
			for (var i = 0; i < selectedZones.length; i++) {
				var startZone = selectedZones[i];

				// on va pour le moment le faire arriver u la
				// zone du survivant.
				var endZone = this.clickedZone;
				var zoneDoors = this.doors[startZone.id];
				if (typeof zoneDoors == 'undefined') {
					console.debug("WTF ? There is no doors to close !");
					return;
				}
				// si une porte separe la zone de depart et
				// celle de
				// destination, on bloque le zombie (le pauvre)
				for (var i = 0; i < zoneDoors.length; i++) {
					var currentDoor = zoneDoors[i];
					if (currentDoor.to == endZone.id) {
						if (currentDoor.status == "open") {
							currentDoor.status = "close";
							currentDoor.img = this.images[currentDoor.urlClosed];
							_.drawStaticSprites();
						}
						return;
					}
				}
				console.debug("WTF ? There is no doors to open !");
			}
		},
		moveSurvivorInScope: function() {
			// deplacement
			var mousePos=this.mouseManager.mouse();

			var survivorX = mousePos.x;
			var survivorY = mousePos.y;


			var destinationZone = this.clickedZone;
			var p1 = _.pointInZone(destinationZone, {
				x: survivorX,
				y: survivorY
			});
			var p2 = _.pointInZone(destinationZone, {
				x: (survivorX + 77),
				y: survivorY
			});
			var p3 = _.pointInZone(destinationZone, {
				x: (survivorX + 77),
				y: (survivorY + 77)
			});
			var p4 = _.pointInZone(destinationZone, {
				x: survivorX,
				y: (survivorY + 77)
			});

			if (p1 && p2 && p3 && p4) {
				console.debug('sprite wiil be in the zone' + destinationZone.id);
			} else {
				console.debug('sprite will be outside the zone' + destinationZone.id);

				if (!p2) {
					survivorX = 2 * destinationZone.segments[1][0] - 80 + destinationZone.offsetX * 500;
				}
				if (!p4) {
					survivorY = 2 * destinationZone.segments[2][1] - 80 + destinationZone.offsetY * 500;
				}
			}

			var currentSurvivor=_.getCurrentSurvivor();
			currentSurvivor.moving = true;
			currentSurvivor.state = "0";
			currentSurvivor.to[0] = survivorX;
			currentSurvivor.to[1] = survivorY;
			currentSurvivor.zone = destinationZone;
			// mise a jour de la zone selectionnee
			_.hudManager.setSelectedZoneById(destinationZone.id);
		},
		attackZombiesOfZone: function() {
			_.attackZombiesOfZoneInScope();
		},
		attackZombiesOfZoneInScope: function() {
			var currentSurvivor=_.getCurrentSurvivor();
			var items = currentSurvivor.inventory.list();
			var equiped = currentSurvivor.equiped;
			if(equiped.length <1){
				// peut pas attaquer ...
				
			} else if(equiped.length == 1){
				// ataque directement avec la première arme
				var weaponIndex = equiped[0];
				var weapon = items[weaponIndex];
				_.attackZombiesOfZoneWithWeapon(weapon)
			} else {
				// doit choisir l'arme
				var mousePos=this.mouseManager.mouse();
				_.menuManager.launch({chooseWeaponMenu :{mousePos:mousePos, equiped:equiped, items:items}});
			}
		},
		attackZombiesOfZoneWithWeapon: function(weapon) {
			var zombiesOfZone = _.zombiesInZone(this.clickedZone);
			
			var dices = Math.min(zombiesOfZone.length, weapon.dicesRanged);
			var minDiceResult = weapon.minDiceRanged;
			var currentSurvivor=_.getCurrentSurvivor();
			console.debug(currentSurvivor.name + ' attack ' + this.clickedZone.id + " with " + weapon.getName());
			
			// boucle à timeout
			(function attackLoop(i, _this, minDiceResult, currentSurvivor, zombiesOfZone) {          
				   setTimeout(function () {
						var spriteX = 10, spriteY = 11;
						var width = 37, height =7;
						var posX = currentSurvivor.position[0]+5, posY = currentSurvivor.position[1] - 10;
						_.contextCombat.drawImage(_this.images["attack"],
								spriteX,
								spriteY,
								width,
								height,
								posX,
								posY,
								width,
								height);
						var currentZombie = zombiesOfZone[i];

						var diceResult = Math.floor(Math.random() * 6 + 1);

						console.log("attacking " + currentZombie.name);
						console.log("dice roll on " + diceResult);

						if (diceResult >= minDiceResult) {
							_.killZombie(currentZombie, i);
						} else {
							_.missZombie(currentZombie, i);
						}
						// decrement i and call myLoop again if i > 0
						i--;
						if (i>-1){
							attackLoop(i, _this, minDiceResult, currentSurvivor, zombiesOfZone);
						}
				   }, Math.floor(Math.random() * 500 + 1));
				})(dices-1, this, minDiceResult, currentSurvivor, zombiesOfZone);
		},

		eraseCombatTextMiss: function(_zombie) {
			var width = 21, height =7;
			var posX = _zombie.position[0]+20, posY = _zombie.position[1] - 10;
			_.contextCombat.clearRect(
					posX,
					posY,
					width,
					height);
			console.log("erase miss text ");
			var currentSurvivor=_.getCurrentSurvivor();
			width = 37, height =7;
			posX = currentSurvivor.position[0]+5, posY = currentSurvivor.position[1] - 10;
			_.contextCombat.clearRect(
					posX,
					posY,
					width,
					height);
		},

		displayCombatTextMiss: function(_zombie) {
			var spriteX = 10, spriteY = 20;
			var width = 21, height =7;
			var posX = _zombie.position[0]+20, posY = _zombie.position[1] - 10;
			_.contextCombat.drawImage(_.images["attack"],
					spriteX,
					spriteY,
					width,
					height,
					posX,
					posY,
					width,
					height);
			console.log("display miss text ");
			setTimeout(_.eraseCombatTextMiss, 500, _zombie);
		},

		eraseCombatTextHit: function(_zombie) {
			var width = 17, height =7;
			var posX = _zombie.position[0]+20, posY = _zombie.position[1] - 10;
			_.contextCombat.clearRect(
					posX,
					posY,
					width,
					height);
			console.log("erase miss text ");
			var currentSurvivor=_.getCurrentSurvivor();
			width = 37, height =7;
			posX = currentSurvivor.position[0]+5, posY = currentSurvivor.position[1] - 10;
			_.contextCombat.clearRect(
					posX,
					posY,
					width,
					height);
		},
		displayCombatTextHit: function(_zombie) {
			var spriteX = 40, spriteY = 22;
			var width = 17, height =7;
			var posX = _zombie.position[0]+20, posY = _zombie.position[1] - 10;
			_.contextCombat.drawImage(_.images["attack"],
					spriteX,
					spriteY,
					width,
					height,
					posX,
					posY,
					width,
					height);
			console.log("display kill text ");
			setTimeout(_.eraseCombatTextHit, 500, _zombie);
			_zombie.state = 0;
			// lance l'animation de mort en decalle des morts.
			_.delayed_DyingAnimation(_zombie, this);
		},
		missZombie: function(_zombie) {
			console.log("HEAD SHiiiit ! Missed ... ");
			setTimeout(_.displayCombatTextMiss, 500, _zombie);
		},
		killZombie: function(_zombie) {
			console.log("HEAD SHOT !!! ");
			
			_.corpses.push(_zombie);
			_.eraseSurvivors();

			var index = _.zombies.indexOf(_zombie);

			_.zombies[index] = false;
			setTimeout(_.displayCombatTextHit, 500, _zombie);
		},
		delayed_DyingAnimation: function(_z, context) {
			console.debug(_z.name + " dying");
			_z.callback = _.delayed_DieAnimation;
			_z.state = 1;
			
		},
		delayed_DieAnimation: function(_z, context) {
			_z.state = 2;
			_z.callback = false;
			console.debug(_z.name + " is dead ... again");
			
		},
		checkBounds: function() {
			_.checkBoundsInScope();
		},
		checkBoundsInScope: function() {
			var mousePos=this.mouseManager.mouse();

			if (this.menuManager.isMenuOpen()) {
				// _.checkBoundsForMenu(mousePos);
				_.menuManager.launch({checkBoundsForMenu:mousePos});
			} else if(this.menuManager.isInventoryOpen()){
				// _.checkBoundsForInventory(mousePos);
				_.menuManager.launch({checkBoundsForInventory:mousePos});
			} else {
				_.hudManager.launch({checkBoundsForZones:mousePos});
			}
		},
		findZombieById: function(_zombieId) {
			for (var i = 0; i < this.zombies.length; i++) {
				var currentZombie = this.zombies[i];
				if (currentZombie.id == _zombieId) {
					return currentZombie;
				}
			}
			return false;
		},
		// raccourci vers la fonction du hudManager
		findZoneById: function(_zoneId) {
			return this.hudManager.findZoneById(_zoneId);
		},
		// raccourci vers la fonction du hudManager
		// TODO a virer
		pointInZone: function(_currentZone, _pointPos) {
			return this.hudManager.pointInZone(_currentZone, _pointPos);
		},
		// raccourci vers la fonction du hudManager
		// TODO a virer
		pointInRectangle: function(currentRectangle, _pointPos) {
			return this.collision.pointInRectangle(currentRectangle, _pointPos);

		},
		// TODO a virer
		lineIntersect: function(x1, y1, x2, y2, x3, y3, x4, y4) {
			return this.collision.lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4);
		}
	};
	_.init();
	return {
		launch: function(args) {
			if (args.log) {
				console.debug(args.log);
			} else if (args.loadImages) {
				_.loadImages(args.loadImages);
			} else if (args.loadMap) {
				_.loadMap(args.loadMap);
			} else if (args.loadAnimations) {
				_.loadAnimations(args.loadAnimations);
			} else if (args.getEntityFactory) {
				return _.entityFactory;
			} else if (args.loadItems) {
				_.loadItems(args.loadItems);
			} else if (args.setSurvivorLocation) {
				_.setSurvivorLocation(args.setSurvivorLocation);
			} else if (args.setZombieLocation) {
				_.setZombieLocation(args.setZombieLocation);
			} else if (args.setSelectedZone) {
				_.hudManager.setSelectedZoneById(args.setSelectedZone);
			} else if (args.setActionLeft) {
				_.setActionLeft(args.setActionLeft.survivor, args.setActionLeft.actionLeft);
			} else if (args.start) {
				_.start(args.start);
			} else if (args.getCurrentSurvivor) {
				return _.getCurrentSurvivor();
			} else {
				console.debug('function not recognized ');
			}
		}
	};
};

surviveLoaded = true;

