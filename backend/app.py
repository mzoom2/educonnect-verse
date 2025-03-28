from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import os
import datetime
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
from datetime import datetime, timedelta
from functools import wraps
import uuid

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

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
COURSE_RESOURCES_FOLDER = os.path.join(UPLOAD_FOLDER, 'course-resources')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max upload

# Create upload directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(COURSE_RESOURCES_FOLDER, exist_ok=True)

# Initialize SQLAlchemy with app
db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Define User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')  # 'user', 'teacher', or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    user_metadata = db.Column(db.JSON, default={})  # Renamed from 'metadata' to 'user_metadata'
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'metadata': self.user_metadata  # Keep the field name in the API response the same for compatibility
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
        resources = CourseResource.query.filter_by(course_id=self.id).all()
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
            'popularityScore': self.popularity_score,
            'resources': [resource.to_dict() for resource in resources] if resources else []
        }

# Define Course Resource model for storing uploaded files info
class CourseResource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'video', 'pdf', 'image', 'other'
    url = db.Column(db.String(255), nullable=False)
    size = db.Column(db.Integer)  # file size in bytes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'type': self.type,
            'url': self.url,
            'size': self.size,
            'uploadedAt': self.created_at.isoformat()
        }

# Define activity log model for tracking user activities
class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    action_type = db.Column(db.String(50), nullable=False)  # e.g., 'login', 'course_view', 'enrollment'
    details = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action_type': self.action_type,
            'details': self.details,
            'created_at': self.created_at.isoformat()
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
            if not current_user:
                raise Exception("User not found")
        except Exception as e:
            return jsonify({'message': f'Token is invalid! {str(e)}'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Add a health check endpoint
@app.route('/api/health-check', methods=['GET', 'OPTIONS'])
def health_check():
    """Simple health check endpoint that returns a 200 OK status"""
    if request.method == 'OPTIONS':
        # Handle preflight requests for CORS
        response = app.make_default_options_response()
        return response
        
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'skillversity-backend'
    }), 200

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
    
    # Log the activity
    log_activity = ActivityLog(
        user_id=new_user.id,
        action_type='registration',
        details=f"User {new_user.email} registered"
    )
    db.session.add(log_activity)
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
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Log the activity
    log_activity = ActivityLog(
        user_id=user.id,
        action_type='login',
        details=f"User {user.email} logged in"
    )
    db.session.add(log_activity)
    db.session.commit()
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.secret_key, algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

# Add current user endpoint
@app.route('/api/auth/current-user', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'user': current_user.to_dict()
    }), 200

# Add user metadata endpoint
@app.route('/api/auth/users/<int:user_id>/metadata', methods=['PUT'])
@token_required
def update_user_metadata(current_user, user_id):
    # Ensure user can only update their own metadata
    if current_user.id != user_id and current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized to update this user\'s metadata'}), 403
    
    data = request.get_json()
    if not data or 'metadata' not in data:
        return jsonify({'message': 'Missing metadata field'}), 400
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Update the metadata
        if user.user_metadata:  # Changed from user.metadata to user.user_metadata
            # If user already has metadata, update it
            user.user_metadata.update(data['metadata'])  # Changed from user.metadata to user.user_metadata
        else:
            # Otherwise, set it directly
            user.user_metadata = data['metadata']  # Changed from user.metadata to user.user_metadata
        
        db.session.commit()
        
        return jsonify({
            'message': 'User metadata updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating user metadata: {str(e)}")
        return jsonify({'message': f'Error updating metadata: {str(e)}'}), 500

# Add teacher application endpoint
@app.route('/api/auth/users/<int:user_id>/apply-teacher', methods=['POST'])
@token_required
def apply_as_teacher(current_user, user_id):
    # Ensure user can only apply for themselves
    if current_user.id != user_id:
        return jsonify({'message': 'Unauthorized to submit application for another user'}), 403
    
    # Check if user is already a teacher
    if current_user.role == 'teacher':
        return jsonify({'message': 'User is already a teacher'}), 400
    
    data = request.get_json()
    if not data or 'teacherApplication' not in data:
        return jsonify({'message': 'Missing application data'}), 400
    
    try:
        # Get application data
        application_data = data['teacherApplication']
        
        # Update user metadata with application data
        if not current_user.user_metadata:
            current_user.user_metadata = {}
        
        # Add the teacher application to user metadata
        current_user.user_metadata['teacherApplication'] = application_data
        
        # Update the user role to 'teacher' immediately
        current_user.role = 'teacher'
        
        # Log the activity
        log_activity = ActivityLog(
            user_id=current_user.id,
            action_type='teacher_application',
            details=f"User applied to become a teacher: {current_user.email}"
        )
        db.session.add(log_activity)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Teacher application submitted successfully and role updated to teacher',
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error submitting teacher application: {str(e)}")
        return jsonify({'message': f'Error submitting application: {str(e)}'}), 500

# File upload route
@app.route('/api/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    try:
        # Check if file is included in the request
        if 'file' not in request.files:
            return jsonify({'message': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
        
        # Get type and folder from form data
        file_type = request.form.get('type', 'other')
        folder = request.form.get('folder', 'general')
        course_id = request.form.get('course_id')
        course_title = request.form.get('course_title', '')
        
        # Create folder path
        folder_path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # Generate a descriptive filename that's still unique
        original_filename = secure_filename(file.filename)
        file_extension = os.path.splitext(original_filename)[1]
        
        # Create a sanitized username and course title for the filename
        username_part = secure_filename(current_user.username or 'user').lower()[:20]
        course_part = ''
        if course_title:
            course_part = secure_filename(course_title).lower()[:30]
        elif course_id and course_id.isdigit():
            course = Course.query.get(int(course_id))
            if course:
                course_part = secure_filename(course.title).lower()[:30]
        
        # Replace spaces with underscores for all parts
        username_part = username_part.replace(' ', '_')
        course_part = course_part.replace(' ', '_')
        
        # Create unique descriptive filename
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        random_suffix = uuid.uuid4().hex[:8]  # 8 chars from UUID for uniqueness
        
        if course_part:
            unique_filename = f"{username_part}_{course_part}_{timestamp}_{random_suffix}{file_extension}"
        else:
            unique_filename = f"{username_part}_{timestamp}_{random_suffix}{file_extension}"
        
        # Save the file
        file_path = os.path.join(folder_path, unique_filename)
        file.save(file_path)
        
        # Create relative URL path for the file
        file_url = f"/uploads/{folder}/{unique_filename}"
        
        # Add record to the database if this is a course resource
        if course_id and course_id.isdigit():
            course = Course.query.get(int(course_id))
            if course:
                resource = CourseResource(
                    course_id=int(course_id),
                    name=original_filename,
                    type=file_type,
                    url=file_url,
                    size=os.path.getsize(file_path)
                )
                db.session.add(resource)
                db.session.commit()
        
        # Log the activity
        log_activity = ActivityLog(
            user_id=current_user.id,
            action_type='file_upload',
            details=f"User uploaded file: {original_filename}"
        )
        db.session.add(log_activity)
        db.session.commit()
        
        return jsonify({
            'message': 'File uploaded successfully',
            'fileUrl': file_url,
            'originalName': original_filename,
            'type': file_type
        }), 201
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return jsonify({'message': f'Error uploading file: {str(e)}'}), 500

# Serve uploaded files
@app.route('/uploads/<path:folder>/<filename>')
def serve_file(folder, filename):
    return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER'], folder), filename)

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
    
    # Log the activity if user is logged in
    if 'Authorization' in request.headers:
        try:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
                data = jwt.decode(token, app.secret_key, algorithms=["HS256"])
                current_user = User.query.get(data['user_id'])
                
                log_activity = ActivityLog(
                    user_id=current_user.id,
                    action_type='course_view',
                    details=f"User viewed course: {course.title}"
                )
                db.session.add(log_activity)
                db.session.commit()
        except:
            pass  # Silently ignore if token is invalid
    
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

# Add course resources endpoint
@app.route('/api/courses/<course_id>/resources', methods=['GET'])
def get_course_resources(course_id):
    resources = CourseResource.query.filter_by(course_id=course_id).all()
    return jsonify([resource.to_dict() for resource in resources]), 200

@app.route('/api/courses/<course_id>/resources', methods=['POST'])
@token_required
def add_course_resource(current_user, course_id):
    # Ensure the user has permission (teacher or admin)
    if current_user.role not in ['teacher', 'admin']:
        return jsonify({'message': 'Unauthorized to add resources'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'message': 'Course not found'}), 404
    
    data = request.get_json()
    if not data or not all(k in data for k in ('name', 'type', 'url')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    resource = CourseResource(
        course_id=int(course_id),
        name=data['name'],
        type=data['type'],
        url=data['url'],
        size=data.get('size', 0)
    )
    
    db.session.add(resource)
    db.session.commit()
    
    return jsonify(resource.to_dict()), 201

# Admin-only routes
@app.route('/api/admin/courses', methods=['POST'])
@token_required
def add_course(current_user):
    # Log everything for debugging
    logger.debug(f"Add course request from user {current_user.id} with role {current_user.role}")
    logger.debug(f"Request data: {request.get_json()}")

    if current_user.role != 'admin' and current_user.role != 'teacher':
        logger.debug(f"Unauthorized: user role is {current_user.role}")
        return jsonify({'message': 'Admin or teacher access required'}), 403
    
    data = request.get_json()
    
    # Validate input data
    if not data:
        logger.debug("No data provided")
        return jsonify({'message': 'No data provided'}), 400
        
    if not data.get('title'):
        logger.debug("Missing title")
        return jsonify({'message': 'Missing title field'}), 400
        
    if not data.get('author'):
        logger.debug("Missing author")
        return jsonify({'message': 'Missing author field'}), 400
    
    try:
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
        
        # Log the activity
        action_type = 'course_create_teacher' if current_user.role == 'teacher' else 'course_create_admin'
        log_activity = ActivityLog(
            user_id=current_user.id,
            action_type=action_type,
            details=f"{current_user.role.capitalize()} created course: {new_course.title}"
        )
        db.session.add(log_activity)
        db.session.commit()
        
        logger.debug(f"Course created successfully: {new_course.to_dict()}")
        return jsonify(new_course.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating course: {str(e)}")
        return jsonify({'message': f'Error creating course: {str(e)}'}), 500

@app.route('/api/admin/courses/<course_id>', methods=['PUT'])
@token_required
def update_course(current_user, course_id):
    if current_user.role != 'admin' and current_user.role != 'teacher':
        return jsonify({'message': 'Admin or teacher access required'}), 403
    
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
    
    # Log the activity
    action_type = 'course_update_teacher' if current_user.role == 'teacher' else 'course_update_admin'
    log_activity = ActivityLog(
        user_id=current_user.id,
        action_type=action_type,
        details=f"{current_user.role.capitalize()} updated course: {course.title}"
    )
    db.session.add(log_activity)
    db.session.commit()
    
    return jsonify(course.to_dict()), 200

@app.route('/api/admin/courses/<course_id>', methods=['DELETE'])
@token_required
def delete_course(current_user, course_id):
    if current_user.role != 'admin' and current_user.role != 'teacher':
        return jsonify({'message': 'Admin or teacher access required'}), 403
    
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'message': 'Course not found'}), 404
    
    course_title = course.title
    db.session.delete(course)
    db.session.commit()
    
    # Log the activity
    action_type = 'course_delete_teacher' if current_user.role == 'teacher' else 'course_delete_admin'
    log_activity = ActivityLog(
        user_id=current_user.id,
        action_type=action_type,
        details=f"{current_user.role.capitalize()} deleted course: {course_title}"
    )
    db.session.add(log_activity)
    db.session.commit()
    
    return jsonify({'message': 'Course deleted successfully'}), 200

# Admin dashboard data endpoints
@app.route('/api/admin/dashboard', methods=['GET'])
@token_required
def get_admin_dashboard(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    # Get total users
    total_users = User.query.count()
    
    # Get new users today
    today = datetime.today().date()
    new_users_today = User.query.filter(
        db.func.date(User.created_at) == today
    ).count()
    
    # Get today's logins
    today_logins = User.query.filter(
        db.func.date(User.last_login) == today
    ).count()
    
    # Get total courses
    total_courses = Course.query.count()
    
    # Get courses by category
    categories = db.session.query(Course.category, db.func.count(Course.id)).group_by(Course.category).all()
    categories_data = [{'name': cat, 'count': count} for cat, count in categories]
    
    # Get total enrollments
    total_enrollments = db.session.query(db.func.sum(Course.enrollment_count)).scalar() or 0
    
    # Get most viewed courses
    most_viewed_courses = Course.query.order_by(Course.view_count.desc()).limit(5).all()
    
    # Get recent activities
    recent_activities = ActivityLog.query.order_by(ActivityLog.created_at.desc()).limit(10).all()
    
    # Format activities with user information
    activities_with_user = []
    for activity in recent_activities:
        user = User.query.get(activity.user_id)
        if user:
            activities_with_user.append({
                'id': activity.id,
                'username': user.username,
                'email': user.email,
                'action_type': activity.action_type,
                'details': activity.details,
                'created_at': activity.created_at.isoformat()
            })
    
    return jsonify({
        'stats': {
            'total_users': total_users,
            'new_users_today': new_users_today,
            'today_logins': today_logins,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'avg_courses_per_user': round(total_enrollments / total_users, 1) if total_users > 0 else 0
        },
        'categories': categories_data,
        'most_viewed_courses': [course.to_dict() for course in most_viewed_courses],
        'recent_activities': activities_with_user
    }), 200

@app.route('/api/admin/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

# Add token verification endpoint
@app.route('/api/auth/verify-token', methods=['GET'])
@token_required
def verify_token(current_user):
    return jsonify({
        'valid': True,
        'user': current_user.to_dict()
    }), 200

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
            "view_count": 9
