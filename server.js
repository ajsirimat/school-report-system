const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'evidence-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

// --- API ENDPOINTS ---

// 1. Create a new training report
app.post('/api/reports', (req, res) => {
  try {
    const {
      teacher_name,
      teacher_surname,
      position,
      academic_standing,
      topic,
      training_date,
      organizer,
      location,
      budget,
      knowledge_summary,
      dissemination_plan,
      suggestions,
      school_name,
      district,
      province,
      academic_year
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO reports (
        teacher_name, teacher_surname, position, academic_standing,
        topic, training_date, organizer, location, budget,
        knowledge_summary, dissemination_plan, suggestions,
        school_name, district, province, academic_year
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      teacher_name || '',
      teacher_surname || '',
      position || '',
      academic_standing || '',
      topic || '',
      training_date || '',
      organizer || '',
      location || '',
      budget ? parseFloat(budget) : 0,
      knowledge_summary || '',
      dissemination_plan || '',
      suggestions || '',
      school_name || 'โรงเรียนวังน้ำเย็นวิทยาคม',
      district || 'อำเภอวังน้ำเย็น',
      province || 'จังหวัดสระแก้ว',
      academic_year || '2569'
    );

    res.json({ success: true, reportId: info.lastInsertRowid, message: 'บันทึกรายงานสำเร็จ' });
  } catch (err) {
    console.error('Error saving report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Upload file attachments for a report
app.post('/api/upload/:reportId', upload.array('attachments', 10), (req, res) => {
  try {
    const reportId = req.params.reportId;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.json({ success: true, message: 'ไม่มีไฟล์แนบ' });
    }

    const stmt = db.prepare(`
      INSERT INTO attachments (report_id, file_name, file_path, file_type)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((fileList) => {
      for (const file of fileList) {
        const fileUrl = '/uploads/' + file.filename;
        stmt.run(reportId, file.originalname, fileUrl, file.mimetype);
      }
    });

    insertMany(files);

    res.json({ success: true, message: `อัปโหลด ${files.length} ไฟล์สำเร็จ` });
  } catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get all reports
app.get('/api/reports', (req, res) => {
  try {
    const reports = db.prepare('SELECT * FROM reports ORDER BY id DESC').all();
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get a single report with attachments
app.get('/api/reports/:id', (req, res) => {
  try {
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'ไม่พบรายงาน' });
    }
    const attachments = db.prepare('SELECT * FROM attachments WHERE report_id = ?').all(req.params.id);
    res.json({ success: true, data: { ...report, attachments } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Delete report
app.delete('/api/reports/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'ลบรายงานสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
