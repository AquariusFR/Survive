var extendClass = function(child, parent) {
	var S = function() {};
	S.prototype = parent.prototype;
	child.prototype = new S();
};

var Item = function() {};
var Weapon = function() {};

Item.prototype.id = -1;
Item.prototype.sprite = -1;
Item.prototype.name = -1;
Item.prototype.type = -1;

Weapon.prototype.openDoor = false;
Weapon.prototype.mixedMode = false;
Weapon.prototype.soundOnOpen = false;
Weapon.prototype.soundOnAttack = false;

Weapon.prototype.range = -1;

Weapon.prototype.damageRanged = -1;
Weapon.prototype.dicesRanged = -1;
Weapon.prototype.minDiceRanged = -1;

Weapon.prototype.damageClose = -1;
Weapon.prototype.dicesClose = -1;
Weapon.prototype.minDiceClose = -1;

Item.prototype.getName = function() {
	return this.name;
};
Item.prototype.getSprite = function() {
	return this.sprite;
};
Item.prototype.getType = function() {
	return this.type;
};
Item.prototype.setName = function(_name) {
	this.name = _name;
};
Item.prototype.setSprite = function(_sprite) {
	this.sprite = _sprite;
};
Item.prototype.setType = function(_type) {
	this.type = _type;
};

var ItemFactory = function() {
		var _ = {};
	_ = {
		currentID: 0,
		createWeapon: function(name, sprite, openDoor, soundOnOpen, soundOnAttack, _mixed, range, damageRanged, dicesRanged, minDiceRanged, damageClose, dicesClose, minDiceClose) {
			var currentWeapon = new Weapon();
			currentWeapon.setName(name);
			currentWeapon.setSprite(sprite);
			currentWeapon.setType("weapon");
			currentWeapon.openDoor = openDoor;
			currentWeapon.soundOnOpen = soundOnOpen;
			currentWeapon.soundOnAttack = soundOnAttack;
			currentWeapon.damageRanged = damageRanged;
			currentWeapon.range = range;
			currentWeapon.dicesRanged = dicesRanged;
			currentWeapon.minDiceRanged = minDiceRanged;
			currentWeapon.damageClose = damageClose;
			currentWeapon.dicesClose = dicesClose;
			currentWeapon.minDiceClose = minDiceClose;
			currentWeapon.mixedMode = _mixed;
			currentWeapon.id = _.currentID++;
			_.currentID++;
			return currentWeapon;
		},
		createItem: function(name, sprite) {
			var currentItem = new Item();
			currentItem.setName(name);
			currentItem.setSprite(sprite);
			currentItem.setType("item");
			currentItem.id = _.currentID++;
			return currentItem;
		}
	};

	return {
		create9mm: function() {
			return _.createWeapon("9mm", "9mm", false, false, true, false, 1, 1, 1, 4, -1, -1, -1);
		},
		createBFG: function() {
			return _.createWeapon("BFG", "bfg", false, false, true, false, 1, 99, 40, -1, -1, -1, -1);
		},
		createKnife: function() {
			return _.createWeapon("knife", "knife", false, false, true, false, -1, -1, -1, 4, 1, 1, 1);
		},
		createEmpty: function() {
			var emptyItem=_.createItem(" ", "empty");
			emptyItem.setType("empty");
			return emptyItem;
		}
	};
};

var theItemFactory = new ItemFactory();

extendClass(Weapon, Item);

var itemLoaded = true;