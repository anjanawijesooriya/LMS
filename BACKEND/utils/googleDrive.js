const { google } = require("googleapis");
const { Readable } = require("stream");
const zlib = require("zlib");

const getAuthClient = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
};

const getDriveClient = async () => {
  const auth = getAuthClient();
  return google.drive({ version: "v3", auth });
};

// Find or create a subfolder inside a parent folder
const ensureFolder = async (drive, folderName, parentId) => {
  const res = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: "files(id)",
  });

  if (res.data.files.length > 0) return res.data.files[0].id;

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  return folder.data.id;
};

// Gzip-compress content and upload to Drive
const uploadFile = async (drive, folderId, fileName, content) => {
  const compressed = await new Promise((resolve, reject) => {
    zlib.gzip(Buffer.from(content, "utf8"), (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  const stream = Readable.from(compressed);

  const res = await drive.files.create({
    requestBody: {
      name: `${fileName}.json.gz`,
      parents: [folderId],
    },
    media: {
      mimeType: "application/gzip",
      body: stream,
    },
    fields: "id, name, size",
  });

  return res.data;
};

// Delete oldest files in a folder, keeping only the most recent `keepCount`
const deleteOldFiles = async (drive, folderId, keepCount) => {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    orderBy: "createdTime desc",
    fields: "files(id, name, createdTime)",
  });

  const files = res.data.files;
  if (files.length <= keepCount) return;

  const toDelete = files.slice(keepCount);
  await Promise.all(toDelete.map((f) => drive.files.delete({ fileId: f.id })));

  console.log(`[Drive] Deleted ${toDelete.length} old backup file(s).`);
};

module.exports = { getDriveClient, ensureFolder, uploadFile, deleteOldFiles };
