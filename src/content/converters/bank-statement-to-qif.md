---
slug: "bank-statement-to-qif"
title: "Bank Statement to QIF Converter"
metaTitle: "Bank Statement to QIF Converter for Quicken | Finlyzers"
metaDescription: "Convert PDF bank statements to QIF files for Quicken, GnuCash, Moneydance and older finance software. Date, amount and payee per transaction."
intro: "Turn PDF bank statements into QIF (Quicken Interchange Format) files for Quicken, GnuCash, Moneydance and other desktop finance programs that import QIF."
category: "formats"
bankName: "Bank"
outputFormat: "Quicken QIF"
country: "Global"
badgeText: "Quicken (.qif)"
keywords:
  - "bank statement to qif"
  - "pdf to qif"
  - "bank statement to quicken"
  - "qif converter"
related:
  - "wells-fargo-bank-statement-to-excel"
  - "chase-bank-statement-to-excel"
  - "credit-card-statement-to-excel"
  - "scanned-pdf-ocr-to-excel"
features:
  - title: "Plain-Text QIF Records"
    description: "One record per transaction with date, signed amount and payee, in the layout QIF readers expect."
  - title: "For Desktop Finance Software"
    description: "Suited to GnuCash, Moneydance, AceMoney and older accounting packages that only accept QIF."
  - title: "Balance Checked"
    description: "Transactions are reconciled against the statement's running balance before the file is written."
  - title: "Clean Payees"
    description: "Payee names are tidied so memorized payees and categories have a better chance of matching."
tableColumns:
  - "Date"
  - "Payee"
  - "Amount"
  - "Type"
  - "Balance"
sampleData:
  - date: "06/01/2026"
    desc: "PAYCHECK ACME CORP DIRECT DEP"
    amount: "+$3,450.00"
    type: "Credit"
    balance: "$6,912.44"
  - date: "06/02/2026"
    desc: "MORTGAGE PMT ROCKET"
    amount: "-$1,875.00"
    type: "Debit"
    balance: "$5,037.44"
  - date: "06/04/2026"
    desc: "WHOLE FOODS MARKET #10233"
    amount: "-$142.67"
    type: "Debit"
    balance: "$4,894.77"
steps:
  - title: "Upload the statement"
    body: "Drop the PDF for the checking, savings or card account you manage in desktop software, scanned or digital."
  - title: "Transactions become QIF records"
    body: "Each line is written with a D (date), T (amount) and P (payee) field, after the running balance is verified."
  - title: "Import the QIF file"
    body: "Use your program's QIF import option and choose the account the transactions belong to."
faqs:
  - question: "How do I import a QIF file into Quicken?"
    answer: "In Quicken choose File, then Import, then QIF File, select the downloaded file and pick the account. Note that recent Quicken for Windows versions restrict QIF imports into checking, savings and credit card accounts, so check your version's import options first."
  - question: "Which programs accept QIF?"
    answer: "GnuCash, Moneydance, AceMoney, Quicken for Mac and many older accounting and personal finance programs. Some also accept OFX, which carries more detail."
  - question: "My dates imported with day and month swapped. Why?"
    answer: "QIF does not record whether a date is month/day or day/month. When importing statements that use day/month dates, tell your program which order to expect, or convert to OFX instead."
  - question: "Should I use QIF or OFX?"
    answer: "Use QIF when your software only accepts QIF. For Xero and most modern tools, OFX or CSV is a better fit, and QuickBooks users should choose QBO."
---

# Convert Bank Statements to QIF

QIF (Quicken Interchange Format) is one of the oldest bank data formats still in use. It is plain text, easy to inspect, and supported by many desktop finance programs. Finlyzers converts PDF statements into QIF so you can load past transactions without typing them in.

## How a QIF File Is Structured

A QIF file starts with a header such as `!Type:Bank` (or `!Type:CCard` for a credit card), followed by one record per transaction. Each record uses single-letter field codes:

- `D` for the **date**
- `T` for the **amount**, negative for money out
- `P` for the **payee**
- `^` to **end the record**

Because it is plain text, you can open a QIF file in any text editor to check it before importing.

## Importing Into Desktop Software

- **GnuCash:** File, then Import, then Import QIF, and follow the assistant to match accounts.
- **Moneydance:** File, then Import, and choose the QIF file and target account.
- **Quicken:** File, then Import, then QIF File. Recent Quicken for Windows releases limit QIF imports into bank and card accounts, so confirm what your version allows before relying on QIF.

## Things to Watch For

- **Date order.** QIF has no field for date format. Statements from the UK, India, Australia and most other countries use day/month order, so check the first few transactions after importing.
- **One account per file.** A QIF file should hold transactions for a single account.
- **No unique transaction IDs.** Unlike OFX, QIF records do not carry an ID, so re-importing the same period creates duplicates.

## Choosing Another Format

If your software accepts it, [OFX](/convert/bank-statement-to-ofx) is usually more reliable than QIF. QuickBooks users should use [QBO](/convert/bank-statement-to-qbo), and [CSV](/convert/bank-statement-to-csv) or [Excel](/convert/bank-statement-to-excel) are better for reviewing data in a spreadsheet.
