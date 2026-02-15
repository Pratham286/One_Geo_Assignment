# Well Log Analyzer

A modern web-based application for ingesting, visualizing, and analyzing LAS (Log ASCII Standard) well-log files with AI-powered interpretation capabilities.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Visualization**: Plotly.js (react-plotly.js)
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **File Parsing**: las-js
- **Cloud Storage**: AWS S3 SDK
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **File Upload**: Multer


## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd well-log-analyzer
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend/src
node index.js
```
Backend will run on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`


