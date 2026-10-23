---
slug: "anz-bank-statement-to-excel"
title: "ANZ Bank Statement to Excel Converter"
metaTitle: "ANZ Bank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert ANZ Australia statement PDFs to Excel or CSV. Withdrawals and deposits in separate columns, dates read day first, balance checked. Free up to 10 pages."
intro: "Convert ANZ Australia account statement PDFs into Excel or CSV. Withdrawals and deposits land in separate columns, dates are read in Australian day-month order and the running balance is checked."
category: "au-banks"
bankName: "ANZ"
statementLabel: "ANZ Bank Statement"
outputFormat: "Excel"
country: "Australia"
badgeText: "Australia · ANZ statements"
dateModified: "2026-10-23"
keywords:
  - "anz bank statement to excel"
  - "anz statement to csv"
  - "convert anz pdf statement"
  - "anz business statement to excel"
related:
  - "bank-statement-to-qbo"
  - "bank-statement-to-csv"
  - "commbank-statement-to-excel"
  - "credit-card-statement-to-excel"
features:
  - title: "Withdrawals and Deposits Split"
    description: "ANZ's withdrawal and deposit amounts are kept as separate numeric Debit and Credit columns, ready to total or pivot."
  - title: "Australian Dates"
    description: "Dates are read day first, so 09/10 is 9 October. Where only the day and month are printed, the year is taken from the statement period."
  - title: "Balance Checked Row by Row"
    description: "The running balance is recalculated from the opening balance, so a missing or doubled transaction stands out straight away."
  - title: "Ready for QuickBooks Online and Xero"
    description: "Download QBO, OFX or CSV from the same upload instead of retyping transactions into your accounting software."
tableColumns:
  - "Date"
  - "Transaction Details"
  - "Withdrawals"
  - "Deposits"
  - "Balance"
sampleData:
  - date: "02/09/2026"
    desc: "PAYMENT FROM EXAMPLE CUSTOMER INV 2207"
    amount: "$1,980.00"
    type: "Credit"
    balance: "$9,312.45"
  - date: "04/09/2026"
    desc: "VISA DEBIT PURCHASE CARD 1234 EXAMPLE CAFE MELBOURNE"
    amount: "$14.50"
    type: "Debit"
    balance: "$9,297.95"
  - date: "05/09/2026"
    desc: "BPAY EXAMPLE WATER UTILITY"
    amount: "$248.70"
    type: "Debit"
    balance: "$9,049.25"
steps:
  - title: "Download the PDF from ANZ"
    body: "Sign in to ANZ Internet Banking or the ANZ App, open the account and go to its statements. Choose the period and download the PDF. Business banking menus may be named differently."
  - title: "Upload it here"
    body: "Withdrawals and deposits are read into separate columns, dates are read day first and the running balance is checked."
  - title: "Download Excel, CSV or QBO"
    body: "Open the spreadsheet in Excel or Google Sheets, or download QBO for QuickBooks Online and OFX or CSV for Xero."
faqs:
  - question: "Where do I find my ANZ statements?"
    answer: "Sign in to ANZ Internet Banking or the ANZ App, choose the account and open its statements section. Select the period and download the PDF. Menu names can change, and business accounts may use a different menu."
  - question: "Can I download ANZ transactions directly instead?"
    answer: "ANZ Internet Banking lets you export recent transactions for accounts you can access, which is often enough for the last few months. Older periods, closed accounts and statements emailed to you by a client are usually only available as PDFs."
  - question: "Does it work with ANZ Plus?"
    answer: "ANZ Plus has its own app and statements, which may be laid out differently from ANZ's other accounts. Upload the statement PDF and check the result; debit, credit and balance columns are read in the same way."
  - question: "Can I import an ANZ statement into QuickBooks Online?"
    answer: "Yes. Download the QBO file from the same upload and import it into the matching bank account in QuickBooks Online. CSV works too if you would rather map the columns yourself."
  - question: "Does this page cover ANZ New Zealand?"
    answer: "This page is written for ANZ Australia statements. ANZ New Zealand statements are in NZD and may be laid out differently, so check the result carefully if you upload one."
---

# Converting ANZ Statements to Excel

ANZ statements put each amount in either a withdrawals column or a deposits column, with a running balance on the right. That is easy to read on paper, but when you copy the table into a spreadsheet the two columns often collapse into one, amounts come through as text, and longer card descriptions split over two rows. Finlyzers reads the statement as a table, keeps withdrawals and deposits apart, and checks that the balance still adds up.

## How an ANZ Statement Is Usually Presented

- **Header:** account name, BSB and account number, and the statement period.
- **Summary:** an opening balance, totals withdrawn and deposited, and a closing balance.
- **Transaction table:** commonly labelled **Date**, **Transaction Details**, **Withdrawals ($)**, **Deposits ($)** and **Balance ($)**.
- **Balance lines:** opening and closing balance lines are balances rather than transactions, so they are left out of the transaction list and used for the balance check.

Everyday accounts such as ANZ Access Advantage, savings accounts such as ANZ Online Saver, and ANZ business accounts broadly follow this pattern. Labels can differ slightly between account types and older statement versions.

## Reading ANZ Transaction Details

Australian statements spell payment types out in words. The wording below is typical of what you will see, but it varies:

- **Visa Debit purchase:** card spending, usually with part of the card number, the merchant and the location.
- **EFTPOS:** purchases made by choosing the savings or cheque option at the terminal.
- **Payment from / Transfer from:** money received, including salary and transfers from other people. Fast payments may show Osko or a PayID reference.
- **Payment to / Transfer to:** money sent from ANZ Internet Banking or the ANZ App.
- **BPAY:** bills paid through BPAY to a named biller.
- **Direct debits:** regular amounts collected by businesses such as insurers, phone providers or lenders.

Keeping the full wording in the Description column lets you filter in Excel, for example on Visa Debit to review card spending for a month.

## When a PDF Is the Only Source

ANZ's own transaction export is fine for recent activity on accounts you can sign in to. You will usually need to convert the PDF when:

- You need transactions from further back than the export reaches.
- The account is closed, or belonged to a family member whose affairs you are managing.
- You are an accountant or bookkeeper and a client has emailed you their statements.
- A mortgage broker has asked for statements and you want to check the figures in a spreadsheet first.
- You only have a printed statement that you have scanned.

## Using ANZ Data for Tax and Bookkeeping

- **Sole traders and small businesses:** import into accounting software, code each transaction and reconcile before preparing a BAS. Download [QBO for QuickBooks Online](/convert/bank-statement-to-qbo), or [OFX](/convert/bank-statement-to-ofx) or [CSV](/convert/bank-statement-to-csv) for Xero. For MYOB, check which bank statement file formats your edition imports.
- **Individual tax returns:** total interest earned, donations and work-related purchases for the financial year from 1 July to 30 June.
- **Investment properties:** list rent received and expenses such as rates, strata and repairs, and keep the spreadsheet with your property records.
- **Household budgets:** pivot a few months of card spending by merchant to see where the money goes.

Whichever software you import into, make sure it expects DD/MM/YYYY dates, otherwise days and months can be swapped.

## Other Australian Banks

Statements from other major banks work the same way. If you also have accounts with the Commonwealth Bank, use the [CommBank statement converter](/convert/commbank-statement-to-excel), and for Westpac accounts the [Westpac statement converter](/convert/westpac-bank-statement-to-excel).

Converting an ANZ credit card statement? Use the [credit card converter](/convert/credit-card-statement-to-excel), which keeps purchases and payments in separate columns. For paper statements, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
