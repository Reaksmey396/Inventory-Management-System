<template>
  <div class="staff-portal flex min-h-screen bg-[#edf5f2] text-slate-900">
    <Sidebar page-key="purchase" />

    <main class="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-7">
      <header class="mb-5">
        <p class="text-xs font-black uppercase text-teal-700">Staff access</p>
        <h1 class="mt-1 text-2xl font-black text-slate-950">Purchase History</h1>
        <p class="mt-1 text-sm font-semibold text-slate-500">Review purchases and supplier receiving history.</p>
      </header>

      <p v-if="noticeMessage" class="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        {{ noticeMessage }}
      </p>

      <section class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in summaryCards" :key="card.label" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-extrabold text-slate-500">{{ card.label }}</p>
          <p class="mt-2 text-2xl font-black text-slate-950">{{ loading ? "..." : card.value }}</p>
          <p class="mt-1 text-xs font-semibold text-slate-400">{{ card.note }}</p>
        </article>
      </section>

      <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(240px,1fr)_170px_170px_auto]">
          <label class="relative">
            <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search reference, supplier, or note..."
              class="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs font-semibold outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            >
          </label>
          <input
            v-model="dateFilter"
            type="date"
            class="h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          >
          <select
            v-model="statusFilter"
            class="h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          >
            <option value="">All statuses</option>
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
          </select>
          <button
            type="button"
            class="h-10 rounded-lg border border-slate-200 px-4 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            :disabled="!searchQuery && !dateFilter && !statusFilter"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[980px] text-left text-xs">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-4 py-3 font-extrabold">Reference</th>
                <th class="px-4 py-3 font-extrabold">Date</th>
                <th class="px-4 py-3 font-extrabold">Supplier</th>
                <th class="px-4 py-3 text-right font-extrabold">Items</th>
                <th class="px-4 py-3 text-right font-extrabold">Quantity</th>
                <th class="px-4 py-3 text-right font-extrabold">Amount</th>
                <th class="px-4 py-3 font-extrabold">Status</th>
                <th class="px-4 py-3 font-extrabold">Source</th>
                <th class="px-4 py-3 font-extrabold">Note</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading">
                <td colspan="9" class="px-4 py-10 text-center font-semibold text-slate-400">
                  <i class="fa-solid fa-spinner mr-2 animate-spin"></i>Loading purchase history...
                </td>
              </tr>
              <tr v-else-if="!filteredRecords.length">
                <td colspan="9" class="px-4 py-10 text-center font-semibold text-slate-400">No purchase or receiving records are available.</td>
              </tr>
              <tr v-for="record in filteredRecords" :key="record.key" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-black text-teal-700">{{ record.reference }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ record.dateText }}</td>
                <td class="px-4 py-3 font-bold text-slate-800">{{ record.supplier }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-600">{{ record.items }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-600">{{ record.quantity }}</td>
                <td class="px-4 py-3 text-right font-black text-slate-800">{{ formatMoney(record.amount) }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-md px-2 py-1 text-[11px] font-extrabold" :class="statusClass(record.status)">{{ record.status }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-600">{{ record.source }}</span>
                </td>
                <td class="max-w-64 truncate px-4 py-3 text-slate-500" :title="record.note">{{ record.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="border-t border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
          Showing {{ filteredRecords.length }} of {{ records.length }} records
        </footer>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import Sidebar from "../Components/Sidebar.vue";
import { getAuthHeaders } from "../../utils/auth";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "https://laravel-inventory-management-1.onrender.com").replace(/\/+$/, "");
const records = ref([]);
const loading = ref(false);
const noticeMessage = ref("");
const searchQuery = ref("");
const dateFilter = ref("");
const statusFilter = ref("");

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

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() };
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

const formatMoney = (value) => new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
}).format(Number(value || 0));

const supplierName = (record) => record.supplier?.sup_name
  || record.supplier?.supplier_name
  || record.supplier?.company_name
  || record.supplier?.name
  || record.supplier_name
  || (record.supplier_id ? `Supplier #${record.supplier_id}` : "-");

const detailsFrom = (record) => record.details || record.stock_in_details || record.stockInDetails || record.items || [];

const normalizePurchase = (purchase, index) => ({
  key: `purchase-${purchase.id ?? index}`,
  reference: purchase.purchase_no || `PUR-${purchase.id ?? index + 1}`,
  date: String(purchase.purchase_date || purchase.date || purchase.created_at || "").slice(0, 10),
  dateText: formatDate(purchase.purchase_date || purchase.date || purchase.created_at),
  supplier: supplierName(purchase),
  items: Number(purchase.items_count ?? purchase.total_items ?? detailsFrom(purchase).length ?? 0),
  quantity: Number(purchase.total_quantity ?? purchase.quantity ?? 0),
  amount: Number(purchase.total_amount ?? purchase.amount ?? 0),
  status: String(purchase.pur_status || purchase.status || "Completed").replace(/^./, (letter) => letter.toUpperCase()),
  source: "Purchase",
  note: purchase.pur_note || purchase.note || "-",
});

const normalizeStockIn = (stockIn, index) => {
  const details = detailsFrom(stockIn);
  const amount = details.reduce((sum, detail) => sum + Number(detail.quantity ?? detail.qty ?? 0) * Number(detail.in_cost ?? detail.unit_cost ?? detail.cost ?? 0), 0);
  const quantity = details.reduce((sum, detail) => sum + Number(detail.quantity ?? detail.qty ?? 0), 0);

  return {
    key: `stock-in-${stockIn.id ?? index}`,
    reference: stockIn.reference_no || `IN-${stockIn.id ?? index + 1}`,
    date: String(stockIn.stock_in_date || stockIn.date || stockIn.created_at || "").slice(0, 10),
    dateText: formatDate(stockIn.stock_in_date || stockIn.date || stockIn.created_at),
    supplier: supplierName(stockIn),
    items: details.length,
    quantity,
    amount,
    status: String(stockIn.status || "Completed").replace(/^./, (letter) => letter.toUpperCase()),
    source: "Stock In",
    note: stockIn.in_note || stockIn.note || "Supplier delivery",
  };
};

const fetchHistory = async () => {
  loading.value = true;
  noticeMessage.value = "";

  try {
    const purchaseResponse = await fetch(`${apiBaseUrl}/purchases`, { headers: getAuthHeaders() });
    const purchaseData = await parseResponse(purchaseResponse);

    if (purchaseResponse.ok) {
      records.value = unwrapCollection(purchaseData, ["purchases"]).map(normalizePurchase);
      return;
    }

    const stockInResponse = await fetch(`${apiBaseUrl}/stock-ins`, { headers: getAuthHeaders() });
    const stockInData = await parseResponse(stockInResponse);

    if (!stockInResponse.ok) {
      throw new Error(purchaseData?.message || stockInData?.message || "Purchase history is restricted for this account.");
    }

    records.value = unwrapCollection(stockInData, ["stock_ins", "stockIns"]).map(normalizeStockIn);
    noticeMessage.value = "Purchase access is restricted by the backend. Showing staff-visible supplier receiving history instead.";
  } catch (error) {
    console.error("Fetch staff purchase history failed:", error);
    noticeMessage.value = error.message || "Could not load purchase history.";
  } finally {
    loading.value = false;
  }
};

const filteredRecords = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();

  return records.value.filter((record) => {
    const matchesSearch = !keyword || [record.reference, record.supplier, record.note, record.source]
      .some((value) => String(value || "").toLowerCase().includes(keyword));
    const matchesDate = !dateFilter.value || record.date === dateFilter.value;
    const matchesStatus = !statusFilter.value || record.status === statusFilter.value;
    return matchesSearch && matchesDate && matchesStatus;
  });
});

const statusOptions = computed(() => [...new Set(records.value.map((record) => record.status).filter(Boolean))]);
const summaryCards = computed(() => {
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = records.value.filter((record) => record.date.startsWith(month));

  return [
    { label: "Total Records", value: records.value.length.toLocaleString(), note: "Visible history" },
    { label: "Total Amount", value: formatMoney(records.value.reduce((sum, record) => sum + record.amount, 0)), note: "Recorded value" },
    { label: "This Month", value: thisMonth.length.toLocaleString(), note: "Transactions" },
    { label: "Units Received", value: records.value.reduce((sum, record) => sum + record.quantity, 0).toLocaleString(), note: "Total quantity" },
  ];
});

const statusClass = (status) => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("complete") || normalized.includes("active")) return "bg-emerald-50 text-emerald-700";
  if (normalized.includes("cancel") || normalized.includes("reject")) return "bg-red-50 text-red-600";
  return "bg-amber-50 text-amber-700";
};

const clearFilters = () => {
  searchQuery.value = "";
  dateFilter.value = "";
  statusFilter.value = "";
};

onMounted(fetchHistory);
</script>
