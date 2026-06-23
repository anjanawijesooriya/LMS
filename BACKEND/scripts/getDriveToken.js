/**
 * One-time script to get a Google Drive OAuth2 refresh token.
 *
 * Run this once from the project root:
 *   node BACKEND/scripts/getDriveToken.js
 *
 * Prerequisites:
 *   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env
 *   - http://localhost:9999/callback must be added as an Authorized Redirect URI
 *     in your Google Cloud Console OAuth2 credentials
 */

require("dotenv").config();
const http = require("http");
const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:9999/callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("\n❌ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env before running this script.\n");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // forces a refresh token to be returned every time
  scope: ["https://www.googleapis.com/auth/drive"],
});

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  Google Drive OAuth2 Setup");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\n1. Open this URL in your browser:\n");
console.log("   " + authUrl);
console.log("\n2. Sign in with the Google account that owns the backup folder.");
console.log("3. Click Allow.");
console.log("\nWaiting for authorization...\n");

// Spin up a temporary local server to capture the auth code
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:9999`);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h2>Authorization denied. You can close this tab.</h2>");
    console.error("\n❌ Authorization was denied:", error);
    server.close();
    return;
  }

  if (!code) return;

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <h2 style="font-family:sans-serif;color:green;">✅ Authorization successful!</h2>
    <p style="font-family:sans-serif;">You can close this tab and go back to your terminal.</p>
  `);

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  ✅ Success! Add this to your .env file:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Then remove GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY from .env.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (err) {
    console.error("\n❌ Failed to exchange code for tokens:", err.message);
  }

  server.close();
});

server.listen(9999);
