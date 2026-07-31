import { computed, ref } from "vue";

const tones = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-500",
  purple: "bg-violet-50 text-violet-600",
  red: "bg-red-50 text-red-500",
  cyan: "bg-cyan-50 text-cyan-600",
};

const palette = ["#2563eb", "#18a765", "#8b5cf6", "#f97316", "#14b8a6", "#ef4444", "#0f76d8", "#a855f7"];

const badgeTone = (value) =>
  ["Active", "Completed", "Paid", "In Stock"].includes(value)
    ? "bg-emerald-50 text-emerald-600"
    : ["Pending", "Partial", "Low Stock"].includes(value)
      ? "bg-orange-50 text-orange-500"
      : ["Draft", "PDF", "Excel"].includes(value)
        ? "bg-slate-100 text-slate-600"
        : "bg-red-50 text-red-500";

export const navItems = [
  ["dashboard", "Dashboard", "Home", "/admin"],
  ["products", "Products", "Grid", "/admin/products"],
  ["categories", "Categories", "Folder", "/admin/categories"],
  ["suppliers", "Suppliers", "Users", "/admin/suppliers"],
  ["stockIn", "Stock In", "Download", "/admin/stock-in"],
  ["stockOut", "Stock Out", "Refresh", "/admin/stock-out"],
  ["purchase", "Purchase", "Cart", "/admin/purchase"],
  ["orders", "Purchase Orders", "Cart", "/admin/purchase"],
  ["reports", "Reports", "Chart", "/admin/reports"],
  ["users", "Users", "Users", "/admin/users"],
  ["roles", "Roles & Permissions", "Shield", "/admin/users"],
  ["settings", "Settings", "Gear", "/admin"],
].map(([key, label, icon, to]) => ({ key, label, icon, to }));

const productRows = [
  ["Wireless Headphones", "WH-001", "Electronics", "$ 59.99", 25, "In Stock", "HP"],
  ["Mechanical Keyboard", "KB-002", "Electronics", "$ 89.99", 8, "Low Stock", "KB"],
  ["Wireless Mouse", "WM-003", "Electronics", "$ 19.99", 3, "Low Stock", "MS"],
  ['24" LED Monitor', "MON-004", "Electronics", "$ 129.99", 12, "In Stock", "MN"],
  ["Inkjet Printer", "PR-005", "Office Supplies", "$ 79.99", 0, "Out of Stock", "PR"],
  ["Office Chair", "CH-006", "Office Furniture", "$ 149.99", 7, "Low Stock", "CH"],
  ["A4 Paper Ream", "PRM-007", "Office Supplies", "$ 4.99", 120, "In Stock", "PA"],
  ["Laptop Backpack", "BG-008", "Accessories", "$ 29.99", 15, "In Stock", "BG"],
];

const productImages = [
  "https://cdn-icons-png.flaticon.com/512/3659/3659784.png",
  "https://cdn-icons-png.flaticon.com/512/2305/2305609.png",
  "https://cdn-icons-png.flaticon.com/512/1283/1283316.png",
  "https://cdn-icons-png.flaticon.com/512/1786/1786897.png",
  "https://cdn-icons-png.flaticon.com/512/3022/3022250.png",
  "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
  "https://cdn-icons-png.flaticon.com/512/337/337946.png",
  "https://cdn-icons-png.flaticon.com/512/3081/3081986.png",
];

const normalizeStatus = (amount, status) => {
  if (Number(amount) <= 0 || status === "Out of Stock") return "Out of Stock";
  if (Number(amount) <= 10 || status === "Low Stock") return "Low Stock";
  return "In Stock";
};

export const products = ref(
  productRows.map((row, index) => ({
    name: row[0],
    id: row[1],
    category: row[2],
    price: Number(String(row[3]).replace(/[^0-9.]/g, "")),
    amount: row[4],
    status: normalizeStatus(row[4], row[5]),
    date: `May ${20 - index}, 2025`,
    image: productImages[index % productImages.length],
  }))
);

export const productsWithStatus = computed(() =>
  products.value.map((product) => ({
    ...product,
    status: normalizeStatus(product.amount, product.status),
  }))
);

const stockRows = [
  ["IN-2025-0052", "Tech Supplier Co.", "May 20, 2025", 25, 150, "$ 15,250.00", "Completed", "T"],
  ["IN-2025-0051", "Global Electronics", "May 19, 2025", 18, 98, "$ 9,850.00", "Completed", "G"],
  ["IN-2025-0050", "Office Supply Ltd.", "May 18, 2025", 12, 75, "$ 7,500.00", "Completed", "O"],
  ["IN-2025-0049", "NextGen Traders", "May 17, 2025", 20, 120, "$ 12,600.00", "Completed", "N"],
  ["IN-2025-0048", "Prime Supplies", "May 16, 2025", 15, 60, "$ 6,300.00", "Pending", "P"],
  ["IN-2025-0047", "Super Products Co.", "May 15, 2025", 10, 40, "$ 4,200.00", "Pending", "S"],
  ["IN-2025-0046", "IQ Supplies", "May 14, 2025", 22, 110, "$ 11,000.00", "Draft", "I"],
  ["IN-2025-0045", "World Supplies Ltd.", "May 13, 2025", 8, 32, "$ 3,400.00", "Draft", "W"],
];

const stat = (icon, label, value, tone, note = "", change = "") => ({
  icon,
  label,
  value,
  note,
  change,
  tone: tones[tone],
});

const productCell = (item) => ({ kind: "product", title: item[0], sub: item[6] });
const avatarCell = (name, initials, i, tag = "") => ({ kind: "avatar", title: name, sub: initials, color: palette[i % palette.length], tag });
const badgeCell = (text) => ({ kind: "badge", text, tone: badgeTone(text) });
const linkCell = (text) => ({ kind: "link", text });

const transactionTable = (prefix, customer = false) => ({
  check: true,
  headers: ["#", "Reference No.", customer ? "Customer / Department" : "Supplier", "Date", "Items", "Total Quantity", "Total Cost", "Status"],
  rows: stockRows.map((r, i) => ({
    "#": i + 1,
    "Reference No.": linkCell(r[0].replace("IN", prefix)),
    [customer ? "Customer / Department" : "Supplier"]: avatarCell(customer ? ["Sales Department", "ABC Retail Store", "Maintenance Dept.", "XYZ Electronics", "Production Department", "John Retail Store", "Warranty Replacement", "Office Department"][i] : r[1], r[7], i),
    Date: r[2],
    Items: r[3],
    "Total Quantity": r[4],
    "Total Cost": r[5],
    Status: badgeCell(r[6]),
  })),
  footer: `Showing 1 to 8 of ${customer ? 280 : 320} entries`,
  last: customer ? "35" : "40",
});

export const pages = {
  dashboard: {
    title: "Welcome back, Admin!",
    subtitle: "Here's what's happening with your inventory today.",
    search: "Search anything...",
    date: "May 20, 2025",
    stats: [
      stat("Box", "Total Products", "1,250", "blue", "", "12.5% from last month"),
      stat("Cart", "Low Stock Items", "85", "green", "", "8.3% from last month"),
      stat("Download", "Stock In Today", "320", "purple", "", "15.2% from yesterday"),
      stat("Upload", "Stock Out Today", "210", "orange", "", "10.1% from yesterday"),
      stat("Dollar", "Total Suppliers", "45", "blue", "", "5.6% from last month"),
      stat("Users", "Total Users", "12", "red", "", "2.4% from last month"),
    ],
    categories: [
      ["Electronics", "35%", "#7c3aed"],
      ["Accessories", "25%", "#2563eb"],
      ["Office Supplies", "20%", "#31c48d"],
      ["Home Appliances", "15%", "#fb923c"],
      ["Others", "5%", "#fbbf24"],
    ],
    summaryTables: [
      {
        title: "Low Stock Items",
        headers: ["Product", "SKU", "Stock", "Status"],
        rows: productRows.slice(0, 4).map((p) => ({ Product: productCell(p), SKU: p[1], Stock: p[4], Status: badgeCell("Low Stock") })),
      },
      {
        title: "Recent Stock In",
        headers: ["Reference No.", "Supplier", "Items", "Date"],
        rows: stockRows.slice(0, 4).map((r) => ({ "Reference No.": r[0], Supplier: r[1], Items: r[3], Date: r[2] })),
      },
    ],
  },
  products: {
    title: "Products",
    subtitle: "Manage all products in your inventory",
    search: "Search product...",
    action: "Add Product",
    stats: [
      stat("Box", "Total Products", "1,250", "blue", "", "12.5% from last month"),
      stat("Box", "Active Products", "1,180", "green", "", "10.2% from last month"),
      stat("Box", "Low Stock Items", "85", "orange", "", "8.3% from last month"),
      stat("Box", "Out of Stock Items", "15", "red", "", "3.1% from last month"),
      stat("Dollar", "Total Value", "$ 45,230", "purple", "", "15.8% from last month"),
    ],
    filterSearch: "Search by product name, SKU...",
    filters: [["Category", "All Categories"], ["Status", "All Status"], ["Stock Status", "All"]],
    table: {
      check: true,
      headers: ["Product", "SKU", "Category", "Price", "Stock", "Status", "Stock Status"],
      rows: productRows.map((p) => ({ Product: productCell(p), SKU: p[1], Category: badgeCell(p[2]), Price: p[3], Stock: p[4], Status: badgeCell("Active"), "Stock Status": badgeCell(p[5]) })),
      footer: "Showing 1 to 8 of 1,250 entries",
      last: "156",
    },
  },
  categories: {
    title: "Categories",
    subtitle: "Manage product categories",
    search: "Search category...",
    action: "Add Category",
    stats: [
      stat("Folder", "Total Categories", "24", "blue", "All product categories"),
      stat("Check", "Active Categories", "22", "green", "Currently active"),
      stat("Box", "Inactive Categories", "2", "orange", "Currently inactive"),
      stat("Tag", "Total Products", "1,250", "purple", "Across all categories"),
    ],
    filterSearch: "Search by category name...",
    filters: [["Status", "All Status"]],
    table: {
      headers: ["#", "Category Name", "Description", "Products", "Status", "Created At"],
      rows: [
        ["Electronics", "Electronic devices and gadgets", 342, "Active", "May 20, 2025"],
        ["Office Supplies", "Office and stationery supplies", 186, "Active", "May 18, 2025"],
        ["Office Furniture", "Furniture and fixtures for office", 125, "Active", "May 15, 2025"],
        ["Accessories", "Various accessories and add-ons", 298, "Active", "May 10, 2025"],
        ["Hardware", "Computer and hardware items", 152, "Inactive", "May 8, 2025"],
        ["Cleaning Supplies", "Cleaning and maintenance items", 47, "Active", "May 5, 2025"],
      ].map((r, i) => ({ "#": i + 1, "Category Name": avatarCell(r[0], "C", i), Description: r[1], Products: r[2], Status: badgeCell(r[3]), "Created At": r[4] })),
      footer: "Showing 1 to 6 of 24 entries",
      last: "4",
    },
  },
  stockIn: {
    title: "Stock In",
    subtitle: "Manage all stock in transactions",
    search: "Search stock in...",
    action: "New Stock In",
    stats: [
      stat("Download", "Total Stock In", "320", "blue", "All time transactions"),
      stat("Calendar", "This Month", "48", "green", "Transactions"),
      stat("Box", "Total Items Received", "1,250", "purple", "All items"),
      stat("Dollar", "Total Cost", "$ 125,450", "orange", "All time cost"),
      stat("Truck", "Pending", "5", "cyan", "Draft transactions"),
    ],
    filterSearch: "Search by reference no, supplier, notes...",
    filters: [["Date Range", "May 1, 2025 - May 31, 2025"], ["Supplier", "All Suppliers"], ["Status", "All Status"]],
    table: transactionTable("IN"),
  },
  stockOut: {
    title: "Stock Out",
    subtitle: "Manage all stock out transactions",
    search: "Search stock out...",
    action: "New Stock Out",
    stats: [
      stat("Box", "Total Stock Out", "280", "red", "All time transactions"),
      stat("Calendar", "This Month", "35", "green", "Transactions"),
      stat("Box", "Total Items Issued", "980", "purple", "All items"),
      stat("Dollar", "Total Cost", "$ 98,750.00", "orange", "All time cost"),
      stat("File", "Pending", "6", "blue", "Draft transactions"),
    ],
    filterSearch: "Search by reference no, customer, reason...",
    filters: [["Date Range", "May 1, 2025 - May 31, 2025"], ["Customer / Department", "All Customers"], ["Status", "All Status"]],
    table: transactionTable("OUT", true),
  },
  purchase: {
    title: "Purchase",
    subtitle: "Manage all purchase transactions",
    search: "Search purchase...",
    action: "New Purchase",
    stats: [
      stat("Bag", "Total Purchases", "120", "blue", "All time transactions"),
      stat("Dollar", "Total Amount", "$ 245,780.00", "green", "All time amount"),
      stat("Cart", "This Month", "28", "purple", "Transactions"),
      stat("Wallet", "This Month Amount", "$ 65,430.00", "orange", "Amount"),
      stat("File", "Pending", "8", "cyan", "Pending purchases"),
    ],
    filterSearch: "Search by reference no., supplier, notes...",
    filters: [["Date Range", "May 1, 2025 - May 31, 2025"], ["Supplier", "All Suppliers"], ["Status", "All Status"]],
    table: {
      check: true,
      headers: ["#", "Reference No.", "Supplier", "Date", "Items", "Total Quantity", "Total Amount", "Payment Status", "Status"],
      rows: stockRows.map((r, i) => ({ "#": i + 1, "Reference No.": linkCell(r[0].replace("IN", "PUR")), Supplier: avatarCell(r[1], r[7], i), Date: r[2], Items: r[3], "Total Quantity": r[4], "Total Amount": r[5], "Payment Status": badgeCell(["Paid", "Paid", "Partial", "Paid", "Pending", "Pending", "Paid", "Partial"][i]), Status: badgeCell(r[6]) })),
      footer: "Showing 1 to 8 of 120 entries",
      last: "15",
    },
  },
  reports: {
    title: "Reports",
    subtitle: "View and analyze your inventory data",
    search: "Search reports...",
    stats: [
      stat("File", "Total Reports", "96", "blue", "All time generated"),
      stat("Trend", "This Month", "18", "green", "Reports generated"),
      stat("Download", "Downloaded", "42", "purple", "Reports downloaded"),
      stat("Clock", "Scheduled", "7", "orange", "Scheduled reports"),
      stat("Folder", "Favorites", "12", "cyan", "Saved reports"),
    ],
    filters: [["Date Range", "May 1, 2025 - May 31, 2025"], ["Report Type", "All Reports"], ["Supplier", "All Suppliers"], ["Category", "All Categories"]],
    reportTypes: [
      ["Stock Summary", "Overview of current stock levels and value", "blue"],
      ["Stock In Report", "Detailed report of all stock in transactions", "green"],
      ["Stock Out Report", "Detailed report of all stock out transactions", "orange"],
      ["Purchase Report", "Purchase summary and analysis report", "purple"],
      ["Low Stock Report", "List of all low stock items", "red"],
      ["Inventory Valuation", "Inventory value and valuation report", "cyan"],
    ],
    table: {
      headers: ["#", "Report Name", "Report Type", "Date Generated", "Generated By", "Format", "Status"],
      rows: ["Stock Summary", "Stock In Report", "Low Stock Report", "Purchase Report", "Inventory Valuation"].map((name, i) => ({ "#": i + 1, "Report Name": `${name} - May 2025`, "Report Type": name, "Date Generated": `May ${20 - i}, 2025`, "Generated By": "Admin", Format: badgeCell(i % 2 ? "Excel" : "PDF"), Status: badgeCell("Completed") })),
      footer: "Showing 1 to 5 of 96 entries",
      last: "20",
    },
  },
  users: {
    title: "Users",
    subtitle: "Manage system users and their access",
    search: "Search users...",
    action: "Add User",
    stats: [
      stat("Users", "Total Users", "42", "blue", "All system users"),
      stat("Users", "Active Users", "36", "green", "Currently active"),
      stat("Users", "Inactive Users", "6", "red", "Currently inactive"),
      stat("Shield", "Administrators", "5", "purple", "System administrators"),
      stat("Users", "Regular Users", "37", "orange", "Standard users"),
    ],
    filterSearch: "Search by name, email, or role...",
    filters: [["Role", "All Roles"], ["Status", "All Status"], ["Department", "All Departments"]],
    table: {
      check: true,
      headers: ["#", "User", "Email", "Role", "Department", "Status", "Last Login"],
      rows: [
        ["Admin User", "admin@ims.com", "Super Admin", "Management", "Active", "May 20, 2025 10:30 AM", "AD", "Admin"],
        ["John Doe", "john.doe@ims.com", "Administrator", "Operations", "Active", "May 20, 2025 09:15 AM", "JD"],
        ["Sarah Miller", "sarah.miller@ims.com", "Manager", "Sales", "Active", "May 20, 2025 08:45 AM", "SM"],
        ["Robert Wilson", "robert.wilson@ims.com", "Manager", "Warehouse", "Active", "May 19, 2025 04:20 PM", "RW"],
        ["Emily Martinez", "emily.martinez@ims.com", "User", "Purchasing", "Active", "May 19, 2025 03:10 PM", "EM"],
        ["David Lee", "david.lee@ims.com", "User", "Inventory", "Inactive", "May 18, 2025 11:30 AM", "DL"],
        ["Amanda Clark", "amanda.clark@ims.com", "User", "Sales", "Active", "May 18, 2025 10:05 AM", "AK"],
        ["Michael Turner", "michael.turner@ims.com", "User", "Reports", "Inactive", "May 17, 2025 05:40 PM", "MT"],
      ].map((u, i) => ({ "#": i + 1, User: avatarCell(u[0], u[6], i, u[7]), Email: u[1], Role: badgeCell(u[2]), Department: u[3], Status: badgeCell(u[4]), "Last Login": u[5] })),
      footer: "Showing 1 to 8 of 42 entries",
      last: "6",
    },
  },
};

pages.suppliers = pages.users;
