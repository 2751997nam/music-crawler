'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');

class ListSingerListener extends BaseListener {
    getParser() {
        return 'ListSingerParser';
    }

    async init (data) {
        return await this.getHtml(data.crawl_url);
    }
}

module.exports = ListSingerListener;