function SimShadowMap(resolution){

this._resolution = resolution;

this._bias = 0.01;

this._shadowBits = new Array(resolution);

this._frameBufferColors = new Array(resolution);

}

SimShadowMap.prototype.changeCameraResolution =
    function(newRes) {
        this._resolution = newRes;
        this._shadowBits = new Array(resolution);
        this._frameBufferColors = new Array(resolution);
    };

SimShadowMap.prototype.getBias =
    function(){
        return this._bias;
    };

SimShadowMap.prototype.setBias =
    function(bias){
        this._bias = bias;
    };

SimShadowMap.prototype.getShadowBits =
    function(){
        return this._shadowBits;
    };

SimShadowMap.prototype.getFrameBufferColors =
    function(){
        return this._frameBufferColors;
    };

SimShadowMap.prototype.renderFinalImage =
    function(lightCamera, usualCamera){
        var world_point = new Float32Array(4);
        var light_frag = new Float32Array(4);
        var usualDepth = usualCamera.getRender().getDepthBuffer();
        var usualColor = usualCamera.getRender().getColorBuffer();
        var shadowMap = lightCamera.getRender().getDepthBuffer();
        var shadowMapResolution = lightCamera.getResolution();
        var cameraResolution = usualCamera.getResolution();
        var projectViewport = new Float32Array([
                0,0, shadowMapResolution, shadowMapResolution
            ]);
        var unprojectViewport = new Float32Array([
                0,0, cameraResolution, cameraResolution
            ]);
        var unprojectMatrix = Tools.createUnprojectMatrixPMV(usualCamera.getPMVMatrix(), unprojectViewport);
        var projectMatrix = Tools.createProjectMatrixPMV(lightCamera.getPMVMatrix());

        var clippedAway;

        for(var i=0; i<cameraResolution; i++) {

            // transform to world coordinates
            Tools.unproject(i+0.5, 0.0, usualDepth[i], unprojectMatrix, world_point);
            // transform to shadow map fragment
            Tools.project(world_point[0], world_point[1], world_point[2], projectMatrix, light_frag);

            clippedAway = Tools.clip2dhPoint(light_frag);

            //System.out.println(i+" clip "+clippedAway);

            Tools.divideByW(light_frag);

            Tools.scaleToScreenSpace(light_frag, projectViewport);

            // compare distances
            if ( !clippedAway && light_frag[0]>=0 && light_frag[0]<shadowMapResolution) {

                //System.out.println(i+" smap: "+shadowMap[  (int) Math.floor(light_frag[0])]+" cam: "+light_frag[2]);

                if (light_frag[2]-this._bias <= shadowMap[  Math.floor(light_frag[0])  ] ) {

                    // fragment not in shadow
                    this._shadowBits[i] = false;
                    this._frameBufferColors[i] = (usualColor[i]!=null?usualColor[i]:new Color(0,0,0,0));

                } else {

                    // fragment in shadow
                    this._shadowBits[i] = true;
                    this._frameBufferColors[i] = (usualColor[i]!=null?new Color(
                            usualColor[i].r*0.5,
                            usualColor[i].g*0.5,
                            usualColor[i].b*0.5, 1
                            ):new Color(0,0,0,0));
                }

            } else { // frag not in shadow map
                this._shadowBits[i] = false;
                this._frameBufferColors[i] = (usualColor[i]!=null?usualColor[i]:new Color(0,0,0,0));
            }


        }
    };

