# Update 2.9.4 — .drama fix + naya .movie

## .drama fix
Wajah: sirf ek YouTube search hoti thi aur uske pehle 20 mein koi 15+ minute ki video na ho to "suitable drama nahi mila" aa jata tha ("Khuda or mohabbat" jaisa naam likhne par aksar OST/promo hi aate the).
Ab: `lib/longsearch.js` kai variants chalata hai (full drama, full episode, episode 1; "or" ke saath "aur" bhi), trailer/OST/promo/clips hata deta hai, aur naam se sab se milti video chunta hai (milte alfaaz + views + length).
- "Search nahi ho saki" aur "nahi mila" ab alag message hain.
- Tip: naam ke saath episode likho — `.drama Khuda Aur Mohabbat episode 1`.

## Naya: .movie <naam> (download category)
- `.movie Jawani Phir Nahi Ani` — YouTube par 40+ minute ki full movie dhoond kar download aur send. Alias: `.film`, `.moviedl`.
- Apne server par yt-dlp (drama jaisa), koi third-party site nahi. Quality 360p se shuru, file badi ho to 240p/144p.
- Max file 700 MB. 90 MB se badi file document (.mp4) ke taur par jati hai.
- Sirf wahi movies milengi jo YouTube par puri upload hain.
