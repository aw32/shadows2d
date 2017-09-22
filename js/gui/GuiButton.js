function GuiButton(text,color,action){
    
this._mouseOverColor = new Color(0.5, 0.5, 0.5);

this._size = null;

this._text = text;

this._color = color;

this._action = action;

this._mouseDown = false;

this._mouseOver = false;

if (FontLoader.defaultFont == null)
    FontLoader.loadDefaultFont();

this._planarText = new BitmapText(FontLoader.defaultFont, 0,0,0,0,text);
this._planarText.setColor(color);

}


GuiButton.prototype.setText =
    function(text){
        this._text = text;
        this._planarText.updateText(text);
    };

GuiButton.prototype.setMouseOverColor =
    function(color){
        this._mouseOverColor = color;
    };

GuiButton.prototype.size =
    function(size){
        this._size = size;
    };

GuiButton.prototype.getSize =
    function(){
        return this._size;
    };

GuiButton.prototype.layout =
    function(x, y, width, height){
        this._planarText.update(x, y+height, width, height, this._text);
    };

GuiButton.prototype.addToLayer =
    function(layer) {
        layer.addObject(this._planarText);
    };

GuiButton.prototype.removeFromLayer =
    function(layer) {
        layer.removeObject(this._planarText);
    };

GuiButton.prototype.consumeEvent =
    function(event) {
        return false;
    };

GuiButton.prototype.consumeMouseEvent =
    function(event, relativePosition) {
        var intersect = this._size.positionIntersect(relativePosition);
        //console.log("check button intersect: "+intersect); 
        // Mouse clicked
        if (intersect && event.type === "click") {
            this._action(this);
            event._consumed = true;
            return true;
        }
    
        // Mouse over
        if (event.type === "mousemove") {
            // mouse entered
            if (intersect && !this._mouseOver) {
                this._planarText.setColor(this._mouseOverColor);
                this._mouseOver = true;
            } else
            if (!intersect && this._mouseOver) { // mouse exited
                this._planarText.setColor(this._color);
                this._mouseOver = false;
            }
        }
        return false;
    };

GuiButton.prototype.consumeTouchEvent =
    function(event, relativePosition){
        if (event.type === "touchclick") {
            var intersect = this._size.positionIntersect(relativePosition);
            if (intersect) {
                this._action(this);
                event._consumed = true;
                return true;
            }
        }
        return false;
    };

GuiButton.prototype.consumeKeyEvent =
    function(event) {
        return false;
    };

GuiButton.prototype.hasFocus =
    function(){
        return false;
    };

GuiButton.prototype.blur =
    function(){

    };


