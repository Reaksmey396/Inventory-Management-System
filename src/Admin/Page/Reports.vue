<template>
  <div class="flex min-h-screen bg-[#f6f9ff] text-[#10234d]">
    <Sidebar page-key="reports" />

    <main class="min-w-0 flex-1 overflow-x-hidden px-7 py-6">
      <header class="mb-6">
        <h1 class="text-[26px] font-black leading-tight text-[#10234d]">Reports</h1>
        <p class="mt-1 text-[13px] font-semibold text-[#6c7da4]">View and analyze your inventory data</p>
      </header>

      <section class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="flex min-h-[112px] min-w-0 items-center gap-4 rounded-lg border border-[#dfe7f3] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,35,80,0.04)]"
        >
          <span class="grid h-[58px] w-[58px] flex-shrink-0 place-items-center rounded-xl text-[24px]" :class="card.iconWrap">
            <i :class="card.icon"></i>
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate whitespace-nowrap text-[11px] font-black text-[#223763]" :title="card.label">{{ card.label }}</p>
            <p class="mt-1 whitespace-nowrap text-[24px] font-black leading-tight text-[#10234d]">{{ card.value }}</p>
            <p class="mt-1 truncate whitespace-nowrap text-[11px] font-semibold text-[#6c7da4]" :title="card.note">{{ card.note }}</p>
          </div>
        </article>
      </section>

      <section class="mb-5 rounded-lg border border-[#dfe7f3] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,35,80,0.04)]">
        <div class="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-[minmax(230px,1fr)_minmax(230px,1fr)_minmax(230px,1fr)_auto]">
          <label class="grid min-w-0 gap-1">
            <span class="text-[11px] font-black text-[#223763]">Report Date</span>
            <select
              v-model="selectedDate"
              class="h-11 w-full cursor-pointer rounded-md border border-[#dbe4f0] bg-white px-3 text-[12px] font-bold text-[#10234d] outline-none focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Dates</option>
              <option v-for="date in dateOptions" :key="date.value" :value="date.value">{{ date.label }}</option>
            </select>
          </label>

          <label class="grid min-w-0 gap-1">
            <span class="text-[11px] font-black text-[#223763]">Report Type</span>
            <select
              v-model="selectedType"
              class="h-11 w-full cursor-pointer rounded-md border border-[#dbe4f0] bg-white px-3 text-[12px] font-bold text-[#10234d] outline-none focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Reports</option>
              <option v-for="type in reportTypes" :key="type.label" :value="type.label">{{ type.label }}</option>
            </select>
          </label>

          <label class="grid min-w-0 gap-1">
            <span class="text-[11px] font-black text-[#223763]">Category</span>
            <select
              v-model="selectedCategory"
              class="h-11 w-full cursor-pointer rounded-md border border-[#dbe4f0] bg-white px-3 text-[12px] font-bold text-[#10234d] outline-none focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Categories</option>
              <option v-for="category in categoryOptions" :key="category.id" :value="category.name">{{ category.name }}</option>
            </select>
          </label>

          <button
            type="button"
            class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#0d6efd] px-5 text-[12px] font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#0b5ed7] md:w-fit"
            @click="clearFilters"
          >
            <i class="fa-solid fa-filter text-[11px]"></i>
            All Dates
          </button>
        </div>
      </section>

      <section class="mb-5">
        <h2 class="mb-3 text-[14px] font-black text-[#10234d]">Report Types</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="type in reportTypes"
            :key="type.label"
            class="flex min-h-[86px] min-w-0 items-center gap-4 rounded-lg border border-[#dfe7f3] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,35,80,0.04)]"
          >
            <span class="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-[22px]" :class="type.iconWrap">
              <i :class="type.icon"></i>
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate whitespace-nowrap text-[12px] font-black text-[#223763]" :title="type.label">{{ type.label }}</p>
              <p class="mt-1 truncate whitespace-nowrap text-[11px] font-semibold text-[#6c7da4]" :title="type.note">{{ type.note }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(280px,0.9fr)]">
        <article class="min-w-0 rounded-lg border border-[#dfe7f3] bg-white p-5 shadow-[0_10px_30px_rgba(15,35,80,0.04)]">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-[14px] font-black text-[#10234d]">Inventory Value Overview</h2>
            <span class="rounded-md border border-[#dbe4f0] px-3 py-1.5 text-[11px] font-bold text-[#506283]">All Dates</span>
          </div>
          <div class="flex h-[210px] min-w-0 gap-3">
            <div class="flex w-10 flex-shrink-0 flex-col justify-between pb-7 text-right text-[11px] font-semibold text-[#6c7da4]">
              <span>{{ valueScale.max }}</span>
              <span>{{ valueScale.midHigh }}</span>
              <span>{{ valueScale.mid }}</span>
              <span>{{ valueScale.midLow }}</span>
              <span>$0</span>
            </div>
            <div class="flex min-w-0 flex-1 flex-col">
              <div class="relative flex flex-1 items-end justify-between gap-2 border-b border-l border-[#e8eef7] px-3 sm:gap-4 sm:px-5">
                <span class="absolute left-0 top-1/4 h-px w-full bg-[#edf2f8]"></span>
                <span class="absolute left-0 top-1/2 h-px w-full bg-[#edf2f8]"></span>
                <span class="absolute left-0 top-3/4 h-px w-full bg-[#edf2f8]"></span>
                <span v-for="bar in valueBars" :key="bar.label" class="relative z-10 w-7 rounded-t-md bg-[#0d6efd] sm:w-10" :style="{ height: bar.height }"></span>
              </div>
              <div class="grid grid-cols-5 gap-2 pt-2 text-center text-[11px] font-semibold leading-snug text-[#6c7da4]">
                <span v-for="bar in valueBars" :key="bar.label" class="min-w-0 break-words">{{ bar.label }}</span>
              </div>
            </div>
          </div>
        </article>

        <article class="min-w-0 rounded-lg border border-[#dfe7f3] bg-white p-5 shadow-[0_10px_30px_rgba(15,35,80,0.04)]">
          <h2 class="mb-4 text-[14px] font-black text-[#10234d]">Stock Status Summary</h2>
          <div class="flex min-w-0 flex-col items-center gap-4 sm:flex-row">
            <div class="grid h-[168px] w-[168px] flex-shrink-0 place-items-center rounded-full" :style="{ background: stockStatusGradient }">
              <div class="grid h-[100px] w-[100px] place-items-center rounded-full bg-white shadow-sm">
                <div class="text-center">
                  <p class="text-[24px] font-black leading-none text-[#10234d]">{{ totalProducts.toLocaleString() }}</p>
                  <p class="mt-1 text-[11px] font-semibold text-[#6c7da4]">Total Items</p>
                </div>
              </div>
            </div>
            <div class="grid min-w-0 flex-1 gap-3">
              <div v-for="item in stockStatus" :key="item.label" class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-[12px] font-semibold text-[#223763]">
                <span class="flex min-w-0 items-center gap-2">
                  <span class="h-2.5 w-2.5 flex-shrink-0 rounded-full" :style="{ backgroundColor: item.color }"></span>
                  {{ item.label }}
                </span>
                <span class="text-right font-black">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </article>

        <article class="min-w-0 rounded-lg border border-[#dfe7f3] bg-white p-5 shadow-[0_10px_30px_rgba(15,35,80,0.04)] xl:col-span-2 2xl:col-span-1">
          <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
            <h2 class="max-w-[190px] text-[14px] font-black leading-snug text-[#10234d]">Top Categories by Value</h2>
            <span class="rounded-md border border-[#dbe4f0] px-3 py-1.5 text-[11px] font-bold text-[#506283]">All Dates</span>
          </div>
          <div class="grid gap-3">
            <div v-for="category in topCategories" :key="category.name" class="grid min-w-0 grid-cols-[minmax(0,1.15fr)_minmax(72px,1fr)_auto] items-center gap-3 text-[12px]">
              <span class="min-w-0 font-semibold leading-snug text-[#223763]">{{ category.name }}</span>
              <span class="h-1.5 min-w-0 rounded-full bg-[#edf2f8]">
                <span class="block h-full rounded-full" :class="category.barClass" :style="{ width: category.width }"></span>
              </span>
              <span class="text-right font-black text-[#10234d]">{{ category.value }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="overflow-hidden rounded-lg border border-[#dfe7f3] bg-white shadow-[0_10px_30px_rgba(15,35,80,0.04)]">
        <div class="flex items-center justify-between gap-4 border-b border-[#e8eef7] px-6 py-4">
          <div>
            <h2 class="text-[14px] font-black text-[#10234d]">Report Data</h2>
            <p class="mt-1 text-[11px] font-bold text-[#6c7da4]">Showing {{ selectedDate ? formatDateOnly(selectedDate) : 'all dates' }}</p>
          </div>
          <button type="button" class="rounded-md border border-[#dbe4f0] px-3 py-1.5 text-[11px] font-bold text-[#0d6efd]" @click="clearFilters">View All Dates</button>
        </div>

        <div class="admin-table-scroll overflow-x-auto">
          <table class="admin-data-table w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr class="bg-[#f8fbff] text-[11px] font-black text-[#315071]">
                <th class="w-[70px] border-b border-[#e8eef7] px-6 py-4">#</th>
                <th class="w-[260px] border-b border-[#e8eef7] px-5 py-4">Report Name</th>
                <th class="w-[170px] border-b border-[#e8eef7] px-5 py-4">Report Type</th>
                <th class="w-[160px] border-b border-[#e8eef7] px-5 py-4">Report Date</th>
                <th class="w-[170px] border-b border-[#e8eef7] px-5 py-4 text-right">Amount / Value</th>
                <th class="w-[170px] border-b border-[#e8eef7] px-5 py-4">Generated By</th>
                <th class="w-[120px] border-b border-[#e8eef7] px-5 py-4">Format</th>
                <th class="w-[130px] border-b border-[#e8eef7] px-5 py-4">Status</th>
                <th class="w-[120px] border-b border-[#e8eef7] px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#edf2f8]">
              <tr v-if="loading">
                <td colspan="9" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">
                  <i class="fa-solid fa-spinner mr-2 animate-spin"></i>
                  Loading report data...
                </td>
              </tr>
              <tr v-else-if="errorMessage">
                <td colspan="9" class="px-5 py-10 text-center text-[13px] font-bold text-red-500">{{ errorMessage }}</td>
              </tr>
              <tr v-else-if="filteredReports.length === 0">
                <td colspan="9" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">No reports found for the selected filters.</td>
              </tr>
              <tr v-for="(report, index) in filteredReports" v-else :key="report.id" class="text-[12px] font-semibold text-[#223763] transition hover:bg-[#f8fbff]">
                <td class="px-6 py-4 text-[#506283]">{{ index + 1 }}</td>
                <td class="px-5 py-4 font-black text-[#223763]">{{ report.name }}</td>
                <td class="px-5 py-4">{{ report.type }}</td>
                <td class="whitespace-nowrap px-5 py-4 text-[#34476d]">{{ report.dateLabel }}</td>
                <td class="px-5 py-4 text-right font-black tabular-nums text-[#10234d]">{{ report.amountText }}</td>
                <td class="px-5 py-4">{{ report.generatedBy }}</td>
                <td class="px-5 py-4">
                  <span class="inline-flex h-6 items-center rounded-full px-3 text-[10px] font-black" :class="formatClass(report.format)">{{ report.format }}</span>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex h-6 items-center rounded-full bg-emerald-100 px-3 text-[10px] font-black text-emerald-600">{{ report.status }}</span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-3">
                    <button class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-blue-50 text-[#0d6efd] transition hover:bg-blue-100" aria-label="View report">
                      <i class="fa-solid fa-eye text-[12px]"></i>
                    </button>
                    <button v-if="!isReadOnly" class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100" aria-label="Delete report" @click="askDelete(report)">
                      <i class="fa-solid fa-trash-can text-[12px]"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="flex flex-wrap items-center justify-between gap-4 border-t border-[#e8eef7] px-6 py-4">
          <p class="text-[12px] font-semibold text-[#506283]">
            Showing {{ filteredReports.length ? 1 : 0 }} to {{ filteredReports.length }} of {{ reportRows.length }} entries
          </p>
        </footer>
      </section>
    </main>

    <DeleteConfirmModal v-if="!isReadOnly && reportPendingDelete" @cancel="cancelDelete" @confirm="removeReport" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../../Components/RoleSidebar.vue";
import DeleteConfirmModal from "../Components/DeleteConfirmModal.vue";
const route = useRoute();
const isReadOnly = computed(() => Boolean(route.meta.readOnly));
import { getAuthHeaders, getCurrentUser } from "../../utils/auth";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "https://laravel-inventory-management-2.onrender.com").replace(/\/+$/, "");

const loading = ref(false);
const errorMessage = ref("");
const selectedDate = ref("");
const selectedType = ref("");
const selectedCategory = ref("");
const reportPendingDelete = ref(null);
const removedReportIds = ref(new Set());

const products = ref([]);
const categories = ref([]);
const purchases = ref([]);
const stockIns = ref([]);
const stockOuts = ref([]);

const reportTypes = [
  { label: "Stock Summary", note: "Overview of current stock levels and value", icon: "fa-solid fa-network-wired", iconWrap: "bg-blue-50 text-[#0d6efd]" },
  { label: "Stock In Report", note: "Detailed report of all stock in transactions", icon: "fa-solid fa-arrow-down", iconWrap: "bg-emerald-50 text-emerald-500" },
  { label: "Stock Out Report", note: "Detailed report of all stock out transactions", icon: "fa-solid fa-arrow-up", iconWrap: "bg-orange-50 text-orange-500" },
  { label: "Purchase Report", note: "Purchase summary and analysis report", icon: "fa-solid fa-cart-shopping", iconWrap: "bg-violet-50 text-violet-500" },
  { label: "Low Stock Report", note: "List of all low stock items", icon: "fa-solid fa-triangle-exclamation", iconWrap: "bg-red-50 text-red-500" },
  { label: "Inventory Valuation", note: "Inventory value and valuation report", icon: "fa-solid fa-sack-dollar", iconWrap: "bg-cyan-50 text-cyan-500" },
];

const unwrapCollection = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[key]?.data)) return payload[key].data;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const parseApiResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() };
  }
};

const getResponseMessage = (data, fallback) => {
  const validationMessages = Object.values(data?.errors || {}).flat();
  return validationMessages.length ? validationMessages.join(" ") : data?.message || data?.error || fallback;
};

const fetchCollection = async (endpoint, key) => {
  const response = await fetch(`${apiBaseUrl}/${endpoint}`, { headers: getAuthHeaders() });
  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(getResponseMessage(data, `Could not load ${endpoint}.`));
  }

  return unwrapCollection(data, key);
};

const toDateKey = (value) => {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? raw : date.toISOString().slice(0, 10);
};

const formatDateOnly = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

const formatMoney = (value) => {
  return `$ ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getUserName = (record) => {
  const user = record?.creator || record?.user || record?.created_by || getCurrentUser();
  if (typeof user === "object") return user.name || user.username || user.email || "Admin";
  return "Admin";
};

const productCategoryName = (product) => {
  return product?.category?.cate_name || product?.category?.name || product?.category_name || product?.cate_name || "Uncategorized";
};

const productStock = (product) => Number(product?.stock_qty ?? product?.stock ?? product?.quantity ?? product?.qty ?? product?.current_stock ?? 0);
const productValue = (product) => productStock(product) * Number(product?.cost_price ?? product?.price ?? product?.cost ?? 0);

const makeReport = ({ id, name, type, date, amount = 0, generatedBy = "Admin", format = "View", category = "", status = "Completed" }) => ({
  id,
  name,
  type,
  dateKey: toDateKey(date),
  dateLabel: formatDateOnly(toDateKey(date)),
  amount,
  amountText: formatMoney(amount),
  generatedBy,
  format,
  category,
  status,
});

const stockInTotal = (stockIn) => {
  const details = stockIn.details || stockIn.stock_in_details || [];
  return details.reduce((sum, detail) => sum + Number(detail.quantity || 0) * Number(detail.in_cost ?? detail.cost ?? 0), 0);
};

const stockOutTotal = (stockOut) => {
  const details = stockOut.details || stockOut.stock_out_details || [];
  return details.reduce((sum, detail) => sum + Number(detail.quantity || 0) * Number(detail.out_cost ?? detail.cost ?? 0), 0);
};

const reportRows = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  const inventoryValue = products.value.reduce((sum, product) => sum + productValue(product), 0);
  const lowStockCount = products.value.filter((product) => productStock(product) > 0 && productStock(product) <= 10).length;
  const outOfStockCount = products.value.filter((product) => productStock(product) <= 0).length;

  const rows = [
    makeReport({ id: "stock-summary", name: "Stock Summary - All Dates", type: "Stock Summary", date: today, amount: products.value.length, format: "View" }),
    makeReport({ id: "low-stock", name: "Low Stock Report - All Dates", type: "Low Stock Report", date: today, amount: lowStockCount, format: "View" }),
    makeReport({ id: "valuation", name: "Inventory Valuation - All Dates", type: "Inventory Valuation", date: today, amount: inventoryValue, format: "View" }),
  ];

  purchases.value.forEach((purchase) => {
    const date = purchase.purchase_date || purchase.created_at;
    rows.push(makeReport({
      id: `purchase-${purchase.id}`,
      name: `${purchase.purchase_no || `Purchase #${purchase.id}`} - ${formatDateOnly(toDateKey(date))}`,
      type: "Purchase Report",
      date,
      amount: Number(purchase.total_amount || 0),
      generatedBy: getUserName(purchase),
      format: "API",
    }));
  });

  stockIns.value.forEach((stockIn) => {
    const date = stockIn.stock_in_date || stockIn.created_at;
    rows.push(makeReport({
      id: `stock-in-${stockIn.id}`,
      name: `${stockIn.reference_no || `Stock In #${stockIn.id}`} - ${formatDateOnly(toDateKey(date))}`,
      type: "Stock In Report",
      date,
      amount: stockInTotal(stockIn),
      generatedBy: getUserName(stockIn),
      format: "API",
    }));
  });

  stockOuts.value.forEach((stockOut) => {
    const date = stockOut.stock_out_date || stockOut.created_at;
    rows.push(makeReport({
      id: `stock-out-${stockOut.id}`,
      name: `${stockOut.reference_no || `Stock Out #${stockOut.id}`} - ${formatDateOnly(toDateKey(date))}`,
      type: "Stock Out Report",
      date,
      amount: stockOutTotal(stockOut),
      generatedBy: getUserName(stockOut),
      format: "API",
    }));
  });

  products.value.forEach((product) => {
    rows.push(makeReport({
      id: `product-${product.id}`,
      name: product.product_name || product.name || `Product #${product.id}`,
      type: "Stock Summary",
      date: product.updated_at || product.created_at || today,
      amount: productValue(product),
      generatedBy: getUserName(product),
      format: "API",
      category: productCategoryName(product),
    }));
  });

  return rows
    .filter((report) => !removedReportIds.value.has(report.id))
    .sort((a, b) => String(b.dateKey).localeCompare(String(a.dateKey)) || String(a.name).localeCompare(String(b.name)));
});

const dateOptions = computed(() => {
  return [...new Set(reportRows.value.map((report) => report.dateKey).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({ value: date, label: formatDateOnly(date) }));
});

const categoryOptions = computed(() => {
  const fromApi = categories.value.map((category) => ({
    id: category.id || category.cate_name || category.name,
    name: category.cate_name || category.name || `Category #${category.id}`,
  }));
  const fromProducts = products.value.map((product) => ({ id: productCategoryName(product), name: productCategoryName(product) }));
  const names = new Map([...fromApi, ...fromProducts].filter((category) => category.name).map((category) => [category.name, category]));
  return [...names.values()].sort((a, b) => a.name.localeCompare(b.name));
});

const filteredReports = computed(() => {
  return reportRows.value.filter((report) => {
    const matchDate = !selectedDate.value || report.dateKey === selectedDate.value;
    const matchType = !selectedType.value || report.type === selectedType.value;
    const matchCategory = !selectedCategory.value || report.category === selectedCategory.value;
    return matchDate && matchType && matchCategory;
  });
});

const totalProducts = computed(() => products.value.length);

const summaryCards = computed(() => {
  const purchaseTotal = purchases.value.reduce((sum, purchase) => sum + Number(purchase.total_amount || 0), 0);
  const stockInTotalAmount = stockIns.value.reduce((sum, stockIn) => sum + stockInTotal(stockIn), 0);
  const stockOutTotalAmount = stockOuts.value.reduce((sum, stockOut) => sum + stockOutTotal(stockOut), 0);
  const allDates = dateOptions.value.length;

  return [
    { label: "Total Reports", value: reportRows.value.length.toLocaleString(), note: `${allDates.toLocaleString()} report date(s)`, icon: "fa-regular fa-file-lines", iconWrap: "bg-blue-50 text-[#0d6efd]" },
    { label: "Products", value: products.value.length.toLocaleString(), note: "Current inventory items", icon: "fa-solid fa-box", iconWrap: "bg-emerald-50 text-emerald-500" },
    { label: "Purchases", value: formatMoney(purchaseTotal), note: `${purchases.value.length.toLocaleString()} purchase records`, icon: "fa-solid fa-cart-shopping", iconWrap: "bg-violet-50 text-violet-500" },
    { label: "Stock In", value: formatMoney(stockInTotalAmount), note: `${stockIns.value.length.toLocaleString()} stock in records`, icon: "fa-solid fa-arrow-down", iconWrap: "bg-cyan-50 text-cyan-500" },
    { label: "Stock Out", value: formatMoney(stockOutTotalAmount), note: `${stockOuts.value.length.toLocaleString()} stock out records`, icon: "fa-solid fa-arrow-up", iconWrap: "bg-orange-50 text-orange-500" },
  ];
});

const valueScale = computed(() => {
  const maxValue = Math.max(...topCategories.value.map((category) => category.rawValue), 1);
  return {
    max: formatMoney(maxValue),
    midHigh: formatMoney(maxValue * 0.75),
    mid: formatMoney(maxValue * 0.5),
    midLow: formatMoney(maxValue * 0.25),
  };
});

const topCategories = computed(() => {
  const totals = products.value.reduce((map, product) => {
    const name = productCategoryName(product);
    map.set(name, (map.get(name) || 0) + productValue(product));
    return map;
  }, new Map());

  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(...rows.map(([, value]) => value), 1);
  const colors = ["bg-[#0d6efd]", "bg-emerald-500", "bg-orange-500", "bg-violet-500", "bg-slate-400"];

  return (rows.length ? rows : [["No Category", 0]]).map(([name, value], index) => ({
    name: `${index + 1}. ${name}`,
    value: formatMoney(value),
    rawValue: value,
    width: `${Math.max((value / max) * 100, value ? 8 : 2)}%`,
    barClass: colors[index] || "bg-slate-400",
  }));
});

const stockStatus = computed(() => {
  const total = Math.max(products.value.length, 1);
  const inStock = products.value.filter((product) => productStock(product) > 10).length;
  const lowStock = products.value.filter((product) => productStock(product) > 0 && productStock(product) <= 10).length;
  const outOfStock = products.value.filter((product) => productStock(product) <= 0).length;
  const inactive = products.value.filter((product) => String(product.status || "").toLowerCase() === "inactive").length;

  return [
    { label: "In Stock", count: inStock, color: "#10b981" },
    { label: "Low Stock", count: lowStock, color: "#f59e0b" },
    { label: "Out of Stock", count: outOfStock, color: "#ef4444" },
    { label: "Inactive", count: inactive, color: "#94a3b8" },
  ].map((item) => ({
    ...item,
    pct: Math.round((item.count / total) * 100),
    value: `${item.count.toLocaleString()} (${Math.round((item.count / total) * 100)}%)`,
  }));
});

const stockStatusGradient = computed(() => {
  let start = 0;
  const parts = stockStatus.value.map((item) => {
    const end = start + item.pct;
    const segment = `${item.color} ${start}% ${Math.max(end, start + 1)}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${parts.join(", ")})`;
});

const valueBars = computed(() => {
  const grouped = reportRows.value.reduce((map, report) => {
    if (!report.dateKey) return map;
    map.set(report.dateKey, (map.get(report.dateKey) || 0) + Number(report.amount || 0));
    return map;
  }, new Map());

  const rows = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-5);
  const max = Math.max(...rows.map(([, value]) => value), 1);

  return (rows.length ? rows : [[new Date().toISOString().slice(0, 10), 0]]).map(([date, value]) => ({
    label: formatDateOnly(date).replace(",", ""),
    height: `${Math.max((value / max) * 100, 8)}%`,
  }));
});

const clearFilters = () => {
  selectedDate.value = "";
  selectedType.value = "";
  selectedCategory.value = "";
};

const askDelete = (report) => {
  reportPendingDelete.value = report;
};

const cancelDelete = () => {
  reportPendingDelete.value = null;
};

const removeReport = () => {
  if (!reportPendingDelete.value) return;
  removedReportIds.value = new Set([...removedReportIds.value, reportPendingDelete.value.id]);
  reportPendingDelete.value = null;
};

const formatClass = (format) => {
  if (format === "API" || format === "View") return "bg-blue-100 text-[#0d6efd]";
  if (format === "Excel") return "bg-emerald-100 text-emerald-600";
  return "bg-red-100 text-red-500";
};

const fetchReportsData = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [productData, categoryData, purchaseData, stockInData, stockOutData] = await Promise.all([
      fetchCollection("products", "products"),
      fetchCollection("categories", "categories"),
      fetchCollection("purchases", "purchases"),
      fetchCollection("stock-ins", "stock_ins"),
      fetchCollection("stock-outs", "stock_outs"),
    ]);

    products.value = productData;
    categories.value = categoryData;
    purchases.value = purchaseData;
    stockIns.value = stockInData;
    stockOuts.value = stockOutData;
  } catch (error) {
    console.error("Fetch report data failed:", error);
    errorMessage.value = error.message || "Could not load report data.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReportsData);
</script>
