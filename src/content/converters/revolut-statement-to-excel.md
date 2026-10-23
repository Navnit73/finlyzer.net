---
slug: "revolut-statement-to-excel"
title: "Revolut Statement to Excel Converter"
metaTitle: "Revolut Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert Revolut PDF statements to Excel, CSV, QBO or OFX with money in and out kept separate and the running balance checked. Free up to 10 pages."
intro: "Convert English-language Revolut PDF statements into Excel or CSV, with money out and money in in separate columns and every row checked against the running balance. Useful when all you have is the PDF, or when you need QBO or OFX for accounting software."
category: "eu-banks"
bankName: "Revolut"
statementLabel: "Revolut Statement"
outputFormat: "Excel"
country: "Europe"
badgeText: "Europe · Revolut statements"
dateModified: "2026-10-23"
keywords:
  - "revolut statement to excel"
  - "revolut statement to csv"
  - "convert revolut pdf statement"
  - "revolut pdf to excel"
  - "revolut business statement to excel"
related:
  - "bank-statement-to-qbo"
  - "bank-statement-to-ofx"
  - "csv-to-qbo"
  - "bank-statement-to-csv"
features:
  - title: "Money Out and Money In"
    description: "Outgoing and incoming amounts land in separate numeric Debit and Credit columns, ready to total or pivot."
  - title: "Running Balance Checked"
    description: "Each row is checked against the statement's running balance, so a missed or duplicated line shows up before you rely on the file."
  - title: "One Currency per Upload"
    description: "Upload the statement for each currency balance separately and every file keeps a single currency and its own balance check."
  - title: "Accounting Formats Included"
    description: "Download QBO for QuickBooks, OFX for Xero or QIF from the same upload, alongside Excel and CSV."
tableColumns:
  - "Date"
  - "Description"
  - "Money Out"
  - "Money In"
  - "Balance"
sampleData:
  - date: "01/10/2026"
    desc: "Payment from Example Design Studio"
    amount: "€1,800.00"
    type: "Credit"
    balance: "€2,945.60"
  - date: "03/10/2026"
    desc: "Card payment Lidl"
    amount: "€37.85"
    type: "Debit"
    balance: "€2,907.75"
  - date: "06/10/2026"
    desc: "Transfer to savings"
    amount: "€250.00"
    type: "Debit"
    balance: "€2,657.75"
steps:
  - title: "Generate the PDF in the Revolut app"
    body: "Open the account for the currency you need, find the statement option, choose PDF and pick the period. Menu names can change between app versions."
  - title: "Upload it here"
    body: "Money out and money in are read into separate columns and each row is checked against the running balance on the statement."
  - title: "Download Excel, CSV, QBO or OFX"
    body: "Use the spreadsheet for expense tracking, or download QBO, OFX or QIF from the same upload for your accounting software."
faqs:
  - question: "Revolut can already export statements. Why convert a PDF?"
    answer: "If the app's own export gives you what you need, use it. Converting a PDF helps when the PDF is all you have, for example a statement sent by a client, tenant or landlord, when you want a file checked against the statement's running balance, or when you need QBO, OFX or QIF rather than a spreadsheet."
  - question: "How do I get a Revolut statement as a PDF?"
    answer: "In the Revolut app, open the account or currency balance, look for the statement option, choose PDF and select the date range. Revolut Business has its own statement and export options in the web app. Menu names can change between versions."
  - question: "What about multi-currency accounts?"
    answer: "Revolut typically produces a statement per currency balance. Convert each one separately so every file has one currency and one running balance. If you want everything in one place, combine the files in Excel and add a currency column yourself."
  - question: "Does it read Revolut statements in other languages?"
    answer: "No. The converter currently reads English-language statements only. If your app is set to another language, the statement may be generated in that language, so switch the app to English before generating the PDF."
  - question: "I already have Revolut's spreadsheet export. Can I turn it into QBO?"
    answer: "Yes. The CSV to QBO converter takes a CSV or Excel file of transactions and produces a QuickBooks Web Connect file, so you do not need the PDF at all."
---

# Converting Revolut Statements to Excel

Revolut is different from a traditional bank: most people manage everything in the app, and the app can already produce statements for a chosen period. Depending on your account and app version, that may include a spreadsheet format as well as PDF. If the app gives you a file you can use, that is the quickest route. This page is for the cases where it does not, or where the PDF is the only copy you have.

## When Converting the PDF Still Makes Sense

- **You only have the PDF.** Freelancers' clients, tenants, landlords and family members tend to send a Revolut statement as a PDF, because that is what they can share from the app. You cannot re-export someone else's account.
- **You want a file that matches the official statement.** The converted rows are checked against the statement's running balance, so the spreadsheet agrees with the document a lender, letting agent or accountant will see.
- **You need an accounting format.** Download [QBO for QuickBooks](/convert/bank-statement-to-qbo), [OFX for Xero](/convert/bank-statement-to-ofx) or QIF from the same upload instead of reshaping a spreadsheet yourself.
- **You are combining banks.** If you also bank with [AIB](/convert/aib-bank-statement-to-excel) or [Bank of Ireland](/convert/bank-of-ireland-statement-to-excel), converting each statement from its PDF gives you files you can combine in one workbook.

Already have Revolut's own spreadsheet export and just need QuickBooks? Use the [CSV to QBO converter](/convert/csv-to-qbo) and skip the PDF entirely.

## What a Revolut Statement Usually Shows

Revolut statements are generated from the app, so their design changes from time to time. The converter reads English-language statements only, so generate the PDF with the app set to English. Most statements include:

- **Header:** your name, the account or currency balance, the statement period, and the IBAN and BIC for that account. The IBAN shown depends on where your account is held.
- **Balance summary:** opening balance, money out, money in and closing balance for the period.
- **Transactions:** columns typically labelled **Date**, **Description**, **Money out**, **Money in** and **Balance**.
- **Descriptions:** card payments usually show the merchant, and transfers show the sender or recipient. Currency exchanges and moves into savings can appear as their own lines.

## Multi-Currency Accounts

Many Revolut users hold several currencies. Statements are typically produced per currency balance, so a euro statement and a sterling or dollar statement are separate documents. Convert each one on its own. That way every file has one currency and its own running balance check, and you never end up adding euro and dollar amounts in the same column by accident.

If you want a single view, paste the converted files into one workbook and add a currency column yourself. Exchange lines then show money leaving one balance and arriving in another, which is useful when you need to explain a transfer between currencies.

## Freelancers and Expense Tracking

Revolut is popular with freelancers and contractors who are paid by clients in different countries. A converted statement makes it easier to:

- Separate business income from personal spending.
- Categorise expenses such as software subscriptions, travel and equipment.
- Total income for a tax return, such as a Form 11 for self-assessed income tax in Ireland, or whatever return applies where you are resident.
- Give your accountant a clean file rather than a stack of PDFs.

Revolut Business accounts have their own export and integration options, so check those first. Business statement PDFs can be converted in the same way if that is what you have.

If you have a separate credit card statement, use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements you have scanned or photographed, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
