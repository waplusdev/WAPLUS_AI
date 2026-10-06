const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const databaseDirectory = path.join(process.cwd(), 'database');
const databasePath = path.join(databaseDirectory, 'waplug.sqlite');
let connection;

function getDatabase() {
    if (connection) return connection;
    fs.mkdirSync(databaseDirectory, { recursive: true });
    connection = new Database(databasePath);
    connection.pragma('journal_mode = WAL');
    connection.exec(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_jid TEXT NOT NULL,
            author_jid TEXT,
            body TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS message_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            chat_jid TEXT NOT NULL,
            sender_jid TEXT,
            body TEXT,
            is_group INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
    return connection;
}

function closeDatabase() {
    if (connection) {
        connection.close();
        connection = undefined;
    }
}

module.exports = { getDatabase, closeDatabase, databasePath };
