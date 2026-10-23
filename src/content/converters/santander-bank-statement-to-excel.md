---
slug: "santander-bank-statement-to-excel"
title: "Santander Bank Statement to Excel Converter"
metaTitle: "Santander Bank Statement to Excel & CSV | Finlyzers"
metaDescription: "Convert Santander UK statement PDFs to Excel or CSV. Long descriptions kept intact, money in and money out split, UK dates handled. Free up to 10 pages."
intro: "Convert Santander UK current account, savings and business statement PDFs into Excel or CSV, with long payment descriptions kept in one cell and money in and money out in separate columns."
category: "uk-banks"
bankName: "Santander"
statementLabel: "Santander Bank Statement"
outputFormat: "Excel"
country: "United Kingdom"
badgeText: "UK · Santander statements"
dateModified: "2026-10-23"
keywords:
  - "santander bank statement to excel"
  - "santander statement to csv"
  - "convert santander pdf statement"
  - "santander uk statement to excel"
  - "santander business statement to excel"
related:
  - "bank-statement-to-csv"
  - "hsbc-bank-statement-to-excel"
  - "bank-statement-to-ofx"
  - "scanned-pdf-ocr-to-excel"
features:
  - title: "Long Descriptions Kept Whole"
    description: "Santander descriptions such as CARD PAYMENT TO or FASTER PAYMENTS RECEIPT often wrap onto a second line. They are kept with the transaction they belong to."
  - title: "Money In and Money Out"
    description: "Incoming and outgoing amounts are written to separate numeric columns, so totals and filters work without cleanup."
  - title: "Balance Checked Through the Statement"
    description: "The running balance is checked across every page, and brought forward or carried forward lines are not treated as transactions."
  - title: "Scanned and Protected PDFs"
    description: "Password-protected statement PDFs can be uploaded, and scanned copies are read with OCR."
tableColumns:
  - "Date"
  - "Description"
  - "Money In"
  - "Money Out"
  - "Balance"
sampleData:
  - date: "19/09/2026"
    desc: "FASTER PAYMENTS RECEIPT REF INV 208 FROM EXAMPLE CLIENT LTD"
    amount: "£640.00"
    type: "Credit"
    balance: "£2,318.45"
  - date: "21/09/2026"
    desc: "CARD PAYMENT TO EXAMPLE SUPERMARKET ON 18-09-2026"
    amount: "£61.42"
    type: "Debit"
    balance: "£2,257.03"
  - date: "22/09/2026"
    desc: "DIRECT DEBIT PAYMENT TO EXAMPLE MOBILE LTD"
    amount: "£24.00"
    type: "Debit"
    balance: "£2,233.03"
steps:
  - title: "Download the PDF from Santander"
    body: "Sign in to Santander Online Banking or the Santander app, choose the account and open its statements. Save the period you need as a PDF."
  - title: "Upload it here"
    body: "Wrapped descriptions are joined to their transaction, money in and money out are split and UK day-month dates are read correctly."
  - title: "Download Excel, CSV or OFX"
    body: "Open the spreadsheet in Excel or Google Sheets, or use CSV or OFX for Xero, FreeAgent, QuickBooks or Sage."
faqs:
  - question: "Where do I find my Santander UK statements?"
    answer: "Sign in to Santander Online Banking or the Santander app, select the account and look for its statements or documents section. Choose the month and download the PDF. Business banking menus can differ."
  - question: "Why does a card payment show two different dates?"
    answer: "The date column is when the payment reached your account. Card payment descriptions often also include the date you used the card, which can be a day or two earlier. Both are kept, so you can decide which matters for your records."
  - question: "Can I download transactions from Santander instead?"
    answer: "Santander online banking usually lets you download recent transactions. For older statements, a closed account or a PDF someone has sent you, converting the statement is usually the practical option."
  - question: "Does it work with Santander business statements?"
    answer: "Yes. Business current account statements are converted the same way, and multi-page statements are processed in one upload."
---

# Converting Santander Statements to Excel

Santander UK statements tend to spell payments out in full. Instead of a two-letter code, a line might read `CARD PAYMENT TO` followed by the retailer, `DIRECT DEBIT PAYMENT TO` followed by the company, or `FASTER PAYMENTS RECEIPT` followed by a reference and the payer's name. That is easy to read, but these descriptions often wrap onto a second line, and copying a page into a spreadsheet splits them across rows and pushes amounts out of line. Finlyzers keeps each description with its own transaction and puts money in and money out in separate columns.

## How a Santander Statement Is Usually Laid Out

- **Header:** account name, sort code, account number and the statement period.
- **Summary:** typically the opening balance, money in, money out and the closing balance for the period.
- **Transaction table:** columns usually labelled **Date**, **Description**, **Money in**, **Money out** and **Balance**.
- **Page breaks:** balances brought forward and carried forward between pages are not transactions, so they are left out of the transaction list.

## Two Dates on Card Payments

Santander card payment descriptions often include the date the card was used, for example `CARD PAYMENT TO EXAMPLE SUPERMARKET ON 18-09-2026`, while the date column shows when the payment reached the account. In the spreadsheet the statement date goes in the Date column, and the card date stays in the description.

This matters at period ends. A purchase made on 5 April might not reach the account until 7 April, after the tax year has ended. If you are preparing Self Assessment figures or month-end accounts, decide which date you are working from and apply it consistently.

## Filtering Santander Descriptions in Excel

Because each description starts with the payment type in words, Excel's text filters work well. Use **Text Filters**, then **Begins With**, and enter:

- `CARD PAYMENT` to list debit card spending;
- `DIRECT DEBIT` or `STANDING ORDER` to list regular bills and commitments;
- `FASTER PAYMENTS RECEIPT` or `BANK GIRO CREDIT` to list money received.

This is a quick way to build a household budget, check which subscriptions are still running, or total rent received if you let out a property.

If you want the payee on its own, Excel's **Text to Columns** or a simple formula can strip the leading phrase, leaving just the retailer or company name. Because the full description is kept, you can always go back to the original wording if a split does not work for a particular line.

## Downloads, PDFs and Accounting Software

Santander online banking usually lets you download recent transactions, which is handy for your own open account. The statement PDF is what you need for older months, closed accounts, and statements that have been emailed to you by a client or family member.

For accounting software:

- **Xero, FreeAgent or QuickBooks:** import [OFX](/convert/bank-statement-to-ofx) into the matching bank account, which is useful for months before a bank feed was connected.
- **Sage or other tools:** use [CSV](/convert/bank-statement-to-csv) and map the date, description, money in and money out columns.
- **Making Tax Digital:** if you are moving your records into compatible software, converted statements can give it a history for the months before you started.

## Mortgage and Rental Applications

Lenders and letting agents commonly ask for recent statements. Converting them to Excel first lets you see your income, regular outgoings and balances the way an underwriter or agent will, and check that nothing unexpected stands out.

## Other Banks and Statement Types

For other UK banks, see the [HSBC](/convert/hsbc-bank-statement-to-excel) and [NatWest](/convert/natwest-bank-statement-to-excel) converter pages. Converting a Santander credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements that have been scanned or photographed, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
