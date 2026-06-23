const cron = require("node-cron");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const sendEmail = require("./sendEmail");
const { getDriveClient, ensureFolder, uploadFile, deleteOldFiles } = require("./googleDrive");

const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const alertAdmin = async (jobName, error) => {
  if (!process.env.ADMIN_EMAIL) return;
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `[Devians LMS] Backup Failed: ${jobName}`,
      html: `
        <h2>Backup Failure Alert ❌</h2>
        <p><strong>Job:</strong> ${jobName}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <pre style="background:#f5f5f5;padding:12px;border-radius:6px;">${error?.stack || error}</pre>
        <p>Please check the server logs for more details.</p>
        <br><strong>Devians LMS System</strong>
      `,
    });
  } catch (e) {
    console.error("[Backup] Failed to send failure alert email:", e);
  }
};

const exportCollection = async (collectionName) => {
  const db = mongoose.connection.db;
  const docs = await db.collection(collectionName).find({}).toArray();
  return JSON.stringify(docs, null, 2);
};

const getTimestamp = () => new Date().toISOString().split("T")[0];

// ─── Daily Backup ─────────────────────────────────────────────────────────────
// Runs at 2:00 AM every day
// Backs up: payments + users (most critical data)
// Retention: last 7 daily backups per collection (14 files total)

const runDailyBackup = async () => {
  const timestamp = getTimestamp();
  console.log(`[Backup] Daily backup started: ${timestamp}`);

  try {
    if (!PARENT_FOLDER_ID) throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set in .env");

    const drive = await getDriveClient();
    const dailyFolderId = await ensureFolder(drive, "daily", PARENT_FOLDER_ID);

    const collections = ["payments", "users"];
    const summary = [];

    for (const col of collections) {
      const data = await exportCollection(col);
      const docCount = JSON.parse(data).length;
      const fileName = `${col}_${timestamp}`;
      const file = await uploadFile(drive, dailyFolderId, fileName, data);
      summary.push({ collection: col, docs: docCount, name: file.name });
      console.log(`[Backup] Uploaded ${file.name} (${docCount} docs)`);
    }

    // Keep only last 7 days × 2 collections = 14 files
    await deleteOldFiles(drive, dailyFolderId, 14);

    console.log(`[Backup] Daily backup completed: ${timestamp}`);

    if (process.env.ADMIN_EMAIL) {
      const rows = summary
        .map((s) => `<tr><td>${s.collection}</td><td>${s.docs}</td><td>${s.name}</td></tr>`)
        .join("");
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `[Devians LMS] Daily Backup Completed ✅ — ${timestamp}`,
        html: `
          <h2>Daily Backup Successful ✅</h2>
          <p><strong>Date:</strong> ${timestamp}</p>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">
            <thead style="background:#f0f0f0;">
              <tr><th>Collection</th><th>Documents</th><th>File</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="color:#888;font-size:12px;margin-top:16px;">Retention: last 7 daily backups. Stored in Google Drive → Devians LMS Backups → daily</p>
          <br><strong>Devians LMS System</strong>
        `,
      });
    }
  } catch (error) {
    console.error("[Backup] Daily backup failed:", error);
    await alertAdmin("Daily Backup", error);
  }
};

// ─── Cloudinary Manifest ──────────────────────────────────────────────────────
// Paginates through all Cloudinary assets and saves a manifest JSON
// Called from runWeeklyBackup — not scheduled independently

const runCloudinaryManifest = async (drive, timestamp) => {
  console.log("[Backup] Cloudinary manifest backup started...");

  const allAssets = [];
  let nextCursor = null;

  // Paginate through all resources (500 per page)
  do {
    const options = { max_results: 500, type: "upload" };
    if (nextCursor) options.next_cursor = nextCursor;
    const result = await cloudinary.api.resources(options);
    allAssets.push(...result.resources);
    nextCursor = result.next_cursor || null;
  } while (nextCursor);

  const manifest = {
    exportedAt: new Date().toISOString(),
    totalAssets: allAssets.length,
    assets: allAssets.map((r) => ({
      public_id: r.public_id,
      secure_url: r.secure_url,
      format: r.format,
      resource_type: r.resource_type,
      folder: r.folder || "",
      bytes: r.bytes,
      created_at: r.created_at,
    })),
  };

  const cloudinaryFolderId = await ensureFolder(drive, "cloudinary", PARENT_FOLDER_ID);
  const fileName = `cloudinary_manifest_${timestamp}`;
  const file = await uploadFile(drive, cloudinaryFolderId, fileName, JSON.stringify(manifest, null, 2));

  // Keep last 4 manifests
  await deleteOldFiles(drive, cloudinaryFolderId, 4);

  console.log(`[Backup] Cloudinary manifest uploaded: ${file.name} (${allAssets.length} assets)`);

  return { totalAssets: allAssets.length, fileName: file.name };
};

// ─── Weekly Full Backup ───────────────────────────────────────────────────────
// Runs at 3:00 AM every Sunday
// Backs up: all DB collections + Cloudinary asset manifest
// Retention: last 4 weekly backups (DB), last 4 manifests (Cloudinary)

const runWeeklyBackup = async () => {
  const timestamp = getTimestamp();
  console.log(`[Backup] Weekly full backup started: ${timestamp}`);

  try {
    if (!PARENT_FOLDER_ID) throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set in .env");

    const drive = await getDriveClient();

    // ── DB backup ──
    const weeklyFolderId = await ensureFolder(drive, "weekly", PARENT_FOLDER_ID);

    const db = mongoose.connection.db;
    const collectionList = await db.listCollections().toArray();
    const collectionNames = collectionList.map((c) => c.name);

    const fullBackup = {
      exportedAt: new Date().toISOString(),
      collections: {},
    };

    for (const name of collectionNames) {
      fullBackup.collections[name] = await db.collection(name).find({}).toArray();
    }

    const dbData = JSON.stringify(fullBackup, null, 2);
    const dbFile = await uploadFile(drive, weeklyFolderId, `full_backup_${timestamp}`, dbData);

    await deleteOldFiles(drive, weeklyFolderId, 4);

    const totalDocs = Object.values(fullBackup.collections).reduce((sum, col) => sum + col.length, 0);
    console.log(`[Backup] DB backup uploaded: ${dbFile.name} (${totalDocs} total docs)`);

    // ── Cloudinary manifest ──
    let cloudinaryResult = null;
    let cloudinaryError = null;

    try {
      cloudinaryResult = await runCloudinaryManifest(drive, timestamp);
    } catch (err) {
      cloudinaryError = err;
      console.error("[Backup] Cloudinary manifest failed (DB backup still succeeded):", err);
    }

    console.log(`[Backup] Weekly full backup completed: ${timestamp}`);

    // ── Summary email ──
    if (process.env.ADMIN_EMAIL) {
      const colRows = collectionNames
        .map((n) => `<tr><td>${n}</td><td>${fullBackup.collections[n].length}</td></tr>`)
        .join("");

      const cloudinarySection = cloudinaryResult
        ? `
          <h3 style="margin-top:24px;">Cloudinary Manifest ✅</h3>
          <p><strong>File:</strong> ${cloudinaryResult.fileName}</p>
          <p><strong>Total assets:</strong> ${cloudinaryResult.totalAssets}</p>
        `
        : `
          <h3 style="margin-top:24px;">Cloudinary Manifest ❌</h3>
          <p style="color:red;">Cloudinary manifest failed. DB backup succeeded. Check server logs.</p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:11px;">${cloudinaryError?.message || cloudinaryError}</pre>
        `;

      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `[Devians LMS] Weekly Full Backup Completed ✅ — ${timestamp}`,
        html: `
          <h2>Weekly Full Backup Successful ✅</h2>
          <p><strong>Date:</strong> ${timestamp}</p>

          <h3>Database Collections</h3>
          <p><strong>File:</strong> ${dbFile.name}</p>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">
            <thead style="background:#f0f0f0;">
              <tr><th>Collection</th><th>Documents</th></tr>
            </thead>
            <tbody>${colRows}</tbody>
          </table>
          <p><strong>Total documents:</strong> ${totalDocs}</p>

          ${cloudinarySection}

          <p style="color:#888;font-size:12px;margin-top:24px;">
            Retention: 4 weekly DB backups · 4 Cloudinary manifests<br>
            Stored in Google Drive → Devians LMS Backups
          </p>
          <br><strong>Devians LMS System</strong>
        `,
      });
    }
  } catch (error) {
    console.error("[Backup] Weekly backup failed:", error);
    await alertAdmin("Weekly Full Backup", error);
  }
};

// ─── Register Jobs ────────────────────────────────────────────────────────────

const registerBackupJobs = () => {
  // Daily: 2:00 AM every day
  cron.schedule("0 2 * * *", runDailyBackup);
  console.log("Cron job registered: daily backup (2:00 AM).");

  // Weekly: 3:00 AM every Sunday
  cron.schedule("0 3 * * 0", runWeeklyBackup);
  console.log("Cron job registered: weekly full backup + Cloudinary manifest (Sunday 3:00 AM).");
};

module.exports = { registerBackupJobs, runDailyBackup, runWeeklyBackup };
