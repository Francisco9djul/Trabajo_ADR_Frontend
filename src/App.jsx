
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import RutinaFormPage from "./pages/RutinaFormPage.jsx";
import RutinasPage from "./pages/RutinasPage";
import PrivateRoute from './components/PrivateRoute.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida: Home */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />

        {/* Ruta protegida: Página de Rutina */}
        <Route
          path="/rutina-form"
          element={
            <PrivateRoute>
              <RutinaFormPage />  
            </PrivateRoute>
          }
          
        />

        {/* Ruta protegida: Ver Rutinas (solo user) */}
        <Route
          path="/rutinas"
          element={
            <PrivateRoute allowedRoles={['user']}>
              <RutinasPage />  
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
}