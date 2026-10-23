---
slug: "nab-bank-statement-to-excel"
title: "NAB Bank Statement to Excel Converter"
metaTitle: "NAB Bank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert National Australia Bank (NAB) statement PDFs to Excel or CSV. Particulars, debits, credits and balance kept in clean columns. Free up to 10 pages."
intro: "Convert NAB personal and business statement PDFs into Excel or CSV. Each transaction's particulars, debit or credit and balance end up in their own columns, with Australian dates and a running balance check."
category: "au-banks"
bankName: "NAB"
statementLabel: "NAB Bank Statement"
outputFormat: "Excel"
country: "Australia"
badgeText: "Australia · NAB statements"
dateModified: "2026-10-23"
keywords:
  - "nab bank statement to excel"
  - "nab statement to csv"
  - "convert nab pdf statement"
  - "national australia bank statement to excel"
  - "nab business statement to excel"
related:
  - "bank-statement-to-ofx"
  - "bank-statement-to-qif"
  - "anz-bank-statement-to-excel"
  - "scanned-pdf-ocr-to-excel"
features:
  - title: "Particulars Kept Whole"
    description: "Transaction descriptions that run over more than one line stay together in a single Description cell instead of spilling into extra rows."
  - title: "Debits and Credits Separated"
    description: "Money out and money in are written to separate numeric Debit and Credit columns, so totals and pivot tables work immediately."
  - title: "Page-Break Balances Handled"
    description: "Balance lines repeated at the top or bottom of a page are treated as balances, not transactions, and the running balance check would flag one counted by mistake."
  - title: "DD/MM Dates Preserved"
    description: "Dates are read in Australian day-month order, so 11/06 stays 11 June when you open the file."
tableColumns:
  - "Date"
  - "Particulars"
  - "Debits"
  - "Credits"
  - "Balance"
sampleData:
  - date: "10/06/2026"
    desc: "RENT EXAMPLE PROPERTY AGENCY 14 SAMPLE ST"
    amount: "$2,210.00"
    type: "Credit"
    balance: "$11,604.80"
  - date: "11/06/2026"
    desc: "BPAY EXAMPLE CITY COUNCIL RATES"
    amount: "$612.35"
    type: "Debit"
    balance: "$10,992.45"
  - date: "12/06/2026"
    desc: "EFTPOS EXAMPLE PLUMBING SERVICES BRISBANE"
    amount: "$385.00"
    type: "Debit"
    balance: "$10,607.45"
steps:
  - title: "Download the PDF from NAB"
    body: "Sign in to NAB Internet Banking or the NAB app, open the account and find its statements. Choose the period and download the PDF. Business customers using NAB Connect may find statements in a different menu."
  - title: "Upload it here"
    body: "Particulars, debits, credits and balances are read into separate columns, dates are read day first and the balance is checked page to page."
  - title: "Download Excel, CSV, OFX or QIF"
    body: "Use the spreadsheet directly, or download OFX or CSV for Xero and QuickBooks Online, or QIF for desktop software that imports it."
faqs:
  - question: "Where do I find my NAB statements?"
    answer: "Sign in to NAB Internet Banking or the NAB app, choose the account and open its statements. Select the period you need and download the PDF. Menu names can change, and business banking may list statements separately."
  - question: "NAB lets me export transaction history. Why use the PDF?"
    answer: "The export is useful for recent transactions on accounts you can sign in to. Statements for older periods, closed accounts or accounts you only have paperwork for are usually only available as PDFs, and the statement is the record a lender or auditor will ask for."
  - question: "Does it work with NAB business statements?"
    answer: "Yes. Business account statements, including long ones covering a busy month, are processed in one upload with the running balance checked across every page."
  - question: "Can I use it for rental property records?"
    answer: "Yes. Convert the statement for the account your rent is paid into, then sort or filter the spreadsheet to separate rent received from rates, strata levies, insurance and repairs."
  - question: "Will the file import into MYOB?"
    answer: "Import options differ between MYOB products and editions. Check which bank statement file formats your edition accepts, then download that format or CSV from the same upload."
---

# Converting NAB Statements to Excel

National Australia Bank statements list each transaction with its **particulars**, the amount in a debit or credit column, and a running balance. That layout is clear on the page but awkward in a spreadsheet: copying it usually merges the amount columns, splits long particulars over several rows and drags page headers into the data. Finlyzers reads the statement as a table and returns one row per transaction, ready for Excel, Google Sheets or your accounting software.

## How a NAB Statement Is Typically Laid Out

- **Header:** account name, BSB and account number, and the statement period.
- **Summary:** an opening balance, total debits, total credits and a closing balance.
- **Transaction table:** often labelled **Date**, **Particulars**, **Debits**, **Credits** and **Balance**.
- **Page breaks:** longer statements may repeat a balance at the bottom of one page and the top of the next, sometimes worded as brought forward or carried forward. These are balances, not transactions, and are left out of the transaction list.

Everyday accounts such as NAB Classic Banking, savings accounts such as NAB Reward Saver and iSaver, and NAB business accounts broadly follow this pattern, though column labels and spacing can vary between account types and over time.

## Common Wording in NAB Particulars

Descriptions on Australian statements use plain words for payment types. On NAB statements you will commonly see variations of:

- **EFTPOS and card purchases:** the merchant name and location, sometimes with a reference.
- **BPAY:** bill payments such as council rates, utilities and insurance, with the biller's name.
- **Direct credits:** salary, rent from a property manager, refunds or government payments, usually with the payer's name.
- **Direct debits:** regular amounts collected by businesses you have authorised.
- **Transfers:** money moved between your own accounts or to other people, including fast Osko or PayID payments where shown.
- **Fees and interest:** listed as separate lines, which makes them easy to total for tax purposes.

Because the full particulars stay in one cell, you can search or filter for a biller, a tenant's reference or a supplier across a whole year of statements.

## When Converting the PDF Makes Sense

NAB Internet Banking can export recent transactions for accounts you can sign in to. The PDF route is usually needed for:

- **Older periods** that are no longer available to export.
- **Closed accounts**, including accounts of a deceased estate you are helping to administer.
- **Client paperwork:** accountants and bookkeepers often receive statements as PDF attachments rather than exports.
- **Self-managed super funds:** auditors and accountants commonly work from bank statements for the fund's account, and a spreadsheet makes it easier to match contributions, payments and investment income.
- **Lender and broker requests:** check your income and regular commitments in a spreadsheet before sending statements for a home loan application.

## Using NAB Data in Australian Tools

- **Xero and QuickBooks Online:** download [OFX](/convert/bank-statement-to-ofx) or [CSV](/convert/bank-statement-to-csv) and import it into the matching bank account.
- **Desktop software:** download [QIF](/convert/bank-statement-to-qif) if your software still imports it.
- **MYOB:** check which bank statement formats your MYOB edition imports before choosing a download.
- **BAS preparation:** sort a quarter's transactions by particulars and code each one before working out GST.
- **End of financial year:** combine twelve monthly statements from July to June into one workbook for your tax return.

Whichever tool you use, make sure it is set to DD/MM/YYYY dates when importing CSV.

## Other Australian Banks

If you also bank with ANZ or the Commonwealth Bank, the [ANZ statement converter](/convert/anz-bank-statement-to-excel) and the [CommBank statement converter](/convert/commbank-statement-to-excel) produce the same column layout, so accounts from different banks can sit side by side.

Converting a NAB credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements you have scanned, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
