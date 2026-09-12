<template>
  <main class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <img src="https://i.pinimg.com/1200x/47/44/4e/47444e982c49bd8eb38655b3a0823d95.jpg" alt="Background"
      class="absolute inset-0 w-full h-full object-cover opacity-80" />

    <!-- Login Card -->
    <section class="relative w-full max-w-md sm:max-w-lg p-8 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 shadow-2xl text-white">

      <!-- Title -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">Login Form</h1>
        <p class="text-white/70 mt-2 text-sm">
          Sign in to continue to your account
        </p>
      </div>

      <!-- Form -->
      <form class="space-y-5" @submit.prevent="handleSubmit">

        <!-- Email -->
        <div class="relative">
          <label class="text-sm font-semibold">Email</label>
          <div class="relative mt-2">
            <i class="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-white/70"></i>
            <input v-model="email" type="email" placeholder="Enter your email" autocomplete="username" required
              class="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none focus:ring-1 transition" />
          </div>
        </div>

        <!-- Password -->
        <div class="relative">
          <label class="text-sm font-semibold">Password</label>
          <div class="relative mt-2">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-white/70"></i>

            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter your password"
              required
              class="w-full pl-12 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 outline-none focus:ring-1 transition" />

            <!-- Toggle Password -->
            <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70"
              @click="showPassword = !showPassword">
              <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Forgot -->
        <div class="flex justify-between items-center text-sm">

          <button type="button" class="text-blue-500 ml-auto hover:underline">
            Forgot Password?
          </button>
        </div>

        <!-- Submit Button -->
        <p v-if="errorMessage" class="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="loading"
          class="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-3 font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100">
          <span v-if="loading" class="inline-flex items-center gap-2">
            <i class="fa-solid fa-spinner animate-spin"></i>
            Logging in...
          </span>
          <span v-else>Login</span>
        </button>

        <!-- Register -->
        <p class="text-center text-sm text-white/70 mt-4">
          Don't have an account?
          <a
            :href="telegramContactUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 font-semibold text-yellow-500 hover:underline"
          >
            <i class="fa-brands fa-telegram"></i>
            Ask Team to create one
          </a>
        </p>

      </form>

    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

/* ===== State ===== */
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "https://laravel-inventory-management-2.onrender.com").replace(/\/+$/, "");
const loginEndpoint = `${apiBaseUrl}/login`;
const telegramRequestMessage = "Hello, I would like to request an Inventory Management System account. Please help me create one.";
const telegramContactUrl = `https://t.me/khimreaksmey?text=${encodeURIComponent(telegramRequestMessage)}`;

const parseApiResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      smg: response.ok
        ? "Login response is not valid JSON."
        : "Login server returned an invalid response.",
    };
  }
};

const getApiMessage = (data, fallback = "Login failed. Please try again.") => {
  return (
    data?.message ||
    data?.smg ||
    data?.error ||
    data?.exception ||
    data?.errors?.email?.[0] ||
    data?.errors?.password?.[0] ||
    fallback
  );
};

const getFriendlyLoginError = (message) => {
  const rawMessage = String(message || "").trim();
  const lowerMessage = rawMessage.toLowerCase();

  if (!rawMessage) {
    return "Login failed. Please try again.";
  }

  if (
    lowerMessage.includes("apiresponse") ||
    lowerMessage.includes("sqlstate") ||
    lowerMessage.includes("app\\http\\controllers") ||
    lowerMessage.includes("undefined function") ||
    lowerMessage.includes("connection refused") ||
    lowerMessage.includes("internal server error")
  ) {
    return "Login service is not ready. Please contact the system administrator.";
  }

  if (lowerMessage.includes("failed to fetch") || lowerMessage.includes("networkerror")) {
    return "Cannot connect to the login server. Please check that the API is running.";
  }

  return rawMessage;
};

const getDashboardPath = (user) => {
  const role = String(user?.role || user?.user_type || user?.type || "").toLowerCase().trim();

  if (role === "admin") {
    return "/admin";
  }

  if (role === "manager") {
    return "/manager";
  }

  return "/staff";
};

const getUserRole = (user) => {
  return String(user?.role || user?.user_type || user?.type || "staff").toLowerCase().trim();
};

const isPathAllowedForRole = (path, role) => {
  if (role === "admin") {
    return path === "/admin" || path.startsWith("/admin/");
  }

  if (role === "manager") {
    return path === "/manager" || path.startsWith("/manager/");
  }

  return path === "/staff" || path.startsWith("/staff/");
};

const getLoginRedirectPath = (user) => {
  const dashboardPath = getDashboardPath(user);
  const redirectPath = typeof route.query.redirect === "string" ? route.query.redirect : "";
  const role = getUserRole(user);

  if (redirectPath && isPathAllowedForRole(redirectPath, role)) {
    return redirectPath;
  }

  return dashboardPath;
};

/* ===== UI lock scroll (optional like your original) ===== */
onMounted(() => {
  document.documentElement.classList.add("overflow-hidden");
  document.body.classList.add("overflow-hidden");

  const rememberedEmail = localStorage.getItem("remember_email");

  if (rememberedEmail) {
    email.value = rememberedEmail;
    rememberMe.value = true;
  }
});

onBeforeUnmount(() => {
  document.documentElement.classList.remove("overflow-hidden");
  document.body.classList.remove("overflow-hidden");
});

/* ===== Submit Login ===== */
const handleSubmit = async () => {
  if (!email.value || !password.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch(loginEndpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        device_name: "inventory-web",
      }),
    });

    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(getApiMessage(data, "Email or password is incorrect."));
    }

    const payload = data.data || data;
    const user = payload.user || null;
    const token = payload.token || payload.access_token || null;
    const tokenType = payload.token_type || "Bearer";

    if (!user || !token) {
      throw new Error("Login response is missing user or token data.");
    }

    localStorage.setItem("auth_token", token);
    localStorage.setItem("token_type", tokenType);
    localStorage.setItem("auth_user", JSON.stringify(user));
    localStorage.setItem("user_role", getUserRole(user));
    sessionStorage.setItem("auth_session", "active");

    if (rememberMe.value) {
      localStorage.setItem("remember_email", email.value);
    } else {
      localStorage.removeItem("remember_email");
    }

    router.push(getLoginRedirectPath(user));
  } catch (error) {
    console.error("Login failed:", error);
    errorMessage.value = getFriendlyLoginError(error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.10) inset !important;
  -webkit-text-fill-color: white !important;
  transition: background-color 9999s ease-in-out 0s;
}
</style>
