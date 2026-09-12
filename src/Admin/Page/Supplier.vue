<template>
  <div class="flex min-h-screen bg-[#f6f9ff] text-[#10234d]">
    <Sidebar page-key="suppliers" />
    <main class="min-w-0 flex-1 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">
            {{ isReadOnly ? "Supplier List" : "Suppliers" }}
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            {{ isReadOnly ? "View supplier information and purchasing partners" : "Manage supplier information and purchasing partners" }}
          </p>
        </div>

        <button
          v-if="!isReadOnly"
          type="button"
          class="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-blue-700"
          @click="openAddModal"
        >
          <i class="fa-solid fa-plus"></i>
          Add Supplier
        </button>
      </div>

      <div class="grid mt-5 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="card in cards" :key="card.title"
          class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-slate-500">
                {{ card.title }}
              </p>

              <h3 class="mt-2 text-3xl font-bold text-slate-800">
                {{ card.value }}
              </h3>

              <span class="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="card.badgeClass">
                {{ card.subtext }}
              </span>
            </div>

            <div class="flex h-14 w-14 items-center justify-center rounded-2xl" :class="card.iconBg">
              <i :class="card.icon" class="fa-solid text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5 px-5 pb-5">
        <div class="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(300px,1.5fr)_180px_minmax(220px,1fr)_46px]">
          <label class="relative min-w-0 md:col-span-2 xl:col-span-1">
            <span class="sr-only">Search suppliers</span>
            <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search name, email, phone, or address"
              class="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label class="relative min-w-0">
            <span class="sr-only">Filter by status</span>
            <select
              v-model="statusFilter"
              class="h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>

          <label class="relative min-w-0">
            <span class="sr-only">Filter by address</span>
            <select
              v-model="addressFilter"
              class="h-11 w-full cursor-pointer truncate rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All addresses</option>
              <option v-for="address in addressOptions" :key="address" :value="address">
                {{ address }}
              </option>
            </select>
          </label>

          <button
            type="button"
            class="grid h-11 w-full place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 md:col-span-2 xl:col-span-1 xl:w-11"
            :disabled="!searchQuery && !statusFilter && !addressFilter"
            aria-label="Clear filters"
            title="Clear filters"
            @click="clearFilters"
          >
            <i class="fa-solid fa-rotate-left text-sm"></i>
          </button>
        </div>

        <div class="admin-table-scroll mt-5 max-h-[640px] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table class="admin-data-table w-full min-w-[1780px] table-fixed border-separate border-spacing-0">
            <thead class="sticky top-0 z-10 bg-slate-50">
              <tr class="text-left text-sm text-slate-500">
                <th class="w-[72px] px-6 py-4 text-center">No</th>
                <th class="w-[260px] px-6 py-4">Supplier</th>
                <th class="w-[150px] px-6 py-4">Phone</th>
                <th class="w-[190px] px-6 py-4">Address</th>
                <th class="w-[120px] px-6 py-4">Status</th>
                <th class="w-[230px] px-6 py-4">Created At</th>
                <th class="w-[230px] px-6 py-4">Updated At</th>
                <th class="w-[170px] px-6 py-4">Created By</th>
                <th class="w-[170px] px-6 py-4">Updated By</th>
                <th class="w-[188px] px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading">
                <td colspan="10" class="border-t border-slate-100 px-6 py-10 text-center text-sm font-bold text-slate-500">
                  <i class="fa-solid fa-spinner mr-2 animate-spin"></i>
                  Loading suppliers...
                </td>
              </tr>
              <tr v-else-if="errorMessage">
                <td colspan="10" class="border-t border-slate-100 px-6 py-10 text-center text-sm font-bold text-red-500">
                  {{ errorMessage }}
                </td>
              </tr>
              <tr v-else-if="filteredSuppliers.length === 0">
                <td colspan="10" class="border-t border-slate-100 px-6 py-10 text-center text-sm font-bold text-slate-500">
                  No suppliers found.
                </td>
              </tr>
              <template v-else>
                <tr v-for="(supplier, index) in filteredSuppliers" :key="supplier.id" class="hover:bg-slate-50">
                  <td class="px-6 py-4 text-center font-medium text-slate-600">
                    {{ index + 1 }}
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                        {{ supplier.avatar }}
                      </div>

                      <div class="min-w-0">
                        <p class="font-medium text-slate-800">
                          {{ supplier.company }}
                        </p>

                        <p class="truncate text-sm text-slate-500">
                          {{ supplier.email }}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td class="px-6 py-4 text-slate-600">
                    {{ supplier.phone }}
                  </td>

                  <td class="truncate px-6 py-4">
                    {{ supplier.address }}
                  </td>

                  <td class="px-6 py-4">
                    <span class="rounded-full px-3 py-1 text-xs font-medium" :class="supplier.status === 'Active'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                      ">
                      {{ supplier.status }}
                    </span>
                  </td>

                  <td class="whitespace-nowrap px-6 py-4 text-slate-600">
                    {{ supplier.createdAt }}
                  </td>

                  <td class="whitespace-nowrap px-6 py-4 text-slate-600">
                    {{ supplier.updatedAt }}
                  </td>

                  <td class="truncate px-6 py-4 text-slate-600">
                    {{ supplier.createdBy }}
                  </td>

                  <td class="truncate px-6 py-4 text-slate-600">
                    {{ supplier.updatedBy }}
                  </td>

                  <td class="px-6 py-4">
                    <div class="flex justify-center gap-2">
                      <button
                        type="button"
                        class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:scale-105"
                        aria-label="View supplier"
                        @click="openViewModal(supplier)"
                      >
                        <i class="fa-solid fa-eye"></i>
                      </button>

                      <button
                        v-if="!isReadOnly"
                        type="button"
                        class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:scale-105"
                        aria-label="Edit supplier"
                        @click="openEditModal(supplier)"
                      >
                        <i class="fa-solid fa-pen"></i>
                      </button>

                      <button
                        v-if="!isReadOnly"
                        class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
                        :disabled="deletingId === supplier.id"
                        @click="askDelete(supplier)">
                        <i v-if="deletingId === supplier.id" class="fa-solid fa-spinner animate-spin"></i>
                        <i v-else class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

        </div>
        <div class="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p class="text-sm text-slate-500">
            Showing {{ filteredSuppliers.length ? 1 : 0 }}-{{ filteredSuppliers.length }} of {{ suppliers.length }} suppliers
          </p>


        </div>
      </div>
    </main>

    <div v-if="showModal" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
      <section class="flex max-h-[calc(100vh-48px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-lg font-bold text-slate-800">
              {{ modalMode === "view" ? "Supplier Details" : isEditing ? "Edit Supplier" : "Add Supplier" }}
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ modalMode === "view" ? "View supplier information" : isEditing ? "Update supplier information" : "Create a new purchasing partner" }}
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

        <form class="supplier-form grid min-h-0 gap-4 overflow-y-auto px-6 py-4" autocomplete="on" @submit.prevent="saveSupplier">
          <p v-if="saveError" class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {{ saveError }}
          </p>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2 text-sm font-bold text-slate-700">
              Company Name
              <input
                v-model="supplierForm.company"
                name="sup_name"
                type="text"
                autocomplete="organization"
                required
                :readonly="isViewing"
                class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#1e293b] placeholder:text-slate-400 outline-none focus:border-blue-500 read-only:bg-slate-50"
                placeholder="Tech Supplier Co."
              />
            </label>

            <label class="grid gap-2 text-sm font-bold text-slate-700">
              Email
              <input
                v-model="supplierForm.email"
                name="sup_email"
                type="email"
                autocomplete="email"
                required
                :readonly="isViewing"
                class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#1e293b] placeholder:text-slate-400 outline-none focus:border-blue-500 read-only:bg-slate-50"
                placeholder="supplier@example.com"
              />
            </label>

            <label class="grid gap-2 text-sm font-bold text-slate-700">
              Phone
              <input
                v-model="supplierForm.phone"
                name="sup_phone"
                type="text"
                autocomplete="tel"
                required
                :readonly="isViewing"
                class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#1e293b] placeholder:text-slate-400 outline-none focus:border-blue-500 read-only:bg-slate-50"
                placeholder="+855 12 345 678"
              />
            </label>

            <label class="grid gap-2 text-sm font-bold text-slate-700">
              Address
              <input
                v-model="supplierForm.address"
                name="address"
                type="text"
                autocomplete="street-address"
                required
                :readonly="isViewing"
                class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#1e293b] placeholder:text-slate-400 outline-none focus:border-blue-500 read-only:bg-slate-50"
                placeholder="Phnom Penh"
              />
            </label>

            <label class="grid gap-2 text-sm font-bold text-slate-700">
              Status
              <select
                v-model="supplierForm.status"
                name="status"
                :disabled="isViewing"
                class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#1e293b] outline-none focus:border-blue-500 disabled:bg-slate-50"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>

          </div>

          <footer class="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              class="h-10 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              @click="closeModal"
            >
              {{ isViewing ? "Close" : "Cancel" }}
            </button>

            <button
              v-if="!isViewing"
              type="submit"
              :disabled="saving"
              class="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <i v-if="saving" class="fa-solid fa-spinner animate-spin text-xs"></i>
              {{ saving ? "Saving..." : isEditing ? "Update Supplier" : "Save Supplier" }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <DeleteConfirmModal
      v-if="!isReadOnly && supplierPendingDelete"
      :loading="deletingId === supplierPendingDelete.id"
      @cancel="cancelDelete"
      @confirm="removeSupplier"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../../Components/RoleSidebar.vue";
import DeleteConfirmModal from "../Components/DeleteConfirmModal.vue";
import { getAuthHeaders, getCurrentUserId } from "../../utils/auth";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "https://laravel-inventory-management-2.onrender.com").replace(/\/+$/, "");
const suppliersEndpoint = `${apiBaseUrl}/suppliers`;
const usersEndpoint = `${apiBaseUrl}/users`;
const route = useRoute();
const isReadOnly = computed(() => Boolean(route.meta.readOnly));

const suppliers = ref([]);
const userOptions = ref([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const errorMessage = ref("");
const saveError = ref("");
const searchQuery = ref("");
const statusFilter = ref("");
const addressFilter = ref("");
const supplierPendingDelete = ref(null);
const showModal = ref(false);
const modalMode = ref("add");
const editingSupplierId = ref(null);

const defaultSupplierForm = () => ({
  company: "",
  email: "",
  phone: "",
  address: "",
  userId: getCurrentUserId(),
  status: "Active",
});

const supplierForm = ref(defaultSupplierForm());
const isEditing = computed(() => editingSupplierId.value !== null);
const isViewing = computed(() => modalMode.value === "view");

const unwrapSuppliers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.suppliers?.data)) return payload.suppliers.data;
  if (Array.isArray(payload?.suppliers)) return payload.suppliers;
  return [];
};

const unwrapCollection = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[key]?.data)) return payload[key].data;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const unwrapUsers = (payload) => {
  return unwrapCollection(payload, "users");
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

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    };
  }
};

const getInitials = (name) => {
  return String(name || "Supplier")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "S";
};

const normalizeStatus = (value) => {
  return String(value || "active").toLowerCase() === "inactive" ? "Inactive" : "Active";
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
    return matchedUser?.name || `User #${user}`;
  }

  return (
    user.name ||
    user.username ||
    user.full_name ||
    user.account_name ||
    user.email ||
    (user.id ? `User #${user.id}` : fallback)
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

const normalizeSupplier = (supplier, index) => {
  const company =
    supplier.sup_name ||
    `Supplier #${supplier.id ?? index + 1}`;

  return {
    id: supplier.id ?? index + 1,
    avatar: getInitials(company),
    company,
    email: supplier.sup_email || "-",
    phone: supplier.sup_phone || "-",
    address: supplier.address || "-",
    userId: supplier.user_id || "",
    createdAt: formatDate(supplier.created_at),
    updatedAt: formatDate(supplier.updated_at),
    createdBy: getAuditUser(supplier, "created_by"),
    updatedBy: getAuditUser(supplier, "updated_by"),
    status: normalizeStatus(supplier.status),
  };
};

const fillSupplierForm = (supplier) => {
  supplierForm.value = {
    company: supplier.company === "-" ? "" : supplier.company,
    email: supplier.email === "-" ? "" : supplier.email,
    phone: supplier.phone === "-" ? "" : supplier.phone,
    address: supplier.address === "-" ? "" : supplier.address,
    userId: supplier.userId || getCurrentUserId(),
    status: supplier.status,
  };
};

const resetModal = () => {
  supplierForm.value = defaultSupplierForm();
  editingSupplierId.value = null;
  modalMode.value = "add";
  saveError.value = "";
};

const openAddModal = () => {
  resetModal();
  showModal.value = true;
};

const openEditModal = (supplier) => {
  fillSupplierForm(supplier);
  editingSupplierId.value = supplier.id;
  modalMode.value = "edit";
  saveError.value = "";
  showModal.value = true;
};

const openViewModal = (supplier) => {
  fillSupplierForm(supplier);
  editingSupplierId.value = supplier.id;
  modalMode.value = "view";
  saveError.value = "";
  showModal.value = true;
};

const closeModal = () => {
  if (saving.value) return;

  showModal.value = false;
  resetModal();
};

const buildSupplierFormData = (editing) => {
  const formData = new FormData();
  const currentUserId = getCurrentUserId();
  const status = supplierForm.value.status.toLowerCase();

  formData.append("sup_name", supplierForm.value.company);
  formData.append("sup_phone", supplierForm.value.phone);
  formData.append("sup_email", supplierForm.value.email);
  formData.append("address", supplierForm.value.address);
  formData.append("user_id", supplierForm.value.userId || currentUserId);
  formData.append("status", status);

  if (editing) {
    if (currentUserId) {
      formData.append("updated_by", currentUserId);
    }
    formData.append("_method", "PUT");
  } else if (currentUserId) {
    formData.append("created_by", currentUserId);
    formData.append("updated_by", currentUserId);
  }

  return formData;
};

const saveSupplier = async () => {
  if (isViewing.value) return;

  saving.value = true;
  saveError.value = "";
  errorMessage.value = "";

  try {
    const editing = isEditing.value;
    const url = editing ? `${suppliersEndpoint}/${editingSupplierId.value}` : suppliersEndpoint;
    const formData = buildSupplierFormData(editing);

    showModal.value = false;
    resetModal();

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(getResponseMessage(data, editing ? "Could not update supplier." : "Could not create supplier."));
    }

    await fetchSuppliers();
  } catch (error) {
    console.error("Save supplier failed:", error);
    errorMessage.value = error.message || "Could not save supplier.";
  } finally {
    saving.value = false;
  }
};

const fetchSuppliers = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch(suppliersEndpoint, {
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getResponseMessage(data, "Could not load suppliers."));
    }

    suppliers.value = unwrapSuppliers(data).map(normalizeSupplier);
  } catch (error) {
    console.error("Fetch suppliers failed:", error);
    errorMessage.value = error.message || "Could not load suppliers.";
  } finally {
    loading.value = false;
  }
};

const fetchUsers = async () => {
  try {
    const response = await fetch(usersEndpoint, {
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) return;

    userOptions.value = unwrapUsers(data).map((user) => ({
      id: user.id,
      name: user.name || user.username || user.full_name || user.account_name || user.email || `User #${user.id}`,
    }));
  } catch (error) {
    console.error("Fetch users for suppliers failed:", error);
  }
};

const filteredSuppliers = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();

  return suppliers.value.filter((supplier) => {
    const matchKeyword =
      !keyword ||
      [supplier.company, supplier.email, supplier.phone, supplier.address, supplier.userId]
        .some((value) => String(value || "").toLowerCase().includes(keyword));
    const matchStatus = !statusFilter.value || supplier.status === statusFilter.value;
    const matchAddress = !addressFilter.value || supplier.address === addressFilter.value;

    return matchKeyword && matchStatus && matchAddress;
  });
});

const addressOptions = computed(() => {
  return [...new Set(suppliers.value.map((supplier) => supplier.address).filter((address) => address && address !== "-"))].sort();
});

const cards = computed(() => {
  const totalSuppliers = suppliers.value.length;
  const activeSuppliers = suppliers.value.filter((supplier) => supplier.status === "Active").length;
  const inactiveSuppliers = suppliers.value.filter((supplier) => supplier.status === "Inactive").length;
  const addresses = new Set(suppliers.value.map((supplier) => supplier.address).filter((address) => address && address !== "-")).size;

  return [
    {
      title: "Total Suppliers",
      value: totalSuppliers,
      subtext: "All suppliers",
      icon: "fa-users text-blue-600",
      iconBg: "bg-blue-100",
      badgeClass: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Suppliers",
      value: activeSuppliers,
      subtext: `${totalSuppliers ? Math.round((activeSuppliers / totalSuppliers) * 100) : 0}% Active`,
      icon: "fa-circle-check text-green-600",
      iconBg: "bg-green-100",
      badgeClass: "bg-green-100 text-green-600",
    },
    {
      title: "Inactive",
      value: inactiveSuppliers,
      subtext: "Need Review",
      icon: "fa-user-slash text-red-600",
      iconBg: "bg-red-100",
      badgeClass: "bg-red-100 text-red-600",
    },
    {
      title: "Addresses",
      value: addresses,
      subtext: "Supplier locations",
      icon: "fa-location-dot text-purple-600",
      iconBg: "bg-purple-100",
      badgeClass: "bg-purple-100 text-purple-600",
    },
  ];
});

const askDelete = (supplier) => {
  supplierPendingDelete.value = supplier;
};

const cancelDelete = () => {
  if (deletingId.value) return;

  supplierPendingDelete.value = null;
};

const removeSupplier = async () => {
  if (!supplierPendingDelete.value) return;

  deletingId.value = supplierPendingDelete.value.id;
  errorMessage.value = "";

  try {
    const response = await fetch(`${suppliersEndpoint}/${supplierPendingDelete.value.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getResponseMessage(data, "Could not delete supplier."));
    }

    suppliers.value = suppliers.value.filter(
      (supplier) => supplier.id !== supplierPendingDelete.value.id
    );
    supplierPendingDelete.value = null;
  } catch (error) {
    console.error("Delete supplier failed:", error);
    errorMessage.value = error.message || "Could not delete supplier.";
  } finally {
    deletingId.value = null;
  }
};

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "";
  addressFilter.value = "";
};

onMounted(async () => {
  await fetchUsers();
  fetchSuppliers();
});
</script>

<style scoped>
.supplier-form {
  color-scheme: light;
}

.supplier-form input,
.supplier-form input:focus,
.supplier-form select,
.supplier-form select:focus {
  background-color: #ffffff !important;
  color: #1e293b !important;
}

.supplier-form input::placeholder {
  color: #94a3b8 !important;
  opacity: 1;
}

.supplier-form input:-webkit-autofill,
.supplier-form input:-webkit-autofill:hover,
.supplier-form input:-webkit-autofill:focus,
.supplier-form input:-webkit-autofill:active {
  background-color: #ffffff !important;
  background-image: none !important;
  color: #1e293b !important;
  -webkit-text-fill-color: #1e293b !important;
  caret-color: #1e293b !important;
  box-shadow: 0 0 0 1000px #ffffff inset !important;
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
  transition: background-color 9999s ease-out;
}
</style>
