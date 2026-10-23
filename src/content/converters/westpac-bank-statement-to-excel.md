---
slug: "westpac-bank-statement-to-excel"
title: "Westpac Bank Statement to Excel Converter"
metaTitle: "Westpac Bank Statement to Excel & CSV | Finlyzers"
metaDescription: "Convert Westpac personal and business statement PDFs to Excel or CSV. Debits, credits and balances in clean columns, DD/MM dates kept. Free up to 10 pages."
intro: "Convert Westpac everyday, savings and business statement PDFs into Excel or CSV, with debits and credits in their own columns, BSB and account details kept, and every balance checked."
category: "au-banks"
bankName: "Westpac"
statementLabel: "Westpac Bank Statement"
outputFormat: "Excel"
country: "Australia"
badgeText: "Australia · Westpac statements"
dateModified: "2026-10-23"
keywords:
  - "westpac bank statement to excel"
  - "westpac statement to csv"
  - "convert westpac pdf statement"
  - "westpac business statement to excel"
related:
  - "bank-statement-to-ofx"
  - "bank-statement-to-qif"
  - "nab-bank-statement-to-excel"
  - "scanned-pdf-ocr-to-excel"
features:
  - title: "Separate Debits and Credits"
    description: "Payments out and deposits in are split into numeric Debit and Credit columns instead of one column of mixed amounts."
  - title: "Running Balance Checked"
    description: "Each row's balance is checked against the one before it, so a missed or duplicated line is flagged rather than silently carried into your books."
  - title: "Day-Month Dates"
    description: "Dates are read the Australian way, so 02/03 is 2 March. Your spreadsheet will not quietly swap the day and month."
  - title: "Long Statements in One Go"
    description: "Multi-page business statements and long savings statements are processed in one upload, with the balance followed from page to page."
tableColumns:
  - "Date"
  - "Transaction Description"
  - "Debit"
  - "Credit"
  - "Balance"
sampleData:
  - date: "12/02/2026"
    desc: "DEPOSIT EXAMPLE CLIENT PTY LTD INV 1042"
    amount: "$2,750.00"
    type: "Credit"
    balance: "$18,430.60"
  - date: "13/02/2026"
    desc: "PAYMENT BY AUTHORITY TO EXAMPLE INSURANCE"
    amount: "$214.90"
    type: "Debit"
    balance: "$18,215.70"
  - date: "14/02/2026"
    desc: "EFTPOS PURCHASE EXAMPLE HARDWARE PARRAMATTA"
    amount: "$68.35"
    type: "Debit"
    balance: "$18,147.35"
steps:
  - title: "Download the PDF from Westpac"
    body: "Sign in to Westpac Online Banking or the Westpac app, open the account and find its statements. Choose the period and download the PDF. Menu names can differ between personal and business banking."
  - title: "Upload it here"
    body: "Debits and credits are read into separate columns, dates are read day first and the running balance is checked on every row."
  - title: "Download Excel, CSV or OFX"
    body: "Keep the spreadsheet for your records, or download OFX, CSV or QIF from the same upload for Xero, QuickBooks Online or other accounting software."
faqs:
  - question: "Where do I find my Westpac statements?"
    answer: "Sign in to Westpac Online Banking or the Westpac app, select the account and look for its statements or eStatements. Pick the period and download the PDF. Business customers may find statements in a different menu."
  - question: "Westpac lets me export transactions. Why convert the PDF?"
    answer: "Exporting works well for recent transactions on accounts you can sign in to. A PDF is often the only option for older periods, closed accounts and statements a client has forwarded, and it is the official record for that period."
  - question: "Does it work with Westpac business accounts?"
    answer: "Yes. Business statements are usually longer but use a similar date, description, debit, credit and balance layout, and all pages are processed in one upload."
  - question: "Can I import a Westpac statement into Xero?"
    answer: "Yes. Download the OFX file from the same upload, then in Xero open the bank account and use the option to import a statement. CSV also works if you prefer to map the columns yourself."
  - question: "What about St.George, Bank of Melbourne or BankSA?"
    answer: "These are Westpac Group brands, but their statements can look different. Upload them to the general bank statement converter, which also separates debits, credits and balances."
---

# Converting Westpac Statements to Excel

A Westpac statement is a tidy document, but it is still a PDF. Selecting the transaction table and pasting it into Excel usually gives you one long column of text, with amounts that will not add up and descriptions broken across rows. If you are catching up on a year of bookkeeping, or a client has sent you a folder of statements, that clean-up takes longer than the actual work. Finlyzers reads each statement and gives you a spreadsheet with one row per transaction and the balance checked on every line.

## How a Westpac Statement Is Laid Out

- **Header:** account name, BSB and account number, and the statement period.
- **Summary:** an opening balance, totals for money in and money out, and a closing balance.
- **Transaction table:** typically a date, a transaction description, separate debit and credit columns and a running balance. Exact column labels can vary between account types and statement versions.
- **Fees and interest:** account fees and any interest earned appear as their own rows, which is useful when you want to claim or report them separately.

Everyday accounts such as Westpac Choice, savings accounts such as Westpac Life, and business transaction accounts broadly follow this pattern.

## Westpac Description Wording to Look For

Descriptions are written out in words. The wording below is common, though it changes over time and between account types:

- **Deposit:** incoming payments, often with the payer's name and a reference such as an invoice number.
- **Payment by authority:** a payment a business collects from your account under a direct debit arrangement.
- **BPAY:** bills paid through BPAY to a named biller.
- **EFTPOS purchase / debit card purchase:** card spending, usually with the merchant name and suburb.
- **Osko or PayID payments:** fast transfers to and from other people, sometimes labelled as such in the description.
- **Withdrawal:** ATM withdrawals and transfers out.

Because these words stay in the Description column, you can filter in Excel to pull out, say, every payment by authority to check your recurring costs.

## Why Bookkeepers Convert Westpac PDFs

Westpac Online Banking can export recent transactions, and a bank feed may already be connected to your accounting software. Converting the PDF is still the practical route when:

- **Backfilling a ledger:** the bank feed only starts from the day it was connected, and you need the months before that.
- **Year-end catch-up:** a sole trader or small business hands over twelve monthly statements just before the tax return is due.
- **Closed or inherited accounts:** you can no longer sign in, but you have the statements.
- **Lender requests:** a broker asks for recent statements for a home loan application and you want a spreadsheet summary of income and regular outgoings.
- **Rental properties:** separating rent, agent fees, council rates and repairs for each property.

## Getting Westpac Data Into Your Software

From the same upload you can download:

- [OFX](/convert/bank-statement-to-ofx) for Xero or QuickBooks Online.
- [CSV](/convert/bank-statement-to-csv) if you prefer to map the columns yourself or work in Google Sheets.
- [QIF](/convert/bank-statement-to-qif) for desktop software that still uses it.

If you use MYOB, check which bank statement file formats your edition imports before choosing one. When importing CSV anywhere, make sure the software is set to DD/MM/YYYY dates.

The spreadsheet also works well for preparing a BAS: sort the quarter's transactions, tag each one, and hand your accountant a file instead of a PDF.

## Other Australian Banks

If you hold accounts at more than one bank, the [NAB statement converter](/convert/nab-bank-statement-to-excel) and the [ANZ statement converter](/convert/anz-bank-statement-to-excel) give you the same column layout, so everything can be combined in one workbook.

Converting a Westpac credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
