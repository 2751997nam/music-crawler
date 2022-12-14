"use strict";

const Helpers = use("Helpers");
const dir = Helpers.appRoot() + "/app";
const { Worker } = use('bullmq');
const Config = use("Config");
const parserManger = require("../Parsers/ParserManager");
const safeRequire = require("../Utils/SafeRequire");
const Log = use('App/Utils/Log');
class ListenerManager {
    async init() {
        this.implDir = dir + "/Listeners/impl";
        var queueName = Config.get("crawl.queueName");
        this.workers = [];
        const worker = new Worker(queueName, async job => {
            const listener = this.loadClass(
                this.implDir + "/" + job.name
            );
            Log.info(job.name + ' ', job.data.crawl_url);
            console.log(job.name, job.data.crawl_url);
            let result = await listener.init(job.data);
            let parser = listener.getParser();
            if (parser) {
                try {
                    await parserManger.init(result, job.data, parser);
                } catch (error) {
                    Log.info('error', error);                    
                }
            }
        }, {
            limiter: {
                concurrency: 10,
                duration: 30000,
            },
        });
        this.workers.push(worker);
    }

    loadClass(dir) {
        var className = new (safeRequire(dir))();
        return className;
    }
}

module.exports = new ListenerManager();
