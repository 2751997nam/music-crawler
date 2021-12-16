'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');

class ChapterListener extends BaseListener {
    getParser() {
        return 'ChapterParser';
    }

    async init (data) {
        return await this.getHtml(data.crawl_url);
    }
}

module.exports = ChapterListener;