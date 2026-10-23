---
slug: "lloyds-bank-statement-to-excel"
title: "Lloyds Bank Statement to Excel Converter"
metaTitle: "Lloyds Bank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert Lloyds Bank statement PDFs to Excel or CSV. Type codes, money in and money out kept apart, UK dates and GBP amounts handled. Free up to 10 pages."
intro: "Convert Lloyds Bank current account, savings and business statement PDFs into Excel or CSV, with money in and money out as separate numeric columns and each transaction's type code kept for filtering."
category: "uk-banks"
bankName: "Lloyds Bank"
statementLabel: "Lloyds Bank Statement"
outputFormat: "Excel"
country: "United Kingdom"
badgeText: "UK · Lloyds Bank statements"
dateModified: "2026-10-23"
keywords:
  - "lloyds bank statement to excel"
  - "lloyds statement to csv"
  - "convert lloyds pdf statement"
  - "lloyds business statement to excel"
related:
  - "bank-statement-to-csv"
  - "bank-statement-to-qbo"
  - "natwest-bank-statement-to-excel"
  - "scanned-pdf-ocr-to-excel"
features:
  - title: "Type Codes Preserved"
    description: "Lloyds prints a short type such as DEB, DD, FPI or CPT for each transaction. It stays with the transaction so you can filter by payment type."
  - title: "Money In and Money Out Apart"
    description: "Incoming and outgoing amounts land in separate numeric columns instead of one merged column of figures."
  - title: "Statements Checked by Balance"
    description: "The running balance is checked through the statement, and brought forward and carried forward lines are not counted as transactions."
  - title: "Exports for UK Software"
    description: "Download Excel, CSV, QBO or OFX from the same upload for Xero, FreeAgent, QuickBooks or Sage."
tableColumns:
  - "Date"
  - "Type"
  - "Description"
  - "Money In"
  - "Money Out"
  - "Balance"
sampleData:
  - date: "12/09/2026"
    desc: "FPI J SMITH RENT SEPT"
    amount: "£950.00"
    type: "Credit"
    balance: "£3,104.22"
  - date: "14/09/2026"
    desc: "DD EXAMPLE COUNCIL TAX"
    amount: "£168.00"
    type: "Debit"
    balance: "£2,936.22"
  - date: "15/09/2026"
    desc: "DEB EXAMPLE SUPERMARKET"
    amount: "£54.37"
    type: "Debit"
    balance: "£2,881.85"
steps:
  - title: "Download the statement PDF"
    body: "Sign in to Lloyds Internet Banking or the Lloyds app, open the account and find its statements. Save the month you need as a PDF."
  - title: "Upload it here"
    body: "Dates are read in UK day-month order, money in and money out are split into separate columns and the balance is checked line by line."
  - title: "Download Excel, CSV or QBO"
    body: "Use the spreadsheet for Self Assessment or rental records, or download CSV, QBO or OFX for your accounting software."
faqs:
  - question: "Where do I find my Lloyds Bank statements?"
    answer: "In Lloyds Internet Banking or the Lloyds app, select the account and look for its statements, usually listed by month. Choose a statement and save or download the PDF. Business banking menus may be labelled differently."
  - question: "Lloyds already exports a CSV. Why convert the PDF?"
    answer: "The export is useful for recent transactions on your own open account. Older statements, closed accounts and PDFs that a tenant, client or family member has sent you still need converting, and the PDF is the statement the bank actually issued."
  - question: "Can I filter by transaction type in Excel?"
    answer: "Yes. Because the Lloyds type code is kept with each transaction, you can filter for DEB to see card spending, DD for direct debits or FPI for incoming payments."
  - question: "Does it work with Lloyds business statements?"
    answer: "Yes. Business current account statements are converted in the same way, and long multi-page statements are processed in a single upload."
  - question: "Will it work for Halifax or Bank of Scotland statements?"
    answer: "Halifax and Bank of Scotland are part of Lloyds Banking Group, and their statements often look similar. You can upload them here, but check the columns in your download, as layouts can differ."
---

# Converting Lloyds Bank Statements to Excel

A Lloyds Bank statement gives each transaction a short **Type** code alongside its date, description and amount. That extra detail is useful, but it is also what usually goes wrong when you copy a statement into a spreadsheet: the type merges into the description, money in and money out collapse into one column, and Excel may read 05/04 as 4 May. Finlyzers reads the statement row by row and keeps each value where it belongs.

## How a Lloyds Statement Is Usually Laid Out

- **Header:** account name, sort code, account number and the statement period.
- **Summary:** typically a balance at the start of the period, total money in, total money out and the balance at the end.
- **Transaction table:** columns usually covering **Date**, **Description**, **Type**, **Money In**, **Money Out** and **Balance**. The exact order and wording can vary between account types and older statements.
- **Page breaks:** balances carried from one page to the next are balances, not transactions, so they are not added to your transaction list.

## Lloyds Type Codes

The type column tells you how each payment was made. Codes you will commonly see include:

- `DEB`: a debit card payment, in a shop or online.
- `DD` and `SO`: direct debits and standing orders.
- `FPI` and `FPO`: Faster Payments coming in and going out.
- `CPT`: a cash machine withdrawal.
- `TFR`: a transfer, often between your own accounts.

Because the code stays with each transaction, it becomes a quick filter. A landlord can filter for `FPI` to list rent received, and a sole trader can separate `DEB` card spending from bills paid by direct debit.

## Lloyds CSV Exports and Statement PDFs

Lloyds Internet Banking usually lets you export recent transactions as a CSV file, with debit and credit amounts in separate columns. If you only need the last few weeks of your own account, that export is a good place to start.

Converting the PDF makes more sense when:

- you need **older months** that are only available as statements;
- the account has been **closed**;
- someone has **sent you the PDF**, for example a client, a tenant applying to rent from you, or a relative whose finances you help with;
- you want the figures from the **official statement** for a lender, an accountant or your own records.

## Self Assessment and Making Tax Digital

A UK tax year runs from 6 April to 5 April, which rarely lines up with statement dates. To total a year's rental income or business expenses, convert each monthly statement, combine them in one sheet and filter on the date column to keep only that tax year. Because dates are read in UK order, the filter will not mix up April and May.

If you keep your records in Making Tax Digital compatible software, converted statements can also give that software a history for the months before you started using it.

## Getting Lloyds Transactions Into Accounting Software

- **QuickBooks:** download [QBO](/convert/bank-statement-to-qbo) and import it into the matching bank account.
- **Xero, FreeAgent or Sage:** use OFX, or [CSV](/convert/bank-statement-to-csv) if you prefer to map the columns yourself.
- **Excel only:** keep the spreadsheet for mortgage applications, budgeting or a year-end review with your accountant.

## Halifax and Bank of Scotland

Halifax and Bank of Scotland are both part of Lloyds Banking Group, and their statements often follow a similar structure. You can upload them here as well, though it is worth checking the columns in your download, as the layout is not always identical.

## Other Banks and Statement Types

Banking elsewhere too? See the [NatWest](/convert/natwest-bank-statement-to-excel) and [HSBC](/convert/hsbc-bank-statement-to-excel) converter pages. For Lloyds credit card statements, use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements that have been scanned or photographed, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
