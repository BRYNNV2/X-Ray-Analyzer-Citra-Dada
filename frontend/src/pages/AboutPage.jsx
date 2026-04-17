import { Link } from 'react-router-dom';

const TECH_STACK = [
  { name: 'React.js',   icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"></circle><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"></ellipse></svg>, desc: 'Frontend UI library' },
  { name: 'Vite',       icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>, desc: 'Build tool & dev server' },
  { name: 'FastAPI',    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg>, desc: 'Python backend framework' },
  { name: 'OpenCV',     icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12A10 10 0 0 1 22 12A10 10 0 0 1 2 12z"/><circle cx="12" cy="12" r="3"/></svg>, desc: 'Image processing engine' },
  { name: 'NumPy',      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>, desc: 'Numerical computation' },
  { name: 'Matplotlib', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, desc: 'Histogram visualization' },
];

const FEATURES = [
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v18M3 12h18"/></svg>, title: 'Filter Konvolusi', desc: '9 metode filter termasuk Sobel, Laplacian, Canny, Gaussian Blur, dan Unsharp Masking.' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, title: 'Histogram Enhancement', desc: 'Global HE dan CLAHE untuk meningkatkan kontras citra medis secara adaptif.' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Real-time Processing', desc: 'Proses gambar secara instan dengan backend Python FastAPI yang efisien.' },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>, title: 'Side-by-side View', desc: 'Perbandingan gambar asli dan hasil pemrosesan secara berdampingan.' },
];

export default function AboutPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-badge">Tentang Aplikasi</div>
        <h1>X-Ray Analysis Hub</h1>
        <p>Platform analisis citra medis berbasis web untuk pemrosesan gambar rontgen</p>
      </header>

      {/* Hero card */}
      <div className="about-hero">
        <div className="about-hero-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <div>
          <h2>Tentang Aplikasi</h2>
          <p>
            X-Ray Analysis Hub adalah aplikasi web yang dikembangkan untuk <strong>mata kuliah Pengolahan Citra Digital</strong>.
            Aplikasi ini memungkinkan pengguna untuk mengunggah gambar rontgen dan menerapkan berbagai teknik
            pemrosesan citra digital secara interaktif — mulai dari filter konvolusi hingga spesifikasi histogram.
          </p>
          <p style={{marginTop: '0.75rem'}}>
            Dibangun dengan arsitektur <strong>React.js (frontend)</strong> + <strong>FastAPI (backend)</strong>
            dan menggunakan library OpenCV + NumPy untuk pemrosesan gambar berkualitas tinggi.
          </p>
        </div>
      </div>

      {/* Features */}
      <h3 className="section-heading">Fitur Aplikasi</h3>
      <div className="features-grid">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-card">
            <span className="feature-icon">{f.icon}</span>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <h3 className="section-heading">Teknologi</h3>
      <div className="tech-grid">
        {TECH_STACK.map(t => (
          <div key={t.name} className="tech-card">
            <span className="tech-icon">{t.icon}</span>
            <div>
              <strong>{t.name}</strong>
              <p>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="about-cta">
        <h3>Siap Mulai Analisis?</h3>
        <p>Unggah gambar X-Ray pertama Anda dan eksplorasi semua fitur yang tersedia.</p>
        <div className="about-cta-btns">
          <Link to="/" className="fdp-try-btn">Buka Analyzer</Link>
          <Link to="/filters" className="fdp-try-btn outline">Lihat Filter</Link>
        </div>
      </div>
    </div>
  );
}
