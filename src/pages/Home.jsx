import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import '../styles/home.css';


export default function Home() {
  const { user, logout } = useContext(AuthContext); // logout
  const navigate = useNavigate(); // <-- hook NAVEGACION

  const handleLogout = () => {
    logout();          // borra token y user
    navigate('/login'); 
  };


  return (
    
    <div className="home-container">
      {/* Capa de fondo */}
      <div className="background-layer"></div>

      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">GYM FORCE</h1>
        <div className="nav-buttons">
           {/* Mostrar "Crear Rutina" solo si es profesor */}
          {user?.role === 'profesor' && <button onClick={() => navigate("/rutina-form")}>Crear Rutina</button>} 

          {/* Mostrar "Mi Rutina" solo si es usuario */}
          {user?.role === 'user' && <button>Mi Rutina</button>}

          {/* Botónes visibles para todos */}
          <button onClick={handleLogout}>Salir</button>
        </div>
      </nav>

      {/* Contenido centrado */}
      <div className="home-content">
        <div className="card">
          <h1 className="gym-title">Bienvenido</h1>
          <h2 className="welcome-text">
             {user?.username || 'Usuario'}!
          </h2>
        </div>
      </div>
    </div>
  );
}