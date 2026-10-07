---
slug: "chase-bank-statement-to-excel"
title: "Chase Bank Statement to Excel Converter"
metaTitle: "Chase Bank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert Chase checking and business statement PDFs to Excel or CSV. Handles Chase's sectioned layout, MM/DD dates and daily balances. Free up to 10 pages."
intro: "Convert Chase checking, savings and business statement PDFs into Excel or CSV. Transactions from every section of the statement end up in one sorted list with debit, credit and balance columns."
category: "us-banks"
bankName: "Chase"
statementLabel: "Chase Bank Statement"
outputFormat: "Excel"
country: "United States"
badgeText: "Chase statements"
keywords:
  - "chase bank statement to excel"
  - "chase statement to csv"
  - "convert chase pdf statement"
  - "chase business statement to excel"
related:
  - "bank-of-america-statement-to-excel"
  - "wells-fargo-bank-statement-to-excel"
  - "credit-card-statement-to-excel"
  - "bank-statement-to-qbo"
features:
  - title: "Sectioned Layouts Merged"
    description: "Deposits, checks paid, card withdrawals, electronic withdrawals and fees are combined into one date-ordered list."
  - title: "Year Added to MM/DD Dates"
    description: "Chase prints transaction dates without a year, so the year is taken from the statement period, including December to January statements."
  - title: "Checks and References Kept"
    description: "Check numbers and transaction references stay in their own column for matching against your records."
  - title: "Summary Totals Verified"
    description: "Extracted rows are checked against the beginning and ending balance in the statement summary."
tableColumns:
  - "Date"
  - "Description"
  - "Reference"
  - "Debit"
  - "Credit"
  - "Balance"
sampleData:
  - date: "09/12/2026"
    desc: "DIRECT DEPOSIT - TECH CORP PAYROLL"
    amount: "+$4,850.00"
    type: "Credit"
    balance: "$12,420.50"
  - date: "09/14/2026"
    desc: "AMAZON.COM*RETAIL ORDER SEATTLE WA"
    amount: "-$124.50"
    type: "Debit"
    balance: "$12,296.00"
  - date: "09/15/2026"
    desc: "CHASE WIRE TRANSFER OUTGOING FEE"
    amount: "-$25.00"
    type: "Debit"
    balance: "$12,271.00"
steps:
  - title: "Download the PDF from Chase"
    body: "Sign in at chase.com or in the Chase app, choose the account and open Statements and documents to download the statement PDF."
  - title: "Upload it here"
    body: "Each section of the Chase statement is read and the transactions are merged into one list, then checked against the summary."
  - title: "Download Excel or CSV"
    body: "Open the file in Excel or Google Sheets, or download QBO or OFX from the same upload for accounting software."
faqs:
  - question: "Where do I find my Chase statements?"
    answer: "Sign in at chase.com or in the Chase mobile app, select the account, and open Statements and documents. Choose the month and download the PDF."
  - question: "Chase lets me download activity as a spreadsheet. Why convert the PDF?"
    answer: "Activity downloads cover recent transactions for open accounts. Older periods, closed accounts and statements someone emailed you are usually only available as PDFs, and the statement is the official record for that period."
  - question: "Does it work with Chase business statements?"
    answer: "Yes. Business statements that list deposits, checks paid, card withdrawals and electronic withdrawals in separate sections are merged into one date-ordered list."
  - question: "Can I import a Chase statement into QuickBooks?"
    answer: "Yes. Download the QBO file from the same upload and import it into the matching account in QuickBooks Online or Desktop."
  - question: "What about Chase credit card statements?"
    answer: "Use the credit card converter, which keeps purchases and payments in separate columns the way card statements need."
---

# Converting Chase Statements to Excel

Chase statements are designed to be read, not exported. Depending on the account, transactions may appear in one **Transaction detail** table or be split into separate sections for deposits, checks, card purchases and electronic payments. Copying those sections into a spreadsheet by hand means re-sorting everything by date and adding a year to every row. Finlyzers does that work for you.

## How a Chase Statement Is Laid Out

- **Summary box:** a checking or savings summary with the beginning balance, totals for deposits and withdrawals, fees and the ending balance.
- **Transactions:** personal checking statements typically use a single transaction detail table with date, description, amount and balance. Business statements usually split activity into sections such as **Deposits and additions**, **Checks paid**, **ATM and debit card withdrawals**, **Electronic withdrawals** and **Fees**.
- **Daily ending balance:** sectioned statements often finish with a table of end-of-day balances instead of a balance on every line.
- **Dates without a year:** transactions are printed as MM/DD, with the year shown only in the statement period.

## What the Converter Does Differently for Chase

1. **Merges sections** into a single list sorted by date, so you see the account's activity in order.
2. **Adds the correct year** to each date using the statement period, which matters for statements that run from December into January.
3. **Keeps check numbers** from the checks paid section in the Reference column.
4. **Verifies totals** by comparing the extracted deposits and withdrawals with the summary box and the ending balance.

## Common Reasons People Convert Chase Statements

- Backfilling QuickBooks or Xero when the bank feed does not reach far enough.
- Preparing a year of transactions for a tax return or an accountant.
- Supplying a transaction history for a mortgage, rental or loan application.
- Reviewing spending on an account that has since been closed.

## Other Formats and Accounts

The same upload can be downloaded as [QBO for QuickBooks](/convert/bank-statement-to-qbo), [OFX for Xero](/convert/bank-statement-to-ofx) or [CSV](/convert/bank-statement-to-csv). Chase credit card statements work best with the [credit card converter](/convert/credit-card-statement-to-excel). For statements from other banks, start with the general [bank statement converter](/).
