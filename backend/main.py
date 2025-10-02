# import os
# import pickle
# import numpy as np
# import cv2
# import sys
# import time
# from sklearn.metrics.pairwise import cosine_similarity
# import insightface
# from insightface.app import FaceAnalysis
# from PIL import Image

# # --- DEFINE FILE PATHS AND CONSTANTS ---
# STUDENT_DATA_PATH = os.path.join(os.getcwd(), 'student_data')
# EMBEDDINGS_FILE = "student_embeddings.pkl"
# COSINE_SIMILARITY_THRESHOLD = 0.5
# REGISTRATION_IMAGES_TO_CAPTURE = 10
# REGISTRATION_INTERVAL = 1 # seconds between photos

# # --- LOAD THE INSIGHTFACE MODEL ---
# print("Loading the InsightFace model...")
# app = FaceAnalysis(allowed_modules=['detection', 'recognition'])
# app.prepare(ctx_id=0, det_size=(640, 640))
# print("InsightFace model loaded successfully.")

# # --- NEW FUNCTION FOR AUTOMATED REGISTRATION ---
# def register_new_student_auto(app, student_name):
#     """Opens webcam, captures photos, and generates embeddings for a new student."""
#     student_folder_path = os.path.join(STUDENT_DATA_PATH, student_name)
#     if not os.path.exists(student_folder_path):
#         os.makedirs(student_folder_path)
    
#     cap = cv2.VideoCapture(0)
#     if not cap.isOpened():
#         print("Error: Could not open webcam.")
#         return
    
#     print(f"\nRegistering {student_name}. Please stay in front of the camera.")
#     print(f"Capturing {REGISTRATION_IMAGES_TO_CAPTURE} photos with a {REGISTRATION_INTERVAL} second interval.")
    
#     start_time = time.time()
#     photos_captured = 0
    
#     while photos_captured < REGISTRATION_IMAGES_TO_CAPTURE:
#         ret, frame = cap.read()
#         if not ret:
#             continue
            
#         cv2.putText(frame, f"Capturing: {photos_captured + 1}/{REGISTRATION_IMAGES_TO_CAPTURE}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        
#         # Check if enough time has passed to capture the next photo
#         if time.time() - start_time >= REGISTRATION_INTERVAL:
#             photo_path = os.path.join(student_folder_path, f"photo_{photos_captured}.jpg")
#             cv2.imwrite(photo_path, frame)
#             print(f"Photo {photos_captured + 1} captured.")
#             photos_captured += 1
#             start_time = time.time()
        
#         cv2.imshow('Registration', frame)
        
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
            
#     cap.release()
#     cv2.destroyAllWindows()
    
#     # After capturing, generate embeddings for all students (including the new one)
#     print("\nPhotos captured. Generating new embeddings for all students...")
#     process_student_data(app)
    
#     print("\nRegistration complete. You can now use the attendance system.")


# # --- FUNCTIONS FOR EMBEDDING GENERATION (Unchanged) ---
# def process_student_data(app):
#     # ... (same function as before)
#     known_embeddings = {}
    
#     if not os.path.exists(STUDENT_DATA_PATH):
#         print(f"Error: {STUDENT_DATA_PATH} not found. Please make sure it's in the same directory as main.py.")
#         return False
        
#     for student_name in os.listdir(STUDENT_DATA_PATH):
#         student_path = os.path.join(STUDENT_DATA_PATH, student_name)
#         if not os.path.isdir(student_path):
#             continue
#         print(f"Processing student: {student_name}")
#         student_embeddings = []
#         for img_name in os.listdir(student_path):
#             img_path = os.path.join(student_path, img_name)
#             try:
#                 img = cv2.imread(img_path)
#                 faces = app.get(img)
#                 if faces:
#                     embedding = faces[0].embedding
#                     student_embeddings.append(embedding)
#             except Exception as e:
#                 print(f"Error processing {img_path}: {e}")
#                 continue
#         if student_embeddings:
#             avg_embedding = np.mean(student_embeddings, axis=0)
#             known_embeddings[student_name] = avg_embedding
#             print(f"Created averaged embedding for {student_name}")
#     with open(EMBEDDINGS_FILE, "wb") as f:
#         pickle.dump(known_embeddings, f)
#     print(f"Successfully saved {len(known_embeddings)} student embeddings.")
#     return True

# # --- FUNCTIONS FOR ATTENDANCE SYSTEM (Unchanged) ---
# def run_attendance_system(app):
#     # ... (same function as before)
#     known_embeddings = load_embeddings()
#     if known_embeddings is None:
#         print("Embeddings file not found. Please run the embedding generation first.")
#         return

#     known_names = list(known_embeddings.keys())
#     known_embedding_list = list(known_embeddings.values())
#     attendance_marked = set()
    
#     cap = cv2.VideoCapture(0)
#     if not cap.isOpened():
#         print("Error: Could not open webcam.")
#         return
        
#     print("Attendance system is ready. Press 'q' to exit.")
    
#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             print("Failed to grab frame.")
#             break
            
#         faces = app.get(frame)
        
#         if faces:
#             for face in faces:
#                 live_embedding = face.embedding
#                 similarities = cosine_similarity([live_embedding], known_embedding_list)[0]
#                 best_match_index = np.argmax(similarities)
#                 best_match_score = similarities[best_match_index]
#                 name = "Unknown"
                
#                 if best_match_score > COSINE_SIMILARITY_THRESHOLD:
#                     name = known_names[best_match_index]
                    
#                     if name not in attendance_marked:
#                         print(f"Attendance marked for: {name} (Score: {best_match_score:.2f})")
#                         attendance_marked.add(name)
                        
#                 bbox = face.bbox.astype(np.int32)
#                 x1, y1, x2, y2 = bbox[0], bbox[1], bbox[2], bbox[3]
#                 color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
#                 cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
#                 cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
        
#         cv2.imshow('Attendance System', frame)
        
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
    
#     cap.release()
#     cv2.destroyAllWindows()
#     print("Attendance session ended.")

# def load_embeddings():
#     if not os.path.exists(EMBEDDINGS_FILE):
#         return None
#     with open(EMBEDDINGS_FILE, "rb") as f:
#         return pickle.load(f)


# # --- MAIN EXECUTION LOGIC ---
# if __name__ == "__main__":
    
#     # You can now choose what to do from the command line
#     user_choice = input("Enter '1' to register a new student, or '2' to run attendance: ")
    
#     if user_choice == '1':
#         # Prompt for student name and run the new function
#         student_name = input("Enter the student's name: ")
#         register_new_student_auto(app, student_name)
    
#     elif user_choice == '2':
#         # Run the standard attendance system
#         if not os.path.exists(EMBEDDINGS_FILE):
#             print("Embeddings file not found. Generating new embeddings for all existing students...")
#             success = process_student_data(app)
#             if not success:
#                 sys.exit("Embeddings generation failed. Cannot proceed.")
#         else:
#             print("Embeddings file found. Skipping initial generation...")
            
#         print("Running the attendance system...")
#         run_attendance_system(app)
#     else:
#         print("Invalid choice.")





# import os
# import pickle
# import numpy as np
# import cv2
# import sys
# import time
# from sklearn.metrics.pairwise import cosine_similarity
# import insightface
# from insightface.app import FaceAnalysis
# from PIL import Image

# # --- DEFINE FILE PATHS AND CONSTANTS ---
# STUDENT_DATA_PATH = os.path.join(os.getcwd(), 'student_data')
# EMBEDDINGS_FILE = "student_embeddings.pkl"
# COSINE_SIMILARITY_THRESHOLD = 0.5
# REGISTRATION_IMAGES_TO_CAPTURE = 10
# REGISTRATION_INTERVAL = 1 # seconds between photos

# # --- FUNCTIONS FOR EMBEDDING GENERATION ---
# def process_student_data(app):
#     """Processes all student images and saves face embeddings."""
#     known_embeddings = {}
    
#     if not os.path.exists(STUDENT_DATA_PATH):
#         print(f"Error: {STUDENT_DATA_PATH} not found. Please make sure it's in the same directory as main.py.")
#         return False
        
#     for student_name in os.listdir(STUDENT_DATA_PATH):
#         student_path = os.path.join(STUDENT_DATA_PATH, student_name)
#         if not os.path.isdir(student_path):
#             continue
#         print(f"Processing student: {student_name}")
#         student_embeddings = []
#         for img_name in os.listdir(student_path):
#             img_path = os.path.join(student_path, img_name)
#             try:
#                 img = cv2.imread(img_path)
#                 faces = app.get(img)
#                 if faces:
#                     embedding = faces[0].embedding
#                     student_embeddings.append(embedding)
#             except Exception as e:
#                 print(f"Error processing {img_path}: {e}")
#                 continue
#         if student_embeddings:
#             avg_embedding = np.mean(student_embeddings, axis=0)
#             known_embeddings[student_name] = avg_embedding
#             print(f"Created averaged embedding for {student_name}")
#     with open(EMBEDDINGS_FILE, "wb") as f:
#         pickle.dump(known_embeddings, f)
#     print(f"Successfully saved {len(known_embeddings)} student embeddings.")
#     return True

# # --- NEW FUNCTION FOR AUTOMATED REGISTRATION ---
# def register_new_student_auto(app, student_name):
#     """Opens webcam, captures photos, and generates embeddings for a new student."""
#     student_folder_path = os.path.join(STUDENT_DATA_PATH, student_name)
#     if not os.path.exists(student_folder_path):
#         os.makedirs(student_folder_path)
    
#     cap = cv2.VideoCapture(0)
#     if not cap.isOpened():
#         print("Error: Could not open webcam.")
#         return
    
#     print(f"\nRegistering {student_name}. Please stay in front of the camera.")
#     print(f"Capturing {REGISTRATION_IMAGES_TO_CAPTURE} photos with a {REGISTRATION_INTERVAL} second interval.")
    
#     start_time = time.time()
#     photos_captured = 0
    
#     while photos_captured < REGISTRATION_IMAGES_TO_CAPTURE:
#         ret, frame = cap.read()
#         if not ret:
#             continue
            
#         cv2.putText(frame, f"Capturing: {photos_captured + 1}/{REGISTRATION_IMAGES_TO_CAPTURE}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        
#         if time.time() - start_time >= REGISTRATION_INTERVAL:
#             photo_path = os.path.join(student_folder_path, f"photo_{photos_captured}.jpg")
#             cv2.imwrite(photo_path, frame)
#             print(f"Photo {photos_captured + 1} captured.")
#             photos_captured += 1
#             start_time = time.time()
        
#         cv2.imshow('Registration', frame)
        
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
            
#     cap.release()
#     cv2.destroyAllWindows()
    
#     print("\nPhotos captured. Generating new embeddings for all students...")
#     process_student_data(app)
    
#     print("\nRegistration complete. You can now use the attendance system.")


# # --- FUNCTIONS FOR ATTENDANCE SYSTEM ---
# def run_attendance_system(app):
#     known_embeddings = load_embeddings()
#     if known_embeddings is None:
#         print("Embeddings file not found. Please run the embedding generation first.")
#         return

#     known_names = list(known_embeddings.keys())
#     known_embedding_list = list(known_embeddings.values())
#     attendance_marked = set()
    
#     cap = cv2.VideoCapture(0)
#     if not cap.isOpened():
#         print("Error: Could not open webcam.")
#         return
        
#     print("Attendance system is ready. Press 'q' to exit.")
    
#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             print("Failed to grab frame.")
#             break
            
#         faces = app.get(frame)
        
#         if faces:
#             for face in faces:
#                 live_embedding = face.embedding
#                 similarities = cosine_similarity([live_embedding], known_embedding_list)[0]
#                 best_match_index = np.argmax(similarities)
#                 best_match_score = similarities[best_match_index]
#                 name = "Unknown"
                
#                 if best_match_score > COSINE_SIMILARITY_THRESHOLD:
#                     name = known_names[best_match_index]
                    
#                     if name not in attendance_marked:
#                         print(f"Attendance marked for: {name} (Score: {best_match_score:.2f})")
#                         attendance_marked.add(name)
                        
#                 bbox = face.bbox.astype(np.int32)
#                 x1, y1, x2, y2 = bbox[0], bbox[1], bbox[2], bbox[3]
#                 color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
#                 cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
#                 cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
        
#         cv2.imshow('Attendance System', frame)
        
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
    
#     cap.release()
#     cv2.destroyAllWindows()
#     print("Attendance session ended.")


# def load_embeddings():
#     if not os.path.exists(EMBEDDINGS_FILE):
#         return None
#     with open(EMBEDDINGS_FILE, "rb") as f:
#         return pickle.load(f)


# # --- MAIN EXECUTION LOGIC ---
# if __name__ == "__main__":
    
#     print("Loading the InsightFace model...")
#     app = FaceAnalysis(allowed_modules=['detection', 'recognition'])
#     app.prepare(ctx_id=0, det_size=(640, 640))
#     print("InsightFace model loaded successfully.")

#     # You can now choose what to do from the command line
#     user_choice = input("Enter '1' to register a new student, or '2' to run attendance: ")
    
#     if user_choice == '1':
#         # Prompt for student name and run the new function
#         student_name = input("Enter the student's name: ")
#         register_new_student_auto(app, student_name)
    
#     elif user_choice == '2':
#         # Run the standard attendance system
#         if not os.path.exists(EMBEDDINGS_FILE):
#             print("Embeddings file not found. Generating new embeddings for all existing students...")
#             success = process_student_data(app)
#             if not success:
#                 sys.exit("Embeddings generation failed. Cannot proceed.")
#         else:
#             print("Embeddings file found. Skipping initial generation...")
            
#         print("Running the attendance system...")
#         run_attendance_system(app)
#     else:
#         print("Invalid choice.")



import os
import pickle
import numpy as np
import cv2
import sys
import time
from sklearn.metrics.pairwise import cosine_similarity
import insightface
from insightface.app import FaceAnalysis
from pymongo import MongoClient
from bson.binary import Binary

# --- DATABASE CONNECTION (Ensure this matches app.py) ---

MONGO_URI = "mongodb+srv://deorashivani4:RCkp6bBp2wsFL4SU@shivani.i2jd7gu.mongodb.net/AttendanceSystemDB?retryWrites=true&w=majority&appName=shivani"
DB_NAME = "AttendanceSystemDB"
STUDENTS_COLLECTION_NAME = "students"

# --- DEFINE FILE PATHS AND CONSTANTS ---
# This is now only a cache file, not the source of truth.
EMBEDDINGS_CACHE_FILE = "student_embeddings_cache.pkl" 
COSINE_SIMILARITY_THRESHOLD = 0.50


# --- NEW/MODIFIED FUNCTION: FETCH FROM MONGO ---
def cache_all_embeddings_from_mongo(app):
    """Fetches all student embeddings directly from MongoDB and creates a local cache."""
    print("Connecting to MongoDB to fetch student embeddings...")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        students_collection = db[STUDENTS_COLLECTION_NAME]
        
        known_embeddings = {}
        total_docs = students_collection.count_documents({})
        print(f"DEBUG: Total documents in 'students' collection: {total_docs}")

        # 1. Fetch all students who have embeddings
        cursor = students_collection.find(
            {}, # Find records where 'encodings' exists and is not empty
            {"rollNo": 1, "encodings": 1, "_id": 0}      # Project only rollNo and encodings
        )
        
        total_students = 0
        
        for student in cursor:
            roll_no = student.get('rollNo')
            encodings = student.get('encodings', [])
            
            if not roll_no or not encodings:
                continue

            # 2. Convert Binary data back to NumPy arrays and calculate the average
            student_embedding_arrays = []
            for i, binary_data in enumerate(encodings):
                # Convert BSON Binary object back to NumPy array (assuming float32 or float64)
                print(f"DEBUG: Data type received for image {i}: {type(binary_data)}")
                if isinstance(binary_data, (Binary, bytes)):
                    # InsightFace embeddings are typically float32 (4 bytes per number)
                    byte_stream = binary_data.raw if isinstance(binary_data, Binary) else binary_data
                    embedding_array = np.frombuffer(binary_data, dtype=np.float32) 
                 
                    student_embedding_arrays.append(embedding_array)
                else:
                    print(f"DEBUG: Skipping image {i}. Not recognized as BSON Binary.")
                
            if student_embedding_arrays:
                # Average the 10 embeddings for a more stable representation
                avg_embedding = np.mean(student_embedding_arrays, axis=0)
                 
                # known_embeddings[roll_no] = avg_embedding
                known_embeddings[roll_no]=avg_embedding
                  
    
                total_students += 1
                print(f"DEBUG: Added {roll_no}. Current known count: {len(known_embeddings)}")

        # 3. Save the averaged embeddings to a local pickle file (cache)
        print(f"DEBUG: Final number of students prepared for cache: {len(known_embeddings)}")
        with open(EMBEDDINGS_CACHE_FILE, "wb") as f:
            pickle.dump(known_embeddings, f)
            
        print(f"✅ Successfully fetched and cached embeddings for {total_students} students.")
        return True

    except Exception as e:
        print(f"FATAL ERROR during MongoDB fetch: {e}")
        return False

# --- FUNCTIONS FOR ATTENDANCE SYSTEM ---
def run_attendance_system(app):
    known_embeddings = load_embeddings()
    if known_embeddings is None:
        print("Embeddings cache not found or empty. Cannot run attendance.")
        return

    known_names = list(known_embeddings.keys())
    known_embedding_list = np.array(list(known_embeddings.values())) 

    attendance_marked = set()
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return
        
    print("\n--- Attendance System Ready ---")
    print(f"Recognizing {len(known_names)} students. Press 'q' to exit.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break
            
        faces = app.get(frame)
        
        if faces:
            for face in faces:
                live_embedding = face.embedding
                live_embedding_2d = live_embedding.reshape(1, -1)
                # Use cosine_similarity to compare live face with all known faces
                similarities = cosine_similarity(live_embedding_2d, known_embedding_list)[0]
                best_match_index = np.argmax(similarities)
                best_match_score = similarities[best_match_index]
                name = "Unknown"

                print(f"DEBUG: Best Match: {known_names[best_match_index]} | Score: {best_match_score:.2f} | Required: {COSINE_SIMILARITY_THRESHOLD}", end='\r')
                
                if best_match_score > COSINE_SIMILARITY_THRESHOLD:
                    name = known_names[best_match_index]
                    
                    if name not in attendance_marked:
                        print(f"✅ ATTENDANCE MARKED: {name} (Score: {best_match_score:.2f})")
                        attendance_marked.add(name)
                        
                # Draw bounding box and name
                bbox = face.bbox.astype(np.int32)
                x1, y1, x2, y2 = bbox[0], bbox[1], bbox[2], bbox[3]
                color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
                
        cv2.imshow('Attendance System', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print("Attendance session ended.")


def load_embeddings():
    if not os.path.exists(EMBEDDINGS_CACHE_FILE):
        return None
    with open(EMBEDDINGS_CACHE_FILE, "rb") as f:
        return pickle.load(f)


# --- MAIN EXECUTION LOGIC ---
if __name__ == "__main__":
    
    print("Initializing Facial Recognition Model...")
    app = FaceAnalysis(allowed_modules=['detection', 'recognition'])
    app.prepare(ctx_id=0, det_size=(640, 640))
    print("InsightFace model ready.")

    print("\nStarting Attendance System...")
    
    # 🎯 Check if a cached file exists. If not, generate it from the database.
    if not os.path.exists(EMBEDDINGS_CACHE_FILE):
        print("Embeddings cache not found. Generating cache from MongoDB...")
        success = cache_all_embeddings_from_mongo(app) # Call the Mongo fetch function
        if not success:
            sys.exit("Initial cache generation failed. Cannot proceed.")
    else:
        print(f"Cache ({EMBEDDINGS_CACHE_FILE}) found. Proceeding to run attendance.")
        
    run_attendance_system(app)