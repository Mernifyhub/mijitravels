export const COUNTRIES = [
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", symbol: "﷼" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", symbol: "د.إ" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", currency: "BDT", symbol: "৳" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currency: "PKR", symbol: "₨" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", symbol: "₹" },
] as const;

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
] as const;

export type Country = (typeof COUNTRIES)[number];
export type Language = (typeof LANGUAGES)[number];
export type LangCode = Language["code"];

// Country -> default language mapping
export const COUNTRY_LANGUAGE_MAP: Record<Country["code"], LangCode> = {
  SA: "ar",
  AE: "ar",
  BD: "bn",
  PK: "en",
  IN: "en",
};

export function getDefaultLanguage(countryCode: Country["code"]): Language {
  const langCode = COUNTRY_LANGUAGE_MAP[countryCode] ?? "en";
  return LANGUAGES.find((l) => l.code === langCode) ?? LANGUAGES[0];
}

// Full website text translations
export const TEXTS = {
  en: {
    // Topbar
    iata: "IATA Certified",
    login: "Login",
    join: "Join Free",

    // Navbar
    nav: {
      flights: "Flights",
      hotels: "Hotels",
      umrah: "Umrah",
      visa: "Visa",
      holidays: "Holidays",
    },

    // Hero buttons
    checkOffers: "Check Offers",
    popularRoutes: "Popular Routes",

    // Sections
    dealsTitle: "Deals of the Week",
    dealsSubtitle: "Limited time offers — Book before they expire!",
    viewAllDeals: "View All Deals",
    bookThisDeal: "Book This Deal",
    seatsLeft: "seats left!",
    perPerson: "per person • Economy",

    topChoices: "Top Choices",
    popularDestTitle: "Popular Routes from Dhaka",
    popularDestSubtitle: "Most booked destinations this month",
    from: "from",
    direct: "Direct",

    awardWinning: "Award Winning Agency",
    whyChoose: "Why Professionals Choose Miji",
    whyChooseDesc:
      "We have built a reputation on trust, transparency, and exceptional service since 2015.",

    bestAgency: "Best Travel Agency in",
    ratedFrom: "Rated 4.9/5 from 50,000+ reviews",

    customerSay: "What Our Customers Say",
    customerSayDesc:
      "Don't just take our word for it — hear from satisfied travelers across",

    commonQs: "Common Questions",
    faqTitle: "Frequently Asked Questions",
  },

  ar: {
    iata: "معتمد من IATA",
    login: "تسجيل الدخول",
    join: "انضم مجانًا",

    nav: {
      flights: "رحلات",
      hotels: "فنادق",
      umrah: "عمرة",
      visa: "تأشيرة",
      holidays: "عطلات",
    },

    checkOffers: "تحقق من العروض",
    popularRoutes: "الطرق الشهيرة",

    dealsTitle: "عروض الأسبوع",
    dealsSubtitle: "عروض لفترة محدودة — احجز قبل انتهائها!",
    viewAllDeals: "عرض كل العروض",
    bookThisDeal: "احجز هذا العرض",
    seatsLeft: "مقاعد متبقية!",
    perPerson: "للشخص الواحد • اقتصادي",

    topChoices: "أفضل الخيارات",
    popularDestTitle: "الطرق الشهيرة من دكا",
    popularDestSubtitle: "الوجهات الأكثر حجزًا هذا الشهر",
    from: "من",
    direct: "مباشر",

    awardWinning: "وكالة حائزة على جوائز",
    whyChoose: "لماذا يختار المحترفون Miji",
    whyChooseDesc:
      "لقد بنينا سمعة قائمة على الثقة والشفافية والخدمة الاستثنائية منذ عام 2015.",

    bestAgency: "أفضل وكالة سفر في",
    ratedFrom: "تقييم 4.9/5 من أكثر من 50,000 مراجعة",

    customerSay: "ماذا يقول عملاؤنا",
    customerSayDesc:
      "لا تأخذ كلمتنا فقط — اسمع من المسافرين الراضين عبر",

    commonQs: "أسئلة شائعة",
    faqTitle: "الأسئلة المتكررة",
  },

  bn: {
    iata: "IATA সার্টিফাইড",
    login: "লগইন",
    join: "ফ্রি জয়েন",

    nav: {
      flights: "ফ্লাইট",
      hotels: "হোটেল",
      umrah: "উমরাহ",
      visa: "ভিসা",
      holidays: "হলিডে",
    },

    checkOffers: "অফার দেখুন",
    popularRoutes: "জনপ্রিয় রুট",

    dealsTitle: "সপ্তাহের সেরা ডিল",
    dealsSubtitle: "সীমিত সময়ের অফার — শেষ হওয়ার আগেই বুক করুন!",
    viewAllDeals: "সব ডিল দেখুন",
    bookThisDeal: "এই ডিল বুক করুন",
    seatsLeft: "টি সিট বাকি!",
    perPerson: "প্রতি জন • ইকোনমি",

    topChoices: "সেরা পছন্দ",
    popularDestTitle: "ঢাকা থেকে জনপ্রিয় রুট",
    popularDestSubtitle: "এই মাসের সবচেয়ে বেশি বুক হওয়া গন্তব্য",
    from: "শুরু",
    direct: "ডাইরেক্ট",

    awardWinning: "পুরস্কারপ্রাপ্ত এজেন্সি",
    whyChoose: "পেশাদাররা কেন Miji বেছে নেন",
    whyChooseDesc:
      "২০১৫ সাল থেকে আমরা বিশ্বাস, স্বচ্ছতা এবং ব্যতিক্রমী সেবার সুনাম গড়ে তুলেছি।",

    bestAgency: "সেরা ট্র্যাভেল এজেন্সি",
    ratedFrom: "৫০,০০০+ রিভিউ থেকে ৪.৯/৫ রেটিং",

    customerSay: "আমাদের গ্রাহকরা কী বলেন",
    customerSayDesc:
      "শুধু আমাদের কথা বিশ্বাস করবেন না — সন্তুষ্ট ভ্রমণকারীদের কাছ থেকে শুনুন",

    commonQs: "সাধারণ প্রশ্ন",
    faqTitle: "প্রায়শই জিজ্ঞাসিত প্রশ্ন",
  },
} as const;

export type TextContent = (typeof TEXTS)[LangCode];