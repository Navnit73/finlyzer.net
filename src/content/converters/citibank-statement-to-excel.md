---
slug: "citibank-statement-to-excel"
title: "Citibank Statement to Excel Converter"
metaTitle: "Citibank Statement to Excel & CSV Converter | Finlyzers"
metaDescription: "Convert Citibank checking and savings statement PDFs to Excel or CSV, including statements that cover several Citi accounts. Free up to 10 pages."
intro: "Convert Citibank checking and savings statement PDFs into Excel or CSV, with debits and credits in separate columns and the running balance checked, even when one statement covers several Citi accounts."
category: "us-banks"
bankName: "Citibank"
statementLabel: "Citibank Statement"
outputFormat: "Excel"
country: "United States"
badgeText: "Citibank statements"
dateModified: "2026-10-23"
keywords:
  - "citibank statement to excel"
  - "citi statement to csv"
  - "convert citibank pdf statement"
  - "citi bank statement to excel"
  - "citigold statement to excel"
related:
  - "chase-bank-statement-to-excel"
  - "bank-statement-to-qbo"
  - "credit-card-statement-to-excel"
  - "bank-statement-to-csv"
features:
  - title: "Checking and Savings Activity"
    description: "Transactions from the checking and savings activity tables become rows with separate numeric Debit and Credit columns."
  - title: "Balance Check Catches Mix-ups"
    description: "The running balance is checked, so a missed row, or a summary figure read as a transaction, shows up as a mismatch."
  - title: "US Dates and Dollar Amounts"
    description: "Dates are read in month-day order, and dollar signs and thousands separators are removed so amounts total correctly."
  - title: "Long Statements in One Upload"
    description: "Multi-page statements that cover several accounts or several months are processed in a single upload."
tableColumns:
  - "Date"
  - "Description"
  - "Reference"
  - "Debit"
  - "Credit"
  - "Balance"
sampleData:
  - date: "09/03/2026"
    desc: "ACH CREDIT EXAMPLE CO PAYROLL"
    amount: "+$3,980.00"
    type: "Credit"
    balance: "$9,415.27"
  - date: "09/05/2026"
    desc: "ZELLE PAYMENT TO J SAMPLE"
    amount: "-$200.00"
    type: "Debit"
    balance: "$9,215.27"
  - date: "09/08/2026"
    desc: "ONLINE TRANSFER TO SAVINGS XXXX1234"
    amount: "-$500.00"
    type: "Debit"
    balance: "$8,715.27"
steps:
  - title: "Download the PDF from Citi"
    body: "Sign in at citi.com or in the Citi Mobile app, open the account and look for the statements section. Choose the period and save the PDF."
  - title: "Upload it here"
    body: "The activity tables are read, wrapped descriptions are joined into one cell and the running balance is checked."
  - title: "Download Excel or CSV"
    body: "Open the spreadsheet in Excel or Google Sheets, or download QBO, OFX or QIF from the same upload for accounting software."
faqs:
  - question: "Where do I find my Citibank statements?"
    answer: "Sign in at citi.com or in the Citi Mobile app, select the account and open its statements section. Pick the statement period and download the PDF. Menu names can differ between personal and business banking and change from time to time."
  - question: "My Citi statement covers more than one account. What should I check?"
    answer: "Confirm which account each block of transactions belongs to before importing it, and reconcile each account against its own opening and closing balance from the summary page. Transfers between your own Citi accounts appear on both sides and should be recorded as transfers, not income and expenses."
  - question: "Citi lets me download account activity. Why convert the PDF?"
    answer: "The online activity download is handy for recent transactions on an open account. Older periods, closed accounts and statements a client or applicant sent you are usually only available as PDFs, and the monthly statement is the official record for that period."
  - question: "Can I import a Citibank statement into QuickBooks?"
    answer: "Yes. Download the QBO file from the same upload and import it into the matching bank account in QuickBooks Online or Desktop. CSV works too if you prefer to map the columns yourself."
  - question: "Does this work for Citi credit card statements?"
    answer: "Use the credit card converter for Citi card statements. It keeps purchases and payments in separate columns, which suits how card statements are laid out."
---

# Converting Citibank Statements to Excel

A Citibank statement often reads more like a summary of your whole banking relationship than the history of a single account. Customers in relationship tiers such as Citigold can receive one PDF that covers a checking account, one or more savings accounts and linked balances, each with its own activity table. That is convenient to read but slow to copy into a spreadsheet, because you have to find where each account starts and keep debits and credits apart. Finlyzers reads the transaction tables and gives you rows you can sort, filter and total.

## How a Citibank Statement Is Typically Laid Out

- **Relationship or account summary:** the first page usually lists each account included in the statement with its balance at the start and end of the period.
- **Checking activity:** a table with the date, a description, amounts for money out and money in, and a balance.
- **Savings activity:** savings accounts usually follow with their own, shorter table of transfers, deposits and interest.
- **Messages and disclosures:** fee notices, interest rate information and legal text, none of which are transactions.

Citi has changed its statement design over the years, and the layout can differ between account packages, so an older statement may not look exactly like a current one.

## Statements That Cover Several Accounts

When one PDF covers more than one account, take a moment to confirm which account each block of transactions belongs to before you import anything. A transfer from Citi checking to Citi savings appears twice: once as a debit on checking and once as a credit on savings. If both accounts end up in the same ledger in QuickBooks or Xero, that movement should be recorded as a transfer, not as income on one side and an expense on the other.

Reconciling each account against its own opening and closing balance from the summary page is the simplest way to catch mistakes.

## Citi Activity Downloads Versus the PDF Statement

Citi Online usually lets you download recent account activity as a spreadsheet-style file. That works well for the last few months on an account you can still sign in to. You will still need to convert the PDF when:

- the period you need is older than the activity download covers;
- the account has been closed and you can no longer sign in to it;
- a client, tenant or loan applicant sent you the statement as a PDF rather than giving you access;
- a lender, landlord or auditor wants figures that tie back to the official monthly statement.

## Reading Citi Transaction Descriptions

Descriptions on US bank statements are short and often truncated. On a Citi statement you will commonly see:

- **ACH credits and debits** for payroll, tax refunds, insurance premiums and bill payments, usually with the originating company's name.
- **Debit card purchases** with the merchant name and, often, the city and state.
- **Online transfers** between your Citi accounts, typically referencing the last digits of the other account.
- **Zelle payments** sent and received, with the other person's name.
- **Interest** credited to savings and any monthly service fee.

Keeping the description intact lets you filter on these patterns later, for example to pull out every payroll deposit or every Zelle payment to a contractor.

## What You Get in the Spreadsheet

- **One row per transaction** with Date, Description, Reference, Debit, Credit and Balance columns.
- **Wrapped descriptions joined** into a single cell when a merchant or transfer note runs onto a second line.
- **Running balance checked** against the printed balances, so a missed or misread row shows up.
- **Multi-page statements** processed in one upload.

## Common Uses for Converted Citi Statements

Sole proprietors sort business expenses for Schedule C, landlords separate rent deposits for Schedule E, and bookkeepers backfill QuickBooks or Xero when the bank feed does not reach far enough back. The same upload can be downloaded as [QBO for QuickBooks](/convert/bank-statement-to-qbo), [CSV](/convert/bank-statement-to-csv) or [OFX](/convert/bank-statement-to-ofx). If you also bank elsewhere, the [Chase](/convert/chase-bank-statement-to-excel) and [Capital One](/convert/capital-one-statement-to-excel) guides cover those statements.

Converting a Citi credit card statement, such as Double Cash or Custom Cash? Use the [credit card converter](/convert/credit-card-statement-to-excel). For paper statements from a branch or an old file box, try the [scanned statement converter](/convert/scanned-pdf-ocr-to-excel).
