# 🚀 CodeTrack 360 — Closed-App FCM Push Notifications (₹0 Architecture)

This document provides step-by-step instructions to configure **100% Free Scheduled Push Notifications** when your Placement Prep Dashboard / PWA is **completely closed**.

---

## 🏛️ Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               100% FREE ₹0 ARCHITECTURE                │
├────────────────────────────────────────────────────────┤
│ 1. GitHub Actions (Free Cron every 15 min / Dispatch) │
│    ↓                                                   │
│ 2. Node.js FCM HTTP v1 Sender (scripts/send-fcm-reminders.js)│
│    ↓ (Google OAuth2 RS256 JWT)                         │
│ 3. Firebase Cloud Messaging (FCM HTTP v1 API)          │
│    ↓                                                   │
│ 4. FCM Device Registration Token                       │
│    ↓                                                   │
│ 5. Firebase Messaging Service Worker                   │
│    ↓                                                   │
│ 6. Android OS Notification Pop-up                      │
│    ↓                                                   │
│ 7. User Taps Notification → Dashboard Opens & Focuses  │
└────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Policy: Public vs Private Credentials

| Credential | Where it belongs | Safe for Frontend? |
|---|---|---|
| `apiKey`, `projectId`, `messagingSenderId`, `appId` | [`firebase-config.js`](file:///d:/CU/SEM%207/90DAY/firebase-config.js) | **YES (Public Web App Config)** |
| `VAPID_KEY` (Web Push Public Certificate) | [`firebase-config.js`](file:///d:/CU/SEM%207/90DAY/firebase-config.js) | **YES (Public Key)** |
| **Firebase Service Account Private Key** (`private_key`) | **GitHub Actions Secrets ONLY** | 🚫 **NEVER PUT IN FRONTEND** |
| **Firebase Service Account Client Email** (`client_email`) | **GitHub Actions Secrets ONLY** | 🚫 **NEVER PUT IN FRONTEND** |
| **FCM Device Registration Token** | **GitHub Actions Secrets / LocalStorage** | **Device-Specific Identifier** |

---

## 📋 Step-by-Step Setup Guide

### Step 1: Generate Firebase Service Account Key
1. Open the [Firebase Console](https://console.firebase.google.com).
2. Select your `codetrack-360` project.
3. Click the **Gear Icon ⚙️ (Project settings)**.
4. Click on the **"Service accounts"** tab at the top.
5. Under *"Firebase Admin SDK"*, click the **"Generate new private key"** button.
6. A `.json` file will download to your computer.
7. Open the JSON file in a text editor (e.g., Notepad). You will see:
   - `"project_id"`: (e.g. `codetrack-360`)
   - `"client_email"`: (e.g. `firebase-adminsdk-xxxxx@codetrack-360.iam.gserviceaccount.com`)
   - `"private_key"`: (starts with `-----BEGIN PRIVATE KEY-----\n...`)

### Step 2: Copy your FCM Device Registration Token
1. Open `dashboard.html` in your browser.
2. In the **Notification Engine & FCM Diagnostics** section, click **"Copy Token"**.

### Step 3: Add Repository Secrets in GitHub
1. Open your repository on GitHub.
2. Go to **Settings** → **Secrets and variables** → **Actions**.
3. Click **"New repository secret"** and add these 4 secrets:

| Secret Name | Value to Paste |
|---|---|
| `FIREBASE_PROJECT_ID` | Value of `project_id` from JSON |
| `FIREBASE_CLIENT_EMAIL` | Value of `client_email` from JSON |
| `FIREBASE_PRIVATE_KEY` | Entire `private_key` string from JSON (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`) |
| `FCM_DEVICE_TOKEN` | Your copied FCM Device Token from dashboard |
| `REMINDERS_JSON` *(Optional)* | Custom JSON array of reminders if you want to override default times |

---

## 🧪 Testing Closed-App Push Delivery

### Test 1: Instant Manual Dispatch Test (1-Click)
1. In your GitHub repository, click the **Actions** tab.
2. Select the **"Placement Reminder Push (FCM HTTP v1)"** workflow on the left sidebar.
3. Click **"Run workflow"** → Click the green **"Run workflow"** button.
4. **Close your browser / PWA completely**.
5. Within 15–30 seconds, your device/desktop will receive a real OS notification:
   - **Title**: `🔔 CodeTrack 360 Action Test`
   - **Body**: `Real FCM HTTP v1 Push delivered via GitHub Actions!`
6. Tapping the notification opens and focuses `dashboard.html`.

### Test 2: Scheduled Daily Cron Test
- The workflow runs automatically every 15 minutes (`*/15 * * * *`).
- It evaluates the current time in **Asia/Kolkata (IST)**.
- If a reminder (e.g., `10:30 AM` DSA Practice) falls within the window, FCM sends the push to your phone even if your device was asleep or the app was closed.

---

## ⏱️ Cron Precision & Realistic Delivery Timing

- **Local Timers (App Open / Background Tab / Minimized)**: Exact-second delivery down to the millisecond (`10:30:00 AM`).
- **GitHub Actions Cron (App Completely Closed)**: GitHub Actions schedules cron jobs on best-effort queues. Free-tier cron executions typically trigger within **±3 to 10 minutes** of the scheduled mark.
- **Deduplication**: Reminders are tagged with `codetrack-{reminderId}`, preventing duplicate banners if both the local timer and FCM push arrive during the same session.
