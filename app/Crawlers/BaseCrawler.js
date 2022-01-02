"use strict";

const QueueClient = use('App/Utils/QueueClient');

class BaseCrawler {
    addJob(listener, data, option = {priority: 100}) {
        QueueClient.addJob(listener, data, {priority: 100});
    }

    getDomain(url) {
        let { hostname } = new URL(url);
        hostname = hostname.replace('www.', '');
        return hostname;
    }
}

module.exports = BaseCrawler;