'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');

class ImageListener extends BaseListener {
    getParser() {
        return 'ImageParser';
    }

    async init (data) {
        return data;
    }
}

module.exports = ImageListener;