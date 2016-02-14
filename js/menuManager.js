var menuManagerConstructor = function(_canvasContext, _hudManager, _collision, _main) {
	'use strict';

	var canvasContext = _canvasContext;
	var hudManager = _hudManager;
	var collision = _collision;
	var main = _main;

	// scope privé
	var _ = {};

	_ = {
		menuOpen : false,
		openingMenu : false,
		closingMenu : false,
		openingMenuFrame : 0,
		menuPosition : {
			x : -1,
			y : -1
		},
		previousMenuPosition : {
			x : -1,
			y : -1
		},
		menuSelectedOption : -1,
		previousMenuSelectedOption : -1,
		menuWidth : false,
		menuHeight : false,
		menuMaxWith : false,
		menuOptions : [],
		cursor : false,

		subMenuPosition : {
			x : -1,
			y : -1
		},
		subMenuOptions : [],
		subMenuOpen : false,
		subMenuOpening : false,
		subMenuSelectedOption : -1,
		subMenuPreviousSelectedOption : -1,
		subMenuWidth : false,
		subMenuHeight : false,
		subMenuMaxWith : false,
		subMenuToClose : false,

		inventoryPosition : false,
		inventoryItemWidth : 110,
		inventoryWidth : 5 * 110,
		inventoryHeight : 100,
		inventoryToClose : false,
		inventoryOpen : false,
		inventorySelectedItemIndex : false,
		inventoryPreviousSelectedItem : false,

		// sauvegarde
		refreshMenu : function(options) {
			canvasContext.clearRect(0, 0, options.width, options.height);
		},
		// sauvegarde
		drawMenu : function() {
			// clean du menu en cas de changement
			var _openingMenu = this.openingMenu;
			var _menuWidth = this.menuWidth;
			var _menuHeight = this.menuHeight;
			var _contextMenu = canvasContext;
			if (this.menuOpen) {

				// cas ou l'on doit redessiner le menu :
				// - si les options ont changee
				// - si le menu est en train d'etre ouver
				if (this.menuSelectedOption != this.previousMenuSelectedOption || _openingMenu) {
					this.previousMenuSelectedOption = this.menuSelectedOption;
					var _menuPosition = this.menuPosition;
					var x1 = _menuPosition.x;
					var y1 = _menuPosition.y;
					_contextMenu.clearRect(x1 - 50, y1 - 10, _menuWidth + 70, _menuHeight + 20);

					var rectHeight = 30 + 30 * this.menuOptions.length;

					if (_openingMenu) {
						this.openingMenuFrame++;
						// on ouvre le menu uniquement
						// en largeur
						if (this.openingMenuFrame <= 2) {
							_menuWidth = this.menuMaxWith * this.openingMenuFrame / 5;
							_menuHeight = 5;
						} else if (this.openingMenuFrame >= 6) {
							_menuWidth = this.menuMaxWith;
							_menuHeight = rectHeight * this.openingMenuFrame / 10;
						} else {
							_menuWidth = this.menuMaxWith;
							_menuHeight = rectHeight;
							this.openingMenu = false;
						}
					} else {
						_menuWidth = this.menuMaxWith;
						_menuHeight = rectHeight;
					}

					this.menuWidth = _menuWidth;
					this.menuHeight = _menuHeight;

					var x1 = _menuPosition.x;
					var y1 = _menuPosition.y;

					_contextMenu.save();
					var my_gradient = _contextMenu.createLinearGradient(x1, y1, x1 + _menuWidth, y1 + _menuHeight);
					my_gradient.addColorStop(0, "#005aab");
					my_gradient.addColorStop(1, "#010024");
					_contextMenu.fillStyle = my_gradient;

					_contextMenu.fillRect(x1, y1, _menuWidth, _menuHeight);
					_contextMenu.strokeStyle = "#dcd8cf";
					_contextMenu.lineWidth = 2;
					_contextMenu.strokeRect(x1, y1, _menuWidth, _menuHeight);

					if (this.menuSelectedOption != -1) {
						// var cursor = this.images["cursor"];
						_contextMenu.drawImage(this.cursor, x1 - 40, y1 + 10 + 30 * this.menuSelectedOption);
					}

					var menuOptions = this.menuOptions;
					for (var i = 0; i < menuOptions.length; i++) {
						var currentOption = menuOptions[i];
						_contextMenu.fillStyle = "#eaece9";
						_contextMenu.font = "bold 12px Arial";
						if (currentOption.disabled) {
							_contextMenu.fillStyle = "#9a9c99";
							_contextMenu.font = "bold italic 12px Arial";
						}
						_contextMenu.fillText(menuOptions[i].name, x1 + 10, y1 + 20 + 30 * i);
					};
					_contextMenu.restore();
					console.debug('drawing menu');
				}
			} else if (this.closingMenu) {
				var x1 = this.menuPosition.x;
				var y1 = this.menuPosition.y;
				_contextMenu.clearRect(x1 - 50, y1 - 10, _menuWidth + 70, _menuHeight + 20);
				this.closingMenu = false;
			}

		},
		// sauvegarde
		cleanInventory : function(contextMenu, inventorySelectedItemIndex, inventoryPreviousSelectedItem, subMenuSelectedOption, subMenuPreviousSelectedOption, inventoryPosition, subMenuPosition) {

			var x1 = subMenuPosition.x;
			var y1 = subMenuPosition.y;
			var inventoryX1 = inventoryPosition.x;
			var inventoryY1 = inventoryPosition.y;
			var _inventoryWidth = this.inventoryWidth;
			var _inventoryHeight = this.inventoryHeight;
			var _menuWidth = this.subMenuWidth;
			var _menuHeight = this.subMenuHeight;

			var isSubMenuChanged = subMenuSelectedOption != subMenuPreviousSelectedOption;
			var isInventoryChanged = inventorySelectedItemIndex != inventoryPreviousSelectedItem;

			if (isSubMenuChanged || isInventoryChanged) {
				contextMenu.clearRect(x1 - 50, y1 - 10, _menuWidth + 70, _menuHeight + 20);
				contextMenu.clearRect(inventoryX1 - 50, inventoryY1 - 10, _inventoryWidth + 70, _inventoryHeight + 20);
				return true;
			}
			return false;
		},
		// dessine l'inventaire
		drawInventory : function() {
			var _contextMenu = canvasContext;
			var _inventoryWidth = this.inventoryWidth;
			var _inventoryHeight = this.inventoryHeight;
			if (this.inventoryOpen) {
				var _inventorySelectedItem = this.inventorySelectedItemIndex;
				var _inventoryPreviousSelectedItem = this.inventoryPreviousSelectedItem;
				var _subMenuSelectedOption = this.subMenuSelectedOption;
				var _subMenuPreviousSelectedOption = this.subMenuPreviousSelectedOption;
				var _inventoryPosition = this.inventoryPosition;
				var _subMenuPosition = this.subMenuPosition;

				var menuWasCleaned = _.cleanInventory(_contextMenu, _inventorySelectedItem, _inventoryPreviousSelectedItem, _subMenuSelectedOption, _subMenuPreviousSelectedOption, _inventoryPosition, _subMenuPosition);

				if (menuWasCleaned) {
					this.inventoryPreviousSelectedItem = _inventorySelectedItem;

					var x1 = _inventoryPosition.x;
					var y1 = _inventoryPosition.y;
					_contextMenu.save();
					var currentSurvivor = main.getCurrentSurvivor();
					var inventoryItems = currentSurvivor.getInventory();
					var my_gradient = _contextMenu.createLinearGradient(x1, y1, x1 + _inventoryWidth, y1 + _inventoryHeight);
					my_gradient.addColorStop(0, "#005aab");
					my_gradient.addColorStop(1, "#010024");
					_contextMenu.fillStyle = my_gradient;

					_contextMenu.fillRect(x1, y1, _inventoryWidth, _inventoryHeight);
					_contextMenu.strokeStyle = "#dcd8cf";
					_contextMenu.lineWidth = 2;
					_contextMenu.strokeRect(x1, y1, _inventoryWidth, _inventoryHeight);
					_contextMenu.fillStyle = "#eaece9";
					_contextMenu.font = "bold 32px Arial";
					var currentSurvivor = currentSurvivor;
					var equiped = currentSurvivor.equiped;
					for (var i = 0; i < inventoryItems.length; i++) {
						var currentItem = inventoryItems[i];

						if (typeof currentItem == 'undefined') {
							continue;
						}

						var itemName = currentItem.getName();
						var itemSprite = currentItem.getSprite();

						var canvas = main.items.sprites[itemSprite].canvas;
						var itemX = i * this.inventoryItemWidth;
						var positionX = x1 + itemX;
						var positionY = y1;
						_contextMenu.fillText(itemName, positionX, positionY + 95);

						// si on est sur l'item
						// selectionne, on le met un peu
						// en
						// hauteur.
						if (_inventorySelectedItem == i) {
							_contextMenu.drawImage(canvas, positionX, positionY - 10);
							_contextMenu.drawImage(this.cursor, x1 + _inventorySelectedItem * this.inventoryItemWidth - 40, y1 + 10);
						} else {
							_contextMenu.drawImage(canvas, positionX, positionY);
						}

						// si l'element est equipe, on
						// ajout un petit E
						for (var int = 0; int < equiped.length; int++) {
							if (equiped[int] == i) {

								_contextMenu.font = "bold 32px 'Segoe UI'";
								// this.contextHighlight.textAlign
								// = 'center';
								_contextMenu.fillText("E", positionX + 90, positionY + 80);
							}
						}
					}
					_contextMenu.restore();
					console.debug('drawing menu');

				}
				_.drawSubMenu(menuWasCleaned);
			} else if (this.inventoryToClose) {
				var x1 = this.menuPosition.x;
				var y1 = this.menuPosition.y;
				_contextMenu.clearRect(x1 - 50, y1 - 10, _inventoryWidth + 70, _inventoryHeight + 20);
				this.inventoryToClose = false;
				this.inventoryOpen = false;
			}
		},
		// sauvegarde
		drawSubMenu : function(_menuWasCleaned) {
			// clean du menu en cas de changement
			var _subMenuOpen = this.subMenuOpen;
			var _menuWidth = this.subMenuWidth;
			var _menuHeight = this.subMenuHeight;
			var _contextMenu = canvasContext;
			if (_subMenuOpen) {
				if (this.subMenuOpening) {
					this.subMenuSelectedOption = 0;
					this.subMenuPreviousSelectedOption = -1;
					this.subMenuWidth = _.measureMenuTextWidth(this.subMenuOptions);
					_menuWidth = this.subMenuWidth;
					this.subMenuOpening = false;
				}

				// cas ou l'on doit redessiner le menu
				// si les options ont changee
				var subMenuSelectedOption = this.subMenuSelectedOption;

				if (_menuWasCleaned) {
					this.subMenuPreviousSelectedOption = subMenuSelectedOption;
					var _menuPosition = this.subMenuPosition;
					var x1 = _menuPosition.x;
					var y1 = _menuPosition.y;
					/*
					 * _contextMenu.clearRect(x1 - 50, y1 - 10, _menuWidth + 70, _menuHeight + 20);
					 */

					var rectHeight = 30 + 30 * this.subMenuOptions.length;
					_menuHeight = rectHeight;

					this.subMenuHeight = rectHeight;

					_contextMenu.save();
					var my_gradient = _contextMenu.createLinearGradient(x1, y1, x1 + _menuWidth, y1 + _menuHeight);
					my_gradient.addColorStop(0, "#005aab");
					my_gradient.addColorStop(1, "#010024");
					_contextMenu.fillStyle = my_gradient;

					_contextMenu.fillRect(x1, y1, _menuWidth, _menuHeight);
					_contextMenu.strokeStyle = "#dcd8cf";
					_contextMenu.lineWidth = 2;
					_contextMenu.strokeRect(x1, y1, _menuWidth, _menuHeight);

					var menuOptions = this.subMenuOptions;
					for (var i = 0; i < menuOptions.length; i++) {
						var currentOption = menuOptions[i];
						_contextMenu.fillStyle = "#eaece9";
						_contextMenu.font = "bold 12px Arial";
						if (currentOption.disabled) {
							_contextMenu.fillStyle = "#9a9c99";
							_contextMenu.font = "bold italic 12px Arial";
						}

						if (subMenuSelectedOption == i) {
							_contextMenu.drawImage(this.cursor, x1 - 40, y1 + 10 + 30 * i);
							_contextMenu.fillText(menuOptions[i].name, x1 + 5, y1 + 20 + 30 * i);
						} else {
							_contextMenu.fillText(menuOptions[i].name, x1 + 10, y1 + 20 + 30 * i);
						}
					};
					_contextMenu.restore();
					console.debug('drawing menu');
				}
			} else if (this.closingMenu) {
				var x1 = this.menuPosition.x;
				var y1 = this.menuPosition.y;
				_contextMenu.clearRect(x1 - 50, y1 - 10, _menuWidth + 70, _menuHeight + 20);
				this.closingMenu = false;
			}
		},
		openInventoryInScope : function() {
			var currentSurvivor = main.getCurrentSurvivor();
			var inventory = currentSurvivor.getInventory();

			this.inventoryOpen = true;
			// this.inventoryItems = inventory;
			this.inventoryPreviousSelectedItem = -1;
			this.inventorySelectedItemIndex = 0;
			this.inventoryPosition = this.menuPosition;
		},
		checkBoundsForInventory : function(mousePos) {
			if (!this.subMenuOpen) {
				var x1 = this.inventoryPosition.x;
				var y1 = this.inventoryPosition.y;
				this.inventorySelectedItemIndex = -1;
				this.subMenuSelectedOption = -1;
				var _itemWidth = this.inventoryItemWidth;
				var _itemHeight = this.inventoryHeight;
				var inventoryItems = main.getCurrentSurvivor().getInventory();

				for (var i = 0; i < inventoryItems.length; i++) {
					var itemY = y1;
					var itemRect = {
						x : x1 + i * this.inventoryItemWidth,
						y : itemY,
						width : _itemWidth,
						height : _itemHeight
					};

					if (collision.pointInRectangle(itemRect, mousePos)) {
						this.inventorySelectedItemIndex = i;
						return;
					}
				}
			} else {
				var x1 = this.subMenuPosition.x;
				var y1 = this.subMenuPosition.y;
				var optionHeight = 30;
				var optionWidth = 100;
				this.subMenuSelectedOption = -1;
				for (var i = 0; i < this.subMenuOptions.length; i++) {
					var option = this.subMenuOptions[i];
					if (option.disabled || option.onlyText) {
						continue;
					}
					var optionY = y1 + 30 * i;
					var optionRect = {
						x : x1,
						y : optionY,
						width : optionWidth,
						height : optionHeight
					};

					if (collision.pointInRectangle(optionRect, mousePos)) {
						this.subMenuSelectedOption = i;
						return;
					}
				}
			}
		},
		checkBoundsForMenu : function(mousePos) {
			var x1 = this.menuPosition.x;
			var y1 = this.menuPosition.y;
			var optionHeight = 30;
			var optionWidth = 100;
			this.menuSelectedOption = -1;
			for (var i = 0; i < this.menuOptions.length; i++) {
				var option = this.menuOptions[i];
				if (option.disabled || option.onlyText) {
					continue;
				}
				var optionY = y1 + 30 * i;
				var optionRect = {
					x : x1,
					y : optionY,
					width : optionWidth,
					height : optionHeight
				};

				if (collision.pointInRectangle(optionRect, mousePos)) {
					this.menuSelectedOption = i;
					return;
				}
			};
		},
		initializeMenu : function(mousePos) {
			_.refreshMenu(main.options);
			this.openingMenuFrame = 0;
			this.menuPosition.x = mousePos.x - 5;
			this.menuPosition.y = mousePos.y - 5;
			this.openingMenu = true;
			this.menuMaxWith = _.measureMenuTextWidth(this.menuOptions);
			this.menuOpen = true;
			return;
		},
		// determine la largeur du menu
		measureMenuTextWidth : function(_options) {
			var _contextMenu = canvasContext;
			var maxWith = 0;
			for (var i = 0; i < _options.length; i++) {
				var currentOption = _options[i];
				if (currentOption.disabled) {
					_contextMenu.font = "bold italic 12px Arial";
				} else {
					_contextMenu.font = "bold 12px Arial";
				}
				maxWith = Math.max(_contextMenu.measureText(currentOption.name).width, maxWith);
			}
			// un peu de marge c'est cool
			return maxWith+ 40;
		},
		setCursor : function(_cursor) {
			console.debug("Prerendering cursor" + _cursor.src);

			var itemCanvas = document.createElement('canvas');
			var currentCtx = itemCanvas.getContext('2d');
			currentCtx.webkitImageSmoothingEnabled = false;
			currentCtx.mozImageSmoothingEnabled = false;
			currentCtx.imageSmoothingEnabled = false; // future

			currentCtx.drawImage(_cursor, 0, 0, 48, 24, 0, 0, 48, 24);
			this.cursor = itemCanvas;
		},
		buildContextMenu : function(args) {
			var _currentSurvivor = args.currentSurvivor;
			var _clickedOnSelfZone = args.clickedOnSelfZone;
			var _moveAvailable = args.moveAvailable;
			var _actionToMove = args.actionToMove;
			var _notBlockedByDoor = args.notBlockedByDoor;
			var _clickedZone = args.clickedZone;

			var zombiesInDestinationZone = hudManager.zombiesInTargetZone(_clickedZone);
			var isZombiesInDestinationZone = zombiesInDestinationZone.length > 0;
			this.menuOptions = [];
			// si il y a des zombie dans la case de destination et qu'elle n'est pas bloquu
			// OU
			// s'il y a des zombies sur la case du survivant
			var menuOptions = this.menuOptions;
			
			if(_currentSurvivor.stamina < 1){

				menuOptions.push({
					name : "Survivor is dead ...",
					disabled : true,
				});
				return menuOptions;
			}
			
			if (isZombiesInDestinationZone && (_clickedOnSelfZone || _notBlockedByDoor)) {
				

				var items = _currentSurvivor.inventory.list();
				var equiped = _currentSurvivor.equiped;
				if(equiped.length <1){
					// peut pas attaquer ...
					menuOptions.push({
						name : "Equipe weapon first ...",
						disabled : true,
					});
					
				} else if(equiped.length == 1){
					// ataque directement avec la première arme
					var weaponIndex = equiped[0];
					var weapon = items[weaponIndex];
					menuOptions.push({
						name : "Attack with "+weapon.name+" (1 AP)",
						action : main.attackZombiesOfZone,
						actionPoint : 1
					});
				} else {
					// doit choisir l'arme
					menuOptions.push({
						name : "Attack (1 AP)",
						action : main.attackZombiesOfZone,
						actionPoint : 0
					});
				}
				
			}

			if (_clickedOnSelfZone) {
				// Si on clique sur la zone du survivant
				// on autorise la recherche si il n'y a pas de
				// zombie
				// on autorise l'ouverture du menu
				if (_clickedZone.inside) {
					if (isZombiesInDestinationZone) {
						menuOptions.push({
							name : "Search (zombie in zone ...)",
							disabled : true,
						});
					} else {
						menuOptions.push({
							name : "Search (1AP)",
							action : _.searchZone,
							actionPoint : 1
						});
					}
					menuOptions.push({
						name : " ",
						disabled : true
					});
				}
				menuOptions.push({
					name : "Inventory",
					action : _.openInventory,
					actionPoint : 0
				});
				menuOptions.push({
					name : "Make some noise (1AP)",
					action : main.makeNoise,
					actionPoint : 1
				});
			} else {
				if (_notBlockedByDoor) {
					if (!_moveAvailable) {
						menuOptions.push({
							name : "Move (" + _actionToMove + " AP)",
							disabled : true
						});
					} else {
						menuOptions.push({
							name : "Move (" + _actionToMove + " AP)",
							action : main.moveSurvivor,
							actionPoint : _actionToMove
						});
					}
				} else {
					menuOptions.push({
						name : "Open (1AP)",
						action : main.openDoor,
						actionPoint : 1
					});
				}
			}
			return menuOptions;
		},
		openInventory : function() {
			_.openInventoryInScope();
		},
		contextualMenuClick : function(_currentSurvivor) {

			if (this.menuSelectedOption != -1) {
				var currentOption = this.menuOptions[this.menuSelectedOption];
				if (currentOption.disabled || currentOption.onlyText) {
					return;
				}
				var actionToDo = currentOption.action;
				this.menuOpen = false;
				this.closingMenu = true;
				if (currentOption.param) {
					actionToDo(currentOption.param);
				} else {
					actionToDo();
				}
				main.decreaseSurvivorActions(_currentSurvivor, currentOption.actionPoint);
			} else {
				console.debug('clicked outside the menu,  closing');
				this.menuOpen = false;
				this.closingMenu = true;
			}
			return;
		},
		inventoryClick : function(params) {

			var _currentSurvivor = params.currentSurvivor;

			var _inventorySelectedItemIndex = this.inventorySelectedItemIndex;
			// si l'item est vide on ne fait rien.
			var inventoryItems = main.getCurrentSurvivor().getInventory();

			if (_inventorySelectedItemIndex != -1 && inventoryItems[_inventorySelectedItemIndex].getType() == "empty") {
				return;
			}

			var _subMenuSelectedOption = this.subMenuSelectedOption;
			if (this.subMenuOpen) {
				if (_subMenuSelectedOption != -1) {
					var currentOption = this.subMenuOptions[_subMenuSelectedOption];
					console.debug('applying action ' + currentOption.name + '  on item n:' + _inventorySelectedItemIndex);
					var actionToDo = currentOption.action;
					actionToDo();
					main.decreaseSurvivorActions(_currentSurvivor, currentOption.actionPoint);
				}
				this.subMenuOpen = false;
				this.subMenuToClose = true;
				return;
			}
			if (_inventorySelectedItemIndex != -1) {
				console.debug('clicked on item n:' + _inventorySelectedItemIndex);

				var mousePos = params.mouse;
				this.subMenuPosition.x = mousePos.x - 5;
				this.subMenuPosition.y = mousePos.y - 5;

				// if item alreadyEquipped
				var currentSurvivor = main.getCurrentSurvivor();
				var equipedItemIndex = _.getEquipedItemIndex(currentSurvivor.equiped, _inventorySelectedItemIndex);

				var equip_UnequipOption = {
					name : "Equip",
					action : _.equipItem,
					actionPoint : 1
				};
				if (equipedItemIndex > -1) {
					equip_UnequipOption = {
						name : "Unequip",
						action : _.unequipItem,
						actionPoint : 1
					}
				}

				this.subMenuOptions = [equip_UnequipOption, {
					name : "Discard",
					action : _.discardItem,
					actionPoint : 1
				}, {
					name : "Switch",
					action : function() {
						console.debug("Switch Mode");
					},
					actionPoint : 1
				}];
				this.subMenuOpen = true;
				this.subMenuOpening = true;

			} else {
				console.debug('clicked outside the menu,  closing');
				this.inventoryOpen = false;
				this.inventoryToClose = true;
			}
			return;
		},
		getEquipedItemIndex : function(equipedItems, itemIndexInInventory) {
			for (var i = 0; i < equipedItems.length; i++) {
				var array_element = equipedItems[i];
				if (array_element == itemIndexInInventory) {
					return i;
				}
			};
			return -1;
		},
		isItemAlreadyEquipped : function() {
			var currentSurvivor = main.getCurrentSurvivor();
			var inventory = currentSurvivor.getInventory();
			var selectedItemIndex = this.inventorySelectedItemIndex;

		},
		equipItem : function() {
			_.equipItemInScope();
		},
		equipItemInScope : function() {
			var currentSurvivor = main.getCurrentSurvivor();
			var inventory = currentSurvivor.getInventory();
			var selectedItemIndex = this.inventorySelectedItemIndex;

			currentSurvivor.equiped.push(selectedItemIndex);
			console.debug(currentSurvivor.name + " equiped a " + inventory[selectedItemIndex].name);
			if (currentSurvivor.equiped.length > currentSurvivor.maxEquipedItem) {
				currentSurvivor.equiped.shift();
			}
			this.subMenuOpen = false;
		},
		unequipItem : function() {
			_.unequipItemInScope();
		},
		unequipItemInScope : function() {

			var currentSurvivor = main.getCurrentSurvivor();
			var equipedItems = currentSurvivor.equiped;
			var equipedItemIndex = _.getEquipedItemIndex(equipedItems, this.inventorySelectedItemIndex);

			_.doUnequipItem(equipedItems, equipedItemIndex);
			this.subMenuOpen = false;
		},
		doUnequipItem : function(equipedItems, equipedItemIndex) {
			equipedItems.splice(equipedItemIndex, 1);
		},
		discardItem : function() {
			_.discardItemInScope();
		},
		discardItemInScope : function() {

			var currentSurvivor = main.getCurrentSurvivor();
			var inventory = currentSurvivor.getInventory();
			var selectedItemIndex = this.inventorySelectedItemIndex;

			console.debug(currentSurvivor.name + " discard a " + inventory[selectedItemIndex].name);

			// on remplace dans l'inventaire l'item par un item
			// vide.
			inventory[selectedItemIndex] = theItemFactory.createEmpty();

			// si l'item etait equipe, on supprime sa reference dans
			// les objets equipes.
			var equipedItemIndex = _.getEquipedItemIndex(currentSurvivor.equiped, selectedItemIndex);
			if (equipedItemIndex > -1) {
				_.doUnequipItem(currentSurvivor.equiped, equipedItemIndex);
			}

			this.subMenuOpen = false;

		},
		chooseWeaponMenu : function(_mousePos, _equiped, _items) {
			this.menuOptions = [{
				name : "Choose your weapon",
				onlyText : true
			}]
			for (var int = 0; int < _equiped.length; int++) {
				var weaponIndex = _equiped[int];
				var weapon = _items[weaponIndex];
				this.menuOptions.push({
					name : weapon.name,
					action : function(_weapon) {
						main.attackZombiesOfZoneWithWeapon(_weapon);
					},
					actionPoint : 1,
					param : weapon
				});
			}

			_.initializeMenu(_mousePos);
		}
	};
	return {
		launch : function(args) {
			if (args.log) {
				console.debug("menuManager" + args.log);
			} else if (args.initializeMenu) {
				_.initializeMenu(args.initializeMenu);
			} else if (args.drawMenu) {
				_.drawMenu();
			} else if (args.drawInventory) {
				_.drawInventory();
			} else if (args.setCursor) {
				_.setCursor(args.setCursor);
			} else if (args.checkBoundsForMenu) {
				_.checkBoundsForMenu(args.checkBoundsForMenu);
			} else if (args.checkBoundsForInventory) {
				_.checkBoundsForInventory(args.checkBoundsForInventory);
			} else if (args.buildContextMenu) {
				return _.buildContextMenu(args.buildContextMenu);
			} else if (args.contextualMenuClick) {
				return _.contextualMenuClick(args.contextualMenuClick);
			} else if (args.inventoryClick) {
				return _.inventoryClick(args.inventoryClick);
			} else if (args.chooseWeaponMenu) {
				return _.chooseWeaponMenu(args.chooseWeaponMenu.mousePos, args.chooseWeaponMenu.equiped, args.chooseWeaponMenu.items);
			} else {
				console.debug('function not recognized ');
			}
		},
		isMenuOpen : function() {
			return _.menuOpen;
		},
		isInventoryOpen : function() {
			return _.inventoryOpen;
		},
		refreshMenu : function(options) {
			return _.refreshMenu(options);
		}
	};
}
menuManager = true;