function Rect(){

PlanarObject.call(this);

this._points = null;

this._rectColor = new Color(0.0, 1.0, 0.0, 1.0);

this._localPointBuffer = new Float32Array(12);

}

Rect.prototype = new PlanarObject();
Rect.prototype.constructor = Rect;

Rect.prototype.set =
    function(x,y,width,height){
        this._points = [];

        this._points[0] = new Float32Array([x,y]);
        this._points[1] = new Float32Array([x + width,y]);
        this._points[2] = new Float32Array([x + width,y + height]);
        this._points[3] = new Float32Array([x,y + height]);

        this._needLocalUpdate = true;
    };

Rect.prototype.setPoints =
    function(points){
        this._points = points;
    };

Rect.prototype.setColor =
    function(color){
        this._rectColor = color;
        this._needLocalUpdate = true;
    };

Rect.prototype.updateBoundingBox =
    function(){
        
        this._bbox._center = new Float32Array([
            this._points[0][0] + ( this._points[1][0] - this._points[0][0] )/2.0 + (this._points[2][0] - this._points[1][0] )/2.0,
            this._points[0][1] + ( this._points[1][1] - this._points[0][1] )/2.0 + (this._points[2][1] - this._points[1][1] )/2.0
        ]);

        var normAxeX = new Float32Array([this._points[1][0] - this._points[0][0], this._points[1][1] - this._points[0][1], 0.0]);
        CGMath.normalizeVec3(normAxeX, normAxeX);

        var normAxeY = new Float32Array([this._points[2][0] - this._points[1][0], this._points[2][1] - this._points[1][1], 0.0]);
        CGMath.normalizeVec3(normAxeY, normAxeY);
        
        this._bbox._axes = new Axes(normAxeX[0], normAxeX[1],
                    normAxeY[0], normAxeY[1]);

        this._bbox._extent_axis1 = CGMath.distVec3([this._points[0][0], this._points[0][1], 0.0],[this._points[1][0], this._points[1][1], 0.0]) / 2.0 + 0.01

        this._bbox._extent_axis2 = CGMath.distVec3([this._points[1][0], this._points[1][1], 0.0],[this._points[2][0], this._points[2][1], 0.0]) / 2.0 + 0.01;
    };

Rect.prototype.render =
    function(layer){
        if(this._needLocalUpdate){

            this.updateBoundingBox();

            if(this._transform){
                this._initialTranslate[0] = - this._bbox._center[0];
                this._initialTranslate[1] = - this._bbox._center[1];

                this._translate[0] = this._bbox._center[0];
                this._translate[1] = this._bbox._center[1];

                this._updateTransformMatrix();

                this._transformBoundingBox();

                var point = new Float32Array(4);
                point[3] = 1.0; 
                var result = new Float32Array(4);

                for(var i=0; i<this._points.length; i++) {

                    point[0] = this._points[i][0];
                    point[1] = this._points[i][1];

                    CGMath.multVec4(this._transformMatrix, point, result);

                    this._localPointBuffer[i*2 + 0] = result[0];
                    this._localPointBuffer[i*2 + 1] = result[1];
                }
            } else {
                for(var i=0; i<this._points.length; i++) {
                    this._localPointBuffer[i*2 + 0] = this._points[i][0];
                    this._localPointBuffer[i*2 + 1] = this._points[i][1];
                }
            }


            this._localPointBuffer[8] = this._localPointBuffer[0];
            this._localPointBuffer[9] = this._localPointBuffer[1];
            this._localPointBuffer[10] = this._localPointBuffer[4];
            this._localPointBuffer[11] = this._localPointBuffer[5];

            this._needLocalUpdate = false;
        }

        layer.renderTriangles(this._localPointBuffer, this._localPointBuffer.length, this._rectColor);

        if (this._dispBbox) {
            layer.renderLines(this._bbox.getBoundingBoxLines(), 16, this._bboxColor);
        }

        this._needLayerUpdate = false;
    };
