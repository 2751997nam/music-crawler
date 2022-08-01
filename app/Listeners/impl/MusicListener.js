'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');

class MusicListener extends BaseListener {
    getParser() {
        return 'MusicParser';
    }

    async init (data) {
        return await this.getHtml(data.crawl_url);
    }
}

module.exports = MusicListener;