import React from "react";
import { Link } from "react-router-dom";

const AdminHeader = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔧</span>
            <h1 className="text-2xl font-bold text-white">
              Painel Administrativo
            </h1>
          </div>
          
          <Link 
            to="/" 
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <span>←</span>
            Voltar ao Site
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;