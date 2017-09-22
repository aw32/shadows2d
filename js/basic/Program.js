function Program(){

this._programId = -1;

this._vertexShaderId = -1;

this._fragmentShaderId = -1;

}

Program.prototype.getProgramId = 
    function(){
        return this._programId;
    };

Program.prototype.getVertexShaderId = 
    function(){
        return this._vertexShaderId;
    };

Program.prototype.getFragmentShaderId =
    function(){
        return this._fragmentShaderId;
    };

Program.prototype.compileProgram =
    function(gl){
        if(this._programId === -1 || this._vertexShaderId === -1 || this._fragmentShaderId === -1)
            return false;
        gl.attachShader(this._programId, this._vertexShaderId);
        gl.attachShader(this._programId, this._fragmentShaderId);
        gl.linkProgram(this._programId);
        gl.validateProgram(this._programId);
        return true;
    };

Program.prototype.createProgram =
    function(gl){
        if(this._programId !== -1){
            this.deleteProgram(gl, this._programId);
            this._programId = -1;
        }
        this._programId = gl.createProgram();
        return !(this._programId === -1);
    };

Program.prototype.setVertexShader =
    function(gl, shaderSource){
        if(this._vertexShaderId !== -1){
            this.deleteShader(gl, this._vertexShaderId);
            this._vertexShaderId = -1;
        }
        this._vertexShaderId = this.createAndCompileShader(gl, shaderSource , gl.VERTEX_SHADER);
        return !(this._vertexShaderId === -1);
    };

Program.prototype.setFragmentShader =
    function(gl, shaderSource){
        if(this._fragmentShaderId !== -1){
            this.deleteShader(gl, this._fragmentShaderId);
            this._fragmentShaderId = -1;
        }
        this._fragmentShaderId = this.createAndCompileShader(gl, shaderSource , gl.FRAGMENT_SHADER);
        return !(this._fragmentShaderId === -1);
    };

Program.prototype.deleteProgram =
    function(gl, programId){
        gl.deleteProgram(programId);
    };

Program.prototype.deleteShader =
    function(gl, shaderId){
        gl.deleteShader(shaderId);
    };

Program.prototype.loadSourceCode =
    function(filePath, callback, errorCallback){
        
        // Set up an asynchronous request
        var request = new XMLHttpRequest();
        request.open('GET', filePath, true);

        // Hook the event that gets called as the request progresses
        request.onreadystatechange = function () {
            // If the request is "DONE" (completed or failed)
            if (request.readyState == 4) {
                // If we got HTTP status 200 (OK)
                if (request.status == 200) {
                    callback(request.responseText, data)
                } else { // Failed
                    errorCallback(url);
                }
            }
        };

        request.send(null);
    };

Program.prototype.createAndCompileShader =
    function(gl, shaderSource , shaderType){
        var error = false;
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(! (status === true)){
            console.log('shader compilation failed');
            var log = gl.getShaderInfoLog(shader);
            console.log(log);
            error = true;
        } else {
            console.log('shader compiled');
        }

        if(error == true){
            gl.deleteShader(shader);
            shader = -1;
        }
        return shader;
    };

Program.prototype.dispose =
    function(gl){
        if(this._programId !== -1){
            gl.deleteProgram(this._programId);
            this._programId = -1;
        }
        if(this._vertexShaderId !== -1){
            gl.deleteShader(this._vertexShaderId);
            this._vertexShaderId = -1;
        }
        if(this._fragmentShaderId !== -1){
            gl.deleteShader(this._fragmentShaderId);
            this._fragmentShaderId = -1;
        }
    };
