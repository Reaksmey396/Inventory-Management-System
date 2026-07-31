<template>
  <div class="flex min-h-screen bg-[#f6f9ff] text-slate-900">
    <Sidebar page-key="profile" />
    <AccountProfileEditor
      role="Admin"
      access-label="Full System Administration"
    />
  </div>
</template>

<script setup>
import AccountProfileEditor from "../../Components/AccountProfileEditor.vue";
import Sidebar from "../Components/Sidebar.vue";
</script>
