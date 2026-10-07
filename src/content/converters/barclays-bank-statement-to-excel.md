---
slug: "barclays-bank-statement-to-excel"
title: "Barclays Bank Statement to Excel Converter"
metaTitle: "Barclays Bank Statement to Excel & CSV | Finlyzers"
metaDescription: "Convert Barclays personal and business statement PDFs to Excel or CSV. Money in and money out kept separate, UK dates and GBP amounts handled."
intro: "Convert Barclays current account and business statement PDFs into Excel or CSV, with Money out and Money in kept in separate columns and UK day-month dates handled correctly."
category: "uk-banks"
bankName: "Barclays"
statementLabel: "Barclays Bank Statement"
outputFormat: "Excel"
country: "United Kingdom"
badgeText: "UK · Barclays statements"
keywords:
  - "barclays bank statement to excel"
  - "barclays statement to csv"
  - "convert barclays pdf statement"
  - "uk bank statement to excel"
related:
  - "bank-statement-to-ofx"
  - "bank-statement-to-csv"
  - "credit-card-statement-to-excel"
  - "scanned-pdf-ocr-to-excel"
features:
  - title: "Money In and Money Out"
    description: "Barclays' separate Money out and Money in columns are preserved as numeric Debit and Credit columns."
  - title: "UK Date Order"
    description: "Day-month dates are read as UK dates, so 03/04 is 3 April rather than 4 March."
  - title: "Page-Break Balances Handled"
    description: "Brought forward and carried forward lines are balances, not transactions. If one were counted by mistake, the balance check would flag it."
  - title: "GBP Amounts Cleaned"
    description: "Pound signs and thousands separators are removed so amounts can be totalled straight away."
tableColumns:
  - "Date"
  - "Description"
  - "Reference"
  - "Money Out"
  - "Money In"
  - "Balance"
sampleData:
  - date: "15/08/2026"
    desc: "BGC SALARY CREDITS CORP"
    amount: "£3,450.00"
    type: "Credit"
    balance: "£7,820.40"
  - date: "18/08/2026"
    desc: "DD BRITISH GAS ENERGY"
    amount: "£145.20"
    type: "Debit"
    balance: "£7,675.20"
  - date: "20/08/2026"
    desc: "TFL TRAVEL CHARGE LONDON"
    amount: "£8.90"
    type: "Debit"
    balance: "£7,666.30"
steps:
  - title: "Download the PDF from Barclays"
    body: "In Online Banking or the Barclays app, open the account's statements and download the period you need as a PDF."
  - title: "Upload it here"
    body: "Money in and Money out are read into separate columns, UK dates are interpreted correctly and the running balance is checked."
  - title: "Download Excel, CSV or OFX"
    body: "Use the spreadsheet for your records, or download OFX or CSV for Xero, FreeAgent, QuickBooks or Sage."
faqs:
  - question: "Where do I find Barclays statements?"
    answer: "Sign in to Barclays Online Banking or the Barclays app, choose the account and open its statements section. Select the period and download the PDF. Menu names can differ slightly between personal and business banking."
  - question: "Can I import a Barclays statement into Xero?"
    answer: "Yes. Download the OFX file from the same upload, then in Xero open the bank account, choose Manage Account and Import a Statement. CSV works too if you prefer to map columns yourself."
  - question: "Does it work with Barclays business accounts?"
    answer: "Yes. Business current account statements use the same Money out, Money in and Balance layout, and multi-page or annual statements are processed in one upload."
  - question: "Will the dates import correctly into UK software?"
    answer: "Dates are read in UK day-month order. When you import the CSV, make sure your software is set to day-month as well, which is the default in most UK editions."
---

# Converting Barclays Statements to Excel

Barclays statements list transactions with separate **Money out** and **Money in** columns, a running **Balance**, and descriptions that often wrap onto a second line for card payments and direct debits. Copying them into a spreadsheet tends to merge those columns, and US-style software can swap the day and month. Finlyzers keeps the columns separate and reads dates the UK way.

## How a Barclays Statement Is Laid Out

- **Header:** account name, sort code, account number and statement period.
- **Summary:** start balance, money in, money out and end balance for the period.
- **Transaction table:** **Date**, **Description**, **Money out**, **Money in** and **Balance**.
- **Page breaks:** many UK statements repeat the balance at the top and bottom of each page as brought forward and carried forward lines. These are balances, not transactions. They are excluded from the transaction list, and the running balance check would flag one that slipped in.

## Reading UK Statement Descriptions

UK statements use short codes in transaction descriptions. The exact wording varies by bank, but common ones include:

- **DD:** Direct Debit, such as utilities or council tax.
- **SO:** Standing Order, a fixed regular payment you set up.
- **BGC:** Bank Giro Credit, often salary or other incoming credits.
- **FPI / FPO:** Faster Payment in and out.
- **CHQ** or **TFR:** cheque or transfer.

Keeping these codes in the description column makes it easy to filter by payment type in Excel.

## Built for UK Bookkeeping

- **Money out and Money in** stay as separate numeric columns.
- **Multi-page and annual statements** are processed with the balance checked page to page.
- **Accounting imports:** download [OFX](/convert/bank-statement-to-ofx) or [CSV](/convert/bank-statement-to-csv) for Xero, FreeAgent, QuickBooks or Sage.
- **Common uses:** Self Assessment records, landlord income and expenses, mortgage applications and month-end reconciliation for limited companies.

Converting a Barclaycard or other card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel). Statements from other UK banks such as Lloyds, HSBC, NatWest or Santander work with the general [bank statement converter](/).
