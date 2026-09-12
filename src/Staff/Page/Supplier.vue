<template>
  <div class="staff-portal flex min-h-screen bg-[#edf5f2] text-slate-900">
    <Sidebar page-key="suppliers" />

    <main class="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-7">
      <header class="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-black uppercase text-teal-700">Staff access</p>
          <h1 class="mt-1 text-2xl font-black text-slate-950">Suppliers</h1>
          <p class="mt-1 text-sm font-semibold text-slate-500">View supplier contact and purchasing information.</p>
        </div>
        <label class="relative block w-full sm:w-72">
          <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search suppliers..."
            class="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          >
        </label>
      </header>

      <p v-if="errorMessage" class="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        {{ errorMessage }}
      </p>

      <section class="mb-5 grid gap-3 sm:grid-cols-3">
        <article v-for="card in cards" :key="card.label" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-extrabold text-slate-500">{{ card.label }}</p>
          <p class="mt-2 text-2xl font-black text-slate-950">{{ loading ? "..." : card.value }}</p>
        </article>
      </section>

      <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-left text-xs">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-4 py-3 font-extrabold">Supplier</th>
                <th class="px-4 py-3 font-extrabold">Email</th>
                <th class="px-4 py-3 font-extrabold">Phone</th>
                <th class="px-4 py-3 font-extrabold">Address</th>
                <th class="px-4 py-3 font-extrabold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading">
                <td colspan="5" class="px-4 py-10 text-center font-semibold text-slate-400">
                  <i class="fa-solid fa-spinner mr-2 animate-spin"></i>Loading suppliers...
                </td>
              </tr>
              <tr v-else-if="!filteredSuppliers.length">
                <td colspan="5" class="px-4 py-10 text-center font-semibold text-slate-400">No supplier data is available for this staff account.</td>
              </tr>
              <tr v-for="supplier in filteredSuppliers" :key="supplier.id" class="hover:bg-slate-50">
                <td class="px-4 py-3">
                  <p class="font-black text-slate-800">{{ supplier.name }}</p>
                  <p class="mt-0.5 text-[11px] text-slate-400">Supplier #{{ supplier.id }}</p>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ supplier.email }}</td>
                <td class="px-4 py-3 text-slate-600">{{ supplier.phone }}</td>
                <td class="px-4 py-3 text-slate-600">{{ supplier.address }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-md px-2 py-1 text-[11px] font-extrabold" :class="supplier.status === 'Inactive' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'">
                    {{ supplier.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import Sidebar from "../Components/Sidebar.vue";
import { getAuthHeaders } from "../../utils/auth";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const suppliers = ref([]);
const searchQuery = ref("");
const loading = ref(false);
const errorMessage = ref("");

const unwrapCollection = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[key]?.data)) return payload[key].data;
  if (Array.isArray(payload?.[key])) return payload[key];
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

const supplierFromRecord = (value, fallbackId = "") => {
  if (!value || typeof value !== "object") return null;
  const id = value.id || fallbackId;
  const name = value.sup_name || value.supplier_name || value.company_name || value.company || value.name;
  if (!id && !name) return null;

  return {
    id: id || name,
    name: name || `Supplier #${id}`,
    email: value.sup_email || value.email || "-",
    phone: value.sup_phone || value.phone || "-",
    address: value.address || "-",
    status: String(value.status || "active").toLowerCase() === "inactive" ? "Inactive" : "Active",
  };
};

const collectRelatedSuppliers = (records) => {
  const result = new Map();

  records.forEach((record) => {
    const supplier = supplierFromRecord(record.supplier, record.supplier_id);
    if (supplier) result.set(String(supplier.id), supplier);
  });

  return [...result.values()];
};

const fetchSuppliers = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch(`${apiBaseUrl}/suppliers`, { headers: getAuthHeaders() });
    const data = await parseResponse(response);

    if (response.ok) {
      suppliers.value = unwrapCollection(data, "suppliers").map((supplier, index) => supplierFromRecord(supplier, index + 1)).filter(Boolean);
      return;
    }

    const [stockInResponse, purchaseResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/stock-ins`, { headers: getAuthHeaders() }),
      fetch(`${apiBaseUrl}/purchases`, { headers: getAuthHeaders() }),
    ]);
    const [stockInData, purchaseData] = await Promise.all([parseResponse(stockInResponse), parseResponse(purchaseResponse)]);
    const related = [
      ...unwrapCollection(stockInData, "stock_ins"),
      ...unwrapCollection(stockInData, "stockIns"),
      ...unwrapCollection(purchaseData, "purchases"),
    ];
    suppliers.value = collectRelatedSuppliers(related);

    if (!suppliers.value.length) {
      throw new Error(data?.message || data?.error || "Supplier data is restricted for this account.");
    }

    errorMessage.value = "Showing suppliers linked to your staff-visible inventory records.";
  } catch (error) {
    console.error("Fetch staff suppliers failed:", error);
    errorMessage.value = error.message || "Could not load suppliers.";
  } finally {
    loading.value = false;
  }
};

const filteredSuppliers = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();
  if (!keyword) return suppliers.value;

  return suppliers.value.filter((supplier) =>
    [supplier.name, supplier.email, supplier.phone, supplier.address]
      .some((value) => String(value || "").toLowerCase().includes(keyword))
  );
});

const cards = computed(() => [
  { label: "Total Suppliers", value: suppliers.value.length.toLocaleString() },
  { label: "Active Suppliers", value: suppliers.value.filter((supplier) => supplier.status === "Active").length.toLocaleString() },
  { label: "Locations", value: new Set(suppliers.value.map((supplier) => supplier.address).filter((address) => address !== "-")).size.toLocaleString() },
]);

onMounted(fetchSuppliers);
</script>
