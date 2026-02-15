# Well Log Analyzer

A modern web-based application for ingesting, visualizing, and analyzing LAS (Log ASCII Standard) well-log files with AI-powered interpretation capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Key Design Decisions](#key-design-decisions)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)
- [License](#license)


---

## ✨ Features

### Core Features
- **📤 LAS File Upload**: Drag-and-drop or browse to upload LAS files (up to 50MB)
- **📊 Multi-Track Visualization**: Industry-standard well-log visualization with up to 6 simultaneous curves
- **🔍 Interactive Exploration**: 
  - Zoom and pan functionality
  - Depth range filtering
  - Curve selection with search
  - Hover tooltips with exact values
- **🤖 AI-Powered Analysis**: Google Gemini AI generates detailed geological interpretations
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **☁️ Cloud Storage**: AWS S3 integration for reliable file storage
- **💾 Efficient Data Management**: MongoDB for fast curve data retrieval

### Additional Features
- Real-time data filtering
- Export charts as PNG
- Markdown-formatted AI reports
- Copy/download interpretation results
- File metadata display
- Error handling and retry mechanisms

---

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


