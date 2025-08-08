import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string;
      company?: string;
      email?: string;
    };

    console.log("body: ", body);

    if (!body.name || !body.email || !body.company) {
      return NextResponse.json(
        {
          data: "Missing a required field. All required fields are: name, email, company",
        },
        { status: 400 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({
      auth,
      version: "v4",
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_SPONSOR_APPLICATIONS,
      range: "A1:D1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[body.name, body.email, body.company]],
      },
    });

    return NextResponse.redirect(new URL("/thank-you", req.url));
  } catch (e: any) {
    return NextResponse.json(
      { message: e.message },
      { status: e.code || 500 }
    );
  }
}