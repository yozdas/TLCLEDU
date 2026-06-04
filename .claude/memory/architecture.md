# TLCL Eğitim — Mimari & Kod Haritası (Code Map)

> **Amaç:** Bu dosya "hangi kod nerede?" sorusunun tek kaynağıdır. Bir görevle ilgili
> dosyayı ararken **önce burayı oku**, kör arama yapma. Satır numaraları zamanla kayar;
> sembol (fonksiyon/metot) adlarına güven, gerekirse `grep` ile teyit et.

## 1. Proje Özeti
- **Ne:** Tarayıcı tabanlı, etkileşimli Linux Komut Satırı eğitim simülatörü.
- **Referans:** William Shotts — *"The Linux Command Line"* (bkz. `book-reference.md`).
- **Teknoloji:** %100 client-side **Vanilla JavaScript (ES6+)**. Framework, bundler,
  veritabanı, sunucu **YOK**. Build adımı **YOK** — dosyalar tarayıcıya doğrudan yüklenir.
- **Depolama:** `localStorage` (anahtarlar: `tlcl_fs`, ilerleme durumu).
- **Dağıtım:** GitHub Pages (statik). Kökteki `.nojekyll` Jekyll'i atlatır.
- **Lisans:** AGPL-3.0. Telif: Yusuf Özdaş.

## 2. Modül Yükleme Düzeni (KRİTİK)
`index.html` script'leri **bu sırayla** yükler; her modül kendini bir `window.X` global'ine
bağlar. Sıra bir bağımlılık zinciridir — bozma:

```
purify.min.js → fs.js → processes.js → vim.js → commands.js → terminal.js → course.js → app.js
```

| Global | Sınıf | Dosya |
|---|---|---|
| `window.fs` | `FileSystem` | `js/fs.js` |
| `window.processManager` | `ProcessManager` | `js/processes.js` |
| `VimEditor` (app.js `new`'ler) | `VimEditor` | `js/vim.js` |
| `window.commandRegistry` | `CommandRegistry` | `js/commands.js` |
| `window.Terminal` | `Terminal` | `js/terminal.js` |
| `window.CourseManager` | `CourseManager` | `js/course.js` |
| (bootstrap) | — | `js/app.js` |

## 3. Dosya → Sorumluluk + Anahtar Semboller

### `js/fs.js` — Sanal Dosya Sistemi (`FileSystem`)
Ağaç düğümleri: `{ name, type:'dir'|'file', parent, children?, content?, permissions? }`.
- `initDefaultFS()` — varsayılan ağacı kurar (`/home/user`, `/etc/passwd`, `/usr`, sözlük vb.).
- `migrateFS()` — kayıtlı FS'e sonradan eklenen dosyaları enjekte eder (geri uyum).
- `resolvePath(path)` · `pwd()` · `cd()` · `mkdir()` · `createDir/createFile/ensureFile`
- `touch · readFile · writeFile · rm · cp · mv`
- `exportState/importState/saveState` — `localStorage` JSON (parent referansları yeniden bağlanır).
- **Yeni varsayılan dosya/dizin eklerken** hem `initDefaultFS()` hem migrasyon yolunu düşün.

### `js/processes.js` — Süreç Simülasyonu (`ProcessManager`)
- `addJob/getJobs/killJob` (arka plan `&` işleri), `getProcessList()` (`ps`/`top` için sahte tablo),
  `killProcess(pid)` (pid 1/2 korunur). Tek-thread JS; "Done" `setTimeout` ile taklit edilir.

### `js/vim.js` — Vi/Vim Simülatörü (`VimEditor`)
- Modlar: NORMAL / INSERT / COMMAND. `open(filename, content)` · `close()` · `save()`.
- `close()` **`window.dispatchEvent(new Event('vi_exit'))`** yayar — bazı dersler bunu dinler.
- **Uyarı:** `js/vim.js.orig` ve `js/vim.js.rej` eski bir patch'in artığıdır (cruft). Düzenleme.

### `js/commands.js` — Komut Kütüphanesi (`CommandRegistry`) — EN BÜYÜK DOSYA
- `register(name, fn)` / `execute(name, args, stdin, terminal)`.
- Komut imzası: **`(args, stdin, term, fs) => ({ output } | { error })`**.
  - `args`: string[] (genişletilmiş), `stdin`: pipe'tan gelen string, `term`: Terminal, `fs`: FileSystem.
  - Dönüş: `{ output: '...' }` başarı, `{ error: '...' }` hata. `output`/`error` sonradan ekrana basılır.
- `registerBuiltins()` içinde ~100 komut: `ls, cd, cp, mv, rm, cat, grep, sed, awk, tr, cut,
  printf, find, tar, chmod, ps, top, apt, vi, df, du, ping, wget` ...
- **Yeni komut buraya eklenir** (bkz. skill `add-command`). Çıktıyı `term.escapeHTML()` ile temizle.

### `js/terminal.js` — Kabuk Motoru (`Terminal`) — EN KARMAŞIK DOSYA
Asıl shell mantığı. Önemli metotlar:
- `tokenize(str)` — tırnak/escape-farkında token ayrıştırma.
- `expandArgs(args)` — glob `*`, brace `{a,b}`, tilde `~` genişletme.
- `expandVars(str)` — `$VAR`, `${VAR}`, `$1..$9`, `$?` vb. değişken genişletme.
- `processCommand(cmdString)` — giriş noktası; blok (if/while/until/for/case/function) tespiti.
- `executeChained(segment)` — `&&` / `||` / `;` zincirleri.
- `executePipeline(cmdString)` — pipe `|` ve yönlendirme `>` `>>` `<`; `commandRegistry.execute` çağırır.
- `executeBlock(fullCommand)` — çok satırlı yapılar; `blockBuffer`/`blockDepth` ile.
- `evaluateCondition(cond)` — `[ ... ]` / `test`.
- `silentExecute(cmdString)` — UI'a basmadan çalıştırma (testler/iç kullanım).
- `escapeHTML(str)` — **TÜM kullanıcı/komut çıktısı DOM'a girmeden buradan geçmeli** (XSS).
- State: `env`, `aliases`, `functions`, `localScopes`, `history`, `installedPackages`.
- `onCommandExecuted` callback'i app.js'te `courseManager.checkTask` + ağaç güncellemesini tetikler.

### `js/course.js` — Müfredat (`CourseManager` + `courseData`)
- `courseData`: ders nesneleri dizisi. Şema:
  `{ id, title, description, text, task, unlocked:[...], checkCompletion:(cmd,fs,term)=>bool,
     onEnter?:(fs)=>void, customCheck?:bool }`.
- `baseUnlocked`: temel açık komutlar listesi (dosyanın başında).
- `checkTask(command, terminal)` — her komuttan sonra mevcut dersin `checkCompletion`'ını çağırır.
- `updateUnlockedCommands` · `renderCurrentLesson` · `renderCurriculumList` · `nextLesson` · `goToLesson`.
- **Yeni ders buraya eklenir** (bkz. skill `add-lesson`). Dersler kitap bölümleriyle hizalı olmalı.

### `js/app.js` — Bootstrap / UI Tutkalı
- `DOMContentLoaded` içinde her şeyi `new`'ler ve birbirine bağlar.
- `window.showToast(msg, type)`, FS ağaç çizimi (`updateFsTree`), ders tamamlama efektleri.

## 4. İki Dil (i18n) — `en/` AYNASI ⚠️
- Kök = **Türkçe** UI. `en/` = **İngilizce** aynası (`en/index.html`, `en/js/*`, `en/style.css`).
- `en/js/*` dosyaları kök `js/*` ile **neredeyse birebir aynıdır** (sadece kullanıcıya görünen
  metinler farklı). **Kökte mantık değiştirirsen `en/` karşılığını da güncelle.**
- Detaylı kural: `.claude/rules/i18n-sync.md`. Yardımcı skill: `sync-i18n`.

## 5. Testler & CI
- `tests/*.test.js` — node tabanlı. Hile: kaynağı okur, `window.X = new Y();` satırını **silip**
  `module.exports` ekleyerek geçici dosyadan `require` eder; DOM/localStorage **mock**'lanır.
  → Bu yüzden `window.X = ...` satırlarının **tam metni** test'lerin beklediğiyle eşleşmeli.
- Çalıştır: `bash test.sh` (4 dosya: fs, terminal, vim, processes).
- CI: `.github/workflows/test.yml` (şu an **yalnız** `terminal.test.js` çalıştırıyor — eksik),
  `.github/workflows/static.yml` (Pages deploy, `master`).

## 6. Tipik Görev → Nereye Bak
| Görev | Birincil dosya | İlgili |
|---|---|---|
| Yeni shell komutu | `js/commands.js` | terminal.js (parse), en/ aynası, test |
| Yeni ders / müfredat | `js/course.js` | book-reference.md, en/ aynası |
| Parse/pipe/glob/değişken hatası | `js/terminal.js` | commands.js |
| Dosya sistemi davranışı | `js/fs.js` | fs.test.js |
| Vim davranışı | `js/vim.js` | vim.test.js |
| ps/top/jobs | `js/processes.js` | processes.test.js |
| UI/stil/toast | `index.html`, `style.css`, `js/app.js` | en/ aynası |
