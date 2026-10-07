---
slug: "bank-statement-to-excel"
title: "Bank Statement to Excel Converter"
metaTitle: "Bank Statement to Excel Converter (XLSX) | Finlyzers"
metaDescription: "Convert a PDF or scanned bank statement to Excel. One row per transaction, separate debit and credit columns, balances checked. Free up to 10 pages."
intro: "Turn a PDF bank statement into an .xlsx workbook with one row per transaction and separate debit, credit and balance columns, ready for formulas, pivot tables and reconciliation."
category: "formats"
bankName: "Bank"
outputFormat: "Excel"
country: "Global"
badgeText: "Excel (.xlsx)"
keywords:
  - "bank statement to excel"
  - "convert bank statement pdf to excel"
  - "bank statement to xlsx"
  - "bank statement to google sheets"
related:
  - "chase-bank-statement-to-excel"
  - "bank-of-america-statement-to-excel"
  - "barclays-bank-statement-to-excel"
  - "scanned-pdf-ocr-to-excel"
features:
  - title: "Spreadsheet-Ready Columns"
    description: "Date, description, reference, debit, credit and balance each land in their own column instead of one merged text line."
  - title: "Amounts You Can Calculate With"
    description: "Currency symbols and thousands separators are stripped so SUM, SUMIFS and pivot tables work without cleanup."
  - title: "Balance Check Before Download"
    description: "Opening balance plus credits minus debits is compared with the closing balance, and rows that do not reconcile are flagged."
  - title: "Opens Anywhere"
    description: "The .xlsx file opens in Microsoft Excel, Google Sheets, Apple Numbers and LibreOffice Calc."
tableColumns:
  - "Date"
  - "Description"
  - "Reference"
  - "Debit"
  - "Credit"
  - "Balance"
sampleData:
  - date: "09/02/2026"
    desc: "ACH DEPOSIT - CLIENT INVOICE 1042"
    amount: "+$3,200.00"
    type: "Credit"
    balance: "$9,845.10"
  - date: "09/05/2026"
    desc: "CARD PURCHASE - OFFICE DEPOT #221"
    amount: "-$86.40"
    type: "Debit"
    balance: "$9,758.70"
  - date: "09/08/2026"
    desc: "ONLINE TRANSFER TO SAVINGS"
    amount: "-$1,000.00"
    type: "Debit"
    balance: "$8,758.70"
steps:
  - title: "Upload your bank statement"
    body: "Drop a digital PDF, a scanned copy or a phone photo of the statement. Password-protected PDFs are supported."
  - title: "Transactions are mapped to columns"
    body: "Each transaction becomes one spreadsheet row, and the running balance is recomputed against the statement's opening and closing balance."
  - title: "Download the .xlsx file"
    body: "Open the workbook in Excel or Google Sheets and start sorting, filtering and totalling straight away."
faqs:
  - question: "Can I open the converted file in Google Sheets?"
    answer: "Yes. Upload the .xlsx file to Google Drive and open it with Google Sheets, or use File, then Import, inside an existing sheet. Apple Numbers and LibreOffice Calc open it too."
  - question: "Why not just copy and paste from the PDF into Excel?"
    answer: "Copying from a PDF usually pastes each line as a single cell, splits wrapped descriptions across rows and turns amounts into text. The converter rebuilds the table so each value lands in the right column."
  - question: "Can I put several months of statements in one workbook?"
    answer: "Yes. Upload a multi-month PDF, or sign in and batch upload several statements and merge them into one workbook."
  - question: "What should I check after converting?"
    answer: "Compare the total of the Debit and Credit columns with the totals printed on the statement, and review any rows the balance check flagged. Our methodology page explains how the check works."
  - question: "What if my statement has no running balance column?"
    answer: "The transactions are still extracted, but the row-by-row balance check cannot run. Compare the column totals with the statement summary instead."
---

# What You Get in the Excel File

Copying a bank statement out of a PDF usually leaves you with merged columns, descriptions split across several rows and amounts Excel treats as text. Finlyzers rebuilds the transaction table, so the workbook you download is ready to sort, filter and total.

- **One row per transaction**, even when the description wraps across two or three lines in the PDF.
- **Separate Debit and Credit columns**, so withdrawals and deposits never share a column.
- **Running balance** carried into its own column wherever the statement prints one.
- **Reference numbers** such as check or transaction IDs kept in a separate column when the statement shows them.
- **Plain numeric amounts** with currency symbols removed, so formulas work immediately.

## Working With Bank Data in Excel

Once the statement is a spreadsheet, a few standard techniques cover most bookkeeping and analysis tasks:

1. **Totals by month or category.** Add a Month column with `=TEXT(A2,"yyyy-mm")` and summarise it with a pivot table, or use `SUMIFS` on the Debit column.
2. **Find a transaction fast.** Turn the range into a table (Ctrl+T) and filter the Description column by payee name.
3. **Reconcile against your books.** Put the converted statement next to your ledger and use `XLOOKUP` or `MATCH` on amount and date to spot entries that appear in only one of them.
4. **Prepare tax figures.** Filter deductible payees, then total the Debit column for the year.

## Checking the Conversion

Every statement is self-checking: each running balance should equal the previous balance plus credits minus debits. Finlyzers recomputes that chain and flags any row where it breaks, which usually points to a missed line or a misread digit. Before relying on the file for tax, lending or audit work, confirm that the opening and closing balances match the statement. The [methodology page](/editorial-policy) explains the check in more detail.

## Excel or Another Format?

Choose Excel when you want to analyse, annotate or share the data as a spreadsheet. If you are importing into software, a dedicated format is usually simpler: [CSV](/convert/bank-statement-to-csv) for general imports and scripts, [QBO](/convert/bank-statement-to-qbo) for QuickBooks, [OFX](/convert/bank-statement-to-ofx) for Xero and similar apps, or [QIF](/convert/bank-statement-to-qif) for Quicken. Scanned paper statements go through [OCR](/convert/scanned-pdf-ocr-to-excel) first and come out in the same layout.

Statements from most banks work with this converter. Some banks have their own guides covering layout details, for example [Chase](/convert/chase-bank-statement-to-excel), [Bank of America](/convert/bank-of-america-statement-to-excel), [Wells Fargo](/convert/wells-fargo-bank-statement-to-excel), [Barclays](/convert/barclays-bank-statement-to-excel) and [HDFC](/convert/hdfc-bank-statement-to-excel).
