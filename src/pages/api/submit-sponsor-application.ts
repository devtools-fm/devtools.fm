import type { APIRoute } from "astro";
import { google } from "googleapis";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const contentType = request.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
    const { name, company, email } = body as Record<string, string>;

    if (!name || !email || !company) {
      return json(
        {
          data: "Missing a required field. All required fields are: name, email, company",
        },
        400
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
    const sheets = google.sheets({ auth, version: "v4" });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_SPONSOR_APPLICATIONS,
      range: "A1:D1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[name, email, company]] },
    });

    return redirect("/thank-you", 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const code =
      typeof error === "object" && error && "code" in error && typeof error.code === "number"
        ? error.code
        : 500;
    return json({ message }, code);
  }
};
