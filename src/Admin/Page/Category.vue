<template>
  <div class="flex min-h-screen bg-[#f6f9ff] text-[#10234d]">
    <Sidebar page-key="categories" />

    <main class="min-w-0 flex-1 px-7 py-6">
      <header class="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-[26px] font-black leading-tight tracking-[-0.01em] text-[#10234d]">
            Categories
          </h1>
          <p class="mt-1 text-[13px] font-semibold text-[#6c7da4]">
            {{ isReadOnly ? "View product categories" : "Manage product categories" }}
          </p>
        </div>

        <button
          v-if="!isReadOnly"
          type="button"
          class="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-[#0d6efd] px-5 text-[13px] font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#0b5ed7]"
          @click="openAddModal"
        >
          <i class="fa-solid fa-plus text-[12px]"></i>
          Add Category
        </button>
      </header>

      <section class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="flex min-h-[126px] items-center gap-5 rounded-lg border border-[#dfe7f3] bg-white px-4 py-5 shadow-[0_10px_30px_rgba(15,35,80,0.04)]"
        >
          <span
            class="grid h-[66px] w-[66px] flex-shrink-0 place-items-center rounded-xl text-[29px]"
            :class="card.iconWrap"
          >
            <i :class="card.icon"></i>
          </span>
          <div>
            <p class="text-[12px] font-extrabold text-[#223763]">
              {{ card.label }}
            </p>
            <p class="mt-2 text-[28px] font-black leading-none text-[#10234d]">
              {{ card.value }}
            </p>
            <p class="mt-2 text-[11px] font-semibold text-[#6c7da4]">
              {{ card.note }}
            </p>
          </div>
        </article>
      </section>

      <section class="overflow-hidden rounded-lg border border-[#dfe7f3] bg-white shadow-[0_10px_30px_rgba(15,35,80,0.04)]">
        <div class="flex flex-wrap items-end justify-between gap-4 border-b border-[#e8eef7] px-6 py-5">
          <label class="relative w-full max-w-[410px]">
            <input
              v-model="searchQuery"
              class="h-11 w-full rounded-md border border-[#dbe4f0] bg-white px-4 pr-11 text-[12px] font-semibold text-[#10234d] outline-none transition placeholder:text-[#8a99b8] focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
              placeholder="Search by category name..."
            />
            <i class="fa-solid fa-magnifying-glass pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#6c7da4]"></i>
          </label>

          <div class="flex flex-wrap items-end gap-3">
            <label class="grid gap-1">
              <span class="text-[11px] font-black text-[#223763]">
                Status
              </span>
              <select
                v-model="statusFilter"
                class="h-11 w-[220px] cursor-pointer rounded-md border border-[#dbe4f0] bg-white px-3 text-[12px] font-bold text-[#10234d] outline-none focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
            <button
              type="button"
              class="flex h-11 cursor-pointer items-center gap-2 rounded-md bg-[#0d6efd] px-5 text-[12px] font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#0b5ed7]"
              @click="clearFilters"
            >
              <i class="fa-solid fa-filter-circle-xmark text-[12px]"></i>
              Clear
            </button>
          </div>
        </div>

        <div class="admin-table-scroll max-h-[620px] overflow-auto">
          <table class="admin-data-table w-full min-w-[1720px] table-fixed border-separate border-spacing-0 text-left">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#f8fbff] text-[11px] font-black uppercase tracking-[0.04em] text-[#506283]">
                <th class="w-[60px] border-b border-[#e8eef7] px-6 py-4">NO.</th>
                <th class="w-[80px] border-b border-[#e8eef7] px-6 py-4">Image</th>
                <th class="w-[180px] border-b border-[#e8eef7] px-5 py-4">Category Name</th>
                <th class="w-[300px] border-b border-[#e8eef7] px-5 py-4">Description</th>
                <th class="w-[90px] border-b border-[#e8eef7] px-5 py-4">Products</th>
                <th class="w-[90px] border-b border-[#e8eef7] px-5 py-4">Status</th>
                <th class="w-[180px] border-b border-[#e8eef7] px-5 py-4">Created At</th>
                <th class="w-[180px] border-b border-[#e8eef7] px-5 py-4">Updated At</th>
                <th class="w-[140px] border-b border-[#e8eef7] px-5 py-4">Created By</th>
                <th class="w-[140px] border-b border-[#e8eef7] px-5 py-4">Updated By</th>
                <th v-if="!isReadOnly" class="w-[150px] border-b border-[#e8eef7] px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#edf2f8]">
              <tr v-if="loading">
                <td :colspan="isReadOnly ? 10 : 11" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">
                  <i class="fa-solid fa-spinner mr-2 animate-spin"></i>
                  Loading categories...
                </td>
              </tr>
              <tr v-else-if="errorMessage">
                <td :colspan="isReadOnly ? 10 : 11" class="px-5 py-10 text-center text-[13px] font-bold text-red-500">
                  {{ errorMessage }}
                </td>
              </tr>
              <tr v-else-if="filteredCategories.length === 0">
                <td :colspan="isReadOnly ? 10 : 11" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">
                  No categories found.
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="category in filteredCategories"
                  :key="category.id"
                  class="text-[12px] font-semibold text-[#223763] transition odd:bg-white even:bg-[#fbfdff] hover:bg-blue-50/60"
                >
                  <td class="px-6 py-4 text-[#506283]">
                    {{ category.id }}
                  </td>
                  <td class="px-5 py-4">
                    <span class="grid h-12 w-12 place-items-center overflow-hidden rounded-lg border border-slate-100 bg-[#f1f5fb] shadow-sm">
                      <img :src="category.image" :alt="category.name" class=" object-contain" />
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div>
                      <p class="font-black text-[#223763]">{{ category.name }}</p>
                      <p class="mt-0.5 text-[11px] font-bold text-slate-400">ID: {{ category.id }}</p>
                    </div>
                  </td>
                  <td class="truncate px-5 py-4 text-[#34476d]">
                    {{ category.description }}
                  </td>
                  <td class="px-5 py-4 font-black text-[#223763]">
                    {{ category.products }}
                  </td>
                  <td class="px-5 py-4">
                    <span
                      class="inline-flex h-6 items-center rounded-full px-3 text-[10px] font-black"
                      :class="category.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'"
                    >
                      {{ category.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-[#34476d]">
                    {{ category.createdAt }}
                  </td>
                  <td class="px-5 py-4 text-[#34476d]">
                    {{ category.updatedAt }}
                  </td>
                  <td class="px-5 py-4 text-[#34476d]">
                    {{ category.createdBy }}
                  </td>
                  <td class="px-5 py-4 text-[#34476d]">
                    {{ category.updatedBy }}
                  </td>
                  <td v-if="!isReadOnly" class="px-5 py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        class="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-orange-50 text-orange-500 transition hover:bg-orange-100"
                        aria-label="Edit category"
                        @click="openEditModal(category)"
                      >
                        <i class="fa-solid fa-pen text-[12px]"></i>
                      </button>
                      <button
                        type="button"
                        class="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
                        aria-label="Delete category"
                        :disabled="deletingId === category.id"
                        @click="askDelete(category)"
                      >
                        <i v-if="deletingId === category.id" class="fa-solid fa-spinner animate-spin text-[12px]"></i>
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
            Showing {{ filteredCategories.length ? 1 : 0 }} to {{ filteredCategories.length }} of {{ categories.length }} entries
          </p>
        </footer>
      </section>
    </main>

    <div v-if="!isReadOnly && showModal" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
      <section class="flex max-h-[calc(100vh-48px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-[18px] font-black text-[#10234d]">
              {{ isEditing ? "Edit Category" : "Add Category" }}
            </h2>
            <p class="mt-0.5 text-[12px] font-semibold text-slate-500">
              {{ isEditing ? "Update product category details" : "Create a new product category" }}
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

        <form class="grid min-h-0 gap-4 overflow-y-auto px-6 py-4" @submit.prevent="saveCategory">
          <p v-if="saveError" class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
            {{ saveError }}
          </p>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2 text-[13px] font-black text-[#223763]">
              Category Name
              <input
                v-model="categoryForm.name"
                type="text"
                required
                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                placeholder="Electronics"
              />
            </label>

            <label class="grid gap-2 text-[13px] font-black text-[#223763]">
              Status
              <select
                v-model="categoryForm.status"
                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>

          <label class="grid gap-2 text-[13px] font-black text-[#223763]">
            Description
            <textarea
              v-model="categoryForm.description"
              rows="2"
              class="resize-none rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
              placeholder="Electronic devices and gadgets"
            ></textarea>
          </label>

          <div class="grid gap-2 text-[13px] font-black text-[#223763]">
            Category Image
            <div class="grid gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 sm:grid-cols-[80px_minmax(0,1fr)]">
              <span class="grid h-20 w-20 place-items-center overflow-hidden rounded-lg bg-white shadow-sm">
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="Category preview"
                  class="h-full w-full object-contain"
                />
                <i v-else class="fa-regular fa-image text-3xl text-slate-300"></i>
              </span>

              <div class="min-w-0">
                <input
                  ref="categoryImageInputRef"
                  id="category-image"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageChange"
                />
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-[13px] font-black text-white transition hover:bg-blue-700"
                    @click="openImagePicker"
                  >
                    <i class="fa-solid fa-upload text-[12px]"></i>
                    Choose Image
                  </button>
                  <button
                    v-if="imagePreview"
                    type="button"
                    class="h-10 rounded-lg border border-slate-200 px-4 text-[13px] font-black text-slate-600 transition hover:bg-white"
                    @click="clearImage"
                  >
                    Remove
                  </button>
                </div>
                <p class="mt-2 truncate text-[12px] font-semibold text-slate-500">
                  {{ selectedImageName || "No image selected" }}
                </p>
              </div>
            </div>
          </div>

          <footer class="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              class="h-10 rounded-lg border border-slate-200 px-5 text-[13px] font-black text-slate-600 transition hover:bg-slate-50"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0d6efd] px-5 text-[13px] font-black text-white transition hover:bg-[#0b5ed7] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <i v-if="saving" class="fa-solid fa-spinner animate-spin text-[12px]"></i>
              {{ saving ? "Saving..." : isEditing ? "Update Category" : "Save Category" }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <DeleteConfirmModal
      v-if="!isReadOnly && categoryPendingDelete"
      :loading="deletingId === categoryPendingDelete.id"
      @cancel="cancelDelete"
      @confirm="deleteCategory(categoryPendingDelete)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../../Components/RoleSidebar.vue";
import DeleteConfirmModal from "../Components/DeleteConfirmModal.vue";
import { getAuthHeaders, getCurrentUserId } from "../../utils/auth";

// API
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const categoriesEndpoint = `${apiBaseUrl}/categories`;
const usersEndpoint = `${apiBaseUrl}/users`;
const route = useRoute();
const isReadOnly = computed(() => Boolean(route.meta.readOnly));

const fallbackImage =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// Reactive Variables
const categories = ref([]);
const userOptions = ref([]);

const loading = ref(false);
const saving = ref(false);

const errorMessage = ref("");
const saveError = ref("");

const searchQuery = ref("");
const statusFilter = ref("");

const showModal = ref(false);

const editingCategoryId = ref(null);

const deletingId = ref(null);
const categoryPendingDelete = ref(null);

// image
const selectedImageFile = ref(null);
const imagePreview = ref("");
const existingImageUrl = ref("");
const categoryImageInputRef = ref(null);

// Form
const defaultCategoryForm = () => ({
    name: "",
    description: "",
    status: "Active",
});

const categoryForm = ref(defaultCategoryForm());

// Computed
const isEditing = computed(() => editingCategoryId.value !== null);

const selectedImageName = computed(() => {
    return (
        selectedImageFile.value?.name ||
        (existingImageUrl.value ? "Current Image" : "")
    );
});

// Helper
const formatDate = (date) => {

    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return String(date);

    return parsedDate.toLocaleString(undefined, {
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
        record[`${key.replace("_by", "By")}Name`],
    );
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
            name: user.name || user.username || user.email || `User #${user.id}`,
        }));
    } catch (error) {
        console.error("Fetch users for categories failed:", error);
    }
};

const normalizeCategory = (category) => {
    const image = category.cate_image || category.image || "";
    const status = String(category.status || category.cate_status || "active").toLowerCase();

    return {

        id: category.id,

        name: category.cate_name || category.name || "Unnamed Category",

        description: category.cate_des || category.description || "-",

        image: image
            ? image.startsWith("http") || image.startsWith("blob:")
                ? image
                : `http://127.0.0.1:8000/storage/${image}`
            : fallbackImage,

        status: status === "inactive" ? "Inactive" : "Active",

        createdAt: formatDate(category.created_at),

        updatedAt: formatDate(category.updated_at),

        createdBy: getAuditUser(category, "created_by"),

        updatedBy: getAuditUser(category, "updated_by"),

        products: Array.isArray(category.products)
            ? category.products.length
            : 0,
    };
};

// Fetch Categories
const fetchCategories = async () => {

    loading.value = true;
    errorMessage.value = "";

    try {

        const response = await fetch(categoriesEndpoint, {
            headers: getAuthHeaders(),
        });

        const result = await parseApiResponse(response);

        if (!response.ok) {
            throw new Error(result.message || "Cannot fetch categories.");
        }

        categories.value = unwrapCategories(result).map(normalizeCategory);

    } catch (error) {

        console.error(error);

        errorMessage.value = error.message;

    } finally {

        loading.value = false;

    }
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

const unwrapCategories = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.categories?.data)) return payload.categories.data;
    if (Array.isArray(payload?.categories)) return payload.categories;
    return [];
};

const unwrapUsers = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users?.data)) return payload.users.data;
    if (Array.isArray(payload?.users)) return payload.users;
    return [];
};

const getResponseMessage = (data, fallback) => {
    const validationMessages = Object.values(data?.errors || {}).flat();

    if (validationMessages.length) {
        return validationMessages.join(" ");
    }

    return data?.message || data?.error || fallback;
};

// Open Add Modal
const openAddModal = () => {

    categoryForm.value = defaultCategoryForm();

    editingCategoryId.value = null;

    saveError.value = "";

    selectedImageFile.value = null;

    imagePreview.value = "";

    existingImageUrl.value = "";

    showModal.value = true;
};

// Open Edit Modal
const openEditModal = (category) => {

    categoryForm.value = {

        name: category.name,

        description: category.description,

        status: category.status,

    };

    editingCategoryId.value = category.id;

    existingImageUrl.value = category.image;

    imagePreview.value = category.image;

    selectedImageFile.value = null;

    saveError.value = "";

    showModal.value = true;
};

const resetModalState = () => {
    editingCategoryId.value = null;

    selectedImageFile.value = null;

    existingImageUrl.value = "";

    imagePreview.value = "";

    saveError.value = "";

    categoryForm.value = defaultCategoryForm();

    if (categoryImageInputRef.value) {
        categoryImageInputRef.value.value = "";
    }
};

// Close Modal
const closeModal = () => {

    if (saving.value) return;

    showModal.value = false;

    resetModalState();
};

// Select Image
const openImagePicker = () => {
    categoryImageInputRef.value?.click();
};

const handleImageChange = (event) => {

    const file = event.target.files?.[0];

    if (!file) return;

    selectedImageFile.value = file;

    imagePreview.value = URL.createObjectURL(file);

    event.target.value = "";
};

// Remove Image
const clearImage = () => {

    selectedImageFile.value = null;

    existingImageUrl.value = "";

    imagePreview.value = "";

    if (categoryImageInputRef.value) {
        categoryImageInputRef.value.value = "";
    }
};

// Build FormData
const buildFormData = () => {

    const formData = new FormData();
    const currentUserId = getCurrentUserId();

    formData.append("cate_name", categoryForm.value.name);

    formData.append("cate_des", categoryForm.value.description);

    formData.append("cate_status", categoryForm.value.status.toLowerCase());

    if (selectedImageFile.value) {

        formData.append(
            "cate_image",
            selectedImageFile.value
        );
    }

    if (isEditing.value) {
        if (currentUserId) {
            formData.append("updated_by", currentUserId);
        }
    } else if (currentUserId) {
        formData.append("created_by", currentUserId);
        formData.append("updated_by", currentUserId);
    }

    return formData;
};

// Save Category
const saveCategory = async () => {

    saving.value = true;

    saveError.value = "";

    try {

        const editing = isEditing.value;

        if (!editing && !selectedImageFile.value) {
            throw new Error("Please choose a category image.");
        }

        const url = editing
            ? `${categoriesEndpoint}/${editingCategoryId.value}`
            : categoriesEndpoint;

        const formData = buildFormData();

        // Laravel PUT + FormData
        if (editing) {
            formData.append("_method", "PUT");
        }

        const response = await fetch(url, {

            method: "POST",

            headers: getAuthHeaders(),

            body: formData,

        });

        const result = await parseApiResponse(response);

        if (!response.ok) {

            throw new Error(
                getResponseMessage(result, "Cannot save category.")
            );
        }

        showModal.value = false;

        resetModalState();

        await fetchCategories();

    } catch (error) {

        console.error(error);

        saveError.value = error.message;

    } finally {

        saving.value = false;
    }
};

// Delete Confirmation
const askDelete = (category) => {
    categoryPendingDelete.value = category;
};

const cancelDelete = () => {
    if (deletingId.value) return;

    categoryPendingDelete.value = null;
};

// Delete Category
const deleteCategory = async (category) => {

    deletingId.value = category.id;

    try {

        const response = await fetch(
            `${categoriesEndpoint}/${category.id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders(),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Cannot delete category."
            );
        }

        categories.value = categories.value.filter(
            (item) => item.id !== category.id
        );

        categoryPendingDelete.value = null;

    } catch (error) {

        console.error(error);

        errorMessage.value = error.message;

    } finally {

        deletingId.value = null;
    }
};

const filteredCategories = computed(() => {

    const keyword = searchQuery.value.trim().toLowerCase();

    return categories.value.filter((category) => {

        const matchKeyword =
            !keyword ||
            category.name.toLowerCase().includes(keyword) ||
            category.description.toLowerCase().includes(keyword);

        const matchStatus =
            !statusFilter.value ||
            category.status === statusFilter.value;

        return matchKeyword && matchStatus;
    });

});

const summaryCards = computed(() => {

    const totalCategories = categories.value.length;

    const activeCategories = categories.value.filter(
        (item) => item.status === "Active"
    ).length;

    const inactiveCategories = categories.value.filter(
        (item) => item.status === "Inactive"
    ).length;

    const totalProducts = categories.value.reduce(
        (sum, item) => sum + Number(item.products),
        0
    );

    return [

        {
            label: "Total Categories",
            value: totalCategories,
            note: "All Categories",
            icon: "fa-regular fa-folder",
            iconWrap: "bg-blue-50 text-blue-600",
        },

        {
            label: "Active Categories",
            value: activeCategories,
            note: "Available",
            icon: "fa-solid fa-circle-check",
            iconWrap: "bg-green-50 text-green-600",
        },

        {
            label: "Inactive Categories",
            value: inactiveCategories,
            note: "Disabled",
            icon: "fa-solid fa-box",
            iconWrap: "bg-red-50 text-red-500",
        },

        {
            label: "Products",
            value: totalProducts,
            note: "All Products",
            icon: "fa-solid fa-tag",
            iconWrap: "bg-violet-50 text-violet-600",
        },

    ];
});

const clearFilters = () => {

    searchQuery.value = "";

    statusFilter.value = "";

};

onMounted(async () => {

    await fetchUsers();
    await fetchCategories();

});
</script>
