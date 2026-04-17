import { Link } from 'react-router-dom';

const METHODS = [
  {
    id: 'global-he',
    name: 'Global Histogram Equalization',
    icon: '≡',
    color: '#38bdf8',
    short: 'Meratakan distribusi histogram secara global di seluruh gambar.',
    desc: 'Global Histogram Equalization (GHE) adalah teknik enhancement kontras yang bekerja dengan meratakan distribusi histogram intensitas secara keseluruhan. Tujuannya adalah agar setiap nilai intensitas memiliki kemungkinan kemunculan yang sama (uniform distribution).',
    cara_kerja: [
      'Hitung histogram h(r) dari gambar grayscale',
      'Hitung Cumulative Distribution Function (CDF): CDF(r) = Σ h(i) untuk i=0 hingga r',
      'Normalisasi CDF ke rentang [0, 255]',
      'Pemetaan: s = round((CDF(r) − CDF_min) / (N − CDF_min) × 255)',
      'Aplikasikan pemetaan ke seluruh piksel gambar',
    ],
    pros: [
      'Implementasi sangat sederhana',
      'Cepat dieksekusi',
      'Meningkatkan kontras gambar secara keseluruhan',
    ],
    cons: [
      'Tidak mempertimbangkan konteks lokal',
      'Dapat over-enhance area yang sudah kontras',
      'Dapat mengurangi detail di area gelap/terang',
      'Kurang cocok untuk citra medis yang membutuhkan presisi lokal',
    ],
    use_case: 'Cocok untuk preprocessing awal atau saat gambar secara keseluruhan kurang kontras. Tidak direkomendasikan untuk analisis klinis.',
    formula: 'CDF(r) = Σᵢ₌₀ʳ  h(i) / N',
  },
  {
    id: 'clahe',
    name: 'CLAHE',
    icon: '⊞',
    color: '#34d399',
    short: 'Adaptive histogram equalization dengan pembatasan kontras per tile.',
    desc: 'CLAHE (Contrast Limited Adaptive Histogram Equalization) adalah versi lanjutan dari HE yang membagi gambar menjadi tile-tile kecil dan menerapkan ekualisasi histogram secara lokal di setiap tile. Clip limit diterapkan untuk mencegah over-amplification noise.',
    cara_kerja: [
      'Bagi gambar menjadi grid tile (misal 8×8)',
      'Hitung histogram lokal untuk setiap tile',
      'Terapkan clip limit: batasi nilai histogram yang melampaui threshold',
      'Distribusikan sisa di atas clip limit secara merata ke semua bin',
      'Lakukan ekualisasi histogram pada setiap tile secara lokal',
      'Interpolasi bilinear antar tile untuk menghindari artefak batas',
    ],
    pros: [
      'Meningkatkan kontras lokal secara adaptif',
      'Mempertahankan detail di semua area gambar',
      'Clip limit mencegah amplifikasi noise berlebihan',
      'Standar emas untuk medical imaging',
      'Mengungkapkan detail jaringan yang sulit dilihat',
    ],
    cons: [
      'Lebih lambat dari Global HE',
      'Parameter tile size dan clip limit perlu dikonfigurasi',
      'Dapat menghasilkan artefak jika tile terlalu kecil',
    ],
    use_case: 'Direkomendasikan untuk semua jenis citra X-Ray medis. Sangat efektif untuk memvisualisasikan infiltrat paru, nodul, dan effusi pleura.',
    formula: 'Clip histogram h(i) agar h(i) ≤ clipLimit, lalu equalize per tile',
  },
];

function StepList({ steps }) {
  return (
    <ol className="step-list">
      {steps.map((s, i) => (
        <li key={i} className="step-item">
          <span className="step-num">{i + 1}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export default function HistogramPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-badge">Referensi Teknis</div>
        <h1>Spesifikasi Histogram</h1>
        <p>Teknik enhancement kontras berbasis histogram untuk meningkatkan kualitas citra medis</p>
      </header>

      {/* Intro */}
      <div className="glass-panel hist-intro">
        <div className="hist-intro-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <div>
          <h3>Apa itu Histogram Citra?</h3>
          <p>
            Histogram citra adalah representasi grafis dari distribusi intensitas piksel dalam sebuah gambar.
            Sumbu X merepresentasikan nilai intensitas (0–255 untuk grayscale), sedangkan sumbu Y menunjukkan
            jumlah piksel untuk setiap nilai intensitas. Teknik histogram equalization memanipulasi distribusi
            ini untuk meningkatkan kontras dan visibilitas detail dalam citra.
          </p>
        </div>
      </div>

      {/* Method cards */}
      <div className="hist-methods-grid">
        {METHODS.map(m => (
          <div key={m.id} className="glass-panel hist-method-card" style={{ '--card-color': m.color }}>
            <div className="hmc-header">
              <span className="hmc-icon" style={{ color: m.color }}>{m.icon}</span>
              <div>
                <h2>{m.name}</h2>
                <p className="hmc-short">{m.short}</p>
              </div>
            </div>

            <p className="hmc-desc">{m.desc}</p>

            <div className="hmc-section">
              <h4>Cara Kerja (Step by Step)</h4>
              <StepList steps={m.cara_kerja} />
            </div>

            {m.formula && (
              <div className="hmc-formula">
                <span className="formula-label">Formula</span>
                <code>{m.formula}</code>
              </div>
            )}

            <div className="hmc-two-col">
              <div>
                <h4>Keunggulan</h4>
                <ul className="fdp-list green">
                  {m.pros.map(p => <li key={p}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h4>Kelemahan</h4>
                <ul className="fdp-list red">
                  {m.cons.map(c => <li key={c}>{c}</li>)}
                </ul>
              </div>
            </div>

            <div className="fdp-usecase" style={{marginTop: '1rem'}}>
              <h4>Penggunaan di Medis</h4>
              <p>{m.use_case}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison */}
      <div className="glass-panel comparison-table-wrap">
        <h3>Perbandingan Singkat</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Aspek</th>
              <th>Global HE</th>
              <th>CLAHE</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Cakupan', 'Seluruh gambar', 'Per tile (lokal)'],
              ['Kecepatan', 'Sangat cepat', 'Lebih lambat'],
              ['Kontrol Noise', 'Tidak ada', 'Clip limit'],
              ['Detail Lokal', 'Tidak optimal', 'Sangat baik'],
              ['Rekomendasi Medis', 'Terbatas', 'Direkomendasikan'],
              ['Kompleksitas', 'Rendah', 'Menengah'],
            ].map(([asp, ghe, cla]) => (
              <tr key={asp}>
                <td className="ct-aspect">{asp}</td>
                <td>{ghe}</td>
                <td className="ct-clahe">{cla}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/" className="fdp-try-btn" style={{ display: 'inline-flex' }}>
          Coba Sekarang di Analyzer →
        </Link>
      </div>
    </div>
  );
}
