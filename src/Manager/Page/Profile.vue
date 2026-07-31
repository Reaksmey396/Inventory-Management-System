<template>
  <div class="flex min-h-screen bg-[#eef8f2] text-slate-900">
    <Sidebar page-key="profile" />
    <AccountProfileEditor
      role="Manager"
      access-label="Inventory Monitoring"
      accent="emerald"
      image-only
    />
  </div>
</template>

<script setup>
import AccountProfileEditor from "../../Components/AccountProfileEditor.vue";
import Sidebar from "../Components/Sidebar.vue";
</script>
