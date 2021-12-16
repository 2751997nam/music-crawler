'use strict'
const { exec } = require('child_process');

class BaseListener {
    constructor() {
        if (this.constructor == BaseListener) {
          throw new Error("Abstract classes can't be instantiated.");
        }
    }
    
    getParser() {
        throw new Error("Method 'getParser()' must be implemented.");
    }

    async getHtml (url) {
        let result = await new Promise((resolve, reject) => {
            exec("curl --location --request GET '" + url + "'", function (error, stdout, stderr) {
                if (error) {
                    console.log('error', error);
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            })
        });
        return result;
    }
}

module.exports = BaseListener;