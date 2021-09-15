let Mysqli = require('mysqli');

let conn = new Mysqli(
    {
        host: 'localhost',
        port:'3306',
        user: 'root',
        passwd: 'Mysql123!',
        db: 'test'
    }
);

let db = conn.emit(false,'');

module.export = {
    database: db
}
