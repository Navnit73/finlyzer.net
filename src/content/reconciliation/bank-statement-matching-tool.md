---
slug: "bank-statement-matching-tool"
title: "Bank Statement Matching Tool"
shortTitle: "Transaction Matching Tool"
metaTitle: "Bank Statement Matching Tool: Match Bank Transactions to Your Books | Finlyzers"
metaDescription: "Match bank statement transactions to ledger entries automatically by amount, date, reference and description. See confidence for every match, plus unmatched items and duplicates. Free up to 10 pages."
intro: "Pair every bank statement transaction with its entry in your books automatically. Each match shows what it was based on (amount, date, reference, description) and how confident it is, and anything left over is listed with a reason."
badgeText: "Transaction matching"
dateModified: "2026-10-15"
keywords:
  - "bank statement matching tool"
  - "match bank transactions"
  - "bank transaction matching"
  - "match bank statement to ledger"
  - "automatic transaction matching"
related:
  - "bank-reconciliation-tool"
  - "bank-statement-vs-ledger"
  - "bank-reconciliation-calculator"
benefits:
  - "Every match shows its basis and a confidence level"
  - "Adjustable date tolerance from same day to 31 days"
  - "Each transaction is matched at most once"
steps:
  - title: "Upload statement and ledger"
    body: "Add the bank statement and the ledger or cash book. Set the date tolerance under Matching options if your entries are usually posted days apart."
  - title: "Candidates are scored"
    body: "Entries with the same amount and direction inside the tolerance are scored on date closeness, matching references and description similarity."
  - title: "Best pairs win"
    body: "Pairs are assigned from the highest score down, so a strong reference match is never displaced by a weaker one."
sampleRows:
  - date: "2026-08-03"
    bankDesc: "UPI/412233/RAHUL STORES"
    bankAmount: "−2,350.00"
    ledgerDesc: "Rahul Stores, UTR 412233"
    ledgerAmount: "−2,350.00"
    result: "Matched (high confidence)"
  - date: "2026-08-07"
    bankDesc: "POS 7781 FUEL STATION"
    bankAmount: "−1,500.00"
    ledgerDesc: "Fuel"
    ledgerAmount: "−1,500.00"
    result: "Matched (2 days apart)"
  - date: "2026-08-07"
    bankDesc: "POS 7781 FUEL STATION"
    bankAmount: "−1,500.00"
    ledgerDesc: ""
    ledgerAmount: ""
    result: "Possible duplicate"
  - date: "2026-08-15"
    bankDesc: "IMPS CR SHARMA & CO"
    bankAmount: "+12,000.00"
    ledgerDesc: "Sharma & Co receipt"
    ledgerAmount: "+12,000.00"
    result: "Unmatched: 6 days apart"
features:
  - title: "Transparent Scoring"
    description: "100 points for the amount, up to 30 for date closeness, 50 for a matching reference and up to 40 for description similarity."
  - title: "Reference Normalisation"
    description: "Cheque numbers, UTRs and transaction IDs are compared as letters and digits only, so 'CHQ-004512' and 'chq 004512' match."
  - title: "Missing Dates Handled"
    description: "A row with an unreadable date can still match on amount, at a lower score, and is flagged in the report."
  - title: "Duplicates Flagged"
    description: "Entries repeated within one document with the same date, amount, direction, description and reference are grouped for review."
faqs:
  - question: "How does automatic transaction matching work?"
    answer: "A bank transaction and a ledger entry become candidates when they have the same amount and the same direction, and their dates are within the date tolerance. Each candidate pair gets a score from the amount, date closeness, matching references and description similarity, and pairs are assigned greedily from the highest score down."
  - question: "Is the matching done by AI?"
    answer: "No. Text is read from scanned PDFs with OCR, but the matching itself is a fixed set of rules. The same two files always give the same result, which makes it easy to audit."
  - question: "What does the confidence level mean?"
    answer: "High confidence means the references match, or the dates and descriptions agree strongly. Medium and low mean the pair was matched mainly on amount and date, so it is worth a glance, especially when several entries share the same amount."
  - question: "Which date tolerance should I choose?"
    answer: "Two days, the default, suits most card payments and transfers. Use a wider tolerance, such as 5 to 7 days, when cheques take time to clear, and 0 when entries should be posted on the same day."
  - question: "Can one bank line match two ledger entries?"
    answer: "No. Each transaction is matched at most once. If a single bank deposit covers several ledger receipts, the ledger entries are listed as unmatched so you can review them together."
  - question: "Should I turn off description matching?"
    answer: "Leave it on in most cases; it helps choose between entries with the same amount. Turn it off if the descriptions in your books have nothing in common with the bank's, and matching should rely on amount, date and reference only."
---

# How Bank Transactions Are Matched

Matching a bank statement to your books is mostly a search problem: for every line on the statement, find the one entry in the ledger that records the same movement of money. Amounts are the strongest signal, but they are not enough on their own. Many businesses have several payments of the same amount in a month, so dates, references and descriptions decide which entry belongs to which bank line.

# The Matching Rules

1. **Normalise both documents.** Every row becomes a signed amount with a direction, a date, a reference reduced to letters and digits, and description keywords. Rows with no amount are skipped and counted in the warnings.
2. **Find candidates.** Only entries with the same amount and direction, with dates inside the tolerance, are considered.
3. **Score each candidate.** The amount earns 100 points. Date closeness adds up to 30, a matching reference adds 50 and description similarity adds up to 40 when description matching is on.
4. **Assign the best pairs first.** The highest-scoring pair is matched, both entries are removed, and the process repeats. No entry is ever used twice.
5. **Look for near misses.** What is left is checked for amount and direction mismatches before being reported as unmatched.

## Why a Transaction Was Not Matched

Every unmatched entry carries a reason. The most common are an entry with the same amount just outside the date tolerance (widen the tolerance and run it again), the same amount recorded in the opposite direction (shown as a direction mismatch instead) and an entry that simply does not exist in the other document yet, such as a bank fee.

For the full reconciliation workflow see the [bank reconciliation tool](/reconcile/bank-reconciliation-tool), or [compare a bank statement with your ledger](/reconcile/bank-statement-vs-ledger) to resolve the differences.
