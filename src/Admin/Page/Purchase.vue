<template>
  <div class="flex min-h-screen bg-[#f6f9ff] text-[#10234d]">
    <Sidebar page-key="purchase" />

    <main class="min-w-0 flex-1 px-7 py-6">
      <header class="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-[26px] font-black leading-tight text-[#10234d]">{{ isReadOnly ? "Purchase History" : "Purchase" }}</h1>
          <p class="mt-1 text-[13px] font-semibold text-[#6c7da4]">{{ isReadOnly ? "View purchase transaction history" : "Manage all purchase transactions" }}</p>
        </div>

        <button
          v-if="!isReadOnly"
          type="button"
          class="flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-[#0d6efd] px-6 text-[13px] font-black text-white shadow-md shadow-blue-500/20 transition hover:bg-[#0b5ed7]"
          @click="openAddModal"
        >
          <i class="fa-solid fa-plus text-[12px]"></i>
          New Purchase
        </button>
      </header>

      <section class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="flex min-h-[126px] min-w-0 items-center gap-5 rounded-lg border border-[#dfe7f3] bg-white px-4 py-5 shadow-[0_10px_30px_rgba(15,35,80,0.04)]"
        >
          <span class="grid h-[66px] w-[66px] flex-shrink-0 place-items-center rounded-xl text-[27px]" :class="card.iconWrap">
            <i :class="card.icon"></i>
          </span>
          <div class="min-w-0">
            <p class="text-[12px] font-extrabold text-[#223763]">{{ card.label }}</p>
            <p class="mt-2 break-words text-[20px] font-black leading-tight text-[#10234d]">{{ card.value }}</p>
            <p class="mt-2 text-[11px] font-semibold text-[#6c7da4]">{{ card.note }}</p>
          </div>
        </article>
      </section>

      <section class="overflow-hidden rounded-lg border border-[#dfe7f3] bg-white shadow-[0_10px_30px_rgba(15,35,80,0.04)]">
        <div class="border-b border-[#e8eef7] px-6 py-5">
          <div class="grid items-end gap-4 lg:grid-cols-[minmax(260px,1fr)_180px_190px_auto]">
            <label class="relative min-w-0">
              <input
                v-model="searchQuery"
                class="h-11 w-full rounded-md border border-[#dbe4f0] bg-white px-4 pr-11 text-[12px] font-semibold text-[#10234d] outline-none transition placeholder:text-[#8a99b8] focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
                placeholder="Search by purchase no, supplier, note, user..."
              />
              <i class="fa-solid fa-magnifying-glass pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#6c7da4]"></i>
            </label>

            <input
              v-model="dateFilter"
              type="date"
              class="h-11 rounded-md border border-[#dbe4f0] bg-white px-3 text-[12px] font-bold text-[#10234d] outline-none focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
            />

            <select
              v-model="statusFilter"
              class="h-11 cursor-pointer rounded-md border border-[#dbe4f0] bg-white px-3 text-[12px] font-bold text-[#10234d] outline-none focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Status</option>
              <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
            </select>

            <button
              class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#0d6efd] px-5 text-[12px] font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#0b5ed7]"
              @click="clearFilters"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="admin-table-scroll max-h-[650px] overflow-auto">
          <table class="admin-data-table w-full min-w-[1900px] table-fixed border-separate border-spacing-0 text-left">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#f8fbff] text-[11px] font-black text-[#315071]">
                <th class="w-[64px] border-b border-[#e8eef7] px-4 py-4">No</th>
                <th class="w-[175px] border-b border-[#e8eef7] px-5 py-4">Purchase No.</th>
                <th class="w-[165px] border-b border-[#e8eef7] px-5 py-4">Purchase Date</th>
                <th class="w-[270px] border-b border-[#e8eef7] px-5 py-4">Supplier</th>
                <th class="w-[170px] border-b border-[#e8eef7] px-5 py-4">User</th>
                <th class="w-[155px] border-b border-[#e8eef7] px-5 py-4 text-right">Total Amount</th>
                <th class="w-[140px] border-b border-[#e8eef7] px-5 py-4 text-center">Status</th>
                <th class="w-[280px] border-b border-[#e8eef7] px-5 py-4">Purchase Note</th>
                <th v-if="showAuditColumns" class="w-[190px] border-b border-[#e8eef7] px-5 py-4">Created At</th>
                <th v-if="showAuditColumns" class="w-[190px] border-b border-[#e8eef7] px-5 py-4">Updated At</th>
                <th v-if="showAuditColumns" class="w-[160px] border-b border-[#e8eef7] px-5 py-4">Created By</th>
                <th v-if="showAuditColumns" class="w-[160px] border-b border-[#e8eef7] px-5 py-4">Updated By</th>
                <th class="w-[150px] border-b border-[#e8eef7] px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#edf2f8]">
              <tr v-if="loading">
                <td colspan="13" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">
                  <i class="fa-solid fa-spinner mr-2 animate-spin"></i>
                  Loading purchases...
                </td>
              </tr>
              <tr v-else-if="errorMessage">
                <td colspan="13" class="px-5 py-10 text-center text-[13px] font-bold text-red-500">{{ errorMessage }}</td>
              </tr>
              <tr v-else-if="filteredPurchases.length === 0">
                <td colspan="13" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">No purchase records found.</td>
              </tr>
              <template v-else>
                <tr
                  v-for="(purchase, index) in filteredPurchases"
                  :key="purchase.id"
                  class="text-[12px] font-semibold leading-relaxed text-[#223763] transition odd:bg-white even:bg-[#fbfdff] hover:bg-[#f8fbff]"
                >
                  <td class="px-4 py-5 text-[#506283]">{{ index + 1 }}</td>
                  <td class="px-5 py-5">
                    <span class="font-black text-[#0d6efd]">{{ purchase.purchaseNo }}</span>
                  </td>
                  <td class="whitespace-nowrap px-5 py-5 text-[#34476d]">{{ purchase.dateText }}</td>
                  <td class="px-5 py-5">
                    <div class="flex min-w-0 items-center gap-3">
                      <span class="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-blue-50 text-[12px] font-black text-[#0d6efd] ring-1 ring-blue-100">
                        {{ purchase.supplierInitial }}
                      </span>
                      <div class="min-w-0">
                        <p class="truncate font-black text-[#223763]">{{ purchase.supplierName }}</p>
                        <p class="mt-0.5 truncate text-[11px] font-bold text-[#6c7da4]">Supplier</p>
                      </div>
                    </div>
                  </td>
                  <td class="truncate px-5 py-5 text-[#34476d]">{{ purchase.userName }}</td>
                  <td class="px-5 py-5 text-right font-black tabular-nums text-[#10234d]">$ {{ formatMoney(purchase.totalAmount) }}</td>
                  <td class="px-5 py-5 text-center">
                    <span class="inline-flex h-7 items-center rounded-full px-3 text-[10px] font-black" :class="purchaseStatusClass(purchase.status)">
                      {{ purchase.status }}
                    </span>
                  </td>
                  <td class="px-5 py-5 text-[#34476d]">
                    <span class="line-clamp-2">{{ purchase.note }}</span>
                  </td>
                  <td v-if="showAuditColumns" class="whitespace-nowrap px-5 py-5 text-[#34476d]">{{ purchase.createdAt }}</td>
                  <td v-if="showAuditColumns" class="whitespace-nowrap px-5 py-5 text-[#34476d]">{{ purchase.updatedAt }}</td>
                  <td v-if="showAuditColumns" class="truncate px-5 py-5 text-[#34476d]">{{ purchase.createdBy }}</td>
                  <td v-if="showAuditColumns" class="truncate px-5 py-5 text-[#34476d]">{{ purchase.updatedBy }}</td>
                  <td class="px-5 py-5">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        v-if="!isReadOnly"
                        type="button"
                        class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-blue-50 text-[#0d6efd] transition hover:bg-blue-100"
                        aria-label="View purchase"
                        @click="openViewModal(purchase)"
                      >
                        <i class="fa-solid fa-eye text-[12px]"></i>
                      </button>
                      <button
                        v-if="!isReadOnly"
                        type="button"
                        class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-orange-50 text-orange-500 transition hover:bg-orange-100"
                        aria-label="Edit purchase"
                        @click="openEditModal(purchase)"
                      >
                        <i class="fa-solid fa-pen text-[12px]"></i>
                      </button>
                      <button
                        class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label="Delete purchase"
                        :disabled="deletingId === purchase.id"
                        @click="askDelete(purchase)"
                      >
                        <i v-if="deletingId === purchase.id" class="fa-solid fa-spinner animate-spin text-[12px]"></i>
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
            Showing {{ filteredPurchases.length ? 1 : 0 }} to {{ filteredPurchases.length }} of {{ purchases.length }} entries
          </p>
        </footer>
      </section>
    </main>

    <div v-if="showModal" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
      <section class="flex max-h-[calc(100vh-48px)] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-[18px] font-black text-[#10234d]">
              {{ modalMode === "view" ? "Purchase Details" : isEditing ? "Edit Purchase" : "Add Purchase" }}
            </h2>
            <p class="mt-0.5 text-[12px] font-semibold text-slate-500">
              {{ modalMode === "view" ? "View purchase transaction information" : isEditing ? "Update purchase transaction information" : "Create a new purchase transaction" }}
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

        <form class="grid min-h-0 gap-5 overflow-y-auto px-6 py-5" @submit.prevent="savePurchase">
          <p v-if="saveError" class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
            {{ saveError }}
          </p>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763]">
              Purchase No.
              <input
                v-model="purchaseForm.purchaseNo"
                type="text"
                required
                :readonly="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 read-only:bg-slate-50"
                placeholder="PUR-2026-0001"
              />
            </label>

            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763]">
              Purchase Date
              <input
                v-model="purchaseForm.purchaseDate"
                type="date"
                required
                :readonly="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 read-only:bg-slate-50"
              />
            </label>

            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763]">
              Supplier
              <select
                v-model="purchaseForm.supplierId"
                required
                :disabled="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 disabled:bg-slate-50"
              >
                <option disabled value="">Select supplier</option>
                <option v-for="supplier in supplierOptions" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </label>

            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763]">
              User
              <select
                v-model="purchaseForm.userId"
                :disabled="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 disabled:bg-slate-50"
              >
                <option value="">No user</option>
                <option v-for="user in userOptions" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </label>

            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763]">
              Total Amount
              <input
                v-model.number="purchaseForm.totalAmount"
                type="number"
                min="0"
                step="0.01"
                required
                :readonly="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 read-only:bg-slate-50"
                placeholder="0.00"
              />
            </label>

            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763]">
              Status
              <select
                v-model="purchaseForm.status"
                :disabled="isViewing"
                class="min-w-0 rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 disabled:bg-slate-50"
              >
                <option v-for="status in purchaseStatusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </label>

            <label class="grid min-w-0 gap-2 text-[13px] font-black text-[#223763] md:col-span-2">
              Purchase Note
              <textarea
                v-model="purchaseForm.note"
                rows="3"
                :readonly="isViewing"
                class="min-w-0 resize-none rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500 read-only:bg-slate-50"
                placeholder="Purchase note"
              ></textarea>
            </label>
          </div>

          <footer class="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              class="h-10 rounded-lg border border-slate-200 px-5 text-[12px] font-black text-slate-600 transition hover:bg-slate-50"
              @click="closeModal"
            >
              {{ isViewing ? "Close" : "Cancel" }}
            </button>
            <button
              v-if="!isViewing"
              type="submit"
              class="flex h-10 items-center gap-2 rounded-lg bg-[#0d6efd] px-5 text-[12px] font-black text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#0b5ed7] disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="saving"
            >
              <i v-if="saving" class="fa-solid fa-spinner animate-spin text-[11px]"></i>
              {{ saving ? "Saving..." : isEditing ? "Update Purchase" : "Create Purchase" }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <DeleteConfirmModal v-if="!isReadOnly && purchasePendingDelete" @cancel="cancelDelete" @confirm="removePurchase" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../../Components/RoleSidebar.vue";
import DeleteConfirmModal from "../Components/DeleteConfirmModal.vue";
import { getAuthHeaders, getCurrentUserId } from "../../utils/auth";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "https://laravel-inventory-management-1.onrender.com").replace(/\/+$/, "");
const purchasesEndpoint = `${apiBaseUrl}/purchases`;
const suppliersEndpoint = `${apiBaseUrl}/suppliers`;
const usersEndpoint = `${apiBaseUrl}/users`;
const route = useRoute();
const isReadOnly = computed(() => Boolean(route.meta.readOnly));
const showAuditColumns = computed(() => route.path.startsWith("/admin/"));

const purchases = ref([]);
const supplierOptions = ref([]);
const userOptions = ref([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const errorMessage = ref("");
const saveError = ref("");
const searchQuery = ref("");
const dateFilter = ref("");
const statusFilter = ref("");
const purchasePendingDelete = ref(null);
const showModal = ref(false);
const modalMode = ref("add");
const editingPurchaseId = ref(null);

const todayDate = () => new Date().toISOString().slice(0, 10);

const purchaseStatusOptions = [
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
];

const purchaseStatusLabels = purchaseStatusOptions.reduce((labels, status) => ({
  ...labels,
  [status.value]: status.label,
}), {});

const toApiStatus = (status) => {
  const normalized = String(status || "completed").trim().toLowerCase();

  if (["cancel", "cancelled", "canceled"].includes(normalized)) {
    return "canceled";
  }

  return "completed";
};

const toDisplayStatus = (status) => purchaseStatusLabels[toApiStatus(status)] || "Completed";

const defaultPurchaseForm = () => ({
  supplierId: "",
  userId: getCurrentUserId(),
  purchaseNo: "",
  purchaseDate: todayDate(),
  totalAmount: 0,
  status: "completed",
  note: "",
});

const purchaseForm = ref(defaultPurchaseForm());
const isEditing = computed(() => editingPurchaseId.value !== null);
const isViewing = computed(() => modalMode.value === "view");

const unwrapCollection = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[key]?.data)) return payload[key].data;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const getResponseMessage = (data, fallback) => {
  const validationMessages = Object.values(data?.errors || {}).flat();

  if (validationMessages.length) {
    return validationMessages.join(" ");
  }

  return data?.message || data?.error || fallback;
};

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

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const toDateInput = (value) => {
  if (!value) return todayDate();

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

  return date.toISOString().slice(0, 10);
};

const normalizeStatus = toDisplayStatus;

const getSupplierName = (supplierOrId) => {
  if (supplierOrId && typeof supplierOrId === "object") {
    return supplierOrId.sup_name || supplierOrId.company || supplierOrId.supplier_name || supplierOrId.name || `Supplier #${supplierOrId.id || ""}`;
  }

  const supplier = supplierOptions.value.find((option) => Number(option.id) === Number(supplierOrId));
  return supplier?.name || (supplierOrId ? `Supplier #${supplierOrId}` : "-");
};

const getUserName = (userOrId) => {
  if (userOrId && typeof userOrId === "object") {
    return userOrId.name || userOrId.username || userOrId.email || `User #${userOrId.id || ""}`;
  }

  const user = userOptions.value.find((option) => Number(option.id) === Number(userOrId));
  return user?.name || (userOrId ? `User #${userOrId}` : "-");
};

const getAuditUser = (purchase, key) => {
  const relationKey = key === "created_by" ? "creator" : "updater";
  return getUserName(purchase[relationKey] || purchase[key]);
};

const normalizePurchase = (purchase, index) => {
  const supplierName = getSupplierName(purchase.supplier || purchase.supplier_id);

  return {
    id: purchase.id ?? index + 1,
    supplierId: purchase.supplier_id || purchase.supplier?.id || "",
    supplierName,
    supplierInitial: supplierName.charAt(0).toUpperCase() || "S",
    userId: purchase.user_id || "",
    userName: getUserName(purchase.user || purchase.user_id),
    createdBy: getAuditUser(purchase, "created_by"),
    updatedBy: getAuditUser(purchase, "updated_by"),
    purchaseNo: purchase.purchase_no || `PUR-${purchase.id ?? index + 1}`,
    purchaseDate: purchase.purchase_date || "",
    dateText: formatDate(purchase.purchase_date),
    totalAmount: Number(purchase.total_amount || 0),
    status: normalizeStatus(purchase.pur_status),
    note: purchase.pur_note || "-",
    createdAtRaw: purchase.created_at || "",
    updatedAtRaw: purchase.updated_at || "",
    createdAt: formatDate(purchase.created_at),
    updatedAt: formatDate(purchase.updated_at),
  };
};

const fetchSuppliers = async () => {
  try {
    const response = await fetch(suppliersEndpoint, { headers: getAuthHeaders() });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) return;

    supplierOptions.value = unwrapCollection(data, "suppliers").map((supplier) => ({
      id: supplier.id,
      name: supplier.sup_name || supplier.company || supplier.supplier_name || supplier.name || `Supplier #${supplier.id}`,
    }));
  } catch (error) {
    console.error("Fetch suppliers for purchases failed:", error);
  }
};

const fetchUsers = async () => {
  try {
    const response = await fetch(usersEndpoint, { headers: getAuthHeaders() });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) return;

    userOptions.value = unwrapCollection(data, "users").map((user) => ({
      id: user.id,
      name: user.name || user.username || user.full_name || user.account_name || user.email || `User #${user.id}`,
    }));
  } catch (error) {
    console.error("Fetch users for purchases failed:", error);
  }
};

const fetchPurchases = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch(purchasesEndpoint, { headers: getAuthHeaders() });
    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(getResponseMessage(data, "Could not load purchases."));
    }

    purchases.value = unwrapCollection(data, "purchases").map(normalizePurchase);
  } catch (error) {
    console.error("Fetch purchases failed:", error);
    errorMessage.value = error.message || "Could not load purchases.";
  } finally {
    loading.value = false;
  }
};

const filteredPurchases = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();

  return purchases.value.filter((purchase) => {
    const matchKeyword =
      !keyword ||
      [
        purchase.purchaseNo,
        purchase.supplierName,
        purchase.userName,
        purchase.status,
        purchase.note,
        purchase.createdBy,
        purchase.updatedBy,
      ].some((value) => String(value || "").toLowerCase().includes(keyword));
    const matchDate = !dateFilter.value || [purchase.createdAtRaw, purchase.updatedAtRaw]
      .some((date) => String(date || "").slice(0, 10) === dateFilter.value);
    const matchStatus = !statusFilter.value || purchase.status === statusFilter.value;

    return matchKeyword && matchDate && matchStatus;
  });
});

const statusOptions = computed(() => {
  return [...new Set(purchases.value.map((purchase) => purchase.status).filter(Boolean))];
});

const summaryCards = computed(() => {
  const totalPurchases = purchases.value.length;
  const totalAmount = purchases.value.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const month = new Date().toISOString().slice(0, 7);
  const thisMonthPurchases = purchases.value.filter((purchase) => purchase.purchaseDate?.startsWith(month));
  const thisMonthAmount = thisMonthPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

  return [
    {
      label: "Total Purchases",
      value: totalPurchases.toLocaleString(),
      note: "All time transactions",
      icon: "fa-solid fa-bag-shopping",
      iconWrap: "bg-blue-50 text-[#0d6efd]",
    },
    {
      label: "Total Amount",
      value: `$ ${formatMoney(totalAmount)}`,
      note: "All time amount",
      icon: "fa-solid fa-dollar-sign",
      iconWrap: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "This Month",
      value: thisMonthPurchases.length.toLocaleString(),
      note: "Transactions",
      icon: "fa-solid fa-cart-plus",
      iconWrap: "bg-violet-50 text-violet-500",
    },
    {
      label: "This Month Amount",
      value: `$ ${formatMoney(thisMonthAmount)}`,
      note: "Amount",
      icon: "fa-regular fa-credit-card",
      iconWrap: "bg-orange-50 text-orange-500",
    },
  ];
});

const resetModal = () => {
  purchaseForm.value = defaultPurchaseForm();
  editingPurchaseId.value = null;
  modalMode.value = "add";
  saveError.value = "";
};

const fillForm = (purchase) => {
  purchaseForm.value = {
    supplierId: purchase.supplierId || "",
    userId: purchase.userId || getCurrentUserId(),
    purchaseNo: purchase.purchaseNo || "",
    purchaseDate: toDateInput(purchase.purchaseDate),
    totalAmount: Number(purchase.totalAmount || 0),
    status: toApiStatus(purchase.status),
    note: purchase.note === "-" ? "" : purchase.note || "",
  };
};

const openAddModal = () => {
  resetModal();
  showModal.value = true;
};

const openEditModal = (purchase) => {
  fillForm(purchase);
  editingPurchaseId.value = purchase.id;
  modalMode.value = "edit";
  saveError.value = "";
  showModal.value = true;
};

const openViewModal = (purchase) => {
  fillForm(purchase);
  editingPurchaseId.value = purchase.id;
  modalMode.value = "view";
  saveError.value = "";
  showModal.value = true;
};

const closeModal = () => {
  if (saving.value) return;
  showModal.value = false;
  resetModal();
};

const buildPurchaseFormData = (editing) => {
  const formData = new FormData();
  const currentUserId = getCurrentUserId();
  const userId = purchaseForm.value.userId || currentUserId;

  formData.append("supplier_id", purchaseForm.value.supplierId);
  formData.append("user_id", userId || "");
  formData.append("purchase_no", purchaseForm.value.purchaseNo);
  formData.append("purchase_date", purchaseForm.value.purchaseDate);
  formData.append("total_amount", purchaseForm.value.totalAmount || 0);
  formData.append("pur_status", toApiStatus(purchaseForm.value.status));
  formData.append("pur_note", purchaseForm.value.note?.trim() || "-");

  if (editing) {
    if (currentUserId) formData.append("updated_by", currentUserId);
    formData.append("_method", "PUT");
  } else if (currentUserId) {
    formData.append("created_by", currentUserId);
    formData.append("updated_by", currentUserId);
  }

  return formData;
};

const savePurchase = async () => {
  if (isViewing.value) return;

  saving.value = true;
  saveError.value = "";
  errorMessage.value = "";

  try {
    const editing = isEditing.value;
    const url = editing ? `${purchasesEndpoint}/${editingPurchaseId.value}` : purchasesEndpoint;
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: buildPurchaseFormData(editing),
    });
    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(getResponseMessage(data, editing ? "Could not update purchase." : "Could not create purchase."));
    }

    showModal.value = false;
    resetModal();
    await fetchPurchases();
  } catch (error) {
    console.error("Save purchase failed:", error);
    const message = error.message || "Could not save purchase.";
    saveError.value = message;
    errorMessage.value = message;
  } finally {
    saving.value = false;
  }
};

const askDelete = (purchase) => {
  purchasePendingDelete.value = purchase;
};

const cancelDelete = () => {
  if (deletingId.value) return;
  purchasePendingDelete.value = null;
};

const removePurchase = async () => {
  if (!purchasePendingDelete.value) return;

  deletingId.value = purchasePendingDelete.value.id;
  errorMessage.value = "";

  try {
    const response = await fetch(`${purchasesEndpoint}/${purchasePendingDelete.value.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getResponseMessage(data, "Could not delete purchase."));
    }

    purchases.value = purchases.value.filter((purchase) => purchase.id !== purchasePendingDelete.value.id);
    purchasePendingDelete.value = null;
  } catch (error) {
    console.error("Delete purchase failed:", error);
    errorMessage.value = error.message || "Could not delete purchase.";
  } finally {
    deletingId.value = null;
  }
};

const purchaseStatusClass = (status) => {
  return toApiStatus(status) === "completed"
    ? "bg-emerald-100 text-emerald-600"
    : "bg-red-100 text-red-500";
};

const clearFilters = () => {
  searchQuery.value = "";
  dateFilter.value = "";
  statusFilter.value = "";
};

onMounted(async () => {
  await Promise.all([fetchSuppliers(), fetchUsers()]);
  await fetchPurchases();
});
</script>





