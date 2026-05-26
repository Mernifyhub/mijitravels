export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  defaultLang: string;
}

export interface Language {
  code: string;
  label: string;
  native: string;
  dir: "ltr" | "rtl";
}

export interface NavTexts {
  flights: string;
  hotels: string;
  umrah: string;
  visa: string;
  holidays: string;
}

export interface DealsTexts {
  title: string;
  subtitle: string;
  viewAll: string;
  bookBtn: string;
  seatsLeft: string;
  perPerson: string;
  off: string;
}

export interface DestinationsTexts {
  badge: string;
  title: string;
  subtitle: string;
  from: string;
  direct: string;
}

export interface WhyUsTexts {
  badge: string;
  title: string;
  desc: string;
  awardTitle: string;
  bestAgency: string;
  rated: string;
  features: { title: string; desc: string }[];
}

export interface TestimonialsTexts {
  title: string;
  subtitle: string;
}

export interface FaqTexts {
  badge: string;
  title: string;
  items: { q: string; a: string }[];
}

export interface FooterTexts {
  desc: string;
  services: string;
  company: string;
  contact: string;
  serviceLinks: string[];
  companyLinks: string[];
  privacy: string;
  terms: string;
  cookies: string;
  rights: string;
  certified: string;
}

export interface HeroTexts {
  checkOffers: string;
  popularRoutes: string;
}

export interface TopBarTexts {
  iata: string;
  login: string;
  join: string;
}

export interface Translations {
  topbar: TopBarTexts;
  nav: NavTexts;
  hero: HeroTexts;
  deals: DealsTexts;
  destinations: DestinationsTexts;
  whyUs: WhyUsTexts;
  testimonials: TestimonialsTexts;
  faq: FaqTexts;
  footer: FooterTexts;
}

export interface AppContextType {
  country: Country;
  lang: Language;
  t: Translations;
  setCountry: (country: Country) => void;
  setCurrency: (country: Country) => void;
  setLang: (lang: Language) => void;
  convertPrice: (bdtPrice: number) => string;
  formatPrice: (bdtPrice: number) => string;
  container: string;
}