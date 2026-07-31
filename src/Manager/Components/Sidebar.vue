<template>
  <aside class="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-emerald-100 bg-gray-200 shadow-sm">
    <div class="flex min-h-[80px] items-center gap-3 border-b border-emerald-100 px-5">
      <RouterLink to="/manager" class="flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-md">
          <i class="fa-solid fa-cube text-lg"></i>
        </span>

        <div>
          <h1 class="text-xl font-bold text-slate-800">IMS</h1>
          <p class="text-xs text-slate-500">Manager Inventory Portal</p>
        </div>
      </RouterLink>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-300">
      <div class="space-y-1">
        <RouterLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="group flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700"
          :class="isActive(item)
            ? '!bg-emerald-600 !text-white shadow-md hover:!bg-emerald-600 hover:!text-white'
            : ''"
        >
          <span
            class="grid h-8 w-8 place-items-center rounded-lg transition"
            :class="isActive(item)
              ? 'bg-white/20 text-white group-hover:bg-white/20 group-hover:text-white'
              : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-emerald-600'"
          >
            <i :class="item.iconClass" class="fa-solid text-sm"></i>
          </span>

          <span>{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <div class="border-t border-emerald-100 p-4">
      <RouterLink
        to="/manager/profile"
        class="flex w-full items-center gap-3 rounded-xl bg-white p-2 text-left transitio"
        :class="route.path === '/manager/profile' ? 'bg-emerald-50 ring-1 ring-emerald-200' : ''"
      >
        <div class="relative">
          <img
            :src="profileAvatar || 'https://i.pravatar.cc/100'"
            alt="Manager"
            class="h-10 w-10 rounded-full border border-emerald-100 object-cover"
          />
          <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold leading-tight text-slate-800">{{ profileName }}</p>
          <p class="truncate text-xs text-slate-500">{{ profileEmail || "Manager" }}</p>
        </div>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useAccountProfile } from "../../composables/useAccountProfile";

const props = defineProps({
  pageKey: {
    type: String,
    default: "",
  },
});

const route = useRoute();

const menuItems = [
  { key: "dashboard", label: "Dashboard", to: "/manager", iconClass: "fa-house" },
  { key: "products", label: "Products", to: "/manager/products", iconClass: "fa-boxes-stacked" },
  { key: "categories", label: "Categories", to: "/manager/categories", iconClass: "fa-folder-tree" },
  { key: "suppliers", label: "Suppliers", to: "/manager/supplier-list", iconClass: "fa-users" },
  { key: "purchase", label: "Purchase", to: "/manager/purchase-history", iconClass: "fa-cart-shopping" },
  { key: "stockIn", label: "Stock In", to: "/manager/stock-in", iconClass: "fa-arrow-up-from-bracket" },
  { key: "stockOut", label: "Stock Out", to: "/manager/stock-out", iconClass: "fa-arrow-down" },
  { key: "profile", label: "Profile", to: "/manager/profile", iconClass: "fa-user" },
];

const { profileName, profileEmail, profileAvatar, fetchProfile } = useAccountProfile("Manager");

const isActive = (item) => {
  const matchesRoute = item.to === "/manager"
    ? route.path === item.to
    : route.path === item.to || route.path.startsWith(`${item.to}/`);

  if (route.path === "/manager" || route.path.startsWith("/manager/")) {
    return matchesRoute;
  }

  if (props.pageKey) {
    return item.key === props.pageKey;
  }

  return false;
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
