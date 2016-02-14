var collisionConstructor = function() {
	'use strict';
	// scope privé

	var _ = {};
	_ = {
		pointInRectangle : function(currentRectangle, _pointPos) {
			var rectX = currentRectangle.x;
			var rectY = currentRectangle.y;
			var rectWidth = currentRectangle.width;
			var rectHeight = currentRectangle.height;

			var pA = {
				x : rectX,
				y : rectY
			};
			var pB = {
				x : rectX + rectWidth,
				y : rectY
			};
			var pC = {
				x : rectX + rectWidth,
				y : rectY + rectHeight
			};
			var pD = {
				x : rectX,
				y : rectY + rectHeight
			};

			var intersectionCount = 0;

			// AB
			if (_.isSegmentIntersectMouse(pA, pB, _pointPos)) {
				intersectionCount++;
			}
			// BC
			if (_.isSegmentIntersectMouse(pB, pC, _pointPos)) {
				if (intersectionCount == 1) {
					return false;
				}
				intersectionCount++;
			}
			// CD
			if (_.isSegmentIntersectMouse(pC, pD, _pointPos)) {
				if (intersectionCount == 1) {
					return false;
				}
				intersectionCount++;
			}
			// DA
			if (_.isSegmentIntersectMouse(pD, pA, _pointPos)) {
				if (intersectionCount == 1) {
					return false;
				}
				intersectionCount++;
			}

			return intersectionCount == 1;

		},
		isSegmentIntersectMouse: function(p1, p2, _pointPos) {
			var xMouse = _pointPos.x;
			var yMouse = _pointPos.y;
			return _.lineIntersect(p1.x, p1.y, p2.x, p2.y, xMouse, yMouse, global_xOrigin, global_yOrigin);
		},
		lineIntersect : function(x1, y1, x2, y2, x3, y3, x4, y4) {
			var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
			var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
			if (isNaN(x) || isNaN(y)) {
				return false;
			} else {
				if (x1 >= x2) {
					if (!(x2 <= x && x <= x1)) {
						return false;
					}
				} else {
					if (!(x1 <= x && x <= x2)) {
						return false;
					}
				}
				if (y1 >= y2) {
					if (!(y2 <= y && y <= y1)) {
						return false;
					}
				} else {
					if (!(y1 <= y && y <= y2)) {
						return false;
					}
				}
				if (x3 >= x4) {
					if (!(x4 <= x && x <= x3)) {
						return false;
					}
				} else {
					if (!(x3 <= x && x <= x4)) {
						return false;
					}
				}
				if (y3 >= y4) {
					if (!(y4 <= y && y <= y3)) {
						return false;
					}
				} else {
					if (!(y3 <= y && y <= y4)) {
						return false;
					}
				}
			}
			return true;
		}
	};
	return {
		launch : function(args) {
			if (args.log) {
				console.debug("hudManager" + args.log);
			} else {
				console.debug('function not recognized ');
			}
		},
		lineIntersect : function(_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4) {
			return _.lineIntersect(_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4)
		},
		pointInRectangle : function(_currentRectangle, _pointPos) {
			return _.pointInRectangle(_currentRectangle, _pointPos)
		}
	};
}

collision = true;