import { NextResponse } from "next/server";
import { getGoogleSheets } from "@/lib/google-sheets";

export async function GET() {
  try {
    const sheets = await getGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "SPREADSHEET_ID is not configured" },
        { status: 500 }
      );
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A:D", // Assuming columns A=discord_name, B=task, C=deadline, D=status
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    // Assuming the first row is headers: [discord_name, task, deadline, status]
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const tasks = dataRows.map((row) => ({
      discord_name: row[0] || "",
      task: row[1] || "",
      deadline: row[2] || "",
      status: row[3] || "FALSE",
    }));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching google sheets data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
