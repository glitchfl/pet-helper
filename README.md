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

Only Exams on NITE's public-use approved list may be added (see [ADR 0001](docs/adr/0001-only-nite-public-use-approved-exams.md)). The `sample-summer-2026` Exam is hand-written sample content for development, not NITE material.
