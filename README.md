# EVision — EV Market Performance & Insights

A responsive electric-vehicle analytics website made with HTML, CSS, JavaScript, Chart.js and SheetJS.

## What's included

- `index.html` — website structure and dashboard sections
- `styles.css` — responsive styling
- `app.js` — Excel import, column detection, filters, KPIs, charts and table preview

## 1. Open in VS Code

1. Download and extract `ev-market-insights-website.zip`.
2. Open Visual Studio Code.
3. Select **File → Open Folder**.
4. Choose the extracted `ev-market-insights-website` folder.
5. Open `index.html` in a browser.

Recommended: install the VS Code extension **Live Server**. Right-click `index.html` and select **Open with Live Server**.

## 2. Load your Excel dataset

1. Open the website.
2. Click **Upload dataset**.
3. Select your `.xlsx`, `.xls` or `.csv` file.
4. The website reads the **first worksheet** and builds the charts from recognised columns.

The workbook is processed locally in the browser. It is not uploaded to a server by this code.

### Column names

The app tries to recognise common names and variations. These are the most useful fields:

| Dashboard feature | Example Excel column names |
|---|---|
| Sales | Annual Sales Units, Sales Units, EV Sales |
| Price | Average Vehicle Price, Vehicle Price |
| Range | Average Vehicle Range, Driving Range |
| CO2 | CO2 Saved, CO2 Savings |
| Category | Category, Vehicle Category |
| Country | Country, Region, Market Region |
| Retained value | Retained Value, Avg Retained Value |
| Year | Model Year, Year |
| Battery | Battery Type, Battery Technology |
| Capacity | Battery Capacity, Capacity kWh |
| Cycle life | Battery Cycle Life, Cycle Life |

If a field is not recognised, the related chart or KPI will remain blank. Rename the matching Excel header to one of the example names above and upload again. For best results, keep one record per row and use numeric values in metric columns.

## 3. Run locally

You can open `index.html` directly, but Live Server is recommended:
- Install **Live Server** in VS Code.
- Right-click `index.html`.
- Choose **Open with Live Server**.

Internet access is needed to load the Chart.js, SheetJS and Google Fonts CDN resources.

## 4. Host it online for free with GitHub Pages

1. Create or sign in to a GitHub account.
2. Create a new **Public** repository, for example `ev-market-insights`.
3. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch **main** and folder **/(root)**, then click **Save**.
7. Wait for GitHub Pages to publish. Your website address will appear in the Pages section.

Whenever you update the code, commit and push the changes to GitHub; Pages will publish the updated website.

## 5. Important notes

- The website does not contain your private Excel data. Visitors can upload their own workbook in their browser.
- Do not commit confidential or personal data to a public GitHub repository.
- Chart values are calculated from the uploaded worksheet. The app does not invent missing values.
- The app currently reads the first worksheet only.
- The column auto-detection is best-effort. Your exact Excel headers may need small adjustments in `app.js`.
