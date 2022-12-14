'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');

class ListMusicListener extends BaseListener {
    getParser() {
        return 'ListMusicParser';
    }

    async init (data) {
        return await this.getHtml(data.crawl_url);
    }
}

module.exports = ListMusicListener