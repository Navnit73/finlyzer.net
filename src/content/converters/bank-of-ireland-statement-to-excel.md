---
slug: "bank-of-ireland-statement-to-excel"
title: "Bank of Ireland Statement to Excel Converter"
metaTitle: "Bank of Ireland Statement to Excel & CSV | Finlyzers"
metaDescription: "Convert Bank of Ireland statement PDFs to Excel or CSV, with payments in and out kept separate and day-month dates read correctly. Free up to 10 pages."
intro: "Convert Bank of Ireland current account and business statement PDFs into Excel or CSV. Payments out and payments in stay in separate columns, dates keep their day-month order and the running balance is checked."
category: "eu-banks"
bankName: "Bank of Ireland"
statementLabel: "Bank of Ireland Statement"
outputFormat: "Excel"
country: "Ireland"
badgeText: "Ireland · Bank of Ireland statements"
dateModified: "2026-10-23"
keywords:
  - "bank of ireland statement to excel"
  - "bank of ireland statement to csv"
  - "convert bank of ireland pdf statement"
  - "boi statement to excel"
  - "bank of ireland business statement to excel"
related:
  - "aib-bank-statement-to-excel"
  - "bank-statement-to-csv"
  - "bank-statement-to-qbo"
  - "scanned-pdf-ocr-to-excel"
features:
  - title: "Payments Out and Payments In"
    description: "The separate payments out and payments in columns become numeric Debit and Credit columns that you can total straight away."
  - title: "Day-Month Dates Kept"
    description: "Dates are read day first, so 07/10 stays 7 October in your spreadsheet instead of turning into 10 July."
  - title: "Year-Long Statements in One Upload"
    description: "Multi-page and annual statements are processed together, with the running balance checked from page to page."
  - title: "Ready for Your Accountant"
    description: "Download Excel for review, CSV for Sage, OFX for Xero or QBO for QuickBooks from the same upload."
tableColumns:
  - "Date"
  - "Transaction Details"
  - "Payments Out"
  - "Payments In"
  - "Balance"
sampleData:
  - date: "01/10/2026"
    desc: "RENT FROM TENANT APT 4"
    amount: "€1,650.00"
    type: "Credit"
    balance: "€4,980.30"
  - date: "03/10/2026"
    desc: "D/D BORD GAIS ENERGY"
    amount: "€96.75"
    type: "Debit"
    balance: "€4,883.55"
  - date: "07/10/2026"
    desc: "S/O HOME INSURANCE"
    amount: "€42.10"
    type: "Debit"
    balance: "€4,841.45"
steps:
  - title: "Download the PDF from Bank of Ireland"
    body: "In 365 online or the Bank of Ireland app, open the account's statements or eStatements and download the period you need as a PDF."
  - title: "Upload it here"
    body: "Payments out and payments in are read into separate columns, dates keep their day-month order and the running balance is checked."
  - title: "Download Excel, CSV or QBO"
    body: "Open the spreadsheet in Excel or Google Sheets, or download CSV, OFX or QBO for Sage, Xero or QuickBooks."
faqs:
  - question: "Where do I find my Bank of Ireland statements?"
    answer: "Personal customers can usually find them in 365 online or the Bank of Ireland app, in the account's statements or eStatements section. Business customers may use Business On Line instead. Menu names can change between app versions, so look for statements or documents."
  - question: "Can I download transactions from 365 online instead?"
    answer: "Online banking may let you view or export recent transactions, which is fine for a quick look. For older periods, closed accounts, or statements someone has emailed you, the PDF is usually all you have, and it is the document lenders and accountants ask for."
  - question: "Does it work with Bank of Ireland business statements?"
    answer: "Yes. Business current account statements in English are processed the same way, and a long statement can be uploaded as one file."
  - question: "What about Bank of Ireland accounts in Northern Ireland?"
    answer: "Statements from Bank of Ireland UK accounts in Northern Ireland are in sterling rather than euro. They can be uploaded in the same way, and the amounts will simply be in pounds."
  - question: "Can I import the file into QuickBooks or Sage?"
    answer: "Yes. Download QBO for QuickBooks Online or Desktop, or download CSV and use your Sage edition's bank import, mapping the date, description and amount columns."
---

# Converting Bank of Ireland Statements to Excel

A Bank of Ireland statement gives you a clear record of an account, but it is a document, not a dataset. To total a year of rent, check what a direct debit cost over twelve months or hand transactions to an accountant, you need each line in a spreadsheet with the amounts in proper columns. Finlyzers converts the PDF into Excel or CSV and checks the result against the statement's own running balance.

## How a Bank of Ireland Statement Is Usually Laid Out

Layouts change from time to time, but a typical current account statement in the Republic of Ireland has:

- **Header:** account name and address, statement period, IBAN and BIC, and the National Sort Code (NSC) and account number.
- **Transaction table:** columns typically labelled **Date**, **Transaction details**, **Payments out**, **Payments in** and **Balance**, in euro.
- **Opening and closing balances:** the balance brought forward appears at the start and the closing balance at the end. These are balances, not transactions, and are left out of the transaction list.
- **Descriptions:** direct debits and standing orders are commonly marked with **D/D** and **S/O**, and card payments usually show the merchant name, sometimes with a short prefix and date.

The converter keeps the description text as printed, so you can still search or filter by payee or payment type once it is in Excel.

## Why Copy and Paste Goes Wrong

Selecting the table in a PDF viewer and pasting it into Excel usually puts each line into a single cell, or splits it at every space. Amounts in the payments out and payments in columns lose their position, so it is no longer clear which are debits. Excel may also read 03/10 as 10 March if your computer uses US settings. Converting the PDF avoids all of this and gives you numbers, not text.

## Three Situations Where a Spreadsheet Helps

**Year-end for a sole trader or small company.** Accountants preparing a Form 11 or company accounts often receive a year of statements as PDFs. Converting them gives one sortable list that can be categorised, or imported into Xero, Sage or QuickBooks to fill gaps where the bank feed does not reach.

**Managing a rental property.** If rent from tenants is paid into a Bank of Ireland account, a spreadsheet makes it easy to total rent received and pull out repairs, insurance, management fees and mortgage interest for your rental income figures. A tenant's statement can also be converted if they share it as proof of rent paid.

**Applying for a mortgage or loan.** Irish lenders commonly ask for several months of current account statements. Reviewing them in Excel first lets you see regular outgoings, spot anything a lender might ask about and confirm your savings pattern.

## Choosing an Output Format

- **Excel** for review, categorising and pivot tables.
- [CSV](/convert/bank-statement-to-csv) for Sage, Google Sheets or any software where you map the columns yourself.
- [QBO](/convert/bank-statement-to-qbo) for QuickBooks Online or Desktop.
- [OFX](/convert/bank-statement-to-ofx) for Xero and other tools that import bank statement files.

When importing, set the date format to day-month if your software asks, so dates such as 03/10 are read as 3 October.

## Northern Ireland Accounts

Bank of Ireland also operates in Northern Ireland, where accounts are held in sterling with UK sort codes. Those statements can be converted the same way. For context on how a large UK bank lays out its statements, see the [Barclays statement converter](/convert/barclays-bank-statement-to-excel).

If you have accounts with more than one Irish bank, the [AIB statement converter](/convert/aib-bank-statement-to-excel) handles AIB's layout, and the two downloads can be combined in one workbook.

Converting a Bank of Ireland credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements you have scanned or photographed, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
