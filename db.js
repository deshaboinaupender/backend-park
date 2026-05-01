const Database = require("better-sqlite3");
const path = require("path");

// Create DB
const db = new Database(path.join(__dirname, "parking.db"));

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS parking_spots (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    total_slots INTEGER NOT NULL,
    available_slots INTEGER NOT NULL
  )
`);

module.exports = db;