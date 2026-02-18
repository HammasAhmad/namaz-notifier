// pm2 start index.js --name namaz-notifier

import fetch from 'node-fetch';  // skip if Node 18+
import cron from 'node-cron';

// const WEBHOOK_URL = "https://open.larksuite.com/open-apis/bot/v2/hook/26080ff6-2901-40dc-8bcb-cd53d2b419c7";
const WEBHOOK_URL = "https://open.larksuite.com/open-apis/bot/v2/hook/e90fc6b7-82fd-4cba-922d-5cff37705401";

// Set your location

const url = "https://islamicapi.com/api/v1/prayer-time/?lat=33.644777&lon=73.022220&method=1&school=2&api_key=zfubyb5TZH1cbxaLrU542tZljTu4hcdfzihYGZjAGx4hcWxe"
// 1️⃣ Get Prayer Times
async function getPrayerTimes() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.data.times;
    } catch (err) {
        console.error("Failed to fetch prayer times:", err);
        return null;
    }
}

// 2️⃣ Send Notification to Lark
async function sendLarkNotification(prayerName) {
    const payload = {
        msg_type: "text",
        content: { text: `🕌 It's time for ${prayerName} prayer` }
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`Sent notification for ${prayerName}`);
        } else {
            console.error("Failed to send notification", await response.text());
        }
    } catch (err) {
        console.error("Error sending Lark notification:", err);
    }
}

async function sendFancyLarkNotification(prayerName, prayerTime, location) {
    const payload = {
        msg_type: "interactive",
        card: {
            config: { wide_screen_mode: true },
            header: { title: { tag: "plain_text", content: `🕌 Namaz Reminder ${prayerName.toUpperCase()}` } },
            // header: { title: { tag: "plain_text", content: `🕌 Namaz Reminder ${prayerName.toUpperCase()} * RAMAZAN KAREEM *` } },
            elements: [
                {
                    tag: "div",
                    text: {
                        tag: "lark_md",
                        content: `**It's time for ${prayerName} prayer 🌙**\n\n<at id=all></at>\nMay your prayer bring peace and blessings.`
                    }
                },
                { tag: "hr" },
                {
                    tag: "note",
                    elements: [
                        { tag: "plain_text", content: `⏰ Prayer Time: ${prayerTime}` },
                        { tag: "plain_text", content: `📍 Location: ${location}` }
                    ]
                },
            ]
        }
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log("Lark response:", response.status, text);  // Logs Lark response for debugging
    } catch (err) {
        console.error("Error sending notification:", err);
    }
}
// 3️⃣ Schedule Notifications
async function schedulePrayerNotifications() {
    const value = await getPrayerTimes();
    // const value = {
    //     Fajr: "05:30",
    //     Dhuhr: "12:53",
    //     Asr: "18:30",
    //     Maghrib: "18:30",
    //     Isha: "20:00"
    // }
    if (!value) return;
    const keysToKeep = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    const prayerTimes = Object.fromEntries(
        Object.entries(value).filter(([key]) => keysToKeep.includes(key))
    );

    for (const [prayerName, time] of Object.entries(prayerTimes)) {
        const [hour, minute] = time.split(':');

        // Cron syntax: minute hour * * *
        cron.schedule(`${minute} ${hour} * * *`, () => {
            // sendLarkNotification(prayerName);
            sendFancyLarkNotification(prayerName, time, "o3 interfaces i 11 Islamabad");
        });
        console.log(`Scheduled ${prayerName} at ${hour}:${minute}`);
    }
}

// 4️⃣ Run the scheduler
schedulePrayerNotifications();