---
slug: "aib-bank-statement-to-excel"
title: "AIB Bank Statement to Excel Converter"
metaTitle: "AIB Bank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert AIB personal and business statement PDFs to Excel or CSV, with debits and credits kept separate and Irish dates read correctly. Free up to 10 pages."
intro: "Convert AIB (Allied Irish Banks) current account and business statement PDFs into Excel or CSV, with debits and credits in separate columns, euro amounts cleaned and Irish day-month dates read correctly."
category: "eu-banks"
bankName: "AIB"
statementLabel: "AIB Bank Statement"
outputFormat: "Excel"
country: "Ireland"
badgeText: "Ireland · AIB statements"
dateModified: "2026-10-23"
keywords:
  - "aib bank statement to excel"
  - "aib statement to csv"
  - "convert aib pdf statement"
  - "allied irish bank statement to excel"
  - "aib business statement to excel"
related:
  - "bank-of-ireland-statement-to-excel"
  - "bank-statement-to-ofx"
  - "bank-statement-to-csv"
  - "credit-card-statement-to-excel"
features:
  - title: "Debit and Credit Columns"
    description: "AIB's separate Debit and Credit columns are kept as numeric columns, so money in and money out never end up mixed in one field."
  - title: "Irish Date Order"
    description: "Dates are read day first, so 04/09 is 4 September rather than 9 April, the same way the statement prints them."
  - title: "Balance Forward Lines Handled"
    description: "Opening and balance forward lines are treated as balances, not transactions, and the running balance check would flag one counted by mistake."
  - title: "Euro Amounts Cleaned"
    description: "Euro signs and thousands separators are removed so amounts can be summed, filtered and pivoted straight away."
tableColumns:
  - "Date"
  - "Details"
  - "Debit"
  - "Credit"
  - "Balance"
sampleData:
  - date: "02/09/2026"
    desc: "SALARY EXAMPLE TECHNOLOGIES LTD"
    amount: "€3,280.00"
    type: "Credit"
    balance: "€5,412.75"
  - date: "04/09/2026"
    desc: "D/D ELECTRIC IRELAND"
    amount: "€118.40"
    type: "Debit"
    balance: "€5,294.35"
  - date: "05/09/2026"
    desc: "DUNNES STORES CORK"
    amount: "€64.20"
    type: "Debit"
    balance: "€5,230.15"
steps:
  - title: "Download the PDF from AIB"
    body: "In AIB Internet Banking or the AIB app, open the account's statements (often listed as eStatements or Documents) and download the period you need as a PDF."
  - title: "Upload it here"
    body: "Debits and credits are read into separate columns, day-month dates are kept in Irish order and every row is checked against the running balance."
  - title: "Download Excel, CSV or OFX"
    body: "Keep the spreadsheet for your records, or download OFX, QBO or CSV from the same upload for Xero, QuickBooks or Sage."
faqs:
  - question: "Where do I find my AIB statements?"
    answer: "Sign in to AIB Internet Banking or the AIB mobile app, choose the account and look for the statements or eStatements section. Pick the statement period and download the PDF. Menu names can change between app versions and differ for business customers."
  - question: "AIB lets me see my transactions online. Why convert the PDF?"
    answer: "Online transaction views and exports usually cover recent activity on accounts you still hold. Older periods, closed accounts and statements a client or tenant sent you are normally only available as PDFs, and the PDF statement is the record an accountant or lender expects."
  - question: "Does it work with AIB business current account statements?"
    answer: "Yes, as long as the statement is in English. Business statements are processed the same way as personal ones, and multi-page or year-long statements can be converted in one upload."
  - question: "Can I import an AIB statement into Xero?"
    answer: "Yes. Download the OFX file from the same upload, then in Xero open the bank account, choose Manage Account and Import a Statement. If you prefer to map columns yourself, use the CSV instead."
  - question: "Will Excel read the dates correctly?"
    answer: "The output keeps dates in day-month order. If you open the CSV in Excel or import it into accounting software, check that the regional or date setting is day-month, which is the default for Irish and UK editions."
---

# Converting AIB Statements to Excel

AIB statements are built to be printed and filed, not analysed. Transactions are laid out in a table with separate debit and credit columns and a running balance, and long descriptions such as card purchases or standing orders can run across the column. Copying a few pages into a spreadsheet usually merges those columns, and spreadsheet software set to US dates can swap the day and month. Finlyzers reads the table as it is printed and gives you one clean row per transaction.

## What an AIB Statement Usually Contains

The exact layout depends on the account and when the statement was produced, but most AIB current account statements include:

- **Header:** account name, statement date range, your IBAN and AIB's BIC, and the branch National Sort Code (NSC).
- **Transaction table:** columns typically labelled **Date**, **Details**, **Debit**, **Credit** and **Balance**, with amounts in euro.
- **Balance forward lines:** the balance carried from the previous statement or page appears as its own line. It is a balance, not a transaction, so it is left out of the transaction list.
- **Interest and charges:** fees, overdraft interest or account charges appear as their own debit lines, so they can be totalled separately in Excel.

Descriptions often begin with short codes such as **D/D** for a direct debit or **S/O** for a standing order, followed by the payee. Keeping that text intact in the Details column makes it easy to filter by payment type later.

## When You Still Need the PDF

AIB Internet Banking shows your recent transactions, and depending on the account and channel you may be able to export them. That is handy for this month's activity, but it does not help when:

- You need an earlier period that is only available as a statement PDF.
- The account has been closed.
- Someone else sent you their statement, for example a bookkeeping client, a tenant or a family member you help with paperwork.
- You need figures that match the official statement line for line, with the balance agreeing at the end.

In each of these cases, converting the PDF gives you the same data as the statement itself.

## Common Uses in Ireland

- **Self-assessed income tax:** if you file a Form 11 with Revenue as a sole trader or company director, a year of transactions in Excel makes it much quicker to separate business income and expenses.
- **Landlords:** rental income and deductible costs such as repairs, insurance and mortgage interest can be filtered from a single spreadsheet rather than picked out of a stack of PDFs.
- **Mortgage applications:** lenders commonly ask for several months of current account statements. A spreadsheet helps you check regular outgoings and savings before you apply.
- **Bookkeeping:** small businesses and accountants can backfill Xero, Sage or QuickBooks when the bank feed does not reach far enough back.

## Getting AIB Data Into Your Software

The same upload can be downloaded in several formats:

- [OFX](/convert/bank-statement-to-ofx) for Xero and other software that imports bank statement files.
- [QBO](/convert/bank-statement-to-qbo) for QuickBooks Online or Desktop.
- [CSV](/convert/bank-statement-to-csv) for Sage, Google Sheets or any tool where you map the columns yourself.

Statements that run over many pages are processed in one go, and password-protected PDFs can be opened with the password before conversion. If you also bank with Bank of Ireland, the [Bank of Ireland statement converter](/convert/bank-of-ireland-statement-to-excel) covers its layout.

Converting an AIB credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel), which keeps purchases and payments in separate columns. For older paper statements you have scanned or photographed, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
