"use strict";

const Database = use("Database");
const QueueClient = use('App/Utils/QueueClient');

class BaseCrawler {
    addJob(listener, data) {
        QueueClient.addJob(listener, data, {priority: 100});
    }

    getDomain(url) {
        let { hostname } = new URL(url);
        hostname = hostname.replace('www.', '');
        return hostname;
    }
}

module.exports = BaseCrawler;