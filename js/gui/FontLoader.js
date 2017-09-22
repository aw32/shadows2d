FontLoader = {};

FontLoader.defaultFont = null;

FontLoader.loadDefaultFont =
    function(){
        FontLoader.defaultFont = new TextureFontLoader('ubuntuFont.png','ubuntuDescr.json');
    };
