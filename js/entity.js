var entityFactoryConstructor = function() {
	var _ = {};
	_ = {
		entityAnimations : {},
		Inventory : function() {
			var _ = {};
			_ = {
				items : [],
				list : function() {
					return _.items;
				},
				addItem : function(item, index) {
					if (index < 0 && index > 4) {
						console.error("Cannot store item at " + index + " position");
						return;
					}
					_.items[index] = item;
				}
			};
			return {
				list : function() {
					return _.list();
				},
				addItem : function(item, index) {
					_.addItem(item, index);
				},
			};
		},

		createSurvivor : function(_name, _sprite, _id) {
			var spriteInfos = _.entityAnimations[_sprite];
			var spriteRandomFrame = _.getSpriteRandomFrame(spriteInfos);
			var survivor = _.createEntity(_name, _sprite, _id, 2, spriteRandomFrame);
			survivor.maxEquipedItem = 2;
			survivor.inventory = new _.Inventory();
			survivor.equiped = [];
			survivor.actions = 0;
			survivor.actionsMax = 3;
			var emptyItem = new Item();
			emptyItem.setName("empty");
			emptyItem.setSprite("empty");
			emptyItem.setType("empty");
			survivor.inventory.addItem(theItemFactory.createEmpty(), 0);
			survivor.inventory.addItem(theItemFactory.createEmpty(), 1);
			survivor.inventory.addItem(theItemFactory.createEmpty(), 2);
			survivor.inventory.addItem(theItemFactory.createEmpty(), 3);
			survivor.inventory.addItem(theItemFactory.createEmpty(), 4);

			survivor.getInventory = function() {
				var myList = survivor.inventory.list();
				return myList;
			};
			survivor.addToInventory = function(item, index) {
				survivor.inventory.addItem(item, index);
			};
			Object.preventExtensions(survivor);
			return survivor;
		},
		createWalker : function(_name, _id) {
			var spriteName = "walker";
			var spriteInfos = _.entityAnimations[spriteName];
			var spriteRandomFrame = _.getSpriteRandomFrame(spriteInfos);
			var walker = _.createEnemy(_name, spriteName, _id, 1, 1, 1, 1, spriteRandomFrame);
			Object.preventExtensions(walker);
			return walker;
		},
		createFattie : function(_name, _id) {
			var spriteName = "fattie";
			var spriteInfos = _.entityAnimations[spriteName];
			var spriteRandomFrame = _.getSpriteRandomFrame(spriteInfos);
			var fattie = _.createEnemy(_name, spriteName, _id, 1, 2, 1, 1, spriteRandomFrame);
			Object.preventExtensions(fattie);
			return fattie;
		},
		createEnemy : function(_name, _sprite, _id, _damage, _stamina, _actions, _zoneByMove, _spriteRandomFrame) {
			var enemy = _.createEntity(_name, _sprite, _id, _stamina, _spriteRandomFrame);
			enemy.damage = _damage;
			enemy.actions = _actions;
			enemy.zoneByMove = _zoneByMove;
			return enemy;
		},

		getSpriteRandomFrame : function(spriteInfos) {
			var availableAnimation = spriteInfos.animations;
			var currentAnimation = availableAnimation[0];
			var frames = currentAnimation.frames.length - 1;
			var currentFrame = Math.floor((Math.random() * frames));
			return currentFrame;
		},

		createEntity : function(_name, _sprite, _id, _stamina, _currentFrame) {
			var entity = {
				id : _id,
				stamina : _stamina,
				staminaMax : _stamina,
				zone : 0,
				name : _name,
				sprite : _sprite,
				acDelta : 0,
				lastUpdateTime : 0,
				callback : false,
				mouseOver : false,
				mouseState : false,
				"position" : [],
				"previousPosition" : [],
				"speed" : 10,
				"moving" : false,
				"backward" : false,
				"to" : [],
				state : 0,
				"currentAnimation" : -1,
				"currentFrame" : _currentFrame,
				"previousFrame" : -1,
				"reverseAnim" : false
			};
			return entity;
		}
	};
	return {
		createSurvivor : function(_name, _sprite, _id) {
			return _.createSurvivor(_name, _sprite, _id);
		},
		createFattie : function(_name, _id) {
			return _.createFattie(_name, _id);
		},
		createWalker : function(_name, _id) {
			return _.createWalker(_name, _id);
		},
		loadAnimations : function(_animations) {
			_.entityAnimations = _animations;
		}
	}
}
var entityLoaded = true;