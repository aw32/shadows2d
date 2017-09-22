Tools = {};

Tools.createUnprojectMatrixPMV =
    function(pmv, viewport){

        var projM = Tools.createProjectMatrixPMV(pmv);
        var f = new Float32Array(4);
        Tools.projectPoint(1,1,1,projM,[0,0,10,10],f);
        

        var modelMatrix = pmv.getModelViewMatrix();
        var projMatrix = pmv.getProjectionMatrix();
        var unprojectMatrix = new Float32Array(16);
   
        var viewportMatrix = new Float32Array([
            0.5*viewport[2], 0, 0,0,
            0, 0.5*viewport[3], 0, 0,
            0, 0, 1, 0,
            0.5 * viewport[2] + viewport[0], 0.5 * viewport[3] + viewport[1], 0, 1
        ]);
         
        var temp = new Float32Array(16);
        //CGMath.multMat4(viewportMatrix, projMatrix, viewportMatrix);
        CGMath.multMat4(viewportMatrix, projMatrix, temp);
        
        //CGMath.multMat4(viewportMatrix, modelMatrix, unprojectMatrix);
        CGMath.multMat4(temp, modelMatrix, unprojectMatrix);


        //CGMath.inverseMat4(unprojectMatrix, unprojectMatrix); 
        CGMath.inverseMat4(unprojectMatrix, temp);

        var x = new Float32Array(4);
        Tools.unproject(f[0],f[1],f[2],temp,x);
        //console.log("result: "+CGMath.vec4Str(x));

        return temp;
        //return unprojectMatrix;
    };

Tools.createUnprojectMatrix =
    function(modelMatrix, projMatrix, viewport){
        var unprojectMatrix = new Float32Array(16);
                
        var viewportMatrix = new Float32Array([
            0.5*viewport[2], 0, 0,0,
            0, 0.5*viewport[3], 0, 0,
            0, 0, 1, 0,
            0.5 * viewport[2] + viewport[0], 0.5 * viewport[3] + viewport[1], 0, 1
                        ]);
                
        CGMath.multMat4(viewportMatrix, projMatrix, viewportMatrix);
        CGMath.multMat4(viewportMatrix, modelMatrix, unprojectMatrix);
        
        CGMath.inverseMat4(unprojectMatrix, unprojectMatrix); 
                
        return unprojectMatrix;
    };

Tools.unproject =
    function(winx, winy, winz, unprojectMatrix,  out) {
                
        var inV = new Float32Array(4);
                
        inV[0] = winx;
        inV[1] = winy;
        inV[2] = winz;
        inV[3] = 1.0;
                
        CGMath.multMatVec4(unprojectMatrix, inV, out);
        
        if (out[3] != 0)
            out[3] = 1.0 / out[3];
        out[0] = out[0] * out[3];
        out[1] = out[1] * out[3];
        out[2] = out[2] * out[3];
                
    };

Tools.unproject4 =
    function(winx, winy, winz, winw, unprojectMatrix, out) {
                
        var inV = new Float32Array(4);
                
        inV[0] = winx;
        inV[1] = winy;
        inV[2] = winz;
        inV[3] = winw;
                
        CGMath.multMatVec4(unprojectMatrix, inV, out);
                
        if (out[3] != 0)
            out[3] = 1.0 / out[3];
        out[0] = out[0] * out[3];
        out[1] = out[1] * out[3];
        out[2] = out[2] * out[3];    
    };

Tools.createProjectMatrixPMV =
    function(pmv) {
                
        var modelMatrix = pmv.getModelViewMatrix();
        var projMatrix = pmv.getProjectionMatrix();
                
        var projectMatrix = new Float32Array(16);

        CGMath.multMat4(projMatrix, modelMatrix, projectMatrix);
                
        return projectMatrix;
    };

Tools.createProjectMatrix =
    function(modelMatrix, projMatrix){
        var projectMatrix = new Float32Array(16);

        CGMath.multMat4(projMatrix, modelMatrix, projectMatrix);

        return projectMatrix;
    };

Tools.project =
    function(objx, objy, objz, projectMatrix, win){
        var inV = new Float32Array(4);
                
        inV[0] = objx;
        inV[1] = objy;
        inV[2] = objz;
        inV[3] = 1.0;
       
        CGMath.multMatVec4(projectMatrix, inV, win);         
    };

Tools.project4 =
    function(objx, objy, objz, objw, projectMatrix, win){
        var inV = new Float32Array(4);
                 
        inV[0] = objx;
        inV[1] = objy;
        inV[2] = objz;
        inV[3] = objw;

        CGMath.multMatVec4(projectMatrix, inV, win);    
    };

Tools.projectPoint =
    function(objx, objy, objz, projectMatrix, viewport, win){
        var clipped = false;
        Tools.project(objx, objy, objz, projectMatrix, win);
        clipped = Tools.clip2dhPoint(win);
        Tools.divideByW(win);
        Tools.scaleToScreenSpace(win, viewport);
        return clipped;
    };

Tools.projectPoint4 =
    function(objx, objy, objz, objw, projectMatrix, viewport, win){
        var clipped = false;
        Tools.project4(objx, objy, objz, objw, projectMatrix, win);
        clipped = Tools.clip2dhPoint(win);
        Tools.divideByW(win);
        Tools.scaleToScreenSpace(win, viewport);
        return clipped;
    };

Tools.projectLine =
    function(objx1, objy1, objz1,
             objx2, objy2, objz2,
             projectMatrix, viewport, win1, win2){
        var clipped;
        Tools.project(objx1, objy1, objz1, projectMatrix, win1);
        Tools.project(objx2, objy2, objz2, projectMatrix, win2);
        clipped = Tools.clip2dh(win1, win2);
        Tools.divideByW(win1);
        Tools.divideByW(win2);
        Tools.scaleToScreenSpace(win1, viewport);
        Tools.scaleToScreenSpace(win2, viewport);
        return clipped;
    };

Tools.projectLine4 =
    function(objx1, objy1, objz1, objw1,
             objx2, objy2, objz2, objw2,
             projectMatrix, viewport, win1, win2){
        var clipped;
        Tools.project4(objx1, objy1, objz1, objw1, projectMatrix, win1);
        Tools.project4(objx2, objy2, objz2, objw2, projectMatrix, win2);
        clipped = Tools.clip2dh(win1, win2);
        Tools.divideByW(win1);
        Tools.divideByW(win2);
        Tools.scaleToScreenSpace(win1, viewport);
        Tools.scaleToScreenSpace(win2, viewport);
        return clipped;
    };

Tools.clip2dhPoint =
    function(one){
        if (one[3] > one[0] && one[3] > -one[0])
            if (one[3] > one[2] && one[3] > one[2])
                return false;

        return true;
    };

Tools.clip2dh =
    function(one, two) {
        var t = new Float32Array(2);
        var delta_x = 0;
        var delta_y = 0
        var delta_w = 0;

        t[0] = 0;
        t[1] = 1;
        delta_w = two[3] - one[3];
        delta_x = two[0] - one[0];
        // check for lower x-boundary
        if ( Tools.clipt( -(delta_w+delta_x), (one[3]+one[0]), t) )
            // check for upper x-boundary
            if ( Tools.clipt( -(delta_w-delta_x), -(one[0]-one[3]), t) ) {
                delta_y = two[2] - one[2];
                // check for lower z-boundary
                if ( Tools.clipt( -(delta_w+delta_y), one[3]+one[2], t) )
                    // check for upper z-boundary
                    if ( Tools.clipt( -(delta_w-delta_y), -(one[2]-one[3]), t) ) {
                        // line segment may need to be shortened
                        if (t[1] < 1) {
                            two[0] = one[0] + t[1] * delta_x;
                            two[2] = one[2] + t[1] * delta_y;
                            two[3] = one[3] + t[1] * delta_w;
                        }
                        if (t[0] > 0) {
                            one[0] = one[0] + t[0] * delta_x;
                            one[2] = one[2] + t[0] * delta_y;
                            one[3] = one[3] + t[0] * delta_w;
                        }
                        // line segment is inside visible area
                        return false;
                    }
                }
        // line segment is in invisible area
        return true;
    };

Tools.clipt = 
    function(p, q, t){
        var r;
                
        // line goes from invisible to visible side of boundary
        if (p < 0) {
            r = q/p;

            // intersection lies out of line segment and line is outside
            if (r > t[1])
                return false;
            else
            if (r > t[0]) // line segment is visible and shortened
                t[0] = r;
        } else
        if (p > 0) { // line goes from visible to visible side of boundary
            r = q/p;
                    
            // intersection lies out of line segment and line is outside
            if (r < t[0])
                return false;
            else
            if (r < t[1]) // line segment is visible and shortened
                t[1] = r;
        } else // p == 0, line is parallel to boundary
        if (q < 0) // line segment lies on invisible side of boundary
            return false;
                
        // line segment is visible
        return true;
    };

Tools.divideByW =
    function(vec){
        // assume clipper clipped invisible segment, therefore
        // this point should be visible
        // the only valid visible point in this case is (0,0,0,0)
        if (vec[3] != 0)  {
            vec[3] = 1.0 / vec[3];
            vec[0] = vec[0] * vec[3];
            vec[1] = vec[1] * vec[3];
            vec[2] = vec[2] * vec[3];
        }
    };

Tools.scaleToScreenSpace =
    function(vec, viewport) {
        vec[0] = vec[0] * 0.5 + 0.5;
        vec[1] = vec[1] * 0.5 + 0.5;
        vec[0] = vec[0] * viewport[2] + viewport[0];
        vec[1] = vec[1] * viewport[3] + viewport[1];
    };

Tools.rotateDirection = 
    function(dir, angle) {
        var vec = new Float32Array(4);
        for(var i=0; i< dir.length; i++)
            vec[i] = dir[i];
        var rad = CGMath.toRadians(angle);
        var mat = new Float32Array([
                Math.cos(rad), Math.sin(rad), 0, 0,
                - Math.sin(rad), Math.cos(rad), 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        var result = new Float32Array(4);
        CGMath.multMatVec4(mat, vec, result);
        CGMath.normalizeVec4(result, result);
        return result;
    };

Tools.linePlaneIntersectionParametric =
    function(linePosition, lineDirection, planePosition, planeDirectionOne, planeDirectionTwo){
        var result =  new Float32Array(4);
                
        // matrix in column first form
        var matrix = new Float32Array([
                lineDirection[0] * -1, lineDirection[1] * -1, lineDirection[2] * -1,
                planeDirectionOne[0], planeDirectionOne[1], planeDirectionOne[2], 
                planeDirectionTwo[0], planeDirectionTwo[1], planeDirectionTwo[2], 
            ]);
                
        var vector = new Float32Array([
                linePosition[0] - planePosition[0],
                linePosition[1] - planePosition[1],
                linePosition[2] - planePosition[2],
                0
            ]);
        var invMat = new Float32Array(9);
        CGMath.inverseMat3(matrix, invMat);
        var temp = new Float32Array([
                invMat[0],invMat[1], invMat[2],0,
                invMat[3],invMat[4], invMat[5],0,
                invMat[6],invMat[7], invMat[8],0,
                0,0,0,0
            ]);
              
        CGMath.multMatVec3(temp, vector, result);  
                
        return result.subarray(0,3);
    };

Tools.lightShape = new Float32Array([
                0.7, 0.0, 0.4, 0.8, -0.4, 0.8,
                0.7, 0.0, -0.4, 0.8, -0.7, 0.0,
                
                0.4, -0.8, 0.7, 0.0, -0.7, 0.0,
                0.4, -0.8, -0.7, 0.0, -0.4, -0.8,
                
                0.4, -1.2, 0.4, -0.8, -0.4, -0.8,
                0.4, -1.2, -0.4, -0.8, -0.4, -1.2,
                
                0.4, -1.2, -0.4, -1.2, 0.25, -1.4,
                0.25, -1.4, -0.4, -1.2, -0.25, -1.4,
                
                //-0.18, -2.2, -0.14, -2.5, 0.18, -1.9,
                //0.14, -2.5, -0.14, -2.5, 0.18, -1.9,
                0.8, 0.2, 1.05, 0.675, 0.58, 0.8,
                -0.8, 0.2, -1.05, 0.675, -0.58, 0.8,
                //0.35, 0.1, 0.3, 1.0, 1.0, 0.8,
                0.38, 1.0, 0.0, 1.4, -0.38, 1.0
        ]);

Tools.cameraShape = new Float32Array([
                0.0, 0.0, 1.0, -1.0, 1.0, 1.0,
                0.0, -1.0, 0.0, 1.0, -3.0, 1.0,
                -3.0, 1.0, -3.0, -1.0, 0.0, -1.0
        ]);

Tools.depth_test =
    function(newValue, depthBufferValue, depthFunc) {
        switch(depthFunc) {
            case Tools.GL.GL_NEVER:
                return false;
            case Tools.GL.GL_LESS:
                return newValue < depthBufferValue;
            case Tools.GL.GL_EQUAL:
                return newValue == depthBufferValue;
            case Tools.GL.GL_LEQUAL:
                return newValue <= depthBufferValue;
            case Tools.GL.GL_GREATER:
                return newValue > depthBufferValue;
            case Tools.GL.GL_NOTEQUAL:
                return newValue != depthBufferValue;
            case Tools.GL.GL_GEQUAL:
                return newValue >= depthBufferValue;
            case Tools.GL.GL_ALWAYS:
                return true;
            default:
                return true;
        }
    };

Tools.GL = {
    GL_NEVER : 0x0200,
    GL_LESS : 0x0201,
    GL_EQUAL : 0x0202,
    GL_LEQUAL : 0x0203,
    GL_GREATER : 0x0204,
    GL_NOTEQUAL : 0x0205,
    GL_GEQUAL : 0x0206,
    GL_ALWAYS : 0x0207
};

Tools.isKeyEvent =
    function(e){
        return e.type === "keyup" || e.type === "keydown";
    };

Tools.isMouseEvent =
    function(event){
        return event.type === "mouseup" || event.type === "mouseover" || event.type === "mousewheel" || event.type === "mousemove" || event.type === "mousedown"
                || event.type === "mouseout" || event.type === "mouseenter" || event.type === "click";
    };
    
Tools.isTouchEvent =
    function(event){
        return event.type.substring(0,5) === "touch";
    };
