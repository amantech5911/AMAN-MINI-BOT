# Update 2.9.3 — Antidelete + Autoreact fix

## Autoreact: apne messages par bhi
Wajah: main.js ka "loop guard #2" apne (fromMe) normal messages ko autoreact tak pohanchne se pehle hi rok deta tha, isliye sirf dusron ke messages par react hota tha.
Fix: ab apne phone se bheje normal messages par bhi react hota hai. Bot ke apne jawab (ID 3EB0.../BAE5...) par react nahi hota (warna loop banta).
Note: WhatsApp Web / linked device se bheje messages ki ID bhi 3EB0... hoti hai, un par react nahi hoga.

## Antidelete: delete hua message pakadne ke 3 pakke raaste
1. Store ab message ID se bhi dhoondhta hai — chat JID (@lid / number) mismatch ho to bhi original mil jata hai.
2. Agar delete "protocolMessage REVOKE" ban kar messages.upsert mein aaye to wo bhi pakda jata hai (pehle sirf messages.update dekha jata tha).
3. Agar original memory mein na ho to log mein saaf likha aata hai ("delete dikha lekin original memory mein nahi").

## Antidelete kab kaam nahi karega
- Sirf wahi messages wapas aate hain jo bot ne online rehte hue dekhe (har chat ke aakhri 200 / kul 5000). Bot restart hone par memory saaf ho jati hai.
- Apne delete kiye messages wapas nahi aate.
- `.antidelete on` ya `.antidelete dm` lagana zaroori hai (default OFF).
