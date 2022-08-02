var fs = require("fs");

function Util() {
    /**
     * Get file list with full-path in a directory
     * @param {String} directory
     * @returns {Array}
     */
    this.browseFiles = function (directory) {
        var retval = [];
        var self = this;
        if (fs.existsSync(directory)) {
            fs.readdirSync(directory).forEach(function (item) {
                var subPath = directory + "/" + item;
                if (fs.lstatSync(subPath).isDirectory()) {
                    var files = self.browseFiles(subPath);
                    if (files.length > 0) {
                        retval = retval.concat(files);
                    }
                } else {
                    retval.push(subPath);
                }
            });
        }
        return retval;
    };

    this.slug = function (data) {
        var retval = data;
        try {
            str = retval;
            str = str.replace(/^\s+|\s+$/g, ""); // trim
            str = str.toLowerCase();

            // remove accents, swap ñ for n, etc
            var froms = [
                'àáạảãâầấậẩẫăằắặẳẵ',
                'èéẹẻẽêềếệểễ',
                'ìíịỉĩ',
                'òóọỏõôồốộổỗơờớợởỡ',
                'ùúụủũưừứựửữ',
                'ỳýỵỷỹ',
                'đ',
                /[^a-zA-Z0-9\-\_]/
            ];
            var toes = [
                'a',
                'e',
                'i',
                'o',
                'u',
                'y',
                'd',
                'A',
                'E',
                'I',
                'O',
                'U',
                'Y',
                'D',
                '-',
            ];

            for (var i = 0, l = froms.length; i < l; i++) {
                for (var j = 0; j < froms[i].length; j++) {
                    str = str.replace(
                        new RegExp(froms[i].charAt(j), "g"),
                        toes[i]
                    );
                }
            }

            str = str
                .replace('.', '-')
                .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
                .replace(/\s+/g, "-") // collapse whitespace and replace by -
                .replace(/-+/g, "-") // collapse dashes
                .replace(/^-+/, "") // trim - from start of text
                .replace(/-+$/, ""); // trim - from end of text

            return str;
        } catch (e) {
            console.log('err', e);
        } finally {
        }
        return retval;
    };

    this.removeEmoji = function (str) {
        return str.replace(/([#0-9]\u20E3)|[\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?/g, '');
    }
}

module.exports = new Util();
