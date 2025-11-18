import sqlite3 from "sqlite3";
import { open } from "sqlite";

const init = async () => {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recordings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        audio_path TEXT,
        transcript_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
};

const dbPromise = init();

export default {
  run: (...args) => dbPromise.then(db => db.run(...args)),
  get: (...args) => dbPromise.then(db => db.get(...args)),
  all: (...args) => dbPromise.then(db => db.all(...args)),
};
