/**
 * ===================================================================
 * FCM HTTP v1 PUSH SENDER — CodeTrack 360 Placement Prep Portal
 * ===================================================================
 * 
 * Purpose:
 *   Triggered by GitHub Actions cron or workflow_dispatch to dispatch
 *   real FCM push notifications to registered devices when the PWA/browser
 *   is completely closed.
 * 
 * Zero Paid Dependencies:
 *   Uses native Node.js 'crypto' and 'https' modules to generate
 *   Google OAuth2 service account JWTs and call the FCM HTTP v1 API.
 * 
 * Timezone:
 *   Asia/Kolkata (IST: UTC + 5:30)
 * ===================================================================
 */

const https = require('https');
const crypto = require('crypto');

// ===================================================================
// 1. CONFIGURATION & SECRETS
// ===================================================================

const PROJECT_ID    = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL  = process.env.FIREBASE_CLIENT_EMAIL;
let   PRIVATE_KEY   = process.env.FIREBASE_PRIVATE_KEY;
const DEVICE_TOKEN  = process.env.FCM_DEVICE_TOKEN;
const REMINDERS_RAW = process.env.REMINDERS_JSON;

// Manual test overrides via GitHub Actions workflow_dispatch inputs
const IS_FORCE_TEST = process.env.INPUT_FORCE_TEST === 'true' || process.argv.includes('--test');
const TEST_TITLE    = process.env.INPUT_TEST_TITLE || 'CodeTrack 360 Action Test';
const TEST_MESSAGE  = process.env.INPUT_TEST_MESSAGE || 'Real FCM HTTP v1 Push delivered via GitHub Actions!';
const CUSTOM_TOKEN  = process.env.INPUT_CUSTOM_TOKEN || DEVICE_TOKEN;

// ===================================================================
// 2. HELPER FUNCTIONS: TIME & TIMEZONE (Asia/Kolkata)
// ===================================================================

/**
 * Returns current date and time in Asia/Kolkata timezone
 */
function getISTDateTime(dateObj = new Date()) {
  const istString = dateObj.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istDate = new Date(istString);

  const yr = istDate.getFullYear();
  const mo = String(istDate.getMonth() + 1).padStart(2, '0');
  const da = String(istDate.getDate()).padStart(2, '0');
  const ho = String(istDate.getHours()).padStart(2, '0');
  const mi = String(istDate.getMinutes()).padStart(2, '0');
  const dayOfWeek = istDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

  return {
    dateStr: `${yr}-${mo}-${da}`,
    timeStr: `${ho}:${mi}`,
    hours: istDate.getHours(),
    minutes: istDate.getMinutes(),
    dayOfWeek,
    fullIso: istDate.toISOString()
  };
}

/**
 * Validates whether a scheduled time (HH:MM) falls within the cron evaluation window.
 * Default cron window is ±15 minutes (or ±5 minutes if high frequency cron).
 */
function isDueNow(scheduledTimeHHMM, currentHHMM, windowMinutes = 15) {
  if (!scheduledTimeHHMM || !scheduledTimeHHMM.includes(':')) return false;
  const [sH, sM] = scheduledTimeHHMM.split(':').map(Number);
  const [cH, cM] = currentHHMM.split(':').map(Number);
  if (isNaN(sH) || isNaN(sM) || isNaN(cH) || isNaN(cM)) return false;

  const scheduledTotal = sH * 60 + sM;
  const currentTotal   = cH * 60 + cM;

  const diff = Math.abs(currentTotal - scheduledTotal);
  return diff <= windowMinutes;
}

// ===================================================================
// 3. GOOGLE OAUTH2 JWT GENERATOR (Pure Node.js Crypto)
// ===================================================================

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Normalizes and repairs any malformed Firebase Private Key string from environment secrets
 */
function normalizePrivateKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return '';
  let key = rawKey.trim();

  // 1. Strip surrounding wrapping quotes (single or double)
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }

  // 2. Handle case where user pasted the entire service account JSON or key:value line
  if (key.includes('private_key')) {
    try {
      const parsed = JSON.parse(key);
      if (parsed.private_key) key = String(parsed.private_key).trim();
    } catch (e) {
      const m = key.match(/"private_key"\s*:\s*"([^"]+)"/);
      if (m && m[1]) key = m[1].trim();
    }
  }

  // 3. Convert all variations of escaped newlines (\n, \\n, \\\n, etc.) and carriage returns
  key = key.replace(/\\+n/g, '\n').replace(/\\+r/g, '').replace(/\r/g, '');

  // 4. Find PEM header and footer
  const pk8Header = '-----BEGIN PRIVATE KEY-----';
  const pk8Footer = '-----END PRIVATE KEY-----';
  const pk1Header = '-----BEGIN RSA PRIVATE KEY-----';
  const pk1Footer = '-----END RSA PRIVATE KEY-----';

  let header = '';
  let footer = '';
  if (key.includes(pk8Header) && key.includes(pk8Footer)) {
    header = pk8Header;
    footer = pk8Footer;
  } else if (key.includes(pk1Header) && key.includes(pk1Footer)) {
    header = pk1Header;
    footer = pk1Footer;
  } else if (key.includes('BEGIN') && key.includes('END')) {
    const hMatch = key.match(/-----BEGIN [A-Z ]+-----/);
    const fMatch = key.match(/-----END [A-Z ]+-----/);
    if (hMatch && fMatch) {
      header = hMatch[0];
      footer = fMatch[0];
    }
  }

  if (header && footer) {
    const startIndex = key.indexOf(header) + header.length;
    const endIndex = key.indexOf(footer);
    if (endIndex > startIndex) {
      const rawBody = key.substring(startIndex, endIndex);
      // Strictly clean Base64 body: strip everything that is NOT A-Z, a-z, 0-9, +, /, or =
      const cleanBody = rawBody.replace(/[^A-Za-z0-9+/=]/g, '');
      // Format into standard 64-character PEM lines
      const wrappedBody = cleanBody.match(/.{1,64}/g)?.join('\n') || cleanBody;
      return `${header}\n${wrappedBody}\n${footer}\n`;
    }
  }

  return key;
}

/**
 * Creates a signed Google OAuth2 JWT and exchanges it for an access token
 */
async function getGoogleAccessToken(clientEmail, rawPrivateKey) {
  return new Promise((resolve, reject) => {
    try {
      const formattedKey = normalizePrivateKey(rawPrivateKey);

      if (!formattedKey || (!formattedKey.includes('-----BEGIN PRIVATE KEY-----') && !formattedKey.includes('-----BEGIN RSA PRIVATE KEY-----'))) {
        return reject(new Error('FIREBASE_PRIVATE_KEY is empty or missing valid PEM header (-----BEGIN PRIVATE KEY-----). Check that you copied "private_key" and not "private_key_id" in GitHub repository secrets.'));
      }

      let keyObj;
      try {
        keyObj = crypto.createPrivateKey({ key: formattedKey, format: 'pem' });
      } catch (pemErr) {
        return reject(new Error(`FIREBASE_PRIVATE_KEY could not be decoded as a valid PEM private key: ${pemErr.message}`));
      }

      const now = Math.floor(Date.now() / 1000);
      const header = { alg: 'RS256', typ: 'JWT' };
      const claimSet = {
        iss: clientEmail.trim(),
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
      };

      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
      const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

      const sign = crypto.createSign('RSA-SHA256');
      sign.update(signatureInput);
      sign.end();
      const signature = sign.sign(keyObj, 'base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const jwt = `${signatureInput}.${signature}`;

      // Exchange JWT for Access Token
      const postData = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      }).toString();

      const req = https.request('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.access_token) {
              resolve(data.access_token);
            } else {
              reject(new Error(`OAuth2 error: ${data.error_description || data.error || body}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse OAuth response: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ===================================================================
// 4. FCM HTTP v1 MESSAGE DISPATCHER
// ===================================================================

async function sendFcmMessage(projectId, accessToken, token, reminderData) {
  return new Promise((resolve, reject) => {
    const payload = {
      message: {
        token: token,
        notification: {
          title: reminderData.title || 'CodeTrack 360 Reminder',
          body: reminderData.message || 'Time for your scheduled placement preparation!'
        },
        data: {
          url: './dashboard.html',
          reminderId: String(reminderData.id || 'test_reminder'),
          scheduledTime: String(reminderData.time || '10:30'),
          deliveryKey: String(reminderData.deliveryKey || 'manual'),
          source: 'github-actions-fcm'
        },
        webpush: {
          headers: {
            Urgency: 'high'
          },
          notification: {
            icon: './icons/icon-192.png',
            badge: './icons/icon-192.png',
            tag: `codetrack-${reminderData.id || 'test'}`,
            requireInteraction: true,
            renotify: true
          },
          fcm_options: {
            link: './dashboard.html'
          }
        }
      }
    };

    const postData = JSON.stringify(payload);
    const endpoint = `/v1/projects/${projectId}/messages:send`;

    const req = https.request({
      hostname: 'fcm.googleapis.com',
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(body);
            resolve({ ok: true, name: parsed.name, status: res.statusCode });
          } catch (e) {
            resolve({ ok: true, raw: body, status: res.statusCode });
          }
        } else {
          try {
            const errJson = JSON.parse(body);
            resolve({ ok: false, status: res.statusCode, error: errJson.error ? errJson.error.message : body });
          } catch (e) {
            resolve({ ok: false, status: res.statusCode, error: body });
          }
        }
      });
    });

    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.write(postData);
    req.end();
  });
}

// ===================================================================
// 5. MAIN SCHEDULER EXECUTION
// ===================================================================

async function main() {
  console.log('====================================================');
  console.log('CODETRACK 360 — FCM HTTP v1 PUSH DISPATCHER');
  console.log('====================================================\n');

  // Verify Required Secrets
  const missingSecrets = [];
  if (!PROJECT_ID) missingSecrets.push('FIREBASE_PROJECT_ID');
  if (!CLIENT_EMAIL) missingSecrets.push('FIREBASE_CLIENT_EMAIL');
  if (!PRIVATE_KEY) missingSecrets.push('FIREBASE_PRIVATE_KEY');
  if (!CUSTOM_TOKEN) missingSecrets.push('FCM_DEVICE_TOKEN');

  if (missingSecrets.length > 0) {
    console.error(`❌ ERROR: Missing required GitHub Actions secrets: ${missingSecrets.join(', ')}`);
    console.error('Please configure these secrets in your GitHub repository:');
    console.error('Settings → Secrets and variables → Actions → Repository secrets.\n');
    process.exit(1);
  }

  const ist = getISTDateTime();
  console.log(`🕒 Execution Time (IST): ${ist.dateStr} ${ist.timeStr} (Day ${ist.dayOfWeek})`);
  console.log(`📦 Project ID: ${PROJECT_ID}`);
  console.log(`📱 Device Token: ${CUSTOM_TOKEN.substring(0, 15)}...${CUSTOM_TOKEN.substring(CUSTOM_TOKEN.length - 8)}`);

  // Step 1: Obtain Google OAuth2 Access Token
  console.log('\n🔑 Authenticating with Google Cloud OAuth2...');
  let accessToken = null;
  try {
    accessToken = await getGoogleAccessToken(CLIENT_EMAIL, PRIVATE_KEY);
    console.log('✅ Google OAuth2 Access Token obtained successfully.');
  } catch (authErr) {
    console.error('❌ Failed to authenticate with Firebase Service Account:', authErr.message);
    process.exit(1);
  }

  // Step 2: Handle Force Test Mode
  if (IS_FORCE_TEST) {
    console.log('\n🚀 FORCE TEST MODE ACTIVE: Sending immediate test push...');
    const testReminder = {
      id: 'force_test_' + Date.now(),
      title: TEST_TITLE,
      message: TEST_MESSAGE,
      time: ist.timeStr,
      deliveryKey: `${ist.dateStr}_manual_test`
    };

    const res = await sendFcmMessage(PROJECT_ID, accessToken, CUSTOM_TOKEN, testReminder);
    if (res.ok) {
      console.log('🎉 SUCCESS: Push notification delivered to FCM backend!');
      console.log(`   Message ID: ${res.name || 'OK'}`);
    } else {
      console.error(`❌ FCM Delivery Failed (HTTP ${res.status}):`, res.error);
      process.exit(1);
    }
    return;
  }

  // Step 3: Parse Scheduled Reminders
  let reminders = [];
  if (REMINDERS_RAW) {
    try {
      const parsed = JSON.parse(REMINDERS_RAW);
      if (Array.isArray(parsed)) reminders = parsed;
    } catch (e) {
      console.warn('⚠️ Could not parse REMINDERS_JSON secret. Using default reminder schedule.');
    }
  }

  // Fallback: Default placement schedule if no custom JSON provided
  if (reminders.length === 0) {
    reminders = [
      { id: 'def_dsa',      title: 'DSA Practice',      message: 'Time for today\'s DSA problems!', time: '10:30', repeat: 'daily', enabled: true },
      { id: 'def_aptitude', title: 'Aptitude Practice',  message: 'Solve quantitative aptitude MCQs.', time: '14:30', repeat: 'daily', enabled: true },
      { id: 'def_revision', title: 'Placement Revision', message: 'Review today\'s completed topics.', time: '21:00', repeat: 'daily', enabled: true }
    ];
  }

  console.log(`\n📋 Evaluating ${reminders.length} reminder(s) against current IST time (${ist.timeStr})...`);

  let dispatchedCount = 0;

  for (const r of reminders) {
    if (!r.enabled) {
      console.log(`   [DISABLED] "${r.title}" (${r.time}) — Skipped`);
      continue;
    }

    // Weekday evaluation
    if (r.repeat === 'weekdays' && Array.isArray(r.days) && r.days.length > 0) {
      if (!r.days.includes(ist.dayOfWeek)) {
        console.log(`   [OFF-DAY] "${r.title}" (${r.time}) — Not scheduled for day ${ist.dayOfWeek}`);
        continue;
      }
    }

    // Time window evaluation (±15 min window for cron alignment)
    const due = isDueNow(r.time, ist.timeStr, 15);
    if (due) {
      console.log(`   🎯 [DUE NOW] "${r.title}" (Scheduled: ${r.time}, Current: ${ist.timeStr}) → Dispatching...`);
      const deliveryKey = `${r.id}_${ist.dateStr}_${r.time.replace(':', '-')}`;
      
      const sendResult = await sendFcmMessage(PROJECT_ID, accessToken, CUSTOM_TOKEN, {
        ...r,
        deliveryKey
      });

      if (sendResult.ok) {
        console.log(`      ✅ Delivered to FCM! Message ID: ${sendResult.name || 'OK'}`);
        dispatchedCount++;
      } else {
        console.error(`      ❌ Delivery Error (HTTP ${sendResult.status}):`, sendResult.error);
      }
    } else {
      console.log(`   [NOT DUE] "${r.title}" (Scheduled: ${r.time}) — Outside current window`);
    }
  }

  console.log(`\n====================================================`);
  console.log(`Summary: ${dispatchedCount} push notification(s) sent.`);
  console.log(`====================================================`);
}

main().catch(err => {
  console.error('Fatal error during execution:', err);
  process.exit(1);
});
