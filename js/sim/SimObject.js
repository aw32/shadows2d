function SimObject(points, color){

this._points = points;

this._color = color;

this._lines = new Lines(points, color);

}

SimObject.prototype.showObject =
    function(show){
        this._lines.setDisplay(show);
    };

SimObject.prototype.getLines =
    function(){
        return this._points;
    };

SimObject.prototype.getColor =
    function(){
        return this._color;
    };

SimObject.prototype.addToLayer =
    function(layer){
        layer.addObject(this._lines);
    };
