// ==UserScript==
// @name           Haiku2Utils
// @namespace      http://www.scrapcode.net/
// @include        http://h2.hatena.ne.jp/*
// @version        0.0.16
// ==/UserScript==
(function( uWindow ) {
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

        // 画像へのリンクをPC用URLにする
        { name: 'imageLinkToPCURL', args: {} },

        // bodyのstyle指定
        { name: 'setBodyStyle', args: { fontSize: '90%' } },

        // ルームつぶやきへのReplyで、ルームへ投稿するかしないかを選択可にする
        { name: 'replySelecter', args: {} },

        // 手書きとテキストを同時に投稿できるようにする
        { name: 'textWithCanvas', args: {} },

        // うごメモのインラインプレーヤー化
        { name: 'ugomemoPlayer', args: {} },
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
        footer.style.height   = '25px';
        footer.style.position = 'fixed';
        footer.style.bottom   = '-5px';
        footer.style.backgroundColor      = body.style.backgroundColor;
        footer.style.backgroundImage      = body.style.backgroundImage;
        footer.style.backgroundRepeat     = body.style.backgroundRepeat;
        footer.style.backgroundPosition   = body.style.backgroundPosition;
        footer.style.backgroundAttachment = body.style.backgroundAttachment;

        body.style.paddingBottom = '25px';
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
                e.preventDefault();
                this.disabled = true;
                this.form.submit();
            }, true );
        }
    };

    utils.imageLinkToPCURL = function ( args ) {
        var links = xpath( document.body, '//td[@class="entry"]//a' );
        var fotolifeRegExp = new RegExp(
            '^http:\\/\\/img\\.f\\.hatena\\.ne\\.jp\\/images\\/fotolife\\/[a-zA-Z]\\/('
            + ID_REGEXP +
            ')\/\\d+\/(\\d+)\.(?:jpg|png|gif)$'
        );

        for( var i = 0; i < links.length; ++i ) {
            var link = links[i];
            if( link.href.match( /^(http:\/\/f\.hatena\.ne\.jp\/)mobile\/(.+)/ ) ) {
                link.href = RegExp.$1 + RegExp.$2;
                continue;
            }

            if( link.href.match( /^http:\/\/mgw\.hatena\.ne\.jp\// ) ) {
                var params = parseQueryParam( link.href );
                if( ! params.url ) continue;

                if( params.url.match( fotolifeRegExp ) ) {
                    params.url = 'http://f.hatena.ne.jp/' + RegExp.$1 + '/' + RegExp.$2;
                }
                link.href = params.url;
                continue;
            }
        }
    };

    utils.setBodyStyle = function ( args ) {
        var body = document.getElementsByTagName( 'body' )[0];
        for( var k in args ) {
            body.style[k] = args[k];
        }
    };

    utils.replySelecter = function ( args ) {
        var fromKeyword = xpath( document.body, '//form[@action="/"]//input[@name="from_keyword"]' );
        if( fromKeyword.length != 1 ) return;
        fromKeyword = fromKeyword[0];

        var entries = xpath( document.body, '//td[@class="entry"]' );
        if( entries.length == 0 ) return;
        
        var entry = entries[0];
        var firstLine = entry.innerHTML.split( '<br>', 2 )[0];

        if( ! firstLine.match( /<a\s+href="\/keyword\/\d+"/ ) ) return;

        function createRadio( name, value, text, defaultValue ) {
            var id    = name + '_' + value;
            var label = createElement( 'label', { 'for': id } );
            var input = createElement( 'input', {
                'type': 'radio',
                'id': id,
                'name': name,
                'value': value,
            } );
            if( value == defaultValue ) input.setAttribute( 'checked', 'checked' );
            label.appendChild( input );
            label.appendChild( document.createTextNode( text ) );
            return label;
        }

        var span = createElement( 'span' );
        span.appendChild( createRadio( 'from_keyword', '1', 'ルームに投稿する', fromKeyword.value ) );
        span.appendChild( document.createTextNode( ' ' ) );
        span.appendChild( createRadio( 'from_keyword', '', 'ルームに投稿しない', fromKeyword.value ) );

        fromKeyword.form.replaceChild( span, fromKeyword );
    };

    utils.textWithCanvas = function ( args ) {
        if( ! uWindow || ! uWindow.Hatena || ! uWindow.Hatena.Haiku || ! uWindow.Hatena.Haiku.Canvas || ! uWindow.Hatena.Visitor ) return;

        var canvasMain = document.getElementById( 'canvas-main' );
        if( ! canvasMain ) return;

        var canvasClass = uWindow.Hatena.Haiku.Canvas;
        var postDrawing = canvasClass.postDrawing;
        canvasClass.postDrawing = function (uri) {
            var post = document.getElementById( 'h2u_body_post' ).value;
            var body = document.getElementById( 'h2u_body' );

            if( post != '' ) post = '\n' + post;
            
            body.value = uri + post;
            body.form.submit();
        };

        var form = createElement( 'form', {
            action: canvasClass.endPoint,
            method: 'post',
        } );

        form.appendChild( createElement( 'input', {
            type: 'hidden',
            name: 'rkm',
            value: uWindow.Hatena.Visitor.RKM,
        } ) );
        form.appendChild( createElement( 'input', {
            type:  'hidden',
            name:  'body',
            id:    'h2u_body',
            value: '',
        } ) );
        form.appendChild( createElement( 'textarea', {
            'id': 'h2u_body_post',
        }, {
            width:   '60%',
            height:  '70px',
            padding: '3px',
            display: 'block',
            margin:  '20px auto',
        } ) );

        canvasMain.appendChild( form );
    };

    utils.ugomemoPlayer = function ( args ) {
        var divs   = xpath( document.body, '//td[@class="entry"]//div' );
        var regexp = new RegExp(
            'href="http://ugomemo\\.hatena\\.ne\\.jp/(?:mobile/)?'
            + '([0-9A-F]+)@DSi/movie/([0-9A-F]+_[0-9A-F]+_[0-9A-F]+)"'
        );
        for( var i = 0; i < divs.length; ++i ) {
            var div = divs[i];
            if( ! div.innerHTML.match( regexp ) ) continue;
            var did  = RegExp.$1;
            var file = RegExp.$2;

            var newDiv  = createElement( 'div', {}, {
                textAlign: 'center',
            } );

            var ugomemo = createElement( 'object', {
                data:   'http://ugomemo.hatena.ne.jp/js/ugoplayer_s.swf',
                type:   'application/x-shockwave-flash',
                width:  279,
                height: 240,
            } );
            ugomemo.appendChild( createElement( 'param', {
                name:  'movie',
                value: 'http://ugomemo.hatena.ne.jp/js/ugoplayer_s.swf',
            } ) );
            ugomemo.appendChild( createElement( 'param', {
                name:  'FlashVars',
                value: 'did=' + did + '&file=' + file,
            } ) );

            newDiv.appendChild( ugomemo );
            div.parentNode.replaceChild( newDiv, div );
        }
    };

    for( var i = 0; i < runUtils.length; ++i ) {
        var target = runUtils[i];
        utils[ target.name ]( target.args );
    }

})( this.unsafeWindow || window );
