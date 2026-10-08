---
slug: "csv-to-qbo"
title: "CSV & Excel to QBO Converter"
metaTitle: "CSV to QBO Converter: CSV & Excel to QuickBooks | Finlyzers"
metaDescription: "Convert CSV and Excel (XLSX, XLS) bank transactions to a QBO Web Connect file and import them into QuickBooks Online or Desktop without column mapping."
intro: "Turn a CSV or Excel file of bank or card transactions into a QBO (Web Connect) file that QuickBooks Online and QuickBooks Desktop import directly, with no column mapping."
category: "tools"
bankName: "Spreadsheet"
statementLabel: "CSV or Excel File"
outputFormat: "QuickBooks QBO"
country: "Global"
badgeText: "CSV, XLSX & XLS to .qbo"
acceptsSpreadsheets: true
keywords:
  - "csv to qbo converter"
  - "convert csv to qbo"
  - "excel to qbo converter"
  - "convert excel to qbo"
  - "excel to quickbooks converter"
related:
  - "bank-statement-to-qbo"
  - "bank-statement-to-csv"
  - "credit-card-statement-to-excel"
  - "bank-statement-to-excel"
features:
  - title: "Spreadsheet In, Web Connect Out"
    description: "Upload a CSV or Excel export and get a .qbo file, instead of matching columns in QuickBooks' CSV importer on every upload."
  - title: "Works With QuickBooks Desktop"
    description: "QuickBooks Desktop brings bank transactions in as Web Connect files, so converting to QBO is how a spreadsheet gets into a Desktop bank register."
  - title: "Signed Amounts"
    description: "Money out is written as a negative amount and money in as a positive one, so each line lands on the correct side of the account."
  - title: "Review Before Download"
    description: "The transactions appear on screen first, so you can check dates and amounts before generating the file."
tableColumns:
  - "Date"
  - "Payee / Description"
  - "Amount"
  - "Type"
  - "Balance"
sampleData:
  - date: "09/03/2026"
    desc: "STRIPE PAYOUT"
    amount: "+$2,140.00"
    type: "Credit"
    balance: "$9,420.15"
  - date: "09/05/2026"
    desc: "ADOBE CREATIVE CLOUD"
    amount: "-$59.99"
    type: "Debit"
    balance: "$9,360.16"
  - date: "09/08/2026"
    desc: "OFFICE DEPOT #2291"
    amount: "-$212.48"
    type: "Debit"
    balance: "$9,147.68"
steps:
  - title: "Upload your CSV or Excel file"
    body: "Drop a .csv, .xlsx or .xls export from your bank, card provider or bookkeeping spreadsheet. Keep one account per file."
  - title: "Rows become QBO records"
    body: "Each row is written as a Web Connect transaction with a date, a signed amount and a payee name."
  - title: "Import into QuickBooks"
    body: "Upload the .qbo file in QuickBooks Online, or open it in QuickBooks Desktop, and choose the account to import into."
faqs:
  - question: "What columns does my spreadsheet need?"
    answer: "A date, a description and the amount, either as one signed amount column or as separate debit and credit columns. Remove logos, summary rows, subtotals and blank lines above the header row before uploading."
  - question: "Can I convert Excel to QBO, not just CSV?"
    answer: "Yes. The converter takes .xlsx and .xls workbooks as well as .csv files. If a workbook has several sheets, put the transactions you want on the first sheet."
  - question: "Why not upload the CSV straight into QuickBooks Online?"
    answer: "You can. QuickBooks Online accepts bank CSVs in a 3-column or 4-column layout, but you match the columns on each upload and the file is rejected if the layout is off. QuickBooks Desktop has no CSV bank import, so it needs a QBO file either way."
  - question: "Is the CSV to QBO converter free?"
    answer: "Small files convert free with no signup, within the same guest limits as statements. Larger files follow the pricing page, and a free account raises the limits."
  - question: "Will importing the file twice create duplicates?"
    answer: "It can. If two files cover overlapping dates, review the For review list in QuickBooks and exclude the duplicates before accepting them."
  - question: "My transactions are in a PDF statement, not a spreadsheet. What should I use?"
    answer: "Use the PDF to QBO converter for bank statements. It reads the PDF, checks the running balance and produces the same kind of QBO file."
---

# Convert CSV and Excel Files to QBO

Many banks and card providers let you export recent transactions as CSV or Excel, and many bookkeepers receive client transactions as spreadsheets. QuickBooks, though, works most smoothly with QBO (Web Connect) files, the format it expects from a bank download. This converter bridges the two: upload the spreadsheet, check the rows, and download a .qbo file.

## When a CSV to QBO Converter Helps

- **QuickBooks Desktop.** Desktop imports bank transactions as Web Connect files and has no CSV bank import, so a spreadsheet must become QBO first.
- **CSV uploads that keep failing.** QuickBooks Online is strict about the CSV layout. A QBO file avoids the column matching and the format errors.
- **Client spreadsheets.** Transactions that a client kept in Excel can be imported into the right bank or card account without retyping.
- **Accounts without a bank feed.** Some accounts only offer a CSV or Excel download, and a feed never connects.

## Preparing Your Spreadsheet

A clean file converts cleanly. Before uploading:

1. **Keep one header row** naming the columns, with transactions directly below it.
2. **Delete extra rows** such as bank logos, opening and closing balance lines, subtotals and page footers.
3. **Use one date format** throughout the date column.
4. **Keep amounts as plain numbers.** Either one signed amount column, or separate debit and credit columns.
5. **One account per file.** A QBO file imports into a single bank or card account.

## Importing the QBO File

### QuickBooks Online

1. Open **Transactions**, then **Bank transactions**.
2. Choose **Link account**, then **Upload from file**, and select the .qbo file.
3. Pick the QuickBooks account the transactions belong to.
4. Review the lines in **For review**, then categorise or match them.

### QuickBooks Desktop

1. Open your company file.
2. Choose **File**, then **Utilities**, then **Import**, then **Web Connect Files**.
3. Select the .qbo file and link it to an existing account.
4. Review the transactions in the Bank Feeds center.

## CSV Upload or QBO File?

A direct CSV upload to QuickBooks Online costs nothing extra and is fine for a one-off file that already matches the 3-column or 4-column layout. A QBO file is the better choice when you use QuickBooks Desktop, import regularly, or keep getting layout errors. The [guide to importing Excel into QuickBooks](/guides/import-excel-into-quickbooks) walks through both methods step by step.

## Other Starting Points

If the transactions are still in a PDF, use the [PDF to QBO converter for bank statements](/convert/bank-statement-to-qbo) instead; card statements work through the [credit card statement converter](/convert/credit-card-statement-to-excel). To review a PDF statement in a spreadsheet before importing, convert it to [Excel](/convert/bank-statement-to-excel) or [CSV](/convert/bank-statement-to-csv) first.
