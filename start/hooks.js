const { hooks } = require('@adonisjs/ignitor')
const SqlLog = use('App/Utils/SqlLog');

hooks.after.providersBooted(() => {
    const Database = use('Database')
    Database.on('query', function (message) {
        let sql = message.sql;
        let logMessage = '';
        if (sql.indexOf('update') == 0 || sql.indexOf('insert') == 0 || sql.indexOf('delete') == 0) {
            let sqlPart = sql.split('?');
            for (let i = 0; i < sqlPart.length; i++) {
                logMessage += sqlPart[i];
                if (i < message.bindings.length) {
                    let item = message.bindings[i] + '';
                    item = item.replace(/\'/gm, "\\'");
                    if (!isNaN(item)) {
                        logMessage += `${item}`;
                    } else {
                        logMessage += ` '${item}' `;
                    }
                }
            }
            logMessage += ';';
            SqlLog.info(logMessage);
        }
    })
})