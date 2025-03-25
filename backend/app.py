
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import os
import datetime
import logging
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Define SQLAlchemy base class
class Base(DeclarativeBase):
    pass

# Initialize Flask app and database
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure the database
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///skillversity.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize SQLAlchemy with app
db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Define User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

# Define Course model
class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    author = db.Column(db.String(100), nullable=False)
    image = db.Column(db.String(255))
    rating = db.Column(db.Float, default=0.0)
    duration = db.Column(db.String(50))
    price = db.Column(db.String(50))
    category = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    view_count = db.Column(db.Integer, default=0)
    enrollment_count = db.Column(db.Integer, default=0)
    popularity_score = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'author': self.author,
            'image': self.image,
            'rating': self.rating,
            'duration': self.duration,
            'price': self.price,
            'category': self.category,
            'createdAt': self.created_at.isoformat(),
            'viewCount': self.view_count,
            'enrollmentCount': self.enrollment_count,
            'popularityScore': self.popularity_score
        }

# JWT token authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Routes for authentication
@app.route('/api/auth/register', methods=['POST'])
def register_user():
    data = request.get_json()
    
    # Validate input data
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 409
    
    # Create new user
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        email=data['email'],
        password=hashed_password,
        username=data.get('username', ''),
        role='admin' if data['email'] == 'mzoomolabewa@gmail.com' else 'user'
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.secret_key, algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

# Routes for courses
@app.route('/api/courses', methods=['GET'])
def get_all_courses():
    courses = Course.query.all()
    return jsonify([course.to_dict() for course in courses]), 200

@app.route('/api/courses/<course_id>', methods=['GET'])
def get_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'message': 'Course not found'}), 404
    
    # Increment view count
    course.view_count += 1
    db.session.commit()
    
    return jsonify(course.to_dict()), 200

@app.route('/api/courses/category/<category>', methods=['GET'])
def get_courses_by_category(category):
    courses = Course.query.filter_by(category=category).all()
    return jsonify([course.to_dict() for course in courses]), 200

@app.route('/api/courses/search', methods=['GET'])
def search_courses():
    query = request.args.get('q', '')
    if not query:
        return jsonify([]), 200
    
    courses = Course.query.filter(
        db.or_(
            Course.title.ilike(f'%{query}%'),
            Course.category.ilike(f'%{query}%'),
            Course.author.ilike(f'%{query}%')
        )
    ).all()
    
    return jsonify([course.to_dict() for course in courses]), 200

# Admin-only routes
@app.route('/api/admin/courses', methods=['POST'])
@token_required
def add_course(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    data = request.get_json()
    
    # Validate input data
    if not data or not data.get('title') or not data.get('author'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    new_course = Course(
        title=data['title'],
        description=data.get('description', ''),
        author=data['author'],
        image=data.get('image', ''),
        rating=data.get('rating', 0.0),
        duration=data.get('duration', ''),
        price=data.get('price', ''),
        category=data.get('category', ''),
        view_count=data.get('viewCount', 0),
        enrollment_count=data.get('enrollmentCount', 0),
        popularity_score=data.get('popularityScore', 0)
    )
    
    db.session.add(new_course)
    db.session.commit()
    
    return jsonify(new_course.to_dict()), 201

@app.route('/api/admin/courses/<course_id>', methods=['PUT'])
@token_required
def update_course(current_user, course_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'message': 'Course not found'}), 404
    
    data = request.get_json()
    
    # Update course fields
    if 'title' in data:
        course.title = data['title']
    if 'description' in data:
        course.description = data['description']
    if 'author' in data:
        course.author = data['author']
    if 'image' in data:
        course.image = data['image']
    if 'rating' in data:
        course.rating = data['rating']
    if 'duration' in data:
        course.duration = data['duration']
    if 'price' in data:
        course.price = data['price']
    if 'category' in data:
        course.category = data['category']
    
    db.session.commit()
    
    return jsonify(course.to_dict()), 200

@app.route('/api/admin/courses/<course_id>', methods=['DELETE'])
@token_required
def delete_course(current_user, course_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'message': 'Course not found'}), 404
    
    db.session.delete(course)
    db.session.commit()
    
    return jsonify({'message': 'Course deleted successfully'}), 200

# Seed sample data
@app.route('/api/seed', methods=['POST'])
def seed_data():
    # Only run in development environment
    if os.environ.get('FLASK_ENV') != 'development' and not os.environ.get('ALLOW_SEED'):
        return jsonify({'message': 'Not allowed in this environment'}), 403
    
    # Sample courses data from your existing frontend
    sample_courses = [
        {
            "title": "Introduction to Machine Learning with Python",
            "author": "Dr. Sarah Johnson",
            "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            "rating": 4.8,
            "duration": "8 weeks",
            "price": "₦15,000",
            "category": "Data Science",
            "view_count": 1250,
            "enrollment_count": 320,
            "popularity_score": 95
        },
        {
            "title": "Modern Web Development: React & Node.js",
            "author": "Michael Chen",
            "image": "https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&auto=format&fit=crop&w=1206&q=80",
            "rating": 4.7,
            "duration": "10 weeks",
            "price": "₦18,000",
            "category": "Programming",
            "view_count": 980,
            "enrollment_count": 210,
            "popularity_score": 88
        },
        {
            "title": "Fundamentals of UI/UX Design",
            "author": "Emma Thompson",
            "image": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            "rating": 4.9,
            "duration": "6 weeks",
            "price": "₦14,500",
            "category": "Design",
            "view_count": 1100,
            "enrollment_count": 280,
            "popularity_score": 92
        },
        {
            "title": "Digital Marketing Fundamentals",
            "author": "Jessica Adams",
            "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            "rating": 4.6,
            "duration": "6 weeks",
            "price": "₦12,500",
            "category": "Marketing",
            "view_count": 860,
            "enrollment_count": 175,
            "popularity_score": 83
        },
        {
            "title": "Financial Planning & Investment Strategies",
            "author": "Robert Williams",
            "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            "rating": 4.9,
            "duration": "4 weeks",
            "price": "₦20,000",
            "category": "Finance",
            "view_count": 750,
            "enrollment_count": 150,
            "popularity_score": 87
        }
    ]
    
    # Create admin user
    admin_exists = User.query.filter_by(email='mzoomolabewa@gmail.com').first()
    if not admin_exists:
        admin_user = User(
            email='mzoomolabewa@gmail.com',
            password=generate_password_hash('adminpassword'),  # Change this in production
            username='Admin',
            role='admin'
        )
        db.session.add(admin_user)
    
    # Add sample courses
    for course_data in sample_courses:
        # Check if course already exists
        existing_course = Course.query.filter_by(title=course_data['title']).first()
        if not existing_course:
            new_course = Course(
                title=course_data['title'],
                description=course_data.get('description', f"Description for {course_data['title']}"),
                author=course_data['author'],
                image=course_data['image'],
                rating=course_data['rating'],
                duration=course_data['duration'],
                price=course_data['price'],
                category=course_data['category'],
                view_count=course_data.get('view_count', 0),
                enrollment_count=course_data.get('enrollment_count', 0),
                popularity_score=course_data.get('popularity_score', 0)
            )
            db.session.add(new_course)
    
    db.session.commit()
    
    return jsonify({'message': 'Database seeded successfully'}), 200

# Replace the deprecated before_first_request with a different approach
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

