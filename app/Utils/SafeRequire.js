let fs = require('fs');
let path = require('path');

function safeRequire(modulePath) {
    let requiredModule = null; // or a default object {}
    
    let pathToModule = path.join(modulePath);
    
    if (fs.existsSync(modulePath + '.js')) {
        try {
            requiredModule = require(modulePath);
            // console.log('requiredModule', requiredModule);
        } catch (error) {
            console.log('error', error);
        }
        // console.log('required done');
    } else {
        console.log('Module Not Found: ', modulePath);
    }

    return requiredModule;
}

module.exports = safeRequire;