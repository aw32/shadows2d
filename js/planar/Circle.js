function Circle(){

PlanarObject.call(this);

this._width = 0;

this._circleColor = new Color(0,0,1,1);

this._points = null;

this._localPointBuffer = new Float32Array(Circle.prototype._slices * 3 * 2);

}

Circle.prototype = new PlanarObject();
Circle.prototype.constructor = Circle;

Circle.prototype._slices = 32;

Circle.prototype.set =
    function(x,y,width,color){
        this.translate(x, y);
        this._width = width;
        this.updateBoundingBox();
        this.calculatePoints();
        this._circleColor = color;
    };

Circle.prototype.rotate =
    function(angle){
    };

Circle.prototype.updateColor =
    function(color){
        this._circleColor = color;
        this._needLocalUpdate = true;
    };

Circle.prototype.updateBoundingBox =
    function(){
        this._bbox._center = new Float32Array([0,0]);
        this._bbox._axes._axis1_x = 1.0;
        this._bbox._axes._axis1_y = 0.0;
        this._bbox._axes._axis2_x = 0.0;
        this._bbox._axes._axis2_y = 1.0;


        this._bbox._extent_axis1 = (this._width/2)*0.8;
        this._bbox._extent_axis2 = (this._width/2)*0.8;
    };

Circle.prototype.calculatePoints =
    function(){
        this._points = new Float32Array(Circle.prototype._slices*3*2);
        var width = this._width/2.0;
        var degree = 360.0/Circle.prototype._slices;
        var startAngle = 0.0;
        var endAngle = 0.0;
        var center = new Float32Array([0,0]);

        for(var i=0; i<Circle.prototype._slices; i++) {
            this._points[(i)*2*3 + 0] = center[0];
            this._points[(i)*2*3 + 1] = center[1];

            startAngle = (i) * degree;
            endAngle = (i+1) * degree;


            this._points[(i)*2*3 + 2] = center[0] - ((Math.sin(CGMath.toRadians(startAngle))*width));
            this._points[(i)*2*3 + 3] = center[1] + ((Math.cos(CGMath.toRadians(startAngle))*width));
            this._points[(i)*2*3 + 4] = center[0] - ((Math.sin(CGMath.toRadians(endAngle))*width));
            this._points[(i)*2*3 + 5] = center[1] + ((Math.cos(CGMath.toRadians(endAngle))*width));

        }
    };

Circle.prototype.updateLocalBuffer =
    function(){
        this.updateBoundingBox();

        if (this._transform) {

            this._updateTransformMatrix();

            var point = new Float32Array(4);
            point[3] = 1.0;
            var result = new Float32Array(4);

            for(var i=0; i<this._points.length; i+=2) {

                point[0] = this._points[i];
                point[1] = this._points[i+1];

                CGMath.multMatVec4(this._transformMatrix, point, result);

                this._localPointBuffer[i] = result[0];
                this._localPointBuffer[i + 1] = result[1];
            }

            this._transformBoundingBox();
        } else {

            for(var i=0; i<this._points.length; i++)
                this._localPointBuffer[i] = this._points[i];
        }

        this._needLocalUpdate = false;
    };

Circle.prototype.render =
    function(layer){
        if (this._needLocalUpdate)
            this.updateLocalBuffer();

        layer.renderTriangles(this._localPointBuffer, this._localPointBuffer.length, this._circleColor);



        if (this._dispBbox){
            layer.renderLines(this._bbox.getBoundingBoxLines(), 16, this._bboxColor);
            layer.renderPoints(this._bbox._center, 2, this._bboxColor);
        }

        this._needLayerUpdate = false;
    };

