# Who We Build Warmy For

## 👉 [Open the page: olenab-byte.github.io/for-team](https://olenab-byte.github.io/for-team/)

Warmy's working customer journey map: four personas, where and why they churn, and what Marketing, Sales, Customer Success and Development can do about it. Anyone on the team can edit boxes, add ideas and add personas. English and Ukrainian.

Client names are anonymised (Company A, B…). Figures come from a small sample of 15 churned accounts and are not reliable yet.

## How saving works

The page is static (GitHub Pages). Edits are stored in a Google Sheet through a small Apps Script web app (`apps-script/Code.gs`). Its URL is set in `index.html` as `API_URL`. Until it is set, the page is read-only and shows the snapshot built into the file.

### Connect the sheet (one time)

1. Create a Google Sheet, then open **Extensions → Apps Script**.
2. Replace the code with `apps-script/Code.gs` and save.
3. **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and allow access.
4. Copy the web app URL (ends with `/exec`) and put it into `API_URL` in `index.html`.

On the first visit the page copies its built-in data into the sheet (tab `data`). After that, the sheet is the source of truth.

Anyone with the page link can edit. There is no login.
