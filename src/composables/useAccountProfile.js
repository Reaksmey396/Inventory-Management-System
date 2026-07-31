import { computed, ref, unref } from "vue";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const appBaseUrl = apiBaseUrl.replace(/\/api$/, "");
const profileEndpoints = [`${apiBaseUrl}/user`, `${apiBaseUrl}/profile`, `${apiBaseUrl}/me`];
const usersEndpoint = `${apiBaseUrl}/users`;

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "{}") || {};
  } catch {
    return {};
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  const tokenType = localStorage.getItem("token_type") || "Bearer";
  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `${tokenType} ${token}`.trim();
  }

  return headers;
};

const parseApiResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const unwrapProfile = (payload) => {
  const data = payload?.data || payload;

  return (
    data?.user ||
    data?.account ||
    data?.profile ||
    payload?.user ||
    payload?.account ||
    payload?.profile ||
    data ||
    {}
  );
};

const combineName = (user) => {
  const firstName = user.first_name || user.firstname || user.fname || "";
  const lastName = user.last_name || user.lastname || user.lname || "";
  return `${firstName} ${lastName}`.trim();
};

const normalizeProfile = (user, fallbackRole = "User") => {
  const role = String(user.role || user.user_type || user.type || fallbackRole || "User").trim();
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : "User";
  const name =
    user.name ||
    user.full_name ||
    user.username ||
    user.admin_name ||
    user.manager_name ||
    user.staff_name ||
    combineName(user) ||
    `${roleLabel} User`;
  const email = user.email || user.user_email || user.admin_email || user.manager_email || user.staff_email || "";
  const avatar = user.user_image || user.avatar_url || user.profile_photo_url || user.image_url || user.photo_url || user.avatar || user.image || user.photo || "";

  return {
    ...user,
    role,
    name,
    email,
    avatar,
  };
};

const resolveAvatarUrl = (avatar) => {
  if (!avatar) {
    return "";
  }

  if (/^(https?:|blob:|data:)/i.test(avatar)) {
    return avatar;
  }

  const cleanPath = String(avatar).replace(/^\/+/, "");
  return `${appBaseUrl}/${cleanPath.startsWith("storage/") ? cleanPath : `storage/${cleanPath}`}`;
};

const appendIfPresent = (formData, key, value) => {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value);
  }
};

export const useAccountProfile = (fallbackRole = "User") => {
  const getFallbackRole = () => unref(fallbackRole) || "User";
  const account = ref(normalizeProfile(getStoredUser(), getFallbackRole()));
  const loading = ref(false);
  const error = ref("");

  const profileName = computed(() => account.value.name || `${getFallbackRole()} User`);
  const profileEmail = computed(() => account.value.email || "");
  const profileRole = computed(() => account.value.role || getFallbackRole());
  const profileAvatar = computed(() => resolveAvatarUrl(account.value.avatar));

  const setAccount = (user) => {
    account.value = normalizeProfile(user, getFallbackRole());
    localStorage.setItem("auth_user", JSON.stringify(account.value));
  };

  const buildProfileFormData = ({ name, email, file, methodOverride = false } = {}) => {
    const currentAccount = account.value?.id ? account.value : normalizeProfile(getStoredUser(), getFallbackRole());
    const formData = new FormData();

    appendIfPresent(formData, "name", name ?? currentAccount.name);
    appendIfPresent(formData, "email", email ?? currentAccount.email);
    appendIfPresent(formData, "phone", currentAccount.phone);
    appendIfPresent(formData, "role", currentAccount.role);
    appendIfPresent(formData, "status", String(currentAccount.status || "active").toLowerCase());
    appendIfPresent(formData, "updated_by", currentAccount.id || currentAccount.user_id);

    if (file) {
      formData.append("user_image", file);
    }

    if (methodOverride) {
      formData.append("_method", "PUT");
    }

    return formData;
  };

  const fetchProfile = async () => {
    loading.value = true;
    error.value = "";

    try {
      let lastError = "Unable to fetch profile.";

      for (const endpoint of profileEndpoints) {
        const response = await fetch(endpoint, {
          headers: getAuthHeaders(),
        });
        const payload = await parseApiResponse(response);

        if (response.ok) {
          const profile = unwrapProfile(payload);
          setAccount(profile);
          return account.value;
        }

        lastError = payload?.message || payload?.error || lastError;

        if (response.status !== 404 && response.status !== 405) {
          break;
        }
      }

      throw new Error(lastError);
    } catch (fetchError) {
      error.value = fetchError.message || "Unable to fetch profile.";
      return account.value;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async ({ name, email, file } = {}) => {
    const currentAccount = account.value?.id ? account.value : normalizeProfile(getStoredUser(), getFallbackRole());
    const userId = currentAccount.id || currentAccount.user_id;

    loading.value = true;
    error.value = "";

    try {
      let lastError = "Unable to update the profile.";
      let response;
      let payload;

      // Profile pages update the authenticated account. This avoids sending
      // Manager and Staff requests through the Admin-only user-management route.
      for (const endpoint of profileEndpoints) {
        response = await fetch(endpoint, {
          method: "POST",
          headers: getAuthHeaders(),
          body: buildProfileFormData({ name, email, file }),
        });
        payload = await parseApiResponse(response);

        if (response.ok) {
          break;
        }

        const validationMessages = Object.values(payload?.errors || {}).flat();
        lastError = validationMessages.join(" ") || payload?.message || payload?.error || lastError;

        if (![403, 404, 405].includes(response.status)) {
          break;
        }
      }

      const normalizedRole = String(currentAccount.role || getFallbackRole()).toLowerCase().trim();
      const canUseAdminUserEndpoint = normalizedRole === "admin" || normalizedRole === "super admin";

      if (!response?.ok && canUseAdminUserEndpoint && userId) {
        response = await fetch(`${usersEndpoint}/${userId}`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: buildProfileFormData({ name, email, file, methodOverride: true }),
        });
        payload = await parseApiResponse(response);

        if (!response.ok) {
          const validationMessages = Object.values(payload?.errors || {}).flat();
          lastError = validationMessages.join(" ") || payload?.message || payload?.error || lastError;
        }
      }

      if (!response?.ok) {
        throw new Error(lastError);
      }

      const profile = unwrapProfile(payload);

      if (profile && Object.keys(profile).length > 0) {
        setAccount({
          ...currentAccount,
          ...profile,
          user_image: profile.user_image || profile.avatar || currentAccount.user_image || currentAccount.avatar,
        });
      }

      await fetchProfile();
      return account.value;
    } catch (uploadError) {
      error.value = uploadError.message || "Unable to update the profile.";
      return account.value;
    } finally {
      loading.value = false;
    }
  };

  const uploadProfileImage = async (file) => {
    if (!file) {
      return account.value;
    }

    return updateProfile({ file });
  };

  const changePassword = async ({ currentPassword, newPassword, passwordConfirmation } = {}) => {
    const currentAccount = account.value?.id ? account.value : normalizeProfile(getStoredUser(), getFallbackRole());
    const userId = currentAccount.id || currentAccount.user_id;

    loading.value = true;
    error.value = "";

    try {
      let lastError = "Unable to change the password.";
      let response;
      let payload;

      const buildPasswordFormData = (methodOverride = false) => {
        const formData = buildProfileFormData({
          name: currentAccount.name,
          email: currentAccount.email,
          methodOverride,
        });

        appendIfPresent(formData, "current_password", currentPassword);
        appendIfPresent(formData, "password", newPassword);
        appendIfPresent(formData, "new_password", newPassword);
        appendIfPresent(formData, "password_confirmation", passwordConfirmation);

        return formData;
      };

      for (const endpoint of profileEndpoints) {
        response = await fetch(endpoint, {
          method: "POST",
          headers: getAuthHeaders(),
          body: buildPasswordFormData(),
        });
        payload = await parseApiResponse(response);

        if (response.ok) break;

        const validationMessages = Object.values(payload?.errors || {}).flat();
        lastError = validationMessages.join(" ") || payload?.message || payload?.error || lastError;

        if (![403, 404, 405].includes(response.status)) break;
      }

      if (!response?.ok && userId) {
        response = await fetch(`${usersEndpoint}/${userId}`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: buildPasswordFormData(true),
        });
        payload = await parseApiResponse(response);

        if (!response.ok) {
          const validationMessages = Object.values(payload?.errors || {}).flat();
          lastError = validationMessages.join(" ") || payload?.message || payload?.error || lastError;
        }
      }

      if (!response?.ok) {
        throw new Error(lastError);
      }

      return true;
    } catch (passwordError) {
      error.value = passwordError.message || "Unable to change the password.";
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    account,
    loading,
    error,
    profileName,
    profileEmail,
    profileRole,
    profileAvatar,
    fetchProfile,
    updateProfile,
    uploadProfileImage,
    changePassword,
    setAccount,
  };
};
