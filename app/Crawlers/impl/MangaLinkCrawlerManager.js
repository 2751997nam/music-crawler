"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");
const Config = use('Config');
const Log = use('App/Utils/Log');
const Helpers = use('Helpers');
const dir = Helpers.appRoot() + '/app';
const Util = use('App/Utils/util');

class MangaLinkCrawlerManager extends BaseCrawler {
    async init(filter = null) {
        let crawlers = this.loadCrawlers(filter);
        for (let item of crawlers) {
            item.init(filter);
        }
    }

    loadCrawlers(filter = null) {
        let retVal = [];
        if (filter && filter.domain) {
            var crawler = new (require(dir + '/Crawlers/impl/MangaLinkCrawlers/' + filter.domain))();
            retVal.push(crawler);
        } else {
            retVal = this.loadClass(dir + '/Crawlers/impl/MangaLinkCrawlers');
        }

        return retVal;
    }

    loadClass(dir) {
        let retVal = [];
        var classPaths = Util.browseFiles(dir);
        classPaths.forEach(function (classPath) {
            if (classPath.indexOf(".js") === (classPath.length - 3)) {
                var crawler = new (require(classPath))();
                retVal.push(crawler);
            }
        });

        return retVal;
    };
}

module.exports = MangaLinkCrawlerManager;
