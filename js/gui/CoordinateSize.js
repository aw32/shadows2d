function CoordinateSize(x,y,width,height){

this._x = x;

this._y = y;

this._width = width;

this._height = height;

}

CoordinateSize.prototype.toString =
    function(){
        return "{"+this._x+","+this._y+","+this._width+","+this._height+"}";
    };
