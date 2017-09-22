function Label(text,color){

this._size = null;

this._text = text;

this._planarText = null;

this._maxRelativeLineHeight = 1;

if (FontLoader.defaultFont == null)
    FontLoader.loadDefaultFont();

this._planarText = new BitmapText(FontLoader.defaultFont, 0,0,0,0,text);
this._planarText.setColor(color);

}

Label.prototype.updateText =
    function(text){
        this._text = text;
        this._planarText.updateText(text);
    };

Label.prototype.setMaxRelativeLineHeight  =
    function(maxRelLineHeight){
        this._maxRelativeLineHeight = maxRelLineHeight;
    };

Label.prototype.size =
    function(size){
        this._size = size
    };

Label.prototype.getSize =
    function(){
        return this._size;
    };

Label.prototype.layout =
    function(x, y, width, height){
        this._planarText.update(x, y+height, width, height * this._maxRelativeLineHeight, this._text);
    };

Label.prototype.addToLayer =
    function(layer){
        layer.addObject(this._planarText);
    };

Label.prototype.removeFromLayer = 
    function(layer) {
        layer.removeObject(this._planarText);
    };

Label.prototype.consumeEvent =
    function(event){
        return false;
    };

Label.prototype.consumeMouseEvent =
    function(event, relativePosition){
        return false;
    };

Label.prototype.consumeKeyEvent =
    function(event){
        return false;
    };






