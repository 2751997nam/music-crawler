'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');

class ListMusicSearchListener extends BaseListener {
    getParser() {
        return 'ListMusicSearchParser';
    }

    async init (data) {
        return await this.getHtml(data.crawl_url);
    }
}

module.exports = ListMusicSearchListener