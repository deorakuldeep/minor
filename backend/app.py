

# import os
# import io
# import base64
# import numpy as np
# import cv2
# import sys
# from bson.binary import Binary
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from pymongo import MongoClient
# import insightface
# from insightface.app import FaceAnalysis

# # --- DATABASE AND APP SETUP ---
# app = Flask(__name__)
# # Enable CORS for all routes
# CORS(app) 
# # Replace with your MongoDB Atlas connection string
# # client = MongoClient("MONGO_URI=mongodb+srv://deorashivani4:Lpw95rn269nMeMKE@shivani.i2jd7gu.mongodb.net/AttendanceSystemDB?retryWrites=true&w=majority&appName=shivani")
# client = MongoClient("mongodb+srv://deorashivani4:Lpw95rn269nMeMKE@shivani.i2jd7gu.mongodb.net/AttendanceSystemDB?retryWrites=true&w=majority&appName=shivani")
# db = client["facial_recognition_db"]
# students_collection = db["students"]

# # --- LOAD THE INSIGHTFACE MODEL ---
# print("Loading the InsightFace model...")
# fa_app = FaceAnalysis(allowed_modules=['detection', 'recognition'])
# fa_app.prepare(ctx_id=0, det_size=(640, 640))
# print("InsightFace model loaded successfully.")

# # --- API ENDPOINT FOR STUDENT REGISTRATION ---
# @app.route('/register_student', methods=['POST'])
# def register_student():
#     try:
#         data = request.json
#         if not data:
#             return jsonify({"error": "No data provided"}), 400

#         name = data.get("name")
#         phone_number = data.get("phone_number")
#         email = data.get("email")
#         semester = data.get("semester")
#         class_name = data.get("class_name")
#         roll_no = data.get("roll_no")
#         photos = data.get("photos", [])

#         if not name or not photos:
#             return jsonify({"error": "Missing name or photos"}), 400

#         # Process photos and generate embeddings
#         student_encodings = []
#         for base64_photo in photos:
#             # Decode the base64 string to a numpy array
#             photo_bytes = io.BytesIO(base64.b64decode(base64_photo.split(',')[1]))
#             img = cv2.imdecode(np.frombuffer(photo_bytes.read(), np.uint8), cv2.IMREAD_COLOR)

#             faces = fa_app.get(img)
#             if faces:
#                 embedding = faces[0].embedding
#                 # Convert numpy array to binary for storage in MongoDB
#                 student_encodings.append(Binary(embedding.tobytes()))

#         if not student_encodings:
#             return jsonify({"error": "No faces detected in photos"}), 400

#         # Prepare document for MongoDB
#         student_doc = {
#             "name": name,
#             "phone_number": phone_number,
#             "email": email,
#             "semester": semester,
#             "class": class_name,
#             "roll_no": roll_no,
#             "encodings": student_encodings
#         }

#         # Insert into MongoDB
#         result = students_collection.insert_one(student_doc)
        
#         return jsonify({
#             "success": True, 
#             "message": "Student registered successfully", 
#             "student_id": str(result.inserted_id)
#         }), 201

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5000)


# import os
# import io
# import base64
# import numpy as np
# import cv2
# import sys
# from bson.binary import Binary
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from pymongo import MongoClient
# from pymongo.errors import DuplicateKeyError # Import for error handling
# import insightface
# from insightface.app import FaceAnalysis

# # --- DATABASE AND APP SETUP ---
# app = Flask(__name__)
# CORS(app) 

# # Replace with your MongoDB Atlas connection string
# MONGO_URI = "mongodb+srv://deorashivani4:RCkp6bBp2wsFL4SU@shivani.i2jd7gu.mongodb.net/AttendanceSystemDB?retryWrites=true&w=majority&appName=shivani"

# try:
#     client = MongoClient(MONGO_URI)
#     # 🎯 Use the database name specified in the URI: 'AttendanceSystemDB'
#     db = client["AttendanceSystemDB"] 
#     # Use a descriptive collection name
#     students_collection = db["students"] 
    
#     # Ensure indexes exist for unique fields (Roll No and Email)
#     students_collection.create_index("rollNo", unique=True)
#     students_collection.create_index("email", unique=True)
#     print("MongoDB connected and indexes created.")

# except Exception as e:
#     print(f"FATAL ERROR: Could not connect to MongoDB or set up indexes. {e}")
#     sys.exit(1)


# # --- LOAD THE INSIGHTFACE MODEL ---
# # ctx_id=0 means use CPU if no GPU available (or if GPU is not set up)
# print("Loading the InsightFace model...")
# fa_app = FaceAnalysis(allowed_modules=['detection', 'recognition'])
# fa_app.prepare(ctx_id=0, det_size=(640, 640))
# print("InsightFace model loaded successfully.")


# # --- API ENDPOINT FOR STUDENT REGISTRATION ---
# @app.route('/register_student', methods=['POST'])
# def register_student():
#     try:
#         data = request.json
#         if not data:
#             return jsonify({"error": "No data provided"}), 400

#         # 🎯 Get ALL the fields from the updated React form
#         first_name = data.get("firstName")
#         last_name = data.get("lastName")
#         phone_number = data.get("phoneNumber")
#         email = data.get("email")
#         roll_no = data.get("rollNo") 
        
#         # Academic details
#         year = data.get("year")
#         semester = data.get("semester")
#         branch = data.get("branch")
        
#         photos = data.get("photos", [])

#         # Basic validation
#         if not all([first_name, last_name, roll_no, email, phone_number, year, semester, branch]) or len(photos) != 10:
#             return jsonify({"error": "Missing essential student details or exactly 10 photos"}), 400

#         # --- Process photos and generate embeddings ---
#         student_encodings = []
#         for base64_photo in photos:
#             try:
#                 # Strip header (e.g., 'data:image/jpeg;base64,')
#                 header, encoded = base64_photo.split(',', 1)
                
#                 # Decode the base64 string to a byte stream
#                 photo_bytes = io.BytesIO(base64.b64decode(encoded))
                
#                 # Convert byte stream to numpy array, then to OpenCV image format
#                 img = cv2.imdecode(np.frombuffer(photo_bytes.read(), np.uint8), cv2.IMREAD_COLOR)

#                 # Get faces from InsightFace
#                 faces = fa_app.get(img)
                
#                 if faces:
#                     # Get the embedding vector
#                     embedding = faces[0].embedding
#                     # Convert numpy array to MongoDB BSON Binary type for storage
#                     embedding_bytes = embedding.astype(np.float32).tobytes()
#                     student_encodings.append(Binary(embedding_bytes))
#             except Exception as e:
#                 print(f"Error processing a photo for {roll_no}: {e}", file=sys.stderr)
#                 # Continue to the next photo if one fails
#                 continue 

#         if not student_encodings or len(student_encodings) < 3: # Require at least 5 good embeddings
#             return jsonify({"error": "Not enough faces detected (need at least 5 usable photos). Please try again."}), 400

#         # --- Prepare document for MongoDB ---
#         student_doc = {
#             "firstName": first_name,
#             "lastName": last_name,
#             "phoneNumber": phone_number,
#             "email": email,
#             "rollNo": roll_no,
#             "year": year,
#             "semester": semester,
#             "branch": branch,
#             # Store the list of embeddings
#             "encodings": student_encodings 
#         }

#         # --- Insert into MongoDB ---
#         result = students_collection.insert_one(student_doc)
        
#         return jsonify({
#             "success": True, 
#             "message": "Student registered and embeddings saved successfully!", 
#             "student_id": str(result.inserted_id)
#         }), 201

#     except DuplicateKeyError as e:
#         # Handle unique constraint violation (rollNo or email already exists)
#         key = list(e.details['keyPattern'].keys())[0]
#         return jsonify({"error": f"Registration failed: {key} already exists."}), 409
        
#     except Exception as e:
#         # Catch any other unexpected errors
#         print(f"FATAL API ERROR: {e}", file=sys.stderr)
#         return jsonify({"error": f"An unexpected server error occurred: {str(e)}"}), 500

# if __name__ == '__main__':
#     # Flask uses Werkzeug, which automatically reloads the code.
#     # host='0.0.0.0' allows connections from outside your machine (e.g., your React frontend)
#     app.run(debug=True, host='0.0.0.0', port=5000)





import os
import io
import base64
import numpy as np
import cv2
import sys
from bson.binary import Binary
from flask import Flask, request, jsonify, Blueprint # Ensure Blueprint is imported
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import insightface
from insightface.app import FaceAnalysis

# --- Import the Teacher Routes Blueprint ---
# NOTE: This file (teacher_routes.py) must exist in the same directory.
from teacher_routes import teacher_bp 

# --- DATABASE AND APP SETUP ---
app = Flask(__name__)
# Apply CORS globally to allow frontend connections
CORS(app) 

# Ensure this URI and password are correct!
MONGO_URI = "mongodb+srv://deorashivani4:RCkp6bBp2wsFL4SU@shivani.i2jd7gu.mongodb.net/AttendanceSystemDB?retryWrites=true&w=majority&appName=shivani"

try:
    client = MongoClient(MONGO_URI)
    db = client["AttendanceSystemDB"] 
    students_collection = db["students"] 
    
    students_collection.create_index("rollNo", unique=True)
    students_collection.create_index("email", unique=True)
    print("MongoDB connected and indexes created.")

except Exception as e:
    print(f"FATAL ERROR: Could not connect to MongoDB or set up indexes. {e}", file=sys.stderr)
    sys.exit(1)


# --- REGISTER BLUEPRINT ---
# This mounts all routes from teacher_routes.py starting with the /api/teacher prefix.
app.register_blueprint(teacher_bp) 

# --- LOAD THE INSIGHTFACE MODEL ---
print("Loading the InsightFace model...")
fa_app = FaceAnalysis(allowed_modules=['detection', 'recognition'])
fa_app.prepare(ctx_id=0, det_size=(640, 640))
print("InsightFace model loaded successfully.")


# ----------------------------------------------------------------------
# --- 1. API ENDPOINT FOR STUDENT REGISTRATION (/register_student) ---
# ----------------------------------------------------------------------
@app.route('/register_student', methods=['POST'])
def register_student():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Data extraction from React form (uses camelCase keys)
        first_name = data.get("firstName")
        last_name = data.get("lastName")
        phone_number = data.get("phoneNumber")
        email = data.get("email")
        roll_no = data.get("rollNo") 
        year = data.get("year")
        semester = data.get("semester")
        branch = data.get("branch")
        photos = data.get("photos", [])

        if not all([first_name, last_name, roll_no, email, phone_number, year, semester, branch]) or len(photos) != 10:
            return jsonify({"error": "Missing essential student details or exactly 10 photos"}), 400

        # --- Process photos and generate embeddings ---
        student_encodings = []
        for base64_photo in photos:
            try:
                header, encoded = base64_photo.split(',', 1)
                photo_bytes = io.BytesIO(base64.b64decode(encoded))
                img = cv2.imdecode(np.frombuffer(photo_bytes.read(), np.uint8), cv2.IMREAD_COLOR)

                faces = fa_app.get(img)
                
                if faces:
                    embedding = faces[0].embedding
                    
                    # CRITICAL FIX: Ensure 32-bit float format before converting to bytes
                    embedding_bytes = embedding.astype(np.float32).tobytes()
                    # FINAL FIX: Append the correct byte stream variable
                    student_encodings.append(Binary(embedding_bytes)) 
                
                # Note: The front-end validation check below will handle if too many faces were rejected.
                
            except Exception as e:
                print(f"Error processing a photo for {roll_no}: {e}", file=sys.stderr)
                continue 

        # Changed to 3 for successful testing based on previous conversation
        if not student_encodings or len(student_encodings) < 3: 
            return jsonify({"error": "Not enough faces detected (need at least 3 usable photos). Please try again."}), 400

        # --- Prepare document for MongoDB ---
        student_doc = {
            "firstName": first_name,
            "lastName": last_name,
            "phoneNumber": phone_number,
            "email": email,
            "rollNo": roll_no,
            "year": year,
            "semester": semester,
            "branch": branch,
            "encodings": student_encodings 
        }

        # --- Insert into MongoDB ---
        result = students_collection.insert_one(student_doc)
        
        return jsonify({
            "success": True, 
            "message": "Student registered and embeddings saved successfully!", 
            "student_id": str(result.inserted_id)
        }), 201

    except DuplicateKeyError as e:
        key = list(e.details['keyPattern'].keys())[0]
        return jsonify({"error": f"Registration failed: {key} already exists."}), 409
        
    except Exception as e:
        print(f"FATAL API ERROR: {e}", file=sys.stderr)
        return jsonify({"error": f"An unexpected server error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    # Running on 0.0.0.0 allows external connection from the React frontend
    app.run(debug=True, host='0.0.0.0', port=5000)