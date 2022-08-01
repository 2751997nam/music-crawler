'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');

class SingerListener extends BaseListener {
    getParser() {
        return 'MusicListParser';
    }

    async init (data) {
        return await this.getHtml(data.crawl_url);
    }
}

module.exports = SingerListener