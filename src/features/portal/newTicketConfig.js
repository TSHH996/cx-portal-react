export const SUB_CATEGORIES = {
  "Food Quality": ["Beef", "Chicken", "Fish", "Shrimp", "Sushi", "Avocado", "Katsu Curry", "Rice", "Salad", "Noodles", "Soup", "Sichuan", "Cold Food", "Oily", "Spicy Food", "Soy Sauce", "Curry", "Portion Quantity Issue", "Foreign Object", "Taste", "Wrong Order", "Missing Item", "No Sauce", "Pickle", "Satay", "Undercooked/Overcooked", "Expired Product", "Small Portion", "Presentation Issue"],
  "Service Quality": ["Cashier", "Service Provider", "Service Delay", "Order Delay", "Manager Communication", "Service", "Rude Staff", "Long Waiting Time", "Incorrect Bill", "Staff Appearance", "No Greeting"],
  Ambiance: ["Hair", "Insect", "Hygiene", "Noise Level", "Temperature", "Broken Furniture", "Bad Smell", "Parking Issue", "Crowded"],
  Cleanliness: ["Dirty Tables", "Dirty Utensils", "Dirty Bathroom", "Dirty Floor", "Dirty Uniform"],
  Overall: ["Overall"],
  "Foreign Object": ["Foreign Object"],
  Poisoning: ["Poisoning"],
  Delivery: ["Late Delivery", "Wrong Address", "Damaged Packaging", "Cold Food on Arrival", "Missing Items"],
  "App/Online": ["App Crash", "Payment Issue", "Wrong Order on App", "Promo Not Applied"],
  Pricing: ["Overcharged", "Wrong Price on Menu", "Hidden Fees"],
};

export const CITIES = ["Dammam", "Jeddah", "Jizan", "Khamis Mushayt", "Khobar", "Madinah", "Makkah", "Riyadh", "Taif", "Al Hassa"];
export const BRANDS = ["Asian Hub", "Baytoti", "Indo Makan", "Maki House", "Podo Moro", "Rice&Roll", "Wok"];
export const FEEDBACK_TYPES = ["Google Review", "Dine In Survey (0-6)", "App Survey (0-6)", "Call Center", "WhatsApp", "Meta Business", "Email"];
export const FEEDBACK_CATEGORIES = Object.keys(SUB_CATEGORIES);
export const PRIORITIES = ["High", "Medium", "Low"];
export const STATUSES = ["Open", "In Progress", "Replied", "Closed"];

const CITY_BY_LOWERCASE = Object.fromEntries(CITIES.map((city) => [city.toLowerCase(), city]));

const BRANCH_CITY_OVERRIDES = {
  "Al Marwa": "Jeddah",
  "Khamis Mushayt": "Khamis Mushayt",
  Mohammadiah: "Jeddah",
  "Riyadh Park": "Riyadh",
  Salamah: "Jeddah",
  Sari: "Jeddah",
};

const LABELS = {
  ar: {
    status: {
      Open: "مفتوحة",
      "In Progress": "قيد المعالجة",
      Replied: "تم الرد",
      Closed: "مغلقة",
    },
    priority: {
      High: "عالية",
      Medium: "متوسطة",
      Low: "منخفضة",
    },
    city: {
      Dammam: "الدمام",
      Jeddah: "جدة",
      Jizan: "جازان",
      "Khamis Mushayt": "خميس مشيط",
      Khobar: "الخبر",
      Madinah: "المدينة المنورة",
      Makkah: "مكة المكرمة",
      Riyadh: "الرياض",
      Taif: "الطائف",
      "Al Hassa": "الأحساء",
    },
    source: {
      "Google Review": "مراجعة Google",
      "Dine In Survey (0-6)": "استبيان داخل الفرع (0-6)",
      "App Survey (0-6)": "استبيان التطبيق (0-6)",
      "Call Center": "مركز الاتصال",
      WhatsApp: "واتساب",
      "Meta Business": "منصة Meta Business",
      Email: "البريد الإلكتروني",
    },
    category: {
      "Food Quality": "جودة الطعام",
      "Service Quality": "جودة الخدمة",
      Ambiance: "الأجواء",
      Cleanliness: "النظافة",
      Overall: "عام",
      "Foreign Object": "جسم غريب",
      Poisoning: "تسمم",
      Delivery: "التوصيل",
      "App/Online": "التطبيق / الإنترنت",
      Pricing: "الأسعار",
    },
    subCategory: {
      Beef: "لحم بقري",
      Chicken: "دجاج",
      Fish: "سمك",
      Shrimp: "روبيان",
      Sushi: "سوشي",
      Avocado: "أفوكادو",
      "Katsu Curry": "كاتسو كاري",
      Rice: "أرز",
      Salad: "سلطة",
      Noodles: "نودلز",
      Soup: "شوربة",
      Sichuan: "سيتشوان",
      "Cold Food": "طعام بارد",
      Oily: "دهني",
      "Spicy Food": "طعام حار",
      "Soy Sauce": "صلصة الصويا",
      Curry: "كاري",
      "Portion Quantity Issue": "مشكلة في كمية الوجبة",
      "Foreign Object": "جسم غريب",
      Taste: "الطعم",
      "Wrong Order": "طلب خاطئ",
      "Missing Item": "عنصر مفقود",
      "No Sauce": "بدون صلصة",
      Pickle: "مخلل",
      Satay: "ساتاي",
      "Undercooked/Overcooked": "غير ناضج / مطهو أكثر من اللازم",
      "Expired Product": "منتج منتهي الصلاحية",
      "Small Portion": "كمية قليلة",
      "Presentation Issue": "مشكلة في التقديم",
      Cashier: "الكاشير",
      "Service Provider": "مقدم الخدمة",
      "Service Delay": "تأخر الخدمة",
      "Order Delay": "تأخر الطلب",
      "Manager Communication": "أسلوب المدير",
      Service: "الخدمة",
      "Rude Staff": "موظف غير لائق",
      "Long Waiting Time": "طول وقت الانتظار",
      "Incorrect Bill": "فاتورة غير صحيحة",
      "Staff Appearance": "مظهر الموظف",
      "No Greeting": "عدم الترحيب",
      Hair: "شعر",
      Insect: "حشرة",
      Hygiene: "النظافة",
      "Noise Level": "مستوى الضوضاء",
      Temperature: "درجة الحرارة",
      "Broken Furniture": "أثاث تالف",
      "Bad Smell": "رائحة سيئة",
      "Parking Issue": "مشكلة مواقف",
      Crowded: "ازدحام",
      "Dirty Tables": "طاولات متسخة",
      "Dirty Utensils": "أدوات متسخة",
      "Dirty Bathroom": "دورة مياه متسخة",
      "Dirty Floor": "أرضية متسخة",
      "Dirty Uniform": "زي متسخ",
      Overall: "عام",
      Poisoning: "تسمم",
      "Late Delivery": "تأخر التوصيل",
      "Wrong Address": "عنوان خاطئ",
      "Damaged Packaging": "تغليف تالف",
      "Cold Food on Arrival": "الطعام بارد عند الوصول",
      "Missing Items": "أصناف مفقودة",
      "App Crash": "تعطل التطبيق",
      "Payment Issue": "مشكلة دفع",
      "Wrong Order on App": "طلب خاطئ في التطبيق",
      "Promo Not Applied": "العرض لم يُطبق",
      Overcharged: "تم احتساب مبلغ زائد",
      "Wrong Price on Menu": "سعر غير صحيح في القائمة",
      "Hidden Fees": "رسوم مخفية",
    },
    slaStatus: {
      pending: "قيد المتابعة",
      on_track: "ضمن SLA",
      at_risk: "معرضة للتجاوز",
      breached: "متجاوزة",
    },
    misc: {
      unspecified: "غير محدد",
    },
  },
};

const NORMALIZED_AR_LABELS = Object.fromEntries(
  Object.entries(LABELS.ar).map(([group, map]) => [
    group,
    map ? Object.fromEntries(Object.entries(map).map(([key, value]) => [key.toLowerCase(), value])) : {},
  ])
);

function getMapValue(group, value, language) {
  if (!value || value === "--") return value;
  if (language !== "ar") return value;
  if (value === "Unspecified") return LABELS.ar.misc.unspecified;
  const direct = LABELS.ar[group]?.[value];
  if (direct) return direct;

  const normalized = NORMALIZED_AR_LABELS[group]?.[String(value).toLowerCase()];
  if (normalized) return normalized;

  if (["status", "priority", "city", "source", "category", "subCategory", "slaStatus"].includes(group)) {
    return LABELS.ar.misc.unspecified;
  }

  return value;
}

export function normalizeCity(value) {
  const key = String(value || "").trim().toLowerCase();
  return CITY_BY_LOWERCASE[key] || "";
}

export function resolveBranchCity(branchName, city = "") {
  const direct = normalizeCity(city);
  if (direct) return direct;
  return BRANCH_CITY_OVERRIDES[branchName] || "";
}

export function getLocalizedStatus(value, language = "en") {
  return value || "";
}

export function getLocalizedPriority(value, language = "en") {
  return value || "";
}

export function getLocalizedCity(value, language = "en") {
  return value || "Unspecified";
}

export function getLocalizedSource(value, language = "en") {
  return value || "";
}

export function getLocalizedCategory(value, language = "en") {
  return value || "";
}

export function getLocalizedSubCategory(value, language = "en") {
  return value || "";
}

export function getLocalizedSlaStatus(value, language = "en") {
  return value || "";
}

export function getLocalizedCityOptions(language = "en") {
  return CITIES.map((value) => ({ value, label: getLocalizedCity(value, language) }));
}

export function getLocalizedSourceOptions(language = "en") {
  return FEEDBACK_TYPES.map((value) => ({ value, label: getLocalizedSource(value, language) }));
}

export function getLocalizedCategoryOptions(language = "en") {
  return FEEDBACK_CATEGORIES.map((value) => ({ value, label: getLocalizedCategory(value, language) }));
}

export function getLocalizedSubCategoryOptions(values, language = "en") {
  return values.map((value) => ({ value, label: getLocalizedSubCategory(value, language) }));
}

export function getLocalizedPriorityOptions(language = "en") {
  return PRIORITIES.map((value) => ({ value, label: getLocalizedPriority(value, language) }));
}

export function getLocalizedStatusOptions(language = "en") {
  return STATUSES.map((value) => ({ value, label: getLocalizedStatus(value, language) }));
}

export function computeSlaDueAt(priority) {
  const hours = priority === "High" ? 8 : priority === "Low" ? 48 : 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
