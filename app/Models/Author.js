'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Author extends Model {
    static get table () {
        return 'Author';
    }

    static boot() {
        super.boot();
        this.addTrait('DBConnection');
    }
    
    static get connection() {
        return this.conn;
    }
}

module.exports = Author;
