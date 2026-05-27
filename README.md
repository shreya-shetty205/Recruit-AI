# RecruitAI - AI-Powered Resume Screening Platform

A full-stack recruitment platform that uses AI-powered algorithms to automatically match resumes with job postings, rank candidates, and streamline the hiring process.

## 🚀 Features

### Core Functionality
- **AI Resume Matching** - Automatic skill extraction and scoring (70% skills, 15% experience, 10% education, 5% keywords)
- **Job Management** - Create, edit, and manage job postings with detailed requirements
- **Resume Upload** - Drag-and-drop PDF upload with automatic text extraction
- **Candidate Tracking** - Comprehensive candidate pipeline with status management
- **Analysis Dashboard** - Visual analytics with charts and candidate rankings
- **Smart Search & Filtering** - Filter by status, score, skills, and more

### Technical Features
- **JWT Authentication** - Secure user authentication with token-based auth
- **Dark Mode** - Full dark mode support with theme persistence
- **Responsive Design** - Mobile-first design that works on all devices
- **Real-time Updates** - Toast notifications for all actions
- **Pagination** - Efficient data loading with pagination
- **File Management** - Resume upload, download, and deletion

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+

### 1. Clone the repository
```bash
git clone <repository-url>
cd proj
```

### 2. Install dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 3. Environment Configuration

**Server** - Create `server/.env`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/recruitai

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

**Client** - Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB
```bash
# Using MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Run the application

**Development mode (separate terminals):**

Terminal 1 - Server:
```bash
cd server
npm run dev
```

Terminal 2 - Client:
```bash
cd client
npm run dev
```

**Production mode:**
```bash
# Build client
cd client
npm run build

# Start server (serves built client)
cd ../server
npm start
```

## 🌐 Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **MongoDB:** mongodb://localhost:27017

## 📁 Project Structure

```
proj/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/       # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── layouts/       # Layout components
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── UploadResumes.jsx
│   │   │   ├── Analysis.jsx
│   │   │   └── Candidates.jsx
│   │   ├── services/      # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── config/
│   │   └── db.js         # MongoDB connection
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── resumeController.js
│   │   ├── candidateController.js
│   │   ├── analysisController.js
│   │   └── dashboardController.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Resume.js
│   │   └── Candidate.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── resumes.js
│   │   ├── candidates.js
│   │   ├── analysis.js
│   │   └── dashboard.js
│   ├── uploads/         # Resume file storage
│   ├── utils/
│   │   └── aiMatcher.js # AI matching algorithm
│   ├── index.js
│   └── package.json
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Jobs
- `GET /api/jobs` - Get all jobs (protected)
- `POST /api/jobs` - Create job (protected)
- `GET /api/jobs/:id` - Get single job (protected)
- `PUT /api/jobs/:id` - Update job (protected)
- `DELETE /api/jobs/:id` - Delete job (protected)

### Resumes
- `POST /api/resumes/upload` - Upload resume (protected)
- `GET /api/resumes` - Get all resumes (protected)
- `GET /api/resumes/:id/download` - Download resume (protected)
- `DELETE /api/resumes/:id` - Delete resume (protected)

### Candidates
- `GET /api/candidates` - Get all candidates (protected)
- `GET /api/candidates/:id` - Get single candidate (protected)
- `PATCH /api/candidates/:id/status` - Update status (protected)
- `DELETE /api/candidates/:id` - Delete candidate (protected)

### Analysis
- `POST /api/analysis/run` - Run AI analysis (protected)
- `GET /api/analysis/summary/:jobId` - Get analysis summary (protected)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (protected)

## 🤖 AI Matching Algorithm

The AI matching engine uses a multi-factor scoring system:

### Scoring Breakdown
- **Skills Match (70%)** - Compares candidate skills with job requirements
- **Experience (15%)** - Evaluates years of experience
- **Education (10%)** - Assesses educational background
- **Keywords (5%)** - Matches job description keywords

### Skill Extraction
- 100+ technology keywords dictionary
- Regex-based pattern matching
- Case-insensitive matching
- Support for compound skills (e.g., "React.js", "Node.js")

### Categories Covered
- Programming languages (JavaScript, Python, Java, etc.)
- Frontend frameworks (React, Vue, Angular, etc.)
- Backend frameworks (Express, Django, Flask, etc.)
- Databases (MongoDB, PostgreSQL, MySQL, etc.)
- Cloud & DevOps (AWS, Docker, Kubernetes, etc.)
- Data & AI (TensorFlow, PyTorch, Pandas, etc.)

## 👤 User Workflow

1. **Register/Login** - Create account or login
2. **Create Jobs** - Add job postings with requirements
3. **Upload Resumes** - Upload candidate resumes (PDF)
4. **Run Analysis** - AI automatically scores and ranks candidates
5. **Review Candidates** - View detailed match reports
6. **Manage Pipeline** - Update candidate status (Pending → Shortlisted → Interview → Rejected)
7. **Export Data** - Download candidate data as CSV

## 🎨 UI Features

- **Modern Design** - Clean, professional interface
- **Dark Mode** - Eye-friendly dark theme
- **Responsive** - Works on desktop, tablet, and mobile
- **Loading States** - Skeleton loaders for better UX
- **Toast Notifications** - Real-time feedback
- **Modal Dialogs** - Intuitive forms and details
- **Data Visualization** - Charts and graphs
- **Smooth Animations** - Fade-in and transitions

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt rounds
- **Protected Routes** - Frontend and backend route protection
- **CORS Configuration** - Controlled cross-origin access
- **Helmet Security** - HTTP security headers
- **Input Validation** - Server-side validation
- **File Type Validation** - Only PDF/DOC allowed
- **File Size Limits** - 10MB max file size

## 📊 Database Schema

### User
- name, email, password (hashed)
- role (recruiter/admin)
- timestamps

### Job
- title, company, department, location
- type, experience, skills[]
- description, isActive
- createdBy (User ref)
- timestamps

### Resume
- filename, originalName, mimetype, size, path
- extractedText, candidateName, candidateEmail, candidatePhone
- skills[], experience, education
- jobId (Job ref), uploadedBy (User ref)
- timestamps

### Candidate
- name, email, phone
- resumeId (Resume ref), jobId (Job ref), jobTitle
- matchScore, matchingSkills[], missingSkills[], allSkills[]
- experience, education, summary
- status (pending/shortlisted/interview/rejected)
- createdBy (User ref)
- timestamps

## 🚧 Known Limitations

- PDF parsing only (DOC/DOCX support limited)
- Basic AI matching (no ML model)
- No email notifications
- No bulk operations
- No advanced analytics
- No interview scheduling
- No candidate communication history

## 🔮 Future Enhancements

- [ ] Machine learning-based matching
- [ ] Email notifications
- [ ] Bulk resume upload
- [ ] Advanced analytics dashboard
- [ ] Interview scheduling
- [ ] Candidate communication portal
- [ ] Video interview integration
- [ ] Resume parsing improvements
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Comprehensive testing
- [ ] Docker deployment
- [ ] CI/CD pipeline

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Development

### Code Quality
- Clean, modular code structure
- Consistent naming conventions
- Comprehensive error handling
- Security best practices

### Performance
- Efficient database queries
- Pagination for large datasets
- Optimized file handling
- Fast build times with Vite

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using React, Node.js, and MongoDB**
