var arr = [`.menu-mobile`,
    `slicknav`,
    `#menu`,
    `val`,
    `_self`,
    `open`,
    `change`,
    `.select-chapter`,
    `<div id="top"></div>`,
    `append`,
    `body`,
    `scrollTop`,
    `fadeIn`,
    `#top`,
    `fadeOut`,
    `scroll`,
    `animate`,
    `html, body`,
    `click`,
    `error`,
    `width`,
    `.cmt_doc`,
    `data-width`,
    `getAttribute`,
    `fb-comments`,
    `getElementsByClassName`,
    `attr`,
    `.fb-comments`,
    `parse`,
    `XFBML`,
    `smartresize`,
    `ready`,
    `remove`,
    `.vung_doc a`,
    `<img src="`,
    `" alt="Trang `,
    ` - Mangak.net" title="Trang `,
    ` - Mangak.net" data-x="`,
    `" data-e="1" />`,
    `.vung_doc`,
    `each`,
    `hide`,
    `.vung_doc img`,
    `end`,
    `addClass`,
    `.vung_doc img:last-child`,
    `<img src="http://truyendep.com/wp-content/themes/manga/images/ajax-loader.gif" id="img-load" alt="load">`,
    `parent`,
    `yes`,
    `hasClass`,
    `#img-size`,
    `#img-load`,
    `src`,
    `
    `,`data`,
    `match`,
    `&`,
    `replace`,
    `https://images.weserv.nl/?url=`,
    `slideDown`,
    `error`,
    `data-e`,
    `data-x`,
    `aHR0cDovL3RydXllbnRyYW5obWFuZ2EuY29tL2ltYWdlcy8=`,
    `LmpwZw==`,
    `on`,
    `data-height`,
    `iframe`,
    `createElement`,
    `scrolling`,
    `no`,
    `setAttribute`,
    `style`,
    `width:100%;height:`,
    `px;margin:0 auto;display:block`,
    `/wp-content/themes/manga/ad/`,
    `.html`,
    `appendChild`,
    `apply`,
    `fn`,
    `resize`,
    `bind`,
    `trigger`,
    `#prev`,
    `#next`,
    `keyup`,
    `which`,
    `href`,
    `location`,
];
$(document)[arr[31]](function () {
    $(arr[2])[arr[1]]({ prependTo: arr[0] });
    $(arr[7])[arr[6]](function () {
        window[arr[5]]($(this)[arr[3]](), arr[4]);
    });
    $(arr[10])[arr[9]](arr[8]);
    $(window)[arr[15]](function () {
        if ($(window)[arr[11]]() != 0) {
            $(arr[13])[arr[12]]();
        } else {
            $(arr[13])[arr[14]]();
        }
    });
    $(arr[13])[arr[18]](function () {
        $(arr[17])[arr[16]]({ scrollTop: 0 }, 500);
    });
    $(arr[10])[arr[9]](arr[19]);
    if (
        $(arr[21])[arr[20]]() !=
        document[arr[25]](arr[24])[0][arr[23]](arr[22])
    ) {
        $(arr[27])[arr[26]](arr[22], $(arr[21])[arr[20]]());
    }
    $(window)[arr[30]](function () {
        if (
            $(arr[21])[arr[20]]() !=
            document[arr[25]](arr[24])[0][arr[23]](arr[22])
        ) {
            $(arr[27])[arr[26]](
                arr[22],
                $(arr[21])[arr[20]]()
            );
            FB[arr[29]][arr[28]]($(arr[21])[0]);
        }
    });
});
function loadAllImg(_0xe941x2) {
    $(arr[33])['remove']();
    $[arr[40]](content, function (_0xe941x3, _0xe941x4) {
        $(arr[39])[arr[9]](
            arr[34] +
                _0xe941x4 +
                arr[35] +
                _0xe941x3 +
                arr[36] +
                _0xe941x3 +
                arr[37] +
                _0xe941x3 +
                arr[38]
        );
    });
    $(arr[42])[arr[41]]();
    $(arr[45])[arr[44]](arr[43]);
    $(arr[39])[arr[47]]()[arr[9]](arr[46]);
    var _0xe941x5 = 0,
        _0xe941x6;
    if ($(arr[50])[arr[49]](arr[48])) {
        $(arr[51])['remove']();
        $(arr[42])[arr[40]](function () {
            $(this)[arr[26]](arr[52], arr[53]);
            loadImage($(this), _0xe941x5, _0xe941x2);
            _0xe941x5++;
        });
    } else {
        $(arr[42])[arr[40]](function () {
            $(this)
                [arr[26]](arr[54], $(this)[arr[26]](arr[52]))
                [arr[26]](arr[52], arr[53]);
            loadImage($(this), _0xe941x5, _0xe941x2);
            _0xe941x5++;
        });
        $(arr[50])[arr[44]](arr[48]);
    }
}
function loadImage(_0xe941x8, _0xe941x5, _0xe941x2) {
    var _0xe941x9 = _0xe941x8[arr[26]](arr[54]);
    if (!_0xe941x9[arr[55]](/images.weserv.nl/, _0xe941xa)) {
        var _0xe941xa = encodeURIComponent(
            _0xe941x9[arr[57]](/&amp;/g, arr[56])
        );
        _0xe941x8[arr[26]](arr[52], arr[58] + _0xe941xa);
    } else {
        _0xe941x8[arr[26]](arr[52], _0xe941x9);
    }
    setTimeout(function () {
        _0xe941x8[arr[59]]();
        if (_0xe941x8[arr[49]](arr[43])) {
            $(arr[51])['remove']();
        }
    }, 2000 * _0xe941x5);
    $(arr[42])[arr[65]](arr[60], function () {
        if ($(this)[arr[26]](arr[61]) != 0) {
            var _0xe941xb = $(this)[arr[26]](arr[62]);
            var _0xe941xc =
                atob(arr[63]) +
                btoa(content[_0xe941xb]) +
                atob(arr[64]);
            $(this)[arr[26]](arr[52], _0xe941xc);
            $(this)[arr[26]](arr[61], 0);
        }
    });
}
function add_ad(_0xe941xe, _0xe941xf) {
    var _0xe941x10 = document[arr[25]](_0xe941xf)[0];
    var _0xe941x11 = _0xe941x10[arr[23]](arr[66]);
    var _0xe941x12 = document[arr[68]](arr[67]);
    _0xe941x12[arr[71]](arr[69], arr[70]);
    _0xe941x12[arr[71]](
        arr[72],
        arr[73] + _0xe941x11 + arr[74]
    );
    _0xe941x12[arr[52]] =
        arr[75] + _0xe941x10[arr[23]](arr[54]) + arr[76];
    var _0xe941x13 = document[arr[25]](_0xe941xe)[0];
    _0xe941x13[arr[77]](_0xe941x12);
}
(function (_0xe941x14, _0xe941x15) {
    var _0xe941x16 = function (_0xe941x17, _0xe941x18, _0xe941x19) {
        var _0xe941x1a;
        return function _0xe941x1b() {
            var _0xe941x1c = this,
                _0xe941x1d = arguments;
            function _0xe941x1e() {
                if (!_0xe941x19) {
                    _0xe941x17[arr[78]](_0xe941x1c, _0xe941x1d);
                }
                _0xe941x1a = null;
            }
            if (_0xe941x1a) {
                clearTimeout(_0xe941x1a);
            } else {
                if (_0xe941x19) {
                    _0xe941x17[arr[78]](_0xe941x1c, _0xe941x1d);
                }
            }
            _0xe941x1a = setTimeout(_0xe941x1e, _0xe941x18 || 100);
        };
    };
    jQuery[arr[79]][_0xe941x15] = function (_0xe941x1f) {
        return _0xe941x1f
            ? this[arr[81]](arr[80], _0xe941x16(_0xe941x1f))
            : this[arr[82]](_0xe941x15);
    };
})(jQuery, arr[30]);
jQuery(function (_0xe941x14) {
    var _0xe941x20 = {};
    _0xe941x20[37] = arr[83];
    _0xe941x20[39] = arr[84];
    _0xe941x14(document)[arr[65]](arr[85], function (_0xe941x21) {
        var _0xe941x22,
            _0xe941x23 = _0xe941x20[_0xe941x21[arr[86]]];
        if (_0xe941x23) {
            _0xe941x22 = _0xe941x14(_0xe941x23)[arr[26]](arr[87]);
            if (_0xe941x22) {
                window[arr[88]] = _0xe941x22;
            }
        }
    });
});
