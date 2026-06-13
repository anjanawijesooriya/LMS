# LMS — Backup Solution

## What Gets Backed Up

| Data | Method | Schedule | Criticality |
|------|--------|----------|-------------|
| `payments` collection | JSON → Google Drive | Daily 2 AM | Critical |
| `users` collection | JSON → Google Drive | Daily 2 AM | Critical |
| All DB collections | JSON → Google Drive | Weekly Sunday 3 AM | High |
| Cloudinary asset manifest | URLs + metadata → Google Drive | Weekly Sunday 3 AM | Medium |
| `.env` config file | AES-256 encrypted → Google Drive | Every server start | High |

---

## Google Drive Folder Structure

```
Devians LMS Backups/             ← you create this folder and share with service account
  ├── daily/                     ← auto-created, payments + users
  │   ├── payments_2026-06-13.json.gz
  │   ├── users_2026-06-13.json.gz
  │   ├── payments_2026-06-14.json.gz
  │   └── users_2026-06-14.json.gz
  ├── weekly/                    ← auto-created, full DB dump
  │   ├── full_backup_2026-06-08.json.gz
  │   └── full_backup_2026-06-15.json.gz
  ├── cloudinary/                ← auto-created, asset manifest
  │   ├── cloudinary_manifest_2026-06-08.json.gz
  │   └── cloudinary_manifest_2026-06-15.json.gz
  └── config/                    ← auto-created, encrypted .env
      └── env_backup_2026-06-13.enc  ← always only one file (latest)
```

---

## Files Added to the Project

| File | Purpose |
|------|---------|
| `BACKEND/utils/googleDrive.js` | Google Drive API client — auth, folder management, upload, cleanup |
| `BACKEND/utils/backupJob.js` | Daily DB cron + Weekly DB + Cloudinary manifest cron |
| `BACKEND/utils/envBackup.js` | AES-256-GCM encrypt `.env` and upload to Drive on server start |
| `server.js` | Registers all backup jobs and calls `backupEnvFile()` on startup |

---

## One-Time Google Drive Setup

### Step 1 — Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `devians-lms` → **Create**
4. Make sure the new project is selected

---

### Step 2 — Enable the Google Drive API

1. Go to **APIs & Services** → **Library**
2. Search `Google Drive API` → click it → **Enable**

---

### Step 3 — Create a Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **+ Create Service Account**
3. Name: `lms-backup` → click **Done**

---

### Step 4 — Download the Service Account Key

1. Click the service account → **Keys** tab
2. **Add Key** → **Create new key** → **JSON** → **Create**
3. A `.json` file downloads — **keep this safe, never commit it to git**

The file looks like:
```json
{
  "type": "service_account",
  "project_id": "devians-lms",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "lms-backup@devians-lms.iam.gserviceaccount.com",
  ...
}
```

You need `client_email` and `private_key` from this file.

---

### Step 5 — Create the Backup Folder in Google Drive

1. Go to [https://drive.google.com](https://drive.google.com)
2. **+ New** → **New Folder** → name it `Devians LMS Backups` → **Create**

---

### Step 6 — Share the Folder with the Service Account

1. Right-click `Devians LMS Backups` → **Share**
2. Paste the `client_email` (e.g. `lms-backup@devians-lms.iam.gserviceaccount.com`)
3. Set role to **Editor**
4. Uncheck "Notify people" → **Share**

---

### Step 7 — Get the Folder ID

1. Open `Devians LMS Backups` in Drive
2. Copy the ID from the URL:
   ```
   https://drive.google.com/drive/folders/1ABCdEfGhIjKlMnOpQrStUvWxYz
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          this is your FOLDER ID
   ```

---

### Step 8 — Update Your `.env`

```env
# Google Drive Backup
GOOGLE_SERVICE_ACCOUNT_EMAIL=lms-backup@devians-lms.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvA...(full key)...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1ABCdEfGhIjKlMnOpQrStUvWxYz

# Encryption key for .env backup — use a strong passphrase, store it in your password manager
BACKUP_ENCRYPTION_KEY=some-long-random-passphrase-you-will-remember

# Admin email for backup alerts
ADMIN_EMAIL=your-admin@email.com
```

> **Important — `GOOGLE_PRIVATE_KEY`:** Copy it exactly as it appears in the JSON file. Keep the surrounding double quotes. The `\n` characters inside the key must stay as literal `\n` — the code converts them to real newlines automatically.

> **Important — `BACKUP_ENCRYPTION_KEY`:** This is the only key that can decrypt your `.env` backup. Store it separately in a password manager (Bitwarden, 1Password). If you lose it, the encrypted backup cannot be recovered.

---

## How Each Backup Works

### Daily Backup — 2:00 AM every day

1. Connects to Google Drive via the service account
2. Finds or creates the `daily/` subfolder
3. Exports `payments` and `users` collections from MongoDB as JSON
4. Gzip-compresses and uploads each file with today's date in the filename
5. Deletes files older than 7 days (keeps last 14 files = 7 days × 2 collections)
6. Emails admin a summary table on success
7. Emails admin an error alert with stack trace on failure

---

### Weekly Full Backup — 3:00 AM every Sunday

Runs two jobs back to back:

**1. Full DB dump**
- Exports all MongoDB collections into one JSON file
- Gzip-compresses and uploads to `weekly/`
- Keeps last 4 weekly backups

**2. Cloudinary asset manifest**
- Paginates through all uploaded assets via Cloudinary API (500 per page)
- Saves a manifest with: `public_id`, `secure_url`, `format`, `folder`, `bytes`, `created_at`
- Gzip-compresses and uploads to `cloudinary/`
- Keeps last 4 manifests

If the Cloudinary manifest fails, the DB backup is **not** rolled back — both results are reported independently in the summary email.

---

### `.env` Backup — Every server start

1. Reads the `.env` file from disk
2. Encrypts it with AES-256-GCM using `BACKUP_ENCRYPTION_KEY`
   - Encryption format: `[16 bytes IV][16 bytes auth tag][encrypted data]`
3. Deletes any previous backup from `config/` in Drive (always keeps only the latest)
4. Uploads the new `.enc` file
5. If it fails — logs the error and emails admin, but **does not crash the server**

This means every time you update `.env` and restart the server, the backup automatically updates.

---

## Emails You Will Receive

| Trigger | Subject |
|---------|---------|
| Daily backup succeeds | `[Devians LMS] Daily Backup Completed ✅ — 2026-06-13` |
| Daily backup fails | `[Devians LMS] Backup Failed: Daily Backup` |
| Weekly backup succeeds | `[Devians LMS] Weekly Full Backup Completed ✅ — 2026-06-15` |
| Weekly backup fails | `[Devians LMS] Backup Failed: Weekly Full Backup` |
| `.env` backup fails | `[Devians LMS] .env Backup Failed ❌` |

---

## Restoring from a Backup

### Restore a DB collection

1. Download the `.json.gz` file from Google Drive → `daily/` or `weekly/`
2. Decompress (7-Zip, `gunzip`, etc.)
3. For a **daily** file — you get a JSON array for that collection:
   ```js
   // in mongosh
   db.payments.insertMany(paymentsArray)
   ```
4. For a **weekly** file — you get `{ exportedAt, collections: { payments: [...], users: [...] } }`:
   ```bash
   # extract individual collection and import
   mongoimport --uri "your_mongodb_url" --collection payments --jsonArray --file payments.json
   ```

---

### Restore the `.env` file

The `decryptEnvBackup` helper is built into `envBackup.js`. Run it in a Node REPL:

```js
const { decryptEnvBackup } = require("./BACKEND/utils/envBackup");

// prints the decrypted .env content to console
decryptEnvBackup(
  "path/to/env_backup_2026-06-13.enc",
  "your-backup-encryption-key"
);
```

Then copy the output into a new `.env` file.

> You need `BACKUP_ENCRYPTION_KEY` to decrypt. This is why it must be stored in a password manager separately from the `.env` file itself.

---

### Recover Cloudinary images from the manifest

1. Download and decompress the manifest from `cloudinary/`
2. You have a full list of every asset's `secure_url` and `public_id`
3. If the Cloudinary account is still active — files are accessible directly via URL
4. If the account is lost — use the URL list to contact Cloudinary support or re-download from cached sources

---

## Environment Variables Reference

```env
# Google Drive — required for all backups
GOOGLE_SERVICE_ACCOUNT_EMAIL=     # client_email from the service account JSON key
GOOGLE_PRIVATE_KEY=               # private_key from the service account JSON key (keep quotes)
GOOGLE_DRIVE_FOLDER_ID=           # ID from the Google Drive folder URL

# .env backup encryption — store this in your password manager
BACKUP_ENCRYPTION_KEY=            # any strong passphrase

# Alerts — all backup failure emails go here
ADMIN_EMAIL=                      # your admin email address
```

---

## Troubleshooting

**Nothing appears in Google Drive after server start**
- Check `GOOGLE_DRIVE_FOLDER_ID` is correct (just the ID, not the full URL)
- Check that the folder was shared with the service account email with **Editor** access
- Check server console for `[EnvBackup]` or `[Backup]` log lines

**`invalid_grant` or auth error**
- `GOOGLE_PRIVATE_KEY` was pasted incorrectly
- Make sure the full key including `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----` is present
- The value must be wrapped in double quotes in `.env`

**`.env` backup uploads but decryption fails**
- The `BACKUP_ENCRYPTION_KEY` used to decrypt must exactly match the one used to encrypt
- If you changed the key in `.env` after a previous backup, old `.enc` files can only be decrypted with the old key

**Cloudinary manifest shows 0 assets**
- Cloudinary credentials (`CLOUDINARY_NAME`, `CLOUDINARY_APIKEY`, `CLOUDINARY_APISECRET`) must be set and valid
- Free tier accounts can list resources — if it still fails check Cloudinary API rate limits

**To test immediately without waiting for the cron schedule:**
```js
// add temporarily to server.js after registerBackupJobs(), remove once confirmed
const { runDailyBackup, runWeeklyBackup } = require("./BACKEND/utils/backupJob");
runDailyBackup();    // test daily
runWeeklyBackup();   // test weekly + cloudinary manifest
```
