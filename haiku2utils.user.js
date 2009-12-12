// ==UserScript==
// @name           Haiku2Utils
// @namespace      http://www.scrapcode.net/
// @include        http://h2.hatena.ne.jp/*
// @version        0.0.10.1
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

        // ペンサイズ追加
        { name: 'addPenWidth', args: { pens: [ 15, 20, 30, 50 ] } },

        // カラーパレット追加
        { name: 'addColorPallet', args: { colors: 'ffffff dedfde 9ca2a5 292829 de3039 732c00 f7b29c ffdf4a 7bbead 295d52 8cc7ef 736dad' } },

        // canvasサイズ変更
        { name: 'resizeCanvas', args: { defaultWidth: 240, defaultHeight: 170 } },
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

    function getCanvas() {
        return document.getElementById( 'canvas' );
    }

    function getCanvasContext() {
        var canvas = getCanvas();
        return canvas ? canvas.getContext( '2d' ): null;
    }

    function createColorPallet( color ) {
        var a = createElement( 'a', {
            href: "javascript:CanvasDrawer.instance.setProp('strokeStyle', '" + color + "'); hidePanel()",
            innerHTML: '&#x25a0;',
        }, {
            color: color,
            backgroundColor: color,
            padding: '0 3px',
        } );
        return a;
    }

    function fillCanvas( top, left, width, height, color ) {
        var ctx = getCanvasContext();
        if( ! ctx ) return;
        ctx.fillStyle = color;
        ctx.fillRect( top, left, width, height );
    }

    function resizeCanvas( w, h ) {
        var canvas = getCanvas();
        if( ! canvas ) return;
        canvas.width  = w;
        canvas.height = h;
        fillCanvas( 0, 0, w, h, '#ffffff' );

        var panel = document.getElementById( 'panel' );
        if( ! panel ) return;
        panel.style.minWidth = '240px';
        panel.style.width    = w + 'px';
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
        for( var i = 0; i < imgs.length; ++i ) {
            var img = imgs[i];
            var params = parseQueryParam( img.src );
            var url    = params == null ? img.src: params.url;
//            if( url.match( /^(http:\/\/(?:img\.)?f\.hatena\.ne\.jp\/images\/.+)_\d+(\.(?:jpg|gif|png))/ ) ) {
//                url = RegExp.$1 + RegExp.$2;
//            }
            img.src = url;
            img.style.maxWidth  = args.maxSize;
            img.style.maxHeight = args.maxSize;
            if( args.bgcolor ) img.style.backgroundColor = args.bgcolor;
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

    utils.addPenWidth = function ( args ) {
        var pens = args.pens;
        var widthDiv = xpath( document.body, '//div[@id="panel"]//p[@class="width"]' );
        if( widthDiv.length != 1 ) return;
        widthDiv = widthDiv[0];

        for( var i = 0; i < pens.length; ++i ) {
            var pen = pens[i];
            var a   = createElement( 'a', {
                href: "javascript:CanvasDrawer.instance.setProp('lineWidth', " + pen + "); hidePanel()",
                innerHTML: pen,
            } );
            widthDiv.appendChild( a );
            widthDiv.appendChild( document.createTextNode( '\n' ) );
        }
    };

    utils.addColorPallet = function ( args ) {
        var colors = args.colors.split( /\s+/ );
        var colorPanel = xpath( document.body, '//div[@id="panel"]//p[@class="color"]' );
        if( colorPanel.length != 1 ) return;
        colorPanel = colorPanel[0];
        colorPanel.appendChild( createElement( 'br' ) );

        var add = createElement( 'a', {
            innerHTML: 'add',
        }, {
            cursor: 'pointer',
        }, {
            click: function (e) {
                var color = prompt( 'input color', '#' );
                if( color == null || color == '' || color == '#' ) return;
                colorPanel.appendChild( createColorPallet( color ) );
                colorPanel.appendChild( document.createTextNode( ' ' ) );
            },
        } );
        colorPanel.appendChild( add );
        colorPanel.appendChild( document.createTextNode( ' ' ) );

        for( var i = 0; i < colors.length; ++i ) {
            var color = '#' + colors[i];
            colorPanel.appendChild( createColorPallet( color ) );
            colorPanel.appendChild( document.createTextNode( ' ' ) );
        }
    };

    utils.resizeCanvas = function ( args ) {
        resizeCanvas( args.defaultWidth, args.defaultHeight );

        var panel = document.getElementById( 'panel' );
        if( panel == null ) return;

        var resizer     = createElement( 'p' );
        var width       = args.defaultWidth;
        var height      = args.defaultHeight;
        var runButton   = createElement( 'input', {
            type: 'button',
            value: 'Resize',
            disabled: true,
        },{
        },{
            click: function (e) {
                resizeCanvas( width, height );
                this.disabled = true;
            },
        } );
        var inputWidth  = createElement( 'input', {
            type: 'text',
            value: width,
        },{
            width: '30px',
        },{
            focus: function (e) { this.select(); },
            change: function (e) {
                if( this.value.match( /^([0-9]+)$/ ) ) {
                    width = RegExp.$1;
                    runButton.disabled = false;
                }
            },
        } );
        var inputHeight = createElement( 'input', {
            type: 'text',
            value: height,
        },{
            width: '30px',
        },{
            focus: function (e) { this.select(); },
            change: function (e) {
                if( this.value.match( /^([0-9]+)$/ ) ) {
                    height = RegExp.$1;
                    runButton.disabled = false;
                }
            },
        } );

        resizer.appendChild( document.createTextNode( 'W:' ) );
        resizer.appendChild( inputWidth );
        resizer.appendChild( document.createTextNode( 'px\nH:' ) );
        resizer.appendChild( inputHeight );
        resizer.appendChild( document.createTextNode( 'px\n' ) );
        resizer.appendChild( runButton );

        panel.appendChild( resizer );
    };

    for( var i = 0; i < runUtils.length; ++i ) {
        var target = runUtils[i];
        utils[ target.name ]( target.args );
    }
})();
