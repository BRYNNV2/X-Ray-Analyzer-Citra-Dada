import streamlit as st
import cv2
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from streamlit_image_comparison import image_comparison

# Konfigurasi Halaman Dasar
st.set_page_config(page_title="X-Ray Image Processing", layout="wide", page_icon="🩺")

# Menggunakan CSS kustom untuk memberikan tampilan UI yang lebih 'Rich' dan elegan
st.markdown("""
<style>
    .reportview-container {
        background: #0e1117;
    }
    .main-header {
        font-size: 2.5rem !important;
        font-weight: 700;
        color: #4A90E2;
        margin-bottom: 0px;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #A0AEC0;
        margin-bottom: 30px;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<p class="main-header">🩺 X-Ray Image Processing & Analysis</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Aplikasi Prapemrosesan Anatomi Paru Menggunakan Teknik Konvolusi & Filter Histogram</p>', unsafe_allow_html=True)

# ----------------- FUNGSI BANTUAN -----------------
def apply_convolution(image, filter_type, kernel_size=3):
    # Ubah ke mode grayscale
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
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
        sobel = cv2.magnitude(sobelx, sobely)
        return cv2.convertScaleAbs(sobel)
        
    elif filter_type == "Laplacian":
        laplacian = cv2.Laplacian(gray, cv2.CV_64F, ksize=kernel_size)
        return cv2.convertScaleAbs(laplacian)
        
    elif filter_type == "Canny Edge Detection":
        # Canny butuh treshold 1 dan 2
        edges = cv2.Canny(gray, 100, 200)
        return edges
        
    elif filter_type == "Gaussian Blur":
        blur = cv2.GaussianBlur(gray, (kernel_size, kernel_size), 0)
        return blur
        
    elif filter_type == "Median Blur":
        blur = cv2.medianBlur(gray, kernel_size)
        return blur
        
    elif filter_type == "Penajaman (Sharpening)":
        # Kernel sharpening standar
        kernel = np.array([[0, -1, 0],
                           [-1, 5,-1],
                           [0, -1, 0]])
        sharpened = cv2.filter2D(gray, -1, kernel)
        return sharpened
        
    elif filter_type == "Unsharp Masking (Advance)":
        # Teknik yang banyak digunakan di radiologi medis untuk menajamkan tepian mikro
        gaussian_3 = cv2.GaussianBlur(gray, (0, 0), 2.0)
        unsharp_image = cv2.addWeighted(gray, 1.5, gaussian_3, -0.5, 0, gray)
        return unsharp_image

    return gray

def apply_histogram(image, hist_type):
    # Ubah ke mode grayscale
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    else:
        gray = image
        
    if hist_type == "Global Histogram Equalization":
        return cv2.equalizeHist(gray)
        
    elif hist_type == "CLAHE (Disarankan untuk Medis)":
        # CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        return clahe.apply(gray)
        
    return gray

def plot_histogram(image, title):
    fig, ax = plt.subplots(figsize=(6, 3))
    # flatten matriks jadi array 1D
    ax.hist(image.ravel(), bins=256, range=[0, 256], color='#4A90E2', alpha=0.8)
    ax.set_title(f'Histogram Distribusi Piksel:\n{title}', color='white', fontsize=10)
    ax.grid(color='#333333', linestyle='--', linewidth=0.5)
    ax.set_facecolor('#0e1117')
    fig.patch.set_facecolor('#0e1117')
    ax.spines['bottom'].set_color('white')
    ax.spines['left'].set_color('white')
    ax.tick_params(axis='x', colors='white')
    ax.tick_params(axis='y', colors='white')
    return fig

# ----------------- SIDEBAR -----------------
with st.sidebar:
    st.header("⚙️ Konfigurasi")
    
    uploaded_file = st.file_uploader("Unggah Gambar Rontgen (X-Ray)", type=['jpg', 'jpeg', 'png'])
    
    st.markdown("---")
    st.subheader("1. Pemrosesan Mask (Konvolusi)")
    conv_options = [
        "Tidak Ada",
        "Sobel X",
        "Sobel Y", 
        "Sobel X+Y (Gabungan)",
        "Laplacian",
        "Canny Edge Detection",
        "Gaussian Blur",
        "Median Blur",
        "Penajaman (Sharpening)",
        "Unsharp Masking (Advance)"
    ]
    conv_choice = st.selectbox("Pilih Filter Konvolusi:", conv_options)
    
    # Kernel size logic
    kernel_size = 3
    if conv_choice in ["Sobel X", "Sobel Y", "Sobel X+Y (Gabungan)", "Laplacian", "Gaussian Blur", "Median Blur"]:
        kernel_size = st.slider("Ukuran Kernel (Ganjil)", 3, 11, step=2)
        
    st.markdown("---")
    st.subheader("2. Spesifikasi Histogram")
    hist_options = [
        "Tidak Ada",
        "Global Histogram Equalization",
        "CLAHE (Disarankan untuk Medis)"
    ]
    hist_choice = st.selectbox("Pilih Filter Histogram:", hist_options)


# ----------------- MAIN AREA -----------------
if uploaded_file is not None:
    # Membaca gambar upload menggunakan PIL ke Numpy Array
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    original_image = cv2.imdecode(file_bytes, 1) # BGR
    original_rgb = cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB)
    
    # Convert original to simple grayscale for display comparisons
    original_gray = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)
    
    # Inisialisasi gambar untuk dirender
    processed_image = original_image.copy()
    
    # --- PROSES CITRA ---
    if conv_choice != "Tidak Ada":
        processed_image = apply_convolution(processed_image, conv_choice, kernel_size)
    else:
        processed_image = original_gray.copy()
        
    if hist_choice != "Tidak Ada":
        processed_image = apply_histogram(processed_image, hist_choice)

    # --- TAMPILAN VISUAL ---
    # Konversi hasil ke RGB/Grayscale format untuk renderer streamlit-image-comparison
    # karena streamlit-image-comparison butuh format PIL Image
    img1_pil = Image.fromarray(original_gray)
    img2_pil = Image.fromarray(processed_image)

    st.subheader("Visualisasi Komparatif 🔍")
    st.write("Geser *slider* ke kanan dan ke kiri untuk melihat perbandingan Original VS Setelah Proses.")
    
    # Render interactive slider
    image_comparison(
        img1=img1_pil,
        img2=img2_pil,
        label1="Original Image",
        label2="Processed Image",
        width=1000,
        starting_position=50,
        show_labels=True,
        make_responsive=True,
        in_memory=True
    )
    
    st.markdown("---")
    
    # Render Histograms
    st.subheader("Analisis Histogram (Distribusi Keabuan Piksel) 📊")
    col1, col2 = st.columns(2)
    
    with col1:
        st.pyplot(plot_histogram(original_gray, "Gambar Asli"))
        st.caption("Distribusi piksel pada gambar X-Ray original.")
        
    with col2:
        st.pyplot(plot_histogram(processed_image, "Gambar Telah Diproses"))
        st.caption(f"Distribusi piksel setelah filter: {conv_choice} & {hist_choice}")

else:
    st.info("👈 Silakan unggah gambar pada panel di sebelah kiri untuk memulai analisis.")
    st.markdown("---")
    st.markdown("""
    ### Tentang Teknik yang Digunakan:
    - **Filter Sobel/Laplacian/Canny:** Membantu menonjolkan struktur tulang rusuk dan batas paru, penting bagi sistem segmentasi otomatis.
    - **Smoothing (Blur):** Menghilangkan *noise* pada citra rontgen berkualitas rendah untuk meminimalisasi gangguan sebelum pembacaan sistem.
    - **Penajaman (Sharpening / Unsharp Masking):** Mempertegas visual dari infiltrat (bercak/opasitas cairan) yang menjadi ciri-ciri pneumonia.
    - **Spesifikasi Histogram & CLAHE:** Menyetimbangkan kontras dari rontgen paru agar mesin otomatis (AI) tidak melakukan salah generalisasi karena perbedaan kalibrasi pencahayaan antar mesin X-ray rumah sakit yang berbeda-beda.
    """)
