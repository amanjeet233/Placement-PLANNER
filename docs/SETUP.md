# 🚀 GitHub Actions Setup Guide for Closed-App FCM Push

**Repository:** `https://github.com/amanjeet233/Placement-PLANNER.git`

This guide explains how to configure GitHub Actions secrets and Firebase service-account credentials to enable **100% Free Scheduled Mobile/Desktop Push Notifications** when your Placement Prep Dashboard / PWA is completely closed.

---

## 🔒 Security First: Secrets Policy

| Credential | Where to Put It | Safe in Git? |
|---|---|---|
| `apiKey`, `projectId`, `messagingSenderId`, `appId` | [`firebase-config.js`](file:///d:/CU/SEM%207/90DAY/firebase-config.js) | ✅ **YES (Public Web Config)** |
| `VAPID_KEY` (Web Push Public Certificate) | [`firebase-config.js`](file:///d:/CU/SEM%207/90DAY/firebase-config.js) | ✅ **YES (Public Key)** |
| **`FIREBASE_PROJECT_ID`** | **GitHub Repository Secrets** | 🚫 **DO NOT COMMIT PRIVATE KEYS** |
| **`FIREBASE_CLIENT_EMAIL`** | **GitHub Repository Secrets** | 🚫 **DO NOT COMMIT PRIVATE KEYS** |
| **`FIREBASE_PRIVATE_KEY`** | **GitHub Repository Secrets** | 🚫 **DO NOT COMMIT PRIVATE KEYS** |
| **`FCM_DEVICE_TOKEN`** | **GitHub Repository Secrets** | 🚫 **DO NOT COMMIT PRIVATE KEYS** |

---

## 📋 Step 1: Obtain Firebase Service-Account JSON

1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Select your `codetrack-360` project.
3. Click the **Gear Icon ⚙️ (Project settings)** in the left sidebar.
4. Click the **"Service accounts"** tab at the top.
5. Under *"Firebase Admin SDK"*, click **"Generate new private key"**.
6. A `.json` file will download. Open it in any text editor.
7. Note these three values:
   - `project_id`: e.g. `codetrack-360`
   - `client_email`: e.g. `firebase-adminsdk-xxxxx@codetrack-360.iam.gserviceaccount.com`
   - `private_key`: e.g. `-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...-----END PRIVATE KEY-----\n`

---

## 📱 Step 2: Copy your FCM Device Token

1. Open `dashboard.html` in your browser (via local server or GitHub Pages).
2. Click **"Enable Notifications"** and allow notifications in your browser.
3. In the **Notification Engine & FCM Diagnostics** section, click **"Copy Token"**.

---

## 🔐 Step 3: Add Secrets to GitHub Repository

1. Open your repository: [https://github.com/amanjeet233/Placement-PLANNER](https://github.com/amanjeet233/Placement-PLANNER).
2. Go to **Settings** → **Secrets and variables** → **Actions**.
3. Click the green **"New repository secret"** button and add each of the 4 secrets:

| Secret Name | Exact Value |
|---|---|
| `FIREBASE_PROJECT_ID` | Value of `project_id` from downloaded JSON |
| `FIREBASE_CLIENT_EMAIL` | Value of `client_email` from downloaded JSON |
| `FIREBASE_PRIVATE_KEY` | Entire `private_key` string from JSON (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`) |
| `FCM_DEVICE_TOKEN` | Your copied FCM Device Token from dashboard |

*(Optional)* If you want to customize your daily reminder list:
- `REMINDERS_JSON`: A JSON array of reminders matching the existing schema:
  `[{"id":"dsa_1030","title":"DSA Practice","message":"Time for daily DSA!","time":"10:30","repeat":"daily","enabled":true}]`

---

## 🧪 Step 4: Run the 1-Click Test Workflow

1. In your GitHub repository, click the **Actions** tab.
2. In the left sidebar, click **"Placement Reminder Push (FCM HTTP v1)"**.
3. Click the **"Run workflow"** dropdown on the right.
4. Leave `force_test` set to `true` (sends test message `CodeTrack 360 Action Test`).
5. Click the green **"Run workflow"** button.
6. **Close your browser / PWA completely**.
7. Within 15–30 seconds, an OS notification will appear on your screen:
   - **Title**: `CodeTrack 360 Action Test`
   - **Body**: `Real FCM HTTP v1 Push delivered via GitHub Actions!`
8. Click the notification to focus and open `dashboard.html`.

---

## ⏰ Step 5: Automated 15-Minute Scheduled Execution

- The GitHub Actions workflow is scheduled with cron (`*/15 * * * *`).
- It automatically evaluates the current time in **Asia/Kolkata (IST)**.
- If a reminder (such as `10:30 AM` DSA Practice) is due, FCM dispatches the push directly to your device even if the app has been closed for hours.
