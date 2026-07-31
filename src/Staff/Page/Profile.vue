<template>
  <div class="staff-portal flex min-h-screen bg-[#edf5f2] text-slate-900">
    <Sidebar page-key="profile" />
    <AccountProfileEditor role="Staff" access-label="Inventory Operations" />
  </div>
</template>

<script setup>
import AccountProfileEditor from "../../Components/AccountProfileEditor.vue";
import Sidebar from "../Components/Sidebar.vue";
</script>
