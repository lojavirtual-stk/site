import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // 🔹 Import para o botão de login
import Header from "../components/Header";
import CourseCard from "../components/CourseCard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar cursos em destaque
      const featuredResponse = await axios.get(`${API}/courses?featured=true`);
      setFeaturedCourses(featuredResponse.data);
      
      // Carregar todos os cursos
      const coursesResponse = await axios.get(`${API}/courses`);
      setCourses(coursesResponse.data);
      
      // Carregar categorias
      const categoriesResponse = await axios.get(`${API}/categories`);
      setCategories(categoriesResponse.data);
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="px-4 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Dezenas de cursos online esperando por você
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Desenvolva novas habilidades com os melhores instrutores do mercado. 
            Aprenda no seu ritmo, quando e onde quiser.
          </p>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Cursos em Destaque
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Categorias Populares
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-700/50 rounded-lg p-6 text-center hover:bg-gray-600/50 transition-all cursor-pointer border border-gray-600/50"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-white font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-400 text-sm">
                  {category.course_count} curso{category.course_count !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Courses Section */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Todos os Cursos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 px-4 py-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 Loja Virtual Estock de Kasa. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
