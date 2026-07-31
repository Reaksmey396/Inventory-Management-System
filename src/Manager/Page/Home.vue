<template>
  <div class="flex min-h-screen bg-[#eef3f8] text-slate-900">
    <Sidebar page-key="dashboard" />

    <main class="flex min-w-0 flex-1 flex-col">
      <div class="flex-1 overflow-x-hidden px-5 py-5 lg:px-7">
        <section class="mb-5 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4 bg-emerald-600 px-5 py-5 text-white">
            <div>
              <p class="text-[12px] font-black uppercase tracking-[0.18em] text-white/75">Manager Dashboard</p>
              <h1 class="mt-1 text-[24px] font-black leading-tight">Welcome back, {{ currentUserName }}!</h1>
              <p class="mt-1 max-w-2xl text-[13px] font-medium text-white/85">
                Monitor products, suppliers, purchases, and stock movement.
              </p>
            </div>

            <span class="flex h-10 items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3.5 text-[13px] font-bold text-white">
              <i class="fa-regular fa-calendar"></i>
              {{ currentDateText }}
            </span>
          </div>
        </section>

        <section class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="stat in stats"
            :key="stat.label"
            class="group relative min-h-[128px] overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md"
          >
            <div class="absolute right-0 top-0 h-20 w-20 rounded-bl-[48px] opacity-70" :style="{ background: stat.bg }"></div>
            <div class="relative flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[12px] font-black uppercase tracking-wide text-slate-400">{{ stat.label }}</p>
                <p class="mt-2 break-words text-[27px] font-black leading-none text-slate-900">{{ stat.value }}</p>
              </div>
              <span class="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-lg shadow-sm" :style="{ background: stat.bg }">
                <i :class="stat.icon" :style="{ color: stat.color }"></i>
              </span>
            </div>
            <p class="relative mt-4 flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
              <i :class="stat.noteIcon" :style="{ color: stat.color }"></i>
              <span>{{ stat.note }}</span>
            </p>
          </article>
        </section>

        <p v-if="errorMessage" class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
          {{ errorMessage }}
        </p>

        <section class="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-[15px] font-black text-slate-900">Stock In vs Stock Out</h2>
            </div>
          </div>

          <div>
            <div class="mb-3 flex flex-wrap items-center gap-4">
              <span class="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
                <span class="inline-block h-[2px] w-5 rounded-full bg-[#1478ff]"></span>Stock In
              </span>
              <span class="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
                <span class="inline-block h-[2px] w-5 rounded-full bg-[#ff7a00]"></span>Stock Out
              </span>
            </div>

            <div class="flex h-[235px] gap-2">
              <div class="flex w-8 flex-shrink-0 flex-col justify-between pb-6 text-right text-[11px] font-medium text-slate-500">
                <span v-for="label in yAxisLabels" :key="label">{{ label.toLocaleString() }}</span>
              </div>

              <div class="flex min-w-0 flex-1 flex-col">
                <div class="relative min-h-0 flex-1" @mouseleave="hoveredDayIndex = null">
                  <svg viewBox="0 0 600 200" preserveAspectRatio="none" class="pointer-events-none absolute inset-0 block h-full w-full overflow-visible">
                    <line v-for="n in 6" :key="`horizontal-${n}`" x1="0" :y1="((n - 1) / 5) * 200" x2="600" :y2="((n - 1) / 5) * 200" stroke="#e8edf3" stroke-width="1" />
                    <line v-for="n in 7" :key="`vertical-${n}`" :x1="((n - 1) / 6) * 600" y1="0" :x2="((n - 1) / 6) * 600" y2="200" stroke="#edf1f5" stroke-width="1" />
                    <path :d="stockInPath" fill="none" stroke="#1478ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" vector-effect="non-scaling-stroke" />
                    <path :d="stockOutPath" fill="none" stroke="#ff7a00" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" vector-effect="non-scaling-stroke" />
                    <circle v-for="point in chartPoints" :key="`in-${point.day}`" :cx="point.x" :cy="point.inY" r="2.5" fill="#1478ff" vector-effect="non-scaling-stroke" />
                    <circle v-for="point in chartPoints" :key="`out-${point.day}`" :cx="point.x" :cy="point.outY" r="2.5" fill="#ff7a00" vector-effect="non-scaling-stroke" />
                    <template v-if="hoveredChartPoint">
                      <line :x1="hoveredChartPoint.x" y1="0" :x2="hoveredChartPoint.x" y2="200" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1" vector-effect="non-scaling-stroke" />
                      <circle :cx="hoveredChartPoint.x" :cy="hoveredChartPoint.inY" r="5" fill="#1478ff" stroke="#ffffff" stroke-width="3" vector-effect="non-scaling-stroke" />
                      <circle :cx="hoveredChartPoint.x" :cy="hoveredChartPoint.outY" r="5" fill="#ff7a00" stroke="#ffffff" stroke-width="3" vector-effect="non-scaling-stroke" />
                    </template>
                  </svg>

                  <div class="absolute inset-0 flex">
                    <button
                      v-for="point in chartPoints"
                      :key="point.day"
                      type="button"
                      class="h-full min-w-0 flex-1 cursor-crosshair border-0 bg-transparent p-0 outline-none focus-visible:bg-emerald-100/30"
                      :aria-label="`${point.dateLabel}: ${point.stockIn.toLocaleString()} stock in, ${point.stockOut.toLocaleString()} stock out`"
                      @mouseenter="hoveredDayIndex = point.index"
                      @focus="hoveredDayIndex = point.index"
                      @blur="hoveredDayIndex = null"
                    ></button>
                  </div>

                  <div
                    v-if="hoveredChartPoint"
                    class="pointer-events-none absolute top-2 z-10 w-[154px] rounded-lg border border-slate-200 bg-white/95 p-2.5 text-[11px] shadow-lg"
                    :style="chartTooltipStyle"
                  >
                    <p class="mb-2 font-black text-slate-800">{{ hoveredChartPoint.dateLabel }}</p>
                    <p class="flex items-center justify-between gap-3 text-slate-500">
                      <span>Stock In</span>
                      <strong class="text-[#1478ff]">{{ hoveredChartPoint.stockIn.toLocaleString() }}</strong>
                    </p>
                    <p class="mt-1 flex items-center justify-between gap-3 text-slate-500">
                      <span>Stock Out</span>
                      <strong class="text-[#ff7a00]">{{ hoveredChartPoint.stockOut.toLocaleString() }}</strong>
                    </p>
                  </div>
                </div>

                <div class="flex h-6 flex-shrink-0 justify-between pt-1 text-[11px] font-semibold text-slate-400">
                  <span v-for="label in xAxisLabels" :key="label">{{ label }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 class="text-[15px] font-black text-slate-900">Low Stock Items</h2>
                <p class="text-[12px] font-medium text-slate-400">Products at or below their alert level</p>
              </div>
              <RouterLink to="/manager/low-stock" class="grid h-8 place-items-center rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 text-[12px] font-black text-emerald-700 transition hover:bg-emerald-100">
                View All
              </RouterLink>
            </div>

            <div class="admin-table-scroll overflow-x-auto">
              <table class="admin-data-table w-full text-left text-[12.5px]">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="border-b border-slate-100 px-4 py-2.5">Product</th>
                    <th class="border-b border-slate-100 px-4 py-2.5">SKU</th>
                    <th class="border-b border-slate-100 px-4 py-2.5">Stock</th>
                    <th class="border-b border-slate-100 px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading"><td colspan="4" class="px-4 py-8 text-center font-semibold text-slate-400">Loading products...</td></tr>
                  <tr v-else-if="!lowStock.length"><td colspan="4" class="px-4 py-8 text-center font-semibold text-slate-400">No low-stock products.</td></tr>
                  <tr v-for="item in lowStock" :key="item.sku">
                    <td class="px-4 py-3 font-semibold text-slate-800">{{ item.name }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ item.sku }}</td>
                    <td class="px-4 py-3 font-black text-orange-500">{{ item.stock }}</td>
                    <td class="px-4 py-3">
                      <span class="rounded-md px-2.5 py-1 text-[11px] font-black" :class="item.stock <= 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'">
                        {{ item.stock <= 0 ? "Out of Stock" : "Low Stock" }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 class="text-[15px] font-black text-slate-900">Recent Purchases</h2>
                <p class="text-[12px] font-medium text-slate-400">Latest purchase transactions</p>
              </div>
              <RouterLink to="/manager/purchase-history" class="grid h-8 place-items-center rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 text-[12px] font-black text-emerald-700 transition hover:bg-emerald-100">
                View All
              </RouterLink>
            </div>

            <div class="admin-table-scroll overflow-x-auto">
              <table class="admin-data-table w-full text-left text-[12.5px]">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="border-b border-slate-100 px-4 py-2.5">Purchase No.</th>
                    <th class="border-b border-slate-100 px-4 py-2.5">Supplier</th>
                    <th class="border-b border-slate-100 px-4 py-2.5">Amount</th>
                    <th class="border-b border-slate-100 px-4 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading"><td colspan="4" class="px-4 py-8 text-center font-semibold text-slate-400">Loading purchases...</td></tr>
                  <tr v-else-if="!recentPurchases.length"><td colspan="4" class="px-4 py-8 text-center font-semibold text-slate-400">No purchase records found.</td></tr>
                  <tr v-for="purchase in recentPurchases" :key="purchase.id">
                    <td class="px-4 py-3 font-black text-emerald-700">{{ purchase.number }}</td>
                    <td class="px-4 py-3 font-semibold text-slate-700">{{ purchase.supplier }}</td>
                    <td class="px-4 py-3 font-black text-slate-900">{{ formatCurrency(purchase.amount) }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ formatDate(purchase.date) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import Sidebar from "../Components/Sidebar.vue";
import { getAuthHeaders, getCurrentUser } from "../../utils/auth";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const endpoints = {
  products: `${apiBaseUrl}/products`,
  suppliers: `${apiBaseUrl}/suppliers`,
  purchases: `${apiBaseUrl}/purchases`,
  stockIns: `${apiBaseUrl}/stock-ins`,
  stockOuts: `${apiBaseUrl}/stock-outs`,
};

const products = ref([]);
const suppliers = ref([]);
const purchases = ref([]);
const stockIns = ref([]);
const stockOuts = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const hoveredDayIndex = ref(null);

const chartWidth = 600;
const chartHeight = 200;

const currentUserName = computed(() => {
  const user = getCurrentUser();
  return user.name || user.username || user.full_name || "Manager";
});

const currentDateText = computed(() => new Date().toLocaleDateString(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
}));

const unwrapCollection = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[key]?.data)) return payload[key].data;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const fetchCollection = async (key) => {
  const response = await fetch(endpoints[key], { headers: getAuthHeaders() });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Could not load ${key}.`);
  }

  return unwrapCollection(payload, key);
};

const getRecordDate = (record, fields) => {
  for (const field of fields) {
    if (record?.[field]) return String(record[field]).slice(0, 10);
  }
  return "";
};

const getDetails = (record, type) => {
  const keys = type === "in"
    ? ["details", "stock_in_details", "stockInDetails", "items"]
    : ["details", "stock_out_details", "stockOutDetails", "items"];

  for (const key of keys) {
    if (Array.isArray(record?.[key])) return record[key];
  }

  return [];
};

const getDetailQuantity = (detail) => Number(detail?.quantity ?? detail?.qty ?? 0);

const normalizedProducts = computed(() => products.value.map((product, index) => ({
  id: product.id ?? index + 1,
  name: product.product_name || product.name || `Product #${product.id ?? index + 1}`,
  sku: product.sku || product.barcode || `PRD-${product.id ?? index + 1}`,
  stock: Number(product.stock_qty ?? product.stock ?? product.quantity ?? product.qty ?? 0),
  threshold: Number(product.low_stock ?? product.lowStock ?? 10),
  status: String(product.status || "active").toLowerCase(),
})));

const lowStockItems = computed(() => normalizedProducts.value.filter((product) => (
  product.status !== "inactive" && product.stock <= product.threshold
)));

const purchaseTotal = computed(() => purchases.value.reduce((sum, purchase) => (
  sum + Number(purchase.total_amount ?? purchase.total ?? purchase.amount ?? 0)
), 0));

const allStockInQuantity = computed(() => stockIns.value.reduce((total, record) => (
  total + getDetails(record, "in").reduce((sum, detail) => sum + getDetailQuantity(detail), 0)
), 0));

const allStockOutQuantity = computed(() => stockOuts.value.reduce((total, record) => (
  total + getDetails(record, "out").reduce((sum, detail) => sum + getDetailQuantity(detail), 0)
), 0));

const stats = computed(() => [
  {
    label: "Total Products",
    value: loading.value ? "..." : products.value.length.toLocaleString(),
    note: "Products in inventory",
    noteIcon: "fa-solid fa-cube",
    icon: "fa-solid fa-cube",
    bg: "#eff6ff",
    color: "#2563eb",
  },
  {
    label: "Low Stock",
    value: loading.value ? "..." : lowStockItems.value.length.toLocaleString(),
    note: "Items needing attention",
    noteIcon: "fa-solid fa-triangle-exclamation",
    icon: "fa-solid fa-triangle-exclamation",
    bg: "#fff7ed",
    color: "#f97316",
  },
  {
    label: "Total Suppliers",
    value: loading.value ? "..." : suppliers.value.length.toLocaleString(),
    note: "Purchasing partners",
    noteIcon: "fa-solid fa-truck",
    icon: "fa-solid fa-users",
    bg: "#f0fdf4",
    color: "#16a34a",
  },
  {
    label: "Purchase Summary",
    value: loading.value ? "..." : formatCurrency(purchaseTotal.value),
    note: `${purchases.value.length.toLocaleString()} purchase records`,
    noteIcon: "fa-solid fa-cart-shopping",
    icon: "fa-solid fa-receipt",
    bg: "#fefce8",
    color: "#ca8a04",
  },
  {
    label: "Stock In",
    value: loading.value ? "..." : allStockInQuantity.value.toLocaleString(),
    note: `${stockIns.value.length.toLocaleString()} incoming records`,
    noteIcon: "fa-solid fa-arrow-up-from-bracket",
    icon: "fa-solid fa-arrow-up-from-bracket",
    bg: "#ecfdf5",
    color: "#059669",
  },
  {
    label: "Stock Out",
    value: loading.value ? "..." : allStockOutQuantity.value.toLocaleString(),
    note: `${stockOuts.value.length.toLocaleString()} outgoing records`,
    noteIcon: "fa-solid fa-arrow-down",
    icon: "fa-solid fa-arrow-down",
    bg: "#fff1f2",
    color: "#e11d48",
  },
]);

const monthOptions = computed(() => {
  const values = new Set([new Date().toISOString().slice(0, 7)]);

  stockIns.value.forEach((record) => {
    const date = getRecordDate(record, ["stock_in_date", "date", "created_at"]);
    if (date) values.add(date.slice(0, 7));
  });
  stockOuts.value.forEach((record) => {
    const date = getRecordDate(record, ["stock_out_date", "date", "created_at"]);
    if (date) values.add(date.slice(0, 7));
  });

  return [...values].sort().reverse().map((value) => ({
    value,
    label: new Date(`${value}-01T00:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" }),
  }));
});

const daysInSelectedMonth = computed(() => {
  const [year, month] = selectedMonth.value.split("-").map(Number);
  return new Date(year, month, 0).getDate();
});

const buildDailySeries = (records, type) => {
  const values = Array.from({ length: daysInSelectedMonth.value }, () => 0);
  const fields = type === "in"
    ? ["stock_in_date", "date", "created_at"]
    : ["stock_out_date", "date", "created_at"];

  records.forEach((record) => {
    const date = getRecordDate(record, fields);
    if (!date.startsWith(selectedMonth.value)) return;

    const day = Number(date.slice(8, 10));
    if (!day || day > values.length) return;

    values[day - 1] += getDetails(record, type).reduce((sum, detail) => sum + getDetailQuantity(detail), 0);
  });

  return values;
};

const inValues = computed(() => buildDailySeries(stockIns.value, "in"));
const outValues = computed(() => buildDailySeries(stockOuts.value, "out"));
const chartMax = computed(() => Math.max(5, Math.ceil(Math.max(0, ...inValues.value, ...outValues.value) / 5) * 5));

const toPoint = (values, index) => ({
  x: values.length > 1 ? (index / (values.length - 1)) * chartWidth : 0,
  y: chartHeight - (values[index] / chartMax.value) * chartHeight,
});

const toPath = (values) => values.map((value, index) => {
  const point = toPoint(values, index);
  return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
}).join(" ");

const toArea = (values) => `${toPath(values)} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
const stockInPath = computed(() => toPath(inValues.value));
const stockOutPath = computed(() => toPath(outValues.value));
const stockInArea = computed(() => toArea(inValues.value));
const stockOutArea = computed(() => toArea(outValues.value));
const stockInTotalValue = computed(() => inValues.value.reduce((sum, value) => sum + value, 0));
const stockOutTotalValue = computed(() => outValues.value.reduce((sum, value) => sum + value, 0));
const stockInTotal = computed(() => stockInTotalValue.value.toLocaleString());
const stockOutTotal = computed(() => stockOutTotalValue.value.toLocaleString());
const stockNet = computed(() => stockInTotalValue.value - stockOutTotalValue.value);

const chartPoints = computed(() => inValues.value.map((stockIn, index) => {
  const stockOut = outValues.value[index];
  const inPoint = toPoint(inValues.value, index);
  const outPoint = toPoint(outValues.value, index);
  const date = new Date(`${selectedMonth.value}-${String(index + 1).padStart(2, "0")}T00:00:00`);

  return {
    index,
    day: index + 1,
    dateLabel: date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    stockIn,
    stockOut,
    x: inPoint.x,
    inY: inPoint.y,
    outY: outPoint.y,
  };
}));

const hoveredChartPoint = computed(() => (
  hoveredDayIndex.value === null ? null : chartPoints.value[hoveredDayIndex.value] || null
));

const chartTooltipStyle = computed(() => {
  if (!hoveredChartPoint.value) return {};

  const position = (hoveredChartPoint.value.x / chartWidth) * 100;
  if (position < 16) return { left: `${position}%`, transform: "translateX(0)" };
  if (position > 84) return { left: `${position}%`, transform: "translateX(-100%)" };
  return { left: `${position}%`, transform: "translateX(-50%)" };
});

const yAxisLabels = computed(() => Array.from({ length: 6 }, (_, index) => Math.round(chartMax.value * (5 - index) / 5)));
const xAxisLabels = computed(() => {
  const monthName = new Date(`${selectedMonth.value}-01T00:00:00`).toLocaleDateString(undefined, { month: "short" });
  return Array.from({ length: 7 }, (_, index) => {
    const day = Math.round(1 + (index * (daysInSelectedMonth.value - 1) / 6));
    return `${monthName} ${day}`;
  });
});

const lowStock = computed(() => [...lowStockItems.value].sort((a, b) => a.stock - b.stock).slice(0, 5));

const recentPurchases = computed(() => [...purchases.value]
  .sort((a, b) => new Date(b.purchase_date || b.date || b.created_at).getTime() - new Date(a.purchase_date || a.date || a.created_at).getTime())
  .slice(0, 5)
  .map((purchase, index) => ({
    id: purchase.id ?? index,
    number: purchase.purchase_no || purchase.reference_no || `PUR-${purchase.id ?? index + 1}`,
    supplier: purchase.supplier?.sup_name || purchase.supplier?.name || purchase.supplier_name || `Supplier #${purchase.supplier_id || ""}`,
    amount: Number(purchase.total_amount ?? purchase.total ?? purchase.amount ?? 0),
    date: purchase.purchase_date || purchase.date || purchase.created_at,
  })));

const formatCurrency = (value) => new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const fetchDashboard = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [productData, supplierData, purchaseData, stockInData, stockOutData] = await Promise.all([
      fetchCollection("products"),
      fetchCollection("suppliers"),
      fetchCollection("purchases"),
      fetchCollection("stockIns"),
      fetchCollection("stockOuts"),
    ]);

    products.value = productData;
    suppliers.value = supplierData;
    purchases.value = purchaseData;
    stockIns.value = stockInData;
    stockOuts.value = stockOutData;
  } catch (error) {
    console.error("Fetch manager dashboard failed:", error);
    errorMessage.value = error.message || "Could not load dashboard data.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDashboard);
</script>
