import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import '../styles/home.css';

export default function Home() {
  const { user } = useContext(AuthContext);
  console.log('Usuario actual:', user);


  return (
    
    <div className="home-container">
      {/* Capa de fondo */}
      <div className="background-layer"></div>

      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">GYM FORCE</h1>
        <div className="nav-buttons">
           {/* Mostrar "Crear Rutina" solo si es profesor */}
          {user?.role === 'profesor' && <button>Crear Rutina</button>}

          {/* Mostrar "Mi Rutina" solo si es usuario */}
          {user?.role === 'user' && <button>Mi Rutina</button>}

          {/* Botón de salir visible para todos */}
          <button>Salir</button>
        </div>
      </nav>

      {/* Contenido centrado */}
      <div className="home-content">
        <div className="card">
          <h1 className="gym-title">GYM FORCE</h1>
          <h2 className="welcome-text">
            Bienvenido, {user?.username || 'Usuario'}!
          </h2>
        </div>
      </div>
    </div>
  );
}