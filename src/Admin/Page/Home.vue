<template>
  <div class="flex min-h-screen bg-[#eef3f8] text-slate-900">
    <Sidebar page-key="dashboard" />

    <main class="flex min-w-0 flex-1 flex-col">

      <!-- Content -->
      <div class="flex-1 overflow-x-hidden px-5 py-5 lg:px-7">
        <!-- Page heading -->
        <section class="mb-5 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 px-5 py-5 text-white">
            <div>
              <p class="text-[12px] font-black uppercase tracking-[0.18em] text-white/75">Inventory Dashboard</p>
              <h1 class="mt-1 text-[24px] font-black leading-tight">Welcome back, {{ currentUserName }}!</h1>
              <p class="mt-1 max-w-2xl text-[13px] font-medium text-white/85">Monitor stock health, supplier activity, and product movement from one focused workspace.</p>
            </div>

            <span class="flex h-[40px] items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-3.5 text-[13px] font-bold text-white shadow-sm backdrop-blur">
              <i class="fa-regular fa-calendar"></i>
              {{ currentDateText }}
            </span>
          </div>
        </section>

        <!-- Stats -->
        <section class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="stat in stats"
            :key="stat.label"
            class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
          >
            <div class="absolute right-0 top-0 h-20 w-20 rounded-bl-[48px] opacity-70" :style="{ background: stat.bg }"></div>
            <div class="relative flex items-start justify-between gap-3">
              <div>
                <p class="text-[12px] font-black uppercase tracking-wide text-slate-400">{{ stat.label }}</p>
                <p class="mt-2 text-[28px] font-black leading-none text-slate-900">{{ stat.value }}</p>
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

        <!-- Charts row -->
        <section class="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <!-- Line Chart -->
          <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                        class="h-full min-w-0 flex-1 cursor-crosshair border-0 bg-transparent p-0 outline-none focus-visible:bg-blue-100/30"
                        :aria-label="`${point.dateLabel}: ${point.stockIn.toLocaleString()} stock in, ${point.stockOut.toLocaleString()} stock out`"
                        @mouseenter="hoveredDayIndex = point.index"
                        @focus="hoveredDayIndex = point.index"
                        @blur="hoveredDayIndex = null"
                      ></button>
                    </div>

                    <div
                      v-if="hoveredChartPoint"
                      class="pointer-events-none absolute top-2 z-10 w-[154px] rounded-lg border border-slate-200 bg-white/95 p-2.5 text-[11px] shadow-lg backdrop-blur"
                      :style="chartTooltipStyle"
                    >
                      <p class="mb-2 font-black text-slate-800">{{ hoveredChartPoint.dateLabel }}</p>
                      <p class="flex items-center justify-between gap-3 text-slate-500">
                        <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#1478ff]"></span>Stock In</span>
                        <strong class="text-slate-800">{{ hoveredChartPoint.stockIn.toLocaleString() }}</strong>
                      </p>
                      <p class="mt-1 flex items-center justify-between gap-3 text-slate-500">
                        <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#ff7a00]"></span>Stock Out</span>
                        <strong class="text-slate-800">{{ hoveredChartPoint.stockOut.toLocaleString() }}</strong>
                      </p>
                      <p class="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 font-bold text-slate-500">
                        <span>Net</span>
                        <strong :class="hoveredChartPoint.net >= 0 ? 'text-emerald-600' : 'text-red-500'">
                          {{ hoveredChartPoint.net >= 0 ? "+" : "" }}{{ hoveredChartPoint.net.toLocaleString() }}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <div class="flex h-6 flex-shrink-0 justify-between pt-1 text-[11px] font-semibold text-slate-400">
                    <span v-for="label in xAxisLabels" :key="label">{{ label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <!-- Donut Chart -->
          <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="mb-4">
              <h2 class="text-[15px] font-black text-slate-900">Top Categories</h2>
              <p class="mt-0.5 text-[12px] font-medium text-slate-400">Share of total products</p>
            </div>
            <div class="flex flex-col items-center gap-4">
              <div class="grid h-[168px] w-[168px] place-items-center rounded-full shadow-inner" :style="{ background: donutGradient }">
                <div class="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white shadow-sm">
                  <span class="text-[22px] font-black text-slate-900">{{ products.length.toLocaleString() }}</span>
                  <span class="text-[12px] font-semibold text-slate-400">Products</span>
                </div>
              </div>
              <div class="grid w-full gap-2">
                <div v-for="cat in categories" :key="cat.name" class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px]">
                  <span class="h-2.5 w-2.5 flex-shrink-0 rounded-full" :style="{ background: cat.color }"></span>
                  <span class="flex-1 font-semibold text-slate-600">{{ cat.name }}</span>
                  <span class="font-black text-slate-900">{{ cat.pct }}</span>
                </div>
                <p v-if="!categories.length" class="py-4 text-center text-[12px] font-semibold text-slate-400">No product categories found.</p>
              </div>
            </div>
          </article>
        </section>

        <!-- Bottom tables -->
        <section class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <!-- Low Stock Items -->
          <article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 class="text-[15px] font-black text-slate-900">Low Stock Items</h2>
                <p class="text-[12px] font-medium text-slate-400">Products that need attention</p>
              </div>
              <RouterLink to="/admin/products" class="grid h-[32px] place-items-center rounded-lg border border-blue-100 bg-blue-50 px-3.5 text-[12px] font-black text-blue-600 transition hover:bg-blue-100">View All</RouterLink>
            </div>
            <div class="admin-table-scroll overflow-x-auto">
              <table class="admin-data-table w-full text-left text-[12.5px]">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="border-b border-slate-100 px-4 py-2.5 text-[11.5px] font-extrabold text-slate-500">Product</th>
                    <th class="border-b border-slate-100 px-4 py-2.5 text-[11.5px] font-extrabold text-slate-500">SKU</th>
                    <th class="border-b border-slate-100 px-4 py-2.5 text-[11.5px] font-extrabold text-slate-500">Stock</th>
                    <th class="border-b border-slate-100 px-4 py-2.5 text-[11.5px] font-extrabold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-if="loading"><td colspan="4" class="px-4 py-8 text-center font-semibold text-slate-400"><i class="fa-solid fa-spinner mr-2 animate-spin"></i>Loading products...</td></tr>
                  <tr v-else-if="!lowStock.length"><td colspan="4" class="px-4 py-8 text-center font-semibold text-slate-400">No low-stock products.</td></tr>
                  <tr v-for="item in lowStock" :key="item.sku" class="transition hover:bg-slate-50/80">
                    <td class="px-4 py-3">
                      <span class="flex items-center gap-2.5">
                        <span class="grid h-9 w-9 flex-shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
                          <img v-if="item.img" :src="item.img" :alt="item.name" class="h-full w-full object-cover" />
                          <i v-else class="fa-solid fa-cube text-slate-400"></i>
                        </span>
                        <span class="font-semibold text-slate-800">{{ item.name }}</span>
                      </span>
                    </td>
                    <td class="px-4 py-3 text-[12px] text-slate-400">{{ item.sku }}</td>
                    <td class="px-4 py-3 font-black text-orange-500">{{ item.stock }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-block rounded-md px-2.5 py-0.5 text-[11px] font-extrabold" :class="item.stock <= 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'">{{ item.stock <= 0 ? "Out of Stock" : "Low Stock" }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <!-- Recent Stock In -->
          <article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 class="text-[15px] font-black text-slate-900">Recent Stock In</h2>
                <p class="text-[12px] font-medium text-slate-400">Latest supplier deliveries</p>
              </div>
              <RouterLink to="/admin/stock-in" class="grid h-[32px] place-items-center rounded-lg border border-blue-100 bg-blue-50 px-3.5 text-[12px] font-black text-blue-600 transition hover:bg-blue-100">View All</RouterLink>
            </div>
            <div class="admin-table-scroll overflow-x-auto">
              <table class="admin-data-table w-full text-left text-[12.5px]">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="border-b border-slate-100 px-4 py-2.5 text-[11.5px] font-extrabold text-slate-500">Reference No.</th>
                    <th class="border-b border-slate-100 px-4 py-2.5 text-[11.5px] font-extrabold text-slate-500">Supplier</th>
                    <th class="border-b border-slate-100 px-4 py-2.5 text-[11.5px] font-extrabold text-slate-500">Items</th>
                    <th class="border-b border-slate-100 px-4 py-2.5 text-[11.5px] font-extrabold text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-if="loading"><td colspan="4" class="px-4 py-8 text-center font-semibold text-slate-400"><i class="fa-solid fa-spinner mr-2 animate-spin"></i>Loading stock in...</td></tr>
                  <tr v-else-if="!recentStockIn.length"><td colspan="4" class="px-4 py-8 text-center font-semibold text-slate-400">No stock-in records found.</td></tr>
                  <tr v-for="row in recentStockIn" :key="row.ref" class="transition hover:bg-slate-50/80">
                    <td class="px-4 py-3 font-bold text-slate-900">{{ row.ref }}</td>
                    <td class="px-4 py-3 font-semibold text-slate-700">{{ row.supplier }}</td>
                    <td class="px-4 py-3 font-semibold text-slate-700">{{ row.items }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ row.date }}</td>
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
import Sidebar from "../Components/Sidebar.vue";
import { getAuthHeaders, getCurrentUser } from "../../utils/auth";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const appBaseUrl = apiBaseUrl.replace(/\/api$/, "");
const endpoints = {
  products: `${apiBaseUrl}/products`,
  categories: `${apiBaseUrl}/categories`,
  suppliers: `${apiBaseUrl}/suppliers`,
  users: `${apiBaseUrl}/users`,
  stockIns: `${apiBaseUrl}/stock-ins`,
  stockOuts: `${apiBaseUrl}/stock-outs`,
};

const products = ref([]);
const categoryRecords = ref([]);
const suppliers = ref([]);
const users = ref([]);
const stockIns = ref([]);
const stockOuts = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const hoveredDayIndex = ref(null);

const chartWidth = 600;
const chartHeight = 200;
const categoryColors = ["#7c3aed", "#2563eb", "#16a34a", "#f97316", "#eab308"];

const currentUserName = computed(() => {
  const user = getCurrentUser();
  return user.name || user.username || user.full_name || "Admin";
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

const parseApiResponse = async (response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() };
  }
};

const fetchCollection = async (key) => {
  const response = await fetch(endpoints[key], { headers: getAuthHeaders() });
  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Could not load ${key}.`);
  }

  return unwrapCollection(data, key);
};

const resolveImageUrl = (image) => {
  if (!image) return "";

  const imagePath = String(image).trim();
  if (!imagePath) return "";
  if (/^(https?:|blob:|data:)/i.test(imagePath)) return imagePath;

  const cleanPath = imagePath.replace(/^\/+/, "");
  return `${appBaseUrl}/${cleanPath.startsWith("storage/") || cleanPath.startsWith("images/") ? cleanPath : `storage/${cleanPath}`}`;
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

const normalizedProducts = computed(() => products.value.map((product, index) => {
  const categoryId = product.category_id ?? product.category?.id ?? "";
  const categoryRecord = categoryRecords.value.find((category) => Number(category.id) === Number(categoryId));
  const stock = Number(product.stock_qty ?? product.stock ?? product.quantity ?? product.qty ?? 0);
  const threshold = Number(product.low_stock ?? product.lowStock ?? 10);

  return {
    id: product.id ?? index + 1,
    name: product.product_name || product.name || `Product #${product.id ?? index + 1}`,
    sku: product.sku || product.barcode || `PRD-${product.id ?? index + 1}`,
    stock,
    threshold,
    status: String(product.status || "active").toLowerCase(),
    category: product.category?.cate_name || product.category?.name || categoryRecord?.cate_name || categoryRecord?.name || "Uncategorized",
    img: resolveImageUrl(product.pro_image || product.image || product.image_url),
  };
}));

const lowStockItems = computed(() => normalizedProducts.value.filter((product) => (
  product.status !== "inactive" && product.stock <= product.threshold
)));

const stats = computed(() => {
  const activeProducts = normalizedProducts.value.filter((product) => product.status !== "inactive").length;
  const activeSuppliers = suppliers.value.filter((supplier) => String(supplier.status || "active").toLowerCase() !== "inactive").length;
  const activeUsers = users.value.filter((user) => String(user.status || "active").toLowerCase() !== "inactive").length;

  return [
    { label: "Total Products", value: loading.value ? "..." : products.value.length.toLocaleString(), note: `${activeProducts.toLocaleString()} active products`, noteIcon: "fa-solid fa-circle-check", icon: "fa-solid fa-cube", bg: "#eff6ff", color: "#3b82f6" },
    { label: "Low Stock Items", value: loading.value ? "..." : lowStockItems.value.length.toLocaleString(), note: "At or below alert level", noteIcon: "fa-solid fa-triangle-exclamation", icon: "fa-solid fa-triangle-exclamation", bg: "#fff7ed", color: "#f97316" },
    { label: "Total Suppliers", value: loading.value ? "..." : suppliers.value.length.toLocaleString(), note: `${activeSuppliers.toLocaleString()} active suppliers`, noteIcon: "fa-solid fa-truck", icon: "fa-solid fa-truck-field", bg: "#f0fdf4", color: "#22c55e" },
    { label: "Total Users", value: loading.value ? "..." : users.value.length.toLocaleString(), note: `${activeUsers.toLocaleString()} active users`, noteIcon: "fa-solid fa-user-check", icon: "fa-solid fa-user-group", bg: "#fff1f2", color: "#f43f5e" },
  ];
});

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
  const dateFields = type === "in" ? ["stock_in_date", "date", "created_at"] : ["stock_out_date", "date", "created_at"];

  records.forEach((record) => {
    const date = getRecordDate(record, dateFields);
    if (!date.startsWith(selectedMonth.value)) return;

    const day = Number(date.slice(8, 10));
    if (!day || day > values.length) return;

    values[day - 1] += getDetails(record, type).reduce((sum, detail) => sum + getDetailQuantity(detail), 0);
  });

  return values;
};

const inVals = computed(() => buildDailySeries(stockIns.value, "in"));
const outVals = computed(() => buildDailySeries(stockOuts.value, "out"));
const chartMax = computed(() => {
  const highest = Math.max(0, ...inVals.value, ...outVals.value);
  return Math.max(5, Math.ceil(highest / 5) * 5);
});

const toPoint = (values, index) => ({
  x: values.length > 1 ? (index / (values.length - 1)) * chartWidth : 0,
  y: chartHeight - (values[index] / chartMax.value) * chartHeight,
});

const toPath = (values) => values.map((value, index) => {
  const { x, y } = toPoint(values, index);
  return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ");

const toArea = (values) => `${toPath(values)} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

const stockInPath = computed(() => toPath(inVals.value));
const stockOutPath = computed(() => toPath(outVals.value));
const stockInArea = computed(() => toArea(inVals.value));
const stockOutArea = computed(() => toArea(outVals.value));
const stockInTotalValue = computed(() => inVals.value.reduce((sum, value) => sum + value, 0));
const stockOutTotalValue = computed(() => outVals.value.reduce((sum, value) => sum + value, 0));
const stockInTotal = computed(() => stockInTotalValue.value.toLocaleString());
const stockOutTotal = computed(() => stockOutTotalValue.value.toLocaleString());
const stockNet = computed(() => stockInTotalValue.value - stockOutTotalValue.value);
const chartPoints = computed(() => inVals.value.map((stockIn, index) => {
  const stockOut = outVals.value[index];
  const inPoint = toPoint(inVals.value, index);
  const outPoint = toPoint(outVals.value, index);
  const date = new Date(`${selectedMonth.value}-${String(index + 1).padStart(2, "0")}T00:00:00`);

  return {
    index,
    day: index + 1,
    dateLabel: date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    stockIn,
    stockOut,
    net: stockIn - stockOut,
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

const categories = computed(() => {
  if (!normalizedProducts.value.length) return [];

  const counts = normalizedProducts.value.reduce((result, product) => {
    result[product.category] = (result[product.category] || 0) + 1;
    return result;
  }, {});
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const visible = sorted.slice(0, 4);

  if (sorted.length > 4) {
    visible.push(["Others", sorted.slice(4).reduce((sum, item) => sum + item[1], 0)]);
  }

  return visible.map(([name, count], index) => {
    const share = (count / normalizedProducts.value.length) * 100;
    return { name, count, share, pct: `${Math.round(share)}%`, color: categoryColors[index] };
  });
});

const donutGradient = computed(() => {
  if (!categories.value.length) return "#e2e8f0";

  let start = 0;
  const segments = categories.value.map((category) => {
    const segment = `${category.color} ${start}% ${start + category.share}%`;
    start += category.share;
    return segment;
  });
  return `conic-gradient(${segments.join(", ")})`;
});

const lowStock = computed(() => [...lowStockItems.value]
  .sort((a, b) => a.stock - b.stock)
  .slice(0, 4));

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const recentStockIn = computed(() => [...stockIns.value]
  .sort((a, b) => {
    const first = new Date(getRecordDate(a, ["stock_in_date", "created_at"])).getTime() || 0;
    const second = new Date(getRecordDate(b, ["stock_in_date", "created_at"])).getTime() || 0;
    return second - first;
  })
  .slice(0, 4)
  .map((record, index) => ({
    ref: record.reference_no || `IN-${record.id ?? index + 1}`,
    supplier: record.supplier?.sup_name || record.supplier?.name || record.supplier_name || `Supplier #${record.supplier_id || ""}`,
    items: getDetails(record, "in").reduce((sum, detail) => sum + getDetailQuantity(detail), 0),
    date: formatDate(record.stock_in_date || record.created_at),
  })));

const fetchDashboard = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [productData, categoryData, supplierData, userData, stockInData, stockOutData] = await Promise.all([
      fetchCollection("products"),
      fetchCollection("categories"),
      fetchCollection("suppliers"),
      fetchCollection("users"),
      fetchCollection("stockIns"),
      fetchCollection("stockOuts"),
    ]);

    products.value = productData;
    categoryRecords.value = categoryData;
    suppliers.value = supplierData;
    users.value = userData;
    stockIns.value = stockInData;
    stockOuts.value = stockOutData;
  } catch (error) {
    console.error("Fetch admin dashboard failed:", error);
    errorMessage.value = error.message || "Could not load dashboard data.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDashboard);
</script>
