const { createClient } = require('redis');
const Log = require('./Log');

class Redis {
    constructor() {
        this.client = null;
    }

    async connect() {
        this.client = createClient();
        this.client.on('error', (err) => Log.error('Redis Client Error', err));
        await this.client.connect();
    }
    async getClient() {
        if (!this.client) {
            this.connect();
        }
        return this.client;
    }

    set(key, value) {
        this.getClient().then(client => client.set(key, value));
    }

    async get(key) {
        return await this.getClient().then(client => client.get(key));
    }

    async del(keyPattern) {
        const client = await this.getClient();
        const keys = await client.keys(keyPattern);

        keys.forEach((key) => {
            client.del(key);
        });
    }
}

module.exports = new Redis();