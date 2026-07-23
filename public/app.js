// Initialize Quill Rich Text Editors
let quillKnowledge, quillDissemination, quillSuggestions;
let selectedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
  // Config for Quill toolbar
  const toolbarOptions = [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['image', 'clean']
  ];

  quillKnowledge = new Quill('#editor-knowledge', {
    theme: 'snow',
    placeholder: 'พิมพ์สรุปความรู้ที่ได้รับ...',
    modules: { toolbar: toolbarOptions }
  });

  quillDissemination = new Quill('#editor-dissemination', {
    theme: 'snow',
    placeholder: 'พิมพ์วิธีการ/แนวทางขยายผล...',
    modules: { toolbar: toolbarOptions }
  });

  quillSuggestions = new Quill('#editor-suggestions', {
    theme: 'snow',
    placeholder: 'พิมพ์ข้อเสนอแนะเพิ่มเติม...',
    modules: { toolbar: toolbarOptions }
  });

  // Pre-fill default demo text matching the user's image sample
  quillKnowledge.clipboard.dangerouslyPasteHTML(
    `<p class="doc-red-content">ได้รับความรู้เกี่ยวกับการใช้เทคโนโลยีดิจิทัลประเภท Live Video สนับสนุนการบูรณาการเรียนการสอนกับการจัดกิจกรรมในห้องเรียนเพิ่มทักษะการเรียนรู้ในศตวรรษที่ 21 สามารถพัฒนาสื่อการสอนประเภท Live Video บน Facebook Live ในหลักการที่ถูกต้องและน่าสนใจ ได้ฝึกปฏิบัติจัดการเรียนการสอนในสถานการณ์จริงผ่าน Facebook Live ของตนเอง โดยมีนักเรียนเป็นกลุ่มเป้าหมายปลายทาง และเก็บวิดีโอเป็นคลังสื่อสำหรับให้นักเรียนทั่วประเทศได้เข้าถึงแหล่งองค์ความรู้ได้อย่างรวดเร็วและทั่วถึง และได้เทคนิคการสอนยอดเยี่ยมโดยใช้เทคโนโลยีดิจิทัลเป็นต้นแบบให้กับครูทั่วประเทศ (ตัวอย่าง)</p>`
  );

  quillDissemination.clipboard.dangerouslyPasteHTML(
    `<p class="doc-red-content">- จะดำเนินการจัดอบรม เรื่อง การพัฒนาสื่อการสอนประเภท Live Video ให้กับครูในโรงเรียนร่วมกับครูในกลุ่มสาระการงานอาชีพและเทคโนโลยี (คอมพิวเตอร์) จำนวน 1 รุ่น</p>`
  );

  quillSuggestions.clipboard.dangerouslyPasteHTML(
    `<p class="doc-red-content">- เป็นวิธีการสอนที่ทันสมัย เข้าถึงนักเรียนได้เป็นอย่างดี และสามารถประยุกต์ใช้ได้กับทุกกลุ่มสาระการเรียนรู้ อยากให้ทางโรงเรียนสนับสนุนให้ครูใช้วิธีการสอนนี้ เพื่อรองรับกับการเป็นห้องเรียน 4.0</p>`
  );

  // Setup Drag & Drop Upload Event Listeners
  setupDragAndDrop();

  // Initial Load
  loadReports();
});

// Setup Drag and Drop
function setupDragAndDrop() {
  const dropZone = document.getElementById('dropZone');
  if (!dropZone) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files);
    selectedFiles = [...selectedFiles, ...files];
    renderFilePreview();
  });
}

// Tab Switching
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

  if (tab === 'new') {
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.getElementById('tab-new').style.display = 'block';
  } else {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('tab-list').style.display = 'block';
    loadReports();
  }
}

// Handle File Selection
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  selectedFiles = [...selectedFiles, ...files];
  renderFilePreview();
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderFilePreview();
}

function renderFilePreview() {
  const container = document.getElementById('filePreview');
  container.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const card = document.createElement('div');
    card.className = 'preview-card';

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        card.innerHTML = `
          <img src="${e.target.result}" alt="preview">
          <div class="file-name">${file.name}</div>
          <button type="button" class="remove-btn" onclick="removeFile(${index})">✕</button>
        `;
      };
      reader.readAsDataURL(file);
    } else {
      card.innerHTML = `
        <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#38bdf8;">
          <span style="font-size:24px;">📄</span>
          <div class="file-name">${file.name}</div>
        </div>
        <button type="button" class="remove-btn" onclick="removeFile(${index})">✕</button>
      `;
    }
    container.appendChild(card);
  });
}

function resetForm() {
  document.getElementById('reportForm').reset();
  quillKnowledge.setContents([]);
  quillDissemination.setContents([]);
  quillSuggestions.setContents([]);
  selectedFiles = [];
  renderFilePreview();
}

// Handle Form Submission
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    academic_year: formData.get('academic_year'),
    school_name: formData.get('school_name'),
    district_province: formData.get('district_province'),
    teacher_name: formData.get('teacher_name'),
    teacher_surname: formData.get('teacher_surname'),
    position: formData.get('position'),
    academic_standing: formData.get('academic_standing'),
    topic: formData.get('topic'),
    training_date: formData.get('training_date'),
    organizer: formData.get('organizer'),
    location: formData.get('location'),
    budget: formData.get('budget'),
    knowledge_summary: quillKnowledge.root.innerHTML,
    dissemination_plan: quillDissemination.root.innerHTML,
    suggestions: quillSuggestions.root.innerHTML
  };

  try {
    // 1. Save Form Data to Database
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (!result.success) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + result.error);
      return;
    }

    const reportId = result.reportId;

    // 2. Upload Attachments if any
    if (selectedFiles.length > 0) {
      const fileFormData = new FormData();
      selectedFiles.forEach(file => fileFormData.append('attachments', file));

      await fetch(`/api/upload/${reportId}`, {
        method: 'POST',
        body: fileFormData
      });
    }

    alert('✅ บันทึกรายงานการอบรมเรียบร้อยแล้ว!');
    resetForm();
    switchTab('list');

  } catch (err) {
    console.error(err);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  }
}

// Fetch Reports List & Calculate Stats
async function loadReports() {
  const tbody = document.getElementById('reportsTableBody');
  try {
    const res = await fetch('/api/reports');
    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">ยังไม่มีข้อมูลรายงานในฐานข้อมูล</td></tr>`;
      updateStats([], 0);
      return;
    }

    const reports = result.data;
    let totalBudget = 0;

    tbody.innerHTML = reports.map(item => {
      totalBudget += parseFloat(item.budget || 0);
      const initial = (item.teacher_name || 'ค').charAt(0);
      return `
        <tr>
          <td><span style="font-family:'Outfit'; font-weight:700; color:var(--accent-cyan);">#${item.id}</span></td>
          <td>
            <div class="teacher-badge">
              <div class="avatar">${initial}</div>
              <div>
                <strong>${item.teacher_name} ${item.teacher_surname}</strong>
                <div style="font-size:0.8rem; color:var(--text-muted);">${item.position || '-'} (${item.academic_standing || '-'})</div>
              </div>
            </div>
          </td>
          <td><strong style="color:#f1f5f9;">${item.topic}</strong><br><small style="color:var(--text-muted);">${item.organizer || '-'}</small></td>
          <td>${item.training_date || '-'}</td>
          <td><span class="tag-year">ปี ${item.academic_year || '2569'}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="viewWebDoc(${item.id})">👁️ รายงานดิจิทัล</button>
            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="viewPrintDoc(${item.id})">🖨️ พิมพ์ A4</button>
            <button class="btn btn-danger" style="padding: 6px 10px; font-size: 0.85rem;" onclick="deleteReport(${item.id})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    updateStats(reports, totalBudget);

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-pink);">ไม่สามารถเชื่อมต่อฐานข้อมูลได้</td></tr>`;
  }
}

// Update Top Dashboard Stats
function updateStats(reports, totalBudget) {
  document.getElementById('stat-total-reports').innerText = reports.length;
  document.getElementById('report-count-badge').innerText = `${reports.length} รายการ`;
  document.getElementById('stat-total-budget').innerText = `${totalBudget.toLocaleString()} ฿`;
}

// Delete Report
async function deleteReport(id) {
  if (!confirm('คุณต้องการลบรายงานนี้ใช่หรือไม่?')) return;
  try {
    await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    loadReports();
  } catch (err) {
    alert('ลบไม่สำเร็จ');
  }
}

// View Web Digital Executive Card Modal (Matches user screenshot)
async function viewWebDoc(id) {
  try {
    const res = await fetch(`/api/reports/${id}`);
    const result = await res.json();
    if (!result.success) return alert('ไม่พบข้อมูล');

    const data = result.data;
    const docContainer = document.getElementById('a4PreviewDoc');
    docContainer.className = 'modal-content web-doc';

    let attachmentsHTML = '';
    if (data.attachments && data.attachments.length > 0) {
      attachmentsHTML = `
        <div class="doc-images-grid">
          ${data.attachments.map(att => `<img src="${att.file_path}" alt="หลักฐาน">`).join('')}
        </div>
      `;
    }

    docContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:16px;">
        <div>
          <h2 style="color:#38bdf8; font-size:1.4rem;">📝 รายงานผลการอบรม (มุมมองดิจิทัล)</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem;">${data.school_name} ${data.district} ${data.province} (ปีการศึกษา ${data.academic_year})</p>
        </div>
        <button class="btn btn-primary" onclick="viewPrintDoc(${data.id})">🖨️ สลับไปหน้าพิมพ์ A4 ทางการ</button>
      </div>

      <div class="form-grid">
        <div class="col-6 web-report-field">
          <label>1. ผู้เข้าร่วมอบรม</label>
          <div class="value"><strong>${data.teacher_name} ${data.teacher_surname}</strong> (${data.position || '-'} / ${data.academic_standing || '-'})</div>
        </div>
        <div class="col-6 web-report-field">
          <label>2. อบรมเรื่อง</label>
          <div class="value"><strong>${data.topic}</strong></div>
        </div>
        <div class="col-4 web-report-field">
          <label>3. วันที่เข้าอบรม</label>
          <div class="value">${data.training_date || '-'}</div>
        </div>
        <div class="col-4 web-report-field">
          <label>4. หน่วยงานที่จัด</label>
          <div class="value">${data.organizer || '-'}</div>
        </div>
        <div class="col-4 web-report-field">
          <label>5-6. สถานที่ & งบประมาณ</label>
          <div class="value">${data.location || '-'} (${Number(data.budget || 0).toLocaleString()} บาท)</div>
        </div>

        <div class="col-12 web-report-field">
          <label>7. สรุปความรู้ที่ได้รับ</label>
          <div class="value">${data.knowledge_summary || '-'}</div>
        </div>

        <div class="col-12 web-report-field">
          <label>8. วิธีการ/แนวทางขยายผล</label>
          <div class="value">${data.dissemination_plan || '-'}</div>
        </div>

        <div class="col-12 web-report-field">
          <label>9. ข้อเสนอแนะเพิ่มเติม</label>
          <div class="value">${data.suggestions || '-'}</div>
        </div>

        <div class="col-12 web-report-field">
          <label>10. เอกสาร/หลักฐานรูปภาพแนบ</label>
          ${attachmentsHTML || '<div style="color:var(--text-muted);">ไม่มีรูปภาพแนบ</div>'}
        </div>
      </div>
    `;

    document.getElementById('printModal').style.display = 'flex';

  } catch (err) {
    console.error(err);
  }
}

// Generate & Open A4 Formal Print Document Modal
async function viewPrintDoc(id) {
  try {
    const res = await fetch(`/api/reports/${id}`);
    const result = await res.json();
    if (!result.success) return alert('ไม่พบข้อมูล');

    const data = result.data;
    const docContainer = document.getElementById('a4PreviewDoc');
    docContainer.className = 'modal-content a4-doc';

    // Attachments HTML
    let attachmentsHTML = '';
    if (data.attachments && data.attachments.length > 0) {
      attachmentsHTML = `
        <div class="doc-images-grid">
          ${data.attachments.map(att => `<img src="${att.file_path}" alt="หลักฐานการอบรม">`).join('')}
        </div>
      `;
    }

    // Format output matching official school document in user's image
    docContainer.innerHTML = `
      <div class="doc-logo-container" style="display: flex; justify-content: center; margin-bottom: 20px;">
        <svg viewBox="0 0 100 100" width="85" height="85" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.1));">
          <!-- Elegant Crest: WANGNAMYEN WITTAYAKOM SCHOOL -->
          <circle cx="50" cy="50" r="46" fill="none" stroke="#1e3a8a" stroke-width="3" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#1e3a8a" stroke-width="1" stroke-dasharray="3,3" />
          <path d="M50,15 L78,38 L68,78 L32,78 L22,38 Z" fill="none" stroke="#1e3a8a" stroke-width="2.5" />
          <path d="M50,19 L74,38 L65,74 L35,74 L26,38 Z" fill="#1e3a8a" opacity="0.12" />
          <!-- Flame Emblem -->
          <path d="M50,22 Q58,35 50,48 Q42,35 50,22 Z" fill="#b91c1c" />
          <!-- Book -->
          <path d="M36,64 Q50,60 64,64 L64,52 Q50,48 36,52 Z" fill="#1e3a8a" />
          <path d="M50,50 L50,62" stroke="#ffffff" stroke-width="1.5" />
          <text x="50" y="72" font-family="'Sarabun', sans-serif" font-size="9" fill="#1e3a8a" font-weight="bold" text-anchor="middle">ว.ย.ว.</text>
        </svg>
      </div>

      <div class="doc-header" style="text-align: center; margin-bottom: 30px; line-height: 1.5;">
        <h2 style="font-size: 16pt; font-weight: bold; margin: 0; color: #111827;">แบบรายงานผลการประชุม/อบรม/สัมมนา/ศึกษาดูงานของครูและบุคลากรทางการศึกษา</h2>
        <h3 style="font-size: 15pt; font-weight: bold; margin: 6px 0 0 0; color: #1f2937;">${data.school_name} ${data.district} ${data.province}</h3>
        <h4 style="font-size: 14pt; font-weight: normal; margin: 4px 0 0 0; color: #4b5563;">ประจำปีการศึกษา ${data.academic_year}</h4>
      </div>

      <div style="line-height: 1.85; font-size: 15pt; color: #1f2937;">
        <p class="doc-field" style="margin-bottom: 12px; text-indent: 1.25cm;">
          1. ผู้เข้าร่วมประชุม/อบรม/สัมมนา/ศึกษาดูงาน ชื่อ <span class="dotted-line" style="display: inline-block; min-width: 160px; text-align: center; border-bottom: 1px dotted #374151; color: #1e3b8b; font-weight: bold; padding: 0 4px;">&nbsp;${data.teacher_name}&nbsp;</span>
          สกุล <span class="dotted-line" style="display: inline-block; min-width: 180px; text-align: center; border-bottom: 1px dotted #374151; color: #1e3b8b; font-weight: bold; padding: 0 4px;">&nbsp;${data.teacher_surname}&nbsp;</span><br>
          ตำแหน่ง <span class="dotted-line" style="display: inline-block; min-width: 180px; text-align: center; border-bottom: 1px dotted #374151; color: #1e3b8b; font-weight: bold; padding: 0 4px;">&nbsp;${data.position || '-'}&nbsp;</span>
          วิทยฐานะ <span class="dotted-line" style="display: inline-block; min-width: 180px; text-align: center; border-bottom: 1px dotted #374151; color: #1e3b8b; font-weight: bold; padding: 0 4px;">&nbsp;${data.academic_standing || '-'}&nbsp;</span>
        </p>

        <p class="doc-field" style="margin-bottom: 12px; text-indent: 1.25cm;">
          2. ประชุม/อบรม/สัมมนา/ศึกษาดูงาน เรื่อง <span class="dotted-line" style="display: inline; border-bottom: 1px dotted #374151; color: #1e3b8b; font-weight: bold; padding: 0 4px;">&nbsp;${data.topic}&nbsp;</span>
        </p>

        <p class="doc-field" style="margin-bottom: 12px; text-indent: 1.25cm;">
          3. วัน/เดือน/ปี ที่เข้าอบรม <span class="dotted-line" style="display: inline-block; min-width: 250px; text-align: center; border-bottom: 1px dotted #374151; color: #1e3b8b; font-weight: bold; padding: 0 4px;">&nbsp;${data.training_date || '-'}&nbsp;</span>
        </p>

        <p class="doc-field" style="margin-bottom: 12px; text-indent: 1.25cm;">
          4. หน่วยงานที่จัดอบรม <span class="dotted-line" style="display: inline; border-bottom: 1px dotted #374151; color: #1e3b8b; font-weight: bold; padding: 0 4px;">&nbsp;${data.organizer || '-'}&nbsp;</span>
        </p>

        <p class="doc-field" style="margin-bottom: 12px; text-indent: 1.25cm;">
          5. สถานที่/จังหวัด <span class="dotted-line" style="display: inline; border-bottom: 1px dotted #374151; color: #1e3b8b; font-weight: bold; padding: 0 4px;">&nbsp;${data.location || '-'}&nbsp;</span>
        </p>

        <p class="doc-field" style="margin-bottom: 24px; text-indent: 1.25cm;">
          6. งบประมาณที่ใช้ <span class="dotted-line" style="display: inline-block; min-width: 150px; text-align: center; border-bottom: 1px dotted #374151; color: #1e3b8b; font-weight: bold; padding: 0 4px;">&nbsp;${data.budget ? Number(data.budget).toLocaleString() + ' บาท' : '-'}&nbsp;</span>
        </p>

        <div class="doc-field" style="margin-bottom: 20px;">
          <p style="font-weight: bold; color: #111827; margin-bottom: 4px;">7. สรุปความรู้ที่ได้รับ</p>
          <div class="doc-red-content" style="padding-left: 1.25cm; text-align: justify;">${data.knowledge_summary || '-'}</div>
        </div>

        <div class="doc-field" style="margin-bottom: 20px;">
          <p style="font-weight: bold; color: #111827; margin-bottom: 4px;">8. วิธีการ/แนวทาง ขยายผลให้ครู/บุคลากรในกลุ่มสาระฯ/ครูในโรงเรียน</p>
          <div class="doc-red-content" style="padding-left: 1.25cm; text-align: justify;">${data.dissemination_plan || '-'}</div>
        </div>

        <div class="doc-field" style="margin-bottom: 20px;">
          <p style="font-weight: bold; color: #111827; margin-bottom: 4px;">9. ข้อเสนอแนะเพิ่มเติม</p>
          <div class="doc-red-content" style="padding-left: 1.25cm; text-align: justify;">${data.suggestions || '-'}</div>
        </div>

        <div class="doc-field" style="margin-bottom: 30px; page-break-inside: avoid;">
          <p style="font-weight: bold; color: #111827; margin-bottom: 8px;">10. เอกสาร/หลักฐานที่ได้จากการสัมมนา ได้แก่ วุฒิบัตร หรือ ภาพถ่าย หรือทั้งสองอย่าง (ถ้ามี)</p>
          <div style="padding-left: 1.25cm;">
            ${attachmentsHTML || '<div style="color: #6b7280; font-style: italic;">ไม่มีเอกสารแนบ</div>'}
          </div>
        </div>

        <!-- Signature Block -->
        <div class="doc-signature-block" style="margin-top: 40px; margin-right: 20px; float: right; text-align: center; min-width: 280px; line-height: 2.2; page-break-inside: avoid;">
          <p style="margin: 0;">ลงชื่อ......................................................ผู้รายงาน</p>
          <p style="margin: 0;">( <span style="font-weight: bold; color: #111827;">${data.teacher_name} ${data.teacher_surname}</span> )</p>
          <p style="margin: 0;">ตำแหน่ง <span style="font-weight: normal; color: #374151;">${data.position || '-'}</span></p>
        </div>
        <div style="clear: both;"></div>
      </div>
    `;

    document.getElementById('printModal').style.display = 'flex';

  } catch (err) {
    console.error(err);
    alert('เกิดข้อผิดพลาดในการโหลดแบบฟอร์ม');
  }
}

function closePrintModal() {
  document.getElementById('printModal').style.display = 'none';
}
