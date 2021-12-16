'use strict'

const { Queue, QueueScheduler } = use('bullmq');
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
            this.initQueue();
            for (let item of crawlItems) {
                this.addJob(listener, item);
            }
        }
    }

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

module.exports = BaseParser;