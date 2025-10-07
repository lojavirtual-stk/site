import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import do Link adicionado
import AdminHeader from "../components/AdminHeader";
import CourseCard from "../components/CourseCard";
import AddCourseModal from "../components/AddCourseModal";
import EditCourseModal from "../components/EditCourseModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const statsResponse = await axios.get(`${API}/stats`);
      setStats(statsResponse.data);

      const coursesResponse = await axios.get(`${API}/courses`);
      setCourses(coursesResponse.data);

      const categoriesResponse = await axios.get(`${API}/categories`);
      setCategories(categoriesResponse.data);

    } catch (error) {
      console.error("Erro ao carregar dados do admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseAdded = () => {
    setShowAddModal(false);
    loadData();
  };

  const handleCourseUpdated = () => {
    setShowEditModal(false);
    setSelectedCourse(null);
    loadData();
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Tem certeza que deseja deletar este curso?")) {
      try {
        await axios.delete(`${API}/courses/${courseId}`);
        loadData();
      } catch (error) {
        console.error("Erro ao deletar curso:", error);
        alert("Erro ao deletar curso");
      }
    }
  };

  const toggleFeatured = async (courseId, currentFeatured) => {
    try {
      await axios.put(`${API}/courses/${courseId}`, {
        featured: !currentFeatured
      });
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
    }
  };

  // Função de logout discreto
  const handleLogout = () => {
    localStorage.removeItem("adminLogged"); // remove a sessão
    window.location.href = "/"; // redireciona imediatamente para o site
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando painel administrativo...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader />

      {/* Botões Volta ao site e Logout */}
      <div className="p-4 flex justify-end gap-2">
        <Link
          to="/"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
        >
          Volta ao site
        </Link>

        <button
          onClick={handleLogout}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">TOTAL DE CURSOS</h3>
            <p className="text-4xl font-bold text-red-400">{stats.total_courses || 0}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">CATEGORIAS</h3>
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((category) => (
                <span
                  key={category.id}
                  className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm border border-red-500/30"
                >
                  {category.name} ({category.course_count})
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">CURSOS EM DESTAQUE</h3>
            <p className="text-4xl font-bold text-green-400">{stats.featured_courses || 0}</p>
          </div>
        </div>

        {/* Add Course Button */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Adicionar Novo Curso
          </button>
        </div>

        {/* Courses Management */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Gerenciar Cursos ({courses.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="relative">
                <CourseCard 
                  course={course} 
                  isAdmin={true}
                  onEdit={() => handleEditCourse(course)}
                  onDelete={() => handleDeleteCourse(course.id)}
                  onToggleFeatured={() => toggleFeatured(course.id, course.featured)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <AddCourseModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onCourseAdded={handleCourseAdded}
        />
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          categories={categories}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCourse(null);
          }}
          onCourseUpdated={handleCourseUpdated}
        />
      )}
    </div>
  );
};

export default AdminPanel;
