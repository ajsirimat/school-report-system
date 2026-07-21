const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'reports.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create database tables if they do not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_name TEXT NOT NULL,
    teacher_surname TEXT NOT NULL,
    position TEXT,
    academic_standing TEXT,
    topic TEXT NOT NULL,
    training_date TEXT,
    organizer TEXT,
    location TEXT,
    budget REAL DEFAULT 0,
    knowledge_summary TEXT,
    dissemination_plan TEXT,
    suggestions TEXT,
    school_name TEXT DEFAULT 'โรงเรียนวังน้ำเย็นวิทยาคม',
    district TEXT DEFAULT 'อำเภอวังน้ำเย็น',
    province TEXT DEFAULT 'จังหวัดสระแก้ว',
    academic_year TEXT DEFAULT '2569',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    file_name TEXT,
    file_path TEXT,
    file_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE
  );
`);

module.exports = db;
