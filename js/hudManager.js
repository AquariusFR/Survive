var hudManagerConstructor = function(_canvasContext, _collision, _options) {
	'use strict';
	var canvasContext = _canvasContext;
	var collision = _collision;
	var options = _options;
	// scope privé
	var _ = {};

	_ = {
		zones : [],
		mergedZones : [],
		highLightedZone : -1,
		highLightedZones : [],
		previousHighLightedZones : [],
		highLightText : false,
		previousHighLightText : true,
		selectedZones : [],
		previousSelectedZones : [],
		links : [],
		zombies: [],
		survivors: [],

		getHighlightedZone : function(_mousePos) {
			for (var i = 0; i < _.zones.length; i++) {

				var currentZone = _.zones[i];
				if (currentZone.segments.length <= 2) {
					console.error("Zone " + currentZone.id + " is misconfigured, it must have 3 or more segment.");
				}
				var currentZoneContainsMouse = _.pointInZone(currentZone, _mousePos);
				if (currentZoneContainsMouse) {
					return currentZone;
				}
			}
			return false;
		},
		drawHUD : function() {
			_.drawZones();
		},
		drawZones : function() {
			// si il n'y a pas de zone survolee
			if (_.highLightedZone == -1) {
				if (_.previousHighLightedZones.length > 0) {
					_.eraseZones(_.previousHighLightedZones);
				}

				_.previousHighLightedZones = [];

				_.drawSelected();
				return;
			}

			_.highLightedZones = _.getMergedZonesWith(_.highLightedZone);
			_.highLightedZones.push(_.highLightedZone);

			// OU
			// si la zone survolee est comprise dans les zones
			// selectionnees
			// on n'affiche que la zone selectionnee
			var selectedZones = _.selectedZones;
			if (_.highLightedZones[0] == selectedZones[0]) {
				_.drawSelected();
				return;
			}
			var linkedWithSelectedZone = false;
			// on check si la zone visee est en communication avec
			// celle
			// selectionee
			for (var i = 0; i < selectedZones.length; i++) {
				for (var j = 0; j < _.highLightedZones.length; j++) {
					if (_.isZoneACommunicateWithB(selectedZones[i], _.highLightedZones[j])) {
						linkedWithSelectedZone = true;
					}
				}
			}

			var fillColor = "rgba(210,100,0,0.5)";

			if (linkedWithSelectedZone) {
				fillColor = "rgba(100,210,0,0.5)";
			}

			_.drawSelected();
			_.drawOver(fillColor);
		},
		fillZones : function(zones, fillColor) {
			if (zones.length < 1) {
				return;
			}

			var _canvasContext = canvasContext;

			_canvasContext.restore();

			for (var i = 0; i < zones.length; i++) {
				var currentZone = zones[i];
				_canvasContext.beginPath();

				_canvasContext.moveTo(2 * currentZone.segments[0][0] + 5 + currentZone.offsetX * 500, 2 * currentZone.segments[0][1] + 5 + currentZone.offsetY * 500);

				for (var k = 1; k < currentZone.segments.length; k++) {
					var x1 = 2 * currentZone.segments[k][0] + 5 + currentZone.offsetX * 500;
					var y1 = 2 * currentZone.segments[k][1] + 5 + currentZone.offsetY * 500;
					_canvasContext.lineTo(x1, y1);
				}
				_canvasContext.closePath();
				_canvasContext.fillStyle = fillColor;
				_canvasContext.fill();

				_canvasContext.fillStyle = "rgba(0,0,0,1)";
				_canvasContext.font = "12px Arial";
				_canvasContext.fillText(currentZone.id, 2 * currentZone.segments[1][0] - 25 + currentZone.offsetX * 500, 2 * currentZone.segments[1][1] + 25 + currentZone.offsetY * 500);
			}

		},
		// sauvegarde
		drawOver : function(_fillColor) {
			// si les zones survolees sont les memes que celle
			// d'avant on ne
			// fait rien
			var _previousHighLightedZones = _.previousHighLightedZones;
			var _highLightedZones = _.highLightedZones;
			if (_previousHighLightedZones.length > 0 && _highLightedZones[0] == _previousHighLightedZones[0]) {
				return;
			}
			if (_previousHighLightedZones.length > 0) {
				_.eraseZones(_previousHighLightedZones);
			}
			_.eraseZones(_highLightedZones);
			_.fillZones(_highLightedZones, _fillColor);
			_.previousHighLightedZones = _highLightedZones;
		},
		// sauvegarde
		drawSelected : function() {
			// si les zones survolees sont les memes que celle
			// d'avant on ne
			// fait rien
			if (_.previousSelectedZones.length > 0 && _.selectedZones[0].id == _.previousSelectedZones[0].id) {
				return;
			}
			if (_.previousSelectedZones.length > 0) {
				_.eraseZones(_.previousSelectedZones);
			}
			_.eraseZones(_.selectedZones);
			_.fillZones(_.selectedZones, "rgba(100,310,0,0.1)");
			_.previousSelectedZones = _.selectedZones;
		},
		// sauvegarde
		eraseZones : function(_erasedZones) {
			// _.fillZones(_highLightedMergedZones, _fillColor);
			for (var i = 0; i < _erasedZones.length; i++) {
				var currentZone = _erasedZones[i];

				var minX1 = options.width + 1;
				var minY1 = options.height + 1;
				var maxX2 = 0;
				var maxY2 = 0;

				for (var j = 0; j < currentZone.segments.length; j++) {
					var currentSegment = currentZone.segments[j];
					var x1 = 2 * currentSegment[0] + 5 + currentZone.offsetX * 500;
					var y1 = 2 * currentSegment[1] + 5 + currentZone.offsetY * 500;

					minX1 = Math.min(x1, minX1);
					minY1 = Math.min(y1, minY1);
					maxX2 = Math.max(x1, maxX2);
					maxY2 = Math.max(y1, maxY2);
				};

				canvasContext.clearRect(minX1, minY1, maxX2 - minX1, maxY2 - minY1);
			}
		},
		checkBoundsForZones : function(mousePos) {
			var currentZone = _.getHighlightedZone(mousePos);
			if (currentZone == false) {
				// Aucune zone selectionnee
				_.highLightedZone = -1;
				return;
			}
			
			var entities = [];
			entities = entities.concat(_.zombies);
			entities = entities.concat(_.survivors);
			
			_.checkEntityBounds(currentZone, mousePos, entities);
			
			if (_.highLightedZone.id == currentZone.id) {
				return;
			}
			_.highLightedZone = currentZone;
		},
		checkEntityBounds : function(_currentZone, _mousePos, _entities) {

			var entities = _entities;
			var length = entities.length;
			for (var int = 0; int < length; int++) {
				var currentEntity = entities[int];
				if(currentEntity.zone == _currentZone){
					
					var currentRectangle = {
							x : currentEntity.position[0],
							y : currentEntity.position[1],
							width : 48*2,
							height : 48*2
					}
					currentEntity.mouseOver = collision.pointInRectangle(currentRectangle, _mousePos);
				} else {
					currentEntity.mouseOver = false;
				}
			}
		},
		setZones : function(_zones) {
			_.zones = _zones;
		},
		findZoneById : function(_zoneId) {
			for (var i = 0; i < _.zones.length; i++) {
				var currentZone = _.zones[i];
				if (currentZone.id == _zoneId) {
					return currentZone;
				}
			}
		},
		setLinks : function(_links) {
			_.links = _links;
		},
		contains : function(a, obj) {
			for (var i = 0; i < a.length; i++) {
				if (a[i] === obj) {
					return true;
				}
			}
			return false;
		},
		setMergedZones : function(_mergedZones) {
			_.mergedZones = _mergedZones;
		},
		pointInZone : function(currentZone, _pointPos) {
			var xMouse = _pointPos.x;
			var yMouse = _pointPos.y;
			var currentZoneContainsMouse = false;
			var intersectionCount = 0;
			// check chaque segments
			for (var j = 0; j < currentZone.segments.length; j++) {

				var x1 = currentZone.segments[j][0] * 2 + currentZone.offsetX * 500;
				var y1 = currentZone.segments[j][1] * 2 + currentZone.offsetY * 500;
				var x2;
				var y2;
				if (j == currentZone.segments.length - 1) {
					x2 = currentZone.segments[0][0] * 2 + currentZone.offsetX * 500;
					y2 = currentZone.segments[0][1] * 2 + currentZone.offsetY * 500;
				} else {
					x2 = currentZone.segments[j + 1][0] * 2 + currentZone.offsetX * 500;
					y2 = currentZone.segments[j + 1][1] * 2 + currentZone.offsetY * 500;
				}
				var isLineIntersected = collision.lineIntersect(x1, y1, x2, y2, xMouse, yMouse, global_xOrigin, global_yOrigin);
				if (isLineIntersected) {
					if (intersectionCount > 0) {
						return false;
					}
					currentZoneContainsMouse = true;
					intersectionCount++;
				}
			}
			return currentZoneContainsMouse;
		},
		getHighLightedZones : function() {
			return _.highLightedZones;
		},
		getSelectedZones : function() {
			return _.selectedZones;
		},
		getMergedZonesWith : function(sourceZone) {
			if (sourceZone == -1) {
				return -1;
			}
			// check si la zone est mergee
			var mergedZones = [];
			for (var k = 0; k < _.mergedZones.length; k++) {
				var merge = _.mergedZones[k];
				if (merge.zoneA == sourceZone.id) {
					mergedZones.push(_.findZoneById(merge.zoneB));
				} else if (merge.zoneB == sourceZone.id) {
					mergedZones.push(_.findZoneById(merge.zoneA));
				}
			}
			return mergedZones;
		},
		setSelectedZoneById : function(_selectedZoneId) {
			for (var i = 0; i < _.zones.length; i++) {
				if (_.zones[i].id == _selectedZoneId) {
					var _selectedZone = _.zones[i];
					var mergedSelectedZone = _.getMergedZonesWith(_.zones[i]);
					_.selectedZones = mergedSelectedZone;
					_.selectedZones.unshift(_selectedZone);
					return;
				}
			}
		},
		checkIfSelectedZoneIsLinkedWithHighligtedZone: function() {
			// on check si la zone visee est en communication avec
			// celle
			// selectionee
			var selectedZones = _.getSelectedZones();
			for (var i = 0; i < selectedZones.length; i++) {
				var highLightedZones = _.getHighLightedZones();
				for (var j = 0; j < highLightedZones.length; j++) {
					if (_.isZoneACommunicateWithB(selectedZones[i], highLightedZones[j])) {

						return true;
					}
				}
			};
			return false;
		},
		isZoneACommunicateWithB : function(zoneA, zoneB) {
			if (zoneA == -1 || zoneB == -1) {
				return false;
			}
			if (zoneA.id == zoneB.id) {
				return false;
			}

			var linkedZones = _.links[zoneA.id];
			var linkedWithSelectedZone = _.contains(linkedZones, zoneB.id);
			return linkedWithSelectedZone;
		},
		setZombies : function(_zombies) {
			_.zombies = _zombies;
		},
		setSurvivors : function(_survivors) {
			_.survivors = _survivors;
		},
		zombiesInTargetZone : function(currentZone) {
			var mergedZonesWith = _.getMergedZonesWith(currentZone)
			mergedZonesWith.push(currentZone);
			return _.zombiesInZones(mergedZonesWith);
		},
		survivorsInTargetZone : function(currentZone) {
			var mergedZonesWith = _.getMergedZonesWith(currentZone)
			mergedZonesWith.push(currentZone);
			return _.survivorsInZones(mergedZonesWith);
		},
		survivorsInZones : function(zones) {
			var zombiesOfZones = [];
			for (var i = 0; i < zones.length; i++) {
				var zombiesOfZone = _.getSurvivorsOfZone(zones[i]);
				zombiesOfZones = zombiesOfZones.concat(zombiesOfZone);
			};
			return zombiesOfZones;
		},
		zombiesInZones : function(zones) {
			var zombiesOfZones = [];
			for (var i = 0; i < zones.length; i++) {
				var zombiesOfZone = _.getZombiesOfZone(zones[i]);
				zombiesOfZones = zombiesOfZones.concat(zombiesOfZone);
			};
			return zombiesOfZones;
		},
		getZombiesOfZone : function(currentZone) {
			var zoneId = currentZone.id;
			var otherZone = "";
			var zombiesOfZone = [];

			// TODO referencer les zombies DANS les zones
			for (var i = 0; i < _.zombies.length; i++) {
				var zombieZoneId = _.zombies[i].zone.id;
				if (zombieZoneId == zoneId) {
					zombiesOfZone.push(_.zombies[i]);
				}
			}
			return zombiesOfZone;
		},
		getSurvivorsOfZone : function(currentZone) {
			var zoneId = currentZone.id;
			var otherZone = "";
			var survivorsOfZone = [];

			// TODO referencer les zombies DANS les zones
			var survivors = _.survivors;
			for (var i = 0; i < survivors.length; i++) {
				var currentSurvivor = survivors[i];
				var survivorZoneId = currentSurvivor.zone.id;
				if (survivorZoneId == zoneId) {
					survivorsOfZone.push(currentSurvivor);
				}
			}
			return survivorsOfZone;
		},
	};
	return {
		launch : function(args) {
			if (args.log) {
				console.debug("hudManager" + args.log);
			} else if (args.drawHUD) {
				_.drawHUD();
			} else if (args.checkBoundsForZones) {
				_.checkBoundsForZones(args.checkBoundsForZones);
			} else if (args.setZones) {
				_.setZones(args.setZones);
			} else if (args.setLinks) {
				_.setLinks(args.setLinks);
			} else if (args.setMergedZones) {
				_.setMergedZones(args.setMergedZones);
			} else if (args.getMergedZonesWith) {
				return _.getMergedZonesWith(args.getMergedZonesWith);
			} else if (args.setZombies) {
				return _.setZombies(args.setZombies);
			} else if (args.setSurvivors) {
				return _.setSurvivors(args.setSurvivors);
			} else {
				console.debug('function not recognized ');
			}
		},
		pointInZone : function(_currentZone, _pointPos) {
			return _.pointInZone(_currentZone, _pointPos);
		},
		setSelectedZoneById : function(_selectedZoneId) {
			return _.setSelectedZoneById(_selectedZoneId);
		},
		findZoneById : function(_zoneId) {
			return _.findZoneById(_zoneId);
		},
		getHighLightedZones : function() {
			return _.getHighLightedZones();
		},
		getSelectedZones : function() {
			return _.getSelectedZones();
		},
		zombiesInZones : function(zones) {
			return _.zombiesInZones(zones);
		},
		zombiesInTargetZone : function(targetZone) {
			return _.zombiesInTargetZone(targetZone);
		},
		survivorsInTargetZone : function(targetZone) {
			return _.survivorsInTargetZone(targetZone);
		},
		checkIfSelectedZoneIsLinkedWithHighligtedZone: function() {
			return _.checkIfSelectedZoneIsLinkedWithHighligtedZone();
		},
		getMergedZonesWith : function(sourceZone){
			return _.getMergedZonesWith(sourceZone);
		}
	};
}

hudManager = true;