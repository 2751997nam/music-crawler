"use strict";

const Helpers = use("Helpers");
const dir = Helpers.appRoot() + "/app";
const { Worker } = use('bullmq');
const Config = use("Config");
const parserManger = require("../Parsers/ParserManager");
const Log = use('App/Utils/Log');
class ListenerManager {
    async init() {
        this.implDir = dir + "/Listeners/impl";
        var queueName = Config.get("crawl.queueName");
        this.worker = new Worker(queueName, async job => {
            const listener = this.loadClass(
                this.implDir + "/" + job.name
            );
            Log.info(job.name + ' ', job.data.crawl_url);
            let result = await listener.init(job.data);
            await parserManger.init(result, job.data, listener.getParser());
        }, {
            limiter: {
                concurrency: 10,
                duration: 30000,
            },
        });
    }

    loadClass(dir) {
        var className = new (require(dir))();
        return className;
    }
}

module.exports = new ListenerManager();
