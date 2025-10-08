import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  // Verifica se o usuário está logado como administrador
  const isLogged = localStorage.getItem("adminLogged") === "true";

  // Se não estiver logado, redireciona para a página de login
  if (!isLogged) return <Navigate to="/login" replace />;

  // Se estiver logado, permite acessar as rotas-filhas
  return <Outlet />;
};

export default AdminRoute;
