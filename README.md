# 📊 Task DC Kirito Dashboard

เว็บไซต์ **Task DC Kirito Dashboard** เป็นระบบกระดานสรุปผลงาน (Dashboard) ที่ถูกสร้างขึ้นมาเพื่อใช้ติดตามสถานะการทำงานของสมาชิกในดิสคอร์ดแบบเรียลไทม์ โดยจะดึงข้อมูลตารางงานจาก **Google Sheets** มาแสดงผลในรูปแบบที่สวยงาม อ่านง่าย และมีฟีเจอร์ครบครัน!

---

## ✨ ฟีเจอร์หลัก (Features)

- 🔄 **Live Sync & Auto-Updates:** ดึงข้อมูลสดจาก Google Sheets และรีเฟรชอัปเดตข้อมูลอัตโนมัติทุกๆ 10 วินาที
- 📈 **Summary Cards:** การ์ดสรุปยอดรวม (งานทั้งหมด, งานที่เสร็จแล้ว, งานค้าง, อัตราความสำเร็จ)
- 🏆 **Top Performers Leaderboard:** วิดเจ็ตจัดอันดับ 5 คนแรกที่เคลียร์งานเสร็จมากที่สุด
- 📊 **Interactive Charts:** กราฟแท่งแสดงปริมาณงานของแต่ละคน และกราฟโดนัทแสดงอัตราความสำเร็จ (สร้างด้วย Recharts)
- 🗂️ **Advanced Data Table:**
  - ค้นหาด้วยชื่อ หรือชื่องาน
  - คัดกรอง (Filter) ด้วยสถานะงาน (เสร็จแล้ว / รอดำเนินการ)
  - จัดเรียงข้อมูล (Sort) ด้วยการคลิกที่หัวคอลัมน์ (ชื่อ, กำหนดส่ง, สถานะ)
  - ระบบแบ่งหน้า (Pagination) หน้าละ 10 รายการ เพื่อลดอาการแลค
  - แจ้งเตือนสถานะ "ใกล้ถึงกำหนดส่ง" (สีเหลือง) และ "เลยกำหนดส่ง" (สีแดง) พร้อม Tooltip อธิบาย
- 📥 **Export to CSV:** สามารถกดปุ่มเพื่อดาวน์โหลดตารางงานที่กำลังค้นหาออกมาเป็นไฟล์ `.csv` รองรับภาษาไทยสมบูรณ์แบบ
- 🌍 **ระบบสองภาษา (Bilingual):** เปลี่ยนภาษา TH / EN ได้ทันทีโดยไม่ต้องโหลดหน้าเว็บใหม่
- 🌗 **Dark Mode:** สลับระหว่างธีมสว่างและธีมมืดได้อิสระ

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

โปรเจ็กต์นี้ถูกพัฒนาขึ้นด้วยเทคโนโลยีที่ทันสมัย:

- **[Next.js (App Router)](https://nextjs.org/)** - Framework หลักในการพัฒนาและทำระบบ API Routes
- **[React 18](https://react.dev/)** - ไลบรารีสำหรับสร้าง UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** - สำหรับจัดการเรื่องความสวยงามและ Design System
- **[Shadcn UI](https://ui.shadcn.com/)** - คอมโพเนนต์สำเร็จรูปที่มีความสวยงามและปรับแต่งได้สูง
- **[Recharts](https://recharts.org/)** - สำหรับสร้างกราฟข้อมูล
- **[Googleapis](https://github.com/googleapis/google-api-nodejs-client)** - ไลบรารีสำหรับเชื่อมต่อกับ Google Sheets API v4
- **[Lucide React](https://lucide.dev/)** - สำหรับจัดการไอคอนต่างๆ ภายในเว็บ
- **[Next Themes](https://github.com/pacocoursey/next-themes)** - จัดการระบบสลับธีมมืด/สว่าง

---

## 🚀 วิธีการติดตั้งและใช้งาน (Getting Started)

### 1. ติดตั้ง Packages

โคลนโปรเจ็กต์ลงมาที่เครื่อง จากนั้นเปิด Terminal แล้วรันคำสั่ง:

```bash
npm install
```

### 2. ตั้งค่า Google Sheets API และ Environment Variables

ระบบนี้ต้องการสิทธิ์ในการอ่านข้อมูลจาก Google Sheets คุณต้องสร้างไฟล์ `.env.local` ไว้ที่ Root ของโปรเจ็กต์ แล้วกำหนดค่าดังนี้:

```env
# ไอดีของ Google Sheet (ดูได้จาก URL ของชีต)
SPREADSHEET_ID=your_spreadsheet_id_here

# อีเมล Service Account ของ Google Cloud
GOOGLE_CLIENT_EMAIL=your_service_account_email@...

# Private Key จากไฟล์ credentials.json (ก๊อปปี้มาทั้งก้อนแบบมี \n คั่น)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_LONG_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

_(หมายเหตุ: อย่าลืมเข้าไปแชร์ Google Sheet ของคุณ ให้กับอีเมล `GOOGLE_CLIENT_EMAIL` ในโหมด Viewer ด้วย)_

### 3. รันเซิร์ฟเวอร์

เริ่มต้นเซิร์ฟเวอร์ด้วยโหมด Development:

```bash
npm run dev
```

จากนั้นเปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000) 🎉

---
