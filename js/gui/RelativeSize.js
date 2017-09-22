function RelativeSize(x,y,width,height){

this._x = x;
this._y = y;
this._width = width;
this._height = height;


}

RelativeSize.prototype.positionIntersect =
    function(position){
        return this._x<=position[0] && position[0]<=this._x+this._width && this._y<=position[1] && position[1] <=this._y+this._height;
    };

RelativeSize.prototype.createRelativePositionFromViewport =
    function(x, y, region){
        var relativePosition = [
                (x - region.x)/region.width, (y - region.y)/region.height,0
            ];
        return relativePosition;
    };

RelativeSize.prototype.createRelativePosition =
    function(x, y, x_off, y_off, width, height){
        var relativePosition = [
                (x - x_off)/width,  (y - y_off)/height,0
            ];
        return relativePosition;
    };

RelativeSize.prototype.toString =
    function(){
        return "{"+this._x+","+this._y+","+this._width+","+this._height+"}";
    };
