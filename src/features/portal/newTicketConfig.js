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

export const BRANDS = ["Asian Hub", "Baytoti", "Indo Makan", "Maki House", "Podo Moro", "Rice&Roll", "Wok"];
export const FEEDBACK_TYPES = ["Google Review", "Dine In Survey (0-6)", "App Survey (0-6)", "Call Center", "WhatsApp", "Meta Business", "Email"];
export const FEEDBACK_CATEGORIES = Object.keys(SUB_CATEGORIES);
export const PRIORITIES = ["High", "Medium", "Low"];
export const STATUSES = ["Open", "In Progress", "Replied", "Closed"];

export function computeSlaDueAt(priority) {
  const hours = priority === "High" ? 8 : priority === "Low" ? 48 : 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
