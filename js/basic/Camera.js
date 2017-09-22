function Camera(){


this._pmv = new PMV();

this._pmvMat = new Float32Array(16);

this._width = 0;

this._height = 0;

this._uniformId = -1;

this._currentView = new CameraView();
}

Camera.prototype.init =
    function(gl, program, width, height){
        this._width = width;
        this._height = height;
        this._uniformId = gl.getUniformLocation(program, "pmvMatrix");
        this.update(true, true);
    };

Camera.prototype.getCoordinateSize =
    function(){
        return this._currentView.getCoordinateSize();
    };

Camera.prototype.updateUniform =
    function(gl){
        gl.uniformMatrix4fv(this._uniformId, false, this._pmvMat);
       /* var x = new Float32Array([-3, -7, 0, 1]);
        var y = new Float32Array([5, 9, 0, 1]);
        var x2 = new Float32Array(4);
        var y2 = new Float32Array(4);
        CGMath.multMatVec4(this._pmv, x, x2);
        CGMath.multMatVec4(this._pmv, y, y2);
*/
    //    console.log("p"+CGMath.vec4Str(x2));
    //    console.log("p"+CGMath.vec4Str(y2));
    };

Camera.prototype.updateUniformProgramLocation =
    function(gl, program, uniformLocation){
        gl.uniformMatrix4fv(uniformLocation, false, this._pmvMat);
    };

Camera.prototype.getMatrix =
    function(){
        return this._pmvMat;
    };

Camera.prototype.reshape =
    function(gl, width, height){
        this._width = width;
        this._height = height;

        this.update(false, true);
    };

Camera.prototype.getPosition =
    function(){
        return this._currentView.getPosition();
    };

Camera.prototype.position =
    function(x, y, z){
        this._currentView.position(x,y,z);
        this.update(true,false);
    };

Camera.prototype.dimension =
    function(minHor,maxHor,minVer,maxVer){
        this._currentView.dimension(minHor,maxHor,minVer,maxVer);
        this.update(false,true);
    };

Camera.prototype.getDimension =
    function(){
        return this._currentView.getDimension();
    };

Camera.prototype.lookat =
    function(x, y, z){
        this._currentView.lookat(x,y,z);
    };

Camera.prototype.update =
    function(updateView, updateProjection){
        if(updateView)
            this._currentView.updatePosition(this);
        if(updateProjection)
            this._currentView.updateProjection(this._width, this._height, this);
    //    console.log(CGMath.mat4Str(this._v));
    //    console.log(CGMath.mat4Str(this._p));
        //CGMath.multMat4(this._pmv.getModelViewMatrix(), this._pmv.getProjectionMatrix(), this._pmvMat);
        CGMath.multMat4(this._pmv.getProjectionMatrix(), this._pmv.getModelViewMatrix(), this._pmvMat);
/*        
        var s = "[";
        for(var i=0; i<4; i++){
            s = s + "[";
            for(var j=0; j<4; j++)
                s = s + this._p[i*4 + j]+",";
            s = s + "],";
        }
        console.log(s);
        s = "[";
        for(var i=0; i<4; i++){
            s = s + "[";
            for(var j=0; j<4; j++)
                s = s + this._v[i*4 + j]+",";
            s = s + "],";
        }
        console.log(s);
        s = "[";
        for(var i=0; i<4; i++){
            s = s + "[";
            for(var j=0; j<4; j++)
                s = s + this._pmv[i*4 + j]+",";
            s = s + "],";
        }
        console.log(s);
*/
    };

Camera.prototype._loadIdentity =
    function(){
        var result = new Float32Array(16);
        result[0] = 1;
        result[5] = 1;
        result[10] = 1;
        result[15] = 1;
        return result;
    };

Camera.prototype.getPointDirection =
    function(e){
        return this._currentView.getPointDirection(e,this);
    };

Camera.prototype.gluPerspective =
    function(fovy, aspect, zNear, zFar){
        this._pmv.gluPerspective(fovy, aspect, zNear, zFar);
    }

Camera.prototype.glOrtho =
    function(left, right, bottom, top, near, far){
//        console.log("glOrtho: "+left+","+right+","+bottom+","+top+","+near+","+far)
        //this._p = Camera.prototype._loadIdentity();

        /*
            2/(r-l)  0       0        -(r+l)/(r-l)
            0        2/(t-b) 0        -(t+b)/(t-b)
            0        0       -2/(f-n) -(f+n)/(f-n)
            0        0       0        1
        */
        /*
        this._p[0] = 2 / (right - left); 
        this._p[12] = -(right + left)/(right - left);
        this._p[5] = 2 / (top - bottom);
        this._p[13] = - (top + bottom) / (top - bottom);
        this._p[10] = - 2 / (far - near);
        this._p[14] = - (far + near) / (far - near);
        */
/*
        this._p.set([
        0.1, 0.0, 0.0, 0.0,
        0.0, 0.1, 0.0, 1.0,
        0.0, 0.0, 1.0,0.0,
        0.0, 0.0, 1.0,1.0
        ]);
*/
        this._pmv.glOrtho(left,right,bottom,top,near,far);
    };

Camera.prototype.gluLookAt =
    function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz){
        this._pmv.gluLookAt(eyex,eyey,eyez,centerx,centery,centerz,upx,upy,upz);
       // console.log(eyex+","+eyey+","+eyez+","+centerx+","+centery+","+centerz+","+upx+","+upy+","+upz);
  /*      this._v = Camera.prototype._loadIdentity();

        var f = new Float32Array(3);
        f[0] = centerx - eyex;
        f[1] = centery - eyey;
        f[2] = centerz - eyez;

        CGMath.normalizeVec3(f, f);

        var up = new Float32Array([upx, upy, upz]);
        CGMath.normalizeVec3(up, up);
        var s = new Float32Array(3);
        CGMath.crossVec3(f,up,s);
        var snorm = new Float32Array(3);
        CGMath.normalizeVec3(s, snorm);
        var u = new Float32Array(3);
        CGMath.crossVec3(s, f, u);

        this._v.set([
            s[0],  s[1],  s[2],  0,
            u[0],  u[1],  u[2],  0,
            -f[0], -f[1], -f[2], 0,
            0    , 0    , 0    , 1
        ]);
*/

/*        this._v.set([
            s[0], u[0], -f[0], 0,
            s[1], u[1], -f[1], 0,
            s[2], u[2], -f[2], 0,
            0,    0,    0,   1
        ]);
*/

/*
        this._v.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0,    0,    0,   1
        ]);*/
    };



function CameraView(){

this._position = new Float32Array(3);
this._position[2] = 1.0;

this._lookat = new Float32Array(3);
this._lookat[2] = -5.0;

this._cameraPosZ = 1.0;

this._centerPosZ = -5.0;

this._vertArea = 10;

this._horArea = 10;

}

CameraView.prototype.updateProjection =
    function(width, height, camera){
        //console.log("updateProj: "+width+" "+height+" "+this._vertArea);
        //console.trace();
        this._horArea =  (width / height) * this._vertArea; 
        camera.glOrtho(-this._horArea, this._horArea, -this._vertArea, this._vertArea, 0.0, 2.0);
//        camera.gluPerspective(90,height/width,0.1,2);
    };

CameraView.prototype.updatePosition =
    function(camera){
        camera.gluLookAt(this._position[0], this._position[1], this._cameraPosZ, this._position[0], this._position[1], this._centerPosZ, 0.0, 1.0, 0.0);
    };

CameraView.prototype.dimension =
    function(minHor,maxHor,minVer,maxVer){
        //console.log("CameraView.dimension: "+this._horArea+" "+this._vertArea+" "+maxHor+" "+maxVer);
        //console.trace();
        this._horArea = maxHor;
        this._vertArea = maxVer;
    };

CameraView.prototype.getDimension =
    function(){
        return [-this._horArea, this._horArea, -this._vertArea, this._vertArea, 0.0, 2.0];
    };

CameraView.prototype.getPosition =
    function(){
        return [this._position[0], this._position[1], this._cameraPosZ];
    };

CameraView.prototype.position =
    function(x, y, z){
        this._position[0] = x;
        this._position[1] = y;
        this._cameraPosZ = z;
    };

CameraView.prototype.lookat =
    function(x, y, z){

    };

CameraView.prototype.getPointDirection =
    function(e,camera){
        var dir = new Float32Array(3);
        var x1 = e.clientX / camera._width;
        var y1 = (camera._height - e.clientY) / camera._height;
        x1 = x1 * this._horArea * 2.0 - this._horArea;
        y1 = y1 * this._vertArea * 2.0 - this._vertArea;
        dir[0] = x1 + this._position[0];
        dir[1] = y1 + this._position[1];
        dir[2] = 0;
        return dir;
    };

CameraView.prototype.getCoordinateSize =
    function(){
        //console.log("CameraView.getCoordinateSize: "+this._position[0]+" "+this._horArea);
        //console.trace();
        return new CoordinateSize(this._position[0] - this._horArea, this._position[1] - this._vertArea, this._horArea*2.0, this._vertArea*2.0);
    };
