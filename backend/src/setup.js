const db = require("./db");
 
db.exec(`
  CREATE TABLE IF NOT EXISTS oeuvres (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    titre       TEXT    NOT NULL,
    type        TEXT    NOT NULL,
    statut      TEXT    NOT NULL,
    note        REAL,
    progression TEXT,
    commentaire TEXT,
    UNIQUE(titre, type)
  )
`);
 
console.log("Base de données prête.");