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
Devians LMS Backups/             ← you create this folder
  ├── daily/                     ← auto-created
  │   ├── payments_2026-06-13.json.gz
  │   ├── users_2026-06-13.json.gz
  │   ├── payments_2026-06-14.json.gz
  │   └── users_2026-06-14.json.gz
  ├── weekly/                    ← auto-created
  │   ├── full_backup_2026-06-08.json.gz
  │   └── full_backup_2026-06-15.json.gz
  ├── cloudinary/                ← auto-created
  │   ├── cloudinary_manifest_2026-06-08.json.gz
  │   └── cloudinary_manifest_2026-06-15.json.gz
  └── config/                    ← auto-created
      └── env_backup_2026-06-13.enc   ← always one file, always latest
```

Files are **gzip-compressed** before upload. The `.env` backup is **AES-256-GCM encrypted** before upload.

---

## Files Added to the Project

| File | Purpose |
|------|---------|
| `BACKEND/utils/googleDrive.js` | Google Drive API client — OAuth2 auth, folder management, upload, cleanup |
| `BACKEND/utils/backupJob.js` | Daily DB cron + Weekly DB + Cloudinary manifest cron |
| `BACKEND/utils/envBackup.js` | AES-256-GCM encrypt `.env` and upload to Drive on every server start |
| `BACKEND/scripts/getDriveToken.js` | **One-time script** — run once to get your OAuth2 refresh token |
| `server.js` | Registers all backup jobs and calls `backupEnvFile()` on startup |

---

## Why OAuth2 Instead of a Service Account

Google service accounts do not have their own Drive storage quota. When a service account creates a file in your personal Drive folder, it fails with a 403 quota error. OAuth2 tokens represent your real Google account, so files are stored in your 15 GB personal Drive quota with no issues.

---

## One-Time Setup

### Step 1 — Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown → **New Project**
3. Name it `devians-lms` → **Create**
4. Make sure the new project is selected

---

### Step 2 — Enable the Google Drive API

1. Go to **APIs & Services** → **Library**
2. Search `Google Drive API` → click it → **Enable**

---

### Step 3 — Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. If prompted to configure the consent screen:
   - Click **Configure Consent Screen**
   - Choose **External** → **Create**
   - Fill in App name: `Devians LMS Backup`, User support email: your email
   - Scroll to the bottom → **Save and Continue** through all steps
   - On the last screen click **Back to Dashboard**
   - Go back to **Credentials** → **+ Create Credentials** → **OAuth client ID**
4. Application type: **Desktop app**
5. Name: `LMS Backup` → **Create**
6. Copy the **Client ID** and **Client Secret** shown in the popup

---

### Step 4 — Add the Redirect URI

1. Click the OAuth2 client you just created to edit it
2. Under **Authorized redirect URIs** click **+ Add URI**
3. Add exactly: `http://localhost:9999/callback`
4. Click **Save**

---

### Step 5 — Create the Backup Folder in Google Drive

1. Go to [https://drive.google.com](https://drive.google.com)
2. **+ New** → **New Folder** → name it `Devians LMS Backups` → **Create**
3. Open the folder and copy the ID from the URL:
   ```
   https://drive.google.com/drive/folders/1ABCdEfGhIjKlMnOpQrStUvWxYz
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          this is your FOLDER ID
   ```

---

### Step 6 — Update `.env` with Client ID and Client Secret

Open `.env` and fill in:

```env
# Google Drive Backup
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret
GOOGLE_REFRESH_TOKEN=                     ← leave blank for now
GOOGLE_DRIVE_FOLDER_ID=1ABCdEfGhIjKlMnOpQrStUvWxYz
```

---

### Step 7 — Run the One-Time Token Script

From the project root run:

```bash
node BACKEND/scripts/getDriveToken.js
```

The terminal will print a URL. Open it in your browser, sign in with the **Google account that owns the `Devians LMS Backups` folder**, and click **Allow**.

The terminal will then print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Success! Add this to your .env file:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GOOGLE_REFRESH_TOKEN=1//0gXxxxxxxxxxxxxxxxxxxx
```

Paste that value into `.env`. You only need to do this **once** — the refresh token does not expire unless you revoke it.

---

### Step 8 — Add the Encryption Key

```env
# Encryption key for .env backup
BACKUP_ENCRYPTION_KEY=some-long-random-passphrase
```

> Store `BACKUP_ENCRYPTION_KEY` in a password manager (Bitwarden, 1Password). It is the only way to decrypt the `.env` backup. If you lose it, the encrypted backup cannot be recovered.

---

### Final `.env` Reference

```env
# Google Drive Backup
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret
GOOGLE_REFRESH_TOKEN=1//0gXxxxxxxxxxxxxxxxxxxx
GOOGLE_DRIVE_FOLDER_ID=1ABCdEfGhIjKlMnOpQrStUvWxYz

# .env backup encryption — store this in your password manager separately
BACKUP_ENCRYPTION_KEY=some-long-random-passphrase

# Admin email for backup success/failure alerts
ADMIN_EMAIL=your-admin@email.com

# Rate limits
AUTH_RATE_LIMIT=20
API_RATE_LIMIT=200

# JWT expiry
JWT_EXPIRE=24h
```

---

## How Each Backup Works

### Daily Backup — 2:00 AM every day

1. Exports `payments` and `users` collections from MongoDB as JSON
2. Gzip-compresses and uploads each file with today's date in the filename
3. Deletes files older than 7 days (keeps last 14 files = 7 days × 2 collections)
4. Emails admin a success summary — or an error alert on failure

---

### Weekly Full Backup — 3:00 AM every Sunday

Runs two jobs back to back:

**1. Full DB dump**
- Exports all MongoDB collections into one JSON file
- Gzip-compresses and uploads to `weekly/`
- Keeps last 4 weekly backups

**2. Cloudinary asset manifest**
- Paginates through all uploaded Cloudinary assets (500 per page)
- Saves: `public_id`, `secure_url`, `format`, `folder`, `bytes`, `created_at`
- Gzip-compresses and uploads to `cloudinary/`
- Keeps last 4 manifests

If the Cloudinary manifest fails, the DB backup is **not** rolled back. Both results are reported independently in the summary email.

---

### `.env` Backup — Every server start

1. Reads `.env` from disk
2. Encrypts with **AES-256-GCM** using `BACKUP_ENCRYPTION_KEY`
   - Format: `[16 bytes IV][16 bytes auth tag][encrypted data]`
3. Deletes any previous `.enc` file from `config/` (always one file, always current)
4. Uploads the new `.enc` file
5. If it fails — logs the error and emails admin, but **does not crash the server**

Every time you update `.env` and restart the server, the backup automatically updates.

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
3. **Daily file** — JSON array for one collection:
   ```js
   // mongosh
   db.payments.insertMany(paymentsArray)
   ```
4. **Weekly file** — JSON object with all collections:
   ```bash
   mongoimport --uri "your_mongodb_url" --collection payments --jsonArray --file payments.json
   ```

---

### Restore the `.env` file

Download the `.enc` file from Google Drive → `config/`. Then run this in a Node REPL from the project root:

```js
const { decryptEnvBackup } = require("./BACKEND/utils/envBackup");
decryptEnvBackup("path/to/env_backup_2026-06-13.enc", "your-backup-encryption-key");
```

This prints the decrypted `.env` content to the console. Copy it into a new `.env` file.

> You need `BACKUP_ENCRYPTION_KEY` to decrypt. This is why it must be stored in a password manager **separately** from the `.env` file itself.

---

### Recover Cloudinary images from the manifest

1. Download and decompress the manifest from `cloudinary/`
2. You have every asset's `secure_url` and `public_id`
3. If the Cloudinary account is still active — files are accessible directly via URL
4. If the account is lost — use the URL list to contact Cloudinary support

---

## Troubleshooting

**`invalid_grant` error on startup**
- `GOOGLE_REFRESH_TOKEN` is missing or incorrect
- Re-run `node BACKEND/scripts/getDriveToken.js` to get a new token

**`redirect_uri_mismatch` error when running the token script**
- `http://localhost:9999/callback` is not in the Authorized Redirect URIs list
- Go to Google Cloud Console → Credentials → your OAuth2 client → add `http://localhost:9999/callback`

**Nothing appears in Google Drive**
- Check `GOOGLE_DRIVE_FOLDER_ID` is correct (just the ID from the URL, not the full URL)
- Check server console for `[EnvBackup]` or `[Backup]` log lines

**`.env` backup uploads but decryption fails**
- The `BACKUP_ENCRYPTION_KEY` must exactly match the one used during encryption
- If you changed the key after a previous backup, old `.enc` files need the old key

**Cloudinary manifest shows 0 assets**
- Cloudinary credentials in `.env` must be valid
- Free tier accounts can list resources — check for API rate limit errors in the logs

**Test immediately without waiting for the cron schedule**

Add temporarily to `server.js` after `registerBackupJobs()` and remove once confirmed:

```js
const { runDailyBackup, runWeeklyBackup } = require("./BACKEND/utils/backupJob");
runDailyBackup();    // test daily DB backup
runWeeklyBackup();   // test weekly DB + Cloudinary manifest
```
