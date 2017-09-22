function Point(){

PlanarObject.call(this);

this._coord = [0,0];

this._width = 0.04;

this._pointColor = new Color(1,1,0,1);
}

Point.prototype = new PlanarObject();
Point.prototype.constructor = Point;


Point.prototype.set =
    function(x,y){
        this._coord = new Float32Array([x,y]);
        this.updateBoundingBox();
        this._transform = false;
        this._needLocalUpdate = false;
    };

Point.prototype.setTransform =
    function(trans){
    };

Point.prototype.setColor =
    function(color){
        this._pointColor = color;
    };

Point.prototype.updatePoint =
    function(x,y){
        this._coord[0] = x;
        this._coord[1] = y;
        this._needLocalUpdate = true;
    };

Point.prototype.updateBoundingBox =
    function(){
        this._bbox._center = this._coord;

        this._bbox._axes._axis1_x = 1.0;
        this._bbox._axes._axis1_y = 0;
        this._bbox._axes._axis2_x = 0;
        this._bbox._axes._axis2_y = 1;

        this._bbox._extent_axis1 = this._width /2;
        this._bbox._extent_axis2 = this._width /2;
    };

Point.prototype.render =
    function(layer){
        layer.renderPoints(this._coord, 2 , this._pointColor);
        this._needLocalUpdate = false;

        if (this._dispBbox) {
            layer.renderLines(this._bbox.getBoundingBoxLines(), 16, this._bboxColor);
        }

        this._needLayerUpdate = false;
    };
