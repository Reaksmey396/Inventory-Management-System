<template>
  <aside class="sticky top-0 flex h-screen w-[224px] shrink-0 flex-col border-r border-slate-200 bg-white text-[#0b294d]">
    <RouterLink to="/staff" class="flex min-h-[88px] items-center gap-3 bg-[#184066] px-4 text-white">
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/30 text-lg">
        <i class="fa-solid fa-cube"></i>
      </span>
      <div class="min-w-0">
        <p class="text-base font-black leading-tight">INVENTORY</p>
        <p class="text-xs font-bold leading-tight text-slate-200">MANAGEMENT</p>
      </div>
    </RouterLink>

    <RouterLink to="/staff/profile" class="flex min-h-[108px] items-center gap-3 bg-[#275c8b] px-4 text-white transition hover:bg-[#0a3c69]">
      <div class="relative shrink-0">
        <img :src="displayAvatarSrc" alt="Staff profile" class="h-11 w-11 rounded-full border-2 border-white object-cover">
        <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#073157] bg-emerald-400"></span>
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-black">{{ profileName }}</p>
        <p class="text-xs font-bold text-slate-200">Staff</p>
        <p class="mt-1 text-[10px] font-black text-emerald-400">Online</p>
      </div>
    </RouterLink>

    <nav class="staff-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-2 py-3">
      <RouterLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="mb-1 flex h-12 items-center gap-3 rounded-lg px-4 text-sm font-bold text-[#17365d] transition hover:bg-blue-50"
        :class="isActive(item) ? 'bg-[#eaf3ff] text-blue-700 shadow-sm' : ''"
      >
        <span class="grid h-7 w-7 shrink-0 place-items-center text-base" :class="item.iconColor">
          <i :class="item.iconClass" class="fa-solid"></i>
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="border-t border-slate-100 bg-white px-3 py-4">
      <button type="button" class="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-black text-red-600 transition hover:bg-red-50" @click="logout">
        <span class="grid h-7 w-7 place-items-center"><i class="fa-solid fa-right-from-bracket"></i></span>
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAccountProfile } from "../../composables/useAccountProfile";
import { hasStaffPermission } from "../../utils/staffPermissions";

const props = defineProps({
  pageKey: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const router = useRouter();
const { profileName, profileAvatar, account, fetchProfile } = useAccountProfile("Staff");
const displayAvatarSrc = computed(() => profileAvatar.value || "https://i.pravatar.cc/100?img=12");
const staffMenuItems = [
  { key: "dashboard", label: "Dashboard", to: "/staff", iconClass: "fa-house", iconColor: "text-blue-600", permission: "dashboard.view" },
  { key: "products", label: "Products", to: "/staff/product", iconClass: "fa-cube", iconColor: "text-[#17365d]", permission: "products.view" },
  { key: "stockIn", label: "Stock In", to: "/staff/stock-in", iconClass: "fa-arrow-down", iconColor: "text-emerald-600", permission: "stock_in.view" },
  { key: "stockOut", label: "Stock Out", to: "/staff/stock-out", iconClass: "fa-arrow-up", iconColor: "text-red-500", permission: "stock_out.view" },
  { key: "suppliers", label: "Suppliers", to: "/staff/suppliers", iconClass: "fa-truck", iconColor: "text-[#17365d]", permission: "suppliers.view" },
  { key: "purchase", label: "Purchases", to: "/staff/purchase-history", iconClass: "fa-cart-shopping", iconColor: "text-[#17365d]", permission: "purchases.view" },
  { key: "profile", label: "Profile", to: "/staff/profile", iconClass: "fa-user", iconColor: "text-[#17365d]", permission: "profile.manage" },
];
const menuItems = computed(() => staffMenuItems.filter((item) => hasStaffPermission(account.value, item.permission)));

const isActive = (item) => {
  if (props.pageKey) return item.key === props.pageKey;
  return item.to === "/staff" ? route.path === "/staff" : route.path.startsWith(item.to);
};

const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("user_role");
  sessionStorage.removeItem("auth_session");
  router.push("/login");
};

const handleProfileUpdated = () => fetchProfile();
onMounted(() => {
  fetchProfile();
  window.addEventListener("account-profile-updated", handleProfileUpdated);
});
onBeforeUnmount(() => window.removeEventListener("account-profile-updated", handleProfileUpdated));
</script>

<style scoped>
.staff-sidebar-scroll {
  scrollbar-color: #7a7a7a transparent;
  scrollbar-width: thin;
}

.staff-sidebar-scroll::-webkit-scrollbar {
  width: 8px;
}

.staff-sidebar-scroll::-webkit-scrollbar-thumb {
  background: #7a7a7a;
  border: 2px solid white;
  border-radius: 999px;
}
</style>
