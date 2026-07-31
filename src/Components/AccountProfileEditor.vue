<template>
  <main class="min-w-0 flex-1 px-5 py-5 lg:px-7">
    <header class="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-[11px] font-black uppercase tracking-[0.18em]" :class="accentText">{{ role }} account</p>
        <h1 class="mt-1 text-[26px] font-black text-slate-900">Profile</h1>
        <p class="mt-1 text-[13px] font-semibold text-slate-500">
          {{ imageOnly ? "View your account information and update your profile image." : "Update your account information and profile image." }}
        </p>
      </div>

      <button
        type="button"
        class="flex h-11 items-center gap-2 rounded-lg bg-red-600 px-4 text-[13px] font-black text-white shadow-sm transition hover:bg-red-700"
        @click="showLogoutModal = true"
      >
        <i class="fa-solid fa-right-from-bracket"></i>
        Logout
      </button>
    </header>

    <form class="w-full rounded-xl border bg-white p-6 shadow-sm" :class="accentBorder" @submit.prevent="saveProfile">
      <div class="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
        <div class="relative w-fit">
          <img :src="displayAvatar" :alt="`${role} profile`" class="h-24 w-24 rounded-full border-2 border-slate-100 object-cover shadow-sm">
          <button
            type="button"
            class="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border-2 border-white text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60"
            :class="accentButton"
            :disabled="loading"
            aria-label="Choose profile image"
            title="Choose profile image"
            @click="openImagePicker"
          >
            <i class="fa-solid fa-camera text-sm"></i>
          </button>
          <input
            ref="imageInputRef"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            class="hidden"
            :disabled="loading"
            @change="handleImageChange"
          >
        </div>

        <div class="min-w-0 flex-1">
          <h2 class="break-words text-xl font-black text-slate-900">{{ profileName }}</h2>
          <p class="mt-1 break-words text-sm font-semibold text-slate-500">{{ profileEmail || "No email provided" }}</p>
          <button
            type="button"
            class="mt-4 flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            :class="accentButton"
            :disabled="loading"
            @click="openImagePicker"
          >
            <i class="fa-solid fa-cloud-arrow-up"></i>
            {{ profileAvatar ? "Change Profile Image" : "Upload Profile Image" }}
          </button>
          <div class="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span>{{ selectedImageFile ? selectedImageFile.name : "JPG, PNG, WEBP or GIF up to 2 MB" }}</span>
            <button
              v-if="selectedImageFile"
              type="button"
              class="font-black text-red-600 hover:text-red-700"
              @click="clearSelectedImage"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <p
        v-if="feedbackMessage"
        class="mt-5 rounded-lg border px-4 py-3 text-[13px] font-bold"
        :class="feedbackType === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-600'"
        role="status"
      >
        {{ feedbackMessage }}
      </p>

      <div v-if="!imageOnly" class="mt-5 grid gap-5 md:grid-cols-2">
        <label class="grid gap-2 text-[12px] font-black uppercase tracking-wide text-slate-600">
          Name
          <input
            v-model.trim="formName"
            type="text"
            required
            autocomplete="name"
            class="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold normal-case text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Your name"
          >
        </label>

        <label class="grid gap-2 text-[12px] font-black uppercase tracking-wide text-slate-600">
          Email
          <input
            v-model.trim="formEmail"
            type="email"
            required
            autocomplete="email"
            class="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold normal-case text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="you@example.com"
          >
        </label>

        <div class="rounded-lg bg-slate-50 p-4">
          <p class="text-[11px] font-black uppercase tracking-wide text-slate-500">Role</p>
          <p class="mt-1 text-sm font-bold text-slate-800">{{ role }}</p>
        </div>

        <div class="rounded-lg bg-slate-50 p-4">
          <p class="text-[11px] font-black uppercase tracking-wide text-slate-500">Access</p>
          <p class="mt-1 text-sm font-bold text-slate-800">{{ accessLabel }}</p>
        </div>
      </div>

      <div v-else class="mt-5 grid gap-5 md:grid-cols-2">
        <div class="rounded-lg bg-slate-50 p-4">
          <p class="text-[11px] font-black uppercase tracking-wide text-slate-500">Name</p>
          <p class="mt-1 break-words text-sm font-bold text-slate-800">{{ profileName }}</p>
        </div>

        <div class="rounded-lg bg-slate-50 p-4">
          <p class="text-[11px] font-black uppercase tracking-wide text-slate-500">Email</p>
          <p class="mt-1 break-words text-sm font-bold text-slate-800">{{ profileEmail || "No email provided" }}</p>
        </div>

        <div class="rounded-lg bg-slate-50 p-4">
          <p class="text-[11px] font-black uppercase tracking-wide text-slate-500">Role</p>
          <p class="mt-1 text-sm font-bold text-slate-800">{{ role }}</p>
        </div>

        <div class="rounded-lg bg-slate-50 p-4">
          <p class="text-[11px] font-black uppercase tracking-wide text-slate-500">Access</p>
          <p class="mt-1 text-sm font-bold text-slate-800">{{ accessLabel }}</p>
        </div>
      </div>

      <div v-if="!imageOnly" class="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <button
          type="submit"
          class="flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          :class="accentButton"
          :disabled="loading"
        >
          <i :class="loading ? 'fa-solid fa-spinner animate-spin' : 'fa-solid fa-floppy-disk'"></i>
          {{ loading ? "Saving..." : "Save Changes" }}
        </button>
      </div>
    </form>

    <form
      v-if="!imageOnly"
      class="mt-5 w-full rounded-xl border bg-white p-6 shadow-sm"
      :class="accentBorder"
      @submit.prevent="savePassword"
    >
      <div class="mb-5">
        <h2 class="text-lg font-black text-slate-900">Change Password</h2>
        <p class="mt-1 text-xs font-semibold text-slate-500">Use at least 8 characters and confirm the new password.</p>
      </div>

      <p
        v-if="passwordFeedback"
        class="mb-5 rounded-lg border px-4 py-3 text-[13px] font-bold"
        :class="passwordFeedbackType === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-600'"
        role="status"
      >
        {{ passwordFeedback }}
      </p>

      <div class="grid gap-5 md:grid-cols-3">
        <label class="grid gap-2 text-[12px] font-black uppercase text-slate-600">
          Current Password
          <span class="relative">
            <input
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="h-11 w-full rounded-lg border border-slate-200 px-4 pr-11 text-sm font-semibold normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
            <button
              type="button"
              class="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition hover:text-slate-700"
              :aria-label="showCurrentPassword ? 'Hide current password' : 'Show current password'"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <i :class="showCurrentPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </span>
        </label>
        <label class="grid gap-2 text-[12px] font-black uppercase text-slate-600">
          New Password
          <span class="relative">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              minlength="8"
              autocomplete="new-password"
              class="h-11 w-full rounded-lg border border-slate-200 px-4 pr-11 text-sm font-semibold normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
            <button
              type="button"
              class="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition hover:text-slate-700"
              :aria-label="showNewPassword ? 'Hide new password' : 'Show new password'"
              @click="showNewPassword = !showNewPassword"
            >
              <i :class="showNewPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </span>
        </label>
        <label class="grid gap-2 text-[12px] font-black uppercase text-slate-600">
          Confirm Password
          <span class="relative">
            <input
              v-model="passwordConfirmation"
              :type="showPasswordConfirmation ? 'text' : 'password'"
              required
              minlength="8"
              autocomplete="new-password"
              class="h-11 w-full rounded-lg border border-slate-200 px-4 pr-11 text-sm font-semibold normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
            <button
              type="button"
              class="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition hover:text-slate-700"
              :aria-label="showPasswordConfirmation ? 'Hide password confirmation' : 'Show password confirmation'"
              @click="showPasswordConfirmation = !showPasswordConfirmation"
            >
              <i :class="showPasswordConfirmation ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </span>
        </label>
      </div>

      <div class="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <button
          type="submit"
          class="flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          :class="accentButton"
          :disabled="loading"
        >
          <i :class="loading ? 'fa-solid fa-spinner animate-spin' : 'fa-solid fa-key'"></i>
          {{ loading ? "Updating..." : "Update Password" }}
        </button>
      </div>
    </form>

    <div
      v-if="showLogoutModal"
      class="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4"
      role="presentation"
      @click.self="showLogoutModal = false"
    >
      <section class="w-full max-w-sm overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="logout-title">
        <div class="px-6 pb-5 pt-6 text-center">
          <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-xl text-red-600">
            <i class="fa-solid fa-right-from-bracket"></i>
          </span>
          <h2 id="logout-title" class="mt-4 text-lg font-black text-slate-900">Do you want to logout?</h2>
          <p class="mt-2 text-sm font-medium text-slate-500">You will need to sign in again to access the system.</p>
        </div>

        <div class="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button type="button" class="h-10 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-100" @click="showLogoutModal = false">
            Cancel
          </button>
          <button type="button" class="flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold text-white transition hover:bg-red-700" @click="logout">
            <i class="fa-solid fa-right-from-bracket"></i>
            Logout
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAccountProfile } from "../composables/useAccountProfile";

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
  accessLabel: {
    type: String,
    default: "Inventory System",
  },
  accent: {
    type: String,
    default: "blue",
  },
  imageOnly: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const imageInputRef = ref(null);
const formName = ref("");
const formEmail = ref("");
const selectedImageFile = ref(null);
const selectedImagePreview = ref("");
const feedbackMessage = ref("");
const feedbackType = ref("");
const showLogoutModal = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const passwordConfirmation = ref("");
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showPasswordConfirmation = ref(false);
const passwordFeedback = ref("");
const passwordFeedbackType = ref("");
let previewObjectUrl = "";

const {
  loading,
  error,
  account,
  profileName,
  profileEmail,
  profileAvatar,
  fetchProfile,
  updateProfile,
  uploadProfileImage,
  changePassword,
} = useAccountProfile(props.role);

const isEmerald = computed(() => props.accent === "emerald");
const accentText = computed(() => isEmerald.value ? "text-emerald-600" : "text-blue-600");
const accentBorder = computed(() => isEmerald.value ? "border-emerald-100" : "border-blue-100");
const accentButton = computed(() => isEmerald.value ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700");
const displayAvatar = computed(() => selectedImagePreview.value || profileAvatar.value || "https://i.pravatar.cc/100");

const loadProfile = async () => {
  await fetchProfile();
  formName.value = account.value.name || "";
  formEmail.value = account.value.email || "";
};

const openImagePicker = () => {
  imageInputRef.value?.click();
};

const handleImageChange = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  feedbackMessage.value = "";

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    feedbackType.value = "error";
    feedbackMessage.value = "Please select a valid image file.";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    feedbackType.value = "error";
    feedbackMessage.value = "The profile image must be 2 MB or smaller.";
    return;
  }

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
  }

  previewObjectUrl = URL.createObjectURL(file);
  selectedImageFile.value = file;
  selectedImagePreview.value = previewObjectUrl;

  if (!props.imageOnly) {
    return;
  }

  await uploadProfileImage(file);

  if (error.value) {
    feedbackType.value = "error";
    feedbackMessage.value = error.value;
    return;
  }

  selectedImageFile.value = null;
  selectedImagePreview.value = "";

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = "";
  }

  feedbackType.value = "success";
  feedbackMessage.value = "Profile image updated successfully.";
  window.dispatchEvent(new CustomEvent("account-profile-updated"));
};

const clearSelectedImage = () => {
  selectedImageFile.value = null;
  selectedImagePreview.value = "";

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = "";
  }
};

const saveProfile = async () => {
  feedbackMessage.value = "";

  await updateProfile({
    name: formName.value,
    email: formEmail.value,
    file: selectedImageFile.value,
  });

  if (error.value) {
    feedbackType.value = "error";
    feedbackMessage.value = error.value;
    return;
  }

  selectedImageFile.value = null;
  selectedImagePreview.value = "";
  formName.value = account.value.name || formName.value;
  formEmail.value = account.value.email || formEmail.value;
  feedbackType.value = "success";
  feedbackMessage.value = "Profile updated successfully.";
  window.dispatchEvent(new CustomEvent("account-profile-updated"));
};

const savePassword = async () => {
  passwordFeedback.value = "";

  if (newPassword.value !== passwordConfirmation.value) {
    passwordFeedbackType.value = "error";
    passwordFeedback.value = "The new password and confirmation do not match.";
    return;
  }

  const changed = await changePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    passwordConfirmation: passwordConfirmation.value,
  });

  if (!changed) {
    passwordFeedbackType.value = "error";
    passwordFeedback.value = error.value || "Unable to change the password.";
    return;
  }

  currentPassword.value = "";
  newPassword.value = "";
  passwordConfirmation.value = "";
  passwordFeedbackType.value = "success";
  passwordFeedback.value = "Password updated successfully.";
};

const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("user_role");
  sessionStorage.removeItem("auth_session");
  router.push("/login");
};

const handleKeydown = (event) => {
  if (event.key === "Escape") {
    showLogoutModal.value = false;
  }
};

onMounted(() => {
  loadProfile();
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
  }
});
</script>
