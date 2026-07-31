<template>
  <aside class="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-gray-200 shadow-sm">
    <!-- Logo -->
    <div class="flex min-h-[80px] items-center gap-3 border-b border-slate-100 px-5">
      <RouterLink :to="homePath" class="flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-md">
          <i class="fa-solid fa-cube text-lg"></i>
        </span>

        <div>
          <h1 class="text-xl font-bold text-slate-800">
            IMS
          </h1>

          <p class="text-xs text-slate-500">
            {{ portalName }}
          </p>
        </div>
      </RouterLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-300">
      <div class="space-y-1">
        <RouterLink v-for="item in menuItems" :key="item.to" :to="item.to"
          class="group flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-blue-600"
          :class="isActive(item)
            ? '!bg-blue-600 !text-white shadow-md hover:!bg-blue-600 hover:!text-white'
            : ''
            ">
          <span class="grid h-8 w-8 place-items-center rounded-lg transition" :class="isActive(item)
            ? 'bg-white/20 text-white group-hover:bg-white/20 group-hover:text-white'
            : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600'
            ">
            <i :class="item.iconClass" class="fa-solid text-sm"></i>
          </span>

          <span>
            {{ item.label }}
          </span>
        </RouterLink>
      </div>
    </nav>

    <!-- User Profile -->
    <div class="border-t border-slate-100 p-4">
      <RouterLink
        :to="profilePath"
        class="flex w-full items-center gap-3 rounded-xl bg-white p-2 text-left transition hover:bg-slate-100"
        :class="route.path === profilePath ? 'bg-blue-50 ring-1 ring-blue-200' : ''"
      >
        <div class="relative">
          <img :src="displayAvatarSrc" alt="User"
            class="h-10 w-10 rounded-full border border-slate-200 object-cover" />

          <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold leading-tight text-slate-800">
            {{ profileName }}
          </p>
          <p class="truncate text-xs text-slate-500">
            {{ profileEmail }}
          </p>
        </div>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useAccountProfile } from "../../composables/useAccountProfile";

const props = defineProps({
  pageKey: {
    type: String,
    default: "",
  },
});

const route = useRoute();

const adminMenuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/admin",
    iconClass: "fa-house",
  },
  {
    key: "products",
    label: "Products",
    to: "/admin/products",
    iconClass: "fa-box",
  },
  {
    key: "categories",
    label: "Categories",
    to: "/admin/categories",
    iconClass: "fa-folder-tree",
  },
  {
    key: "suppliers",
    label: "Suppliers",
    to: "/admin/suppliers",
    iconClass: "fa-users",
  },
  {
    key: "stockIn",
    label: "Stock In",
    to: "/admin/stock-in",
    iconClass: "fa-arrow-up-from-bracket",
  },
  {
    key: "stockOut",
    label: "Stock Out",
    to: "/admin/stock-out",
    iconClass: "fa-arrow-down",
  },
  {
    key: "purchase",
    label: "Purchase",
    to: "/admin/purchase",
    iconClass: "fa-cart-shopping",
  },
  {
    key: "users",
    label: "Users",
    to: "/admin/users",
    iconClass: "fa-user-group",
  },
  {
    key: "profile",
    label: "Profile",
    to: "/admin/profile",
    iconClass: "fa-user",
  },
];

const managerMenuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/manager",
    iconClass: "fa-house",
  },
  {
    key: "purchase",
    label: "Purchase History",
    to: "/manager/purchase-history",
    iconClass: "fa-cart-shopping",
  },
  {
    key: "products",
    label: "Stock Status",
    to: "/manager/stock-status",
    iconClass: "fa-boxes-stacked",
  },
  {
    key: "suppliers",
    label: "Supplier List",
    to: "/manager/supplier-list",
    iconClass: "fa-users",
  },
  {
    key: "profile",
    label: "Profile",
    to: "/manager/profile",
    iconClass: "fa-user",
  },
];

const activeKey = computed(() => props.pageKey);
const isManagerArea = computed(() => route.path.startsWith("/manager"));
const menuItems = computed(() => (isManagerArea.value ? managerMenuItems : adminMenuItems));
const homePath = computed(() => (isManagerArea.value ? "/manager" : "/admin"));
const profilePath = computed(() => (isManagerArea.value ? "/manager/profile" : "/admin/profile"));
const portalName = computed(() => (isManagerArea.value ? "Manager Inventory Portal" : "Inventory Management System"));
const fallbackRole = computed(() => (isManagerArea.value ? "Manager" : "Admin"));
const {
  profileName,
  profileEmail,
  profileAvatar,
  fetchProfile,
} = useAccountProfile(fallbackRole);
const displayAvatarSrc = computed(() => profileAvatar.value || "https://i.pravatar.cc/100");

const isActive = (item) => {
  if (activeKey.value) {
    return item.key === activeKey.value;
  }

  return item.to === homePath.value
    ? route.path === homePath.value
    : route.path.startsWith(item.to);
};

const handleProfileUpdated = () => {
  fetchProfile();
};

onMounted(() => {
  fetchProfile();
  window.addEventListener("account-profile-updated", handleProfileUpdated);
});

onBeforeUnmount(() => {
  window.removeEventListener("account-profile-updated", handleProfileUpdated);
});
</script>
