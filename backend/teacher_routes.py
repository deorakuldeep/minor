from flask import Blueprint, request, jsonify

# Create a Blueprint instance for teacher routes
# url_prefix='/api/teacher' means all routes start with this path
teacher_bp = Blueprint('teacher_bp', __name__, url_prefix='/api/teacher')

# --- TEACHER LOGIN ROUTE: POST /api/teacher/login ---
@teacher_bp.route('/login', methods=['POST'])
def teacher_login():
    """Placeholder for authenticating a teacher and issuing a JWT token."""
    
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400
        
    # NOTE: THIS IS WHERE YOU WILL ADD YOUR MONGO DB AUTHENTICATION LOGIC
    # For now, use a temporary check to get the frontend working:
    if username == "test_teacher" and password == "password": 
        jwt_token = "dummy_jwt_token_for_teacher_portal" 
        
        return jsonify({
            'message': 'Login successful',
            'token': jwt_token
        }), 200
    else:
        # 401 Unauthorized is returned if credentials fail
        return jsonify({'error': 'Invalid credentials'}), 401


# --- Teacher Dashboard Route (Example) ---
@teacher_bp.route('/classes', methods=['GET'])
def get_assigned_classes():
    """Placeholder route to fetch assigned classes after login."""
    
    # NOTE: In a real app, this route would require JWT verification.
    
    return jsonify({
        'classes': [
            {'name': 'CS 401', 'subject': 'Data Structures', '_id': '1'},
            {'name': 'EE 302', 'subject': 'Circuits', '_id': '2'}
        ]
    }), 200