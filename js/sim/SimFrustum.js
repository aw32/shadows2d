function SimFrustum(){

this._frustum_points = new Float32Array(10);

this._frustumOutline = new LineStrip([], new Color(1,1,1,1));

this._showOnlyNearPlane = false;

}

SimFrustum.prototype.getFrustumPoints =
    function(){
        return this._frustum_points;
    };

SimFrustum.prototype.showFrustum =
    function(show){
        this._frustumOutline.setDisplay(show);
    };

SimFrustum.prototype.showOnlyNearPlane =
    function(show){
        this._showOnlyNearPlane = show;
    };

SimFrustum.prototype.infinitePerspective =
    function(pmv, resolution, infiniteBoundary){
                var viewport = new Float32Array([0,0,resolution,resolution]);
                var unproject = Tools.createUnprojectMatrixPMV(pmv, viewport);



                var lbn = new Float32Array(4);
                var rbn = new Float32Array(4);
                var lbf = new Float32Array(4);
                var rbf = new Float32Array(4);
                
                var lbf2 = new Float32Array(4);
                var rbf2 = new Float32Array(4);
                
                Tools.unproject(0, 0, -1, unproject, lbn);
                Tools.unproject(resolution, 0, -1, unproject, rbn);
                Tools.unproject(0, 0, infiniteBoundary, unproject, lbf);
                Tools.unproject(resolution, 0, infiniteBoundary, unproject, rbf);
                
                Tools.unproject(0, 0, infiniteBoundary-0.01, unproject, lbf2);
                Tools.unproject(resolution, 0, infiniteBoundary-0.01, unproject, rbf2);
                
                this._frustum_points = new Float32Array([
                                lbn[0], lbn[1],
                                rbn[0], rbn[1],
                                rbf[0], rbf[1],
                                lbf[0], lbf[1],
                                lbn[0], lbn[1],
                                lbf2[0], lbf2[1],
                                rbf2[0], rbf2[1]
                        ]);
    };

SimFrustum.prototype.perspective =
    function(pmv, position, direction, fovy, aspect, zNear, zFar, resolution){
                var viewport = new Float32Array([0,0,resolution,resolution]);
                var unproject = Tools.createUnprojectMatrixPMV(pmv, viewport);



                var lbn = new Float32Array(4);
                var rbn = new Float32Array(4);
                var lbf = new Float32Array(4);
                var rbf = new Float32Array(4);


                Tools.unproject(0, 0, -1, unproject, lbn);
                Tools.unproject(resolution, 0, -1, unproject, rbn);
                Tools.unproject(0, 0, 1, unproject, lbf);
                Tools.unproject(resolution, 0, 1, unproject, rbf);


                this._frustum_points = new Float32Array([
                                lbn[0], lbn[1],
                                rbn[0], rbn[1],
                                rbf[0], rbf[1],
                                lbf[0], lbf[1],
                                lbn[0], lbn[1]
                        ]);
                //console.log("frus_pers: "+CGMath._buffStr(this._frustum_points, 0, 10, 2));
/*
// old code
                var pmvMat = new Float32Array(16);
                var pMat = pmv.getProjectionMatrix();
                var mvMat = pmv.getModelviewMatrix();
                
                
                CGMath.multMat4(pMat, mvMat, pmvMat);
               
                Frustum frustum = new Frustum();
                frustum.updateByPMV(pmvMat, 0);
                
                Plane[] planes = frustum.getPlanes();
                
                float[] lbn = MathTools.intersectPlanes(planes[0],planes[2],planes[4]);
                float[] rbn = MathTools.intersectPlanes(planes[1],planes[2],planes[4]);
                float[] lbf = MathTools.intersectPlanes(planes[0],planes[2],planes[5]);
                float[] rbf = MathTools.intersectPlanes(planes[1],planes[2],planes[5]);
                
                frustum_points = new float[]{
                                lbn[0], lbn[1],
                                rbn[0], rbn[1],
                                rbf[0], rbf[1],
                                lbf[0], lbf[1],
                                lbn[0], lbn[1]
                        };
*/
    };

SimFrustum.prototype.orthogonal =
    function(position, direction, left, right, bottom, top, zNear, zFar) {
        // update positions
        var cross = new Float32Array(3);
        CGMath.crossVec3([0,0,1],[direction[0], direction[1], 0.0], cross);
        var orthoLeft = new Float32Array(3);
        CGMath.normalizeVec3(cross, orthoLeft);
        this._frustum_points = new Float32Array([
                                position[0] + direction[0]*zNear + orthoLeft[0]*left,
                                position[1] + direction[1]*zNear + orthoLeft[1]*left,
                                position[0] + direction[0]*zNear + orthoLeft[0]*right,
                                position[1] + direction[1]*zNear + orthoLeft[1]*right,
                                position[0] + direction[0]*zFar + orthoLeft[0]*right,
                                position[1] + direction[1]*zFar + orthoLeft[1]*right,
                                position[0] + direction[0]*zFar + orthoLeft[0]*left,
                                position[1] + direction[1]*zFar + orthoLeft[1]*left,
                                position[0] + direction[0]*zNear + orthoLeft[0]*left,
                                position[1] + direction[1]*zNear + orthoLeft[1]*left
        ]);
        //console.log("frus_orth: "+CGMath._buffStr(this._frustum_points, 0, 10, 2));
    };

SimFrustum.prototype.updateFrustum =
    function(){
        if (!this._showOnlyNearPlane)
            this._frustumOutline.updateLines(this._frustum_points);
        else
            this._frustumOutline.updateLines([
                     this._frustum_points[0], this._frustum_points[1],
                     this._frustum_points[2], this._frustum_points[3]
            ]);
    };

SimFrustum.prototype.addToLayer =
    function(layer){
        layer.addObject(this._frustumOutline);
    };
        
SimFrustum.prototype.removeFromLayer =
    function(layer){
        layer.removeObject(this._frustumOutline);
    };


