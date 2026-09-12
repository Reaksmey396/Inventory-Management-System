<template>
  <div class="staff-dashboard flex min-h-screen bg-[#f4f7fb] text-slate-900">
    <Sidebar page-key="dashboard" />

    <main class="min-w-0 flex-1">


      <div class="px-4 py-5 sm:px-6 lg:px-7">
        <p v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
          {{ errorMessage }}
        </p>

        <section class="relative mb-5 min-h-[180px] overflow-hidden rounded-lg border border-blue-100 bg-[#e8f2ff] px-6 py-8 sm:px-10">
          <div class="relative z-10 max-w-xl">
            <p class="text-xl font-bold text-slate-900">Welcome back,</p>
            <h2 class="mt-1 text-3xl font-black text-slate-950">{{ currentUserName }}</h2>
            <p class="mt-2 text-sm font-medium text-slate-700">Here is what is happening with your inventory today.</p>
          </div>

          <div class="absolute bottom-0 right-5 hidden h-[160px] w-[390px] lg:block">
            <div class="absolute bottom-0 right-6 h-24 w-64 border-x-[14px] border-t-[14px] border-[#d7e4ef] bg-white">
              <div class="absolute -left-8 -right-8 -top-9 h-9 bg-[#164a7d]" style="clip-path: polygon(12% 100%, 50% 0, 88% 100%);"></div>
              <div class="absolute bottom-0 left-1/2 h-16 w-16 -translate-x-1/2 bg-[#245b8f]"></div>
              <div class="absolute bottom-4 left-5 h-8 w-8 bg-[#d9e3ea]"></div>
              <div class="absolute bottom-4 right-5 h-8 w-8 bg-[#d9e3ea]"></div>
            </div>
            <div class="absolute bottom-0 right-1 h-12 w-14 bg-amber-300"></div>
            <div class="absolute bottom-0 right-14 h-9 w-12 bg-amber-400"></div>
            <div class="absolute bottom-12 right-3 h-8 w-10 bg-amber-200"></div>
            <span class="absolute bottom-0 left-4 grid h-20 w-16 place-items-center rounded-lg border-4 border-blue-400 bg-white text-3xl text-emerald-500 shadow-sm">
              <i class="fa-solid fa-clipboard-check"></i>
            </span>
          </div>
        </section>

        <section class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article v-for="stat in stats" :key="stat.label" class="flex min-h-[118px] items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <span class="grid h-14 w-14 shrink-0 place-items-center rounded-lg text-xl" :class="stat.iconClass">
              <i :class="stat.icon" class="fa-solid"></i>
            </span>
            <div class="min-w-0">
              <p class="text-xs font-bold text-slate-600">{{ stat.label }}</p>
              <p class="mt-1 text-2xl font-black text-slate-950">{{ loading ? "..." : stat.value }}</p>
              <p class="mt-1 text-[11px] font-semibold text-slate-500">{{ stat.note }}</p>
            </div>
          </article>
        </section>

        <section class="mb-5 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_minmax(0,1fr)]">
          <article class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-sm font-black text-slate-900">Stock Overview</h2>
            <div class="mt-6 flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
              <div class="grid h-40 w-40 shrink-0 place-items-center rounded-full" :style="{ background: stockDonut }">
                <div class="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-sm">
                  <div>
                    <p class="text-2xl font-black text-slate-950">{{ products.length }}</p>
                    <p class="text-[11px] font-semibold text-slate-500">Total</p>
                  </div>
                </div>
              </div>
              <div class="w-full space-y-4">
                <div v-for="status in stockStatuses" :key="status.label" class="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs">
                  <span class="h-2.5 w-2.5 rounded-full" :style="{ background: status.color }"></span>
                  <span class="font-semibold text-slate-600">{{ status.label }}</span>
                  <span class="font-black text-slate-800">{{ status.count }} ({{ status.pct }}%)</span>
                </div>
              </div>
            </div>
            <p class="mt-6 text-[10px] font-semibold text-slate-400">Updated {{ lastUpdated }}</p>
          </article>

          <MovementTable
            title="Recent Stock In"
            link="/staff/stock-in"
            :rows="recentStockIn"
            :loading="loading"
            quantity-class="text-emerald-600"
            empty-text="No stock-in records found."
          />

          <MovementTable
            title="Recent Stock Out"
            link="/staff/stock-out"
            :rows="recentStockOut"
            :loading="loading"
            quantity-class="text-red-500"
            empty-text="No stock-out records found."
          />
        </section>

        <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 class="text-sm font-black text-slate-900">Quick Actions</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <RouterLink
              v-for="action in quickActions"
              :key="action.to"
              :to="action.to"
              class="group flex min-h-[82px] items-center gap-4 rounded-lg border border-slate-200 px-4 transition hover:border-blue-300 hover:bg-blue-50/40"
            >
              <span class="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-lg" :class="action.iconClass">
                <i :class="action.icon" class="fa-solid"></i>
              </span>
              <span>
                <span class="block text-sm font-black text-slate-900">{{ action.label }}</span>
                <span class="mt-1 block text-xs font-semibold text-slate-500">{{ action.note }}</span>
              </span>
            </RouterLink>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import Sidebar from "../Components/Sidebar.vue";
import { getAuthHeaders, getCurrentUser } from "../../utils/auth";
import { hasStoredStaffPermission } from "../../utils/staffPermissions";

const MovementTable = defineComponent({
  props: {
    title: String,
    link: String,
    rows: Array,
    loading: Boolean,
    quantityClass: String,
    emptyText: String,
  },
  setup(props) {
    return () => h("article", { class: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" }, [
      h("div", { class: "flex items-center justify-between border-b border-slate-100 px-4 py-4" }, [
        h("h2", { class: "text-sm font-black text-slate-900" }, props.title),
        h(RouterLink, { to: props.link, class: "text-xs font-black text-blue-600 hover:text-blue-800" }, () => "View All"),
      ]),
      h("div", { class: "overflow-x-auto" }, [
        h("table", { class: "w-full min-w-[430px] text-left text-xs" }, [
          h("thead", { class: "bg-slate-50 text-slate-500" }, [
            h("tr", {}, [
              h("th", { class: "px-4 py-3 font-extrabold" }, "Product"),
              h("th", { class: "px-4 py-3 text-right font-extrabold" }, "Quantity"),
              h("th", { class: "px-4 py-3 font-extrabold" }, "Date"),
            ]),
          ]),
          h("tbody", { class: "divide-y divide-slate-100" }, props.loading
            ? [h("tr", {}, [h("td", { colspan: 3, class: "px-4 py-8 text-center font-semibold text-slate-400" }, "Loading...")])]
            : props.rows?.length
              ? props.rows.map((row) => h("tr", { key: row.key, class: "hover:bg-slate-50" }, [
                h("td", { class: "px-4 py-3" }, [
                  h("div", { class: "flex items-center gap-3" }, [
                    row.image
                      ? h("img", { src: row.image, alt: "", class: "h-9 w-9 rounded-md bg-slate-100 object-cover" })
                      : h("span", { class: "grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-400" }, [h("i", { class: "fa-solid fa-box" })]),
                    h("span", { class: "max-w-[190px] truncate font-bold text-slate-800", title: row.product }, row.product),
                  ]),
                ]),
                h("td", { class: `px-4 py-3 text-right font-black ${props.quantityClass}` }, row.quantity.toLocaleString()),
                h("td", { class: "whitespace-nowrap px-4 py-3 font-semibold text-slate-600" }, row.date),
              ]))
              : [h("tr", {}, [h("td", { colspan: 3, class: "px-4 py-8 text-center font-semibold text-slate-400" }, props.emptyText)])]),
        ]),
      ]),
    ]);
  },
});

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const appBaseUrl = apiBaseUrl.replace(/\/api$/, "");
const products = ref([]);
const purchases = ref([]);
const stockIns = ref([]);
const stockOuts = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const updatedAt = ref(new Date());

const currentUser = computed(() => getCurrentUser());
const currentUserName = computed(() => currentUser.value.name || currentUser.value.username || currentUser.value.full_name || "Staff");
const currentUserAvatar = computed(() => {
  const image = currentUser.value.user_image || currentUser.value.avatar || currentUser.value.image;
  if (!image) return "https://i.pravatar.cc/100?img=12";
  if (/^(https?:|blob:|data:)/i.test(image)) return image;
  return `${appBaseUrl}/${String(image).replace(/^\/+/, "")}`;
});

const unwrapCollection = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  for (const key of keys) {
    if (Array.isArray(payload?.[key]?.data)) return payload[key].data;
    if (Array.isArray(payload?.[key])) return payload[key];
  }
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

const fetchCollection = async (endpoint, keys) => {
  const response = await fetch(`${apiBaseUrl}/${endpoint}`, { headers: getAuthHeaders() });
  const data = await parseApiResponse(response);
  if (!response.ok) throw new Error(data?.message || data?.error || `Could not load ${endpoint}.`);
  return unwrapCollection(data, keys);
};

const productStock = (product) => Number(product.stock_qty ?? product.stock ?? product.quantity ?? product.qty ?? 0);
const productMinimum = (product) => Number(product.low_stock ?? product.low_stock_qty ?? product.minimum_stock ?? product.reorder_level ?? 10);
const transactionDetails = (record, type) => record.details || record[type === "in" ? "stock_in_details" : "stock_out_details"] || [];
const transactionDate = (record, type) => record[type === "in" ? "stock_in_date" : "stock_out_date"] || record.date || record.created_at || "";
const monthKey = new Date().toISOString().slice(0, 7);

const monthlyQuantity = (records, type) => records
  .filter((record) => String(transactionDate(record, type)).startsWith(monthKey))
  .reduce((sum, record) => sum + transactionDetails(record, type)
    .reduce((detailSum, detail) => detailSum + Number(detail.quantity ?? detail.qty ?? 0), 0), 0);

const stats = computed(() => [
  { label: "Total Products", value: products.value.length.toLocaleString(), note: "All products in system", icon: "fa-cube", iconClass: "bg-blue-50 text-blue-600" },
  { label: "Total Stock In", value: monthlyQuantity(stockIns.value, "in").toLocaleString(), note: "This month", icon: "fa-arrow-down", iconClass: "bg-emerald-50 text-emerald-600" },
  { label: "Total Stock Out", value: monthlyQuantity(stockOuts.value, "out").toLocaleString(), note: "This month", icon: "fa-arrow-up", iconClass: "bg-red-50 text-red-500" },
  { label: "Total Purchases", value: purchases.value.filter((purchase) => String(purchase.purchase_date || purchase.created_at || "").startsWith(monthKey)).length.toLocaleString(), note: "This month", icon: "fa-clipboard-list", iconClass: "bg-amber-50 text-amber-600" },
]);

const stockStatuses = computed(() => {
  const total = products.value.length || 1;
  const out = products.value.filter((product) => productStock(product) <= 0).length;
  const low = products.value.filter((product) => productStock(product) > 0 && productStock(product) <= productMinimum(product)).length;
  const available = Math.max(products.value.length - low - out, 0);
  return [
    { label: "In Stock", count: available, pct: Number(((available / total) * 100).toFixed(1)), color: "#22c55e" },
    { label: "Low Stock", count: low, pct: Number(((low / total) * 100).toFixed(1)), color: "#2f80ed" },
    { label: "Out of Stock", count: out, pct: Number(((out / total) * 100).toFixed(1)), color: "#ef4444" },
  ];
});

const stockDonut = computed(() => {
  let start = 0;
  const segments = stockStatuses.value.map((status) => {
    const end = start + status.pct;
    const segment = `${status.color} ${start}% ${end}%`;
    start = end;
    return segment;
  });
  return `conic-gradient(${segments.join(", ")})`;
});

const resolveImage = (image) => {
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${appBaseUrl}/${String(image).replace(/^\/+/, "")}`;
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "-").slice(0, 10);
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const flattenMovements = (records, type) => records
  .flatMap((record) => transactionDetails(record, type).map((detail, index) => {
    const product = detail.product || detail.pro || {};
    return {
      key: `${type}-${record.id}-${detail.id || index}`,
      product: product.product_name || product.name || detail.product_name || `Product #${detail.pro_id || detail.product_id || ""}`,
      image: resolveImage(product.pro_image || product.image || product.image_url),
      quantity: Number(detail.quantity ?? detail.qty ?? 0),
      rawDate: transactionDate(record, type),
      date: formatDate(transactionDate(record, type)),
    };
  }))
  .sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0))
  .slice(0, 4);

const recentStockIn = computed(() => flattenMovements(stockIns.value, "in"));
const recentStockOut = computed(() => flattenMovements(stockOuts.value, "out"));
const lastUpdated = computed(() => updatedAt.value.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));

const allActions = [
  { label: "Stock In", note: "Add new stock", to: "/staff/stock-in", icon: "fa-arrow-down", iconClass: "bg-emerald-50 text-emerald-600", permission: "stock_in.view" },
  { label: "Stock Out", note: "Issue stock", to: "/staff/stock-out", icon: "fa-arrow-up", iconClass: "bg-red-50 text-red-500", permission: "stock_out.view" },
  { label: "View Products", note: "Check product list", to: "/staff/product", icon: "fa-cube", iconClass: "bg-blue-50 text-blue-600", permission: "products.view" },
  { label: "My Profile", note: "View my profile", to: "/staff/profile", icon: "fa-user", iconClass: "bg-violet-50 text-violet-600", permission: "profile.manage" },
];
const quickActions = computed(() => allActions.filter((action) => hasStoredStaffPermission(action.permission)));

onMounted(async () => {
  loading.value = true;
  errorMessage.value = "";
  const requests = [
    ["products", ["products"], products],
    ["purchases", ["purchases"], purchases],
    ["stock-ins", ["stock_ins", "stockIns"], stockIns],
    ["stock-outs", ["stock_outs", "stockOuts"], stockOuts],
  ];
  const results = await Promise.allSettled(requests.map(([endpoint, keys]) => fetchCollection(endpoint, keys)));
  results.forEach((result, index) => {
    if (result.status === "fulfilled") requests[index][2].value = result.value;
  });
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length) {
    errorMessage.value = failures.length === results.length
      ? failures[0].reason?.message || "Could not load dashboard data."
      : "Some dashboard data could not be loaded.";
  }
  updatedAt.value = new Date();
  loading.value = false;
});
</script>
