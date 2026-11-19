# Update 2.9.5 — .movie / .drama (info) add

## Naye/badle commands
- `.movie <naam>` (alias `.film`, `.imdb`, `.movinfo`) — movie/series ki info: OMDb → TMDB → TVmaze → Wikipedia.
- `.drama <naam>` (alias `.series`, `.serial`, `.kdrama`, `.show`) — drama/series ki info + total/latest/next episode: TVmaze → TMDB → OMDb → Wikipedia.
- Poster ke saath card bhejte hain. TVmaze aur Wikipedia ko key nahi chahiye; OMDb/TMDB ki free key `plugins/movie.js` aur `plugins/drama.js` ke upar `OMDB_KEY` / `TMDB_KEY` mein daal sakte ho (optional).

## Is bot ke liye 2 fix
- `m.chat` ki jagah `from` — pehle poster kabhi nahi jata tha, sirf text.
- MarkdownV2 wali `esc()` (Telegram ke liye) WhatsApp mein `\.` `\-` dikhati thi — hata di.

## Download wale commands ka naya naam
YouTube se download karne wale commands ab alag naam se hain taake takrayen nahi:
- `.moviedl <naam>` (alias `.filmdl`, `.moviedownload`) — 40+ min full movie
- `.dramadl <naam>` (alias `.dramadownload`) — 15+ min drama
