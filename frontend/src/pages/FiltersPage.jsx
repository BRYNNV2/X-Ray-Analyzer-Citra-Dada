import { useState } from 'react';
import { Link } from 'react-router-dom';

const FILTERS = [
  {
    id: 'sobel-x',
    name: 'Sobel X',
    icon: '→',
    category: 'Deteksi Tepi',
    color: '#38bdf8',
    desc: 'Mendeteksi tepi vertikal dengan menghitung gradien intensitas piksel pada arah horizontal (sumbu X).',
    cara_kerja: 'Sobel X menggunakan kernel 3×3 yang dikonvolusikan dengan gambar. Kernel ini menghitung selisih piksel di kiri dan kanan setiap piksel, sehingga menghasilkan respons maksimum pada batas vertikal (garis tegak).',
    kernel: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
    keunggulan: ['Sederhana dan cepat', 'Mengurangi noise dengan smoothing', 'Cocok untuk deteksi tepi satu arah'],
    kelemahan: ['Hanya mendeteksi tepi vertikal', 'Sensitif terhadap noise'],
    use_case: 'Mendeteksi tepi tulang rusuk vertikal pada foto dada (chest X-Ray).',
  },
  {
    id: 'sobel-y',
    name: 'Sobel Y',
    icon: '↓',
    category: 'Deteksi Tepi',
    color: '#38bdf8',
    desc: 'Mendeteksi tepi horizontal dengan menghitung gradien intensitas piksel pada arah vertikal (sumbu Y).',
    cara_kerja: 'Mirip dengan Sobel X, namun kernelnya dirotasi 90°. Menghitung selisih piksel di atas dan bawah setiap piksel sehingga memberikan respons maksimum pada batas horizontal.',
    kernel: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
    keunggulan: ['Mendeteksi tepi horizontal secara spesifik', 'Tahan terhadap noise ringan'],
    kelemahan: ['Hanya mendeteksi tepi horizontal', 'Tidak cocok untuk tepi diagonal'],
    use_case: 'Mendeteksi batas diafragma dan pleura horizontal pada X-Ray paru.',
  },
  {
    id: 'sobel-xy',
    name: 'Sobel X+Y',
    icon: '✕',
    category: 'Deteksi Tepi',
    color: '#38bdf8',
    desc: 'Menggabungkan hasil Sobel X dan Y menggunakan magnitude gradien untuk mendeteksi tepi dari semua arah.',
    cara_kerja: 'Dihitung dari dua komponen: Gx (Sobel X) dan Gy (Sobel Y). Magnitude total = √(Gx² + Gy²). Hasilnya adalah peta tepi yang merespons semua arah (vertikal, horizontal, dan diagonal).',
    kernel: null,
    keunggulan: ['Mendeteksi tepi semua arah', 'Hasil lebih lengkap'],
    kelemahan: ['Sedikit lebih lambat dari Sobel satu arah', 'Masih rentan noise'],
    use_case: 'Deteksi kontur umum organ pada foto rontgen dada.',
  },
  {
    id: 'laplacian',
    name: 'Laplacian',
    icon: '∇²',
    category: 'Deteksi Tepi',
    color: '#818cf8',
    desc: 'Operator turunan kedua yang mendeteksi daerah perubahan intensitas yang cepat dari segala arah.',
    cara_kerja: 'Laplacian menggunakan turunan kedua dari intensitas gambar. Berbeda dengan Sobel yang berorientasi satu arah, Laplacian isotropik (tidak berarah). Tepi terdeteksi di mana nilai Laplacian mendekati nol (zero-crossing).',
    kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]],
    keunggulan: ['Isotropik — mendeteksi semua arah', 'Sensitif terhadap detail halus'],
    kelemahan: ['Sangat sensitif terhadap noise', 'Perlu preprocessing blur terlebih dahulu'],
    use_case: 'Mendeteksi batas-batas halus pada jaringan paru atau nodul.',
  },
  {
    id: 'canny',
    name: 'Canny Edge Detection',
    icon: '◈',
    category: 'Deteksi Tepi',
    color: '#34d399',
    desc: 'Algoritma deteksi tepi multi-tahap yang menghasilkan tepi tipis, akurat, dan terhubung dengan baik.',
    cara_kerja: '① Noise Reduction — Gaussian blur untuk mengurangi noise\n② Gradient Calculation — menghitung magnitude dan arah gradien\n③ Non-Maximum Suppression (NMS) — menipiskan tepi menjadi satu piksel\n④ Double Hysteresis Thresholding — memilih tepi kuat dan menghubungkan tepi lemah yang terhubung ke tepi kuat.',
    kernel: null,
    keunggulan: ['Tepi tipis dan akurat', 'Menghubungkan tepi terputus', 'Standar industri untuk medical imaging'],
    kelemahan: ['Lebih lambat', 'Parameter threshold perlu di-tuning'],
    use_case: 'Standar emas untuk segmentasi paru, jantung, dan tulang pada X-Ray medis.',
  },
  {
    id: 'gaussian',
    name: 'Gaussian Blur',
    icon: '◉',
    category: 'Penghalusan',
    color: '#fbbf24',
    desc: 'Menghaluskan gambar menggunakan distribusi Gaussian untuk mengurangi noise dan detail berlebih.',
    cara_kerja: 'Setiap piksel diganti dengan rata-rata tertimbang piksel di sekitarnya, dengan bobot mengikuti distribusi Gaussian 2D. Piksel yang lebih dekat ke pusat memiliki bobot lebih besar. Ukuran kernel menentukan seberapa kuat efek blur.',
    kernel: null,
    keunggulan: ['Mengurangi noise secara efektif', 'Natural dan realistis', 'Preprocessing yang baik untuk Canny/Laplacian'],
    kelemahan: ['Mengaburkan tepi', 'Kehilangan detail frekuensi tinggi'],
    use_case: 'Preprocessing untuk mengurangi noise sensor pada citra rontgen sebelum deteksi tepi.',
  },
  {
    id: 'median',
    name: 'Median Blur',
    icon: '▦',
    category: 'Penghalusan',
    color: '#fbbf24',
    desc: 'Mengganti setiap piksel dengan nilai median (tengah) dari piksel-piksel di sekitarnya.',
    cara_kerja: 'Kernel meluncur di atas gambar. Untuk setiap posisi, semua nilai piksel dalam window dikumpulkan, diurutkan, dan nilai tengah (median) diambil sebagai nilai baru. Tidak seperti Gaussian, median tidak terpengaruh oleh outlier.',
    kernel: null,
    keunggulan: ['Sangat efektif menghilangkan noise salt-and-pepper', 'Mempertahankan tepi lebih baik dari Gaussian'],
    kelemahan: ['Lebih lambat', 'Dapat menghilangkan detail halus'],
    use_case: 'Menghilangkan artefak titik-titik pada citra digital rontgen (noise impulsif).',
  },
  {
    id: 'sharpen',
    name: 'Penajaman (Sharpening)',
    icon: '◆',
    category: 'Penajaman',
    color: '#f472b6',
    desc: 'Meningkatkan ketajaman gambar dengan menonjolkan tepi dan detail melalui high-pass filter.',
    cara_kerja: 'Kernel penajaman menambahkan versi high-pass dari gambar ke gambar asli. Ini dilakukan dengan kernel yang memiliki nilai besar di tengah dan nilai negatif di sekitarnya, sehingga menonjolkan perubahan intensitas lokal.',
    kernel: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    keunggulan: ['Meningkatkan ketajaman visual', 'Membuat detail anatomis lebih jelas'],
    kelemahan: ['Dapat memperkuat noise', 'Efek berlebihan di area terang'],
    use_case: 'Mempertajam detail tulang dan jaringan padat pada gambar X-Ray.',
  },
  {
    id: 'unsharp',
    name: 'Unsharp Masking',
    icon: '⬡',
    category: 'Penajaman',
    color: '#f472b6',
    desc: 'Teknik penajaman tingkat lanjut yang menggunakan "mask blur" untuk menonjolkan detail frekuensi tinggi.',
    cara_kerja: '① Buat versi blur (Gaussian) dari gambar asli\n② Kurangkan versi blur dari gambar asli → menghasilkan "unsharp mask"\n③ Tambahkan mask yang dikuatkan kembali ke gambar asli\nRumus: Output = Asli + amount × (Asli − Blur)',
    kernel: null,
    keunggulan: ['Kontrol lebih presisi (amount, radius)', 'Populer di medical imaging profesional', 'Menonjolkan jaringan halus'],
    kelemahan: ['Parameter sensitif', 'Bisa over-sharpen jika amount terlalu besar'],
    use_case: 'Menonjolkan detail jaringan halus (interstitial pattern) pada X-Ray paru-paru.',
  },
];

const CATEGORIES = ['Semua', 'Deteksi Tepi', 'Penghalusan', 'Penajaman'];

function KernelMatrix({ kernel }) {
  if (!kernel) return <p className="no-kernel">Kernel dihitung secara dinamis</p>;
  return (
    <div className="kernel-matrix">
      {kernel.map((row, i) => (
        <div key={i} className="kernel-row">
          {row.map((val, j) => (
            <div key={j} className={`kernel-cell ${val > 0 ? 'pos' : val < 0 ? 'neg' : 'zero'}`}>
              {val}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function FiltersPage() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [category, setCategory]         = useState('Semua');

  const filtered = FILTERS.filter(f => category === 'Semua' || f.category === category);
  const detail   = activeFilter ? FILTERS.find(f => f.id === activeFilter) : null;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-badge">Referensi Teknis</div>
        <h1>Filter Konvolusi</h1>
        <p>Pelajari cara kerja setiap metode pemrosesan citra yang tersedia di aplikasi ini</p>
      </header>

      {/* Category tabs */}
      <div className="cat-tabs">
        {CATEGORIES.map(c => (
          <button key={c}
            className={`cat-tab${category === c ? ' active' : ''}`}
            onClick={() => { setCategory(c); setActiveFilter(null); }}>
            {c}
          </button>
        ))}
      </div>

      <div className={`filter-page-grid${detail ? ' has-detail' : ''}`}>
        {/* Cards */}
        <div className="filter-cards-grid">
          {filtered.map(f => (
            <button key={f.id}
              className={`filter-card${activeFilter === f.id ? ' active' : ''}`}
              style={{ '--card-color': f.color }}
              onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}>
              <div className="fc-top">
                <span className="fc-icon" style={{ color: f.color }}>{f.icon}</span>
                <span className="fc-category">{f.category}</span>
              </div>
              <h3 className="fc-name">{f.name}</h3>
              <p className="fc-desc">{f.desc}</p>
              <span className="fc-cta">{activeFilter === f.id ? 'Tutup ↑' : 'Selengkapnya →'}</span>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {detail && (
          <aside className="glass-panel filter-detail-panel">
            <div className="fdp-header" style={{ '--card-color': detail.color }}>
              <span className="fdp-icon" style={{ color: detail.color }}>{detail.icon}</span>
              <div>
                <h2>{detail.name}</h2>
                <span className="fdp-cat">{detail.category}</span>
              </div>
            </div>

            <p className="fdp-desc">{detail.desc}</p>

            <div className="fdp-section">
              <h4>Cara Kerja</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{detail.cara_kerja}</p>
            </div>

            {detail.kernel && (
              <div className="fdp-section">
                <h4>Kernel Matrix (3×3)</h4>
                <KernelMatrix kernel={detail.kernel} />
              </div>
            )}

            <div className="fdp-section fdp-two-col">
              <div>
                <h4>Keunggulan</h4>
                <ul className="fdp-list green">
                  {detail.keunggulan.map(k => <li key={k}>{k}</li>)}
                </ul>
              </div>
              <div>
                <h4>Kelemahan</h4>
                <ul className="fdp-list red">
                  {detail.kelemahan.map(k => <li key={k}>{k}</li>)}
                </ul>
              </div>
            </div>

            <div className="fdp-section fdp-usecase">
              <h4>Penggunaan di Medis</h4>
              <p>{detail.use_case}</p>
            </div>

            <Link to="/" className="fdp-try-btn">
              Coba Filter Ini →
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}
