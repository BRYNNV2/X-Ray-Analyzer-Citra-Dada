# X-Ray Medical Image Analyzer 🩻🔬

A professional full-stack web application designed for processing and analyzing medical imagery, specifically chest X-Rays. This dashboard provides essential image processing tools such as convolution filtering and histogram equalization algorithms to enhance visual details, edge detection, and contrast preparation.

## ✨ Features

- **Modern Dashboard UI:** A clean, professional, and dark-themed interface built specifically for medical tool analysis without clutter.
- **Convolution Filters:**
  - Sobel (X, Y, X+Y)
  - Laplacian
  - Canny Edge Detection
  - Blurring (Gaussian & Median)
  - Sharpening & Advanced Unsharp Masking
- **Histogram Enhancement:**
  - Global Histogram Equalization
  - CLAHE (Contrast Limited Adaptive Histogram Equalization) - Highly recommended for medical imagery.
- **Side-by-Side Live Comparison:** Compare original vs. processed images interactively.
- **Dynamic Histogram Plotting:** Automatically visualizes original and post-processed color distribution charts.

## 🛠️ Technology Stack

**Frontend (Client-side):**
- **React.js + Vite** for blazing fast performance.
- Modern Vanilla CSS & Lucide UI icons.

**Backend (Server-side):**
- **Python & FastAPI** for robust REST API handling.
- **OpenCV (`cv2`)** as the core digital image processing engine.
- **Matplotlib** for server-side chart generation.

*(Note: `app.py` in the root folder is the legacy Streamlit prototype version).*

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### 1. Prerequisites
Ensure you have installed:
- [Node.js](https://nodejs.org/) (for running the Frontend)
- [Python 3.8+](https://www.python.org/) (for running the Backend)

### 2. Setup Backend (FastAPI)

Open your terminal and run the following commands:

```bash
# Create a virtual environment
python -m venv .venv
# Activate: 
# on Windows:
.venv\Scripts\activate
# on macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start the API server
cd backend
python -m uvicorn main:app --reload
```
The backend API will run at `http://127.0.0.1:8000`.

### 3. Setup Frontend (React)

Open a new terminal window:

```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

The web app will run locally at `http://localhost:5173`. 

## 📐 General Project Structure

```text
X-Ray-Analyzer-Citra-Dada/
│
├── frontend/             # React User Interface (Client)
│   ├── src/              # Components, Pages, and Styling
│   └── package.json      # Node dependencies
│
├── backend/              # FastAPI API (Server)
│   ├── main.py           # Core processing logic
│   └── requirements.txt  # Python packages
│
└── app.py                # Legacy Streamlit prototype
```

## 👨‍💻 Background
Developed as part of an academic requirement for the course *Pengolahan Citra Digital* (Digital Image Processing). Aimed at providing accessible tools for preprocessing visual data typically used before Machine Learning or AI analysis.

Mhd.Febri Yansah 2301020104
Nanda Apriyani 2301020119
Universitas Maritim Raja Ali Haji
