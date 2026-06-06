// app/lib/currencyRates.js

export const CURRENCY_RATES = {
  BDT: 1,
  USD: 0.0084,
  PKR: 2.53,    
  EUR: 0.0077,
  GBP: 0.0066,
  SAR: 0.031,
  AED: 0.031,
  MYR: 0.039,
  SGD: 0.011,
  INR: 0.70,
  THB: 0.29,
  JPY: 1.31,
  KRW: 11.2,
  QAR: 0.031,
  TRY: 0.27,
  NPR: 1.12,
};

export const convertPrice = (bdtPrice, country) => {
  const rate = CURRENCY_RATES[country.currency] || 1;
  const converted = Math.round(bdtPrice * rate);
  return `${country.symbol}${converted.toLocaleString()}`;
};