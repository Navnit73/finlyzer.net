---
slug: "bank-reconciliation-tool"
title: "Free Bank Reconciliation Tool"
shortTitle: "Bank Reconciliation Tool"
metaTitle: "Free Bank Reconciliation Tool: Reconcile Statements Online | Finlyzers"
metaDescription: "Reconcile a bank statement with your ledger online. Upload a PDF, scan, CSV or Excel file and get matched, missing and duplicate transactions plus balance checks. Free up to 10 pages."
intro: "Upload your bank statement and your ledger or cash book. Every transaction is matched by amount, direction and date, and you get a report of what agrees, what is missing on either side and whether the balances tie out."
badgeText: "Bank reconciliation"
dateModified: "2026-10-15"
keywords:
  - "bank reconciliation tool"
  - "bank statement reconciliation online"
  - "bank reconciliation software free"
  - "free bank reconciliation software"
  - "online bank reconciliation"
  - "reconcile bank statement online"
related:
  - "bank-statement-vs-ledger"
  - "bank-statement-matching-tool"
  - "bank-reconciliation-calculator"
benefits:
  - "Matched, missing and duplicate transactions in one report"
  - "Opening, closing and running balances checked on both sides"
  - "Works with PDF, scanned, CSV and Excel files, no software to install"
steps:
  - title: "Upload two files"
    body: "Add the bank statement and your ledger, cash book or accounting export. Each can be a PDF, a scan or photo, a CSV or an .xlsx file."
  - title: "Transactions are matched"
    body: "Both documents are read, then every bank line is paired with a ledger entry of the same amount and direction within your date tolerance."
  - title: "Review and download"
    body: "See matched pairs, items on one side only, mismatches and duplicates on screen, then download the full report as Excel or CSV."
sampleRows:
  - date: "2026-10-01"
    bankDesc: "NEFT CR ACME TRADERS"
    bankAmount: "+25,000.00"
    ledgerDesc: "Receipt: Acme Traders inv 1182"
    ledgerAmount: "+25,000.00"
    result: "Matched (same date)"
  - date: "2026-10-04"
    bankDesc: "CHQ 004512 OFFICE RENT"
    bankAmount: "−18,000.00"
    ledgerDesc: "Rent October, chq 004512"
    ledgerAmount: "−18,000.00"
    result: "Matched (reference)"
  - date: "2026-10-06"
    bankDesc: "SMS ALERT CHARGES"
    bankAmount: "−59.00"
    ledgerDesc: ""
    ledgerAmount: ""
    result: "Only on bank statement"
  - date: "2026-10-09"
    bankDesc: ""
    bankAmount: ""
    ledgerDesc: "Chq 004519 to Delta Supplies"
    ledgerAmount: "−7,450.00"
    result: "Only in ledger"
features:
  - title: "Reads PDFs and Spreadsheets"
    description: "Digital and scanned PDFs and photos go through OCR; CSV and .xlsx files are read directly from their header row."
  - title: "Rule-Based Matching"
    description: "Matching is deterministic, not AI. The same two files always produce the same report, so the result can be checked and repeated."
  - title: "Debit/Credit Conventions"
    description: "If your ledger records bank deposits as debits, the convention is detected and directions are flipped before matching."
  - title: "Balances Verified"
    description: "Opening plus credits minus debits is checked against the closing balance for both documents, row by row where balances are printed."
faqs:
  - question: "Is this bank reconciliation tool free?"
    answer: "Yes, for reconciliations up to 10 pages in total across both files, with no signup. From 11 to 30 pages you can see the summary free and pay a one-time fee to unlock every transaction and the download. Above 30 pages you need a free account, and the pages come from your account's page credits."
  - question: "What files can I upload?"
    answer: "PDF bank statements (digital or scanned), images (PNG, JPG, WEBP, TIFF), CSV files and Excel .xlsx files. Legacy .xls files and password-protected PDFs are not supported; save the file as .xlsx or upload an unlocked copy."
  - question: "What counts as a page?"
    answer: "Each PDF page counts as one page, and each image, CSV or Excel file counts as one page. The bank statement and the ledger are added together, so a 6-page statement and a ledger spreadsheet count as 7 pages."
  - question: "How are transactions matched?"
    answer: "A bank line and a ledger entry are candidates when they have the same amount and direction and their dates are within the date tolerance you choose (2 days by default). Candidates are scored on date closeness, matching references and similar descriptions, and each transaction is matched at most once."
  - question: "Can it reconcile statements in any currency?"
    answer: "Yes, as long as both documents are in the same currency. Common symbols and ISO codes are recognised, and amounts are rounded to the currency's normal decimal places. Different currencies on the two documents stop the reconciliation rather than comparing them."
  - question: "Do unmatched items mean there is an error or fraud?"
    answer: "No. Most differences are timing items such as outstanding cheques, deposits in transit or bank fees not yet recorded. The report lists them with a reason so you can decide which need an adjusting entry."
  - question: "How long do you keep my files?"
    answer: "Guest reconciliations and their extracted data are deleted automatically after 7 days. Reconciliations run while signed in stay available on your account."
---

# How to Reconcile a Bank Statement Online

Bank reconciliation means proving that the cash balance in your books agrees with the balance the bank reports, and explaining every difference. Done by hand, it means ticking off each line of the statement against the cash book. This tool does the ticking for you:

1. **Export your ledger.** From QuickBooks, Xero, Tally, Zoho Books, Sage or a spreadsheet cash book, export the bank account's transactions for the same period as the statement, as Excel or CSV if you can.
2. **Upload both files.** The bank statement can be the PDF from online banking, a scan or a CSV download.
3. **Work through the report.** Start with the items that appear on only one side, then the mismatches. Matched pairs need no action.

# What Makes a Statement and a Ledger Disagree

Almost every difference falls into one of a few groups, and the report sorts them for you:

- **Timing differences.** A cheque you wrote is in the ledger but has not cleared yet, or a deposit you recorded on the 31st reaches the bank on the 2nd. These show up as items only in the ledger.
- **Bank-only items.** Service charges, interest, card fees and direct debits often appear on the statement before anyone records them. These show up as items only on the bank statement.
- **Recording errors.** A transposed figure (540 recorded as 450) or a payment recorded as a receipt. These appear as amount or direction mismatches when the two entries are clearly linked by reference or description.
- **Duplicates.** The same entry recorded twice in one document. These are flagged but never removed.

## Checking That the Report Is Complete

The book-to-bank check ties everything together. It compares the change between the two balances with the net effect of every unmatched item and mismatch. When the **unexplained difference is zero**, the items listed fully explain why your books and the bank disagree. A non-zero figure usually means a transaction was missed or misread during extraction, so check the warnings section first.

## Related Tools

If you only need the arithmetic of a bank reconciliation statement, use the [bank reconciliation calculator](/reconcile/bank-reconciliation-calculator). To compare a statement with a cash book line by line, see [bank statement vs ledger comparison](/reconcile/bank-statement-vs-ledger), and for how individual transactions are paired, see the [bank statement matching tool](/reconcile/bank-statement-matching-tool). If you need the statement itself as a spreadsheet first, the [bank statement to Excel converter](/convert/bank-statement-to-excel) turns a PDF into an .xlsx file.
