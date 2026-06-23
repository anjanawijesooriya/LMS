const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const { getDriveClient, ensureFolder } = require("./googleDrive");
const sendEmail = require("./sendEmail");

// ─── Encryption ───────────────────────────────────────────────────────────────
// AES-256-GCM using BACKUP_ENCRYPTION_KEY from .env
// Output format: [16 bytes IV][16 bytes authTag][N bytes encrypted data]

const encrypt = (plaintext) => {
  const key = crypto.scryptSync(process.env.BACKUP_ENCRYPTION_KEY, "devians-lms-env-salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 16 bytes
  return Buffer.concat([iv, authTag, encrypted]);
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const backupEnvFile = async () => {
  const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY;

  if (!PARENT_FOLDER_ID) {
    console.warn("[EnvBackup] GOOGLE_DRIVE_FOLDER_ID not set — skipping.");
    return;
  }
  if (!ENCRYPTION_KEY) {
    console.warn("[EnvBackup] BACKUP_ENCRYPTION_KEY not set — skipping.");
    return;
  }

  try {
    const envPath = path.resolve(__dirname, "../../.env");

    if (!fs.existsSync(envPath)) {
      console.warn("[EnvBackup] .env file not found at:", envPath);
      return;
    }

    const envContent = fs.readFileSync(envPath, "utf8");
    const encrypted = encrypt(envContent);
    const timestamp = new Date().toISOString().split("T")[0];
    const fileName = `env_backup_${timestamp}.enc`;

    const drive = await getDriveClient();
    const configFolderId = await ensureFolder(drive, "config", PARENT_FOLDER_ID);

    // Always keep only the latest — delete any existing files first
    const existing = await drive.files.list({
      q: `'${configFolderId}' in parents and trashed=false`,
      fields: "files(id, name)",
    });

    if (existing.data.files.length > 0) {
      await Promise.all(existing.data.files.map((f) => drive.files.delete({ fileId: f.id })));
      console.log(`[EnvBackup] Replaced ${existing.data.files.length} old backup(s).`);
    }

    // Upload encrypted file
    await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [configFolderId],
      },
      media: {
        mimeType: "application/octet-stream",
        body: Readable.from(encrypted),
      },
      fields: "id, name",
    });

    console.log(`[EnvBackup] .env encrypted and uploaded to Google Drive: ${fileName}`);
  } catch (error) {
    console.error("[EnvBackup] Failed to backup .env:", error);

    // Non-fatal — alert admin but don't crash the server
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "[Devians LMS] .env Backup Failed ❌",
          html: `
            <h2>.env Backup Failed ❌</h2>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <pre style="background:#f5f5f5;padding:12px;border-radius:6px;">${error?.stack || error}</pre>
            <p>The server is still running. Please back up your .env file manually.</p>
            <br><strong>Devians LMS System</strong>
          `,
        });
      } catch (e) {
        console.error("[EnvBackup] Failed to send alert email:", e);
      }
    }
  }
};

// ─── Decrypt helper (for recovery) ───────────────────────────────────────────
// Run this manually in a Node REPL to recover the .env content:
//
//   const { decryptEnvBackup } = require("./BACKEND/utils/envBackup");
//   decryptEnvBackup("path/to/env_backup_YYYY-MM-DD.enc", "your-encryption-key");

const decryptEnvBackup = (filePath, encryptionKey) => {
  const data = fs.readFileSync(filePath);
  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const encrypted = data.subarray(32);
  const key = crypto.scryptSync(encryptionKey, "devians-lms-env-salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  console.log(decrypted.toString("utf8"));
  return decrypted.toString("utf8");
};

module.exports = { backupEnvFile, decryptEnvBackup };
