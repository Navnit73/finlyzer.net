---
slug: "import-excel-into-quickbooks"
title: "How to Import Excel and CSV Transactions into QuickBooks"
shortTitle: "Import Excel into QuickBooks"
metaTitle: "Import Excel into QuickBooks Online & Desktop | Finlyzers"
metaDescription: "Step-by-step: format an Excel or CSV file of bank transactions, upload it to QuickBooks Online, or convert it to a QBO file for QuickBooks Desktop. Common errors fixed."
intro: "Get bank and card transactions from a spreadsheet into QuickBooks Online or Desktop. Upload your file here for a QBO file that imports without column mapping, or follow the manual CSV steps below."
badgeText: "Step-by-step guide"
ctaLabel: "Choose CSV, Excel or PDF"
datePublished: "2026-10-08"
dateModified: "2026-10-08"
acceptsSpreadsheets: true
keywords:
  - "import excel into quickbooks"
  - "upload excel to quickbooks"
  - "import excel into quickbooks online"
  - "import excel into quickbooks desktop"
  - "excel to qbo"
related:
  - "csv-to-qbo"
  - "bank-statement-to-qbo"
  - "bank-statement-to-csv"
  - "credit-card-statement-to-excel"
faqs:
  - question: "Can I import an Excel file directly into QuickBooks Online?"
    answer: "For bank transactions, the reliable route is to save the worksheet as a CSV file and upload that, or convert it to a QBO file. Both are covered in this guide."
  - question: 'Is "Excel to QBO" the same as Excel to QuickBooks Online?'
    answer: "People use it for both. QBO is short for QuickBooks Online, and .qbo is also the Web Connect file format QuickBooks imports bank transactions from. Converting Excel to a .qbo file works for both QuickBooks Online and Desktop."
  - question: "How do I import Excel into QuickBooks Desktop?"
    answer: "Desktop brings bank transactions in as Web Connect (.qbo) files. Convert the spreadsheet to QBO, then choose File, Utilities, Import, Web Connect Files. Desktop's Excel import is built for lists such as customers, vendors and items, not bank transactions."
  - question: "What CSV layout does QuickBooks Online accept?"
    answer: "A 3-column layout (Date, Description, Amount, with money out as negative numbers) or a 4-column layout (Date, Description, Credit, Debit). Keep a single header row and one date format."
  - question: "Can I import invoices, bills or journal entries this way?"
    answer: "No. This guide covers bank and credit card transactions. QuickBooks has separate import tools for invoices, bills, journal entries and lists; in QuickBooks Online they are under Settings, then Import data."
  - question: "Why did some transactions import twice?"
    answer: "The file overlapped a period already in QuickBooks. Start each import the day after your last reconciled date, and exclude duplicates in the For review list before accepting them."
---

# Two Ways to Get a Spreadsheet Into QuickBooks

"Excel to QBO" can mean two things. QBO is short for **QuickBooks Online**, and **.qbo** is also the Web Connect file format QuickBooks uses for bank downloads. Whichever you meant, there are two practical routes for bank and card transactions:

1. **Upload a CSV to QuickBooks Online.** Free and built in, but the file must follow QuickBooks' layout and you match columns on every upload. QuickBooks Desktop has no equivalent.
2. **Convert the spreadsheet to a .qbo file.** Works in both QuickBooks Online and Desktop, with no column matching. The uploader above does this.

## Which Method Fits

- **One-off file, QuickBooks Online, already tidy:** upload the CSV directly (Method 1).
- **QuickBooks Desktop:** convert to QBO (Method 2). Desktop imports bank transactions only as Web Connect files.
- **Regular imports or repeated layout errors:** convert to QBO and skip the mapping.
- **Transactions still in a PDF statement:** convert the PDF instead; see the last section.

## Method 1: Upload a CSV to QuickBooks Online

### Format the Spreadsheet

QuickBooks Online accepts two CSV layouts for bank transactions:

- **3 columns:** Date, Description, Amount. Money out must be negative and money in positive.
- **4 columns:** Date, Description, Credit, Debit. Money in goes in Credit and money out in Debit.

Then tidy the sheet:

1. Keep **one header row** directly above the transactions.
2. Delete logos, account details, opening and closing balance lines, subtotals and blank rows.
3. Use **one date format** for every row, for example MM/DD/YYYY.
4. Keep amounts as **plain numbers**, without currency symbols or text.
5. In Excel, choose **File**, then **Save As**, and pick **CSV UTF-8**.

### Upload the CSV

1. In QuickBooks Online, open **Transactions**, then **Bank transactions**.
2. Choose **Link account**, then **Upload from file**, and select the CSV.
3. Pick the QuickBooks account the transactions belong to.
4. Match the date, description and amount (or credit and debit) columns, and confirm the date format.
5. Select the transactions to import, then review them in **For review**.

## Method 2: Convert Excel or CSV to a QBO File

Upload the .csv, .xlsx or .xls file in the converter at the top of this page, or use the dedicated [CSV and Excel to QBO converter](/convert/csv-to-qbo). Check the transactions on screen, download the .qbo file, then import it:

- **QuickBooks Online:** Transactions, Bank transactions, Link account, Upload from file, then choose the .qbo file and the account.
- **QuickBooks Desktop:** File, Utilities, Import, Web Connect Files, then link the file to the bank or card account.

Because a QBO file carries signed amounts, dates and payee names in a fixed structure, QuickBooks does not ask you to match columns.

## Importing Excel Into QuickBooks Desktop

QuickBooks Desktop does not import bank transactions from Excel or CSV. Its Excel import is designed for lists such as customers, vendors and items. To get spreadsheet transactions into a Desktop bank or credit card register, convert the file to a Web Connect (.qbo) file as in Method 2, then review the transactions in the Bank Feeds center.

## If Your Transactions Are Still in a PDF

Exporting a statement to Excel just to import it into QuickBooks adds a step. Convert the PDF statement straight to a QuickBooks file with the [PDF to QBO converter](/convert/bank-statement-to-qbo). If you want to review the data in a spreadsheet first, convert the statement to [Excel](/convert/bank-statement-to-excel) or [CSV](/convert/bank-statement-to-csv). Paper statements can be [scanned and read with OCR](/convert/scanned-pdf-ocr-to-excel), and card statements have a [credit card statement converter](/convert/credit-card-statement-to-excel).

## Common Import Errors and Fixes

- **Dates rejected or imported wrongly.** The column mixes date formats, or Excel stored some dates as text. Reformat the whole column to one date format and save again.
- **Amounts on the wrong side.** In a 3-column file, money out must be negative. In a 4-column file, check that the Credit and Debit columns are not swapped.
- **File not accepted.** Extra rows above the header, merged cells or a workbook saved as .xlsx instead of CSV. Remove the extras and save as CSV UTF-8.
- **Duplicate transactions.** The file overlaps dates already in QuickBooks. Exclude the duplicates in For review.
- **Balance does not match the statement.** A row is missing or mistyped. Compare the imported total with the statement and run QuickBooks' Reconcile tool.

## After the Import

Imported transactions wait in **For review**. Match them to existing entries or categorise them, then reconcile the account against the statement's closing balance so you know nothing was missed.
