function Lines(points, color){

PlanarObject.call(this);

this._points = points;

this._color = color;

this._localPointBuffer = new Float32Array(points.length);

}

Lines.prototype = new PlanarObject();
Lines.prototype.constructor = Lines;

Lines.prototype.updateLines =
    function(points){
        this._points = points;
        this._localPointBuffer = new Float32Array(points.length);
        this._needLocalUpdate = true;
    };

Lines.prototype.updateColor =
    function(color){
        this._color = color;
        this._needLocalUpdate = true;
    };

Lines.prototype.updateLocalBuffer =
    function(){
        if(this._transform){
            this._updateTransformMatrix();

            var point = new Float32Array(4);
            point[3] = 1.0;
            var result = new Float32Array(4);
            for(var i=0; i<this._points.length; i+=2){
                point[0] = this._points[i];
                point[1] = this._points[i+1];
                CGMath.multMatVec4(this._transformMatrix, point, result);
                this._localPointBuffer[i] = result[0];
                this._localPointBuffer[i+1] = result[1];
            }

            this._transformBoundingBox();

        } else {
            for(var i=0; i<this._points.length; i++){
                this._localPointBuffer[i] = this._points[i];
            }
        }

        this._needLocalUpdate = true;
    };

Lines.prototype.render =
    function(layer){
        if(this._needLocalUpdate)
            this.updateLocalBuffer();

        layer.renderLines(this._localPointBuffer, this._localPointBuffer.length, this._color);

        if(this._dispBbox)
            layer.renderLines(this._bbox.getBoundingBoxLines(), 16, this._bboxColor);

        this._needLayerUpdate = false;

    };
