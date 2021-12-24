'use strict'

const QueueClient = use('App/Utils/QueueClient');
const Config = use('Config');

class BaseParser
{
    constructor() {
        if (this.constructor == BaseParser) {
          throw new Error("Abstract classes can't be instantiated.");
        }
    }

    async init(html, input) {
        throw new Error("Method 'init()' must be implemented.");
    }

    getListenerAfterParse() {

    }

    async afterParse(crawlItems) {
        let listener = this.getListenerAfterParse();
        if (listener && crawlItems && crawlItems.length) {
            for (let item of crawlItems) {
                item.domain = this.getDomain(item.crawl_url);
                this.addJob(listener, item);
            }
        }
    }

    getDomain(url) {
        let { hostname } = new URL(url);
        hostname = hostname.replace('www.', '');
        return hostname;
    }

    addJob(listener, data) {
        QueueClient.addJob(listener, data, {priority: 1});
    }
}

module.exports = BaseParser;