const sqlite3=require('sqlite3').verbose();
const path = require('path');

const db=new sqlite3.Database(path.join(__dirname, 'parking.db'));

db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS parking_spots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        total_slots INTEGER NOT NULL,
        available_slots INTEGER NOT NULL
    )`);
});

module.exports=db;