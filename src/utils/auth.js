export const getStoredAuthToken = () => {
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
};

export const getAuthHeaders = (extraHeaders = {}) => {
  const token = getStoredAuthToken();
  const tokenType = localStorage.getItem("token_type") || "Bearer";
  const headers = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...extraHeaders,
  };

  if (token) {
    headers.Authorization = /^bearer\s+/i.test(token) ? token : `${tokenType} ${token}`.trim();
  }

  return headers;
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("auth_user") || "{}") || {};
  } catch {
    return {};
  }
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user.id || user.user_id || "";
};

export const isUnauthenticatedResponse = (response, data = {}) => {
  return response?.status === 401 || String(data?.message || data?.error || "").toLowerCase().includes("unauthenticated");
};
