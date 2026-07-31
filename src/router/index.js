import { createRouter, createWebHistory } from "vue-router";
import Home from "../Admin/Page/Home.vue";
import Product from "../Admin/Page/Product.vue";
import Category from "../Admin/Page/Category.vue";
import Supplier from "../Admin/Page/Supplier.vue";
import StockIn from "../Admin/Page/Stock_in.vue";
import StockOut from "../Admin/Page/Stock_out.vue";
import Purchase from "../Admin/Page/Purchase.vue";
import Reports from "../Admin/Page/Reports.vue";
import User from "../Admin/Page/User.vue";
import AdminProfile from "../Admin/Page/Profile.vue";
import StaffHome from "../Staff/Page/Home.vue";
import StaffProduct from "../Staff/Page/Product.vue";
import StaffReports from "../Staff/Page/Reports.vue";
import StaffStockIn from "../Staff/Page/Stock_in.vue";
import StaffStockOut from "../Staff/Page/Stock_out.vue";
import StaffProfile from "../Staff/Page/Profile.vue";
import StaffSupplier from "../Staff/Page/Supplier.vue";
import StaffPurchaseHistory from "../Staff/Page/PurchaseHistory.vue";
import ManagerHome from "../Manager/Page/Home.vue";
import ManagerProfile from "../Manager/Page/Profile.vue";
import ManagerTotalProducts from "../Manager/Page/TotalProducts.vue";
import ManagerLowStock from "../Manager/Page/LowStock.vue";
import ManagerCategories from "../Manager/Page/Categories.vue";
import ManagerTotalSuppliers from "../Manager/Page/TotalSuppliers.vue";
import ManagerPurchaseSummary from "../Manager/Page/PurchaseSummary.vue";
import ManagerStockIn from "../Manager/Page/StockIn.vue";
import ManagerStockOut from "../Manager/Page/StockOut.vue";
import ManagerInventoryReport from "../Manager/Page/InventoryReport.vue";
import Login from "../Auth/Login.vue";
import { hasStoredStaffPermission } from "../utils/staffPermissions";

const roleHomePaths = {
    admin: "/admin",
    manager: "/manager",
    staff: "/staff",
};

const normalizeRole = (role) => String(role || "").toLowerCase().trim();

const getStoredUserRole = () => {
    const savedRole = normalizeRole(localStorage.getItem("user_role"));

    if (savedRole) {
        return savedRole;
    }

    try {
        const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
        return normalizeRole(user.role || user.user_type || user.type);
    } catch {
        return "";
    }
};

const clearAuthStorage = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("user_role");
    sessionStorage.removeItem("auth_session");
};

const hasActiveLoginSession = () => sessionStorage.getItem("auth_session") === "active";

const routes = [
    { path: "/", redirect: "/login" },
    { path: "/admin", name: "admin-home", component: Home, meta: { requiresAuth: true, role: "admin" } },
    { path: "/admin/products", name: "admin-products", component: Product, meta: { requiresAuth: true, role: "admin" } },
    { path: "/admin/categories", name: "admin-categories", component: Category, meta: { requiresAuth: true, role: "admin" } },
    { path: "/admin/suppliers", name: "admin-suppliers", component: Supplier, meta: { requiresAuth: true, role: "admin" } },
    { path: "/admin/stock-in", name: "admin-stock-in", component: StockIn, meta: { requiresAuth: true, role: "admin" } },
    { path: "/admin/stock-out", name: "admin-stock-out", component: StockOut, meta: { requiresAuth: true, role: "admin" } },
    { path: "/admin/purchase", name: "admin-purchase", component: Purchase, meta: { requiresAuth: true, role: "admin" } },
    { path: "/admin/reports", name: "admin-reports", component: Reports, meta: { requiresAuth: true, role: "admin" } },
    { path: "/admin/users", name: "admin-users", component: User, meta: { requiresAuth: true, role: "admin" } },
    { path: "/admin/profile", name: "admin-profile", component: AdminProfile, meta: { requiresAuth: true, role: "admin" } },
    { path: "/staff", name: "staff-home", component: StaffHome, meta: { requiresAuth: true, role: "staff", staffPermission: "dashboard.view" } },
    { path: "/staff/product", name: "staff-product", component: StaffProduct, meta: { requiresAuth: true, role: "staff", readOnly: true, staffPermission: "products.view" } },
    { path: "/staff/stock-in", name: "staff-stock-in", component: StaffStockIn, meta: { requiresAuth: true, role: "staff", staffPermission: "stock_in.view" } },
    { path: "/staff/stock-out", name: "staff-stock-out", component: StaffStockOut, meta: { requiresAuth: true, role: "staff", staffPermission: "stock_out.view" } },
    { path: "/staff/suppliers", name: "staff-suppliers", component: StaffSupplier, meta: { requiresAuth: true, role: "staff", readOnly: true, staffPermission: "suppliers.view" } },
    { path: "/staff/purchase-history", name: "staff-purchase-history", component: StaffPurchaseHistory, meta: { requiresAuth: true, role: "staff", readOnly: true, staffPermission: "purchases.view" } },
    { path: "/staff/reports", name: "staff-reports", component: StaffReports, meta: { requiresAuth: true, role: "staff", readOnly: true, staffPermission: "reports.view" } },
    { path: "/staff/profile", name: "staff-profile", component: StaffProfile, meta: { requiresAuth: true, role: "staff", staffPermission: "profile.manage" } },
    { path: "/manager", name: "manager-home", component: ManagerHome, meta: { requiresAuth: true, role: "manager" } },
    { path: "/manager/products", name: "manager-products", component: ManagerTotalProducts, meta: { requiresAuth: true, role: "manager" } },
    { path: "/manager/low-stock", name: "manager-low-stock", component: ManagerLowStock, meta: { requiresAuth: true, role: "manager", defaultStockStatus: "Low Stock" } },
    { path: "/manager/categories", name: "manager-categories", component: ManagerCategories, meta: { requiresAuth: true, role: "manager", readOnly: true } },
    { path: "/manager/reports", name: "manager-reports", component: ManagerInventoryReport, meta: { requiresAuth: true, role: "manager", readOnly: true } },
    { path: "/manager/purchase-history", name: "manager-purchase-history", component: ManagerPurchaseSummary, meta: { requiresAuth: true, role: "manager" } },
    { path: "/manager/stock-status", redirect: "/manager/products", meta: { requiresAuth: true, role: "manager" } },
    { path: "/manager/supplier-list", name: "manager-supplier-list", component: ManagerTotalSuppliers, meta: { requiresAuth: true, role: "manager", readOnly: true } },
    { path: "/manager/stock-in", name: "manager-stock-in", component: ManagerStockIn, meta: { requiresAuth: true, role: "manager" } },
    { path: "/manager/stock-out", name: "manager-stock-out", component: ManagerStockOut, meta: { requiresAuth: true, role: "manager" } },
    { path: "/manager/user-activity", redirect: "/manager", meta: { requiresAuth: true, role: "manager" } },
    { path: "/manager/profile", name: "manager-profile", component: ManagerProfile, meta: { requiresAuth: true, role: "manager", readOnly: true } },
    { path: "/login", name: "login", component: Login },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to) => {
    const token = localStorage.getItem("auth_token");
    const hasSession = hasActiveLoginSession();
    const userRole = getStoredUserRole();
    const userHomePath = roleHomePaths[userRole];
    const requiredRole = normalizeRole(to.meta.role);

    if (to.name === "login") {
        clearAuthStorage();
        return true;
    }

    if (to.meta.requiresAuth && (!token || !hasSession)) {
        clearAuthStorage();

        return {
            path: "/login",
            query: to.fullPath === "/" ? {} : { redirect: to.fullPath },
        };
    }

    if (to.meta.requiresAuth && !userHomePath) {
        clearAuthStorage();

        return {
            path: "/login",
            query: { redirect: to.fullPath },
        };
    }

    if (requiredRole && requiredRole !== userRole) {
        return userHomePath;
    }

    if (userRole === "staff" && to.meta.staffPermission && !hasStoredStaffPermission(to.meta.staffPermission)) {
        return "/staff";
    }

    return true;
});

export default router;
