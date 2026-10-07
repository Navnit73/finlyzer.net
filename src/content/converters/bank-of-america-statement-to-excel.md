---
slug: "bank-of-america-statement-to-excel"
title: "Bank of America Statement to Excel Converter"
metaTitle: "Bank of America Statement to Excel & CSV | Finlyzers"
metaDescription: "Convert Bank of America checking and savings statement PDFs to Excel or CSV. Deposits, withdrawals, checks and fees merged into one list. Free up to 10 pages."
intro: "Convert Bank of America checking, savings and business statement PDFs into Excel or CSV, with deposits, withdrawals, checks and service fees merged into one date-ordered list."
category: "us-banks"
bankName: "Bank of America"
statementLabel: "Bank of America Statement"
outputFormat: "Excel"
country: "United States"
badgeText: "Bank of America statements"
keywords:
  - "bank of america statement to excel"
  - "bank of america statement to csv"
  - "bofa statement to excel"
  - "convert bank of america pdf statement"
related:
  - "chase-bank-statement-to-excel"
  - "wells-fargo-bank-statement-to-excel"
  - "credit-card-statement-to-excel"
  - "bank-statement-to-csv"
features:
  - title: "Every Section Combined"
    description: "Deposits and other additions, withdrawals and other subtractions, checks and service fees become one list."
  - title: "Check Numbers Kept"
    description: "Check numbers from the checks section stay in the Reference column so you can match them to your check register."
  - title: "Signs Normalized"
    description: "Withdrawals printed as negative amounts are moved into a positive Debit column, with deposits in Credit."
  - title: "Section Totals Verified"
    description: "Extracted rows are compared with the account summary's totals and the ending balance."
tableColumns:
  - "Date"
  - "Description"
  - "Reference"
  - "Debit"
  - "Credit"
  - "Balance"
sampleData:
  - date: "08/10/2026"
    desc: "PAYROLL DIRECT DEP TECH SOLS"
    amount: "+$5,200.00"
    type: "Credit"
    balance: "$18,950.20"
  - date: "08/12/2026"
    desc: "CHECK # 1042 CLEARED"
    amount: "-$650.00"
    type: "Debit"
    balance: "$18,300.20"
  - date: "08/14/2026"
    desc: "GOOGLE WORKSPACE SUBSCRIPTION"
    amount: "-$72.00"
    type: "Debit"
    balance: "$18,228.20"
steps:
  - title: "Download the PDF from Bank of America"
    body: "In Online Banking or the mobile app, open the account and go to Statements and Documents to download the PDF."
  - title: "Upload it here"
    body: "Each section of the statement is read, multi-line descriptions are joined and the totals are checked against the account summary."
  - title: "Download Excel or CSV"
    body: "Use the spreadsheet for review or reconciliation, or download QBO, OFX or QIF from the same upload."
faqs:
  - question: "Where do I find Bank of America statements?"
    answer: "Sign in to Online Banking or the mobile app, select the account and open Statements and Documents. Choose the statement period and download the PDF."
  - question: "Bank of America statements have no running balance on each line. Can they still be checked?"
    answer: "Yes. The converter compares the extracted deposits and withdrawals with the totals in the account summary and checks that the beginning balance plus deposits minus withdrawals equals the ending balance."
  - question: "Can I import the CSV into QuickBooks Online?"
    answer: "Yes. QuickBooks Online accepts a 3-column or 4-column bank CSV and lets you map the columns on upload. If you would rather skip the mapping, download the QBO file instead."
  - question: "Does it work for Bank of America credit card statements?"
    answer: "Use the credit card converter for card statements. It keeps purchases and payments in separate columns, which suits how card statements are laid out."
---

# Converting Bank of America Statements to Excel and CSV

Bank of America statements group transactions by type rather than listing them in one running sequence. Copying them into a spreadsheet means pasting several separate tables, fixing descriptions that wrap onto a second line and re-sorting everything by date. Finlyzers reads each section and gives you a single, ordered list.

## How a Bank of America Statement Is Laid Out

- **Account summary:** beginning balance, totals for deposits and other additions, withdrawals and other subtractions, checks, service fees and the ending balance.
- **Deposits and other additions:** incoming payments such as payroll, transfers and refunds.
- **Withdrawals and other subtractions:** card purchases, transfers, bill payments and other debits, typically printed with a minus sign.
- **Checks:** check numbers with the date each one cleared and its amount.
- **Service fees** and, at the end, a table of **daily ledger balances**.

Because most transactions do not have a balance printed next to them, the most reliable check is against the section totals in the account summary. That is how the converter verifies a Bank of America statement.

## What You Get in the Spreadsheet

- **One row per transaction** from every section, sorted by date.
- **Separate Debit and Credit columns** with positive numbers, ready for SUM and pivot tables.
- **Check numbers** in their own column for matching against your check register.
- **Descriptions joined** when a merchant or transfer note wraps onto a second line.

## Who Converts Bank of America Statements

Bookkeepers reconciling client accounts, small businesses preparing for tax season, landlords tracking rental income, and anyone moving older history into QuickBooks, Xero, Excel or Google Sheets.

Need a different format? The same upload can be downloaded as [CSV](/convert/bank-statement-to-csv), [QBO for QuickBooks](/convert/bank-statement-to-qbo) or [OFX](/convert/bank-statement-to-ofx). Statements from other US banks are covered in the [Chase](/convert/chase-bank-statement-to-excel) and [Wells Fargo](/convert/wells-fargo-bank-statement-to-excel) guides, and any other bank works with the general [bank statement converter](/).
