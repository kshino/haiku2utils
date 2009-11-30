// ==UserScript==
// @name           Haiku2Utils
// @namespace      http://www.scrapcode.net/
// @include        http://h2.hatena.ne.jp/*
// @version        0.0.1
// ==/UserScript==
(function() {
    // Select utility
    var runUtils = [
        // つぶやき欄の拡張
        { name: 'wideTsubuyaki', args: {} },
        
        // 画像を大きく表示
        { name: 'wideImage', args: { maxSize: '300px' } },
    ];

    function xpath( context, query ) {
        var items = document.evaluate(
            query, context, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
        );

        var elements = [];
        for( var i = 0; i < items.snapshotLength; ++i ) {
            elements.push( items.snapshotItem( i ) );
        }

        return elements;
    }

    function parseQueryParam( url, forceArrayKeys ) {
        if( ! url.match( /\?(.*)/ ) ) return null;

        var params = RegExp.$1.split( '&' );
        var hash   = {};
        var i;
        if( typeof( forceArrayKeys ) == 'Array' ) {
            for( i = 0; i < forceArrayKeys.length; ++i ) {
                hash[ forceArrayKeys[i] ] = [];
            }
        }

        for( i = 0; i < params.length; ++i ) {
            var p   = params[i].split( '=' );
            var key = decodeURIComponent( p[0] );
            var val = decodeURIComponent( p[1] );
            if( hash[key] ) {
                if( typeof( hash[key] ) != 'Array' ) {
                    hash[key] = [ hash[key] ];
                }
                hash[key].push( val );
            }else {
                hash[key] = val;
            }
        }

        return hash;
    }
    
    var utils = {};

    utils.wideTsubuyaki = function ( args ) {
        var inputs = xpath( document.body, '//form[@action="/"]//input[@name="body"]' );
        if( inputs.length != 1 ) return;
        
        var input = inputs[0];
            
        input.size = undefined;
        input.style.width        = '90%';
        input.style.display      = 'block';
        input.style.marginBottom = '5px';
    };
    
    utils.wideImage = function ( args ) {
        var imgs = xpath( document.body, '//td[@class="entry"]//center[@class="photo"]//img' );
        for( var i = 0; i < imgs.length; ++i ) {
            var img = imgs[i];
            var params = parseQueryParam( img.src );
            img.src = params.url;
            img.style.maxWidth  = args.maxSize;
            img.style.maxHeight = args.maxSize;
        }
    };
    
    for( var i = 0; i < runUtils.length; ++i ) {
        var target = runUtils[i];
        utils[ target.name ]( target.args );
    }
})();
