---
slug: "bank-statement-matching-tool"
title: "Bank Statement Matching Tool: Match Bank Transactions to Your Books"
shortTitle: "Transaction Matching Tool"
metaTitle: "Bank Statement Matching Tool: Match Transactions | Finlyzers"
metaDescription: "Match bank statement transactions to ledger entries by amount, date, reference and description. See the confidence of each match plus unmatched items. Free to 10 pages."
intro: "Pair every bank statement transaction with its entry in your books automatically. Each match shows what it was based on (amount, date, reference, description) and how confident it is, and anything left over is listed with a reason. Use it to speed up your monthly bank reconciliation."
badgeText: "Transaction matching"
dateModified: "2026-10-16"
keywords:
  - "bank statement matching tool"
  - "match bank transactions"
  - "bank transaction matching"
  - "match bank statement to ledger"
  - "automatic transaction matching"
  - "reconciling bank statements"
  - "monthly bank reconciliation"
  - "bank statement reconciliation software"
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
    icon: "rules"
    description: "100 points for the amount, up to 30 for date closeness, 50 for a matching reference and up to 40 for description similarity."
  - title: "Reference Normalisation"
    icon: "reference"
    description: "The tool compares cheque numbers, UTRs and transaction IDs as letters and digits only, so 'CHQ-004512' and 'chq 004512' match."
  - title: "Missing Dates Handled"
    icon: "dates"
    description: "A row with an unreadable date can still match on amount, at a lower score, and the report flags it."
  - title: "Duplicates Flagged"
    icon: "duplicates"
    description: "The tool groups entries repeated within one document with the same date, amount, direction, description and reference for review."
faqs:
  - question: "How does automatic transaction matching work?"
    answer: "A bank transaction and a ledger entry become candidates when they have the same amount and the same direction, and their dates are within the date tolerance. Each candidate pair gets a score from the amount, date closeness, matching references and description similarity, and pairs are assigned greedily from the highest score down."
  - question: "Is the matching done by AI?"
    answer: "No. The tool reads text from scanned PDFs with OCR, but the matching itself is a fixed set of rules. The same two files always give the same result, which makes it easy to audit."
  - question: "What does the confidence level mean?"
    answer: "High confidence means the references match, or the dates and descriptions agree strongly. Medium and low mean the pair was matched mainly on amount and date, so it is worth a glance, especially when several entries share the same amount."
  - question: "Which date tolerance should I choose?"
    answer: "Two days, the default, suits most card payments and transfers. Use a wider tolerance, such as 5 to 7 days, when cheques take time to clear, and 0 when entries should be posted on the same day."
  - question: "Can one bank line match two ledger entries?"
    answer: "No. Each transaction is matched at most once. If a single bank deposit covers several ledger receipts, the report lists the ledger entries as unmatched so you can review them together."
  - question: "Should I turn off description matching?"
    answer: "Leave it on in most cases; it helps choose between entries with the same amount. Turn it off if the descriptions in your books have nothing in common with the bank's, and matching should rely on amount, date and reference only."
  - question: "Why was my transaction not matched?"
    answer: "The usual reasons are an entry with the same amount just outside the date tolerance, the same amount recorded in the opposite direction, or an entry that does not exist in the other document yet, such as a bank fee. The report gives the reason for each unmatched entry."
  - question: "What is the difference between matching and reconciling?"
    answer: "Matching pairs individual transactions. Reconciling goes further: it explains every unmatched item, posts adjusting entries and proves that the adjusted balances agree. Matching is the first, slowest step of reconciling."
  - question: "What if my statement has several payments of the same amount?"
    answer: "References and descriptions decide which entry pairs with which line. If the references are missing, the tool pairs by date closeness and description similarity, and marks those matches medium or low confidence so you can check them."
---

# Bank Statement Matching Tool: Match Bank Transactions Automatically

Matching a bank statement to your books means finding, for every line on the statement, the one ledger entry that records the same movement of money. Doing that by hand for hundreds of lines is the slowest part of a monthly bank reconciliation. This tool does it in seconds and shows its reasoning for every pair.

**Quick answer:** Upload your statement and ledger above. The tool pairs entries that share an amount and direction inside your date tolerance, scores each pair, and lists everything left over with a reason.

## How to Match Bank Transactions

1. **Export your ledger.** From your accounting software or spreadsheet, export the bank account's transactions for the same dates as the statement.
2. **Upload both documents.** The statement can be a PDF, a scan, a CSV or an Excel file. The ledger works best as Excel or CSV.
3. **Set the date tolerance.** Choose from same day up to 31 days under Matching options. The default is 2 days.
4. **Review the matches.** Check the confidence level, especially for medium and low matches.
5. **Resolve the leftovers.** Work through the unmatched items, mismatches and duplicates, then download the report.

## How Automatic Transaction Matching Works

Amounts are the strongest signal, but they are not enough alone. Many businesses make several payments of the same amount in a month, so dates, references and descriptions decide which entry belongs to which bank line.

### Step 1: Normalise Both Documents

Every row becomes a signed amount with a direction, a date, a reference reduced to letters and digits, and description keywords. The tool skips rows with no amount and counts them in the warnings.

### Step 2: Find Candidates

The tool considers only entries with the same amount and direction and dates inside your tolerance. An entry outside the tolerance never becomes a candidate.

### Step 3: Score Each Candidate

Each candidate pair earns points.

| Signal                    | Points                                     |
| ------------------------- | ------------------------------------------ |
| Same amount and direction | 100                                        |
| Date closeness            | Up to 30                                   |
| Matching reference        | 50                                         |
| Description similarity    | Up to 40 (when description matching is on) |

A pair with a matching reference scores at least 150. A pair with no shared reference scores between 100 and 170. These scores decide which pairs win when several entries compete.

### Step 4: Assign the Best Pairs First

The highest-scoring pair is matched, both entries are removed from the pool, and the process repeats. Because the best pairs go first, a strong reference match is never displaced by a weaker one. No entry is ever used twice.

### Step 5: Look for Near Misses

The tool checks what is left for amount and direction mismatches before reporting it as unmatched. This step separates a keying error from a genuinely missing entry.

## Matching Is Rule-Based, Not AI

The tool reads scanned documents with OCR, but the matching itself follows fixed rules. The same two files always produce the same report. This matters for audit: you can explain exactly why two entries were paired, and you can repeat the result next month.

## How Reference Normalisation Works

References are often typed differently in the bank's system and in your books. The tool strips everything except letters and digits and ignores case. So "CHQ-004512", "chq 004512" and "Chq. No. 004512" reduce to the same text. UPI and IMPS reference numbers, UTRs, cheque numbers and card terminal IDs all work the same way.

## Bank Transaction Matching Example

This example shows four lines from August and how the tool classifies each.

| Date   | Bank statement                     |                Ledger | Result                    |
| ------ | ---------------------------------- | --------------------: | ------------------------- |
| 3 Aug  | UPI/412233/Rahul Stores, −2,350.00 | −2,350.00, UTR 412233 | Matched (high confidence) |
| 7 Aug  | POS 7781 Fuel Station, −1,500.00   |     −1,500.00, "Fuel" | Matched (2 days apart)    |
| 7 Aug  | POS 7781 Fuel Station, −1,500.00   |                  None | Possible duplicate        |
| 15 Aug | IMPS CR Sharma & Co, +12,000.00    |            +12,000.00 | Unmatched: 6 days apart   |

### Why Each Line Got Its Result

- **The Rahul Stores payment** matched with high confidence because the reference 412233 appears in both documents.
- **The fuel payment** matched on amount and a close date. There is no shared reference, so the match is worth a glance.
- **The second fuel line** has the same date, amount and description as the first, so the tool groups it as a possible duplicate. Check whether the card was charged twice.
- **The Sharma & Co receipt** has the same amount in both documents, but the dates are six days apart, outside the 2-day tolerance. Widen the tolerance and run it again.

## Choose the Right Date Tolerance

The tolerance controls which entries can pair up. Pick a value that fits how your business records transactions.

| Tolerance        | Best for                                                   |
| ---------------- | ---------------------------------------------------------- |
| 0 days           | Entries posted on the same day as the bank                 |
| 2 days (default) | Most card payments and transfers                           |
| 5 to 7 days      | Cheques that take time to clear                            |
| Up to 31 days    | Cheques held before deposit, or bulk postings at month-end |

A wider tolerance finds more matches but creates more candidates for the same amount. Review medium and low confidence matches when you widen it.

## Why a Transaction Was Not Matched

Every unmatched entry carries a reason. These are the most common.

### The Date Falls Outside the Tolerance

An entry with the same amount lies just outside your window. Widen the tolerance and run the match again.

### The Direction Is Opposite

The same amount appears in the other document, but as money in rather than money out. The tool reports this as a direction mismatch, not as two unmatched items.

### The Entry Does Not Exist Yet

Bank fees, interest and direct debits often reach the statement before anyone records them. Post an entry in your books.

### One Bank Line Covers Several Ledger Entries

A single deposit of 30,000 may cover three receipts of 10,000. Each transaction matches at most once, so the report lists the ledger entries as unmatched for you to review together.

### The Amount Differs

A keying error, such as 540 entered as 450, means the amounts do not match. The tool reports an amount mismatch when a reference or description links the entries.

## What to Do After Matching

Matching is the first step of reconciling. Once the pairs are set, you still need to:

- Separate timing items, such as outstanding cheques and deposits in transit, from real errors.
- Post journal entries for bank-only items.
- Correct amount and direction mismatches at the source.
- Remove or explain duplicates.
- Confirm that the adjusted balances agree.

The report's balance check shows whether the items found fully explain the difference between the two balances. When the **unexplained difference is zero**, you have found everything.

## What to Look For in Transaction Matching Software

If you compare bank statement reconciliation software, check these points.

- **Visible reasoning.** You should see why two entries matched.
- **Confidence levels.** The software should tell you which matches deserve a second look.
- **Repeatable results.** The same files should give the same result.
- **Clear reasons for unmatched items.** A bare list of leftovers is not enough.
- **Duplicate detection.** It should flag repeats without deleting them.
- **Flexible tolerance.** You should control how far apart dates may be.

## Related Tools

For the full workflow with a worked example, see the [bank reconciliation tool](/reconcile/bank-reconciliation-tool). To resolve the differences line by line, [compare a bank statement with your ledger](/reconcile/bank-statement-vs-ledger). If you only need the adjusted-balance arithmetic, use the [bank reconciliation calculator](/reconcile/bank-reconciliation-calculator).
