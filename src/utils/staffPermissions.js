export const STAFF_PERMISSION_OPTIONS = [
  {
    module: "products",
    label: "Products",
    description: "View inventory and manage product records.",
    permissions: [
      { key: "products.view", label: "View" },
      { key: "products.manage", label: "Manage" },
    ],
  },
  {
    module: "stock_in",
    label: "Stock In",
    description: "View and record incoming inventory.",
    permissions: [
      { key: "stock_in.view", label: "View" },
      { key: "stock_in.manage", label: "Manage" },
    ],
  },
  {
    module: "stock_out",
    label: "Stock Out",
    description: "View and record outgoing inventory.",
    permissions: [
      { key: "stock_out.view", label: "View" },
      { key: "stock_out.manage", label: "Manage" },
    ],
  },
  {
    module: "reports",
    label: "Reports",
    description: "View operational reports and manage saved reports.",
    permissions: [
      { key: "reports.view", label: "View" },
      { key: "reports.manage", label: "Manage" },
    ],
  },
  {
    module: "suppliers",
    label: "Suppliers",
    description: "View supplier contact and purchasing information.",
    permissions: [
      { key: "suppliers.view", label: "View" },
    ],
  },
  {
    module: "purchases",
    label: "Purchase History",
    description: "View purchase and receiving history.",
    permissions: [
      { key: "purchases.view", label: "View" },
    ],
  },
];

export const DEFAULT_STAFF_PERMISSIONS = [
  "dashboard.view",
  "products.view",
  "stock_in.view",
  "stock_in.manage",
  "stock_out.view",
  "stock_out.manage",
  "reports.view",
  "suppliers.view",
  "purchases.view",
  "profile.manage",
];

const normalizePermission = (permission) => String(permission || "")
  .trim()
  .toLowerCase()
  .replace(/[\s:-]+/g, ".");

const parsePermissionValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      return parsePermissionValue(JSON.parse(value));
    } catch {
      return value.split(",").map((permission) => permission.trim());
    }
  }

  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, enabled]) => {
      if (Array.isArray(enabled)) {
        return enabled.map((action) => `${key}.${action}`);
      }

      if (enabled && typeof enabled === "object") {
        return Object.entries(enabled)
          .filter(([, allowed]) => Boolean(allowed))
          .map(([action]) => `${key}.${action}`);
      }

      return enabled ? [key] : [];
    });
  }

  return [];
};

export const getUserPermissions = (user = {}) => {
  const rawPermissions =
    user.permissions ??
    user.staff_permissions ??
    user.abilities ??
    user.access ??
    user.role_permissions;
  const parsed = parsePermissionValue(rawPermissions)
    .map((permission) => normalizePermission(
      typeof permission === "object"
        ? permission.name || permission.key || permission.permission
        : permission
    ))
    .filter(Boolean);

  const permissions = new Set(parsed.length ? parsed : DEFAULT_STAFF_PERMISSIONS);
  permissions.add("dashboard.view");
  permissions.add("profile.manage");

  return [...permissions];
};

export const hasStaffPermission = (user, permission) => {
  const normalizedPermission = normalizePermission(permission);
  const permissions = getUserPermissions(user);

  return permissions.includes("*")
    || permissions.includes(normalizedPermission)
    || permissions.includes(`${normalizedPermission.split(".")[0]}.*`);
};

export const getStoredStaffPermissions = () => {
  try {
    const user = JSON.parse(localStorage.getItem("auth_user") || "{}") || {};
    return getUserPermissions(user);
  } catch {
    return [...DEFAULT_STAFF_PERMISSIONS];
  }
};

export const hasStoredStaffPermission = (permission) => {
  const permissions = getStoredStaffPermissions();
  const normalizedPermission = normalizePermission(permission);

  return permissions.includes("*")
    || permissions.includes(normalizedPermission)
    || permissions.includes(`${normalizedPermission.split(".")[0]}.*`);
};

export const ensureManageIncludesView = (permissions = []) => {
  const normalized = new Set(permissions.map(normalizePermission).filter(Boolean));

  [...normalized]
    .filter((permission) => permission.endsWith(".manage"))
    .forEach((permission) => normalized.add(permission.replace(/\.manage$/, ".view")));

  normalized.add("dashboard.view");
  normalized.add("profile.manage");

  return [...normalized];
};
