---
slug: "td-bank-statement-to-excel"
title: "TD Bank Statement to Excel Converter"
metaTitle: "TD Bank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert TD Bank checking, savings and business statement PDFs to Excel or CSV. Daily account activity sections merged into one list. Free up to 10 pages."
intro: "Convert statement PDFs from TD Bank in the United States into Excel or CSV, with deposits, electronic payments, checks and other withdrawals combined into one date-ordered list."
category: "us-banks"
bankName: "TD Bank"
statementLabel: "TD Bank Statement"
outputFormat: "Excel"
country: "United States"
badgeText: "TD Bank statements"
dateModified: "2026-10-23"
keywords:
  - "td bank statement to excel"
  - "td bank statement to csv"
  - "convert td bank pdf statement"
  - "td bank business statement to excel"
related:
  - "pnc-bank-statement-to-excel"
  - "bank-of-america-statement-to-excel"
  - "bank-statement-to-qbo"
  - "csv-to-qbo"
features:
  - title: "Activity Sections Merged"
    description: "Deposits, electronic deposits, checks paid, electronic payments and other withdrawals become one date-ordered list."
  - title: "ACH Details Kept"
    description: "Long electronic payment descriptions, including company names and ACH codes, are joined into one cell instead of splitting across rows."
  - title: "Totals Verified"
    description: "Extracted rows are compared with the account summary and the ending balance for the period."
  - title: "Check Numbers Kept"
    description: "Check numbers from the checks paid section stay in the Reference column for matching against your register."
tableColumns:
  - "Date"
  - "Description"
  - "Reference"
  - "Debit"
  - "Credit"
  - "Balance"
sampleData:
  - date: "05/11/2026"
    desc: "CCD DEPOSIT, SAMPLE PAYMENTS INC SETTLEMENT"
    amount: "+$1,875.40"
    type: "Credit"
    balance: "$11,062.15"
  - date: "05/12/2026"
    desc: "ELECTRONIC PMT-WEB, EXAMPLE INSURANCE CO"
    amount: "-$289.00"
    type: "Debit"
    balance: "$10,773.15"
  - date: "05/13/2026"
    desc: "CHECK 1318"
    amount: "-$950.00"
    type: "Debit"
    balance: "$9,823.15"
steps:
  - title: "Download the PDF from TD Bank"
    body: "Sign in to TD Bank online banking or the TD Bank app, open the account and look for statements. Choose the period and save the PDF."
  - title: "Upload it here"
    body: "Each activity section is read, wrapped descriptions are joined and the transactions are checked against the account summary."
  - title: "Download Excel or CSV"
    body: "Open the spreadsheet in Excel or Google Sheets, or download QBO, OFX or QIF from the same upload."
faqs:
  - question: "Where do I find my TD Bank statements?"
    answer: "Sign in to TD Bank online banking or the TD Bank app, choose the account and open its statements area. Select the period and download the PDF. Menu names can differ between personal and business banking."
  - question: "Is this for TD Bank in the US or TD Canada Trust?"
    answer: "This page is about TD Bank, the US bank with branches along the East Coast, and its US dollar statements. TD Canada Trust statements are a different layout; upload them through the general bank statement converter instead."
  - question: "Why are TD Bank transactions split into several sections?"
    answer: "TD Bank statements usually group daily account activity by type, such as deposits, checks paid and electronic payments. The converter combines those sections into one list sorted by date."
  - question: "Does it work with TD Bank business checking statements?"
    answer: "Yes. Business statements with many electronic deposits, card settlements and checks are processed in one upload, with check numbers kept in the Reference column."
  - question: "Can I import a TD Bank statement into QuickBooks?"
    answer: "Yes. Download the QBO file from the same upload and import it into the matching account in QuickBooks Online or Desktop."
---

# Converting TD Bank Statements to Excel

This page covers **TD Bank**, the US bank with branches along the East Coast from Maine to Florida, and its US dollar checking, savings and business statements. It is the US arm of the Toronto-Dominion group, which also runs TD Canada Trust in Canada. Canadian statements look different and use Canadian dollars; if that is what you have, use the general [bank statement converter](/) instead.

TD Bank statements are thorough but awkward to work with in a spreadsheet. Activity is usually grouped by type rather than listed in date order, electronic payment descriptions run long, and only some lines carry a balance. Finlyzers combines the sections into one list with separate debit and credit columns.

## How a TD Bank Statement Is Typically Laid Out

Headings vary between account types and have changed over time, but a TD Bank checking statement commonly includes:

- **Account summary:** the beginning balance, totals for deposits and withdrawals by type, and the ending balance. Interest earned and fees may also be summarised here.
- **Daily account activity:** transactions grouped into sections such as deposits, electronic deposits, other credits, checks paid, electronic payments and other withdrawals, each with its own subtotal.
- **Daily balance summary:** the end-of-day balance for each date with activity.

Because individual lines usually do not show a running balance, the converter checks the extracted rows against the totals in the account summary and confirms that the beginning balance plus credits minus debits equals the ending balance.

## Reading TD Bank Electronic Payment Descriptions

A lot of the activity on a TD Bank account, especially a business account, arrives as ACH transfers. Their descriptions are built from what the sending company submits, so they often look cryptic. You will commonly see:

- **ACH standard entry codes** such as **CCD** (a company-to-company payment, common for card processor settlements and vendor payments) and **PPD** (a payment to or from a consumer account, common for payroll and personal bills).
- **Payment channel labels** such as WEB for payments authorised online.
- **The company name** and sometimes an ID or invoice reference from the sender.

These details are useful when you categorise transactions. A business owner reconciling sales can filter the description column for the card processor's name to pull out every settlement, then match them against sales reports. The converter keeps the full description together in one cell so that filter works.

## When You Still Need to Convert the PDF

TD Bank online banking usually lets you download recent activity for an open account. Converting the statement PDF is still the practical route when:

- you need history older than the download covers, such as a complete prior tax year;
- the account has been closed;
- a client or borrower sent you statements as PDFs instead of a download;
- you need figures that tie back exactly to the official monthly statement.

## What You Get

- **One date-ordered list** built from every activity section.
- **Separate Debit and Credit columns** with positive amounts.
- **Check numbers** in the Reference column.
- **Multi-page and multi-month PDFs** processed in one upload.

## Typical Uses

Small businesses on the East Coast use converted TD Bank statements to reconcile checking in QuickBooks or Xero, match card processor deposits against sales, and prepare Schedule C figures for a tax return. Households use them for budgeting and to supply transaction history for a mortgage or rental application. Download [QBO for QuickBooks](/convert/bank-statement-to-qbo), [OFX](/convert/bank-statement-to-ofx) or [CSV](/convert/bank-statement-to-csv) from the same upload. If you already have a CSV export from TD Bank and need it in QuickBooks, the [CSV to QBO converter](/convert/csv-to-qbo) handles that step. Statements from other US banks are covered in the [PNC](/convert/pnc-bank-statement-to-excel) and [Bank of America](/convert/bank-of-america-statement-to-excel) guides.

Converting a TD credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements or scans, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
