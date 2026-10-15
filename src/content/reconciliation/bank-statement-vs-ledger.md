---
slug: "bank-statement-vs-ledger"
title: "Compare Bank Statement vs Ledger"
shortTitle: "Bank Statement vs Ledger"
metaTitle: "Bank Statement vs Ledger Comparison: Bank Ledger Reconciliation | Finlyzers"
metaDescription: "Compare a bank statement with your ledger or cash book side by side. Find entries missing from either document, amount and direction mismatches and duplicates. Free up to 10 pages."
intro: "Put your bank statement next to your general ledger bank account or cash book and see, line by line, which entries agree, which exist on only one side and which were recorded with a different amount or direction."
badgeText: "Statement vs ledger"
dateModified: "2026-10-15"
keywords:
  - "bank statement vs ledger comparison"
  - "bank ledger reconciliation"
  - "compare bank statement with ledger"
  - "compare bank statement with cash book"
  - "bank book reconciliation"
  - "cash book vs bank statement"
related:
  - "bank-reconciliation-tool"
  - "bank-statement-matching-tool"
  - "bank-reconciliation-calculator"
benefits:
  - "Side-by-side view of every bank line and its ledger entry"
  - "Entries missing from either side, each with a reason"
  - "Handles ledgers that record deposits as debits"
steps:
  - title: "Export the ledger"
    body: "Export the bank account from your accounting software, or use your cash book spreadsheet, for the same dates as the statement."
  - title: "Upload both documents"
    body: "Add the bank statement and the ledger. Both are read into date, description, reference, amount and direction."
  - title: "Compare and resolve"
    body: "Review the side-by-side matches and the gaps on each side, then post the adjustments your books need."
sampleRows:
  - date: "2026-09-02"
    bankDesc: "ACH CREDIT NORTHWIND LLC"
    bankAmount: "+4,200.00"
    ledgerDesc: "Northwind LLC payment"
    ledgerAmount: "+4,200.00"
    result: "Matched (1 day apart)"
  - date: "2026-09-05"
    bankDesc: "CHECK 2291"
    bankAmount: "−540.00"
    ledgerDesc: "Check 2291 Contoso Ltd"
    ledgerAmount: "−450.00"
    result: "Amount mismatch (90.00)"
  - date: "2026-09-12"
    bankDesc: "TRANSFER FROM SAVINGS"
    bankAmount: "+1,000.00"
    ledgerDesc: "Transfer to savings"
    ledgerAmount: "−1,000.00"
    result: "Direction mismatch"
  - date: "2026-09-30"
    bankDesc: "INTEREST PAID"
    bankAmount: "+3.12"
    ledgerDesc: ""
    ledgerAmount: ""
    result: "Only on bank statement"
features:
  - title: "Any Ledger Layout"
    description: "Spreadsheet headers such as Date, Narration, Particulars, Debit, Credit, Withdrawal, Deposit or a signed Amount column are recognised automatically."
  - title: "Book Convention Detected"
    description: "Accounting books often record a bank deposit as a debit. Both readings are tried and the one that matches clearly more entries is used."
  - title: "Mismatches, Not Just Gaps"
    description: "Entries linked by reference or a similar description but with a different amount or the opposite direction are reported as mismatches."
  - title: "Ledger Balances Checked Too"
    description: "Opening, closing and running balances are verified for the ledger as well as the bank statement."
faqs:
  - question: "What is the difference between a bank statement and a ledger?"
    answer: "A bank statement is the bank's record of money moving through your account. A ledger, bank book or cash book is your own record of the same account. Reconciliation compares the two and explains every difference."
  - question: "Which ledger export should I use?"
    answer: "Use the transaction list for the bank account itself, not the whole general ledger, covering the same period as the statement. Excel (.xlsx) or CSV exports work best because they are read directly without OCR."
  - question: "My ledger uses debit for money coming in. Will that work?"
    answer: "Yes. In accounting books a bank deposit is usually a debit, the opposite of how the bank statement shows it. The comparison tries both conventions and switches to the book convention when it produces clearly more matches. The report says when it did this."
  - question: "What is a direction mismatch?"
    answer: "Two entries with the same amount that are clearly linked, by reference or a similar description, but recorded in opposite directions: for example a transfer recorded as money out in the ledger that the bank shows as money in."
  - question: "Can I compare a bank statement with a cash book kept in Excel?"
    answer: "Yes. The spreadsheet needs a header row within its first 30 rows with a date column and at least one amount column. Rows starting with Opening Balance or Balance B/F set the opening balance."
  - question: "Does it work with non-English ledgers?"
    answer: "Common German, French, Spanish, Portuguese and Dutch column headers are recognised, such as Buchungstag, Libellé, Importe, Valor and Bedrag, as well as comma-decimal number formats like 1.234,56."
---

# Comparing a Bank Statement With Your Ledger

A ledger and a bank statement describe the same account from two sides, so in theory every line on one should appear on the other. In practice they drift apart: your books record a cheque the day you write it, the bank records it the day it clears, and fees appear on the statement before anyone posts them. Comparing the two documents line by line is how you find out which differences are expected and which are mistakes.

# What the Comparison Looks For

Each entry is reduced to a date, an amount, a direction (money in or out), a reference and description keywords. Then:

- **Matched** entries have the same amount and direction and dates within your tolerance. Matching references and similar descriptions raise the confidence.
- **Amount mismatches** share a reference, or have a similar description and amounts within 20% of each other, inside the date tolerance. The difference is shown.
- **Direction mismatches** have the same amount but opposite directions and are linked by reference or description.
- **Unmatched** entries have no partner. The reason is given, for example that the nearest entry with the same amount is six days away, outside a two-day tolerance.

## Bank Ledger Reconciliation Step by Step

1. **Start from the same period.** Export the ledger for exactly the statement's date range, so opening and closing balances line up.
2. **Clear the timing items.** Entries only in the ledger near the end of the period are usually outstanding cheques or deposits in transit. They will clear on next month's statement.
3. **Post the bank-only items.** Fees, interest and direct debits only on the statement usually need an entry in your books.
4. **Fix the mismatches.** An amount or direction mismatch points to a data entry error in one of the two documents.
5. **Confirm the balance.** Once the remaining differences are explained, the book-to-bank check's unexplained difference should be zero.

For the adjusted-balance arithmetic, use the [bank reconciliation calculator](/reconcile/bank-reconciliation-calculator). The [bank reconciliation tool](/reconcile/bank-reconciliation-tool) page covers file formats and limits in more detail.
