import React from "react";

const CourseCard = ({ course, compact = false, isAdmin = false, onDelete, onToggleFeatured, onEdit }) => {
  const cardClass = compact 
    ? "bg-gray-800/50 rounded-lg overflow-hidden border border-gray-600/50 hover:border-gray-500/50 transition-all group"
    : "bg-gray-800/50 rounded-xl overflow-hidden border border-gray-600/50 hover:border-gray-500/50 transition-all group transform hover:scale-105";

  return (
    <div className={cardClass}>
      <div className="relative">
        {!isAdmin && course.external_link ? (
          <a href={course.external_link} target="_blank" rel="noopener noreferrer">
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-48 object-cover hover:opacity-90 transition-opacity cursor-pointer"
            />
          </a>
        ) : (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-gray-900/80 text-white px-3 py-1 rounded-full text-sm font-medium">
            {course.category}
          </span>
        </div>

        {/* Featured Badge */}
        {course.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              ⭐ Destaque
            </span>
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full text-sm font-medium transition-colors"
              title="Editar curso"
            >
              ✏️
            </button>
            <button
              onClick={onToggleFeatured}
              className={`p-2 rounded-full text-sm font-medium transition-colors ${
                course.featured 
                  ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                  : "bg-gray-700 text-gray-300 hover:bg-yellow-500 hover:text-white"
              }`}
              title={course.featured ? "Remover destaque" : "Adicionar destaque"}
            >
              ⭐
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-sm font-medium transition-colors"
              title="Deletar curso"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      
      <div className={compact ? "p-4" : "p-6"}>
        <h3 className={`font-bold text-white mb-2 group-hover:text-red-400 transition-colors ${compact ? "text-lg" : "text-xl"}`}>
          {course.title}
        </h3>
        
        <p className={`text-gray-400 mb-4 ${compact ? "text-sm line-clamp-2" : "text-base"}`}>
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>{course.instructor}</span>
          <span>{course.duration}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-400">
            R$ {course.price.toFixed(2).replace('.', ',')}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              course.level === 'Iniciante' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              course.level === 'Intermediário' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {course.level}
            </span>
          </div>
        </div>
        
{!isAdmin && course.external_link && (
          <a
            href={course.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2 rounded-lg font-medium transition-all text-center"
          >
            Acessar Curso
          </a>
        )}
        
        {!isAdmin && !course.external_link && (
          <button className="w-full mt-4 bg-gray-600 text-gray-300 py-2 rounded-lg font-medium cursor-not-allowed">
            Link não disponível
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;