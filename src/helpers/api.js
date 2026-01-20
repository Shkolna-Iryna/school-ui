const API_URL = "http://localhost:5000";

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let data = null;

    // пробуємо прочитати body (може бути json)
    try {
      data = await response.clone().json();
    } catch (e) {
      // якщо не json - ігноруємо
    }

    // flask-jwt-extended зазвичай повертає 401 + msg
    if (
      response.status === 401 &&
      data?.msg === "Token has expired"
    ) {
      localStorage.removeItem("access_token");

      // редірект на /login
      window.location.href = "/login";
      return; // важливо: щоб далі код не виконувався
    }

    // інакше — стандартна помилка
    throw new Error(data?.msg || "Request failed");
  }

  return response.json();
};