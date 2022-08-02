'use strict'

const safeRequire = require("../Utils/SafeRequire");

const Helpers = use("Helpers");
const dir = Helpers.appRoot() + "/app";
class ParserManager
{
    async init(html, input, parserName) {
        this.implDir = dir + "/Parsers/impl";
        let parser = this.loadClass(this.implDir + '/' + input.domain + '/' + parserName);
        let result = await parser.init(html, input);
        if (typeof parser.afterParse == 'function') {
            await parser.afterParse(result);
        }
    }

    loadClass(dir) {
        var className = new (safeRequire(dir))();
        return className;
    }
}

module.exports = new ParserManager();