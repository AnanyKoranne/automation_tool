# Plena Assignment — Kaggle to HubSpot Data Pipeline

This project automates the process of downloading a Kaggle dataset using Playwright (headless Chrome in Node.js), extracting baby name data, storing it in a MySQL database, and pushing it to HubSpot as Contacts.

---

## 🧾 Scope of Assignment

Build a system to:

1. **Login to Kaggle** using email and password.
2. **Download the dataset**: [US Baby Names by Year of Birth (CSV)](https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv)
3. **Extract and store data** in a MySQL database using Sequelize ORM.
4. **Send the data to HubSpot CRM** using their API, stored as Contacts.

---

## 🛠️ Tech Stack

* Node.js
* TypeScript
* Playwright (headless browser automation)
* Sequelize ORM
* MySQL
* HubSpot API

---

## ⚙️ Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root with the following variables:

```env
KAGGLE_EMAIL=your_email@example.com
KAGGLE_PASSWORD=your_password
PW_HEADLESS=false
SLOW_MO=100
HUBSPOT_API_KEY=your_hubspot_api_key
```

### 2. Install Dependencies

```bash
npm install
```

> This will also run `npx playwright install --with-deps` post-install.

---

## 🚀 Run the Project

### Development Mode (no build):

```bash
npm run dev
```

### Build and Run:

```bash
npm run build
npm start
```

---

## 🔍 Debugging Tips

* Set `PW_HEADLESS=false` to run Playwright with a visible browser.
* Use `SLOW_MO=100` to slow down browser actions for visibility.
* If login fails, manually inspect the page to check for captcha or 2FA.

---

## 📦 What the Script Does

* Logs into Kaggle using headless Chrome (Playwright)
* Navigates to the dataset and downloads the CSV
* Extracts baby name data from the CSV
* Stores records in MySQL DB via Sequelize ORM

  * Extracted fields: **Name**, **Sex**
* Sends records to HubSpot via API as Contacts

---

## 🔗 Useful Links

* [Playwright Documentation](https://playwright.dev/)
* [HubSpot CRM API Docs](https://developers.hubspot.com/docs/api/crm/contacts)
