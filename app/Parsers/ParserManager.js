'use strict'
const Helpers = use("Helpers");
const dir = Helpers.appRoot() + "/app";
class ParserManager
{
    async init(html, input, parserName) {
        this.implDir = dir + "/Parsers/impl";
        let parser = this.loadClass(this.implDir + '/' + parserName);
        let result = await parser.init(html, input);
        await parser.afterParse(result);
    }

    loadClass(dir) {
        var className = new (require(dir))();
        return className;
    }
}

module.exports = new ParserManager();