<template>
  <div class="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 px-4 py-6">
    <section class="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl">
      <div class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-500">
        <i class="fa-solid fa-trash-can text-[18px]"></i>
      </div>

      <h2 class="mt-4 text-[18px] font-black text-[#10234d]">
        Do you wanna remove?
      </h2>
      <p class="mt-2 text-[13px] font-semibold leading-6 text-slate-500">
        This action cannot be undone.
      </p>

      <footer class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="h-10 rounded-lg border border-slate-200 px-5 text-[13px] font-black text-slate-600 transition hover:bg-slate-50"
          :disabled="loading"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="inline-flex h-10 items-center gap-2 rounded-lg bg-red-500 px-5 text-[13px] font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          <i v-if="loading" class="fa-solid fa-spinner animate-spin text-[12px]"></i>
          Remove
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["cancel", "confirm"]);
</script>
