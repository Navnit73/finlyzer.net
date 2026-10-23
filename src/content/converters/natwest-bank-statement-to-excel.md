---
slug: "natwest-bank-statement-to-excel"
title: "NatWest Bank Statement to Excel Converter"
metaTitle: "NatWest Bank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert NatWest personal and business statement PDFs to Excel, CSV or OFX. Paid in and withdrawn kept separate, UK dates handled. Free up to 10 pages."
intro: "Convert NatWest current account, savings and business statement PDFs into Excel or CSV, with paid in and withdrawn amounts in separate columns and a running balance check through the statement."
category: "uk-banks"
bankName: "NatWest"
statementLabel: "NatWest Bank Statement"
outputFormat: "Excel"
country: "United Kingdom"
badgeText: "UK · NatWest statements"
dateModified: "2026-10-23"
keywords:
  - "natwest bank statement to excel"
  - "natwest statement to csv"
  - "convert natwest pdf statement"
  - "natwest business statement to excel"
related:
  - "bank-statement-to-ofx"
  - "santander-bank-statement-to-excel"
  - "bank-statement-to-csv"
  - "credit-card-statement-to-excel"
features:
  - title: "Paid In and Withdrawn"
    description: "NatWest's paid in and withdrawn amounts become separate numeric Credit and Debit columns, ready for totals and pivot tables."
  - title: "Backfill Your Bank Feed"
    description: "Download OFX for the months before your FreeAgent, Xero or QuickBooks bank feed started."
  - title: "Brought Forward Lines Excluded"
    description: "Balances repeated at page breaks are kept out of the transaction list, and the running balance check would flag one that slipped in."
  - title: "UK Dates and GBP Amounts"
    description: "Dates are read day-month, and pound signs and thousands separators are removed so amounts add up correctly."
tableColumns:
  - "Date"
  - "Description"
  - "Paid In"
  - "Withdrawn"
  - "Balance"
sampleData:
  - date: "01/10/2026"
    desc: "BAC EXAMPLE CLIENT LTD INV 1043"
    amount: "£1,200.00"
    type: "Credit"
    balance: "£5,640.10"
  - date: "02/10/2026"
    desc: "D/D EXAMPLE ENERGY SUPPLIER"
    amount: "£96.40"
    type: "Debit"
    balance: "£5,543.70"
  - date: "03/10/2026"
    desc: "S/O OFFICE RENT EXAMPLE PROPERTIES"
    amount: "£1,050.00"
    type: "Debit"
    balance: "£4,493.70"
steps:
  - title: "Get the PDF from NatWest"
    body: "In NatWest Online Banking or the NatWest app, open the account and go to its statements. Download the period you need as a PDF."
  - title: "Upload it here"
    body: "Paid in and withdrawn amounts are separated, UK dates are read correctly and the running balance is checked from page to page."
  - title: "Download Excel, CSV or OFX"
    body: "Keep the spreadsheet, or import OFX or CSV into FreeAgent, Xero, QuickBooks or Sage."
faqs:
  - question: "Where do I find NatWest statements?"
    answer: "Sign in to NatWest Online Banking or the NatWest app, choose the account and open its statements. Select the month and download the PDF. Menu names can differ between personal and business banking."
  - question: "I already have a bank feed. Why convert a PDF?"
    answer: "Bank feeds bring in transactions from the point they are connected. If you started using accounting software part-way through the year, or need an earlier year, converting the statement PDFs fills the gap. Check the dates the feed already covers so you do not import transactions twice."
  - question: "Can I import a NatWest statement into FreeAgent?"
    answer: "Yes. Download the OFX file from the same upload and use FreeAgent's bank statement upload for the matching account. CSV also works if you would rather map the columns yourself."
  - question: "Does it work with NatWest business statements?"
    answer: "Yes. Business current account statements are converted the same way, and multi-page statements are processed in a single upload."
  - question: "What about Royal Bank of Scotland or Ulster Bank statements?"
    answer: "Both are part of NatWest Group and their statements often look similar to NatWest's. You can upload them here, but check the columns in your download, as layouts can differ."
---

# Converting NatWest Statements to Excel

NatWest statements usually describe money arriving as **Paid in** and money leaving as **Withdrawn**, with a running **Balance** alongside. The layout is easy to follow on paper, but copying it into a spreadsheet tends to put both kinds of amount into one column, and US-style defaults can turn 02/10 into 10 February. Finlyzers keeps paid in and withdrawn apart and reads every date the UK way.

## What a NatWest Statement Usually Contains

- **Account details:** account name, sort code, account number and statement period.
- **Summary:** typically the previous balance, total paid in, total withdrawn and the new balance.
- **Transactions:** columns usually labelled **Date**, **Description**, **Paid in**, **Withdrawn** and **Balance**.
- **Page breaks:** longer statements repeat a brought forward balance at the top of each page. These are balances rather than transactions, so they are excluded from the list.

Royal Bank of Scotland and Ulster Bank are part of the same group, and their statements often share much of this structure.

## Reading NatWest Descriptions

NatWest descriptions typically name the payee and, depending on the statement and the payment, show how the payment was made. In NatWest's own transaction downloads the payment type is often abbreviated, for example `D/D` for a direct debit, `S/O` for a standing order, `BAC` for an automated credit such as a salary or customer payment, and `POS` for a card purchase. Whatever wording appears on your statement is kept in the description column, so you can filter on it in Excel.

## Bank Feeds, FreeAgent and the Months Before

FreeAgent is part of NatWest Group, and eligible NatWest business customers can often use it as part of their banking. Like Xero and QuickBooks, it usually brings transactions in through a bank feed from the date the feed is connected.

That leaves a gap if you:

- switched to accounting software part-way through the financial year;
- need to rebuild records for an earlier year for your accountant;
- are catching up on Self Assessment, or bringing records into Making Tax Digital compatible software;
- have an older or closed account that was never connected.

Converting the statement PDFs fills that gap. Download [OFX](/convert/bank-statement-to-ofx) for FreeAgent, Xero or QuickBooks, or [CSV](/convert/bank-statement-to-csv) for Sage and other tools that ask you to map columns. Before importing, check which dates the feed already covers so that no transaction is imported twice.

## NatWest Downloads Versus Statement PDFs

NatWest Online Banking usually lets you download recent transactions as a file. That is quick for your own open account, but the statement PDF is still what you will work from when the period is older than the download covers, when the account is closed, or when someone has emailed you their statements.

A statement also covers a fixed period with an opening and closing balance, which makes it a natural unit for month-end or year-end work. Converting a year of monthly NatWest statements gives you twelve files whose balances should chain together, so a missing month or an unexpected gap is easy to see when you line them up in one workbook.

## Mortgage Brokers and Lenders

Mortgage and loan applications commonly ask for recent statements as PDFs. If you are a broker or adviser receiving NatWest statements from a client, converting them to Excel lets you total income, list regular commitments such as direct debits and standing orders, and spot anything that needs explaining before the application goes in. Applicants can do the same to check their own figures first.

## Other Banks and Statement Types

For other UK banks, see the [Santander](/convert/santander-bank-statement-to-excel) and [Lloyds](/convert/lloyds-bank-statement-to-excel) converter pages. Converting a NatWest credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements that have been scanned or photographed, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
