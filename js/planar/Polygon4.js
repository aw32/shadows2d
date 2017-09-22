function Polygon4(points){

PlanarObject.call(this);

if (points === null)
    this._points = [[0,0],[0,0],[0,0],[0,0]];
else
    this._points = points;

this._color = new Color(0,1,0,1);

this._localPointBuffer = new Float32Array(12);

this.updateBoundingBox();

}

Polygon4.prototype = new PlanarObject();
Polygon4.prototype.constructor = Polygon4;

Polygon4.prototype.updatePoints =
    function(points){
        this._points = points;
        this._needLocalUpdate = true;
    };

Polygon4.prototype.updateColor =
    function(color){
        this._color = color;
        this._needLocalUpdate = true;
    };

Polygon4.prototype.updateBoundingBox =
    function(){
        
        var min_x = this._points[0][0];
        var max_x = this._points[0][0];
        var min_y = this._points[0][1];
        var max_y = this._points[0][1];
        for(var i=1; i<4; i++) {
            if(this._points[i][0]<min_x)
                min_x = this._points[i][0];
            if(this._points[i][0]>max_x)
                max_x = this._points[i][0];
            if(this._points[i][1]<min_y)
                min_y = this._points[i][1];
            if(this._points[i][1]>max_y)
                max_y = this._points[i][1];
        }
                
        this._bbox._center = new Float32Array([
                 (min_x + max_x) * 0.5,
                 (min_y + max_y) * 0.5
        ]);
        this._bbox._axes = new Axes(0,1,1,0);
        this._bbox._extent_axis1 = max_x - min_x;
        this._bbox._extent_axis2 = max_y - min_y;
    };

Polygon4.prototype.updateLocalBuffer =
    function(){
        this.updateBoundingBox();
        
        if(this._transform){
            this._initialTranslate[0] = - this._bbox._center[0];
            this._initialTranslate[1] = - this._bbox._center[1];

            this._updateTransformMatrix();
        
            this._transformBoundingBox();

            var point = new Float32Array(4);
            point[3] = 1.0;
            var result = new Float32Array(4);
            
            for(var i=0; i<this._points.length; i++){
                point[0] = this._points[i][0];
                point[1] = this._points[i][1];
                CGMath.multMatVec4(this._transformMatrix, point, result);
                this._localPointBuffer[i*2 + 0] = result[0];
                this._localPointBuffer[i*2 + 1] = result[1];
            }

        } else {
            this._localPointBuffer.set([
                this._points[0][0], this._points[0][1],
                this._points[1][0], this._points[1][1],
                this._points[2][0], this._points[2][1],
                this._points[2][0], this._points[2][1],
                this._points[3][0], this._points[3][1],
                this._points[0][0], this._points[0][1]
            ]);
        }
        

        this._needLocalUpdate = false;
    };

Polygon4.prototype.render =
    function(layer){
    
        if (this._needLocalUpdate)
            this.updateLocalBuffer();
                
        layer.renderTriangles(this._localPointBuffer, this._localPointBuffer.length, this._color);
        if (this._dispBbox) {
            layer.renderLines([
                                this._points[0][0], this._points[0][1],
                                this._points[1][0], this._points[1][1],
                                this._points[1][0], this._points[1][1],
                                this._points[2][0], this._points[2][1],
                                this._points[2][0], this._points[2][1],
                                this._points[3][0], this._points[3][1],
                                this._points[3][0], this._points[3][1],
                                this._points[0][0], this._points[0][1]
                        ], 16, this._bboxColor);
        }
                
        this._needLayerUpdate = false;


    };
