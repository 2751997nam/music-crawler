'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');

class MangaChapterListener extends BaseListener {
    getParser() {
        return 'MangaChapterParser';
    }

    async init (data) {
        return await this.getHtml(data.crawl_url);
    }
}

module.exports = MangaChapterListener;