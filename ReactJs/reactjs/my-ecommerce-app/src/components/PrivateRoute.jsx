import React from "react";
import { Navigate } from "react-router-dom";

/**
 * PrivateRoute защищает страницы от неавторизованных пользователей.
 * Если токена нет → редирект на /catalog.
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Если нет токена, отправляем на каталог
    return <Navigate to="/" replace />;
  }

  // Если есть токен, рендерим содержимое
  return children;
};

export default PrivateRoute;
