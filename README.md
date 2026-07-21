# 🏫 ระบบรายงานผลการอบรม/ศึกษาดูงาน (School Training Report System)

ระบบรายงานผลการประชุม/อบรม/สัมมนา/ศึกษาดูงานของครูและบุคลากรทางการศึกษา รูปแบบเอกสารทางราชการ พัฒนาขึ้นด้วย Node.js, Express, SQLite และ Web Rich Text Editor (Quill.js) พร้อมระบบสร้างและพิมพ์เอกสาร A4 และส่งออกเป็น PDF

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)

---

## ✨ คุณสมบัติเด่น (Features)

- 📝 **แบบฟอร์มครบถ้วน 10 ข้อ**: ตรงตามแบบรายงานของสถานศึกษา (ชื่อ-สกุล, ตำแหน่ง, วิทยฐานะ, หัวข้อเรื่อง, วันที่, หน่วยงานจัด, งบประมาณ ฯลฯ)
- 🎨 **Web Rich Text Editor (Quill.js)**: รองรับการจัดรูปแบบข้อความ จัดย่อหน้า ตัวหนา ตัวเอียง สีข้อความ สำหรับข้อ 7, 8, และ 9
- ☁️ **ระบบอัปโหลดเอกสารแนบ/วุฒิบัตร (ข้อ 10)**: รองรับ Drag & Drop รูปภาพกิจกรรมและวุฒิบัตร
- 🖨️ **ระบบพรีวิวและสั่งพิมพ์ A4**: ออกรายงานขนาด A4 ในรูปแบบทางการ ตรงตามโครงสร้างเอกสารเดิม 100% พร้อมปุ่มสั่งพิมพ์เป็น PDF
- 📊 **Dashboard & สรุปสถิติ**: แสดงรายงานทั้งหมด, สรุปงบประมาณพัฒนาครูรวม, และจำนวนวุฒิบัตรที่อัปโหลด

---

## 🛠️ โครงสร้างเทคโนโลยี (Tech Stack)

- **Frontend**: HTML5, CSS3 (Modern Glassmorphism Design), JavaScript (Vanilla ES6), Quill.js
- **Backend**: Node.js, Express.js, Multer (File Uploads)
- **Database**: SQLite (`better-sqlite3`)

---

## 🚀 วิธีการรันโปรเจกต์บนเครื่องคอมพิวเตอร์ (Local Setup)

```bash
# 1. Clone โปรเจกต์
git clone https://github.com/ajsirimat/school-report-system.git
cd school-report-system

# 2. ติดตั้ง Dependencies
npm install

# 3. เริ่มต้นการทำงานระบบ
npm start
```

เปิดบราวเซอร์ไปที่: `http://localhost:3000`

---

## 🌐 การนำขึ้นระบบออนไลน์ (Deployment)

โปรเจกต์นี้สามารถนำขึ้นใช้งานออนไลน์ฟรีได้ผ่าน **Render.com** หรือ **Railway.app**

1. Push โค้ดขึ้น GitHub Repository นี้
2. ไปที่ [Render.com](https://render.com) สมัครใช้งานและเลือก **New Web Service**
3. เชื่อมต่อกับ Repository `school-report-system`
4. ตั้งค่า Build & Start Command:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. กด Deploy เพื่อเริ่มใช้งานออนไลน์ได้ทันที
