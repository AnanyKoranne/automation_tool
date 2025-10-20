# Plena Assignment — Kaggle dataset fetcher

This project downloads a Kaggle dataset (US baby names) using Playwright, extracts the ZIP and parses the CSV.

Prerequisites
- Node 16+ recommended

Setup
1. Copy .env.example to .env and fill KAGGLE_EMAIL and KAGGLE_PASSWORD.
2. Install dependencies and Playwright browsers:
   npm install
   (postinstall will run `npx playwright install --with-deps` automatically)

Run
- Development (no build):
  npm run dev

- Build and run:
  npm run build
  npm start

Debugging
- To see browser actions, set PW_HEADLESS=false and SLOW_MO=100 in .env.
- If login fails, open the browser headful and inspect for 2FA or captcha.

What the script does
- Downloads the dataset ZIP from Kaggle and saves as ./data/dataset.zip
- Extracts the ZIP and finds the first .csv file and moves it to ./data/babyNames.csv
- Parses the CSV and prints a row count and sample rows

If you want more changes (tests, CI, packaging), tell me which ones.
