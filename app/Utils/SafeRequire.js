let fs = require('fs');
let path = require('path');

function safeRequire(modulePath) {
    let requiredModule = null; // or a default object {}
    
    let pathToModule = path.join(modulePath);
    if (fs.existsSync(pathToModule)) {
        requiredModule = require(pathToModule);
    } else {
        throw new Error('Module Not Found: ' . pathToModule);
    }

    return requiredModule;
}

module.exports = safeRequire;