// ==UserScript==
// @name           Haiku2Utils
// @namespace      http://www.scrapcode.net/
// @include        http://h2.hatena.ne.jp/*
// @version        0.0.12.1
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

        // ナビゲーション部を拡張
        { name: 'exNavigation', args: {} },

        // ニックネームの後にIDを表示
        { name: 'showID', args: {} },

        // つぶやき投稿時等にSubmitボタンを無効にする
        { name: 'disableSubmitButtonOnClick', args: {} },
    ];

    const ID_REGEXP = '[a-zA-Z][a-zA-Z0-9_-]{1,30}[a-zA-Z0-9]';

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

    function createElement ( type, attr, style, event ) {
        var element = document.createElement( type );
        if( attr  == null ) attr  = {};
        if( style == null ) style = {};
        if( event == null ) event = {};

        for( var a in attr  ) {
            if( type == 'a' && a == 'innerHTML' ) {
                element[a] = attr[a];
            }else {
                element.setAttribute( a, attr[a] );
            }
        }
        for( var s in style ) element.style[s] = style[s];
        for( var e in event ) element.addEventListener( e, event[e], true );

        return element;
    }

/////////////////////////////////////////////////////////////

    var utils = {};

    utils.wideTsubuyaki = function ( args ) {
        var inputs = xpath( document.body, '//input[@name="body"]' );

        for( var i = 0; i < inputs.length; ++i ) {
            var input = inputs[i];
            var tarea = createElement( 'textarea', {
                name: 'body',
            }, {
                width:        '60%',
                height:       '70px',
                padding:      '3px',
                display:      'block',
                marginBottom: '5px',
            } );

            input.form.replaceChild( tarea, input );
        }
    };

    utils.wideImage = function ( args ) {
        var imgs = xpath( document.body, '//td[@class="entry"]//img[@alt="photo"]' );
        var exts = { jpg: 'png', png: 'gif', gif: null, };
        var onerror = function (e) {
            if( this.src.match( /^(.+\.)(jpg|png|gif)$/ ) ) {
                this.src = RegExp.$1 + exts[ RegExp.$2 ];
            }
        };

        for( var i = 0; i < imgs.length; ++i ) {
            var img    = imgs[i];
            var params = parseQueryParam( img.src );
            var url    = params == null ? img.src: params.url;

            if( url.match( /^(http:\/\/(?:img\.)?f\.hatena\.ne\.jp\/images\/.+)_\d+(\.(?:jpg|gif|png))/ ) ) {
                url = RegExp.$1 + RegExp.$2;
                img.addEventListener( 'error', onerror, true );
            }

            img.style.maxWidth  = args.maxSize;
            img.style.maxHeight = args.maxSize;
            if( args.bgcolor ) img.style.backgroundColor = args.bgcolor;
            img.src = url;
        }
    };

    utils.fixedNavigation = function ( args ) {
        var body   = document.getElementsByTagName( 'body' )[0];
        var footer = document.getElementById( 'footer' );
        footer.style.width    = '100%';
        footer.style.height   = '20px';
        footer.style.position = 'fixed';
        footer.style.bottom   = '-5px';
        footer.style.backgroundColor      = body.style.backgroundColor;
        footer.style.backgroundImage      = body.style.backgroundImage;
        footer.style.backgroundRepeat     = body.style.backgroundRepeat;
        footer.style.backgroundPosition   = body.style.backgroundPosition;
        footer.style.backgroundAttachment = body.style.backgroundAttachment;

        body.style.paddingBottom = '20px';
    };

    utils.exNavigation = function ( args ) {
        var footer = document.getElementById( 'footer' );

        if( location.href.match( /^(http:\/\/h2?\.hatena\.ne\.jp\/keyword\/[0-9]+)/ ) ) {
            var roomURI = RegExp.$1;

            footer.appendChild( document.createTextNode( ' ' ) );

            footer.appendChild( createElement( 'img', {
                src: 'http://ugomemo.hatena.ne.jp/images/emoji/e-4B0.gif',
                alt: '[emoji:4B0]',
                width: 16,
                height: 16,
                class: 'emoji emoji-google',
            } ) );

            footer.appendChild( createElement( 'a', {
                href: roomURI,
                innerHTML: 'ルーム更新',
            } ) );
        }

        footer.appendChild( document.createTextNode( ' ' ) );
        var form = createElement( 'form', {
            action: '/user.search',
            method: 'get',
        }, {
            display: 'inline',
        } );

        form.appendChild( createElement( 'input', {
            type: 'text',
            name: 'q',
        }, {
            width: '100px',
        } ) );

        form.appendChild( createElement( 'input', {
            type: 'submit',
            value: 'ルーム/ユーザー検索',
        } ) );

        footer.appendChild( form );
    }

    utils.showID = function ( args ) {
        var entries = xpath( document.body, '//td[@class="entry"]' );
        var id_regexp = new RegExp( '/(' + ID_REGEXP + ')/$' );
        for( var i = 0; i < entries.length; ++i ) {
            var a = entries[i].firstChild;
            if( a.href && a.href.match( id_regexp ) ) {
                a.innerHTML += ' (id:' + RegExp.$1 + ')';
            }
        }
    };

    utils.disableSubmitButtonOnClick = function ( args ) {
        var buttons = xpath( document.body, '//input[@type="submit"]' );
        for( var i = 0; i < buttons.length; ++i ) {
            buttons[i].addEventListener( 'click', function (e) {
                this.disabled = true;
            }, true );
        }
    };

    for( var i = 0; i < runUtils.length; ++i ) {
        var target = runUtils[i];
        utils[ target.name ]( target.args );
    }
})();
