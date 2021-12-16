'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');

class MangaListener extends BaseListener {
    getParser() {
        return 'MangaParser';
    }

    async init (data) {
        return await this.getHtml(data.crawl_url);
    }
}

module.exports = MangaListener;