# Update 2.9.2

## Naya: .aoa (general)
- `.aoa <number>` — us number ko "السَّلامُ عَلَيْكُم ورَحْمَةُ اللّٰہِ وَبَرَكاتُهُ" aur ek random Urdu shayari jati hai.
- Number `923001234567` ya `03001234567` dono chalte hain. Number ke bajaye kisi message par reply ya @mention bhi chalta hai.
- Alias: `.salam`, `.salaam`. Pehle check hota hai ke number WhatsApp par hai.
- Har user ke liye 30 second ka gap (owner par nahi). `plugins/aoa.js` mein `COOLDOWN_MS` se badlo.
- Shayari `plugins/aoa.js` ki `POETRY` list mein hai — apne sher add/badal sakte ho.

## .chreact v2 (multi-emoji)
- `.chreact <link> 🔥 ❤️ 😂 🎉` — ek saath kai emoji, progress message ke saath (kitne gaye / kitne fail).
- Default Baileys direct hai, API key ki zaroorat nahi.
- Optional API mode: Railway Variables mein `CHREACT_API_KEY` daalo (aur chaho to `CHREACT_API_URL`). Key na ho to khud Baileys chalta hai.
- Lagatar 5 fail par ruk jata hai aur aakhri error dikhata hai.
- `AMAN TECH/general/` ki copy bhi isi version par sync hai.
