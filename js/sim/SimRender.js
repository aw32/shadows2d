function SimRender(pmv, resolution){

this._resolution = resolution;

this._pmv = pmv;

this._depthBuffer = null;

this._colorBuffer = null;

this._rays = null;

this._ray_bias = 0;

this._createBuffers(resolution);
this._clear();
}


SimRender.prototype._createBuffers =
    function(resolution){
        this._depthBuffer = new Float32Array(resolution);
        this._colorBuffer = new Array(resolution);
        this._rays = new Array(resolution);
        for(var i=0; i<resolution; i++) {
            this._rays[i] = new Polygon4(null);
            if (i%2 == 0)
                this._rays[i].updateColor(new Color(0.8,0.8,0.8,0.3));
            else
                this._rays[i].updateColor(new Color(0.6,0.6,0.6,0.3));
        }
    };

SimRender.prototype._clear =
    function(){
        for(var i = 0; i< this._resolution; i++) {
            this._depthBuffer[i] = 1;
            this._colorBuffer[i] = null;
        }
    };

SimRender.prototype.changeResolution =
    function(newRes, layer){
        this.removeFromLayer(layer);
        this._resolution = newRes;
        this._createBuffers(newRes);
        this.addToLayer(layer);
    };

SimRender.prototype.showRenderRays =
    function(show) {
        for(var i=0; i<this._rays.length; i++)
            this._rays[i].setDisplay(show);
    };

SimRender.prototype.showOnlySingleRenderRay =
    function(i) {
        for(var j=0; j<this._rays.length; j++)
            this._rays[j].setDisplay( j == i );
    };

SimRender.prototype.getColorBuffer =
    function(){
         return this._colorBuffer;
    };

SimRender.prototype.getDepthBuffer =
    function(){
        return this._depthBuffer;
    };

SimRender.prototype.setRayBias =
    function(value) {
        this._ray_bias = value;
    };

SimRender.prototype.getRayBias =
    function() {
        return this._ray_bias;
    };

SimRender.prototype.update =
    function(usualCamera) {
        var nearPoints = new Array(this._resolution+1);//[4];
        for(var i=0; i<nearPoints.length; i++)
            nearPoints[i] = new Float32Array(4);
        var farLeftPoints = new Array(this._resolution);//[4];
        for(var i=0; i<farLeftPoints.length; i++)
            farLeftPoints[i] = new Float32Array(4);
        var farRightPoints = new Array(this._resolution);//[4];
        for(var i=0; i<farRightPoints.length; i++)
            farRightPoints[i] = new Float32Array(4);
   
        var viewport = new Float32Array([0,0,this._resolution,this._resolution]);
                
        
        var infiniteBoundary = usualCamera.getInfiniteBoundary();
               
        this._pmv = usualCamera._pmv; 
        var unprojectMatrix = Tools.createUnprojectMatrixPMV(this._pmv, viewport);
                
        for(var i=0; i< this._resolution+1; i++) {
            Tools.unproject(i, 0, -1, unprojectMatrix, nearPoints[i]);
        }
        for(var i=0; i< this._resolution; i++) {
                        
            if (usualCamera.getProjection() == SimCamera.prototype.PROJECTION.INFINITE_PERSPECTIVE && this._depthBuffer[i] + this._ray_bias > infiniteBoundary) {
                Tools.unproject(i, 0, infiniteBoundary, unprojectMatrix, farLeftPoints[i]);
                Tools.unproject(i+1, 0, infiniteBoundary, unprojectMatrix, farRightPoints[i]);
            } else {
                Tools.unproject(i, 0, this._depthBuffer[i] + this._ray_bias, unprojectMatrix, farLeftPoints[i]);
                Tools.unproject(i+1, 0, this._depthBuffer[i] + this._ray_bias, unprojectMatrix, farRightPoints[i]);
            }
        }

        //console.log("near: "+CGMath.vec2Str(nearPoints[0]));

        for(var i=0; i<this._rays.length; i++) {
                        var points = [new Float32Array(2), new Float32Array(2), new Float32Array(2), new Float32Array(2)];
                        points[0][0] = nearPoints[i][0];
                        points[0][1] = nearPoints[i][1];
                        points[1][0] = nearPoints[i+1][0];
                        points[1][1] = nearPoints[i+1][1];
                        points[2][0] = farRightPoints[i][0];
                        points[2][1] = farRightPoints[i][1];
                        points[3][0] = farLeftPoints[i][0];
                        points[3][1] = farLeftPoints[i][1];
                        this._rays[i].updatePoints(points);
        }
    };

SimRender.prototype.addToLayer =
    function(layer) {
        for(var i=0; i<this._resolution; i++){
            layer.addObject(this._rays[i]);
        }
    };

SimRender.prototype.removeFromLayer =
    function(layer) {
        for(var i=0; i<this._resolution; i++){
            layer.removeObject(this._rays[i]);
        }
    };

SimRender.prototype.unprojectFragment =
    function(i){
        var result = new Float32Array(2);
        var point = new Float32Array(4);
                
        var viewport = [
            0,0, this._resolution, this._resolution
        ];
                
        var unprojectMatrix = Tools.createUnprojectMatrixPMV(this._pmv, viewport);
                
        Tools.unproject(i+0.5, 0, this._depthBuffer[i], unprojectMatrix, point);
                
        result[0] = point[0];
        result[1] = point[1];
                
        return result;
    };

SimRender.prototype.render =
    function(object) {
        var lines = object.getLines();
        var color = object.getColor();
                
        var viewport = [0,0,this._resolution,this._resolution];
        var projectMatrix = Tools.createProjectMatrixPMV(this._pmv);
                
        var pointOne = new Float32Array(4);
        var pointTwo = new Float32Array(4);
        var nearPlane = -1;
        var farPlane = 1;
        var outside;
        // points for intersection test
        var line_delta_x, line_delta_z;
        var frag_x, frag_z, frag_t;
                
        for(var i=0; i< lines.length; i+=4) {
                        
            Tools.project(lines[i], lines[i+1], 0, projectMatrix, pointOne);
            Tools.project(lines[i+2], lines[i+3], 0, projectMatrix, pointTwo);
                        
            outside = Tools.clip2dh(pointOne, pointTwo);
                        
            if (outside)
                continue;
                        
            // Divide by w
            Tools.divideByW(pointOne);
            Tools.divideByW(pointTwo);
                        
            // Scale to screen space
            Tools.scaleToScreenSpace(pointOne, viewport);
            Tools.scaleToScreenSpace(pointTwo, viewport);

            if ( (pointOne[0]<0 && pointTwo[0]<0) || (pointOne[0]>=this._resolution && pointTwo[0]>=this._resolution))
                continue;
                        
            line_delta_x = pointTwo[0] - pointOne[0];
            line_delta_z = pointTwo[2] - pointOne[2];
            for(var j=0; j<this._resolution; j++) {
                frag_x = j + 0.5;
                               
                if (  !(frag_x<pointOne[0] && frag_x>pointTwo[0]) && !(frag_x>pointOne[0] && frag_x<pointTwo[0])  )
                    continue;
                                
                frag_t = (frag_x - pointOne[0]) / line_delta_x;
                                
                if (frag_t<0 || frag_t>1)
                    continue;
                                
                frag_z = pointOne[2] + frag_t * line_delta_z;
                                
                if (frag_z<nearPlane || frag_z>farPlane)
                    continue;
                                
                // z Test
                if (frag_z <= this._depthBuffer[j]) {
                    this._depthBuffer[j] = frag_z;
                    this._colorBuffer[j] = color;
                }
            }
        }
    };

SimRender.prototype.limitDepthBufferPrecision =
    function(bitDepth) {
        if (bitDepth == 0)
            return;

        var part =   2.0 / Math.pow(2, bitDepth);
                
        for (var i=0; i<this._depthBuffer.length; i++){

           this._depthBuffer[i] = ((Math.round((this._depthBuffer[i] + 1.0) / part) * part) - 1.0);
        }
    };

SimRender.prototype.depthString =
    function() {
        var result = "";
        for(var i=0; i< this._resolution; i++)
            result +=    i==0 ? this._depthBuffer[i] : ","+this._depthBuffer[i];
        return result;
    };

SimRender.prototype.colorString =
    function() {
        var result = "";
        for(var i=0; i< this._resolution; i++)
            if (this._colorBuffer[i] != null)
                result +=    i==0 ? this._colorBuffer[i].hex() : ","+this._colorBuffer[i].hex();
            else
                result +=    i==0 ? "#XXXXXXXX" : ",#XXXXXXXX";
        return result;
    };

