const WEBHOOK_URL = "https://open.larksuite.com/open-apis/bot/v2/hook/26080ff6-2901-40dc-8bcb-cd53d2b419c7";

async function sendFancyLarkNotification(prayerName, prayerTime, location) {
    const payload = {
        msg_type: "interactive",
        card: {
            config: { wide_screen_mode: true },
            header: { title: { tag: "plain_text", content: `🕌 Namaz Reminder ${prayerName.toUpperCase()}` } },
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

// ✅ Call the function
sendFancyLarkNotification("Fajr", "05:30", "o3 interfaces i 11 Islamabad");