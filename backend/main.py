import io
import base64
import cv2
import numpy as np
import matplotlib
matplotlib.use('Agg') # Biar aman thread di FastAPI
import matplotlib.pyplot as plt
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI(title="X-Ray Image Processing API")

# Setup CORS untuk mengizinkan request dari frontend React/Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Ganti dengan domain frontend nanti
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def image_to_base64(img_array):
    _, buffer = cv2.imencode('.png', img_array)
    return base64.b64encode(buffer).decode('utf-8')

def plot_histogram_base64(image, title):
    fig, ax = plt.subplots(figsize=(5, 3))
    ax.hist(image.ravel(), bins=256, range=[0, 256], color='#4A90E2', alpha=0.9)
    ax.set_title(title, color='#f8fafc', fontsize=11, fontname='sans-serif', pad=10)
    ax.grid(color='#334155', linestyle='--', linewidth=0.5, alpha=0.5)
    
    ax.tick_params(axis='x', colors='#94a3b8')
    ax.tick_params(axis='y', colors='#94a3b8')
    ax.spines['bottom'].set_color('#475569')
    ax.spines['left'].set_color('#475569')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    # Simpan ke memori buffer dan convert ke base64
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches='tight', transparent=True)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_base64

def apply_convolution(image, filter_type, kernel_size=3):
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    if filter_type == "Sobel X":
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=kernel_size)
        return cv2.convertScaleAbs(sobelx)
    elif filter_type == "Sobel Y":
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=kernel_size)
        return cv2.convertScaleAbs(sobely)
    elif filter_type == "Sobel X+Y (Gabungan)":
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=kernel_size)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=kernel_size)
        return cv2.convertScaleAbs(cv2.magnitude(sobelx, sobely))
    elif filter_type == "Laplacian":
        return cv2.convertScaleAbs(cv2.Laplacian(gray, cv2.CV_64F, ksize=kernel_size))
    elif filter_type == "Canny Edge Detection":
        return cv2.Canny(gray, 100, 200)
    elif filter_type == "Gaussian Blur":
        return cv2.GaussianBlur(gray, (kernel_size, kernel_size), 0)
    elif filter_type == "Median Blur":
        return cv2.medianBlur(gray, kernel_size)
    elif filter_type == "Penajaman (Sharpening)":
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        return cv2.filter2D(gray, -1, kernel)
    elif filter_type == "Unsharp Masking (Advance)":
        gaussian_3 = cv2.GaussianBlur(gray, (0, 0), 2.0)
        return cv2.addWeighted(gray, 1.5, gaussian_3, -0.5, 0, gray)
    return gray

def apply_histogram(image, hist_type):
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
        
    if hist_type == "Global Histogram Equalization":
        return cv2.equalizeHist(gray)
    elif hist_type == "CLAHE (Disarankan untuk Medis)":
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        return clahe.apply(gray)
    return gray

@app.post("/api/process")
async def process_image(
    file: UploadFile = File(...),
    conv_choice: str = Form("Tidak Ada"),
    kernel_size: int = Form(3),
    hist_choice: str = Form("Tidak Ada")
):
    # Baca file upload menjadi numpy array
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    original_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Konversi untuk display original grayscale karena proses murni grayscale
    original_gray = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)
    processed_image = original_image.copy()

    # Aplikasikan Filter Konvolusi
    if conv_choice != "Tidak Ada":
        processed_image = apply_convolution(processed_image, conv_choice, kernel_size)
    else:
        processed_image = original_gray.copy()
        
    # Aplikasikan Filter Histogram
    if hist_choice != "Tidak Ada":
        processed_image = apply_histogram(processed_image, hist_choice)
        
    # Generate charts
    hist_original_b64 = plot_histogram_base64(original_gray, "Gambar Asli")
    hist_processed_b64 = plot_histogram_base64(processed_image, "Gambar Telah Diproses")
    
    return {
        "original_gray": image_to_base64(original_gray),
        "processed_image": image_to_base64(processed_image),
        "hist_original": hist_original_b64,
        "hist_processed": hist_processed_b64
    }
