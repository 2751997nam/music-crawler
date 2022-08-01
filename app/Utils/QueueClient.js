const { Queue, QueueScheduler } = use('bullmq');
const Config = use('Config');

class QueueClient {
    constructor() {
        var queueName = Config.get('crawl.queueName');
        this.queueName = queueName;
        this.queueScheduler = new QueueScheduler(queueName);
        this.queue = new Queue(queueName);
    }

    addJob(listener, data, option = {}) {
        this.queue.add(listener, data, option);
    }
}

module.exports = new QueueClient();