const opts = {
	errorEventName:'error',
    logDirectory: __dirname.substring(0, __dirname.lastIndexOf('/app')) + '/sql-logs', // NOTE: folder must exist and be writable...
    fileNamePattern:'sql-<DATE>.log',
    dateFormat:'YYYY-MM-DD'
};
const Log = require('simple-node-logger').createRollingFileLogger( opts );

module.exports = Log;