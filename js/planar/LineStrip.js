function LineStrip(points, color){

PlanarObject.call(this);

this._points = points;

this._color = color;

this._localPointBuffer = new Float32Array((points.length>0?points.length-1:0)*4);

}

LineStrip.prototype = new PlanarObject();
LineStrip.prototype.constructor = LineStrip;

LineStrip.prototype.updateLines =
    function(points){
        this._points = points;
        this._localPointBuffer = new Float32Array((points.length>0?points.length-1:0)*4);
        this._needLocalUpdate = true;
    };

LineStrip.prototype.updateColor =
    function(color){
        this._color = color;
        this._needLocalUpdate = true;
    };

LineStrip.prototype.updateLocalBuffer =
    function(){
                
        //this.updateBoundingBox();
                
        if (this._transform) {
                        
            this._updateTransformMatrix();
                        
            var point = new Float32Array(4);
            point[3] = 1.0;
            var result = new Float32Array(4);
            for (var i=0; i<this._points.length; i+=2) {
                                
                point[0] = this._points[i];
                point[1] = this._points[i+1];

                CGMath.multMatVec4(this._transformMatrix, point, result);
                                
                if (i!=0) {
                    this._localPointBuffer[i*2 -2] = result[0];
                    this._localPointBuffer[i*2 -1] = result[1];
                }
                                
                if (i!=this._points.length-1) {
                    this._localPointBuffer[i*2] = result[0];
                    this._localPointBuffer[i*2 + 1] = result[1];
                }
                                
            }
                        
            this._transformBoundingBox();
                        
        } else {
            for (var i=2; i<this._points.length; i+=2) {
                this._localPointBuffer[(i-2)*2] = this._points[i-2];
                this._localPointBuffer[(i-2)*2+1] = this._points[i-1];
                this._localPointBuffer[(i-2)*2+2] = this._points[i];
                this._localPointBuffer[(i-2)*2+3] = this._points[i+1];
            }
        }
                        
                
        this._needLocalUpdate = false;
    };

LineStrip.prototype.render =
    function(layer) {

        if (this._needLocalUpdate)
            this.updateLocalBuffer();
        //console.log("strip_points: "+CGMath._buffStr(this._points, 0, this._points.length, 2));
        //console.log("strip: "+CGMath._buffStr(this._localPointBuffer, 0, this._localPointBuffer.length, 2));
        layer.renderLines(this._localPointBuffer, this._localPointBuffer.length, this._color);

        if (this._dispBbox)
            layer.renderLines(this._bbox.getBoundingBoxLines(), 16, this._bboxColor);

        this._needLayerUpdate = false;
    };

