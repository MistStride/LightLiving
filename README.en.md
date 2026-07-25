<div align="center">

# 🌿 Light Living · 轻盈生活 / 物尽其轻

**A companion ledger for your belongings that quietly keeps the accounts for you.**

Not a "throw things away" decluttering tool — but one that helps you **cherish what you actually use, and let go of the rest with grace**.

[Why Light Living](#-why-light-living) · [Features](#-features) · [Three Versions](#-three-versions) · [Get Started in 3 Minutes](#-get-started-in-3-minutes) · [In-App Guide](使用说明.md)

🌐 中文版：[README.md](README.md)

</div>

---

## 🌟 Why "Light Living"

Everything we buy accompanies us in two currencies: **money** and **time**.

- A keyboard you've used for 300 days may cost only a few cents per day — it deserves to be cherished.
- A dusty DSLR you've never taken a single photo with — its "daily cost of companionship" hides a gentle question mark: **¥X ＋ ∞**.

Most expense apps only tell you "how much you spent" and never ask "was it worth it." **Light Living** goes the other way: it spreads the cost across every day and every use, so you can see at a glance the joy of *getting the most out of things* — and be gently reminded when it's *time to say goodbye*.

> We believe: **use things to their fullest, and live lightly.**
>
> In the WeChat mini-program, this mood is written into a line of poetry at the bottom of the screen — it changes with the theme: the Bamboo theme pairs with Su Shi's "一蓑烟雨任平生" (*letting the rain and wind pass through life*), the Iris theme with "一花一世界，一叶一菩提" (*a flower, a world; a leaf, a bodhi*), and the Starry Night theme with "星垂平野阔，月涌大江流" (*stars hang over the vast plain, the moon surges with the great river*).

---

## ✨ Features

- **📊 Two billing modes that let cost speak for itself**
  - By days: automatically computes `daily cost = price ÷ days of companionship` (companionship starts from **day 1** — brand new = full price)
  - By uses: manually `+1 check-in`, computes `per-use cost = price ÷ check-in count`; **0 uses = ∞**, the dashboard shows "¥X ＋ ∞" to remind you "bought but never used"
- **⚙️ Custom status / relationship rules**: define statuses by your relationship with each item (✨ used to its fullest, 🌫️ gathering dust…); negative statuses lower your "lightness" and gently nudge you to declutter
- **📈 Lightness analysis**: a ring progress bar on the dashboard that reflects the health of your belongings at a glance
- **🌫️ Decluttering reminders**: items in a negative status automatically surface a gentle reminder — "go say goodbye" or "ignore"
- **✋ Long-press a card for the menu**: long-press any card on your phone to pop up a quick menu — edit / check-in once / farewell / delete / restore
- **✏️ Tap the cover to edit**: tap the thumbnail on the left of an item to change its name / price / date / category / mode / note / cover directly
- **🎨 Emoji covers**: besides photos, you can pick an emoji as the cover; if the name starts with an emoji and no photo is uploaded, it's used as the default cover automatically
- **💜 Parting · Letting Go (a graceful farewell)**: elegantly send off items that have left, with a required farewell note; on completion it **confetti 🎉 + a soft vibration**, moving the item to the "farewell" archive — no resale accounting
- **⏳ Long-unseen at a glance**: count mode shows "last used X days ago / gathering dust for X days", paired with a "long-unseen" sort to quickly locate idle items
- **📄 Paginated browsing**: up to 5 items per page in the companion ledger, keeping the list light
- **🔍 Search**: matches both the item name and its note / mood story
- **🎨 Three themes, switch your mood instantly**: Bamboo (mint) / Iris (dreamy purple) / Starry Night (dark) — one tap in Settings, applied globally in real time, with the bottom poem changing to match
- **📖 Built-in user guide**: a complete illustrated tutorial anytime (what is this / which billing mode / reading the dashboard / status rules / decluttering / long-press menu / graceful farewell / backup & restore / FAQ / privacy), available offline
- **🛡️ Auto-backup, never lose a change**: every add/edit/delete leaves a timestamped backup (last 5), restorable anytime; manual export filenames are also timestamped
- **🏷️ Custom categories**: categories are no longer hard-coded — add / rename / delete, and deleting one automatically reassigns its items to another category
- **📤📥 Backup / restore**: one-tap export / import of JSON, so you don't lose data when switching devices (in the mini-program, files are sent/received through WeChat chats)

---

## 📱 Three Versions

One philosophy, three ways to open it. The data model is identical; only the runtime platform and storage differ.

### 1. Web App (single file, fully offline)

Zero dependencies, open-and-use web version; data stored in the browser **LocalStorage**.

```bash
cd light-living
python -m http.server 8123
# open http://127.0.0.1:8123/ in your browser
```

### 2. Android APK (native experience)

Packaged with Capacitor, official release **v1.3.0** is published. Download the APK from the [GitHub Release](https://github.com/MistStride/LightLiving/releases) and install.

> 💡 The APK is built and published automatically by GitHub Actions on every `v*` tag (see `.github/workflows/build-release-apk.yml`). To build locally: `node copy-web.js && npx cap sync android`, then open the `android/` project in Android Studio and run `./gradlew assembleRelease`.

### 3. WeChat Mini-Program · 物尽其轻

- **Name**: 物尽其轻
- **AppID**: `wx5389132842b00e33`
- **Project directory**: `miniprogram/`
- **Stack**: native WeChat mini-program framework (WXML / WXSS / JS), no backend; data stored in WeChat local `Storage` (`wx.getStorageSync`, single key ≤ 1MB / total ≤ 10MB), **not cross-device, not uploaded to any server**
- **How to run**: import the `miniprogram/` directory in "WeChat DevTools", fill in your AppID in `project.config.json` (or use your own test account), and compile to preview; upload / publish requires an admin to submit for review on the WeChat MP platform
- **Pages & structure**:
  - `pages/`: `index` companion ledger (home), `add` add/edit, `rules` status & relationship rules, `categories` category management, `settings` mine, `about` about, `guide` user guide, `backup` data backup & restore
  - `custom-tab-bar/` custom bottom navigation (companion ledger 🪶 / mine 👤, background gradient follows the theme, avoiding the native white bar)
  - `components/nav-bar/` custom navigation bar (transparent + status-bar placeholder, removing the night-mode white block at the top)
  - `utils/store.js` data layer (items / categories / status rules / cost calculation / auto-backup / import-export), `utils/theme.js` three theme tokens and poems

> ⚠️ Mini-program local storage is **not cross-device**: after switching phones, use "Data Backup & Restore" to export JSON to a WeChat chat, then import it on the new device to migrate.

---

## 🚀 Get Started in 3 Minutes

**Web / mobile browser**: start a local server following the "Web App" steps above, or upload `index.html` to any static host and open it directly.

**WeChat mini-program**: import `miniprogram/` in WeChat DevTools → compile → tap the ＋ at the bottom-right of the home page to record your first beloved item; if the library is empty on first entry, tap the empty-state "load sample items" to fill in 5 examples with one tap.

> Not sure where to start? Read the [User Guide](使用说明.md) first and learn to add your first item in 3 minutes.

---

## 🗂 Item Data Model

| Field | Description |
|-------|-------------|
| `id` | timestamp string |
| `name` | item name |
| `price` | purchase price |
| `purchaseDate` | acquisition date `YYYY-MM-DD` |
| `category` | custom category (default: Digital / Clothing & Bags / Home & Living / Personal Hobbies / Other) |
| `mode` | `day` (by days) / `count` (by uses) |
| `useCount` | check-in count (used in count mode) |
| `image` | cover: photo (Base64, auto-compressed to ≤1000px) or an emoji character; if empty and the name starts with an emoji, that emoji is used as the cover automatically |
| `note` | free-form note / mood story |
| `status` | `active` (in companionship) / `archived` (departed) |
| `farewellNote` | farewell note (required when archiving) |
| `archiveReason` | gift / discard / transfer |
| `lastCheckin` | most recent check-in date |

Web / Android data is stored in browser **LocalStorage**; the WeChat mini-program stores it in WeChat local **Storage**. Neither uploads to any server.

---

## 🧭 Technical Notes

**Web / Android**
- Pure native **HTML / CSS / JavaScript**, zero dependencies, instant load
- Storage: LocalStorage; packaged for Android via Capacitor
- Design system: soft purple `#8B5CF6` + soft blue `#93C5FD` dual tones, large 20–24px rounded corners, subtle shadows
- Target device: vivo S20 (with Safe Area adaptation)

**WeChat Mini-Program**
- Native WeChat mini-program framework (WXML / WXSS / JS), `app.json` global `navigationStyle: custom` + custom nav-bar / tab-bar components
- Storage: WeChat local `Storage` (`wx.getStorageSync` / `setStorageSync`)
- Three themes switched via CSS variables (`--primary` / `--surface` / `--hero-grad`, etc.), driven by the page root node `theme-{{theme}}`
- Export/import via `wx.shareFileMessage` (send file to chat) and `wx.chooseMessageFile` (pick file from chat)

> Possible future directions: port the Web app to React + Vite, add dark mode, monthly companionship-cost trend charts, a "use it fully" calendar; the mini-program could adopt WeChat Cloud Base for cross-device sync, etc.

---

## 📄 License

MIT — free to use, modify, and distribute.
