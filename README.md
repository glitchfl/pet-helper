# PET Helper

A free, open-source iPhone and Android app for practicing the Verbal and Quantitative Domains of the Israeli Psychometric Entrance Test (PET), one Question at a time. The Questions come only from NITE's practice Exams that are approved for public use.

> השאלות הן מתוך נוסחי בחינות לדוגמה של המרכז הארצי לבחינות ולהערכה (מאל"ו), בעל זכויות היוצרים. השימוש בחומרים נעשה באחריות המשתמש בלבד, ומאל"ו אינו אחראי לדיוק או לנכונות של כל שינוי שייעשה או תוספת שתיעשה, אם תיעשה, כמו פתרונות או הסברים לשאלות.

## What it does

Free Practice (תרגול חופשי) serves one Domain at a time. Unseen Questions come first, then your Mistakes, then everything else. A Passage or Chart is always served together with all of its Questions. Tap an Option to see right away whether it was right and which Option is correct. Every Response stays on your phone, with no account and nothing sent anywhere.

The domain vocabulary is in [GLOSSARY.md](GLOSSARY.md) and the key decisions are in [docs/adr](docs/adr).

## Running it

```sh
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone.

```sh
npm test            # practice engine and bank check
npm run typecheck
```

## The Question Bank

Each Exam is a folder under `bank/` with an `exam.json` and an `images/` folder. The app loads every folder it finds, so adding an Exam is only a data change. `npm test` runs the Bank Check over every Exam and fails on broken structure before anything ships.

Rich text is Hebrew with math as inline LaTeX between `$` signs, e.g. `אם $x^2 = 9$ אז`. Write `\$` for a literal dollar sign.

Only Exams on NITE's public-use approved list may be added (see [ADR 0001](docs/adr/0001-only-nite-public-use-approved-exams.md)).

The bank holds the Autumn 2026 Exam.

### Extracting an Exam

The scripts in `scripts/extract` read an Exam PDF with PyMuPDF. The PDFs and the Proof Sheets stay out of the repo.

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

iPhone users open the app in Expo Go, so no paid Apple Developer account is involved. Android users install an APK built with EAS Build. Both get new Exams and fixes over the air from EAS Update on the `production` channel.

The update runtime is pinned to the Expo SDK (`runtimeVersion.policy: sdkVersion`), because that is the only runtime Expo Go accepts. Upgrading the Expo SDK therefore needs a new APK.

### One-time setup

```sh
npx eas-cli@latest login
npx eas-cli@latest init               # creates the Expo project and writes its id into app.json
npx eas-cli@latest update:configure   # writes updates.url into app.json
```

Commit the `app.json` changes these make.

### Building the Android APK

```sh
npx eas-cli@latest build -p android --profile apk
```

When the build finishes, open its page on expo.dev on the Android phone and install the APK. Android asks once to allow installs from that source.

### Publishing an update

```sh
npx eas-cli@latest update --channel production --environment production --message "added Summer 2025"
```

- **Android APK:** the app downloads the update the next time it launches and switches to it on the launch after that.
- **iPhone (Expo Go):** open the update in Expo Go by scanning the QR code from the update's page on expo.dev, or from `https://qr.expo.dev/eas-update?projectId=<project id>&runtimeVersion=exposdk:58.0.0&channel=production`.
