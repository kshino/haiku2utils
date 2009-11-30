// ==UserScript==
// @name           Haiku2Utils
// @namespace      http://www.scrapcode.net/
// @include        http://h2.hatena.ne.jp/*
// @version        0.0.5
// ==/UserScript==
(function() {
    // Select utility
    var runUtils = [
        // つぶやき欄の拡張
        { name: 'wideTsubuyaki', args: {} },

        // 画像を大きく表示
        { name: 'wideImage', args: { maxSize: '300px', bgcolor: 'white' } },
        // 画像の透過をそのままにしておく場合は、上記からbgcolorの指定を消して、
        // { name: 'wideImage', args: { maxSize: '300px' } },
        // のようにしてください

        // ナビゲーション部の固定表示
        { name: 'fixedNavigation', args: {} },
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
        var inputs = xpath( document.body, '//input[@name="body"]' );

        for( var i = 0; i < inputs.length; ++i ) {
            var input = inputs[i];

            input.size = undefined;
            input.style.width        = '90%';
            input.style.display      = 'block';
            input.style.marginBottom = '5px';
        }
    };

    utils.wideImage = function ( args ) {
        var imgs = xpath( document.body, '//td[@class="entry"]//img[@alt="photo"]' );
        for( var i = 0; i < imgs.length; ++i ) {
            var img = imgs[i];
            var params = parseQueryParam( img.src );
            var url    = params == null ? img.src: params.url;
            if( url.match( /^(http:\/\/(?:img\.)?f\.hatena\.ne\.jp\/images\/.+)_\d+(\.(?:jpg|gif|png))/ ) ) {
                url = RegExp.$1 + RegExp.$2;
            }
            img.src = url;
            img.style.maxWidth  = args.maxSize;
            img.style.maxHeight = args.maxSize;
            if( args.bgcolor ) img.style.backgroundColor = args.bgcolor;
        }
    };

    utils.fixedNavigation = function ( args ) {
        var footer = document.getElementById( 'footer' );
        footer.style.width    = '100%';
        footer.style.height   = '20px';
        footer.style.position = 'fixed';
        footer.style.bottom   = '-5px';
        footer.style.backgroundColor = 'white';

        document.getElementsByTagName( 'body' )[0].style.paddingBottom = '20px';
    };

    for( var i = 0; i < runUtils.length; ++i ) {
        var target = runUtils[i];
        utils[ target.name ]( target.args );
    }
})();
