function BitmapText(textureFont, x, y, width, line_height, text){

PlanarObject.call(this);

this._posAttrib = -1;

this._uvAttrib = -1;

this._textureFont = textureFont;

this._text = text;

this._line_height = line_height;

this._topLeft = [x, y];

this._width = width;

this._textColor = new Color(1,1,1,1);

this._vb = -1;

this._buffer = new Float32Array(35);

this._buffer_pos = 0;

this._needBufferTransfer = false;

this._wrapChars = false;

this._wrapWords = true;

this._wrappedText = null;

this._uv_vertical_offset = 0;//1.5/2048;
this._uv_vertical_offset = 2/2048;

var chars = textureFont.getCharacters();
for(var i =0; i<text.length; i++){
    if(chars.indexOf(text.charAt(i))==-1)
        console.log("Character "+text.charAt(i)+" not available in Texture Font!");
}
if(this._wrapWords)
    this._wrappedText = this.wrapLines(text, width, line_height, textureFont);
else
    this._wrappedText = null;

this._renderDisplay = false;

this._directDisplay = true;

}


BitmapText.prototype = new PlanarObject();
BitmapText.prototype.constructor = BitmapText;

BitmapText.prototype._bitmapTextProgram = null;

BitmapText.prototype._textureUniformLocation = -1;

BitmapText.prototype._pmvUniformLocation = -1;

BitmapText.prototype._colorUniformLocation = -1;

BitmapText.prototype.setWrap =
    function(wrapWords, wrapChars){
        this._wrapWords = wrapWords;
        this._wrapChars = wrapChars;

        this._needLocalUpdate = true;
    };

BitmapText.prototype.setColor =
    function(color){
        this._textColor = color;
        this._needLocalUpdate = true;
    };

BitmapText.prototype.setDisplayBoundingBox =
    function(b){
        if(this._dispBbox != b){
            this._dispBbox = b;
            this._renderDisplay = b;
            this._needLayerUpdate = true;
        }
    };

BitmapText.prototype.updateBoundingBox =
    function(width, height){
        this._bbox._axes = new Axes(1, 0, 0, 1);
        this._bbox._center = new Float32Array([this._topLeft[0] + width * 0.5, this._topLeft[1] - height * 0.5]);
        this._bbox._extent_axis1 = width * 0.5;
        this._bbox._extent_axis2 = height * 0.5;
    };

BitmapText.prototype.initBuffer =
    function(gl){


        this._vb = gl.createBuffer();

        this._posAttrib = gl.getAttribLocation(BitmapText.prototype._bitmapTextProgram.getProgramId(),"vertexPosition");
        this._uvAttrib = gl.getAttribLocation(BitmapText.prototype._bitmapTextProgram.getProgramId(),"uvPosition");

        //this._vb = gl.createBuffer();

        
        
    };

BitmapText.prototype.updateBuffer =
    function(gl){
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vb);

        gl.bufferData(gl.ARRAY_BUFFER, this._buffer.subarray(0, this._buffer_pos), gl.DYNAMIC_DRAW);
    
        this._needBufferTransfer = false;
    };

BitmapText.prototype.updateText =
    function(text){
        this._text = text;
    
        if(this._wrapWords)
            this._wrappedText = this.wrapLines(this._text, this._width, this._line_height, this._textureFont);
        else
            this._wrappedText = null;
        this._needLocalUpdate = true;
    };

BitmapText.prototype.update =
    function(x, y, width, line_height, text){
        this._topLeft = [x, y];
        this._width = width;
        this._text = text;
        this._line_height = line_height;
        if(this._wrapWords)
            this._wrappedText = this.wrapLines(this._text, this._width, this._line_height, this._textureFont);
        else
            this._wrappedText = null;
        this._needLocalUpdate = true;
    };

    /**
     * Wraps lines but keeps words intact.
     * @param text input text
     * @param width width, that limits the line
     * @param line_height text line's height, defines the glyph size
     * @param textureFont texture to be used
     * @return String containing the text wrapped at given width
     */
BitmapText.prototype.wrapLines =
    function(text, width, line_height, textureFont){
        var wrappedText = "";
        var char_width;
        var char_metrics = null;
        var nextLine = "";
        var nextWord = "";
        var current_char;
        var newLine = false;
        var newWord = false;
        var line_width = 0;
        var word_width = 0;
        var space_width;

        // get space width
            char_metrics = textureFont.getCharacterMetrics(' ');
            space_width = line_height * char_metrics[2] / char_metrics[3];

        for(var i=0; i< text.length; i++) {
            current_char = text.charAt(i);

            if(current_char == '\r')
                continue;

            // check if character is new line character or space
            if(current_char == '\n') {
                newLine = true;
            }
            else
                if(current_char == ' ') {
                    newWord = true;
                }

            if (newLine) {
                // new line character, therefore add current line and word to text and create new line
                nextLine += nextWord + current_char;
                nextWord = "";
                wrappedText += nextLine;
                nextLine = "";
                line_width = 0;
                word_width = 0;
                newLine = false;
            }
            else
            if (newWord) {
                // space character, therefore check if word fits in current line
                if (line_width + word_width >= width && line_width>0) {
                    // word does not fit in current line, add current line to text and add word to new line
                    wrappedText += nextLine + "\n";
                    nextLine = nextWord + current_char;
                    nextWord = "";
                    line_width = word_width + space_width;
                    word_width = 0;

                } else {
                    // word fits in current line
                    nextLine += nextWord + current_char;
                    nextWord = "";
                    line_width += word_width + space_width;
                    word_width = 0;
                }
                newWord = false;
            }
            else {
                // normal character, therefore add character to current word
                nextWord += current_char;
                char_metrics = textureFont.getCharacterMetrics(current_char);
                char_width = line_height * char_metrics[2] / char_metrics[3];
                word_width += char_width;
            }
        }
        // add outstanding line and word to text or wrap
        if (line_width + word_width >= width && line_width > 0)
            wrappedText += nextLine + "\n" + nextWord;
        else
            wrappedText += nextLine + nextWord;

        return wrappedText;
    };

    /**
     * Computes vertex values for text rendering and stores them in the local buffer
     */
BitmapText.prototype.fillBuffer =
    function(){
        this._buffer_pos = 0;

        var text;
        if (this._wrappedText!==null)
            text = this._wrappedText;
        else
            text = this._text;

        // check buffer size
        if (this._buffer.length < text.length*6*5)
            this._buffer = this._enlargeBuffer(this._buffer, text.length*6*5);



        var lineX = this._topLeft[0];
        //float line_height = textureFont.getLineHeight();
        var lineY = this._topLeft[1];
        var char_metrics = null;
        var character =  String.fromCharCode(0);
        // character width in xy space due to scaling of characters 
        var char_width = 0;

        var max_lineX = 0;

        var buf = new Float32Array(30);
        for(var i=0; i<text.length; i++) {
            character = text.charAt(i);

            if (character == '\r')
                continue;

            // forced line break
            if (character == '\n') {
                lineX = this._topLeft[0];
                lineY -= this._line_height;
                continue;
            }

            char_metrics = this._textureFont.getCharacterMetrics(character);
            //console.log("metrics for "+character+" : "+CGMath.vec4Str(char_metrics));
            if (char_metrics == null) {
                character = ' ';
                char_metrics = this._textureFont.getCharacterMetrics(character);
            }

            char_width = this._line_height * char_metrics[2] / char_metrics[3];

            // line break
            if (char_width + lineX - this._topLeft[0] > this._width && this._wrapChars) {
                lineX = this._topLeft[0];
                lineY -= this._line_height;
            }

            // drop space character at line starts
            if (character == ' ' && lineX == this._topLeft[0])
                continue;
            if (character != ' ') {

                buf[0] = lineX;               buf[1] = lineY;                  buf[2] = 0.0;
                    buf[3] = char_metrics[0]; buf[4] = 1-(char_metrics[1]+char_metrics[3]-this._uv_vertical_offset);
                buf[5] = lineX;               buf[6] = lineY - this._line_height;    buf[7] = 0.0;
                    buf[8] = char_metrics[0]; buf[9] =  1-char_metrics[1];
                buf[10] = lineX + char_width; buf[11] = lineY - this._line_height;   buf[12] = 0.0;
                    buf[13] =  char_metrics[0]+char_metrics[2]; buf[14] = 1-char_metrics[1];

                buf[15] = lineX + char_width; buf[16] = lineY; buf[17] = 0.0;
                    buf[18] = char_metrics[0]+char_metrics[2]; buf[19] = 1-(char_metrics[1]+char_metrics[3]-this._uv_vertical_offset);
                buf[20] = lineX;              buf[21] = lineY; buf[22] = 0.0;
                    buf[23] = char_metrics[0];                buf[24] =1-( char_metrics[1]+char_metrics[3]-this._uv_vertical_offset);
                buf[25] = lineX + char_width; buf[26] = lineY - this._line_height;   buf[27] = 0.0;
                    buf[28] = char_metrics[0]+char_metrics[2]; buf[29] = 1-char_metrics[1];

                this._buffer.set(buf,this._buffer_pos);
                this._buffer_pos += 30;
                /*
                buffer.put(new float[]{
                        lineX,              lineY,               0.0f, char_metrics[0],                 char_metrics[1]+char_metrics[3],
                        lineX,              lineY - line_height, 0.0f, char_metrics[0],                 char_metrics[1],
                        lineX + char_width, lineY - line_height, 0.0f, char_metrics[0]+char_metrics[2], char_metrics[1],
                    
                        lineX + char_width, lineY,               0.0f, char_metrics[0]+char_metrics[2], char_metrics[1]+char_metrics[3],
                        lineX,              lineY,               0.0f, char_metrics[0],                 char_metrics[1]+char_metrics[3],
                        lineX + char_width, lineY - line_height, 0.0f, char_metrics[0]+char_metrics[2], char_metrics[1]
                });
                 */
            }

            lineX += char_width;
            if (lineX > max_lineX)
                max_lineX = lineX;

        }

        //console.log("textbuff: "+CGMath._buffStr(this._buffer, 0, this._buffer_pos, 5));

        // update bounding box
        this.updateBoundingBox(max_lineX - this._topLeft[0], this._topLeft[1] - (lineY - this._line_height));

        this._needBufferTransfer = true;        

    };

     /**
     * Starts the update of the local buffer and transforms the vertices 
     */
BitmapText.prototype.updateLocalBuffer =
    function(){
        // first create untransformed buffer
        this.fillBuffer();

        if (this._transform) {

            this._initialTranslate[0] = - this._bbox._center[0];
            this._initialTranslate[1] = - this._bbox._center[1];

            this._translate[0] = this._bbox._center[0];
            this._translate[1] = this._bbox._center[1];

            // then transform correct values
            this._updateTransformMatrix();

            var point = new Float32Array(4);
            point[3] = 1.0;
            var result = new Float32Array(4);

            // step through each rect
            for(var i=0; i< this._buffer_pos; i+=30) {
                // transform first 4 points
                for(var j=0; j< 20; j+=5) {
                    point[0] = this._buffer[i + j];
                    point[1] = this._buffer[i + j + 1];
                    CGMath.multMatVec4(this._transformMatrix, point, result);
                    this._buffer.set(result[0], i + j);
                    this._buffer.set(result[1], i + j + 1);
                }
                // copy last two points
                this._buffer.set(this._buffer[i], i + 20);
                this._buffer.set(this._buffer[i+1], i + 21);
                this._buffer.set(this._buffer[i+10], i + 25);
                this._buffer.set(this._buffer[i+11], i + 26);
            }

            this._transformBoundingBox();

        } else {
            // no transform do nothing
        }

        this._needLocalUpdate = false;
    };

BitmapText.prototype._enlargeBuffer =
    function(buffer, min){
        var newSize = buffer.length * 2;
        while(newSize < min)
            newSize = newSize * 2;
        var newBuffer = new Float32Array(newSize);
        newBuffer.set(buffer);
        return newBuffer;
    };

BitmapText.prototype.init =
    function(gl, camera){
        gl.activeTexture(gl.TEXTURE0);
        if(this._bitmapTextProgram == null)
            this._loadProgram(gl);
        
        this.initBuffer(gl);
        
        this.updateBuffer(gl);

        this._textureFont.init(gl);
        
        this._initiated = true;
    };

BitmapText.prototype._loadProgram =
    function(gl){
        BitmapText.prototype._bitmapTextProgram = new Program();

        var programReady = true;
        programReady = programReady & BitmapText.prototype._bitmapTextProgram.createProgram(gl);
        programReady = programReady & BitmapText.prototype._bitmapTextProgram.setVertexShader(gl, gl.res.getRessource('bitmapText.vs'));
        programReady = programReady & BitmapText.prototype._bitmapTextProgram.setFragmentShader(gl, gl.res.getRessource('bitmapText.fs'));
        programReady = programReady & BitmapText.prototype._bitmapTextProgram.compileProgram(gl);
        if(!programReady){
            console.log('creating shader failed.');
        }

        BitmapText.prototype._textureUniformLocation = gl.getUniformLocation(BitmapText.prototype._bitmapTextProgram.getProgramId(),"textureThing");
        BitmapText.prototype._pmvUniformLocation = gl.getUniformLocation(BitmapText.prototype._bitmapTextProgram.getProgramId(),"pmvMatrix");
        BitmapText.prototype._colorUniformLocation = gl.getUniformLocation(BitmapText.prototype._bitmapTextProgram.getProgramId(),"color");
    };

BitmapText.prototype.disposeFinally =
    function(gl){
        if(BitmapText.prototype._bitmapTextProgram){
            BitmapText.prototype._bitmapTextProgram.dispose(gl);
            BitmapText.prototype._bitmapTextProgram = null;
        }   
    };

BitmapText.prototype.display =
    function(gl, camera){

        if (this._needLocalUpdate)
            this.updateLocalBuffer();

        if (this._needBufferTransfer)
            this.updateBuffer(gl);

        gl.useProgram(BitmapText.prototype._bitmapTextProgram.getProgramId());

        gl.bindTexture(gl.TEXTURE_2D, this._textureFont.getTextureId());

        gl.uniform1i(BitmapText.prototype._textureUniformLocation, 0);

        camera.updateUniformProgramLocation(gl, BitmapText.prototype._bitmapTextProgram.getProgramId(), BitmapText.prototype._pmvUniformLocation);

        gl.uniform4f(BitmapText.prototype._colorUniformLocation, this._textColor.r, this._textColor.g, this._textColor.b, this._textColor.a);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vb);

        gl.vertexAttribPointer(this._posAttrib, 3, gl.FLOAT, gl.FALSE, 5 * 4, 0);
        gl.enableVertexAttribArray(this._posAttrib);
        gl.vertexAttribPointer(this._uvAttrib, 2, gl.FLOAT, gl.FALSE, 5 * 4, 3 * 4);
        gl.enableVertexAttribArray(this._uvAttrib);
        gl.drawArrays(gl.TRIANGLES, 0, this._buffer_pos/5);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.useProgram(null);
    };

BitmapText.prototype.dispose =
    function(gl){
        gl.deleteBuffer(this._vb);
        this._buffer = null;
        this._buffer_pos = 0;
    };

BitmapText.prototype.render =
    function(layer){
        if(this._needLocalUpdate)
            this.updateLocalBuffer();
        if(this._dispBbox)
            layer.renderLines(this._bbox.getBoundingBoxLines(), 16, this._bboxColor);

        this._needLayerUpdate = false;
    };
