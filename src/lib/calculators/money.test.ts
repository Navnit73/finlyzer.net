import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, formatMonths, parseNumberInput, roundTo, toCsv, toMinor, validateNumber } from './money.ts';

test('roundTo rounds half away from zero without binary noise', () => {
  assert.equal(roundTo(1.005), 1.01);
  assert.equal(roundTo(2.675), 2.68);
  assert.equal(roundTo(-1.005), -1.01);
  assert.equal(roundTo(0.1 + 0.2), 0.3);
  assert.equal(roundTo(-0.001), 0);
  assert.equal(roundTo(1234.5678, 0), 1235);
});

test('toMinor converts to exact integer cents', () => {
  assert.equal(toMinor(0.1 + 0.2), 30);
  assert.equal(toMinor(19.99), 1999);
  assert.equal(toMinor(1.005), 101);
});

test('parseNumberInput accepts grouping, symbols and typographic minus', () => {
  assert.equal(parseNumberInput('10,00,000'), 1000000);
  assert.equal(parseNumberInput('$1,234.50'), 1234.5);
  assert.equal(parseNumberInput('−250'), -250);
  assert.equal(parseNumberInput('8.5%'), 8.5);
  assert.equal(parseNumberInput('.5'), 0.5);
  assert.equal(parseNumberInput(''), null);
  assert.equal(parseNumberInput('-'), null);
  assert.equal(parseNumberInput('12abc'), null);
  assert.equal(parseNumberInput('1e5'), null);
});

test('validateNumber reports empty, range and integer errors', () => {
  assert.deepEqual(validateNumber('', { label: 'Loan amount' }), { value: null, error: 'Enter loan amount.' });
  assert.equal(validateNumber('', { label: 'Extra', emptyAs: 0 }).value, 0);
  assert.match(validateNumber('0', { label: 'Loan amount', min: 0, minExclusive: true }).error!, /more than 0/);
  assert.match(validateNumber('51', { label: 'Rate', max: 50 }).error!, /at most 50/);
  assert.match(validateNumber('12.5', { label: 'Months', integer: true }).error!, /whole number/);
  assert.equal(validateNumber('12', { label: 'Months', integer: true, min: 1 }).value, 12);
});

test('formatMoney uses the currency locale grouping', () => {
  assert.equal(formatMoney(1000000, 'INR', { decimals: 0 }), '₹10,00,000');
  assert.equal(formatMoney(1234.5, 'USD'), '$1,234.50');
  assert.equal(formatMoney(-50, 'GBP'), '−£50.00');
  assert.equal(formatMoney(25, 'USD', { signed: true }), '+$25.00');
  assert.equal(formatMoney(Number.NaN, 'EUR'), '—');
});

test('formatMonths reads naturally', () => {
  assert.equal(formatMonths(0), '0 months');
  assert.equal(formatMonths(1), '1 month');
  assert.equal(formatMonths(12), '1 year');
  assert.equal(formatMonths(28), '2 years 4 months');
});

test('toCsv quotes cells that need it', () => {
  assert.equal(toCsv([['a', 'b,c'], [1, 'say "hi"']]), 'a,"b,c"\r\n1,"say ""hi"""');
});
