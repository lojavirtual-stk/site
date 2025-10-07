from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import shutil
import aiofiles

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="EduShop API", description="API para Loja Virtual de Cursos")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    image_url: str
    price: float
    instructor: str
    duration: str
    level: str
    external_link: Optional[str] = None
    featured: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    image_url: str
    price: float
    instructor: str
    duration: str
    level: str
    external_link: Optional[str] = None
    featured: bool = False

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    instructor: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    external_link: Optional[str] = None
    featured: Optional[bool] = None

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    course_count: int = 0

class CategoryCreate(BaseModel):
    name: str
    description: str
    icon: str

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Upload Route
@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload de imagem para cursos"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Return the URL path
    image_url = f"/uploads/{unique_filename}"
    return {"image_url": image_url}

# Course Routes
@api_router.get("/courses", response_model=List[Course])
async def get_courses(category: Optional[str] = None, featured: Optional[bool] = None):
    """Listar todos os cursos com filtros opcionais"""
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    
    courses = await db.courses.find(query).to_list(1000)
    return [Course(**course) for course in courses]

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    """Obter um curso específico"""
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    return Course(**course)

@api_router.post("/courses", response_model=Course)
async def create_course(course_data: CourseCreate):
    """Criar um novo curso"""
    course = Course(**course_data.dict())
    await db.courses.insert_one(course.dict())
    
    # Atualizar contador da categoria
    await update_category_count(course.category)
    
    return course

@api_router.put("/courses/{course_id}", response_model=Course)
async def update_course(course_id: str, course_data: CourseUpdate):
    """Atualizar um curso existente"""
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    
    update_data = {k: v for k, v in course_data.dict().items() if v is not None}
    if update_data:
        await db.courses.update_one({"id": course_id}, {"$set": update_data})
        
        # Se a categoria mudou, atualizar contadores
        if "category" in update_data and update_data["category"] != course["category"]:
            await update_category_count(course["category"])
            await update_category_count(update_data["category"])
    
    updated_course = await db.courses.find_one({"id": course_id})
    return Course(**updated_course)

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    """Deletar um curso"""
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Curso não encontrado")
    
    await db.courses.delete_one({"id": course_id})
    await update_category_count(course["category"])
    
    return {"message": "Curso deletado com sucesso"}

# Category Routes
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    """Listar todas as categorias"""
    categories = await db.categories.find().to_list(1000)
    return [Category(**category) for category in categories]

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate):
    """Criar uma nova categoria"""
    category = Category(**category_data.dict())
    await db.categories.insert_one(category.dict())
    return category

@api_router.get("/stats")
async def get_stats():
    """Obter estatísticas do sistema"""
    total_courses = await db.courses.count_documents({})
    total_categories = await db.categories.count_documents({})
    featured_courses = await db.courses.count_documents({"featured": True})
    
    # Cursos por categoria
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    courses_by_category = await db.courses.aggregate(pipeline).to_list(100)
    
    return {
        "total_courses": total_courses,
        "total_categories": total_categories,
        "featured_courses": featured_courses,
        "courses_by_category": courses_by_category
    }

# Helper function
async def update_category_count(category_name: str):
    """Atualizar contador de cursos da categoria"""
    count = await db.courses.count_documents({"category": category_name})
    await db.categories.update_one(
        {"name": category_name},
        {"$set": {"course_count": count}},
        upsert=True
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Inicializar dados de exemplo se necessário"""
    await init_sample_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

async def init_sample_data():
    """Inicializar dados de exemplo"""
    # Verificar se já existem dados
    existing_courses = await db.courses.count_documents({})
    if existing_courses > 0:
        return
    
    # Criar categorias
    categories = [
        {"name": "Culinária", "description": "Aprenda técnicas culinárias", "icon": "🍳"},
        {"name": "Marketing", "description": "Marketing digital e estratégias", "icon": "📊"},
        {"name": "Design", "description": "Design gráfico e criativo", "icon": "🎨"},
        {"name": "Tecnologia", "description": "Programação e tecnologia", "icon": "💻"},
        {"name": "Finanças", "description": "Educação financeira", "icon": "💰"},
        {"name": "Idiomas", "description": "Aprenda novos idiomas", "icon": "🌍"},
        {"name": "Desenvolvimento Pessoal", "description": "Desenvolva seu potencial", "icon": "🌍"}
    ]
    
    for cat_data in categories:
        category = Category(**cat_data)
        await db.categories.insert_one(category.dict())
    
    # Criar cursos de exemplo
    courses = [
        {
            "title": "Mestre do Churrasco",
            "description": "Aprenda as técnicas secretas do churrasco perfeito",
            "category": "Culinária",
            "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
            "price": 199.90,
            "instructor": "Chef Antonio",
            "duration": "8 horas",
            "level": "Intermediário",
            "external_link": "https://exemplo.com/curso-churrasco",
            "featured": True
        },
        {
            "title": "Marketing Digital Avançado",
            "description": "Estratégias avançadas de marketing digital",
            "category": "Marketing",
            "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
            "price": 299.90,
            "instructor": "Ana Silva",
            "duration": "12 horas",
            "level": "Avançado",
            "external_link": "https://exemplo.com/curso-marketing",
            "featured": True
        },
        {
            "title": "Design Gráfico Profissional",
            "description": "Do básico ao profissional em design gráfico",
            "category": "Design",
            "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
            "price": 249.90,
            "instructor": "Carlos Design",
            "duration": "10 horas",
            "level": "Intermediário",
            "external_link": "https://exemplo.com/curso-design",
            "featured": True
        },
        {
            "title": "Python para Iniciantes",
            "description": "Aprenda programação Python do zero",
            "category": "Tecnologia",
            "image_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
            "price": 179.90,
            "instructor": "João Programador",
            "duration": "15 horas",
            "level": "Iniciante",
            "external_link": "https://exemplo.com/curso-python",
            "featured": False
        },
        {
            "title": "Finanças Pessoais",
            "description": "Organize suas finanças e invista melhor",
            "category": "Finanças",
            "image_url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
            "price": 149.90,
            "instructor": "Maria Financeira",
            "duration": "6 horas",
            "level": "Básico",
            "external_link": "https://exemplo.com/curso-financas",
            "featured": False
        },
        {
            "title": "Inglês Conversação",
            "description": "Melhore sua conversação em inglês",
            "category": "Idiomas",
            "image_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
            "price": 199.90,
            "instructor": "Teacher John",
            "duration": "20 horas",
            "level": "Intermediário",
            "external_link": "https://exemplo.com/curso-ingles",
            "featured": False
        }
    ]
    
    for course_data in courses:
        course = Course(**course_data)
        await db.courses.insert_one(course.dict())
        await update_category_count(course.category)