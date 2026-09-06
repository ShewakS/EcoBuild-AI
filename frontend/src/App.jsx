import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Components/Navbar';
import AppRoutes from './Routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
