import './App.css';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import Navbar from './Components/Navbar';
import AppRoutes from './Routes/AppRoutes';

/* Pages that render their own full-screen layout — no shared Navbar needed */
const NO_NAVBAR_PATHS = ['/login', '/register'];

function Layout() {
  const location = useLocation();
  const hideNavbar = NO_NAVBAR_PATHS.includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {!hideNavbar && <Navbar />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


