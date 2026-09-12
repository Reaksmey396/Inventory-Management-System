<template>
    <div class="flex min-h-screen bg-[#f6f9ff] text-[#10234d]">
        <Sidebar page-key="products" />

        <main class="min-w-0 flex-1 bg-gradient-to-br from-[#f3f8ff] via-[#f7fbff] to-[#eef4ff] px-7 py-6">
            <header class="mb-7 flex items-start justify-between gap-4">
                <div>
                    <h1 class="text-[26px] font-black leading-tight tracking-[-0.01em] text-[#10234d]">
                        {{ isReadOnly ? "Stock Status" : "Products" }}
                    </h1>
                    <p class="mt-1 text-[13px] font-semibold text-[#6c7da4]">
                        {{ isReadOnly ? "View current product stock levels and availability" : "Manage all products in your inventory" }}
                    </p>
                </div>

                <button
                    v-if="!isReadOnly"
                    type="button"
                    @click="openAddModal"
                    class="flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-[#0d6efd] px-6 text-[14px] font-black text-white shadow-md shadow-blue-500/20 transition hover:bg-[#0b5ed7]">
                    <i class="fa-solid fa-plus text-[12px]"></i>
                    Add Product
                </button>
            </header>

            <section class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article v-for="card in summaryCards" :key="card.label"
                    class="flex min-h-[126px] items-center gap-5 rounded-lg border border-[#dfe7f3] bg-white px-4 py-5 shadow-[0_10px_30px_rgba(15,35,80,0.04)]">
                    <span class="grid h-[66px] w-[66px] flex-shrink-0 place-items-center rounded-xl text-[29px]"
                        :class="card.iconWrap">
                        <i :class="card.icon"></i>
                    </span>
                    <div>
                        <p class="mb-3 text-[12px] font-extrabold text-[#223763]">
                            {{ card.label }}
                        </p>
                        <p class="mt-2 text-[28px] font-black leading-none text-[#10234d]">
                            {{ card.value }}
                        </p>
                    </div>
                </article>
            </section>

            <section
                class="overflow-hidden rounded-lg border border-[#dfe7f3] bg-white shadow-[0_10px_30px_rgba(15,35,80,0.04)]">
                <div class="grid gap-4 mt-5 mx-3 mb-5 lg:grid-cols-5">
                    <div class="lg:col-span-2">
                        <div class="relative">
                            <input v-model="searchQuery" type="text" placeholder="Search product..."
                                class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-500" />

                            <i
                                class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        </div>
                    </div>

                    <div class="flex gap-5 lg:col-span-3 justify-end">
                        <select
                            v-model="categoryFilter"
                            class="rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:border-blue-500">
                            <option value="">All Categories</option>
                            <option v-for="category in categoryOptions" :key="category" :value="category">
                                {{ category }}
                            </option>
                        </select>

                        <select
                            v-model="statusFilter"
                            class="rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:border-blue-500">
                            <option value="">All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <select
                            v-model="stockStatusFilter"
                            class="rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:border-blue-500">
                            <option value="">All Stock</option>
                            <option>In Stock</option>
                            <option>Low Stock</option>
                            <option>Out of Stock</option>
                        </select>


                        <button
                            type="button"
                            class="rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
                            @click="clearFilters"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div class="admin-table-scroll max-h-[640px] overflow-auto">
                    <table class="admin-data-table w-full min-w-[2360px] table-fixed border-separate border-spacing-0 text-left">
                        <thead class="sticky top-0 z-10">
                            <tr class="bg-[#f5f9ff] text-[12px] font-black uppercase tracking-[0.02em] text-[#315071]">
                                <th class="w-[50px] border-b border-[#e8eef7] px-5 py-4 text-center">
                                    <input type="checkbox" class="h-4 w-4 rounded border-[#cbd7e8]" />
                                </th>
                                <th class="w-[50px] border-b border-[#e8eef7] px-5 py-4 text-center">No</th>
                                <th class="w-[80px] border-b border-[#e8eef7] px-5 py-4">Image</th>
                                <th class="w-[150px] border-b border-[#e8eef7] px-5 py-4">Product</th>
                                <th class="w-[130px] border-b border-[#e8eef7] px-5 py-4">SKU</th>
                                <th class="w-[150px] border-b border-[#e8eef7] px-5 py-4">Category</th>
                                <th class="w-[100px] border-b border-[#e8eef7] px-5 py-4">Supplier</th>
                                <th class="w-[80px] border-b border-[#e8eef7] px-5 py-4">Price</th>
                                <th class="w-[80px] border-b border-[#e8eef7] px-5 py-4">Stock</th>
                                <th class="w-[100px] border-b border-[#e8eef7] px-5 py-4">Status</th>
                                <th class="w-[130px] border-b border-[#e8eef7] px-5 py-4">Stock Status</th>
                                <th class="w-[170px] border-b border-[#e8eef7] px-5 py-4">Created At</th>
                                <th class="w-[170px] border-b border-[#e8eef7] px-5 py-4">Updated At</th>
                                <th class="w-[120px] border-b border-[#e8eef7] px-5 py-4">Created By</th>
                                <th class="w-[120px] border-b border-[#e8eef7] px-5 py-4">Updated By</th>
                                <th class="w-[130px] border-b border-[#e8eef7] px-5 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#edf2f8]">
                            <tr v-if="loading">
                                <td colspan="16" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">
                                    <i class="fa-solid fa-spinner mr-2 animate-spin"></i>
                                    Loading products...
                                </td>
                            </tr>
                            <tr v-else-if="errorMessage">
                                <td colspan="16" class="px-5 py-10 text-center text-[13px] font-bold text-red-500">
                                    {{ errorMessage }}
                                </td>
                            </tr>
                            <tr v-else-if="filteredProducts.length === 0">
                                <td colspan="16" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">
                                    No products found.
                                </td>
                            </tr>
                            <template v-else>
                                <tr v-for="(product, index) in filteredProducts" :key="product.sku || product.id"
                                    class="text-[13px] font-semibold text-[#08284f] transition odd:bg-white even:bg-[#fbfdff] hover:bg-blue-50/60">
                                    <td class="px-6 mx-auto py-4 text-center">
                                        <input type="checkbox" class="h-4 w-4 rounded border-[#cbd7e8]" />
                                    </td>
                                    <td class="px-5 text-center py-4">
                                        {{ index + 1 }}
                                    </td>
                                    <td class="px-5 py-4">
                                        <span
                                            class="grid h-12 w-12 place-items-center overflow-hidden rounded-lg border border-slate-100 bg-[#f1f5fb] shadow-sm">
                                            <img :src="product.image" :alt="product.name" class="h-full w-full object-cover" />
                                        </span>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="min-w-0">
                                            <p class="font-black text-[#223763]">
                                                {{ product.name }}
                                            </p>
                                            <p class="mt-0.5 text-[11px] font-bold text-slate-400">
                                                Barcode: {{ product.barcode || "-" }}
                                            </p>
                                        </div>
                                    </td>
                                    <td class="px-5 py-4 text-[#223763]">
                                        {{ product.sku }}
                                    </td>
                                    <td class="px-5 py-4">
                                        <span class="inline-flex h-6 items-center rounded-full px-3 text-[10px] font-black"
                                            :class="product.categoryClass">
                                            {{ product.category }}
                                        </span>
                                    </td>
                                    <td class="truncate px-5 py-4 text-[#34476d]">
                                        {{ product.supplier }}
                                    </td>
                                    <td class="px-5 py-4 font-black text-[#00a86b]">
                                        $ {{ product.price }}
                                    </td>
                                    <td class="px-5 py-4 font-black text-[#223763]">
                                        {{ product.stock }}
                                    </td>
                                    <td class="px-5 py-4">
                                        <span
                                            class="inline-flex h-6 items-center rounded-full px-3 text-[10px] font-black"
                                            :class="product.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'">
                                            {{ product.status }}
                                        </span>
                                    </td>
                                    <td class="px-5 py-4">
                                        <span class="inline-flex h-6 items-center rounded-full px-3 text-[10px] font-black"
                                            :class="stockStatusClass(product.stockStatus)">
                                            {{ product.stockStatus }}
                                        </span>
                                    </td>
                                    <td class="px-5 py-4 text-[#34476d]">
                                        {{ product.createdAt }}
                                    </td>
                                    <td class="px-5 py-4 text-[#34476d]">
                                        {{ product.updatedAt }}
                                    </td>
                                    <td class="px-5 py-4 text-[#34476d]">
                                        {{ product.createdBy }}
                                    </td>
                                    <td class="px-5 py-4 text-[#34476d]">
                                        {{ product.updatedBy }}
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="flex items-center justify-center gap-2">
                                            <button
                                                v-if="!isReadOnly"
                                                class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-blue-50 text-[#0d6efd] transition hover:bg-blue-100"
                                                aria-label="View product">
                                                <i class="fa-solid fa-eye text-[12px]"></i>
                                            </button>
                                            <button
                                                v-if="!isReadOnly"
                                                class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-orange-50 text-orange-500 transition hover:bg-orange-100"
                                                aria-label="Edit product"
                                                @click="openEditModal(product)">
                                                <i class="fa-solid fa-pen text-[12px]"></i>
                                            </button>
                                            <button
                                                class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
                                                aria-label="Delete product"
                                                :disabled="deletingId === product.id"
                                                @click="askDelete(product)">
                                                <i v-if="deletingId === product.id" class="fa-solid fa-spinner animate-spin text-[12px]"></i>
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
                        Showing {{ filteredProducts.length ? 1 : 0 }} to {{ filteredProducts.length }} of {{ products.length }} entries
                    </p>

                    
                </footer>
            </section>
        </main>

        <div v-if="showAddModal" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
            <section class="flex max-h-[calc(100vh-48px)] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
                <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 class="text-[18px] font-black text-[#10234d]">{{ isEditing ? "Edit Product" : "Add Product" }}</h2>
                        <p class="mt-0.5 text-[12px] font-semibold text-slate-500">
                            {{ isEditing ? "Update inventory product details" : "Create a new inventory product" }}
                        </p>
                    </div>
                    <button
                        type="button"
                        class="grid h-9 w-9 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close modal"
                        @click="closeAddModal"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <form class="grid min-h-0 gap-4 overflow-y-auto px-6 py-4" @submit.prevent="saveProduct">
                    <p v-if="createError" class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
                        {{ createError }}
                    </p>

                    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            Product Name
                            <input
                                v-model="productForm.name"
                                type="text"
                                required
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                                placeholder="Wireless Headphones"
                            />
                        </label>

                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            SKU
                            <input
                                v-model="productForm.sku"
                                type="text"
                                required
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                                placeholder="WH-001"
                            />
                        </label>

                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            Barcode
                            <input
                                v-model="productForm.barcode"
                                type="text"
                                required
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                                placeholder="0123456789012"
                            />
                        </label>

                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            Category
                            <select
                                v-model.number="productForm.categoryId"
                                required
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                            >
                                <option disabled value="">Select category</option>
                                <option v-for="category in availableCategories" :key="category.id" :value="category.id">
                                    {{ category.name }}
                                </option>
                            </select>
                        </label>

                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            Supplier
                            <select
                                v-model.number="productForm.supplierId"
                                required
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                            >
                                <option disabled value="">Select supplier</option>
                                <option v-for="supplier in availableSuppliers" :key="supplier.id" :value="supplier.id">
                                    {{ supplier.name }}
                                </option>
                            </select>
                        </label>

                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            Status
                            <select
                                v-model="productForm.status"
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                            >
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </label>

                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            Cost Price
                            <input
                                v-model.number="productForm.costPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                                placeholder="59.99"
                            />
                        </label>

                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            Sale Price
                            <input
                                v-model.number="productForm.salePrice"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                                placeholder="59.99"
                            />
                        </label>

                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            Stock
                            <input
                                v-model.number="productForm.stock"
                                type="number"
                                min="0"
                                step="1"
                                required
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                                placeholder="25"
                            />
                        </label>

                        <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                            Low Stock Alert
                            <input
                                v-model.number="productForm.lowStock"
                                type="number"
                                min="0"
                                step="1"
                                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                                placeholder="10"
                            />
                        </label>
                    </div>

                    <label class="grid gap-2 text-[13px] font-black text-[#223763]">
                        Description
                        <textarea
                            v-model="productForm.description"
                            rows="2"
                            class="resize-none rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                            placeholder="Product detail or note"
                        ></textarea>
                    </label>

                    <div class="grid gap-2 text-[13px] font-black text-[#223763]">
                        Product Image
                        <div class="grid gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 sm:grid-cols-[80px_minmax(0,1fr)]">
                            <span class="grid h-20 w-20 place-items-center overflow-hidden rounded-lg bg-white shadow-sm">
                                <img
                                    v-if="imagePreview"
                                    :src="imagePreview"
                                    alt="Product preview"
                                    class="h-full w-full object-contain"
                                />
                                <i v-else class="fa-regular fa-image text-3xl text-slate-300"></i>
                            </span>

                            <div class="min-w-0">
                                <input
                                    id="product-image"
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    @change="handleImageChange"
                                />
                                <div class="flex flex-wrap gap-2">
                                    <label
                                        for="product-image"
                                        class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-[13px] font-black text-white transition hover:bg-blue-700"
                                    >
                                        <i class="fa-solid fa-upload text-[12px]"></i>
                                        Choose Image
                                    </label>
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
                            @click="closeAddModal"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            :disabled="creating"
                            class="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0d6efd] px-5 text-[13px] font-black text-white transition hover:bg-[#0b5ed7] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <i v-if="creating" class="fa-solid fa-spinner animate-spin text-[12px]"></i>
                            {{ creating ? "Saving..." : isEditing ? "Update Product" : "Save Product" }}
                        </button>
                    </footer>
                </form>
            </section>
        </div>

        <DeleteConfirmModal
            v-if="!isReadOnly && productPendingDelete"
            :loading="deletingId === productPendingDelete.id"
            @cancel="cancelDelete"
            @confirm="deleteProduct(productPendingDelete)"
        />
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../../Components/RoleSidebar.vue";
import DeleteConfirmModal from "../Components/DeleteConfirmModal.vue";
import { getAuthHeaders, getCurrentUserId } from "../../utils/auth";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "https://laravel-inventory-management-1.onrender.com").replace(/\/+$/, "");
const productsEndpoint = `${apiBaseUrl}/products`;
const categoriesEndpoint = `${apiBaseUrl}/categories`;
const suppliersEndpoint = `${apiBaseUrl}/suppliers`;
const usersEndpoint = `${apiBaseUrl}/users`;
const appBaseUrl = apiBaseUrl.replace(/\/api$/, "");
const route = useRoute();
const isReadOnly = computed(() => Boolean(route.meta.readOnly));

const fallbackImage = "https://cdn-icons-png.flaticon.com/64/679/679720.png";
const products = ref([]);
const availableCategories = ref([]);
const availableSuppliers = ref([]);
const userOptions = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const searchQuery = ref("");
const categoryFilter = ref("");
const statusFilter = ref("");
const stockStatusFilter = ref(route.meta.defaultStockStatus || "");
const showAddModal = ref(false);
const creating = ref(false);
const createError = ref("");
const editingProductId = ref(null);
const deletingId = ref(null);
const productPendingDelete = ref(null);
const selectedImageFile = ref(null);
const imagePreview = ref("");
const existingImageUrl = ref("");
const defaultProductForm = () => ({
    name: "",
    sku: "",
    barcode: "",
    categoryId: "",
    supplierId: "",
    costPrice: 0,
    salePrice: 0,
    stock: 0,
    lowStock: 10,
    description: "",
    status: "Active",
});
const productForm = ref(defaultProductForm());

const selectedImageName = computed(() => selectedImageFile.value?.name || (existingImageUrl.value ? "Current product image" : ""));

const unwrapProducts = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.products?.data)) return payload.products.data;
    if (Array.isArray(payload?.products)) return payload.products;
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

const formatPrice = (value) => {
    const amount = Number(value || 0);
    return amount.toLocaleString(undefined, {
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

const getCategoryName = (product) => {
    return (
        product.category?.cate_name ||
        product.category?.name ||
        product.category_name ||
        product.category ||
        product.type ||
        "Uncategorized"
    );
};

const getSupplierName = (supplier) => {
    if (!supplier) return "-";

    if (typeof supplier === "string" || typeof supplier === "number") {
        if (!Number.isFinite(Number(supplier))) return String(supplier);

        const matchedSupplier = availableSuppliers.value.find((option) => Number(option.id) === Number(supplier));
        return matchedSupplier?.name || "-";
    }

    const matchedSupplier = availableSuppliers.value.find((option) => Number(option.id) === Number(supplier.id));

    return (
        supplier?.supplier_name ||
        supplier?.sup_name ||
        supplier?.company_name ||
        supplier?.company ||
        supplier?.name ||
        matchedSupplier?.name ||
        `Supplier #${supplier?.id || ""}`
    );
};

const getStockValue = (product) => {
    return Number(
        product.stock_qty ??
        product.stock ??
        product.quantity ??
        product.qty ??
        product.amount ??
        product.current_stock ??
        0
    );
};

const getStockStatus = (stock, lowStock = 10) => {
    if (stock <= 0) return "Out of Stock";
    if (stock <= lowStock) return "Low Stock";
    return "In Stock";
};

const normalizeStatus = (value) => {
    return String(value || "active").toLowerCase() === "inactive" ? "Inactive" : "Active";
};

const resolveImageUrl = (image, fallback = fallbackImage) => {
    if (!image) return fallback;

    const imagePath = String(image).trim();

    if (!imagePath) return fallback;
    if (/^(https?:|blob:|data:)/i.test(imagePath)) return imagePath;

    const cleanPath = imagePath.replace(/^\/+/, "");
    return `${appBaseUrl}/${cleanPath.startsWith("storage/") ? cleanPath : `storage/${cleanPath}`}`;
};

const categoryClass = (category) => {
    const normalized = String(category).toLowerCase();

    if (normalized.includes("electronic")) return "bg-blue-100 text-[#0d6efd]";
    if (normalized.includes("office")) return "bg-violet-100 text-violet-500";
    if (normalized.includes("furniture")) return "bg-orange-100 text-orange-500";
    if (normalized.includes("accessor")) return "bg-red-100 text-red-500";

    return "bg-slate-100 text-slate-600";
};

const normalizeProduct = (product, index) => {
    const stock = getStockValue(product);
    const lowStock = Number(product.low_stock ?? 10);
    const category = getCategoryName(product);

    return {
        id: product.id ?? index + 1,
        categoryId: product.category_id ?? product.category?.id ?? "",
        supplierId: product.supplier_id ?? product.supplier?.id ?? "",
        name: product.name || product.product_name || product.title || "Unnamed Product",
        barcode: product.barcode || "",
        sku: product.sku || product.code || product.product_code || `PRD-${product.id ?? index + 1}`,
        category,
        supplier: getSupplierName(product.supplier || product.supplier_id),
        categoryClass: categoryClass(category),
        price: formatPrice(product.sale_price ?? product.price ?? product.unit_price ?? product.cost ?? 0),
        rawPrice: Number(product.sale_price ?? product.price ?? product.unit_price ?? product.cost ?? 0),
        costPrice: Number(product.cost_price ?? product.cost ?? 0),
        stock,
        lowStock,
        description: product.pro_des || product.description || "",
        status: normalizeStatus(product.status || (product.is_active === false ? "inactive" : "active")),
        stockStatus: product.stock_status || getStockStatus(stock, lowStock),
        createdAt: formatDate(product.created_at),
        updatedAt: formatDate(product.updated_at),
        createdBy: getAuditUser(product, "created_by"),
        updatedBy: getAuditUser(product, "updated_by"),
        image: resolveImageUrl(product.pro_image || product.image || product.image_url || product.photo || product.thumbnail),
    };
};

const getResponseMessage = (data, fallback) => {
    const validationMessages = Object.values(data?.errors || {}).flat();

    if (validationMessages.length) {
        return validationMessages.join(" ");
    }

    return (
        data?.message ||
        data?.error ||
        data?.errors?.name?.[0] ||
        data?.errors?.product_name?.[0] ||
        data?.errors?.sku?.[0] ||
        data?.errors?.barcode?.[0] ||
        data?.errors?.category_id?.[0] ||
        data?.errors?.supplier_id?.[0] ||
        data?.errors?.cost_price?.[0] ||
        data?.errors?.sale_price?.[0] ||
        data?.errors?.stock_qty?.[0] ||
        fallback
    );
};

const filteredProducts = computed(() => {
    const keyword = searchQuery.value.trim().toLowerCase();

    return products.value.filter((product) =>
        (!keyword ||
            [product.name, product.sku, product.category, product.status, product.stockStatus]
                .some((value) => String(value || "").toLowerCase().includes(keyword))) &&
        (!categoryFilter.value || product.category === categoryFilter.value) &&
        (!statusFilter.value || product.status === statusFilter.value) &&
        (!stockStatusFilter.value || product.stockStatus === stockStatusFilter.value)
    );
});

const categoryOptions = computed(() => {
    return [...new Set(products.value.map((product) => product.category).filter(Boolean))].sort();
});

const isEditing = computed(() => editingProductId.value !== null);

const summaryCards = computed(() => {
    const totalProducts = products.value.length;
    const activeProducts = products.value.filter((product) => String(product.status).toLowerCase() === "active").length;
    const outOfStockItems = products.value.filter((product) => product.stockStatus === "Out of Stock").length;
    const totalValue = products.value.reduce((sum, product) => sum + product.rawPrice * product.stock, 0);

    return [
        {
            label: "Total Products",
            value: totalProducts.toLocaleString(),
            icon: "fa-solid fa-cube",
            iconWrap: "bg-blue-50 text-[#0d6efd]",
        },
        {
            label: "Active Products",
            value: activeProducts.toLocaleString(),
            icon: "fa-solid fa-box-open",
            iconWrap: "bg-emerald-50 text-emerald-500",
        },
        {
            label: "Out of Stock Items",
            value: outOfStockItems.toLocaleString(),
            icon: "fa-solid fa-triangle-exclamation",
            iconWrap: "bg-red-50 text-red-500",
        },
        {
            label: "Total Value",
            value: `$ ${formatPrice(totalValue)}`,
            icon: "fa-solid fa-dollar-sign",
            iconWrap: "bg-violet-50 text-violet-500",
        },
    ];
});

const fetchProducts = async () => {
    loading.value = true;
    errorMessage.value = "";

    try {
        const response = await fetch(productsEndpoint, { headers: getAuthHeaders() });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(getResponseMessage(data, "Could not load products."));
        }

        products.value = unwrapProducts(data).map(normalizeProduct);
    } catch (error) {
        console.error("Fetch products failed:", error);
        errorMessage.value = error.message || "Could not load products.";
    } finally {
        loading.value = false;
    }
};

const fetchProductOptions = async () => {
    try {
        const [categoriesResponse, suppliersResponse, usersResponse] = await Promise.all([
            fetch(categoriesEndpoint, { headers: getAuthHeaders() }),
            fetch(suppliersEndpoint, { headers: getAuthHeaders() }),
            fetch(usersEndpoint, { headers: getAuthHeaders() }),
        ]);
        const [categoriesData, suppliersData, usersData] = await Promise.all([
            categoriesResponse.json().catch(() => ({})),
            suppliersResponse.json().catch(() => ({})),
            usersResponse.json().catch(() => ({})),
        ]);

        if (categoriesResponse.ok) {
            availableCategories.value = unwrapCollection(categoriesData, "categories").map((category) => ({
                id: category.id,
                name: category.cate_name || category.name || category.category_name || `Category #${category.id}`,
            }));
        }

        if (suppliersResponse.ok) {
            availableSuppliers.value = unwrapCollection(suppliersData, "suppliers").map((supplier) => ({
                id: supplier.id,
                name: getSupplierName(supplier),
            }));
        }

        if (usersResponse.ok) {
            userOptions.value = unwrapUsers(usersData).map((user) => ({
                id: user.id,
                name: user.name || user.username || user.email || `User #${user.id}`,
            }));
        }
    } catch (error) {
        console.error("Fetch product options failed:", error);
    }
};

const openAddModal = () => {
    productForm.value = defaultProductForm();
    createError.value = "";
    editingProductId.value = null;
    selectedImageFile.value = null;
    existingImageUrl.value = "";
    imagePreview.value = "";
    showAddModal.value = true;
};

const openEditModal = (product) => {
    productForm.value = {
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        costPrice: product.costPrice,
        salePrice: product.rawPrice,
        stock: product.stock,
        lowStock: product.lowStock,
        description: product.description,
        status: product.status,
    };
    createError.value = "";
    editingProductId.value = product.id;
    selectedImageFile.value = null;
    existingImageUrl.value = product.image === fallbackImage ? "" : product.image;
    imagePreview.value = existingImageUrl.value;
    showAddModal.value = true;
};

const closeAddModal = () => {
    if (creating.value) return;

    showAddModal.value = false;
    createError.value = "";
    editingProductId.value = null;
    selectedImageFile.value = null;
    existingImageUrl.value = "";
    imagePreview.value = "";
};

const unwrapCreatedProduct = (payload) => {
    return payload?.data?.product || payload?.data || payload?.product || payload;
};

const getProductFormData = (editing) => {
    const formData = new FormData();
    const currentUserId = getCurrentUserId();

    formData.append("category_id", productForm.value.categoryId);
    formData.append("supplier_id", productForm.value.supplierId);
    formData.append("user_id", currentUserId);
    formData.append("product_name", productForm.value.name);
    formData.append("barcode", productForm.value.barcode);
    formData.append("sku", productForm.value.sku);
    formData.append("cost_price", productForm.value.costPrice);
    formData.append("sale_price", productForm.value.salePrice);
    formData.append("stock_qty", productForm.value.stock);
    formData.append("low_stock", productForm.value.lowStock);
    formData.append("pro_des", productForm.value.description || "");
    formData.append("status", productForm.value.status.toLowerCase());

    if (selectedImageFile.value) {
        formData.append("pro_image", selectedImageFile.value);
    } else if (existingImageUrl.value) {
        formData.append("pro_image", existingImageUrl.value);
    }

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

const saveProduct = async () => {
    creating.value = true;
    createError.value = "";
    errorMessage.value = "";

    try {
        const editing = isEditing.value;
        const url = editing ? `${productsEndpoint}/${editingProductId.value}` : productsEndpoint;
        const formData = getProductFormData(editing);

        showAddModal.value = false;
        productForm.value = defaultProductForm();
        editingProductId.value = null;
        selectedImageFile.value = null;
        existingImageUrl.value = "";
        imagePreview.value = "";

        const response = await fetch(url, {
            method: "POST",
            headers: getAuthHeaders(),
            body: formData,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(getResponseMessage(data, editing ? "Could not update product." : "Could not create product."));
        }

        await fetchProducts();
    } catch (error) {
        console.error("Save product failed:", error);
        errorMessage.value = error.message || "Could not save product.";
    } finally {
        creating.value = false;
    }
};

const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    selectedImageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
};

const clearImage = () => {
    selectedImageFile.value = null;
    existingImageUrl.value = "";
    imagePreview.value = "";
};

const askDelete = (product) => {
    productPendingDelete.value = product;
};

const cancelDelete = () => {
    if (deletingId.value) return;

    productPendingDelete.value = null;
};

const deleteProduct = async (product) => {
    deletingId.value = product.id;

    try {
        const response = await fetch(`${productsEndpoint}/${product.id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(getResponseMessage(data, "Could not delete product."));
        }

        products.value = products.value.filter((item) => item.id !== product.id);
        productPendingDelete.value = null;
    } catch (error) {
        console.error("Delete product failed:", error);
        errorMessage.value = error.message || "Could not delete product.";
    } finally {
        deletingId.value = null;
    }
};

const clearFilters = () => {
    searchQuery.value = "";
    categoryFilter.value = "";
    statusFilter.value = "";
    stockStatusFilter.value = route.meta.defaultStockStatus || "";
};

watch(
    () => route.meta.defaultStockStatus,
    (defaultStockStatus) => {
        stockStatusFilter.value = defaultStockStatus || "";
    }
);

const stockStatusClass = (status) => {
    if (status === "In Stock") {
        return "bg-emerald-100 text-emerald-600";
    }

    if (status === "Low Stock") {
        return "bg-orange-100 text-orange-500";
    }

    return "bg-red-100 text-red-500";
};

onMounted(async () => {
    await fetchProductOptions();
    await fetchProducts();
});
</script>
