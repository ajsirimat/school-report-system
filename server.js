const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure local upload directory exists (used for SQLite fallback or temp storage)
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
app.post('/api/reports', async (req, res) => {
  try {
    const payload = {
      teacher_name: req.body.teacher_name || '',
      teacher_surname: req.body.teacher_surname || '',
      position: req.body.position || '',
      academic_standing: req.body.academic_standing || '',
      topic: req.body.topic || '',
      training_date: req.body.training_date || '',
      organizer: req.body.organizer || '',
      location: req.body.location || '',
      budget: req.body.budget ? parseFloat(req.body.budget) : 0,
      knowledge_summary: req.body.knowledge_summary || '',
      dissemination_plan: req.body.dissemination_plan || '',
      suggestions: req.body.suggestions || '',
      school_name: req.body.school_name || 'โรงเรียนวังน้ำเย็นวิทยาคม',
      district: req.body.district_province ? req.body.district_province.split(' ')[0] : 'อำเภอวังน้ำเย็น',
      province: req.body.district_province && req.body.district_province.split(' ').length > 1 ? req.body.district_province.split(' ')[1] : 'จังหวัดสระแก้ว',
      academic_year: req.body.academic_year || '2569'
    };

    if (db.type === 'supabase') {
      const { data, error } = await db.client
        .from('reports')
        .insert([payload])
        .select();

      if (error) throw error;
      return res.json({ success: true, reportId: data[0].id, message: 'บันทึกรายงานลง Supabase สำเร็จ' });
    } else {
      // Local SQLite
      const stmt = db.client.prepare(`
        INSERT INTO reports (
          teacher_name, teacher_surname, position, academic_standing,
          topic, training_date, organizer, location, budget,
          knowledge_summary, dissemination_plan, suggestions,
          school_name, district, province, academic_year
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = stmt.run(
        payload.teacher_name,
        payload.teacher_surname,
        payload.position,
        payload.academic_standing,
        payload.topic,
        payload.training_date,
        payload.organizer,
        payload.location,
        payload.budget,
        payload.knowledge_summary,
        payload.dissemination_plan,
        payload.suggestions,
        payload.school_name,
        payload.district,
        payload.province,
        payload.academic_year
      );

      return res.json({ success: true, reportId: info.lastInsertRowid, message: 'บันทึกรายงานลง SQLite สำเร็จ' });
    }
  } catch (err) {
    console.error('Error saving report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Upload file attachments for a report
app.post('/api/upload/:reportId', upload.array('attachments', 10), async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.json({ success: true, message: 'ไม่มีไฟล์แนบ' });
    }

    if (db.type === 'supabase') {
      for (const file of files) {
        let finalPath = '';
        const fileContent = fs.readFileSync(file.path);
        const fileName = `reports/${reportId}/${file.filename}`;

        // Try uploading to Supabase Storage Bucket 'school-reports'
        const { data: uploadData, error: uploadError } = await db.client
          .storage
          .from('school-reports')
          .upload(fileName, fileContent, {
            contentType: file.mimetype,
            upsert: true
          });

        if (uploadError) {
          console.warn('Supabase Storage upload failed, falling back to Base64 in database:', uploadError.message || uploadError);
          // Fallback: Convert to Base64 Data URL
          const base64Data = fileContent.toString('base64');
          finalPath = `data:${file.mimetype};base64,${base64Data}`;
        } else {
          // Get Public URL
          const { data: publicUrlData } = db.client
            .storage
            .from('school-reports')
            .getPublicUrl(fileName);
          finalPath = publicUrlData.publicUrl;
        }

        // Insert metadata into attachments table
        const { error: insertError } = await db.client
          .from('attachments')
          .insert([{
            report_id: parseInt(reportId),
            file_name: file.originalname,
            file_path: finalPath,
            file_type: file.mimetype
          }]);

        if (insertError) {
          console.error('Database attachment error:', insertError);
        }

        // Delete temporary local file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      res.json({ success: true, message: `อัปโหลดไฟล์สำเร็จ` });
    } else {
      // Local SQLite
      const stmt = db.client.prepare(`
        INSERT INTO attachments (report_id, file_name, file_path, file_type)
        VALUES (?, ?, ?, ?)
      `);

      const insertMany = db.client.transaction((fileList) => {
        for (const file of fileList) {
          const fileUrl = '/uploads/' + file.filename;
          stmt.run(reportId, file.originalname, fileUrl, file.mimetype);
        }
      });

      insertMany(files);
      res.json({ success: true, message: `อัปโหลดไฟล์ไปที่ SQLite สำเร็จ` });
    }
  } catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    if (db.type === 'supabase') {
      const { data, error } = await db.client
        .from('reports')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      res.json({ success: true, data });
    } else {
      const reports = db.client.prepare('SELECT * FROM reports ORDER BY id DESC').all();
      res.json({ success: true, data: reports });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get a single report with attachments
app.get('/api/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;

    if (db.type === 'supabase') {
      const { data: report, error: reportError } = await db.client
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (reportError || !report) {
        return res.status(404).json({ success: false, error: 'ไม่พบรายงาน' });
      }

      const { data: attachments } = await db.client
        .from('attachments')
        .select('*')
        .eq('report_id', reportId);

      res.json({ success: true, data: { ...report, attachments } });
    } else {
      const report = db.client.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
      if (!report) {
        return res.status(404).json({ success: false, error: 'ไม่พบรายงาน' });
      }
      const attachments = db.client.prepare('SELECT * FROM attachments WHERE report_id = ?').all(reportId);
      res.json({ success: true, data: { ...report, attachments } });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Delete report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;

    if (db.type === 'supabase') {
      // Get all attachments first to delete files from storage if needed
      const { data: attachments } = await db.client
        .from('attachments')
        .select('*')
        .eq('report_id', reportId);

      if (attachments && attachments.length > 0) {
        for (const att of attachments) {
          // Extract filename from URL to delete from storage
          const fileUri = att.file_path.split('/school-reports/')[1];
          if (fileUri) {
            await db.client.storage.from('school-reports').remove([fileUri]);
          }
        }
      }

      const { error } = await db.client
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      res.json({ success: true, message: 'ลบรายงานใน Supabase สำเร็จ' });
    } else {
      db.client.prepare('DELETE FROM reports WHERE id = ?').run(reportId);
      res.json({ success: true, message: 'ลบรายงานใน SQLite สำเร็จ' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
