'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Contributor extends Model {
    static get table () {
        return 'contributor';
    }

    static boot() {
        super.boot();
        this.addTrait('DBConnection');
    }
    
    static get connection() {
        return this.conn;
    }
}

module.exports = Contributor;
