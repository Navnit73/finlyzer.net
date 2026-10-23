---
slug: "hsbc-bank-statement-to-excel"
title: "HSBC Bank Statement to Excel Converter"
metaTitle: "HSBC Bank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert HSBC UK personal and business statement PDFs to Excel or CSV. Paid out and Paid in kept separate, UK dates read correctly. Free up to 10 pages."
intro: "Convert HSBC UK current account and business statement PDFs into Excel or CSV, with Paid out and Paid in kept as separate numeric columns and day-month dates read the UK way."
category: "uk-banks"
bankName: "HSBC"
statementLabel: "HSBC Bank Statement"
outputFormat: "Excel"
country: "United Kingdom"
badgeText: "UK · HSBC statements"
dateModified: "2026-10-23"
keywords:
  - "hsbc bank statement to excel"
  - "hsbc statement to csv"
  - "convert hsbc pdf statement"
  - "hsbc business statement to excel"
  - "hsbc uk statement to excel"
related:
  - "bank-statement-to-ofx"
  - "bank-statement-to-csv"
  - "lloyds-bank-statement-to-excel"
  - "credit-card-statement-to-excel"
features:
  - title: "Paid Out and Paid In Split"
    description: "HSBC's Paid out and Paid in columns become separate numeric Debit and Credit columns that you can total straight away."
  - title: "Payment Type Codes Kept"
    description: "Short codes such as VIS, DD, SO, BP and CR stay at the start of each description, so card spending and bills are easy to filter."
  - title: "Long Business Statements"
    description: "Multi-page HSBC business statements are processed in one upload, with brought forward and carried forward lines left out of the transactions."
  - title: "Password-Protected PDFs"
    description: "If your HSBC statement PDF is password protected, you can still upload it and convert it."
tableColumns:
  - "Date"
  - "Payment Type and Details"
  - "Paid Out"
  - "Paid In"
  - "Balance"
sampleData:
  - date: "03/09/2026"
    desc: "CR ACME TRADING LTD PAYROLL"
    amount: "£2,980.00"
    type: "Credit"
    balance: "£4,215.60"
  - date: "04/09/2026"
    desc: "DD EXAMPLE WATER SERVICES"
    amount: "£42.75"
    type: "Debit"
    balance: "£4,172.85"
  - date: "04/09/2026"
    desc: "VIS EXAMPLE SUPERMARKET 2741"
    amount: "£36.18"
    type: "Debit"
    balance: "£4,136.67"
steps:
  - title: "Save the PDF from HSBC"
    body: "In HSBC UK Online Banking or the HSBC UK app, open the account and go to its statements. Choose the period and save the PDF. Menus for business accounts can look different."
  - title: "Upload it here"
    body: "Paid out and Paid in are read into separate columns, dates stay in UK day-month order and the running balance is checked."
  - title: "Download Excel, CSV or OFX"
    body: "Open the spreadsheet in Excel, or take the CSV or OFX file into Xero, FreeAgent, QuickBooks or Sage."
faqs:
  - question: "Where do I find my HSBC UK statements?"
    answer: "Sign in to HSBC UK Online Banking or the HSBC UK app, select the account and open its statements section. Pick the month you need and save it as a PDF. Menu names can differ between personal and business banking."
  - question: "HSBC lets me download transactions. Why convert the PDF?"
    answer: "Online banking downloads are handy for recent activity on an open account. For older months, a closed account or statements a client has sent you, the PDF is often all you have, and it is the document the bank issued for that period."
  - question: "Does it work with HSBC business account statements?"
    answer: "Yes. Business statements with dates, payment details, Paid out, Paid in and Balance columns are converted the same way, and multi-page statements are handled in one upload."
  - question: "Can I convert HSBC statements from outside the UK?"
    answer: "English-language HSBC statements from other countries can be uploaded too. Layouts, currencies and date order vary by country, so check the dates in your file before importing it into accounting software."
  - question: "What about HSBC credit card statements?"
    answer: "Use the credit card converter, which is set up for card statements with purchases and payments in separate columns."
---

# Converting HSBC Statements to Excel

HSBC UK statements are clear to read but awkward to reuse. Transactions sit under **Paid out** and **Paid in** columns, the payment type is a short code at the start of each line, and on many statements the date and the balance are not printed on every row. Copying a page into Excel usually leaves you with amounts in the wrong column, blank dates and a balance column full of gaps. Finlyzers reads the statement as a table and gives you clean, separate columns to work with.

## What an HSBC UK Statement Usually Shows

- **Account summary:** sort code, account number, statement period, opening balance, totals paid out and paid in, and the closing balance.
- **Transaction table:** columns typically labelled **Date**, **Payment type and details**, **Paid out**, **Paid in** and **Balance**.
- **Grouped days:** when several transactions happen on the same day, the date is often printed once against the first of them, and the balance only after the last one.
- **Balance lines:** pages usually open with a balance brought forward and close with a balance carried forward. These are balances, not transactions, so they are left out of the transaction list.

In the spreadsheet, each transaction sits on its own row with its own date, so sorting, filtering and pivot tables behave as you would expect.

## HSBC Payment Type Codes

The first part of each description tells you how the money moved. Common examples include:

- `VIS` for Visa debit card payments, and `)))` for contactless card payments.
- `BP` for bill payments and transfers you set up in online banking.
- `CR` for money received, such as salary or a customer payment.
- `DD` and `SO` for direct debits and standing orders.
- `ATM` for cash withdrawals and `CHQ` for cheques.

These codes stay with the description, so a filter on `VIS` or `)))` shows card spending, while `DD` and `SO` show your regular commitments.

## When You Need the PDF Rather Than a Download

HSBC UK online banking usually lets you download recent transactions as a file. That covers the last few weeks on your own account, but it does not help in some common situations:

- **Older periods.** Past months are generally kept as statement PDFs, and transaction downloads may not reach back far enough.
- **Client records.** Accountants and bookkeepers are often sent a year of HSBC PDFs by a client rather than given access to online banking.
- **Lender and agent requests.** A mortgage lender or letting agent may ask for statements, and you may want the same figures in a spreadsheet to check what they will see.
- **Closed accounts.** Once an account is closed, its old statements may be the only record you have.

## Using the Output With UK Accounting Software

- **Excel or CSV** for working papers, Self Assessment figures or a landlord's schedule of rent received and expenses paid.
- **OFX** for Xero, FreeAgent or QuickBooks, so transactions can be matched during bank reconciliation. See [bank statement to OFX](/convert/bank-statement-to-ofx).
- **CSV** for Sage or any tool that asks you to map the columns yourself. See [bank statement to CSV](/convert/bank-statement-to-csv).

Many HSBC UK business customers already have a bank feed connected to their accounting software. Converting PDFs is still useful for backfilling the months before the feed started, for a second account that was never connected, or for bringing earlier records into Making Tax Digital compatible software. Before importing, check which dates the feed already covers so you do not create duplicates.

## HSBC Statements From Other Countries

HSBC operates in many countries, and statement layouts differ between them. English-language HSBC statements from outside the UK can be uploaded as well, but the column names, currency and date order may not match the UK layout described here. Check the dates in your downloaded file before importing it anywhere that assumes UK day-month order.

## Other Banks and Statement Types

If you also bank with Lloyds or Barclays, see the [Lloyds](/convert/lloyds-bank-statement-to-excel) and [Barclays](/convert/barclays-bank-statement-to-excel) converter pages. Converting an HSBC credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements that have been scanned or photographed, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
