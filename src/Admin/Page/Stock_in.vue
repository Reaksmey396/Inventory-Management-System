<template>
  <div class="flex min-h-screen bg-[#f6f9ff] text-[#10234d]">
    <Sidebar page-key="stockIn" />

    <main class="min-w-0 flex-1 px-7 py-6">
      <header class="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-[26px] font-black leading-tight text-[#10234d]">Stock In</h1>
          <p class="mt-1 text-[13px] font-semibold text-[#6c7da4]">Manage received stock transactions</p>
        </div>

        <button
          v-if="!isReadOnly"
          type="button"
          class="flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-[#0d6efd] px-6 text-[13px] font-black text-white shadow-md shadow-blue-500/20 transition hover:bg-[#0b5ed7]"
          @click="openAddModal"
        >
          <i class="fa-solid fa-plus text-[12px]"></i>
          New Stock In
        </button>
      </header>

      <section class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="flex min-h-[126px] items-center gap-5 rounded-lg border border-[#dfe7f3] bg-white px-4 py-5 shadow-[0_10px_30px_rgba(15,35,80,0.04)]"
        >
          <span class="grid h-[66px] w-[66px] flex-shrink-0 place-items-center rounded-xl text-[27px]" :class="card.iconWrap">
            <i :class="card.icon"></i>
          </span>
          <div>
            <p class="text-[12px] font-extrabold text-[#223763]">{{ card.label }}</p>
            <p class="mt-2 text-[20px] font-black leading-none text-[#10234d]">{{ card.value }}</p>
            <p class="mt-2 text-[11px] font-semibold text-[#6c7da4]">{{ card.note }}</p>
          </div>
        </article>
      </section>

      <section class="overflow-hidden rounded-lg border border-[#dfe7f3] bg-white shadow-[0_10px_30px_rgba(15,35,80,0.04)]">
        <div class="border-b border-[#e8eef7] px-6 py-5">
          <div class="grid items-end gap-4 lg:grid-cols-[minmax(260px,1fr)_180px_auto]">
            <label class="relative">
              <input
                v-model="searchQuery"
                class="h-11 w-full rounded-md border border-[#dbe4f0] bg-white px-4 pr-11 text-[12px] font-semibold outline-none transition placeholder:text-[#8a99b8] focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
                placeholder="Search by reference no, product, note..."
              />
              <i class="fa-solid fa-magnifying-glass pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#6c7da4]"></i>
            </label>

            <input
              v-model="dateFilter"
              type="date"
              class="h-11 rounded-md border border-[#dbe4f0] bg-white px-3 text-[12px] font-bold text-[#10234d] outline-none focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#0d6efd] px-5 text-[12px] font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#0b5ed7]"
              @click="clearFilters"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="admin-table-scroll overflow-x-auto">
          <table class="admin-data-table w-full min-w-[2200px] table-fixed border-collapse text-left">
            <thead>
              <tr class="bg-[#f8fbff] text-[11px] font-black text-[#315071]">
                <th class="w-[64px] border-b border-[#e8eef7] px-4 py-4">No</th>
                <th class="w-[170px] border-b border-[#e8eef7] px-5 py-4">Reference No.</th>
                <th class="w-[160px] border-b border-[#e8eef7] px-5 py-4">Date</th>
                <th class="w-[125px] border-b border-[#e8eef7] px-5 py-4">Status</th>
                <th class="w-[270px] border-b border-[#e8eef7] px-5 py-4">Products</th>
                <th class="w-[230px] border-b border-[#e8eef7] px-5 py-4">Quantity</th>
                <th class="w-[230px] border-b border-[#e8eef7] px-5 py-4">Unit Cost</th>
                <th class="w-[180px] border-b border-[#e8eef7] px-5 py-4">Supplier</th>
                <th class="w-[120px] border-b border-[#e8eef7] px-5 py-4">Total Qty</th>
                <th class="w-[130px] border-b border-[#e8eef7] px-5 py-4">Total Cost</th>
                <th class="w-[240px] border-b border-[#e8eef7] px-5 py-4">Note</th>
                <th v-if="showAuditColumns" class="w-[180px] border-b border-[#e8eef7] px-5 py-4">Created At</th>
                <th v-if="showAuditColumns" class="w-[180px] border-b border-[#e8eef7] px-5 py-4">Updated At</th>
                <th v-if="showAuditColumns" class="w-[130px] border-b border-[#e8eef7] px-5 py-4">Created By</th>
                <th v-if="showAuditColumns" class="w-[130px] border-b border-[#e8eef7] px-5 py-4">Updated By</th>
                <th class="w-[150px] border-b border-[#e8eef7] px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#edf2f8]">
              <tr v-if="loading">
                <td colspan="16" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">
                  <i class="fa-solid fa-spinner mr-2 animate-spin"></i>
                  Loading stock in...
                </td>
              </tr>
              <tr v-else-if="errorMessage">
                <td colspan="16" class="px-5 py-10 text-center text-[13px] font-bold text-red-500">{{ errorMessage }}</td>
              </tr>
              <tr v-else-if="filteredTransactions.length === 0">
                <td colspan="16" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">No stock in records found.</td>
              </tr>
              <template v-else>
                <tr
                  v-for="(transaction, index) in filteredTransactions"
                  :key="transaction.id"
                  class="text-[12px] font-semibold text-[#223763] transition hover:bg-[#f8fbff]"
                >
                  <td class="px-4 py-4 text-[#506283]">{{ index + 1 }}</td>
                  <td class="px-5 py-4">
                    <span class="font-black text-[#0d6efd]">{{ transaction.referenceNo }}</span>
                  </td>
                  <td class="px-5 py-4">{{ transaction.dateText }}</td>
                  <td class="px-5 py-4">
                    <span class="inline-flex h-6 items-center rounded-full px-3 text-[10px] font-black" :class="statusClass(transaction.status)">
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="max-w-[260px] truncate font-black text-[#223763]">
                      {{ transaction.productNamesWithStock }}
                    </div>
                    <p class="mt-0.5 text-[11px] font-bold text-slate-400">{{ transaction.details.length }} item(s)</p>
                  </td>
                  <td class="max-w-[220px] truncate px-5 py-4">{{ transaction.quantityText }}</td>
                  <td class="max-w-[220px] truncate px-5 py-4">{{ transaction.unitCostText }}</td>
                  <td class="max-w-[220px] truncate px-5 py-4">{{ transaction.supplierName }}</td>
                  <td class="px-5 py-4">{{ transaction.totalQuantity }}</td>
                  <td class="px-5 py-4 font-black">$ {{ formatMoney(transaction.totalCost) }}</td>
                  <td class="truncate px-5 py-4">{{ transaction.note || "-" }}</td>
                  <td v-if="showAuditColumns" class="px-5 py-4 text-[#34476d]">{{ transaction.createdAt }}</td>
                  <td v-if="showAuditColumns" class="px-5 py-4 text-[#34476d]">{{ transaction.updatedAt }}</td>
                  <td v-if="showAuditColumns" class="px-5 py-4 text-[#34476d]">{{ transaction.createdBy }}</td>
                  <td v-if="showAuditColumns" class="px-5 py-4 text-[#34476d]">{{ transaction.updatedBy }}</td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-blue-50 text-[#0d6efd] transition hover:bg-blue-100"
                        aria-label="View stock in"
                        @click="openViewModal(transaction)"
                      >
                        <i class="fa-solid fa-eye text-[12px]"></i>
                      </button>
                      <button
                        v-if="canEditTransactions"
                        class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-orange-50 text-orange-500 transition hover:bg-orange-100"
                        aria-label="Edit stock in"
                        @click="openEditModal(transaction)"
                      >
                        <i class="fa-solid fa-pen text-[12px]"></i>
                      </button>
                      <button
                        v-if="canEditTransactions"
                        class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label="Delete stock in"
                        :disabled="deletingId === transaction.id"
                        @click="askDelete(transaction)"
                      >
                        <i v-if="deletingId === transaction.id" class="fa-solid fa-spinner animate-spin text-[12px]"></i>
                        <i v-else class="fa-solid fa-trash-can text-[12px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <footer class="flex flex-wrap items-center justify-between gap-4 border-t border-[#e8eef7] px-6 py-4">
          <p class="text-[12px] font-semibold text-[#506283]">
            Showing {{ filteredTransactions.length ? 1 : 0 }} to {{ filteredTransactions.length }} of {{ transactions.length }} entries
          </p>
        </footer>
      </section>
    </main>

    <div v-if="showModal" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
      <section class="flex max-h-[calc(100vh-48px)] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-[18px] font-black text-[#10234d]">
              {{ modalMode === "view" ? "Stock In Details" : isEditing ? "Edit Stock In" : "Add Stock In" }}
            </h2>
            <p class="mt-0.5 text-[12px] font-semibold text-slate-500">
              {{ modalMode === "view" ? "View received stock details" : "Record received product quantities and costs" }}
            </p>
          </div>

          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
            @click="closeModal"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <form class="grid min-h-0 gap-5 overflow-y-auto px-6 py-5" @submit.prevent="saveStockIn">
          <p v-if="saveError" class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
            {{ saveError }}
          </p>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763]">
              Reference No.
              <input
                v-model="stockInForm.referenceNo"
                type="text"
                required
                :readonly="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 read-only:bg-slate-50"
                placeholder="IN-2026-0001"
              />
            </label>

            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763]">
              Stock In Date
              <input
                v-model="stockInForm.stockInDate"
                type="date"
                required
                :readonly="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 read-only:bg-slate-50"
              />
            </label>

            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763]">
              Status
              <select
                v-model="stockInForm.status"
                :disabled="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 disabled:bg-slate-50"
              >
                <option>Completed</option>
                <option>Pending</option>
                <option>Draft</option>
                <option>Cancelled</option>
              </select>
            </label>

            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763] md:col-span-2 xl:col-span-4">
              Note
              <input
                v-model="stockInForm.note"
                type="text"
                :readonly="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 read-only:bg-slate-50"
                placeholder="Optional note"
              />
            </label>
          </div>

          <div class="grid gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-[13px] font-black text-[#223763]">Stock In Details</h3>
              <button
                v-if="!isViewing"
                type="button"
                class="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-50 px-4 text-[12px] font-black text-[#0d6efd] transition hover:bg-blue-100"
                @click="addDetailRow"
              >
                <i class="fa-solid fa-plus text-[11px]"></i>
                Add Item
              </button>
            </div>

            <div class="overflow-hidden rounded-lg border border-slate-200">
              <table class="admin-data-table w-full table-fixed text-left">
                <thead class="bg-slate-50 text-[11px] font-black uppercase text-[#506283]">
                  <tr>
                    <th class="w-[34%] px-4 py-3">Product</th>
                    <th class="w-[22%] px-4 py-3">Quantity</th>
                    <th class="w-[22%] px-4 py-3">Unit Cost</th>
                    <th class="w-[14%] px-4 py-3">Line Total</th>
                    <th v-if="!isViewing" class="w-[8%] px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(detail, index) in stockInForm.details" :key="detail.key">
                    <td class="px-4 py-3">
                      <select
                        v-model.number="detail.productId"
                        :required="!isViewing"
                        :disabled="isViewing"
                        class="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-[12px] font-semibold outline-none focus:border-blue-500 disabled:bg-slate-50"
                      >
                        <option disabled value="">Select product</option>
                        <option v-for="product in productOptions" :key="product.id" :value="product.id">
                          {{ product.name }} - Stock: {{ product.stock }}
                        </option>
                      </select>
                    </td>
                    <td class="px-4 py-3">
                      <input
                        v-model.number="detail.quantity"
                        type="number"
                        min="1"
                        step="1"
                        :required="!isViewing"
                        :readonly="isViewing"
                        class="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-[12px] font-semibold outline-none focus:border-blue-500 read-only:bg-slate-50"
                      />
                    </td>
                    <td class="px-4 py-3">
                      <input
                        v-model.number="detail.unitCost"
                        type="number"
                        min="0"
                        step="0.01"
                        :required="!isViewing"
                        :readonly="isViewing"
                        class="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-[12px] font-semibold outline-none focus:border-blue-500 read-only:bg-slate-50"
                      />
                    </td>
                    <td class="px-4 py-3 text-[12px] font-black whitespace-nowrap">$ {{ formatMoney(getLineTotal(detail)) }}</td>
                    <td v-if="!isViewing" class="px-4 py-3 text-center">
                      <button
                        type="button"
                        class="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        @click="removeDetailRow(index)"
                      >
                        <i class="fa-solid fa-trash-can text-[11px]"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="stockInForm.details.length === 0">
                    <td :colspan="isViewing ? 4 : 5" class="px-4 py-6 text-center text-[12px] font-bold text-[#506283]">
                      No product items. Use Add Item to add product details.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p class="text-[13px] font-black text-[#223763]">
              Total: {{ formTotalQuantity }} item(s), $ {{ formatMoney(formTotalCost) }}
            </p>
            <div class="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                class="h-10 rounded-lg border border-slate-200 px-5 text-[13px] font-black text-slate-600 transition hover:bg-slate-50"
                @click="closeModal"
              >
                {{ isViewing ? "Close" : "Cancel" }}
              </button>
              <button
                v-if="!isViewing"
                type="submit"
                :disabled="saving"
                class="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0d6efd] px-5 text-[13px] font-black text-white transition hover:bg-[#0b5ed7] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <i v-if="saving" class="fa-solid fa-spinner animate-spin text-[12px]"></i>
                {{ saving ? "Saving..." : isEditing ? "Update Stock In" : "Save Stock In" }}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>

    <DeleteConfirmModal
      v-if="canEditTransactions && transactionPendingDelete"
      :loading="deletingId === transactionPendingDelete.id"
      @cancel="cancelDelete"
      @confirm="removeTransaction"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../../Components/RoleSidebar.vue";
import DeleteConfirmModal from "../Components/DeleteConfirmModal.vue";
import { getAuthHeaders, getCurrentUserId } from "../../utils/auth";

const route = useRoute();
const isStaffArea = computed(() => route.path.startsWith("/staff/"));
const isReadOnly = computed(() => Boolean(route.meta.readOnly));
const showAuditColumns = computed(() => route.path.startsWith("/admin/"));
const canEditTransactions = computed(() => !isReadOnly.value && !isStaffArea.value);
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const stockInsEndpoint = `${apiBaseUrl}/stock-ins`;
const stockInDetailsEndpoint = `${apiBaseUrl}/stock-in-details`;
const productsEndpoint = `${apiBaseUrl}/products`;
const suppliersEndpoint = `${apiBaseUrl}/suppliers`;
const usersEndpoint = `${apiBaseUrl}/users`;
const stockInDetailOverridesKey = "stock_in_detail_overrides";

const transactions = ref([]);
const productOptions = ref([]);
const supplierOptions = ref([]);
const userOptions = ref([]);
const stockInDetails = ref([]);
const stockInDetailOverrides = ref({});
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const errorMessage = ref("");
const saveError = ref("");
const searchQuery = ref("");
const dateFilter = ref("");
const showModal = ref(false);
const modalMode = ref("add");
const editingStockInId = ref(null);
const transactionPendingDelete = ref(null);

const today = () => new Date().toISOString().slice(0, 10);
const makeReferenceNo = () => `IN-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
const makeDetailRow = () => ({
  key: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
  productId: "",
  quantity: 1,
  unitCost: 0,
});

const defaultStockInForm = () => ({
  referenceNo: makeReferenceNo(),
  stockInDate: today(),
  status: "Completed",
  note: "",
  details: [makeDetailRow()],
});

const stockInForm = ref(defaultStockInForm());
const isEditing = computed(() => editingStockInId.value !== null);
const isViewing = computed(() => modalMode.value === "view");

const parseApiResponse = async (response) => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    };
  }
};

const getResponseMessage = (data, fallback) => {
  const validationMessages = Object.values(data?.errors || {}).flat();
  if (validationMessages.length) return validationMessages.join(" ");
  return data?.message || data?.error || fallback;
};

const unwrapCollection = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[key]?.data)) return payload[key].data;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const firstCollection = (payload, keys) => {
  for (const key of keys) {
    const collection = unwrapCollection(payload, key);
    if (collection.length) return collection;
  }

  return Array.isArray(payload) ? payload : [];
};

const readStockInDetailOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(stockInDetailOverridesKey) || "{}");
  } catch {
    return {};
  }
};

const writeStockInDetailOverrides = () => {
  localStorage.setItem(stockInDetailOverridesKey, JSON.stringify(stockInDetailOverrides.value));
};

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUserName = (user, fallback = "-") => {
  if (!user) return fallback;

  if (typeof user === "string" || typeof user === "number") {
    if (!Number.isFinite(Number(user))) return String(user);

    const matchedUser = userOptions.value.find((option) => Number(option.id) === Number(user));
    return matchedUser?.name || fallback;
  }

  return (
    user.name ||
    user.username ||
    user.full_name ||
    user.email ||
    user.id ||
    fallback
  );
};

const getAuditUser = (record, key) => {
  return getUserName(
    record[key] ||
    record[`${key}_name`] ||
    record[`${key}_user`] ||
    record[key.replace("_by", "")] ||
    record[key.replace("_by", "By")] ||
    record[`${key.replace("_by", "By")}Name`]
  );
};

const toDateInput = (value) => {
  if (!value) return today();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const getProductName = (productId) => {
  return productOptions.value.find((product) => Number(product.id) === Number(productId))?.name || `Product #${productId || ""}`;
};

const getSupplierDisplayName = (supplier) => {
  if (!supplier) return "";

  return (
    supplier?.sup_name ||
    supplier?.supplier_name ||
    supplier?.company_name ||
    supplier?.company ||
    supplier?.name ||
    ""
  );
};

const getSupplierName = (supplierId) => {
  if (!supplierId) return "No supplier";

  return supplierOptions.value.find((supplier) => Number(supplier.id) === Number(supplierId))?.name || `Supplier #${supplierId}`;
};

const normalizeStatus = (value) => {
  const normalized = String(value || "completed").toLowerCase();

  if (normalized === "pending") return "Pending";
  if (normalized === "draft") return "Draft";
  if (normalized === "cancelled") return "Cancelled";
  return "Completed";
};

const statusClass = (status) => {
  if (status === "Completed") return "bg-emerald-100 text-emerald-600";
  if (status === "Pending") return "bg-orange-100 text-orange-500";
  if (status === "Draft") return "bg-slate-100 text-slate-500";
  return "bg-red-100 text-red-500";
};

const getProductOption = (productId) => {
  return productOptions.value.find((product) => Number(product.id) === Number(productId)) || null;
};

const getProductStockText = (productId) => {
  const product = getProductOption(productId);

  if (!product || product.stock === null || product.stock === undefined) return "";

  return ` (Stock: ${product.stock})`;
};

const normalizeDetail = (detail) => {
  const productId = detail.pro_id ?? detail.product_id ?? detail.product?.id ?? detail.pro?.id ?? "";
  const product = getProductOption(productId);
  const quantity = Number(detail.quantity ?? detail.qty ?? 0);
  const unitCost = Number(detail.unit_cost ?? detail.cost ?? detail.product?.cost_price ?? detail.pro?.cost_price ?? 0);
  const stock = Number(detail.product?.stock_qty ?? detail.product?.stock ?? detail.pro?.stock_qty ?? detail.pro?.stock ?? product?.stock ?? 0);

  return {
    id: detail.id || "",
    key: `${detail.id || Date.now()}-${productId}-${Math.random()}`,
    productId,
    stockInId: detail.stock_in_id || "",
    productName: detail.product?.product_name || detail.product?.name || detail.pro?.product_name || detail.pro?.name || product?.name || getProductName(productId),
    productStock: stock,
    quantity,
    unitCost,
  };
};

const makeDetailFromForm = (detail, stockInId, index = 0) => {
  const product = getProductOption(detail.productId);

  return {
    id: detail.id || `local-${stockInId}-${index}`,
    key: `${detail.id || "local"}-${stockInId}-${detail.productId}-${index}`,
    productId: detail.productId,
    stockInId,
    productName: product?.name || getProductName(detail.productId),
    productStock: product?.stock ?? 0,
    quantity: Number(detail.quantity || 0),
    unitCost: Number(detail.unitCost || 0),
  };
};

const normalizeTransaction = (stockIn, index) => {
  const supplierId = stockIn.supplier_id ?? stockIn.supplier?.id ?? "";
  const inlineDetails = (
    stockIn.stock_in_details ||
    stockIn.stockInDetails ||
    stockIn.details ||
    stockIn.items ||
    []
  );
  const relatedDetails = stockInDetails.value.filter((detail) => Number(detail.stockInId) === Number(stockIn.id));
  const overriddenDetails = stockInDetailOverrides.value?.[stockIn.id] || [];
  const details = overriddenDetails.length
    ? overriddenDetails.map((detail, detailIndex) => makeDetailFromForm(detail, stockIn.id, detailIndex))
    : (inlineDetails.length ? inlineDetails.map(normalizeDetail) : relatedDetails);
  const totalQuantity = details.reduce((sum, detail) => sum + Number(detail.quantity || 0), 0);
  const totalCost = details.reduce((sum, detail) => sum + getLineTotal(detail), 0);

  return {
    id: stockIn.id ?? index + 1,
    userId: stockIn.user_id || "",
    supplierId,
    supplierName: getSupplierDisplayName(stockIn.supplier) || getSupplierName(supplierId),
    referenceNo: stockIn.reference_no || `IN-${stockIn.id ?? index + 1}`,
    stockInDate: stockIn.stock_in_date || stockIn.date || "",
    dateText: formatDate(stockIn.stock_in_date || stockIn.date),
    status: normalizeStatus(stockIn.status),
    note: stockIn.in_note || stockIn.note || "",
    details,
    productNames: details.map((detail) => detail.productName || getProductName(detail.productId)).filter(Boolean).join(", ") || "-",
    productNamesWithStock: details.map((detail) => {
      const productName = detail.productName || getProductName(detail.productId);
      const stockText = detail.productStock !== null && detail.productStock !== undefined
        ? ` (Stock: ${detail.productStock})`
        : getProductStockText(detail.productId);
      return `${productName}${stockText}`;
    }).filter(Boolean).join(", ") || "-",
    quantityText: details.map((detail) => `${detail.productName || getProductName(detail.productId)}: ${detail.quantity}`).filter(Boolean).join(", ") || "-",
    unitCostText: details.map((detail) => `${detail.productName || getProductName(detail.productId)}: $ ${formatMoney(detail.unitCost)}`).filter(Boolean).join(", ") || "-",
    totalQuantity,
    totalCost,
    createdAtRaw: stockIn.created_at || "",
    updatedAtRaw: stockIn.updated_at || "",
    createdAt: formatDate(stockIn.created_at),
    updatedAt: formatDate(stockIn.updated_at),
    createdBy: getAuditUser(stockIn, "created_by"),
    updatedBy: getAuditUser(stockIn, "updated_by"),
  };
};

const fetchSuppliers = async () => {
  try {
    const response = await fetch(suppliersEndpoint, { headers: getAuthHeaders() });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (!route.path.startsWith("/staff/")) return;

      const [stockInsResponse, purchasesResponse] = await Promise.all([
        fetch(stockInsEndpoint, { headers: getAuthHeaders() }),
        fetch(`${apiBaseUrl}/purchases`, { headers: getAuthHeaders() }),
      ]);
      const [stockInsData, purchasesData] = await Promise.all([
        stockInsResponse.json().catch(() => ({})),
        purchasesResponse.json().catch(() => ({})),
      ]);
      const relatedRecords = [
        ...firstCollection(stockInsData, ["stock_ins", "stockIns"]),
        ...firstCollection(purchasesData, ["purchases"]),
      ];
      const relatedSuppliers = new Map();

      relatedRecords.forEach((record) => {
        const supplier = record.supplier;
        const id = supplier?.id ?? record.supplier_id;
        const name = getSupplierDisplayName(supplier);

        if (id && name) {
          relatedSuppliers.set(String(id), { id, name });
        }
      });

      supplierOptions.value = [...relatedSuppliers.values()];
      return;
    }

    supplierOptions.value = firstCollection(data, ["suppliers"]).map((supplier) => ({
      id: supplier.id,
      name: getSupplierDisplayName(supplier),
    }));
  } catch (error) {
    console.error("Fetch suppliers for stock in failed:", error);
  }
};

const fetchUsers = async () => {
  try {
    const response = await fetch(usersEndpoint, { headers: getAuthHeaders() });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) return;

    userOptions.value = unwrapCollection(data, "users").map((user) => ({
      id: user.id,
      name: user.name || user.username || user.email || `User #${user.id}`,
    }));
  } catch (error) {
    console.error("Fetch users for stock in failed:", error);
  }
};

const fetchProducts = async () => {
  try {
    const response = await fetch(productsEndpoint, { headers: getAuthHeaders() });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) return;

    productOptions.value = unwrapCollection(data, "products").map((product) => ({
      id: product.id,
      name: product.product_name || product.name || `Product #${product.id}`,
      cost: Number(product.cost_price ?? product.cost ?? 0),
      stock: Number(product.stock_qty ?? product.stock ?? product.quantity ?? product.qty ?? product.current_stock ?? 0),
      supplierId: product.supplier_id ?? product.supplier?.id ?? "",
      supplierName: getSupplierDisplayName(product.supplier) || getSupplierName(product.supplier_id),
    }));
  } catch (error) {
    console.error("Fetch products for stock in failed:", error);
  }
};

const fetchStockInDetails = async () => {
  try {
    const response = await fetch(stockInDetailsEndpoint, { headers: getAuthHeaders() });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) return;

    stockInDetails.value = firstCollection(data, ["stock_in_details", "stockInDetails", "details"]).map(normalizeDetail);
  } catch (error) {
    console.error("Fetch stock in details failed:", error);
  }
};

const unwrapStockIn = (payload) => {
  return payload?.data?.stock_in || payload?.data?.stockIn || payload?.data || payload?.stock_in || payload?.stockIn || payload;
};

const fetchStockInById = async (id) => {
  try {
    const response = await fetch(`${stockInsEndpoint}/${id}`, { headers: getAuthHeaders() });
    const data = await parseApiResponse(response);

    if (!response.ok) return null;

    return normalizeTransaction(unwrapStockIn(data), 0);
  } catch (error) {
    console.error("Fetch stock in detail failed:", error);
    return null;
  }
};

const fetchStockIns = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch(stockInsEndpoint, { headers: getAuthHeaders() });
    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(getResponseMessage(data, "Could not load stock in records."));
    }

    transactions.value = firstCollection(data, ["stock_ins", "stockIns"]).map(normalizeTransaction);
  } catch (error) {
    console.error("Fetch stock in failed:", error);
    errorMessage.value = error.message || "Could not load stock in records.";
  } finally {
    loading.value = false;
  }
};

const getLineTotal = (detail) => Number(detail.quantity || 0) * Number(detail.unitCost || 0);

const filteredTransactions = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();

  return transactions.value.filter((transaction) => {
    const matchKeyword =
      !keyword ||
      [transaction.referenceNo, transaction.status, transaction.note, transaction.productNames, transaction.productNamesWithStock, transaction.quantityText, transaction.unitCostText, transaction.supplierName]
        .some((value) => String(value || "").toLowerCase().includes(keyword));
    const matchDate = !dateFilter.value || [transaction.createdAtRaw, transaction.updatedAtRaw]
      .some((date) => String(date || "").slice(0, 10) === dateFilter.value);

    return matchKeyword && matchDate;
  });
});

const summaryCards = computed(() => {
  const totalTransactions = transactions.value.length;
  const totalItems = transactions.value.reduce((sum, transaction) => sum + transaction.totalQuantity, 0);
  const totalCost = transactions.value.reduce((sum, transaction) => sum + transaction.totalCost, 0);
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = transactions.value.filter((transaction) => transaction.stockInDate?.startsWith(month)).length;

  return [
    {
      label: "Total Stock In",
      value: totalTransactions.toLocaleString(),
      note: "All transactions",
      icon: "fa-solid fa-download",
      iconWrap: "bg-blue-50 text-[#0d6efd]",
    },
    {
      label: "This Month",
      value: thisMonth.toLocaleString(),
      note: "Transactions",
      icon: "fa-regular fa-calendar-check",
      iconWrap: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "Items Received",
      value: totalItems.toLocaleString(),
      note: "All items",
      icon: "fa-solid fa-cube",
      iconWrap: "bg-violet-50 text-violet-500",
    },
    {
      label: "Total Cost",
      value: `$ ${formatMoney(totalCost)}`,
      note: "All time cost",
      icon: "fa-solid fa-dollar-sign",
      iconWrap: "bg-orange-50 text-orange-500",
    },
  ];
});

const formTotalQuantity = computed(() => {
  return stockInForm.value.details.reduce((sum, detail) => sum + Number(detail.quantity || 0), 0);
});

const formTotalCost = computed(() => {
  return stockInForm.value.details.reduce((sum, detail) => sum + getLineTotal(detail), 0);
});

const resetModal = () => {
  stockInForm.value = defaultStockInForm();
  editingStockInId.value = null;
  modalMode.value = "add";
  saveError.value = "";
};

const openAddModal = () => {
  resetModal();
  showModal.value = true;
};

const fillForm = (transaction) => {
  stockInForm.value = {
    referenceNo: transaction.referenceNo,
    stockInDate: toDateInput(transaction.stockInDate),
    status: transaction.status || "Completed",
    note: transaction.note || "",
    details: transaction.details.length
      ? transaction.details.map((detail) => ({ ...detail, key: `${detail.key}-form` }))
      : [],
  };
};

const resolveTransactionForModal = async (transaction) => {
  if (transaction.details.length) {
    return transaction;
  }

  const freshTransaction = await fetchStockInById(transaction.id);
  return freshTransaction?.details?.length ? freshTransaction : transaction;
};

const openEditModal = async (transaction) => {
  const resolvedTransaction = await resolveTransactionForModal(transaction);

  fillForm(resolvedTransaction);
  editingStockInId.value = resolvedTransaction.id;
  modalMode.value = "edit";
  saveError.value = "";
  showModal.value = true;
};

const openViewModal = async (transaction) => {
  const resolvedTransaction = await resolveTransactionForModal(transaction);

  fillForm(resolvedTransaction);
  editingStockInId.value = resolvedTransaction.id;
  modalMode.value = "view";
  saveError.value = "";
  showModal.value = true;
};

const closeModal = () => {
  if (saving.value) return;
  showModal.value = false;
  resetModal();
};

const addDetailRow = () => {
  stockInForm.value.details.push(makeDetailRow());
};

const removeDetailRow = (index) => {
  stockInForm.value.details.splice(index, 1);
};

const isCompleteDetail = (detail) => {
  return Boolean(detail.productId) && Number(detail.quantity) > 0 && Number(detail.unitCost) >= 0;
};

const getCompleteDetails = () => {
  return stockInForm.value.details.filter(isCompleteDetail);
};

const buildStockInFormData = (editing) => {
  const formData = new FormData();
  const currentUserId = getCurrentUserId();
  const details = getCompleteDetails().map((detail) => ({
    id: detail.id || undefined,
    product_id: detail.productId,
    quantity: detail.quantity,
    unit_cost: detail.unitCost,
    line_total: getLineTotal(detail),
  }));

  formData.append("stock_in_date", stockInForm.value.stockInDate);
  formData.append("reference_no", stockInForm.value.referenceNo);
  formData.append("status", stockInForm.value.status);
  formData.append("in_note", stockInForm.value.note || "");
  formData.append("user_id", currentUserId);
  formData.append("details", JSON.stringify(details));

  details.forEach((detail, index) => {
    if (detail.id) formData.append(`details[${index}][id]`, detail.id);
    formData.append(`details[${index}][product_id]`, detail.product_id);
    formData.append(`details[${index}][quantity]`, detail.quantity);
    formData.append(`details[${index}][unit_cost]`, detail.unit_cost);
    formData.append(`details[${index}][line_total]`, detail.line_total);
  });

  if (editing) {
    if (currentUserId) formData.append("updated_by", currentUserId);
    formData.append("_method", "PUT");
  } else if (currentUserId) {
    formData.append("created_by", currentUserId);
    formData.append("updated_by", currentUserId);
  }

  return formData;
};

const buildDetailFormData = (stockInId, detail) => {
  const formData = new FormData();

  formData.append("stock_in_id", stockInId);
  formData.append("product_id", detail.productId);
  formData.append("quantity", detail.quantity);
  formData.append("unit_cost", detail.unitCost);
  formData.append("line_total", getLineTotal(detail));

  return formData;
};

const deleteStockInDetail = async (detailId) => {
  const response = await fetch(`${stockInDetailsEndpoint}/${detailId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 404) {
    const data = await response.json().catch(() => ({}));
    throw new Error(getResponseMessage(data, "Could not delete stock in detail."));
  }
};

const saveStockInDetail = async (stockInId, detail) => {
  const response = await fetch(stockInDetailsEndpoint, {
    method: "POST",
    headers: getAuthHeaders(),
    body: buildDetailFormData(stockInId, detail),
  });
  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(getResponseMessage(data, "Could not create stock in detail."));
  }
};

const syncStockInDetails = async (stockInId, details, editing) => {
  const existingDetails = editing
    ? stockInDetails.value.filter((detail) => Number(detail.stockInId) === Number(stockInId))
    : [];
  const removedDetails = editing
    ? existingDetails
    : [];
  const detailsToCreate = details.map((detail) => ({
    ...detail,
    id: "",
  }));

  await Promise.all(removedDetails.map((detail) => deleteStockInDetail(detail.id)));
  await Promise.all(detailsToCreate.map((detail) => saveStockInDetail(stockInId, detail)));
};

const rememberEditedStockInDetails = (stockInId, details) => {
  if (!stockInId) return;

  if (details.length) {
    stockInDetailOverrides.value = {
      ...stockInDetailOverrides.value,
      [stockInId]: details.map((detail) => ({
        id: detail.id || "",
        productId: detail.productId,
        quantity: detail.quantity,
        unitCost: detail.unitCost,
      })),
    };
  } else {
    const nextOverrides = { ...stockInDetailOverrides.value };
    delete nextOverrides[stockInId];
    stockInDetailOverrides.value = nextOverrides;
  }

  writeStockInDetailOverrides();
};

const saveStockIn = async () => {
  if (isViewing.value) return;

  saving.value = true;
  saveError.value = "";
  errorMessage.value = "";

  try {
    const editing = isEditing.value;
    const url = editing ? `${stockInsEndpoint}/${editingStockInId.value}` : stockInsEndpoint;
    const stockInIdBeforeSave = editingStockInId.value;
    const formDetails = getCompleteDetails().map((detail) => ({
      id: detail.id || "",
      productId: detail.productId,
      quantity: detail.quantity,
      unitCost: detail.unitCost,
    }));

    if (!editing && !formDetails.length) {
      throw new Error("Please add at least one stock in item.");
    }
    const formData = buildStockInFormData(editing);

    showModal.value = false;
    resetModal();

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(getResponseMessage(data, editing ? "Could not update stock in." : "Could not create stock in."));
    }

    const savedStockIn = unwrapStockIn(data);
    const stockInId = savedStockIn?.id || stockInIdBeforeSave;

    if (!stockInId) {
      throw new Error("Stock in was saved, but the response did not include its id.");
    }

    if (!editing) {
      await syncStockInDetails(stockInId, formDetails, editing);
    } else {
      rememberEditedStockInDetails(stockInId, formDetails);
    }

    await fetchProducts();
    await fetchStockInDetails();
    await fetchStockIns();
  } catch (error) {
    console.error("Save stock in failed:", error);
    const message = error.message || "Could not save stock in.";
    saveError.value = message;
    errorMessage.value = message;
  } finally {
    saving.value = false;
  }
};

const askDelete = (transaction) => {
  transactionPendingDelete.value = transaction;
};

const cancelDelete = () => {
  if (deletingId.value) return;
  transactionPendingDelete.value = null;
};

const removeTransaction = async () => {
  if (!transactionPendingDelete.value) return;

  deletingId.value = transactionPendingDelete.value.id;
  errorMessage.value = "";

  try {
    const response = await fetch(`${stockInsEndpoint}/${transactionPendingDelete.value.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getResponseMessage(data, "Could not delete stock in."));
    }

    transactions.value = transactions.value.filter((transaction) => transaction.id !== transactionPendingDelete.value.id);
    transactionPendingDelete.value = null;
  } catch (error) {
    console.error("Delete stock in failed:", error);
    errorMessage.value = error.message || "Could not delete stock in.";
  } finally {
    deletingId.value = null;
  }
};

const clearFilters = () => {
  searchQuery.value = "";
  dateFilter.value = "";
};

onMounted(async () => {
  stockInDetailOverrides.value = readStockInDetailOverrides();
  await fetchUsers();
  await fetchSuppliers();
  await fetchProducts();
  await fetchStockInDetails();
  await fetchStockIns();
});
</script>
