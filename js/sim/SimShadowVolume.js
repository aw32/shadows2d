function SimShadowVolume(resolution){

this._frontQuads = new Lines([], new Color(0,1,0,1));

this._backQuads = new Lines([], new Color(0,0,1,1));

this._frontCapp = new Lines([], new Color(0,1,0,1));

this._backCapp = new Lines([], new Color(0,0,1,1));

this._frontList = [];

this._backList = [];

this._volumeFaceList = [];

this._resolution = resolution;

this._frameBuffer = new Array(resolution);

this._stencilBuffer = new Array(resolution);

this._extrusion_factor = 1000;

}

SimShadowVolume.prototype.setShadowVolumeColor = 
    function(frontQuadColor, backQuadColor, frontCappColor, backCappColor){
        this._frontQuads.updateColor(frontQuadColor);
        this._backQuads.updateColor(backQuadColor);
        this._frontCapp.updateColor(frontCappColor);
        this._backCapp.updateColor(backCappColor);
    };

SimShadowVolume.prototype.showShadowVolume =
    function (showFrontQuads, showBackQuads, showFrontCapp, showBackCapp){
        this._frontQuads.setDisplay(showFrontQuads);
        this._backQuads.setDisplay(showBackQuads);
        this._frontCapp.setDisplay(showFrontCapp);
        this._backCapp.setDisplay(showBackCapp);
    };

SimShadowVolume.prototype.getStencilBuffer =
    function (){
        return this._stencilBuffer;
    };

SimShadowVolume.prototype.getFrameBuffer =
    function(){
        return this._frameBuffer;
    };

SimShadowVolume.prototype.getFrontFaces =
    function(){
        return this._frontList;
    };

SimShadowVolume.prototype.getBackFaces =
    function(){
        return this._backList;
    };

SimShadowVolume.prototype.updateZPass =
    function (usualCamera, lightCamera, objects) {
        this.addObjects(usualCamera, lightCamera, objects, false);
    };

SimShadowVolume.prototype.updateZFail = 
    function (usualCamera, lightCamera, objects) {
        this.addObjects(usualCamera, lightCamera, objects, true);
    };

SimShadowVolume.prototype.addObjects =
    function (usualCamera, lightCamera, objects, infinite){
        var viewDirection = new Array(3);
        viewDirection[0] = usualCamera._direction[0];
        viewDirection[1] = usualCamera._direction[1];

        //float[][][][] quads = new float[objects.length][][][];
        //float[][][][] lines = new float[objects.length][][][];
        //float[] objectLines;

        var quads = new Array(objects.length);
        var lines = new Array(objects.length);
        var objectLines;

        this._volumeFaceList = [];

        // create line arrays for easier component handling
        for(var i=0; i<objects.length; i++) {

            objectLines = objects[i].getLines();
            lines[i] = new Array(objectLines.length/4);//float[objectLines.length/4][2][2];
            for(var j=0; j<objectLines.length; j+=4){

                lines[i][j/4] = 
                    [ [ objectLines[j], objectLines[j+1]   ] ,
                      [ objectLines[j+2], objectLines[j+3] ]
                    ];
            }
        }

        // compute volume faces
        for (var i=0; i<quads.length; i++) {

            quads[i] = this.silhouette(lines[i], lightCamera._position, infinite);
            for(var j=0; j<quads[i].length; j++) {
                this._volumeFaceList.push(quads[i][j]);
            }
        }
    };

SimShadowVolume.prototype.updateShadowVolumeZPass =
    function() {

        var frontQuads_points = new Float32Array(4 * this._frontList.length);
        var backQuads_points = new Float32Array(4 * this._backList.length);
        var current_quad;
        var point_index = 0;
        for(var i=0; i<this._frontList.length; i++) {
            current_quad = this._frontList[i];
            frontQuads_points[point_index++] = current_quad[0][0];
            frontQuads_points[point_index++] = current_quad[0][1];
            //frontQuads_points[point_index++] = current_quad[2];
            frontQuads_points[point_index++] = current_quad[1][0];
            frontQuads_points[point_index++] = current_quad[1][1];
            //frontQuads_points[point_index++] = current_quad[5];
        }
        point_index = 0;
        for(var i=0; i<this._backList.length; i++) {
            current_quad = this._backList[i];
            backQuads_points[point_index++] = current_quad[0][0];
            backQuads_points[point_index++] = current_quad[0][1];
            //backQuads_points[point_index++] = current_quad[2];
            backQuads_points[point_index++] = current_quad[1][0];
            backQuads_points[point_index++] = current_quad[1][1];
            //backQuads_points[point_index++] = current_quad[5];
        }
        this._frontQuads.updateLines(frontQuads_points);
        this._backQuads.updateLines(backQuads_points);
        this._frontCapp.updateLines([]);
        this._backCapp.updateLines([]);

    };

SimShadowVolume.prototype.updateShadowVolumeZFail =
    function (lightCamera, usualCamera) {
        // Declare and initialize necessary variables
        var resolution = usualCamera.getResolution();
        var viewport = [0,0,resolution, resolution];

        // Create (un-)projection-matrix used by camera, should be infinite
        var project = Tools.createProjectMatrixPMV(usualCamera.getPMVMatrix());
        var unproject = Tools.createUnprojectMatrixPMV(usualCamera.getPMVMatrix(), viewport);

        // boundary of frustum 
        var infiniteBoundary = usualCamera.getInfiniteBoundary();
        var infiniteBoundaryOffset = 0.01;

        // Create (un-)projection-matrix for finite projection matching the boundary
        var pmv2 = usualCamera.createFiniteHomogenousProjectionMatrix(infiniteBoundary);
        var project2 = Tools.createProjectMatrixPMV(pmv2);
        var unproject2 = Tools.createUnprojectMatrixPMV(pmv2, viewport);

        // Create (un-)projection-matrix for finite projection matching the lower boundary
        var pmv3 = usualCamera.createFiniteHomogenousProjectionMatrix(infiniteBoundary-infiniteBoundaryOffset);
        var project3 = Tools.createProjectMatrixPMV(pmv3);
        var unproject3 = Tools.createUnprojectMatrixPMV(pmv3, viewport);

        // Create projected light position
        var light_position = lightCamera.getPosition();
        var light_position_projected = new Float32Array(4);
        Tools.projectPoint(light_position[0], light_position[1], 0,
                project, viewport, light_position_projected);

        // Create buffers for lines
        var maxBufferSize = (this._volumeFaceList.length)*4;
        /*
        FloatBuffer frontQuadBuffer = FloatBuffer.allocate(maxBufferSize);
        FloatBuffer backQuadBuffer = FloatBuffer.allocate(maxBufferSize);
        FloatBuffer frontCappBuffer = FloatBuffer.allocate(maxBufferSize);
        FloatBuffer backCappBuffer = FloatBuffer.allocate(maxBufferSize);
        */
        var frontQuadBuffer = [];
        var backQuadBuffer = [];
        var frontCappBuffer = [];
        var backCappBuffer = [];
        var resultBuffer;

        // Declare variables used in loop
        var pointOne = new Float32Array(4);
        var pointTwo = new Float32Array(4);
        var pointOneUnclipped = new Float32Array(4);
        var pointTwoUnclipped = new Float32Array(4);
        var pointOneUn = new Float32Array(4);
        var pointTwoUn = new Float32Array(4);
        var front = false;
        var quad = false;
        var one_behind = false;
        var two_behind = false;
        var dot;
        var line_dir = new Float32Array(3);
        var line_normal = new Float32Array(3);
        var view_dir = [0,0,-1];
        var y_dir = [0,1,0];
        var clippedFirst = false;
        var clippedSecond = false;

        var line;
        // Create intermediate list for faces
        var facesList = [];
        facesList = facesList.concat(this._volumeFaceList);

        var additionalLine1 = null;
        var additionalLine2 = null;

        // for all volume faces, create lines for visualization
        for( var i=0; i< facesList.length; i++) {

            line = facesList[i];

            // project line normally

            Tools.project4(line[0][0], line[0][1], 0, line[0][2], project, pointOne);
            Tools.project4(line[1][0], line[1][1], 0, line[1][2], project, pointTwo);

            // check if points lie behind camera
            one_behind = pointOne[3] < 0;
            two_behind = pointTwo[3] < 0;

            // copy unclipped points for later usage
                pointOneUnclipped[0] = pointOne[0];
                pointOneUnclipped[1] = pointOne[1];
                pointOneUnclipped[2] = pointOne[2];
                pointOneUnclipped[3] = pointOne[3];

                pointTwoUnclipped[0] = pointTwo[0];
                pointTwoUnclipped[1] = pointTwo[1];
                pointTwoUnclipped[2] = pointTwo[2];
                pointTwoUnclipped[3] = pointTwo[3];


            clippedFirst = Tools.clip2dh(pointOne, pointTwo);

            Tools.divideByW(pointOne);
            Tools.divideByW(pointTwo);

            Tools.scaleToScreenSpace(pointOne, viewport);
            Tools.scaleToScreenSpace(pointTwo, viewport);

            Tools.divideByW(pointOneUnclipped);
            Tools.divideByW(pointTwoUnclipped);

            Tools.scaleToScreenSpace(pointOneUnclipped, viewport);
            Tools.scaleToScreenSpace(pointTwoUnclipped, viewport);


            // check if line belongs to extruded side faces or capping
            quad = ((line[0][2] == 0 && line[1][2] != 0) || (line[0][2] != 0 && line[1][2] == 0));
            // ignore lines, that are completely clipped away
            if(line[0][2] == 0 && line[1][2] == 0) {
                // both points are at infinity
                // clip only if capping lies behind camera
                if ((one_behind || two_behind) && clippedFirst)
                    continue;
            } else
            if (clippedFirst){
                continue;
            }

            additionalLine1 = this.cutVolumePointThird(unproject, light_position_projected, line[0],
                     one_behind, two_behind, viewport,
                     infiniteBoundary,
                     infiniteBoundaryOffset,
                     pointOne,
                     pointOneUnclipped,
                     pointTwoUnclipped,
                     line[0][2] == 0,
                     quad,
                     pointOneUn);

            additionalLine2 = this.cutVolumePointThird(unproject, light_position_projected, line[1],
                     two_behind, one_behind, viewport,
                     infiniteBoundary,
                     infiniteBoundaryOffset,
                     pointTwo,
                     pointTwoUnclipped,
                     pointOneUnclipped,
                     line[1][2] == 0,
                     quad,
                     pointTwoUn);


            // determine face direction using dot product
                line_dir[0] = pointTwo[0] - pointOne[0];
                line_dir[1] = pointTwo[1] - pointOne[1];
                line_dir[2] = pointTwo[2] - pointOne[2];

                CGMath.crossVec3(line_dir, y_dir, line_normal);
                dot = CGMath.dotVec3(line_normal,view_dir);
                front = ( dot < 0 );

            // second projection for clipping purposes of new lines

            if (line[0].length==3 && !(line[0][2] == 0 && line[1][2] == 0)) {
                // at most one point was extruded
                // use projection-matrix for smaller frustum
                clippedSecond = Tools.projectLine(pointOneUn[0], pointOneUn[1], 0,
                    pointTwoUn[0], pointTwoUn[1], 0,
                    project3, viewport, pointOne, pointTwo);
                Tools.unproject(pointOne[0], pointOne[1], pointOne[2], unproject3, pointOneUn);
                Tools.unproject(pointTwo[0], pointTwo[1], pointTwo[2], unproject3, pointTwoUn);


            } else {
                // both points were extruded or the line was added later
                // use projection-matrix for larger frustum
                clippedSecond = Tools.projectLine(pointOneUn[0], pointOneUn[1], 0,
                    pointTwoUn[0], pointTwoUn[1], 0,
                    project2, viewport, pointOne, pointTwo);

                Tools.unproject(pointOne[0], pointOne[1], pointOne[2], unproject2, pointOneUn);
                Tools.unproject(pointTwo[0], pointTwo[1], pointTwo[2], unproject2, pointTwoUn);

            }

            // if an additional line occured, save the face's direction and append to list
                if (additionalLine1 !== null) {
                    additionalLine1[0][3] = front?1:0;
                    facesList.push(additionalLine1);
                }
                if (additionalLine2 !== null) {
                    additionalLine2[0][3] = front?1:0;
                    facesList.push(additionalLine2);
                }

            // ignore line, if it was completely clipped by second projection
            if (clippedSecond)
                continue;

            //set correct buffer for new lines
            if(line[0].length>3) {
                // later added line belong to side faces
                if (line[0][3]==1)
                    resultBuffer = frontQuadBuffer;
                else
                    resultBuffer = backQuadBuffer;
            } else
            if ((line[0][2] == 0 && line[1][2] == 0) || (line[0][2] != 0 && line[1][2] != 0)) {
                // front or back capping
                if (front)
                    resultBuffer = frontCappBuffer;
                else
                    resultBuffer = backCappBuffer;

            } else {
                // side faces
                if (front)
                    resultBuffer = frontQuadBuffer;
                else
                    resultBuffer = backQuadBuffer;
            }

            // add points to buffer
            resultBuffer.push(pointOneUn[0]);
            resultBuffer.push(pointOneUn[1]);
            resultBuffer.push(pointTwoUn[0]);
            resultBuffer.push(pointTwoUn[1]);

        }

        // update lines with new points
        //var lines = new Array(frontQuadBuffer.position());
        //frontQuadBuffer.position(0);
        //frontQuadBuffer.get(lines);
        //frontQuads.updateLines(lines);
        this._frontQuads.updateLines(frontQuadBuffer);

        //lines = new float[backQuadBuffer.position()];
        //backQuadBuffer.position(0);
        //backQuadBuffer.get(lines);
        //backQuads.updateLines(lines);
        this._backQuads.updateLines(backQuadBuffer);

        //lines = new float[frontCappBuffer.position()];
        //frontCappBuffer.position(0);
        //frontCappBuffer.get(lines);
        //frontCapp.updateLines(lines);
        this._frontCapp.updateLines(frontCappBuffer);

        //lines = new float[backCappBuffer.position()];
        //backCappBuffer.position(0);
        //backCappBuffer.get(lines);
        //backCapp.updateLines(lines);
        this._backCapp.updateLines(backCappBuffer);
    };

SimShadowVolume.prototype.cutVolumePointThird =
    function (unproject, light_position_projected, line,
            behind, other_behind, viewport,
            infiniteBoundary, infiniteBoundaryOffset,
            point, pointUnclipped, pointOtherUnclipped,
            extruded, quad, pointUn){

        var t;

            if(extruded && !behind) {

                if(!quad) {

                    Tools.unproject(pointUnclipped[0], pointUnclipped[1], infiniteBoundary, unproject, pointUn);
                }
                else {

                    // point in front of camera, project at lower depth using light position
                    t = (infiniteBoundary-infiniteBoundaryOffset - pointUnclipped[2]) / (light_position_projected[2] - pointUnclipped[2]);

                    Tools.unproject(
                            t * light_position_projected[0] + (1-t) * pointUnclipped[0],
                            t * light_position_projected[1] + (1-t) * pointUnclipped[1],
                            t * light_position_projected[2] + (1-t) * pointUnclipped[2],
                            unproject,
                            pointUn
                            );

                    // Create additional line

                    var newLineOne = new Float32Array(4);
                    var newLineTwo = new Float32Array(4);
                    var newLine = [new Float32Array(4), new Float32Array(4)];

                    if (pointOtherUnclipped[2] < infiniteBoundary-infiniteBoundaryOffset || other_behind) {
                        newLine[0][0] = pointUn[0];
                        newLine[0][1] = pointUn[1];
                        newLine[0][2] = 1;
                    } else {

                        Tools.unproject(pointOtherUnclipped[0],pointOtherUnclipped[1],infiniteBoundary-0.01, unproject,newLineOne);
                        newLine[0][0] = newLineOne[0];
                        newLine[0][1] = newLineOne[1];
                        newLine[0][2] = 1;
                    }
                    Tools.unproject(pointUnclipped[0],pointUnclipped[1],infiniteBoundary,unproject,newLineTwo);

                    newLine[1][0] = newLineTwo[0];
                    newLine[1][1] = newLineTwo[1];
                    newLine[1][2] = 1;

                    return newLine;
                }

            } else
            if(extruded && behind){
                // behind camera and at infinity

                // project point onto near plane
                t = (-1 - pointUnclipped[2]) / (light_position_projected[2] - pointUnclipped[2]);

                Tools.unproject(
                        t * light_position_projected[0] + (1-t) * pointUnclipped[0],
                        t * light_position_projected[1] + (1-t) * pointUnclipped[1],
                        t * light_position_projected[2] + (1-t) * pointUnclipped[2],
                        unproject,
                        pointUn
                        );
            }
            else
            {
                // point behind camera or not at infinity
                Tools.unproject(point[0], point[1], point[2], unproject, pointUn);
            }
            return null;
    };



SimShadowVolume.prototype.zpass =
    function (usualCamera, renderFront, renderBack){
        var depthBuffer = usualCamera.getRender().getDepthBuffer();
        var usualColor = usualCamera.getRender().getColorBuffer();
        for(var i=0;i<this._stencilBuffer.length; i++)
            this._stencilBuffer[i] = 0;
        var viewport =  [0,0, this._resolution, this._resolution];
        var projectMatrix = Tools.createProjectMatrixPMV(usualCamera.getPMVMatrix());

        this._frontList = [];//.clear();
        this._backList = [];//.clear();

        // render faces, increase stencil value, if front face is drawn
        // decrease stencil value, if back face is drawn
        this.renderQuadList(this._volumeFaceList, this._frontList, this._backList,
                projectMatrix, viewport, depthBuffer, this._stencilBuffer, Tools.GL.GL_LEQUAL,
                1,0,-1,0, renderFront, renderBack);

        // check stencil buffer and draw new frame buffer
        for(var i=0; i<this._resolution; i++) {
            if (this._stencilBuffer[i] == 0) { // fragment in light
                this._frameBuffer[i] = usualColor[i];
            } else { // fragment in shadow
                this._frameBuffer[i] = (usualColor[i]!==null?new Color(
                        usualColor[i].r*0.5,
                        usualColor[i].g*0.5,
                        usualColor[i].b*0.5, 1
                        ): new Color(1,1,1,0));
            }
        }
        this.updateShadowVolumeZPass();
    };

SimShadowVolume.prototype.zfail = 
    function (usualCamera, lightCamera, renderFront, renderBack){
        var depthBuffer = usualCamera.getRender().getDepthBuffer();
        var usualColor = usualCamera.getRender().getColorBuffer();
        for(var i=0;i<this._stencilBuffer.length; i++)
            this._stencilBuffer[i] = 0;
        var viewport = [0,0, this._resolution, this._resolution];

        var projectMatrix = Tools.createProjectMatrixPMV(usualCamera.getPMVMatrix());

        this._frontList = [];//.clear();
        this._backList = [];//.clear();

        // render faces, decrease stencil value, if front face is not drawn
        // increase stencil value, if back face is not drawn
        this.renderQuadList(this._volumeFaceList, this._frontList, this._backList,
                projectMatrix, viewport, depthBuffer, this._stencilBuffer, Tools.GL.GL_LESS,
                0,-1,0,1, renderFront, renderBack);

        // check stencil buffer and draw new frame buffer
        for(var i=0; i<this._resolution; i++) {
            if (this._stencilBuffer[i] == 0) { // fragment in light
                this._frameBuffer[i] = usualColor[i];
            } else { // fragment in shadow
                this._frameBuffer[i] = (usualColor[i]!==null?new Color(
                        usualColor[i].r*0.5,
                        usualColor[i].g*0.5,
                        usualColor[i].b*0.5, 1
                        ): new Color(1,1,1,0));
            }
        }

        this.updateShadowVolumeZFail(lightCamera, usualCamera);
    };

SimShadowVolume.prototype.renderQuadList =
    function (quadList, frontFaces, backFaces,
            projectMatrix, viewport, depthBuffer, stencilBuffer,
            depthTestFunc, front_zpass_stencil_diff, front_zfail_stencil_diff, back_zpass_stencil_diff, back_zfail_stencil_diff,
            considerFrontFaces, considerBackFaces){
        var current_quad;
        var outside = false;
        var pointOne = new Float32Array(4);
        var pointTwo = new Float32Array(4);
        var line_delta_x;
        var line_delta_z;
        var frag_x;
        var frag_z;
        var frag_t;
        // front, back detection
        var view_dir = [0,0,-1];
        var line_dir = new Float32Array(3);
        var line_normal = new Float32Array(3);
        var y_dir = [0,1,0];
        var dot;
        var front = false;
        var onePointBehindCamera = false;

        for(var i=0; i<quadList.length; i++) {
            current_quad = quadList[i];

            //System.out.println("point:");
            //Tools.printVec3(current_quad[0]);
            //Tools.printVec3(current_quad[1]);

            Tools.project4(current_quad[0][0], current_quad[0][1], 0, current_quad[0][2], projectMatrix, pointOne);

            Tools.project4(current_quad[1][0], current_quad[1][1], 0, current_quad[1][2], projectMatrix, pointTwo);

            /*
            System.out.println("first: "+current_quad[0][0]+","+current_quad[0][1]+","+current_quad[0][2]);
            System.out.println("first p: "+pointOne[0]+","+pointOne[1]+","+pointOne[2]+","+pointOne[3]);
            System.out.println("second: "+current_quad[1][0]+","+current_quad[1][1]+","+current_quad[1][2]);
            System.out.println("second p: "+pointTwo[0]+","+pointTwo[1]+","+pointTwo[2]+","+pointTwo[3]);
            */

            //Tools.printVec4(pointOne);
            //Tools.printVec4(pointTwo);

            outside = Tools.clip2dh(pointOne, pointTwo);

            if( (pointOne[3]<0 && pointTwo[3]>=0) || (pointOne[3]>=0 && pointTwo[3]<0) )
                onePointBehindCamera = true;
            else
                onePointBehindCamera = false;


            // Divide by w
            Tools.divideByW(pointOne);
            Tools.divideByW(pointTwo);

            // Scale to screen space
            Tools.scaleToScreenSpace(pointOne, viewport);
            Tools.scaleToScreenSpace(pointTwo, viewport);

            //Tools.printVec4(pointOne);
            //Tools.printVec4(pointTwo);


            line_dir[0] = pointTwo[0] - pointOne[0];
            line_dir[1] = pointTwo[1] - pointOne[1];
            line_dir[2] = pointTwo[2] - pointOne[2];
            CGMath.crossVec3(line_dir, y_dir, line_normal);
            dot = CGMath.dotVec3(view_dir, line_normal);
            front = dot<0;
            //if(onePointBehindCamera)
              //  front = !front;

            if (front)
                frontFaces.push(current_quad);
            else
                backFaces.push(current_quad);

            if (outside)
                continue;

            if (front && !considerFrontFaces || !front && !considerBackFaces)
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

                if (frag_z < -1 || frag_t > 1)
                    continue;

                // z test
                if (Tools.depth_test(frag_z, depthBuffer[j], depthTestFunc)) {
                    if (front)
                        stencilBuffer[j] += front_zpass_stencil_diff;
                    else
                        stencilBuffer[j] += back_zpass_stencil_diff;
                } else {
                    if (front)
                        stencilBuffer[j] += front_zfail_stencil_diff;
                    else
                        stencilBuffer[j] += back_zfail_stencil_diff;
                }
            }
        }
    };

SimShadowVolume.prototype.toStr =
    function (points){
        var result = "";
        if (points.length%2 == 0)
            for(var i=0; i<points.length; i+=2)
                if (i==0)
                    result += points[i]+","+points[i+1];
                else
                    result += "; "+points[i]+","+points[i+1];
        else
            for(var i=0; i<points.length; i++)
                if (i==0)
                    result += points[i]+"";
                else
                    result += ", "+points[i];
        return result;
    };

SimShadowVolume.prototype.addToLayer =
    function (layer) {
        layer.addObject(this._frontQuads);
        layer.addObject(this._backQuads);
        layer.addObject(this._frontCapp);
        layer.addObject(this._backCapp);
    };

SimShadowVolume.prototype.silhouette =
    function (lines, light_pos, infinite){
        var result;

        var edges = [];

        var light_direction = new Float32Array(3);
        var next_light_direction = new Float32Array(3);

        var currentLine = new Float32Array(3);
        var previousLine = new Float32Array(4);
        var nextLine = new Float32Array(3);
        var z_axis = [0,0,1];
        var currentNormal = new Float32Array(3);
        var nextNormal = new Float32Array(3);
        var dot_light_normal1;
        var dot_light_normal2;

        // save details for first line for last check
        var first_dot_light_normal = 0;

        var boundaryEdge = false;
        // check lines pairwise for silhouette/boundary points
        for (var i = 0; i< lines.length; i++) {

            // compute normal of current line for quad direction
            currentLine[0] = lines[i][1][0] - lines[i][0][0];
            currentLine[1] = lines[i][1][1] - lines[i][0][1];

            CGMath.crossVec3(currentLine, z_axis, currentNormal);


            light_direction[0] = ((lines[i][1][0] + lines[i][0][0]) / 2.0) - light_pos[0];
            light_direction[1] = ((lines[i][1][1] + lines[i][0][1]) / 2.0) - light_pos[1];

            dot_light_normal1 = CGMath.dotVec3(currentNormal, light_direction);


            // add capping lines
            if (infinite && dot_light_normal1>=0) {
                // add back capping
                edges.push( [
                        [ lines[i][0][0] - light_pos[0], lines[i][0][1] - light_pos[1], 0 ],
                        [ lines[i][1][0] - light_pos[0], lines[i][1][1] - light_pos[1], 0 ]
                ]);
            } else
            if (infinite && dot_light_normal1<0) {
                // add front capping
                edges.push( [
                        [ lines[i][0][0], lines[i][0][1], 1 ],
                        [ lines[i][1][0], lines[i][1][1], 1 ]
                ]);
            }

            if (i==0) {
                first_dot_light_normal = dot_light_normal1;
            }

            // if last line null, then first edge is boundary edge, except if current line is first line

            if (previousLine === null && i>0) {
                // first point is a boundary edge
                if (dot_light_normal1 >= 0)
                    edges.push(this.createExtrudedQuad(lines[i][0],light_pos,false, infinite));
                else
                    edges.push(this.createExtrudedQuad(lines[i][0],light_pos,true, infinite));
            }

            // if not last line, check if second point is shared with next line, if not second point is boundary edge
            // if last line do the same, but use very first line, and add first point as boundary edge if necessary
            boundaryEdge = true;
            if (i < lines.length-1) {
                // current edge is not last edge

                if ( lines[i][1][0] == lines[i+1][0][0] && lines[i][1][1] == lines[i+1][0][1] )
                    boundaryEdge = false;

            } else {
                // current edge is last edge, check if last point is identical to very first point
                if ( lines[i][1][0] == lines[0][0][0] && lines[i][1][1] == lines[0][0][1] )
                    boundaryEdge = false;
                else {
                    // both points are boundary edges, add first point of first line as boundary edge!                      
                    if (first_dot_light_normal >= 0)
                        edges.push(this.createExtrudedQuad(lines[0][0],light_pos,false, infinite));
                    else
                        edges.push(this.createExtrudedQuad(lines[0][0],light_pos,true, infinite));
                }
            }

            if (boundaryEdge) {
                // second point is boundary edge
                if (dot_light_normal1 >= 0)
                    edges.push(this.createExtrudedQuad(lines[i][1],light_pos,true, infinite));
                else
                    edges.push(this.createExtrudedQuad(lines[i][1],light_pos,false, infinite));

                // boundary edges need contrary capping edge
                if (infinite && dot_light_normal1>=0) {
                    // add front capping
                    edges.push([
                            [ lines[i][1][0], lines[i][1][1], 1 ],
                            [ lines[i][0][0], lines[i][0][1], 1 ]
                    ]);
                } else
                if (infinite && dot_light_normal1<0) {

                    // add back capping
                    edges.push([
                            [ lines[i][1][0] - light_pos[0], lines[i][1][1] - light_pos[1], 0 ],
                            [ lines[i][0][0] - light_pos[0], lines[i][0][1] - light_pos[1], 0 ]
                    ]);
                }
            }

            // edge is not a boundary edge, check for silhouette edge is necessary
            if (!boundaryEdge) {

                // current line is not last line
                if (i < lines.length-1) {

                    nextLine[0] = lines[i+1][1][0] - lines[i+1][0][0];
                    nextLine[1] = lines[i+1][1][1] - lines[i+1][0][1];

                    next_light_direction[0] = ((lines[i+1][1][0] + lines[i+1][0][0]) / 2.0) - light_pos[0];
                    next_light_direction[1] = ((lines[i+1][1][1] + lines[i+1][0][1]) / 2.0) - light_pos[1];

                } else {
                    // current line is last line, next line is very first line

                    nextLine[0] = lines[0][1][0] - lines[0][0][0];
                    nextLine[1] = lines[0][1][1] - lines[0][0][1];

                    next_light_direction[0] = ((lines[0][1][0] + lines[0][0][0]) / 2.0) - light_pos[0];
                    next_light_direction[1] = ((lines[0][1][1] + lines[0][0][1]) / 2.0) - light_pos[1];
                }


                CGMath.crossVec3(nextLine, z_axis, nextNormal);

                dot_light_normal2 = CGMath.dotVec3(nextNormal, next_light_direction);

                if (dot_light_normal1 > 0.0 && dot_light_normal2 < 0.0 || dot_light_normal1 < 0.0 && dot_light_normal2 > 0.0) {

                    // edge is silhouette edge
                    if (dot_light_normal1 >= 0)
                        edges.push(this.createExtrudedQuad(lines[i][1],light_pos,true, infinite));
                    else
                        edges.push(this.createExtrudedQuad(lines[i][1],light_pos,false, infinite));
                }

                previousLine = currentLine;
            }

        }

        result = new Array(edges.length);
        for (var i=0; i<result.length; i++)
            result[i] = edges[i];

        return result;
    };

SimShadowVolume.prototype.createExtrudedQuad =
    function (point, light_pos, turn, infinite) {
        if (infinite)
            return this.createExtrudedQuadInfinite(point, light_pos, turn);
        else
            return this.createExtrudedQuadFactor(point, light_pos, turn);
    };

SimShadowVolume.prototype.createExtrudedQuadFactor =
    function (point, light_pos, turn){
        if (!turn)
            return [
                 [point[0], point[1], 1],
                 [point[0] + (point[0] - light_pos[0]) * this._extrusion_factor,
                  point[1] + (point[1] - light_pos[1]) * this._extrusion_factor, 1]
        ];
        else
            return [
                [point[0] + (point[0] - light_pos[0]) * this._extrusion_factor,
                 point[1] + (point[1] - light_pos[1]) * this._extrusion_factor, 1],
                [point[0], point[1], 1]
        ];
    };

SimShadowVolume.prototype.createExtrudedQuadInfinite = 
    function (point, light_pos, turn){
        if (!turn)
            return [
                 [point[0], point[1], 1],
                 [point[0] - light_pos[0],
                  point[1] - light_pos[1], 0]
        ];
        else
            return [
                [point[0] - light_pos[0],
                 point[1] - light_pos[1], 0],
                [point[0], point[1], 1]
        ];
    };






