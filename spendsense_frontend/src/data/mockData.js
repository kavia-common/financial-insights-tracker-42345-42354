// Mock data only. Replace with backend integration later.

function isoDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// PUBLIC_INTERFACE
export function getMockCategories() {
  /** Returns categories used by mock transactions (for filters). */
  return [
    "Food & Drink",
    "Subscriptions",
    "Transport",
    "Groceries",
    "Housing",
    "Income",
    "Shopping",
    "Utilities",
    "Transfer",
  ];
}

// PUBLIC_INTERFACE
export function getMockAlertSeverities() {
  /** Returns available alert severities (for filters). */
  return ["Low", "Med", "High"];
}

// PUBLIC_INTERFACE
export function getMockTransactions() {
  /** Returns a list of mock transactions for UI development. */
  return [
    { id: "t1", date: isoDate(1), merchant: "Blue Bottle Coffee", category: "Food & Drink", amount: -6.75, status: "Cleared" },
    { id: "t2", date: isoDate(2), merchant: "Spotify", category: "Subscriptions", amount: -11.99, status: "Cleared" },
    { id: "t3", date: isoDate(3), merchant: "Uber", category: "Transport", amount: -18.40, status: "Pending" },
    { id: "t4", date: isoDate(4), merchant: "Whole Foods", category: "Groceries", amount: -72.18, status: "Cleared" },
    { id: "t5", date: isoDate(5), merchant: "Rent", category: "Housing", amount: -1850.00, status: "Cleared" },
    { id: "t6", date: isoDate(6), merchant: "Payroll", category: "Income", amount: 2850.00, status: "Cleared" },
    { id: "t7", date: isoDate(7), merchant: "Amazon", category: "Shopping", amount: -42.33, status: "Flagged" },
    { id: "t8", date: isoDate(9), merchant: "PG&E", category: "Utilities", amount: -96.21, status: "Cleared" },
    { id: "t9", date: isoDate(10), merchant: "Netflix", category: "Subscriptions", amount: -15.49, status: "Cleared" },
    { id: "t10", date: isoDate(11), merchant: "Transfer", category: "Transfer", amount: -250.00, status: "Cleared" },
    { id: "t11", date: isoDate(13), merchant: "Trader Joe's", category: "Groceries", amount: -58.70, status: "Cleared" },
    { id: "t12", date: isoDate(14), merchant: "Chipotle", category: "Food & Drink", amount: -14.25, status: "Cleared" },
  ];
}

// PUBLIC_INTERFACE
export function getMockAlerts() {
  /** Returns a list of mock alerts for UI development. */
  return [
    {
      id: "a1",
      severity: "High",
      status: "Active",
      title: "Unusual spend detected",
      description: "Amazon purchase is 3.1× your typical shopping spend.",
      time: "Today • 9:12 AM",
    },
    {
      id: "a2",
      severity: "Med",
      status: "Active",
      title: "Subscription creep",
      description: "Subscriptions have increased +12% over the last 30 days.",
      time: "Yesterday • 6:40 PM",
    },
    {
      id: "a3",
      severity: "Low",
      status: "Resolved",
      title: "Budget insight",
      description: "Food & Drink is trending below your monthly budget.",
      time: "2 days ago • 2:05 PM",
    },
  ];
}

// PUBLIC_INTERFACE
export function getMockInsights() {
  /** Returns basic insights text + values for placeholder rendering. */
  return [
    { id: "i1", title: "Top category", value: "Housing", detail: "52% of monthly outflow" },
    { id: "i2", title: "Recurring spend", value: "$329.42", detail: "Subscriptions + utilities" },
    { id: "i3", title: "Savings potential", value: "$41/mo", detail: "Based on unused subscriptions" },
  ];
}
