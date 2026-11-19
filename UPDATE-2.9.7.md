# Update 2.9.7 — View-once sirf owner ke liye

## Masla
`.vv` pehle se sirf owner ke liye tha (media sirf owner ke DM mein jati hai), lekin `fresh-pack.js` mein ek alag `.vv2` / `.savevo` command thi jis par koi owner check nahi tha — group ya chat mein koi bhi us se view-once media khol kar chat mein dekh sakta tha.

## Fix
- `.vv2` aur `.savevo` `fresh-pack.js` se hata di gayin.
- Ab `.vv2` aur `.savevo` `.vv` ke alias hain: sirf BOT OWNER chala sakta hai, aur media sirf owner ke apne DM mein aati hai. Doosra koi chalaye to "SIRF BOT OWNER KE LIYE" ka message aata hai.
- `.vv`, `.viewonce`, `.view`, `.open` aur chupke wale `.ok .nice .thanks ...` pehle jaise hain.

## Hadd (WhatsApp ki apni)
Bot ye nahi rok sakta ke aap ka bheja hua view-once samne wala khud khol le, ya screenshot/doosre phone se record kar le. Bot sirf itna rok sakta hai ke koi uske zariye media na nikaal sake.
