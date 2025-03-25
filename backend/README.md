
# Skillversity Backend API

This is the Flask-based backend for the Skillversity learning platform.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python app.py
   ```

The server will start on http://localhost:5000

## Database

The application uses SQLite by default. The database file will be created automatically when you first run the application.

To seed the database with sample data, make a POST request to `/api/seed` with the server running in development mode.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login a user

### Courses
- GET `/api/courses` - Get all courses
- GET `/api/courses/<course_id>` - Get a specific course
- GET `/api/courses/category/<category>` - Get courses by category
- GET `/api/courses/search?q=<query>` - Search courses

### Admin Routes (Protected)
- POST `/api/admin/courses` - Add a new course
- PUT `/api/admin/courses/<course_id>` - Update a course
- DELETE `/api/admin/courses/<course_id>` - Delete a course

### Development
- POST `/api/seed` - Seed the database with sample data (only available in development)
