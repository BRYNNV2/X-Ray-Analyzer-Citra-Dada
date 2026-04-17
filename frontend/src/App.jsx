import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar       from './components/Navbar';
import AnalyzerPage from './pages/AnalyzerPage';
import FiltersPage  from './pages/FiltersPage';
import HistogramPage from './pages/HistogramPage';
import AboutPage    from './pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-wrapper">
        <Routes>
          <Route path="/"          element={<AnalyzerPage />} />
          <Route path="/filters"   element={<FiltersPage />} />
          <Route path="/histogram" element={<HistogramPage />} />
          <Route path="/about"     element={<AboutPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
