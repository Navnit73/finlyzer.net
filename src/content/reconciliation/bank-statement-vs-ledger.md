---
slug: "bank-statement-vs-ledger"
title: "Bank Statement vs Ledger: Compare Line by Line and Reconcile"
shortTitle: "Bank Statement vs Ledger"
metaTitle: "Bank Statement vs Ledger Comparison Tool | Finlyzers"
metaDescription: "Compare a bank statement with your ledger or cash book side by side. Find missing entries, amount and direction mismatches and duplicates. Free up to 10 pages."
intro: "Put your bank statement next to your general ledger bank account or cash book and see, line by line, which entries agree, which exist on only one side and which were recorded with a different amount or direction. Use it to speed up your monthly bank reconciliation."
badgeText: "Statement vs ledger"
dateModified: "2026-10-16"
keywords:
  - "bank statement vs ledger comparison"
  - "bank ledger reconciliation"
  - "compare bank statement with ledger"
  - "compare bank statement with cash book"
  - "bank book reconciliation"
  - "cash book vs bank statement"
  - "reconciling bank statements"
  - "monthly bank reconciliation"
  - "bank rec"
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
    icon: "layout"
    description: "Spreadsheet headers such as Date, Narration, Particulars, Debit, Credit, Withdrawal, Deposit or a signed Amount column are recognised automatically."
  - title: "Book Convention Detected"
    icon: "direction"
    description: "Accounting books often record a bank deposit as a debit. The tool tries both readings and uses the one that matches clearly more entries."
  - title: "Mismatches, Not Just Gaps"
    icon: "compare"
    description: "Entries linked by reference or a similar description but with a different amount or the opposite direction are reported as mismatches."
  - title: "Ledger Balances Checked Too"
    icon: "balance"
    description: "The tool verifies opening, closing and running balances for the ledger as well as the bank statement."
faqs:
  - question: "What is the difference between a bank statement and a ledger?"
    answer: "A bank statement is the bank's record of money moving through your account. A ledger, bank book or cash book is your own record of the same account. Reconciliation compares the two and explains every difference."
  - question: "Which ledger export should I use?"
    answer: "Use the transaction list for the bank account itself, not the whole general ledger, covering the same period as the statement. Excel (.xlsx) or CSV exports work best because the tool reads them directly without OCR."
  - question: "My ledger uses debit for money coming in. Will that work?"
    answer: "Yes. In accounting books a bank deposit is usually a debit, the opposite of how the bank statement shows it. The comparison tries both conventions and switches to the book convention when it produces clearly more matches. The report says when it did this."
  - question: "What is a direction mismatch?"
    answer: "Two entries with the same amount that are clearly linked, by reference or a similar description, but recorded in opposite directions: for example a transfer recorded as money out in the ledger that the bank shows as money in."
  - question: "What is an amount mismatch?"
    answer: "Two entries that share a reference, or have a similar description and amounts within 20% of each other, inside your date tolerance. The report shows the difference, which usually points to a keying error such as 540 entered as 450."
  - question: "Can I compare a bank statement with a cash book kept in Excel?"
    answer: "Yes. The spreadsheet needs a header row within its first 30 rows with a date column and at least one amount column. Rows starting with Opening Balance or Balance B/F set the opening balance."
  - question: "Does it work with non-English ledgers?"
    answer: "Common German, French, Spanish, Portuguese and Dutch column headers are recognised, such as Buchungstag, Libellé, Importe, Valor and Bedrag, as well as comma-decimal number formats like 1.234,56."
  - question: "Why is a ledger entry missing from my bank statement?"
    answer: "The most common reason is timing. A cheque you recorded on the 30th may clear on the 3rd, and a deposit may reach the bank days after you record it. These entries clear on the next statement. Entries that stay missing for weeks deserve a follow-up."
  - question: "Should the ledger and statement cover the same dates?"
    answer: "Yes. Export the ledger for exactly the statement's date range so the opening and closing balances line up. A mismatched range creates false gaps at the start and end of the period."
---

# Bank Statement vs Ledger: Compare Every Line and Find the Gaps

A bank statement and a ledger describe the same account from two sides, so every line on one should appear on the other. In practice they drift apart. Your books record a cheque the day you write it, the bank records it the day it clears, and fees reach the statement before anyone posts them. This page shows how to compare the two documents line by line, and how the tool does it for you.

**Quick answer:** Export your ledger for the same dates as the statement, upload both files above, then work through the entries that exist on only one side and the mismatches. Matched pairs need no action.

## Bank Statement vs Ledger: What Is the Difference?

The two documents record the same cash, but they differ in who keeps them, when they record and which direction they use.

| Feature                   | Bank statement                | Ledger or cash book                          |
| ------------------------- | ----------------------------- | -------------------------------------------- |
| Who keeps it              | The bank                      | You or your accountant                       |
| When it records a payment | When the bank processes it    | When you write or record it                  |
| Deposit shown as          | Credit (money in)             | Usually a debit in accounting books          |
| Typical extra entries     | Fees, interest, direct debits | Cheques not yet cleared, deposits in transit |
| Role in reconciliation    | The independent record        | The record you correct                       |

### Why the Debit and Credit Directions Look Reversed

A bank describes your account from its own point of view. Your deposit is money the bank owes you, so the bank records a credit. In your books, the same deposit increases an asset, so you record a debit. Both entries are correct, and the tool detects which convention your ledger uses before it matches anything.

### Ledger, Bank Book and Cash Book: Which Do You Have?

Different businesses use different names for the same record.

- **General ledger bank account.** The bank account's transaction list in your accounting software.
- **Bank book.** A separate book that records only bank transactions.
- **Cash book.** A book with a cash column and a bank column. Compare only the bank column with the statement.

## How to Compare a Bank Statement With a Ledger

The tool replaces the slow part of the job: ticking off hundreds of lines by hand.

1. **Export the ledger.** From QuickBooks, Xero, Tally, Zoho Books, Sage, NetSuite or a spreadsheet, export the bank account's transactions for the statement's exact date range.
2. **Upload both documents.** The statement can be a PDF, a scan or photo, a CSV or an Excel file. The ledger works best as Excel or CSV.
3. **Set your date tolerance.** The default is 2 days. Widen it if cheques in your business clear slowly.
4. **Review the comparison.** Read the matched pairs, then the gaps on each side, then the mismatches.
5. **Post your adjustments and download.** Record the entries your books need, then save the report as your working paper.

### What the Comparison Looks For

The tool reduces each entry to a date, an amount, a direction (money in or out), a reference and description keywords. Then it sorts every entry into one of these groups.

- **Matched.** The entries have the same amount and direction, with dates inside your tolerance. A matching reference or similar description raises the confidence.
- **Amount mismatch.** The entries share a reference, or have a similar description with amounts within 20% of each other, inside the date tolerance. The report shows the difference.
- **Direction mismatch.** The entries have the same amount but opposite directions, and a reference or description links them.
- **Unmatched.** The entry has no partner. The report gives the reason, for example that the nearest entry with the same amount is six days away, outside a two-day tolerance.
- **Duplicate.** The same entry appears twice in one document. The tool flags duplicates but never removes them.

## Bank Statement vs Ledger Example

This example shows how the report classifies six entries for September.

| Date   | Bank statement                      |                            Ledger | Result                  |
| ------ | ----------------------------------- | --------------------------------: | ----------------------- |
| 2 Sep  | ACH credit Northwind LLC, +4,200.00 |                         +4,200.00 | Matched (1 day apart)   |
| 5 Sep  | Check 2291, −540.00                 |                           −450.00 | Amount mismatch (90.00) |
| 12 Sep | Transfer from savings, +1,000.00    |                         −1,000.00 | Direction mismatch      |
| 30 Sep | Interest paid, +3.12                |                              None | Only on bank statement  |
| 29 Sep | None                                | Check 2305 to a supplier, −780.00 | Only in ledger          |
| 3 Sep  | Card fee, −12.00                    |                            −12.00 | Matched                 |

### What Each Result Tells You

- **The matched entries** need no action.
- **The 90.00 amount mismatch** points to a keying error. Someone entered 540 as 450. Correct the ledger.
- **The direction mismatch** means you recorded the transfer as money out, but the bank shows money in. Check which account the transfer went to, then correct the entry.
- **The interest** exists only on the statement. Post an entry in your books.
- **The unmatched cheque** is likely a timing difference. It was written on 29 September and should clear in October.

## How to Fix Each Type of Difference

Use the table below to decide what to do with each group.

| Difference              | Likely cause                                | Action                                        |
| ----------------------- | ------------------------------------------- | --------------------------------------------- |
| Only on bank statement  | Fee, interest, direct debit, bounced cheque | Post an entry in your books                   |
| Only in ledger (recent) | Outstanding cheque or deposit in transit    | Wait for it to clear next month               |
| Only in ledger (old)    | Lost cheque, wrong date or an error         | Follow up with the payee or correct the entry |
| Amount mismatch         | Keying or transposition error               | Correct the wrong document                    |
| Direction mismatch      | Payment recorded as receipt, or the reverse | Correct the entry                             |
| Duplicate               | Entry recorded or imported twice            | Delete the extra entry in your books          |

### Timing Differences vs Real Errors

A timing difference clears on its own and needs no entry. A real error stays in place until someone corrects it. Check the date: an entry in the last few days of the period is probably timing. An entry that has stayed unmatched for weeks is probably a real error.

## Confirm That the Balances Agree

A line-by-line comparison finds the differences. A balance check proves you found all of them.

The tool verifies opening, closing and running balances for both the statement and the ledger. It then compares the change between the two balances with the net effect of every unmatched item and mismatch. When the **unexplained difference is zero**, the listed items fully explain why the two balances disagree. A non-zero figure usually means the tool missed or misread a transaction, so check the warnings first.

If you only need to work out the adjusted balances, use the [bank reconciliation calculator](/reconcile/bank-reconciliation-calculator).

## Which Ledger Files Does the Tool Read?

The tool reads these files:

- **Excel (.xlsx) and CSV.** The tool reads these directly without OCR, so they give the most reliable result.
- **PDF, scans and photos.** The tool uses OCR, which works well on clear, flat documents.

For spreadsheets, the file needs a header row within its first 30 rows, with a date column and at least one amount column. The tool recognises headers such as Date, Narration, Particulars, Debit, Credit, Withdrawal and Deposit, or a single signed Amount column. A row that starts with Opening Balance or Balance B/F sets the opening balance. It also recognises common German, French, Spanish, Portuguese and Dutch headers and comma-decimal numbers like 1.234,56.

## Bank Ledger Reconciliation: Monthly Checklist

Use this checklist when you reconcile each month.

- Export the ledger for the exact statement dates.
- Confirm that both opening balances match last month's reconciliation.
- Run the comparison and clear the matched pairs.
- Separate timing items from real errors.
- Post entries for bank-only items.
- Correct amount and direction mismatches at the source.
- Check that the unexplained difference is zero.
- Sign, date and file the working paper.

For a full walkthrough with a worked example, see the [bank reconciliation tool](/reconcile/bank-reconciliation-tool). To understand how individual transactions are paired, read the [bank statement matching tool](/reconcile/bank-statement-matching-tool).
