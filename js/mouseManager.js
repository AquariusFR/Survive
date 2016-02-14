
var buildMouseManager = function(_htmlElement, _mouseOverCallBack,_mouseMoveCallBack,_mouseOutCallBack,_clickCallBack){
	var htmlElement = _htmlElement;
	var periode = 20;
	var mouseOverCallBack = _mouseOverCallBack;
	var mouseMoveCallBack = _mouseMoveCallBack;
	var mouseOutCallBack = _mouseOutCallBack;
	var clickCallBack = _clickCallBack;
	var _private = false;
	_private = {
		lastTimeStamp : Date.now(),
		acDelta : Date.now(),
		mousePos : {},
		clientX : -1,
		clientY : -1,

		init : function(){
			htmlElement.onmouseover=function(e){
				_private.onmouseover(e);
			};
			htmlElement.onmousemove=function(e){
				if(_private.isReady()){
					_private.onmousemove(e);
				}
			};
			htmlElement.onmouseout=function(e){
				_private.onmouseout(e);
			};
			htmlElement.oncontextmenu = function (e) {
				_private.oncontextmenu(e);
			};
			htmlElement.onclick = function (e){
				_private.click(e);
			};
		},
		registerMouse:function(e){
			this.mousePos = _private.captureMousePos(e);
		},
		captureMousePos:function(e) {
			var rect = htmlElement.getBoundingClientRect();
			this.clientX = e.clientX;
			this.clientY = e.clientY;
			return {
				x: this.clientX - rect.left,
				y: this.clientY - rect.top
			};
		},
		onmouseover : function(e){
			_private.registerMouse(e);
			mouseOverCallBack();
		},
		onmousemove : function(e){
			_private.registerMouse(e);
			mouseMoveCallBack();
		},
		onmouseout : function(e){
			_private.registerMouse(e);
			mouseOutCallBack();
		},
		oncontextmenu : function(e){
				e.preventDefault();
		},
		click : function(e){
			_private.registerMouse(e);
			clickCallBack();
		},
		getMousePos : function(e){
			return this.mousePos;
		},
		isReady : function(){

			var delta = Date.now() - _private.lastUpdateTime;
			_private.lastUpdateTime = Date.now();
			if (_private.acDelta > periode)
			{
				_private.acDelta = 0;
				// on passe à l'image suivante
				return true;
			} else {
				_private.acDelta += delta;
				return false;
			}
		}
	};
	_private.init();
	return {
		launch : function( args ) {
			if(args.log) {console.log(args.log);}
			else if(args.getMousePos) {return _private.getMousePos(args.getMousePos);}
			else {console.log('function not recognized ');}
		},
		mouse : function(){
			return _private.getMousePos();
		},
		client : function(){
			return  {
				x: this.clientX,
				y: this.clientY
			};
		}
	};
};

mouseManagerLoaded = true;