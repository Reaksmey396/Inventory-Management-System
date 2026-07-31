<template>
  <div class="flex min-h-screen bg-[#f6f9ff] text-[#10234d]">
    <Sidebar page-key="users" />

    <main class="min-w-0 flex-1 px-7 py-6">
      <header class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-[26px] font-black leading-tight text-[#10234d]">
            {{ isReadOnly ? "User Activity" : "Users" }}
          </h1>
          <p class="mt-1 text-[13px] font-semibold text-[#6c7da4]">
            {{ isReadOnly ? "View system users and recent account activity" : "Manage system users and their access" }}
          </p>
        </div>

        <button
          v-if="!isReadOnly"
          type="button"
          class="flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-[#0d6efd] px-6 text-[13px] font-black text-white shadow-md shadow-blue-500/20 transition hover:bg-[#0b5ed7]"
          @click="openAddModal"
        >
          <i class="fa-solid fa-plus text-[12px]"></i>
          Add User
        </button>
      </header>

      <section class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="flex min-h-[126px] min-w-0 items-center gap-4 rounded-lg border border-[#dfe7f3] bg-white px-4 py-5 shadow-[0_10px_30px_rgba(15,35,80,0.04)]"
        >
          <span
            class="grid h-[64px] w-[64px] flex-shrink-0 place-items-center rounded-xl text-[27px]"
            :class="card.iconWrap"
          >
            <i :class="card.icon"></i>
          </span>
          <div class="min-w-0">
            <p class="text-[11px] font-extrabold text-[#223763]">
              {{ card.label }}
            </p>
            <p class="mt-2 text-[28px] font-black leading-none text-[#10234d]">
              {{ card.value }}
            </p>
            <p class="mt-3 text-[11px] font-semibold text-[#6c7da4]">
              {{ card.note }}
            </p>
          </div>
        </article>
      </section>

      <section
        class="overflow-hidden rounded-lg border border-[#dfe7f3] bg-white shadow-[0_10px_30px_rgba(15,35,80,0.04)]"
      >
        <div class="border-b border-[#e8eef7] px-5 py-5">
          <div class="grid gap-4 lg:grid-cols-[minmax(260px,1.5fr)_minmax(160px,0.85fr)_minmax(160px,0.85fr)_auto]">
            <label class="relative min-w-0">
              <input
                v-model="searchQuery"
                class="h-11 w-full rounded-md border border-[#dbe4f0] bg-white px-4 pr-11 text-[12px] font-semibold text-[#10234d] outline-none transition placeholder:text-[#8a99b8] focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
                placeholder="Search by name, email, or role..."
              />
              <i
                class="fa-solid fa-magnifying-glass pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#6c7da4]"
              ></i>
            </label>

            <label class="relative min-w-0">
              <select
                v-model="roleFilter"
                class="h-11 w-full cursor-pointer rounded-md border border-[#dbe4f0] bg-white px-3 text-[12px] font-bold text-[#10234d] outline-none focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Roles</option>
                <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
              </select>
            </label>

            <label class="relative min-w-0">
              <select
                v-model="statusFilter"
                class="h-11 w-full cursor-pointer rounded-md border border-[#dbe4f0] bg-white px-3 text-[12px] font-bold text-[#10234d] outline-none focus:border-[#94bfff] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>

            <button
              class="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#0d6efd] px-5 text-[12px] font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#0b5ed7]"
              @click="clearFilters"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="admin-table-scroll overflow-x-auto">
          <table class="admin-data-table w-full min-w-[1160px] border-collapse text-left">
            <thead>
              <tr class="bg-[#f8fbff] text-[11px] font-black text-[#315071]">
                <th class="border-b border-[#e8eef7] px-5 py-4">
                  <input type="checkbox" class="h-4 w-4 rounded border-[#cbd7e8]" />
                </th>
                <th class="border-b border-[#e8eef7] px-4 py-4">No</th>
                <th class="border-b border-[#e8eef7] px-5 py-4">User</th>
                <th class="border-b border-[#e8eef7] px-5 py-4">Email</th>
                <th class="border-b border-[#e8eef7] px-5 py-4">Phone</th>
                <th class="border-b border-[#e8eef7] px-5 py-4">Role</th>
                <th class="border-b border-[#e8eef7] px-5 py-4">Status</th>
                <th class="border-b border-[#e8eef7] px-5 py-4">Created At</th>
                <th class="border-b border-[#e8eef7] px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#edf2f8]">
              <tr v-if="loading">
                <td colspan="9" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">
                  <i class="fa-solid fa-spinner mr-2 animate-spin"></i>
                  Loading users...
                </td>
              </tr>
              <tr v-else-if="errorMessage">
                <td colspan="9" class="px-5 py-10 text-center text-[13px] font-bold text-red-500">
                  {{ errorMessage }}
                </td>
              </tr>
              <tr v-else-if="filteredUsers.length === 0">
                <td colspan="9" class="px-5 py-10 text-center text-[13px] font-bold text-[#506283]">
                  No users found.
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="(user, index) in filteredUsers"
                  :key="user.id || user.email"
                  class="text-[12px] font-semibold text-[#223763] transition hover:bg-[#f8fbff]"
                >
                  <td class="px-5 py-4">
                    <input type="checkbox" class="h-4 w-4 rounded border-[#cbd7e8]" />
                  </td>
                  <td class="px-4 py-4 text-[#506283]">
                    {{ index + 1 }}
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <span
                        class="grid h-8 w-8 place-items-center overflow-hidden rounded-full text-[10px] font-black text-white"
                        :class="user.avatarClass"
                      >
                        <img
                          v-if="user.image"
                          :src="user.image"
                          :alt="user.name"
                          class="h-full w-full object-cover"
                        />
                        <span v-else>{{ user.initials }}</span>
                      </span>
                      <span class="font-black text-[#223763]">
                        {{ user.name }}
                      </span>
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    {{ user.email }}
                  </td>
                  <td class="px-5 py-4">{{ user.phone }}</td>
                  <td class="px-5 py-4">
                    <span
                      class="inline-flex h-6 items-center rounded-full px-3 text-[10px] font-black"
                      :class="roleClass(user.role)"
                    >
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span
                      class="inline-flex h-6 items-center rounded-full px-3 text-[10px] font-black"
                      :class="statusClass(user.status)"
                    >
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    {{ user.createdAt }}
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-center gap-3">
                      <button
                        v-if="!isReadOnly"
                        class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-blue-50 text-[#0d6efd] transition hover:bg-blue-100"
                        aria-label="View user"
                      >
                        <i class="fa-solid fa-eye text-[12px]"></i>
                      </button>
                      <button
                        v-if="!isReadOnly"
                        class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-orange-50 text-orange-500 transition hover:bg-orange-100"
                        aria-label="Edit user"
                        @click="openEditModal(user)"
                      >
                        <i class="fa-solid fa-pen text-[12px]"></i>
                      </button>
                      <button
                        class="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label="Delete user"
                        :disabled="deletingId === user.id"
                        @click="askDelete(user)"
                      >
                        <i v-if="deletingId === user.id" class="fa-solid fa-spinner animate-spin text-[12px]"></i>
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
            Showing {{ filteredUsers.length ? 1 : 0 }} to {{ filteredUsers.length }} of {{ users.length }} entries
          </p>
        </footer>
      </section>
    </main>

    <div v-if="showModal" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
      <section class="flex max-h-[calc(100vh-48px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-[18px] font-black text-[#10234d]">
              {{ isEditing ? "Edit User" : "Add User" }}
            </h2>
            <p class="mt-0.5 text-[12px] font-semibold text-slate-500">
              {{ isEditing ? "Update user account details" : "Create a new user account" }}
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

        <form class="grid min-h-0 gap-4 overflow-y-auto px-6 py-4" @submit.prevent="saveUser">
          <p v-if="saveError" class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
            {{ saveError }}
          </p>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2 text-[13px] font-black text-[#223763]">
              Name
              <input
                v-model="userForm.name"
                type="text"
                required
                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                placeholder="User name"
              />
            </label>

            <label class="grid gap-2 text-[13px] font-black text-[#223763]">
              Email
              <input
                v-model="userForm.email"
                type="email"
                required
                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                placeholder="user@example.com"
              />
            </label>

            <label class="grid gap-2 text-[13px] font-black text-[#223763]">
              Phone
              <input
                v-model="userForm.phone"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                placeholder="09734443359"
                @input="sanitizePhoneInput"
              />
            </label>

            <label class="grid gap-2 text-[13px] font-black text-[#223763]">
              Role
              <select
                v-model="userForm.role"
                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
              >
                <option>admin</option>
                <option>manager</option>
                <option>staff</option>
              </select>
            </label>

            <label class="grid gap-2 text-[13px] font-black text-[#223763]">
              Status
              <select
                v-model="userForm.status"
                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>

            <label class="grid gap-2 text-[13px] font-black text-[#223763]">
              Password
              <input
                v-model="userForm.password"
                type="password"
                :required="!isEditing"
                class="rounded-lg border border-slate-200 px-4 py-3 text-[13px] font-semibold outline-none focus:border-blue-500"
                :placeholder="isEditing ? 'Leave blank to keep current password' : 'Password'"
              />
            </label>
          </div>

          <div class="grid gap-2 text-[13px] font-black text-[#223763]">
            User Image
            <div class="grid gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 sm:grid-cols-[80px_minmax(0,1fr)]">
              <span class="grid h-20 w-20 place-items-center overflow-hidden rounded-lg bg-white shadow-sm">
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  alt="User preview"
                  class="h-full w-full object-cover"
                />
                <i v-else class="fa-regular fa-image text-3xl text-slate-300"></i>
              </span>

              <div class="min-w-0">
                <input
                  ref="userImageInputRef"
                  id="user-image"
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
              {{ saving ? "Saving..." : isEditing ? "Update User" : "Save User" }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <DeleteConfirmModal
      v-if="!isReadOnly && userPendingDelete"
      @cancel="cancelDelete"
      @confirm="removeUser"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../../Components/RoleSidebar.vue";
import DeleteConfirmModal from "../Components/DeleteConfirmModal.vue";
import { getAuthHeaders, getCurrentUserId } from "../../utils/auth";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const usersEndpoint = `${apiBaseUrl}/users`;
const appBaseUrl = apiBaseUrl.replace(/\/api$/, "");
const route = useRoute();
const isReadOnly = computed(() => Boolean(route.meta.readOnly));

const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const errorMessage = ref("");
const saveError = ref("");
const searchQuery = ref("");
const roleFilter = ref("");
const statusFilter = ref("");
const userPendingDelete = ref(null);
const showModal = ref(false);
const editingUserId = ref(null);
const selectedImageFile = ref(null);
const imagePreview = ref("");
const existingImageUrl = ref("");
const userImageInputRef = ref(null);

const defaultUserForm = () => ({
  name: "",
  email: "",
  phone: "",
  role: "staff",
  status: "Active",
  password: "",
});

const userForm = ref(defaultUserForm());
const isEditing = computed(() => editingUserId.value !== null);
const selectedImageName = computed(() => {
  return selectedImageFile.value?.name || (existingImageUrl.value ? "Current Image" : "");
});

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

const resolveImageUrl = (image) => {
  if (!image) return "";

  const imagePath = String(image).trim();

  if (!imagePath) return "";
  if (/^(https?:|blob:|data:)/i.test(imagePath)) return imagePath;

  const cleanPath = imagePath.replace(/^\/+/, "");
  return `${appBaseUrl}/${cleanPath.startsWith("storage/") ? cleanPath : `storage/${cleanPath}`}`;
};

const getInitials = (name) => {
  return String(name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "U";
};

const normalizeStatus = (value) => {
  return String(value || "active").toLowerCase() === "inactive" ? "Inactive" : "Active";
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeRole = (role) => {
  const value = String(role || "user").trim();
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "User";
};

const normalizeUser = (user, index) => {
  const name = user.name || `User #${user.id ?? index + 1}`;
  const role = normalizeRole(user.role);

  return {
    id: user.id ?? index + 1,
    name,
    initials: getInitials(name),
    email: user.email || "-",
    phone: user.phone || "-",
    role,
    rawRole: user.role || "staff",
    status: normalizeStatus(user.status),
    image: resolveImageUrl(user.user_image),
    rawImage: user.user_image || "",
    createdAt: formatDate(user.created_at),
    avatarClass: "bg-[#0d6efd]",
    isAdmin: role.toLowerCase() === "admin" || role.toLowerCase() === "super admin",
  };
};

const fetchUsers = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch(usersEndpoint, {
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getResponseMessage(data, "Could not load users."));
    }

    users.value = unwrapUsers(data).map(normalizeUser);
  } catch (error) {
    console.error("Fetch users failed:", error);
    errorMessage.value = error.message || "Could not load users.";
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();

  return users.value.filter((user) => {
    const matchKeyword =
      !keyword ||
      [user.name, user.email, user.phone, user.role, user.status]
        .some((value) => String(value || "").toLowerCase().includes(keyword));
    const matchRole = !roleFilter.value || user.role === roleFilter.value;
    const matchStatus = !statusFilter.value || user.status === statusFilter.value;

    return matchKeyword && matchRole && matchStatus;
  });
});

const roleOptions = computed(() => {
  return [...new Set(users.value.map((user) => user.role).filter(Boolean))].sort();
});

const summaryCards = computed(() => {
  const totalUsers = users.value.length;
  const activeUsers = users.value.filter((user) => user.status === "Active").length;
  const inactiveUsers = users.value.filter((user) => user.status === "Inactive").length;

  return [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      note: "All system users",
      icon: "fa-solid fa-users",
      iconWrap: "bg-blue-50 text-[#0d6efd]",
    },
    {
      label: "Active Users",
      value: activeUsers.toLocaleString(),
      note: "Currently active",
      icon: "fa-solid fa-user-check",
      iconWrap: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "Inactive Users",
      value: inactiveUsers.toLocaleString(),
      note: "Currently inactive",
      icon: "fa-solid fa-user-xmark",
      iconWrap: "bg-red-50 text-red-500",
    },
  ];
});

const clearFilters = () => {
  searchQuery.value = "";
  roleFilter.value = "";
  statusFilter.value = "";
};

const resetModalState = () => {
  userForm.value = defaultUserForm();
  editingUserId.value = null;
  saveError.value = "";
  selectedImageFile.value = null;
  existingImageUrl.value = "";
  imagePreview.value = "";

  if (userImageInputRef.value) {
    userImageInputRef.value.value = "";
  }
};

const openAddModal = () => {
  resetModalState();
  showModal.value = true;
};

const openEditModal = (user) => {
  userForm.value = {
    name: user.name === "-" ? "" : user.name,
    email: user.email === "-" ? "" : user.email,
    phone: user.phone === "-" ? "" : user.phone,
    role: String(user.rawRole || user.role || "staff").toLowerCase(),
    status: user.status,
    password: "",
  };
  editingUserId.value = user.id;
  selectedImageFile.value = null;
  existingImageUrl.value = user.image || "";
  imagePreview.value = user.image || "";
  saveError.value = "";
  showModal.value = true;
};

const closeModal = () => {
  if (saving.value) return;

  showModal.value = false;
  resetModalState();
};

const openImagePicker = () => {
  userImageInputRef.value?.click();
};

const handleImageChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  selectedImageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
  event.target.value = "";
};

const clearImage = () => {
  selectedImageFile.value = null;
  existingImageUrl.value = "";
  imagePreview.value = "";

  if (userImageInputRef.value) {
    userImageInputRef.value.value = "";
  }
};

const sanitizePhoneInput = (event) => {
  userForm.value.phone = event.target.value.replace(/\D/g, "");
};

const normalizePhoneForApi = (phone) => {
  return String(phone || "").replace(/\D/g, "");
};

const buildUserFormData = (editing) => {
  const formData = new FormData();
  const currentUserId = getCurrentUserId();

  formData.append("name", userForm.value.name);
  formData.append("email", userForm.value.email);
  formData.append("phone", normalizePhoneForApi(userForm.value.phone));
  formData.append("role", userForm.value.role);
  formData.append("status", userForm.value.status.toLowerCase());

  if (userForm.value.password) {
    formData.append("password", userForm.value.password);
  }

  if (selectedImageFile.value) {
    formData.append("user_image", selectedImageFile.value);
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

const saveUser = async () => {
  saving.value = true;
  saveError.value = "";

  try {
    const editing = isEditing.value;
    const url = editing ? `${usersEndpoint}/${editingUserId.value}` : usersEndpoint;
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: buildUserFormData(editing),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getResponseMessage(data, editing ? "Could not update user." : "Could not create user."));
    }

    showModal.value = false;
    resetModalState();
    await fetchUsers();
  } catch (error) {
    console.error("Save user failed:", error);
    saveError.value = error.message || "Could not save user.";
  } finally {
    saving.value = false;
  }
};

const askDelete = (user) => {
  userPendingDelete.value = user;
};

const cancelDelete = () => {
  if (deletingId.value) return;

  userPendingDelete.value = null;
};

const removeUser = async () => {
  if (!userPendingDelete.value) return;

  deletingId.value = userPendingDelete.value.id;
  errorMessage.value = "";

  try {
    const response = await fetch(`${usersEndpoint}/${userPendingDelete.value.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getResponseMessage(data, "Could not delete user."));
    }

    users.value = users.value.filter((user) => user.id !== userPendingDelete.value.id);
    userPendingDelete.value = null;
  } catch (error) {
    console.error("Delete user failed:", error);
    errorMessage.value = error.message || "Could not delete user.";
  } finally {
    deletingId.value = null;
  }
};

const roleClass = (role) => {
  const normalized = String(role || "").toLowerCase();

  if (normalized.includes("admin")) {
    return "bg-violet-100 text-violet-600";
  }

  if (normalized === "manager") {
    return "bg-emerald-100 text-emerald-600";
  }

  return "bg-blue-50 text-[#0d6efd]";
};

const statusClass = (status) => {
  if (status === "Active") {
    return "bg-emerald-100 text-emerald-600";
  }

  return "bg-red-100 text-red-500";
};

onMounted(() => {
  fetchUsers();
});
</script>
