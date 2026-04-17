import { useState, useRef } from 'react';

const CONV_OPTIONS = [
  "Tidak Ada", "Sobel X", "Sobel Y", "Sobel X+Y (Gabungan)",
  "Laplacian", "Canny Edge Detection", "Gaussian Blur",
  "Median Blur", "Penajaman (Sharpening)", "Unsharp Masking (Advance)"
];

const HIST_OPTIONS = [
  "Tidak Ada",
  "Global Histogram Equalization",
  "CLAHE (Disarankan untuk Medis)"
];

const KERNEL_FILTERS = ["Sobel X", "Sobel Y", "Sobel X+Y (Gabungan)", "Laplacian", "Gaussian Blur", "Median Blur"];

const CONV_INFO = {
  "Sobel X":                  { icon: "→",  desc: "Mendeteksi tepi vertikal dengan menghitung gradien intensitas piksel pada arah horizontal (sumbu X). Cocok untuk menemukan garis tegak." },
  "Sobel Y":                  { icon: "↓",  desc: "Mendeteksi tepi horizontal dengan menghitung gradien pada arah vertikal (sumbu Y). Cocok untuk menemukan garis mendatar." },
  "Sobel X+Y (Gabungan)":     { icon: "✕",  desc: "Menggabungkan Sobel X dan Y menggunakan magnitude gradien √(Gx²+Gy²). Menghasilkan deteksi tepi dari semua arah secara bersamaan." },
  "Laplacian":                { icon: "∇²", desc: "Operator turunan kedua yang sensitif terhadap perubahan intensitas cepat. Efektif mendeteksi tepi namun rentan terhadap noise." },
  "Canny Edge Detection":     { icon: "◈",  desc: "Algoritma multi-tahap (smoothing → gradien → NMS → hysteresis). Menghasilkan tepi tipis, akurat — standar industri untuk X-Ray." },
  "Gaussian Blur":            { icon: "◉",  desc: "Menghaluskan gambar dengan distribusi Gaussian untuk mengurangi noise. Sering digunakan sebagai preprocessing sebelum deteksi tepi." },
  "Median Blur":              { icon: "▦",  desc: "Mengganti setiap piksel dengan nilai median di sekitarnya. Sangat efektif menghilangkan noise salt-and-pepper tanpa mengaburkan tepi." },
  "Penajaman (Sharpening)":   { icon: "◆",  desc: "Meningkatkan kontras tepi dan detail halus dengan kernel high-pass filter. Membuat struktur anatomis lebih jelas dan tajam." },
  "Unsharp Masking (Advance)":{ icon: "⬡",  desc: "Teknik penajaman tingkat lanjut: mengurangi versi blur untuk menonjolkan detail frekuensi tinggi. Populer di imaging medis." },
};

const HIST_INFO = {
  "Global Histogram Equalization": { icon: "≡", desc: "Meratakan distribusi histogram secara global. Sederhana dan cepat, namun dapat over-enhance area yang sudah kontras tinggi." },
  "CLAHE (Disarankan untuk Medis)":{ icon: "⊞", desc: "Contrast Limited Adaptive HE — memproses gambar dalam grid kecil dan membatasi amplifikasi kontras. Direkomendasikan untuk citra medis." },
};

function FilterInfoCard({ info }) {
  if (!info) return null;
  return (
    <div className="filter-info-card">
      <span className="filter-info-icon">{info.icon}</span>
      <p className="filter-info-desc">{info.desc}</p>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M9 9.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9.75 9.75H3a.75.75 0 01-.75-.75V6a.75.75 0 01.75-.75h17.25c.414 0 .75.336.75.75v13.5a.75.75 0 01-.75.75z" />
    </svg>
  );
}

function HistogramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:14,height:14}}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

export default function AnalyzerPage() {
  const [file, setFile]               = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName]       = useState('');
  const [convChoice, setConvChoice]   = useState("Tidak Ada");
  const [kernelSize, setKernelSize]   = useState(3);
  const [histChoice, setHistChoice]   = useState("Tidak Ada");
  const [isLoading, setIsLoading]     = useState(false);
  const [result, setResult]           = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
    setFileName(selectedFile.name);
    setResult(null);
  };

  const handleFileChange  = (e) => handleFile(e.target.files[0]);
  const handleDragOver    = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave   = ()  => setDragOver(false);
  const handleDrop        = (e) => {
    e.preventDefault(); setDragOver(false);
    const d = e.dataTransfer.files[0];
    if (d && d.type.startsWith('image/')) handleFile(d);
  };

  const processImage = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conv_choice', convChoice);
      formData.append('kernel_size', kernelSize);
      formData.append('hist_choice', histChoice);
      const resp = await fetch('http://localhost:8000/api/process', { method: 'POST', body: formData });
      if (!resp.ok) throw new Error();
      setResult(await resp.json());
    } catch {
      alert("Error: Pastikan Backend FastAPI sudah berjalan di port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const showKernel = KERNEL_FILTERS.includes(convChoice);

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-badge">Live Processing</div>
        <h1>X-Ray Analyzer</h1>
        <p>Unggah gambar rontgen dan terapkan filter pemrosesan citra secara real-time</p>
      </header>

      <div className="layout-grid">
        {/* Sidebar */}
        <aside className="glass-panel sidebar">
          <h2>Konfigurasi</h2>

          <div
            className={`upload-area${dragOver ? ' drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !filePreview && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange} style={{ display: 'none' }} />
            {!filePreview ? (
              <>
                <UploadIcon />
                <p><span>Klik atau drag &amp; drop</span><br />JPEG, PNG — X-Ray / Foto Medis</p>
              </>
            ) : (
              <div className="preview-container" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <span className="preview-badge">✓ {fileName}</span>
                <img src={filePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="section-divider" />

          <div className="section-title">
            <span className="section-number">1</span>
            Filter Konvolusi
          </div>
          <div className="form-group">
            <label className="form-label">Metode Filter</label>
            <select value={convChoice} onChange={(e) => setConvChoice(e.target.value)}>
              {CONV_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <FilterInfoCard info={CONV_INFO[convChoice]} />
          </div>

          {showKernel && (
            <div className="form-group range-wrapper">
              <div className="range-labels">
                <span>Ukuran Kernel</span>
                <span className="range-value">{kernelSize}×{kernelSize}</span>
              </div>
              <input type="range" min="3" max="11" step="2"
                value={kernelSize} onChange={(e) => setKernelSize(e.target.value)} />
            </div>
          )}

          <div className="section-divider" />

          <div className="section-title">
            <span className="section-number">2</span>
            Spesifikasi Histogram
          </div>
          <div className="form-group">
            <label className="form-label">Metode Enhancement</label>
            <select value={histChoice} onChange={(e) => setHistChoice(e.target.value)}>
              {HIST_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <FilterInfoCard info={HIST_INFO[histChoice]} />
          </div>

          <button className="process-btn" onClick={processImage}
            disabled={!file || isLoading} id="process-button">
            {isLoading
              ? <><div className="loader-ring" style={{width:20,height:20,borderWidth:2}} /> Memproses...</>
              : <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width:18,height:18}}>
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd"/>
                </svg> Mulai Proses</>
            }
          </button>
        </aside>

        {/* Main */}
        <main className="glass-panel main-content">
          <h2 className="results-header">Hasil Pemrosesan &amp; Visualisasi</h2>

          {!result && !isLoading && (
            <div className="empty-state">
              <div className="empty-state-icon"><ImageIcon /></div>
              <p>Unggah gambar X-Ray dan konfigurasikan filter untuk memulai analisis.</p>
              <div className="empty-steps">
                <span className="empty-step">① Unggah Gambar</span>
                <span className="empty-step">② Pilih Filter</span>
                <span className="empty-step">③ Mulai Proses</span>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="loading-state">
              <div className="loader-ring" />
              <p>Menjalankan algoritma pemrosesan citra...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="result-animate">
              <div className="image-comparison">
                <div className="image-box">
                  <div className="image-box-header">
                    <span className="img-dot original" />
                    <h3>Original (Grayscale)</h3>
                  </div>
                  <img src={`data:image/png;base64,${result.original_gray}`} alt="Original" />
                </div>
                <div className="image-box">
                  <div className="image-box-header">
                    <span className="img-dot processed" />
                    <h3>Hasil Pemrosesan</h3>
                  </div>
                  <img src={`data:image/png;base64,${result.processed_image}`} alt="Processed" />
                </div>
              </div>
              <div className="histograms-section">
                <h4><HistogramIcon /> Distribusi Histogram</h4>
                <div className="histograms-grid">
                  <div className="histogram-box">
                    <p>Histogram Asli</p>
                    <img src={`data:image/png;base64,${result.hist_original}`} alt="Histogram Original" />
                  </div>
                  <div className="histogram-box">
                    <p>Histogram Setelah Proses</p>
                    <img src={`data:image/png;base64,${result.hist_processed}`} alt="Histogram Processed" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
