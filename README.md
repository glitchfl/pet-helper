# PET Helper

A free, open-source iPhone and Android app for practicing the Verbal and Quantitative Domains of the Israeli Psychometric Entrance Test (PET), one Question at a time. The Questions come only from NITE's practice Exams that are approved for public use.

> השאלות הן מתוך נוסחי בחינות לדוגמה של המרכז הארצי לבחינות ולהערכה (מאל"ו), בעל זכויות היוצרים. השימוש בחומרים נעשה באחריות המשתמש בלבד, ומאל"ו אינו אחראי לדיוק או לנכונות של כל שינוי שייעשה או תוספת שתיעשה, אם תיעשה, כמו פתרונות או הסברים לשאלות.

## What it does

Free Practice (תרגול חופשי) serves one Domain at a time. Unseen Questions come first, then your Mistakes, then everything else. A Passage or Chart is always served together with all of its Questions. Tap an Option to see right away whether it was right and which Option is correct. Every Response stays on your phone, with no account and nothing sent anywhere.

The domain vocabulary is in [GLOSSARY.md](GLOSSARY.md) and the key decisions are in [docs/adr](docs/adr).

## Running it

```sh
npm install
npm run ios         # builds the app into the iPhone simulator and starts Metro
npm run android     # the same on the Android emulator
```

The app doesn't run in Expo Go (see [ADR 0005](docs/adr/0005-installed-builds-instead-of-expo-go.md)). The first run compiles the native app, which takes a few minutes. After that, `npm start` with the app already installed is enough, until a native module is added. The `ios/` and `android/` folders are generated from `app.json` and stay out of git.

```sh
npm test            # practice engine and bank check
npm run typecheck
```

## The Question Bank

Each Exam is a folder under `bank/` with an `exam.json` and an `images/` folder. The app loads every folder it finds, so adding an Exam is only a data change. `npm test` runs the Bank Check over every Exam and fails on broken structure before anything ships.

Rich text is Hebrew with math as inline LaTeX between `$` signs, e.g. `אם $x^2 = 9$ אז`. Write `\$` for a literal dollar sign.

Only Exams on NITE's public-use approved list may be added (see [ADR 0001](docs/adr/0001-only-nite-public-use-approved-exams.md)).

The bank holds the Winter 2025, Spring 2025, Summer 2025, Autumn 2025 and Autumn 2026 Exams.

### Extracting an Exam

The scripts in `scripts/extract` read an Exam PDF with PyMuPDF. The PDFs stay out of the repo. The Proof Sheets are committed under `proof/`.

```sh
python3 -m venv .venv && .venv/bin/pip install -r scripts/extract/requirements.txt
.venv/bin/python scripts/extract/extract.py inspect exam.pdf                      # re-check Sections, Question counts, Answer Key
.venv/bin/python scripts/extract/extract.py verbal exam.pdf --exam autumn-2026    # writes bank/autumn-2026/exam.json
.venv/bin/python scripts/extract/extract.py pages exam.pdf --exam autumn-2026 --pages 22 24   # grid renders for reading off crop rectangles
.venv/bin/python scripts/extract/extract.py crop exam.pdf --exam autumn-2026      # cuts what scripts/extract/crops/autumn-2026.json lists
.venv/bin/python scripts/extract/extract.py quant exam.pdf --exam autumn-2026     # Quantitative draft that points at those crops
.venv/bin/python scripts/extract/extract.py apply --exam autumn-2026 --retyped retyped.json   # puts the retyped LaTeX and Topics in
.venv/bin/python scripts/extract/extract.py proof exam.pdf --exam autumn-2026     # proof/autumn-2026/index.html
```

`verbal` rebuilds the text from glyph positions, which fixes the flipped brackets and moved punctuation of the PDF's text layer. It also puts back the fill-in blanks as `____`. Vowel marks still need a look against the page, because the PDF orders them inconsistently. `verbal` refuses to overwrite Sections that already exist, since they may hold fixes made by hand.

The Quantitative PDF text is never trusted for math. The `quant` draft holds the raw text only as a reference, and every stem and Option is retyped as LaTeX from the rendered page, with a Topic for each Question. Figures, Charts, image Options and the Formula Sheet are cropped at 288 dpi in grayscale. The pale watermark is whitened out, and the app draws NITE's markings on the card instead. A crop's `blank` list paints over stray text inside its rectangle.

Skim the Proof Sheet once per Exam before shipping it.

## Installing and updating

Each phone runs its own installed build of the app, with no paid Apple Developer account involved. Both get new Exams and fixes over the air from EAS Update on the `production` channel.

The update runtime is the native fingerprint (`runtimeVersion.policy: fingerprint`), so an update only reaches builds with the same native code. After adding or upgrading a native module or the Expo SDK, install new builds on both phones. `fingerprint.config.js` keeps the npm scripts and `.gitignore` out of the fingerprint, since they never reach the native build.

### One-time setup

```sh
npx eas-cli@latest login
npx eas-cli@latest init               # creates the Expo project and writes its id into app.json
npx eas-cli@latest update:configure   # writes updates.url into app.json
```

Commit the `app.json` changes these make.

### Installing on the iPhone

The iPhone build is compiled on the Mac and signed with the free Personal Team of the Apple ID signed in to Xcode (Xcode > Settings > Accounts). Its team id is `ios.appleTeamId` in `app.json`. Without a signed-in account the build stops with "No Accounts".

Xcode has to be at least as new as the iPhone's iOS, e.g. Xcode 27 for iOS 27. An older Xcode stops with "The developer disk image could not be mounted on this device".

1. Connect the iPhone to the Mac with a cable. After the first time, being on the same Wi-Fi is enough. Developer Mode must be on (Settings > Privacy & Security > Developer Mode).
2. Run `npm run ios:device` and pick the iPhone.
3. The first time only, trust the certificate on the iPhone: Settings > General > VPN & Device Management > Apple Development.

A free signature expires after 7 days, and then the app won't open. Run `npm run ios:device` again. Reinstalling keeps all progress.

### Building the Android APK

```sh
npx eas-cli@latest build -p android --profile apk
```

When the build finishes, download the APK from its page on expo.dev and send the file to the Android phone. Android asks once to allow installs from that source. EAS signs every APK with the same key, so a new one installs over the old one and keeps all progress.

### Publishing an update

```sh
npx eas-cli@latest update --channel production --environment production --message "added Summer 2025"
```

On both phones the app downloads the update the next time it launches and switches to it on the launch after that.
