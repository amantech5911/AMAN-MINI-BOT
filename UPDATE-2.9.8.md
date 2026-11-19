# Update 2.9.8 — View-once ka doosra daroaza band

## Masla
`lib/msg.js` quoted message ke view-once wrapper khol kar normal image/video bana deta tha aur har command ko `m.quoted.download()` de deta tha. Is liye `groupstatus.js`, `gc-setting.js` jaise commands (aur jo bhi `m.quoted.download()` / `m.quoted.msg` istemal kare) kisi bhi view-once media par reply karne se wo media khol sakte the.

## Fix (lib/msg.js)
- Quoted message view-once ho (V2 / V2Extension / purana wrapper, ya `viewOnce: true` wala media) to:
  - `m.quoted.isViewOnce = true`
  - `m.quoted.mtype = 'viewOnceMessage'`, `m.quoted.msg = {}`
  - `m.quoted.download()` ab `null` deta hai
- Is se koi command (.sticker, .toimg, .tourl, groupstatus ...) view-once media par kaam nahi karta.
- `m.quoted.message` (asli raw message) waisa hi hai, isliye sirf owner ka `.vv` (aur alias `.vv2 .savevo .open .view .ok ...`) abhi bhi media khol kar owner ke DM mein bhejta hai.
- Koi alag on/off command nahi — ye hamesha ON hai.

## Hadd
Dusre log apne alag bot / apne phone se aap ka bheja view-once khol sakte hain (WhatsApp ki apni hadd) — bot sirf apne aap ko rok sakta hai.
