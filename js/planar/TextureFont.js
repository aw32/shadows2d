function TextureFont(){

}

TextureFont.prototype.getTextureSize =
    function(){
        return 0;
    };

TextureFont.prototype.getTextureId =
    function(){
        return -1;
    };

TextureFont.prototype.getCharacterMetrics =
    function(character){
        return [0,0,0,0];
    };

TextureFont.prototype.getCharacters =
    function(){
        return "";
    };

TextureFont.prototype.init =
    function(gl){
    
    };
