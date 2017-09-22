function SimCamera(resolution){

this._position = new Float32Array(2);

this._direction = new Float32Array(2);

this._lookat = new Float32Array(2);

this._pmv = new PMV();

this._near = 0;
this._far = 0;
this._left = 0;
this._right = 0;
this._top = 0
this._bottom = 0;

this._fovy = 0;
this._aspect = 0;

this._projection

this._infiniteBoundary = 0.9;

this._editable = false;

this._frustum = new SimFrustum();

this._resolution = resolution;

this._render = new SimRender(this._pmv, this._resolution);

this._cameraShapeColorNormal = new Color(0.4, 0.3, 1, 0.5);

this._cameraShapeColorMouseOver = new Color(0.4, 0.3, 1.0, 1);

this._cameraShapeColorEditMode = new Color(0.4, 0.3, 1.0, 1);

this._cameraShape = new Triangles([
                        0.0, 0.0, 1.0, -1.0, 1.0, 1.0,
                        0.0, -1.0, 0.0, 1.0, -3.0, 1.0,
                        -3.0, 1.0, -3.0, -1.0, 0.0, -1.0
        ], this._cameraShapeColorNormal, [1.0, 0.0, 0.0]);

this._rotateShape = true;

this._posPoint = new Point(0,0);

this._lookatPoint = new Point(0,0);

// edit attributes

this._mouseOverCameraShape = false;

this._mouseOverCameraPosHandle = false;

this._mouseOverLookatPosHandle = false;

this._editMode = false;

this._positionEditable = true;

this._lookatPointEditable = true;

this._cameraPosHandlePressed = false;

this._dragStartPos = null;

this._lastEvent = "";

this._editHandlesColorNormal = new Color(0.8, 0.3, 0.4, 0.5);

this._editHandlesColorMouseOver = new Color(0.8, 0.3, 0.4, 1.0);

this._cameraPosCircle = new Circle();
this._cameraPosCircle.set(0,0,0.7,this._editHandlesColorNormal);

this._lookatPosCircle = new Circle();
this._lookatPosCircle.set(0,0,0.7,this._editHandlesColorNormal);

this._cameraShape.translate(3, 3);
this._cameraShape.scale(0.5);
this._cameraShape.setTransform(true);
//this._cameraShape.setDisplayBoundingBox(true);

// deactivate edit objects
this._cameraPosCircle.setDisplay(false);
this._cameraPosCircle.setTransform(true);
this._lookatPosCircle.setDisplay(false);
this._lookatPosCircle.setTransform(true);

}

SimCamera.prototype.PROJECTION = {
    ORTHOGONAL : 0,
    PERSPECTIVE : 1,
    INFINITE_PERSPECTIVE : 2
};

SimCamera.prototype.setEditable =
    function(editable, positionEditable, lookatPointEditable){
        this._editable = editable;
        this._positionEditable = positionEditable;
        this._lookatPointEditable = lookatPointEditable;
    };

SimCamera.prototype.changeResolution =
    function(newRes, layer){
        this._resolution = newRes;
        this._render.changeResolution(this._resolution, layer);
    };

SimCamera.prototype.setCameraShape =
    function( trianglePoints, rotateShape){
        this._cameraShape.updatePoints(trianglePoints);
        this._rotateShape = rotateShape;
        this._cameraShape.rotate(0);
    };

SimCamera.prototype.getProjection =
    function(){
        return this._projection;
    };

SimCamera.prototype.getInfiniteBoundary =
    function() {
        return this._infiniteBoundary;
    };

SimCamera.prototype.setInfiniteBoundary =
    function(boundary) {
        this._infiniteBoundary = boundary;
    };

SimCamera.prototype.getFrustum =
    function(){
        return this._frustum;
    };

SimCamera.prototype.getPMVMatrix =
    function(){
        return this._pmv;
    };

SimCamera.prototype.getRender =
    function(){
        return this._render;
    };

SimCamera.prototype.getPosition =
    function(){
        return this._position;
    };

SimCamera.prototype.getLookat =
    function(){
        return this._lookat;
    };

SimCamera.prototype.getDirection =
    function(){
        return this._direction;
    };

SimCamera.prototype.getResolution =
    function(){
        return this._resolution;
    };

SimCamera.prototype.clear =
    function(){
        this._render._clear();
    };

SimCamera.prototype.render =
    function(object){
        this._render.render(object);
    };

SimCamera.prototype.showCamera =
    function(show) {
        this._cameraShape.setDisplay(show);
    };

SimCamera.prototype.showCameraPoints =
    function(show) {
        this._posPoint.setDisplay(show);
        this._lookatPoint.setDisplay(show);
    };

SimCamera.prototype.position =
    function(x, y) {
        this._position[0] = x;
        this._position[1] = y;
        this.updateModelView();
    };

SimCamera.prototype.lookAt =
    function(x, y) {
        this._lookat[0] = x;
        this._lookat[1] = y;
        this.updateModelView();
    };

SimCamera.prototype.updateModelView =
    function(){
        this._direction[0] = this._lookat[0] - this._position[0];
        this._direction[1] = this._lookat[1] - this._position[1];
        var length = Math.sqrt(this._direction[0]*this._direction[0] + this._direction[1]*this._direction[1]);
        this._direction[0] = this._direction[0]/length;
        this._direction[1] = this._direction[1]/length;
                
        this._pmv.glLoadIdentity(PMV.prototype.GL.GL_MODELVIEW);
        this._pmv.gluLookAt(this._position[0], this._position[1], 0.0, 
             this._lookat[0],this._lookat[1],0.0, 
             0.0, 0.0, 1.0);
    };

SimCamera.prototype.updateCamera =
    function() {
                
        // update graphics
        this._cameraShape.translate(this._position[0], this._position[1]);
        if (this._rotateShape) {
            var dot = this._direction[0]; 
            var angle = Math.acos(dot);
            if (this._direction[1]<0)
                angle = 360 - CGMath.toDegrees(angle);
            else
                angle = CGMath.toDegrees(angle);
            this._cameraShape.rotate(angle);
        }
                
        this._posPoint.updatePoint(this._position[0], this._position[1]);
        this._lookatPoint.updatePoint(this._lookat[0], this._lookat[1]);
                
                
        switch (this._projection) {
            case this.PROJECTION.ORTHOGONAL:
                this._frustum.orthogonal(this._position, this._direction, this._left, this._right, this._bottom, this._top, this._near, this._far);
                break;
            case this.PROJECTION.PERSPECTIVE:
                this._frustum.perspective(this._pmv,this._position, this._direction, this._fovy/2, this._aspect, this._near, this._far, this._resolution);
                break;
            case this.PROJECTION.INFINITE_PERSPECTIVE:
                this._frustum.infinitePerspective(this._pmv, this._resolution, this._infiniteBoundary);
                break;
        }
        this._frustum.updateFrustum();
        this._render.update(this);

        if (this._editMode) {
            this._cameraPosCircle.translate(this._position[0], this._position[1]);
            this._lookatPosCircle.translate(this._lookat[0], this._lookat[1]);
        }
    };

SimCamera.prototype.update =
    function(){
        this.updateCamera();
    };

SimCamera.prototype.perspective =
    function(fovy, aspect, zNear, zFar) {

        this._fovy = fovy;
        this._aspect = aspect;
        this._near = zNear;
        this._far = zFar;
                
        // update matrix
        this._pmv.glLoadIdentity(PMV.prototype.GL.GL_PROJECTION);
        this._pmv.gluPerspective(fovy, aspect, zNear, zFar);
                               
        this._projection = this.PROJECTION.PERSPECTIVE;
    };

SimCamera.prototype.infinitePerspective = 
    function(fovy, aspect, zNear) {
        this._fovy = fovy;
        this._aspect = aspect;
        this._near = zNear;
                
        // update matrix
        this._pmv.glLoadIdentity(PMV.prototype.GL.GL_PROJECTION);
        this._pmv.glInfinitePerspective(fovy, aspect, zNear);
                
        this._projection = this.PROJECTION.INFINITE_PERSPECTIVE;
    };

SimCamera.prototype.createFiniteHomogenousProjectionMatrix =
    function(capp) {
        var pmv = new PMV();
        pmv.glInfinitePerspective(this._fovy, this._aspect, this._near, null);
        var proj = pmv.getProjectionMatrix();
        var viewport = [0, 0, this._resolution, this._resolution];
        var model = this._pmv.getModelViewMatrix();
        var mat = Tools.createUnprojectMatrix(model, proj, viewport);
        var point = new Float32Array(4);
        var epsilon = Math.pow(2, -22);
                
        Tools.unproject(this._resolution/2, 0, capp+epsilon, mat, point);
        var far = CGMath.distVec3([point[0],point[1],0], [this._position[0], this._position[1], 0]);
        var newPmv = new PMV();
        pmv.glLoadIdentity(PMV.prototype.GL.GL_PROJECTION);
        pmv.gluPerspective(this._fovy, this._aspect, this._near, far);
        pmv.gluLookAt(this._position[0], this._position[1], 0.0,
            this._lookat[0], this._lookat[1],0.0,
            0.0, 0.0, 1.0);
        return pmv;
    };

SimCamera.prototype.orthogonal =
    function(left, right, bottom, top, zNear, zFar) {
                
        this._left = left;
        this._right = right;
        this._top = top;
        this._bottom = bottom;
        this._near = zNear;
        this._far = zFar;
                
        // update matrix
        this._pmv.glLoadIdentity(PMV.prototype.GL.GL_PROJECTION);
        this._pmv.glOrtho(left, right, bottom, top, zNear, zFar);
                
        this._projection = this.PROJECTION.ORTHOGONAL;
    };

SimCamera.prototype.addToLayer =
    function(layer){
       layer.addObject(this._cameraShape);
       layer.addObject(this._posPoint);
       layer.addObject(this._lookatPoint);
       this._frustum.addToLayer(layer);
       this._render.addToLayer(layer);
       layer.addObject(this._cameraPosCircle);
       layer.addObject(this._lookatPosCircle);
    };

SimCamera.prototype.removeFromLayer =
    function(layer){
       layer.removeObject(this._cameraShape);
       layer.removeObject(this._posPoint);
       layer.removeObject(this._lookatPoint);
       this._frustum.removeFromLayer(layer);
       this._render.removeFromLayer(layer);
       layer.removeObject(this._cameraPosCircle);
       layer.removeObject(this._lookatPosCircle);
    };

SimCamera.prototype.hasFocus =
    function() {
       return this._editMode;
    };

SimCamera.prototype.blur =
    function() {
       this._editMode = false;
       this.deactivateEditMode();
    };

SimCamera.prototype.consumeEvent =
    function(event) {
       return false;
    };

SimCamera.prototype.consumeMouseEvent =
    function(event, relativePosition) {
        // check for object activation
        if (this._editable) {
            //var clicked = event.type === "click";
            var clicked = (event.type === "mouseup" && this._lastEvent === "mousedown");
            var intersectCameraShape = this._cameraShape.collide(relativePosition[0], relativePosition[1]);
            var intersectCameraPosCircle = this._cameraPosCircle.collide(relativePosition[0], relativePosition[1]) && this._positionEditable;
            //var intersectCameraPosCircle = false;
            //var intersectLookatPosCircle = false;
            var intersectLookatPosCircle = this._lookatPosCircle.collide(relativePosition[0], relativePosition[1]) && this._lookatPointEditable;
            //console.log(intersectCameraShape);            
            // mouse over color change
            if (intersectCameraShape && !this._mouseOverCameraShape) {
                this._mouseOverCameraShape = true;
                this._cameraShape.updateColor(this._cameraShapeColorMouseOver);
            } else
            if (!intersectCameraShape && this._mouseOverCameraShape) {
                this._cameraShape.updateColor(this._cameraShapeColorNormal);
                this._mouseOverCameraShape = false;
            }
                        
            if (this._positionEditable) {
                if (intersectCameraPosCircle && !this._mouseOverCameraPosHandle) {
                    this._mouseOverCameraPosHandle = true;
                    this._cameraPosCircle.updateColor(this._editHandlesColorMouseOver);
                } else
                if (!intersectCameraPosCircle && this._mouseOverCameraPosHandle) {
                    this._cameraPosCircle.updateColor(this._editHandlesColorNormal);
                    this._mouseOverCameraPosHandle = false;
                }
            }
            if (this._lookatPointEditable) {
                if (intersectLookatPosCircle && !this._mouseOverLookatPosHandle) {
                    this._mouseOverLookatPosHandle = true;
                    this._lookatPosCircle.updateColor(this._editHandlesColorMouseOver);
                } else
                if (!intersectLookatPosCircle && this._mouseOverLookatPosHandle) {
                    this._lookatPosCircle.updateColor(this._editHandlesColorNormal);
                    this._mouseOverLookatPosHandle = false;
                }
            }
                        
                    
            //console.log(event.type);    
                        
            if (!this._editMode) {
                // activate edit mode
                if (this._mouseOverCameraShape && clicked) {
                    this._editMode = true;
                    FocusManager.setFocus(this);
                    this.activateEditMode();
                }
            } else {
                // deactivate edit mode
                if (intersectCameraShape && clicked && !this._cameraPosHandlePressed && !this._lookatPosHandlePressed) {
                    this._editMode = false;
                    FocusManager.blur();
                    this.deactivateEditMode();
                }
                
                // drag and drop handles for camera position and lookat changes
                


                if(event.type === "mousedown"){
                        if (intersectCameraPosCircle)
                            this._cameraPosHandlePressed = true;
                        else
                        if (intersectLookatPosCircle)
                            this._lookatPosHandlePressed = true;
                        
                        if (intersectCameraPosCircle || intersectLookatPosCircle) {
                            this._dragStartPos = relativePosition;
                            event.consumed = true;
                        }
                } else
                if(event.type === "mousemove"){
                     
                        if (this._cameraPosHandlePressed || this._lookatPosHandlePressed) {
                    
                            this.lookAt(this._lookat[0] + (relativePosition[0] - this._dragStartPos[0]),
                            this._lookat[1] + (relativePosition[1] - this._dragStartPos[1]));
                                                                
                            if (this._cameraPosHandlePressed) {
                                this.position(this._position[0] + (relativePosition[0] - this._dragStartPos[0]),
                                this._position[1] + (relativePosition[1] - this._dragStartPos[1]));
                            }
                                                             
                            this._dragStartPos = relativePosition;
                            this.updateCamera();
                            event.consumed = true;
                        }
                } else
                if(event.type === "mouseup"){
                        if (this._cameraPosHandlePressed || this._lookatPosHandlePressed) {
                            this._dragStartPos = null;
                            event.consumed = true;
                                                                
                            // correct circle positions, if too close, then usage of lookat-handle is impossible
                            var distance = CGMath.distVec3([
                            this._position[0], this._position[1],0], [
                            this._lookat[0], this._lookat[1], 0]);
                            if (distance < 1.7) {
                                var normDir = new Float32Array(3);
                                CGMath.normalizeVec3([
                                this._direction[0], this._direction[1], 0], normDir);
                                this.lookAt(this._position[0] + normDir[0] * 1.7, this._position[1] + normDir[1]* 1.7);
                                this.updateCamera();
                            }
                        }
                        if (this._cameraPosHandlePressed)
                            this._cameraPosHandlePressed = false;
                        if (this._lookatPosHandlePressed)
                            this._lookatPosHandlePressed = false;
                }
           }
            this._lastEvent = event.type;
        }
        return false;
    };

SimCamera.prototype.consumeTouchEvent =
    function(event, relativePosition) {
        if(this._editable) {
            var clicked = event.type === "touchclick";
            var intersectCameraShape = this._cameraShape.collide(relativePosition[0], relativePosition[1]);
            var intersectCameraPosCircle = this._cameraPosCircle.collide(relativePosition[0], relativePosition[1]) && this._positionEditable;
         
            var intersectLookatPosCircle = this._lookatPosCircle.collide(relativePosition[0], relativePosition[1]) && this._lookatPointEditable;

            if (!this._editMode) {
                // activate edit mode
                if (this._mouseOverCameraShape && clicked) {
                    this._editMode = true;
                    FocusManager.setFocus(this);
                    this.activateEditMode();
                }
            } else {

            }
        }
    };

SimCamera.prototype.consumeKeyEvent =
    function(event) {
        return false;
    };

SimCamera.prototype.activateEditMode =
    function(){
        this._cameraShape.updateColor(this._cameraShapeColorEditMode);

        if (this._positionEditable) {
            this._cameraPosCircle.setDisplay(true);
            this._cameraPosCircle.translate(this._position[0], this._position[1]);
        }
        if (this._lookatPointEditable) {
            this._lookatPosCircle.setDisplay(true);
            this._lookatPosCircle.translate(this._lookat[0], this._lookat[1]);
        }
    };
        
SimCamera.prototype.deactivateEditMode =
    function(){
        if (this._mouseOverCameraShape)
            this._cameraShape.updateColor(this._cameraShapeColorMouseOver);
        else
            this._cameraShape.updateColor(this._cameraShapeColorNormal);
        this._cameraPosCircle.setDisplay(false);
        this._lookatPosCircle.setDisplay(false);
    };
