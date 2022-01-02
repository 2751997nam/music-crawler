class DBConnection {
    register(Model) {
        Model.DBConnection = function (conn = 'mysql') {
            this.conn = conn;
            return this;
        };
    }
  }
  
module.exports = DBConnection;