import { google } from "googleapis";

export async function getGoogleSheets() {
  let auth;

  // 1. ถ้ามี Environment Variables (สำหรับ Vercel)
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
  } 
  // 2. ถ้าไม่มี ให้ใช้ไฟล์ credentials.json (สำหรับรันบนเครื่อง Local)
  else {
    auth = new google.auth.GoogleAuth({
      keyFile: process.cwd() + "/credentials.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
  }

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  return sheets;
}
