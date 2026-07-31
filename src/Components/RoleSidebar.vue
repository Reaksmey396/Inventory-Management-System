<template>
  <ManagerSidebar v-if="isManagerArea" :page-key="pageKey" />
  <StaffSidebar v-else-if="isStaffArea" :page-key="pageKey" />
  <AdminSidebar v-else :page-key="pageKey" />
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AdminSidebar from "../Admin/Components/Sidebar.vue";
import ManagerSidebar from "../Manager/Components/Sidebar.vue";
import StaffSidebar from "../Staff/Components/Sidebar.vue";

defineProps({
  pageKey: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const isManagerArea = computed(() => route.path === "/manager" || route.path.startsWith("/manager/"));
const isStaffArea = computed(() => route.path === "/staff" || route.path.startsWith("/staff/"));
</script>
