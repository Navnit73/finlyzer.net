---
slug: "commbank-statement-to-excel"
title: "CommBank Statement to Excel Converter"
metaTitle: "CommBank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert Commonwealth Bank (CommBank) statement PDFs to Excel or CSV. Debits and credits kept apart, Australian dates read correctly. Free up to 10 pages."
intro: "Convert Commonwealth Bank statement PDFs from NetBank or the CommBank app into Excel or CSV, with debits and credits in separate columns, Australian day-month dates and a running balance check."
category: "au-banks"
bankName: "CommBank"
statementLabel: "CommBank Statement"
outputFormat: "Excel"
country: "Australia"
badgeText: "Australia · CommBank statements"
dateModified: "2026-10-23"
keywords:
  - "commbank statement to excel"
  - "commonwealth bank statement to excel"
  - "commbank statement to csv"
  - "convert commbank pdf statement"
  - "commonwealth bank statement to csv"
related:
  - "bank-statement-to-csv"
  - "bank-statement-to-ofx"
  - "westpac-bank-statement-to-excel"
  - "credit-card-statement-to-excel"
features:
  - title: "Debit and Credit Columns"
    description: "Money going out and money coming in are kept as separate numeric Debit and Credit columns, so a quarter's totals take one formula."
  - title: "Australian Date Order"
    description: "Dates are read day first, so 04/07 is 4 July rather than 7 April. Where a date is printed without a year, the year comes from the statement period."
  - title: "Opening and Closing Balances"
    description: "Opening and closing balance lines are treated as balances, not transactions, and the running balance is checked from one row to the next."
  - title: "Multi-Page Statements"
    description: "Monthly, quarterly or longer CommBank statements are processed in one upload, with the balance followed across every page."
tableColumns:
  - "Date"
  - "Transaction"
  - "Debit"
  - "Credit"
  - "Balance"
sampleData:
  - date: "01/07/2026"
    desc: "Direct Credit 012345 EXAMPLE PTY LTD SALARY"
    amount: "$4,120.00"
    type: "Credit"
    balance: "$6,845.30"
  - date: "03/07/2026"
    desc: "BPAY EXAMPLE ENERGY"
    amount: "$186.40"
    type: "Debit"
    balance: "$6,658.90"
  - date: "05/07/2026"
    desc: "EFTPOS EXAMPLE SUPERMARKET SYDNEY NSW"
    amount: "$92.15"
    type: "Debit"
    balance: "$6,566.75"
steps:
  - title: "Download the PDF from NetBank"
    body: "In NetBank or the CommBank app, open the account and find its statements. Choose the period and save the statement as a PDF. Menu names can differ between personal and business banking."
  - title: "Upload it here"
    body: "Debits and credits are read into separate columns, dates are read day first and the running balance is checked against the opening and closing balances."
  - title: "Download Excel, CSV or OFX"
    body: "Use the spreadsheet for tax or home loan paperwork, or download CSV or OFX from the same upload for Xero or QuickBooks Online."
faqs:
  - question: "Where do I find my CommBank statements?"
    answer: "Sign in to NetBank or the CommBank app, choose the account and open its statements. Select the period you need and download the PDF. The exact menu wording can change over time, and business accounts may list statements in a slightly different place."
  - question: "NetBank can export transactions. Why convert the PDF?"
    answer: "The export is handy for recent activity on an account you can sign in to. For older periods, closed accounts or statements a client has emailed you, the PDF is often all you have, and accountants and lenders usually work from the statement itself."
  - question: "Does it work with Commonwealth Bank business accounts?"
    answer: "Yes. Business account statements usually follow the same date, transaction, debit, credit and balance pattern, and multi-page statements are processed in one upload."
  - question: "Can I use the spreadsheet for my BAS?"
    answer: "It gives you a clean list of every transaction for the period. You still decide the GST treatment yourself or in your accounting software, but sorting and coding a quarter is much quicker in a spreadsheet than in a PDF."
  - question: "Will the dates import correctly into my software?"
    answer: "Dates are read in day-month order. When you import the CSV, check that your spreadsheet or accounting software is also set to DD/MM/YYYY so 04/07 is not read as 7 April."
---

# Converting CommBank Statements to Excel

Whether you call it CommBank, CBA or the Commonwealth Bank, the statement PDF is built to be read, not analysed. Copying the transaction table out of it usually breaks: debits and credits slide into one column, long descriptions split across rows, and a spreadsheet set to US dates can turn 04/07 into 7 April. Finlyzers reads the statement as a table and gives you one clean row per transaction, in Australian date order.

## What a CommBank Statement Usually Contains

- **Header:** account name, BSB and account number, and the statement period.
- **Summary:** most statements show an opening balance, total debits, total credits and a closing balance for the period.
- **Transaction table:** typically **Date**, **Transaction**, **Debit**, **Credit** and **Balance**.
- **Balance lines:** an opening balance at the start and a closing balance at the end. These are balances, not transactions, so they are kept out of the transaction list, and the running balance check would flag one that slipped in.

Everyday accounts such as Smart Access, savings accounts and business transaction accounts follow broadly the same pattern, although labels and spacing can differ slightly between account types and over the years.

## Reading CommBank Transaction Descriptions

Australian statements describe payment types in words rather than short codes. The exact text varies, but you will commonly see:

- **Direct Credit:** money paid in by an employer, a government agency or a business, often followed by a reference and the payer's name.
- **Direct Debit:** regular payments a business collects from your account, such as insurance or a gym membership.
- **BPAY:** bills paid through BPAY, usually showing the biller's name.
- **Transfer to / Transfer from:** movements between accounts or to other people. Fast payments may mention Osko or a PayID.
- **Card purchases:** EFTPOS and debit card purchases, which may include the last digits of the card and a value date that can be a day or two before the date the transaction posted.
- **Fees and interest:** account fees and interest credited are listed as their own rows.

Keeping this wording in the Description column means you can filter in Excel, for example on BPAY to list every bill for the quarter, or on Direct Credit to total income.

## When You Still Need to Convert a PDF

NetBank lets you export transaction history for accounts you can sign in to, and for recent activity on your own account that may be enough. The PDF is the better source when:

- You need a period older than the history you can export.
- The account has been closed, or you no longer have NetBank access to it.
- A client has sent their statements to you as a bookkeeper, accountant or tax agent.
- A lender or mortgage broker has asked for statements and you want the same figures in a spreadsheet to check before you send them.
- You were given a printed or scanned copy rather than a download.

## Australian Uses for the Spreadsheet

- **BAS and GST:** sort a quarter's transactions and code income and expenses before preparing your Business Activity Statement.
- **Individual tax returns:** gather interest earned and work-related expenses for the financial year, which runs from 1 July to 30 June, often by combining several monthly statements.
- **Rental property records:** separate rent received from council rates, strata levies, insurance and repairs for each property.
- **Home loan applications:** summarise regular income and living expenses from the statements a lender has asked for.
- **Accounting software:** download [OFX](/convert/bank-statement-to-ofx) or [CSV](/convert/bank-statement-to-csv) for Xero, or [QBO](/convert/bank-statement-to-qbo) for QuickBooks Online. If you use MYOB, check which bank statement file formats your edition imports before choosing a download.

Password-protected PDFs are supported, and the same upload can be downloaded in Excel, CSV, QBO, OFX or QIF.

## Statements From Other Australian Banks

Many households and businesses bank with more than one of the big four. If you also have Westpac or NAB accounts, see the [Westpac statement converter](/convert/westpac-bank-statement-to-excel) and the [NAB statement converter](/convert/nab-bank-statement-to-excel), so every account ends up in the same column layout.

Converting a CommBank credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel), which keeps purchases and payments in separate columns. For paper statements you have scanned or photographed, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
