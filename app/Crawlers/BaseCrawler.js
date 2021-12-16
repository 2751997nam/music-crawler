"use strict";

const Database = use("Database");
const { Queue, QueueScheduler } = use('bullmq');

const Config = use('Config');

class BaseCrawler {
    initQueue() {
        var queueName = Config.get('crawl.queueName');
        this.queueName = queueName;
        const myQueueScheduler = new QueueScheduler(queueName);
        this.queue = new Queue(queueName);
    }

    addJob(listener, data) {
        this.queue.add(listener, data, {delay: 100});
    }
}

module.exports = BaseCrawler;