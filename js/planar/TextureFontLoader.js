function TextureFontLoader(imageFile, descrFile){

this._imageFile = imageFile;

this._descrFile = descrFile;

this._textureData = null;

this._texture = -1;

this._initiated = false;

this._metrics = null;

this._characters = "";

this._line_height = 0;

this._size = 0;

this._mipmapping = false;

this._parseDescription();

}

TextureFontLoader.prototype = new TextureFont();
TextureFontLoader.prototype.constructor = TextureFontLoader;

TextureFontLoader.prototype.init =
    function(gl){
        if(this._initiated)
            return;

        this._texture = gl.createTexture();

        this._textureData = gl.res.getRessource(this._imageFile);

        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._textureData);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

        //gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);

        this._initiated = true;
    };

TextureFontLoader.prototype._parseDescription =
    function(){
        var json = Ressource.prototype.getRessource(this._descrFile);
        var obj = JSON.parse(json);
        this._line_height = obj.line_height;
        this._metrics = obj.metrics;
        this._characters = obj.characters;
        this._size = obj.size;    
    };

TextureFontLoader.prototype.dispose =
    function(gl){
        gl.deleteTexture(this._texture);
        this._texture = -1;
        this._metrics = null;
        this._textureData = null;
    };

TextureFontLoader.prototype.getTextureSize =
    function(){
        return this._size;
    };

TextureFontLoader.prototype.getTextureId =
    function(){
        return this._texture;
    };

TextureFontLoader.prototype.getCharacterMetrics =
    function(character){
        var index = this._characters.indexOf(character);
        if (index == -1)
            index = 0;
        return this._metrics[index];
    };

TextureFontLoader.prototype.getCharacters =
    function(){
        return this._characters;
    };


