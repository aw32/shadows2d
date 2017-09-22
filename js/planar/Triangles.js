function Triangles(points, color, direction){

PlanarObject.call(this);

this._points = points;

this._trianglesColor = color;

this._direction = direction;

this._localPointBuffer = new Float32Array(points.length);

}

Triangles.prototype = new PlanarObject();
Triangles.prototype.constructor = Triangles;

Triangles.prototype.updateColor =
    function(color){
        this._trianglesColor = color;
        this._needLocalUpdate = true;
    };

Triangles.prototype.updatePoints =
    function(points){
        this._points = points;
        this._localPointBuffer = new Float32Array(points.length);
        this._needLocalUpdate = true;
    };

Triangles.prototype.updateBoundingBox =
    function(){
        // define shape's axes
        var axis1 = new Float32Array(3);
        CGMath.normalizeVec3([this._direction[0], this._direction[1], 0.0],axis1);
        this._bbox._axes._axis1_x = axis1[0];
        this._bbox._axes._axis1_y = axis1[1];
        var cross = new Float32Array(3);
        CGMath.crossVec3(axis1, [0,0,1], cross);
        var axis2 = new Float32Array(3);
        CGMath.normalizeVec3(cross, axis2);
        this._bbox._axes._axis2_x = axis2[0];
        this._bbox._axes._axis2_y = axis2[1];

        var q = new Quaternion();
        var cross = new Float32Array(3);
        var ax1 = [this._bbox._axes._axis2_x, this._bbox._axes._axis2_y, 0.0];
        var ax2 = [0,1,0];
//        CGMath.crossVec3(ax1,ax2, cross);
        cross = [0,0,1];
//        var angle = CGMath.dotVec3(ax1,ax2);
        var angle = CGMath.angleVec3(ax1,ax2);
        q.axisAngle(cross, angle); 
        var rotM = new Float32Array(16);
        q.toMatrix4(rotM);
        var f = new Float32Array(4);
        f[3] = 1.0;
        var axis1_min = 0;
        var axis1_max = 0;
        var axis2_min = 0;
        var axis2_max = 0;
        var result = new Float32Array(4);
        for (var i=0; i<this._points.length; i+=2) {
            f[0] = this._points[i];
            f[1] = this._points[i + 1];
            CGMath.multMatVec4(rotM, f, result);
            f[0] = result[0];
            f[1] = result[1];
            if (i==0 || f[0]<axis1_min) {
                axis1_min = f[0];
            }
            if (i==0 || f[0]>axis1_max) {
                axis1_max = f[0];
            }
            if (i==0 || f[1]<axis2_min) {
                axis2_min = f[1];
            }
            if (i==0 || f[1]>axis2_max) {
                axis2_max = f[1];
            }
        }
        var center = new Float32Array([
            (axis1_min + axis1_max)/2,
            (axis2_min + axis2_max)/2,
            0.0,
            1.0
        ]);
        q.inverse();
        q.toMatrix4(rotM);
        CGMath.multMatVec4(rotM, center, result);

        q.rotateVector(center, center);
               
        this._bbox._center[0] = result[0];
        this._bbox._center[1] = result[1];
        this._bbox._extent_axis1 = (axis1_max - axis1_min)/2;
        this._bbox._extent_axis2 = (axis2_max - axis2_min)/2;
    };

Triangles.prototype.updateLocalBuffer =
    function(){
        this.updateBoundingBox();
                if (this._transform) {
                        this._initialTranslate[0] = - this._bbox._center[0];
                        this._initialTranslate[1] = - this._bbox._center[1];
                        
                        //this.translate[0] = bbox.center[0];
                        //this.translate[1] = bbox.center[1];
                        
                        // transform points
                        
                        this._updateTransformMatrix();
                        
                        var point = new Float32Array(4);
                        point[3] = 1.0;
                        var result = new Float32Array(4);
                        
                        for (var i=0; i<this._points.length; i+=2) {
                                
                                point[0] = this._points[i];
                                point[1] = this._points[i+1];
                                CGMath.multMatVec4(this._transformMatrix, point, result);
                                this._localPointBuffer[i] = result[0];
                                this._localPointBuffer[i+1] = result[1];
                                
                        }
                        
                        this._transformBoundingBox();
                        
                } else {
                        for (var i=0; i<this._points.length; i+=2) {
                                this._localPointBuffer[i] = this._points[i];
                                this._localPointBuffer[i+1] = this._points[i+1];
                        }
                        
                }
                
                this._needLocalUpdate = false;
    };

Triangles.prototype.render =
    function(layer){
        if (this._needLocalUpdate)
                        this.updateLocalBuffer();
                
                layer.renderTriangles(this._localPointBuffer, this._localPointBuffer.length, this._trianglesColor);
                
                if (this._dispBbox) {
                        layer.renderLines(this._bbox.getBoundingBoxLines(), 16, this._bboxColor);
                }
                
                
                
                this._needLayerUpdate = false;
    };
