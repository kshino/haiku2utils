// ==UserScript==
// @name           Haiku2Utils
// @namespace      http://www.scrapcode.net/
// @include        http://h2.hatena.ne.jp/*
// @version        0.0.17.2
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

        // ひろばつぶやきへのReplyで、ひろばへ投稿するかしないかを選択可にする
        { name: 'replySelecter', args: {} },

        // 手書きとテキストを同時に投稿できるようにする
        { name: 'textWithCanvas', args: {} },

        // うごメモのインラインプレーヤー化
        { name: 'ugomemoPlayer', args: {} },

        // つぶやきToolbar表示
        { name: 'tsubuyakiToolbar', args: {} },
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
            var div   = createElement( 'div', {
                id: 'h2u_bodyBox',
            }, {
                width: '60%',
                marginBottom: '5px',
            } );
            div.appendChild( createElement( 'textarea', {
                name: 'body',
                id:   'h2u_body',
            }, {
                width:   '100%',
                height:  '70px',
                padding: '3px',
            } ) );

            input.parentNode.replaceChild( div, input );
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
                innerHTML: 'ひろば更新',
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
            value: 'ユーザー検索',
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
        span.appendChild( createRadio( 'from_keyword', '1', 'ひろばに投稿する', fromKeyword.value ) );
        span.appendChild( document.createTextNode( ' ' ) );
        span.appendChild( createRadio( 'from_keyword', '', 'ひろばに投稿しない', fromKeyword.value ) );

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

    utils.tsubuyakiToolbar = function ( args ) {
        var textbox = document.getElementsByName( 'body' );
        var toolbar = createElement( 'div', {
            id: 'h2u_toolbar',
        }, {
            textAlign: 'left',
        } );

        for( var i = 0; i < textbox.length; ++i ) {
            var tbox = textbox[i];
            var tag  = tbox.tagName.toLowerCase();
            if( tag != 'textarea' && tag != 'input' && tbox.type != 'text' ) continue;
            tbox.parentNode.insertBefore( toolbar, tbox );
            new EmojiTable( toolbar, tbox );
        }
    }

    for( var i = 0; i < runUtils.length; ++i ) {
        var target = runUtils[i];
        utils[ target.name ]( target.args );
    }

    function emojiImage( code, style, event ) {
        if( ! style ) style = {};
        if( ! event ) event = {};

        var src;
        var type = code.charAt( 0 );
        switch( type ) {
            case 'h': src = 'dsi/l/U+FA7' + code.slice( 1 ); break;
            case 'n': src = 'dsi/l/U+E0'  + code.slice( 1 ); break;
            default:  src = 'emoji/e-' + code; break;
        }

        return img = createElement( 'img', {
            'src':  'http://ugomemo.hatena.ne.jp/images/' + src + '.gif',
            width:  16,
            height: 16,
            alt:    '[emoji:' + code + ']',
            title:  '[emoji:' + code + ']',
            class:  'emoji emoji-google',
        }, style, event );
    }

    function EmojiTable( toolbar, target ) {
        var obj = this;

        this.opened = false;
        this.table  = createElement( 'div', {}, {
            textAlign: 'left',
        } );

        var emojiList = getEmojiList();
        for( var i = 0; i < emojiList.length; ++i ) {
            var emoji = emojiImage( emojiList[i], {}, {
                click: function (e) { obj.insertEmoji( e, this ); },
            } );
            this.table.appendChild( emoji );
        }

        toolbar.appendChild( emojiImage( '330', null, {
            click: function( e ){ obj.onclick( e ); },
        } ) );

        this.open = function() {
            toolbar.appendChild( this.table );
            this.opened = true;
        };

        this.close = function() {
            toolbar.removeChild( this.table );
            this.opened = false;
        };

        this.insertEmoji = function( e, emoji ) {
            var value  = target.value;
            var start  = target.selectionStart;
            var end    = target.selectionEnd;
            var before = value.slice( 0, start );
            var after  = value.slice( end );

            target.value = before + emoji.alt + after;
        };

        this.onclick = function( e ) {
            if( this.opened ) this.close();
            else              this.open();
        };
    }

    function getEmojiList() {
        return [
            '000', '001', '002', '003', '004', '005', '006', '007', '008', '011',
            '012', '013', '014', '015', '018', '019', '01A', '01B', '01D', '02A',
            '02B', '02C', '02D', '02E', '02F', '030', '031', '032', '033', '034',
            '035', '036', '038', '03C', '03D', '03E', '03F', '040', '050', '051',
            '190', '191', '195', '19A', '1B7', '1B8', '1B9', '1BA', '1BC', '1BD',
            '1BE', '1BF', '320', '321', '322', '323', '324', '325', '326', '327',
            '329', '32B', '32C', '330', '331', '332', '335', '339', '33A', '33D',
            '33E', '33F', '340', '349', '4B0', '4B2', '4B3', '4B4', '4B5', '4B6',
            '4B7', '4B9', '4BA', '4C3', '4C9', '4CD', '4CE', '4CF', '4D0', '4D1',
            '4D6', '4DC', '4DD', '4E2', '4EF', '4F0', '4F1', '4F2', '4F3', '506',
            '50F', '510', '511', '512', '522', '523', '525', '526', '527', '528',
            '529', '52B', '536', '537', '538', '539', '53A', '53E', '546', '553',
            '7D0', '7D1', '7D2', '7D3', '7D4', '7D5', '7D6', '7D7', '7D8', '7D9',
            '7DF', '7E0', '7E2', '7E4', '7E5', '7E6', '7E8', '7E9', '7EA', '7EB',
            '7F5', '7F6', '7F7', '7FA', '7FC', '800', '801', '803', '804', '805',
            '806', '807', '808', '80A', '813', '814', '81C', '81D', '823', '824',
            '825', '82B', '82C', '82D', '82E', '82F', '830', '831', '832', '833',
            '834', '835', '836', '837', '960', '961', '962', '963', '964', '980',
            '981', '982', '983', '984', '985', '986', 'AF0', 'AF1', 'AF2', 'AF3',
            'AF4', 'AF5', 'AF6', 'AF7', 'B04', 'B05', 'B06', 'B07', 'B08', 'B0C',
            'B0D', 'B0E', 'B0F', 'B1A', 'B1B', 'B1C', 'B1D', 'B1E', 'B20', 'B21',
            'B22', 'B23', 'B27', 'B28', 'B29', 'B2A', 'B2B', 'B2C', 'B2D', 'B2F',
            'B30', 'B31', 'B36', 'B48', 'B55', 'B56', 'B57', 'B58', 'B59', 'B5B',
            'B5C', 'B5D', 'B60', 'B61', 'B81', 'B82', 'B83', 'B84', 'B85', 'B93',
            'B94', 'B95', 'B96', 'B97', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15',
            'n00', 'n01', 'n02', 'n03', 'n04', 'n05', 'n06', 'n07', 'n08', 'n09',
            'n0A', 'n0B', 'n0C', 'n0D', 'n0E', 'n0F', 'n10', 'n11', 'n12', 'n13',
            'n15', 'n16', 'n17', 'n18', 'n19', 'n1A', 'n1B', 'n1C', 'n28', 'h00',
        ];
    }

})( this.unsafeWindow || window );
