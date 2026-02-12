export const API_URL = import.meta.env.VITE_API_URL;
export const UPLOADS_URL = `${API_URL}/uploads`;

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("access_token");

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Якщо заголовок Content-Type вже заданий — не міняємо
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });



  if (!response.ok) {
    let data = null;

    try {
      data = await response.clone().json();
    } catch (e) {
    }

    if (
      response.status === 401 &&
      data?.msg === "Token has expired"
    ) {
      localStorage.removeItem("access_token");

      window.location.href = "/";
      return;
    }


    throw new Error(data?.msg || "Request failed");
  }

  return response.json();
};