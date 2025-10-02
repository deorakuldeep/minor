// import React, { useState, useRef } from 'react';
// import Webcam from 'react-webcam';

// const videoConstraints = {
//   width: 480,
//   height: 360,
//   facingMode: 'user'
// };

// const RegistrationForm = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     phone_number: '',
//     email: '',
//     semester: '',
//     class_name: '',
//     roll_no: ''
//   });
//   const [photos, setPhotos] = useState([]);
//   const [message, setMessage] = useState('');
//   const webcamRef = useRef(null);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const capturePhotos = () => {
//     setMessage('Capturing photos... Please stay in front of the camera.');
//     let capturedCount = 0;
//     const interval = setInterval(() => {
//       if (capturedCount < 10) {
//         const imageSrc = webcamRef.current.getScreenshot();
//         setPhotos(prevPhotos => [...prevPhotos, imageSrc]);
//         capturedCount++;
//         setMessage(`Captured ${capturedCount} of 10 photos.`);
//       } else {
//         clearInterval(interval);
//         setMessage('Photo capture complete. Click "Register" to continue.');
//       }
//     }, 1000); // Capture every 1 second
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (photos.length < 10) {
//       alert('Please capture 10 photos before registering.');
//       return;
//     }

//     setMessage('Registering student...');
    
//     // Prepare the data for the backend
//     const dataToSend = {
//       ...formData,
//       photos: photos,
//     };

//     try {
//       const response = await fetch('http://localhost:5000/register_student', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(dataToSend),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         setMessage('Registration successful!');
//         alert(`Student registered with ID: ${result.student_id}`);
//       } else {
//         const error = await response.json();
//         setMessage(`Registration failed: ${error.error}`);
//         alert(`Registration failed: ${error.error}`);
//       }
//     } catch (error) {
//       setMessage('Network error. Please check your backend server.');
//       console.error('Network error:', error);
//     }
//   };

//   return (
//     <div className="registration-container">
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>Name:</label>
//           <input type="text" name="name" value={formData.name} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <label>Phone Number:</label>
//           <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <label>Email:</label>
//           <input type="email" name="email" value={formData.email} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <label>Semester:</label>
//           <input type="text" name="semester" value={formData.semester} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <label>Class:</label>
//           <input type="text" name="class_name" value={formData.class_name} onChange={handleChange} required />
//         </div>
//         <div className="form-group">
//           <label>Roll No:</label>
//           <input type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} required />
//         </div>

//         <div className="webcam-container">
//           <Webcam
//             audio={false}
//             ref={webcamRef}
//             screenshotFormat="image/jpeg"
//             videoConstraints={videoConstraints}
//             className="webcam"
//           />
//         </div>
//         <div className="buttons-container">
//           <button type="button" onClick={capturePhotos}>Capture 10 Photos</button>
//           <button type="submit">Register Student</button>
//         </div>
//       </form>
//       {message && <p className="status-message">{message}</p>}
//       <div className="photos-preview">
//         {photos.map((photo, index) => (
//           <img key={index} src={photo} alt={`Captured ${index + 1}`} className="thumbnail" />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RegistrationForm;

// import React, { useState, useRef } from 'react';
// import Webcam from 'react-webcam';

// const videoConstraints = {
//   width: 480,
//   height: 360,
//   facingMode: 'user'
// };

// // --- Dropdown Options ---
// const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
// const SEMESTER_OPTIONS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
// const BRANCH_OPTIONS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electronics & Communication'];

// // --- Regex Definitions ---
// const REGEX = {
//   // UPDATED: Only letters and spaces (min 2, max 50)
//   name: /^[A-Za-z\s]{2,50}$/, 
//   rollNo: /^[A-Za-z0-9]{5,15}$/, 
//   email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
//   phoneNumber: /^\+?[0-9]{10,15}$/, 
// };

// // Initial state for form data
// const initialFormData = {
//   firstName: '',
//   lastName: '',
//   rollNo: '',
//   email: '',
//   phoneNumber: '',
//   year: '',
//   semester: '',
//   branch: '',
// };

// const RegistrationForm = () => {
//   const [formData, setFormData] = useState(initialFormData);
//   const [errors, setErrors] = useState({});
//   const [photos, setPhotos] = useState([]);
//   const [message, setMessage] = useState('');
//   const webcamRef = useRef(null);

//   /**
//    * Validates a single field against non-empty rule and regex (if applicable).
//    */
//   const validateField = (name, value) => {
//     let error = '';

//     // 1. Check for emptiness (REQUIRED for all fields)
//     if (!value || value.trim() === '') {
//       error = 'This field is required.';
//     } 
//     // 2. Check against Regex for specific fields
//     else if (['firstName', 'lastName', 'rollNo', 'email', 'phoneNumber'].includes(name)) {
//       const regexName = name.includes('Name') ? 'name' : name;
      
//       if (REGEX[regexName] && !REGEX[regexName].test(value)) {
//         switch (regexName) {
//           case 'name':
//             error = 'Invalid Name.';
//             break;
//           case 'rollNo':
//             error = 'Must be 5-15 alphanumeric characters.';
//             break;
//           case 'email':
//             error = 'Invalid email format.';
//             break;
//           case 'phoneNumber':
//             error = 'Invalid phone number (10-15 digits, optional +).';
//             break;
//           default:
//             break;
//         }
//       }
//     }

//     setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
//     return error === '';
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//     // Validate on change for better UX
//     validateField(name, value); 
//   };
  
//   /**
//    * Validates the entire form before submission.
//    */
//   const validateForm = () => {
//     let isValid = true;
//     const newErrors = {};

//     // List all fields to validate
//     const fieldsToValidate = Object.keys(formData);
    
//     fieldsToValidate.forEach(field => {
//       const fieldIsValid = validateField(field, formData[field]);
//       if (!fieldIsValid) {
//         isValid = false;
//         // Collect the error that validateField generated
//         newErrors[field] = errors[field] || 'This field is required.';
//       }
//     });

//     setErrors(newErrors);
//     return isValid;
//   };

//   const capturePhotos = () => {
//     setMessage('Capturing photos... Please stay in front of the camera.');
//     let capturedCount = 0;
//     setPhotos([]); // Clear previous photos
//     const interval = setInterval(() => {
//       if (capturedCount < 10) {
//         if (webcamRef.current) {
//             const imageSrc = webcamRef.current.getScreenshot();
//             setPhotos(prevPhotos => [...prevPhotos, imageSrc]);
//             capturedCount++;
//             setMessage(`Captured ${capturedCount} of 10 photos.`);
//         }
//       } else {
//         clearInterval(interval);
//         setMessage('Photo capture complete. Click "Register" to continue.');
//       }
//     }, 1000); // Capture every 1 second
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // 1. Validate Form
//     if (!validateForm()) {
//       setMessage('Please correct the errors in the form.');
//       // Scroll to the top to show errors clearly
//       window.scrollTo(0, 0); 
//       return;
//     }

//     // 2. Validate Photos
//     if (photos.length < 10) {
//       alert('Please capture 10 photos before registering.');
//       setMessage('Capture 10 photos required.');
//       return;
//     }

//     setMessage('Registering student...');
    
//     // Prepare the data for the backend
//     const dataToSend = {
//       ...formData,
//       photos: photos,
//       fullName: `${formData.firstName} ${formData.lastName}` 
//     };

//     try {
//       const response = await fetch('http://localhost:5000/register_student', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(dataToSend),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         setMessage('Registration successful!');
//         alert(`Student registered with ID: ${result.student_id}`);
//         // Clear form after success
//         setFormData(initialFormData); 
//         setPhotos([]);
//         setErrors({});
//       } else {
//         const error = await response.json();
//         setMessage(`Registration failed: ${error.error || response.statusText}`);
//         alert(`Registration failed: ${error.error || 'Server error'}`);
//       }
//     } catch (error) {
//       setMessage('Network error. Please check your backend server and connection.');
//       console.error('Network error:', error);
//     }
//   };

//   return (
//     <div className="registration-container">
//       <h2>Student Facial Biometric Registration</h2>
//       <form onSubmit={handleSubmit}>
        
//         {/* --- Personal Details --- */}
//         <div className="form-row">
//             <div className="form-group">
//                 <label>First Name:</label>
//                 <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} onBlur={() => validateField('firstName', formData.firstName)} required />
//                 {errors.firstName && <p className="error-message">{errors.firstName}</p>}
//             </div>
//             <div className="form-group">
//                 <label>Last Name:</label>
//                 <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} onBlur={() => validateField('lastName', formData.lastName)} required />
//                 {errors.lastName && <p className="error-message">{errors.lastName}</p>}
//             </div>
//         </div>

//         <div className="form-row">
//             <div className="form-group">
//                 <label>Roll No:</label>
//                 <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} onBlur={() => validateField('rollNo', formData.rollNo)} required />
//                 {errors.rollNo && <p className="error-message">{errors.rollNo}</p>}
//             </div>
//             <div className="form-group">
//                 <label>Email:</label>
//                 <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={() => validateField('email', formData.email)} required />
//                 {errors.email && <p className="error-message">{errors.email}</p>}
//             </div>
//         </div>

//         <div className="form-row">
//             <div className="form-group full-width">
//                 <label>Contact Number:</label>
//                 <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onBlur={() => validateField('phoneNumber', formData.phoneNumber)} required />
//                 {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
//             </div>
//         </div>

//         {/* --- Academic Details (Dropdowns) --- */}
//         <h3>Academic Details</h3>
//         <div className="form-row">
//             <div className="form-group">
//                 <label>Year:</label>
//                 <select name="year" value={formData.year} onChange={handleChange} onBlur={() => validateField('year', formData.year)} required>
//                     <option value="">Select Year</option>
//                     {YEAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//                 </select>
//                 {errors.year && <p className="error-message">{errors.year}</p>}
//             </div>
//             <div className="form-group">
//                 <label>Semester:</label>
//                 <select name="semester" value={formData.semester} onChange={handleChange} onBlur={() => validateField('semester', formData.semester)} required>
//                     <option value="">Select Semester</option>
//                     {SEMESTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//                 </select>
//                 {errors.semester && <p className="error-message">{errors.semester}</p>}
//             </div>
//             <div className="form-group">
//                 <label>Branch:</label>
//                 <select name="branch" value={formData.branch} onChange={handleChange} onBlur={() => validateField('branch', formData.branch)} required>
//                     <option value="">Select Branch</option>
//                     {BRANCH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//                 </select>
//                 {errors.branch && <p className="error-message">{errors.branch}</p>}
//             </div>
//         </div>
        
//         {/* --- Webcam and Photo Capture --- */}
//         <div className="webcam-section">
//             <h3>Facial Biometric Capture (10 Photos)</h3>
//             <div className="webcam-container">
//                 <Webcam
//                     audio={false}
//                     ref={webcamRef}
//                     screenshotFormat="image/jpeg"
//                     videoConstraints={videoConstraints}
//                     className="webcam"
//                 />
//             </div>
//         </div>

//         <div className="buttons-container">
//           <button type="button" onClick={capturePhotos} disabled={photos.length === 10}>
//             {photos.length > 0 ? `Recapture Photos (${photos.length}/10)` : 'Capture 10 Photos'}
//           </button>
//           <button type="submit">Register Student</button>
//         </div>
        
//         {message && <p className="status-message">{message}</p>}
        
//         {/* --- Photo Preview --- */}
//         {photos.length > 0 && 
//             <div className="photos-preview">
//                 <h4>Captured Photos ({photos.length}/10)</h4>
//                 {photos.map((photo, index) => (
//                     <img key={index} src={photo} alt={`Captured ${index + 1}`} className="thumbnail" />
//                 ))}
//             </div>
//         }
//       </form>

//       {/* Basic CSS for structure and error messages (Add this to your CSS file) */}
//       <style jsx="true">{`
//         .registration-container { max-width: 800px; margin: 0 auto; padding: 20px; }
//         .form-row { display: flex; gap: 20px; margin-bottom: 15px; }
//         .form-group { flex: 1; display: flex; flex-direction: column; }
//         .form-group.full-width { flex: 0 0 100%; }
//         label { margin-bottom: 5px; font-weight: bold; }
//         input, select { padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
//         .error-message { color: red; font-size: 0.85em; margin-top: 5px; }
//         .webcam-container { margin: 20px 0; border: 1px solid #ddd; padding: 10px; border-radius: 8px; text-align: center; }
//         .webcam { width: 100%; max-width: 480px; height: auto; border-radius: 4px; }
//         .buttons-container { display: flex; justify-content: space-between; margin-top: 20px; }
//         .buttons-container button { padding: 10px 20px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
//         .buttons-container button[type="submit"] { background-color: #007bff; color: white; }
//         .buttons-container button[type="button"] { background-color: #28a745; color: white; }
//         .status-message { margin-top: 15px; padding: 10px; border-radius: 4px; background-color: #e9ecef; }
//         .photos-preview { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; border-top: 1px solid #eee; padding-top: 10px; }
//         .photos-preview h4 { flex: 0 0 100%; margin-bottom: 10px; }
//         .thumbnail { width: 70px; height: 70px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; }
//       `}</style>
//     </div>
//   );
// };

// export default RegistrationForm;







import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 480,
  height: 360,
  facingMode: 'user'
};

// --- Dropdown Options ---
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTER_OPTIONS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
const BRANCH_OPTIONS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electronics & Communication'];

// --- Regex Definitions ---
const REGEX = {
  // Only letters and spaces (min 2, max 50)
  name: /^[A-Za-z\s]{2,50}$/, 
  rollNo: /^[A-Za-z0-9]{5,15}$/, 
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
  phoneNumber: /^\+?[0-9]{10,15}$/, 
};

// Initial state for form data
const initialFormData = {
  firstName: '',
  lastName: '',
  rollNo: '',
  email: '',
  phoneNumber: '',
  year: '',
  semester: '',
  branch: '',
};

const RegistrationForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState('');
  const webcamRef = useRef(null);

  /**
   * Validates a single field against non-empty rule and regex (if applicable).
   */
  const validateField = (name, value) => {
    let error = '';

    // 1. Check for emptiness (REQUIRED for all fields)
    if (!value || value.trim() === '') {
      error = 'This field is required.';
    } 
    // 2. Check against Regex for specific fields
    else if (['firstName', 'lastName', 'rollNo', 'email', 'phoneNumber'].includes(name)) {
      const regexName = name.includes('Name') ? 'name' : name;
      
      if (REGEX[regexName] && !REGEX[regexName].test(value)) {
        switch (regexName) {
          case 'name':
            // CLARIFIED MESSAGE
            error = 'Name must be 2-50 letters and spaces only (no numbers/symbols).'; 
            break;
          case 'rollNo':
            error = 'Must be 5-15 alphanumeric characters.';
            break;
          case 'email':
            error = 'Invalid email format.';
            break;
          case 'phoneNumber':
            error = 'Invalid phone number (10-15 digits, optional +).';
            break;
          default:
            break;
        }
      }
    }

    setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    return error === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Validate on change for better UX
    validateField(name, value); 
  };
  
  /**
   * Validates the entire form before submission.
   */
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // List all fields to validate
    const fieldsToValidate = Object.keys(formData);
    
    fieldsToValidate.forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      if (!fieldIsValid) {
        isValid = false;
        // Collect the error that validateField generated
        newErrors[field] = errors[field] || 'This field is required.';
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const capturePhotos = () => {
    setMessage('Capturing photos... Please stay in front of the camera.');
    let capturedCount = 0;
    setPhotos([]); // Clear previous photos
    const interval = setInterval(() => {
      if (capturedCount < 10) {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setPhotos(prevPhotos => [...prevPhotos, imageSrc]);
            capturedCount++;
            setMessage(`Captured ${capturedCount} of 10 photos.`);
        }
      } else {
        clearInterval(interval);
        setMessage('Photo capture complete. Click "Register" to continue.');
      }
    }, 1000); // Capture every 1 second
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Form
    if (!validateForm()) {
      setMessage('Please correct the errors in the form.');
      // Scroll to the top to show errors clearly
      window.scrollTo(0, 0); 
      return;
    }

    // 2. Validate Photos
    if (photos.length < 10) {
      alert('Please capture 10 photos before registering.');
      setMessage('Capture 10 photos required.');
      return;
    }

    setMessage('Registering student...');
    
    // Prepare the data for the backend
    const dataToSend = {
      ...formData, // Contains firstName, lastName, rollNo, email, phoneNumber, year, semester, branch
      photos: photos,
    };

    try {
      // 🎯 IMPORTANT: Ensure this URL points to your FLASK backend endpoint!
      const response = await fetch('http://localhost:5000/register_student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Registration successful!');
        alert(`Student registered with ID: ${result.student_id}`);
        // Clear form after success
        setFormData(initialFormData); 
        setPhotos([]);
        setErrors({});
      } else {
        const error = await response.json();
        setMessage(`Registration failed: ${error.error || response.statusText}`);
        alert(`Registration failed: ${error.error || 'Server error'}`);
      }
    } catch (error) {
      setMessage('Network error. Please check your backend server and connection.');
      console.error('Network error:', error);
    }
  };

  return (
    <div className="registration-container">
      <h2>Student Facial Biometric Registration</h2>
      <form onSubmit={handleSubmit}>
        
        {/* --- Personal Details --- */}
        <div className="form-row">
            <div className="form-group">
                <label>First Name:</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} onBlur={() => validateField('firstName', formData.firstName)} required />
                {errors.firstName && <p className="error-message">{errors.firstName}</p>}
            </div>
            <div className="form-group">
                <label>Last Name:</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} onBlur={() => validateField('lastName', formData.lastName)} required />
                {errors.lastName && <p className="error-message">{errors.lastName}</p>}
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Roll No:</label>
                <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} onBlur={() => validateField('rollNo', formData.rollNo)} required />
                {errors.rollNo && <p className="error-message">{errors.rollNo}</p>}
            </div>
            <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={() => validateField('email', formData.email)} required />
                {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
        </div>

        <div className="form-row">
            <div className="form-group full-width">
                <label>Contact Number:</label>
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} onBlur={() => validateField('phoneNumber', formData.phoneNumber)} required />
                {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
            </div>
        </div>

        {/* --- Academic Details (Dropdowns) --- */}
        <h3>Academic Details</h3>
        <div className="form-row">
            <div className="form-group">
                <label>Year:</label>
                <select name="year" value={formData.year} onChange={handleChange} onBlur={() => validateField('year', formData.year)} required>
                    <option value="">Select Year</option>
                    {YEAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.year && <p className="error-message">{errors.year}</p>}
            </div>
            <div className="form-group">
                <label>Semester:</label>
                <select name="semester" value={formData.semester} onChange={handleChange} onBlur={() => validateField('semester', formData.semester)} required>
                    <option value="">Select Semester</option>
                    {SEMESTER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.semester && <p className="error-message">{errors.semester}</p>}
            </div>
            <div className="form-group">
                <label>Branch:</label>
                <select name="branch" value={formData.branch} onChange={handleChange} onBlur={() => validateField('branch', formData.branch)} required>
                    <option value="">Select Branch</option>
                    {BRANCH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.branch && <p className="error-message">{errors.branch}</p>}
            </div>
        </div>
        
        {/* --- Webcam and Photo Capture --- */}
        <div className="webcam-section">
            <h3>Facial Biometric Capture (10 Photos)</h3>
            <div className="webcam-container">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="webcam"
                />
            </div>
        </div>

        <div className="buttons-container">
          <button type="button" onClick={capturePhotos} disabled={photos.length === 10}>
            {photos.length > 0 ? `Recapture Photos (${photos.length}/10)` : 'Capture 10 Photos'}
          </button>
          <button type="submit">Register Student</button>
        </div>
        
        {message && <p className="status-message">{message}</p>}
        
        {/* --- Photo Preview --- */}
        {photos.length > 0 && 
            <div className="photos-preview">
                <h4>Captured Photos ({photos.length}/10)</h4>
                {photos.map((photo, index) => (
                    <img key={index} src={photo} alt={`Captured ${index + 1}`} className="thumbnail" />
                ))}
            </div>
        }
      </form>

      {/* Basic CSS for structure and error messages (Add this to your CSS file) */}
      <style jsx="true">{`
        .registration-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .form-row { display: flex; gap: 20px; margin-bottom: 15px; }
        .form-group { flex: 1; display: flex; flex-direction: column; }
        .form-group.full-width { flex: 0 0 100%; }
        label { margin-bottom: 5px; font-weight: bold; }
        input, select { padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
        .error-message { color: red; font-size: 0.85em; margin-top: 5px; }
        .webcam-container { margin: 20px 0; border: 1px solid #ddd; padding: 10px; border-radius: 8px; text-align: center; }
        .webcam { width: 100%; max-width: 480px; height: auto; border-radius: 4px; }
        .buttons-container { display: flex; justify-content: space-between; margin-top: 20px; }
        .buttons-container button { padding: 10px 20px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
        .buttons-container button[type="submit"] { background-color: #007bff; color: white; }
        .buttons-container button[type="button"] { background-color: #28a745; color: white; }
        .status-message { margin-top: 15px; padding: 10px; border-radius: 4px; background-color: #e9ecef; }
        .photos-preview { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 10px; border-top: 1px solid #eee; padding-top: 10px; }
        .photos-preview h4 { flex: 0 0 100%; margin-bottom: 10px; }
        .thumbnail { width: 70px; height: 70px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default RegistrationForm;