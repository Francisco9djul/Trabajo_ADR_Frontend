import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import '../styles/login.css';
import Swal from 'sweetalert2'; 

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);

    // Pop-up de éxito
      Swal.fire({
        title: 'Login exitoso',
        text: 'Bienvenido a GYM FORCE',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#096ec5',
      }).then(() => {
        navigate('/'); // redirige a Home
      });

    } catch (err) {

      // Pop-up de error
      Swal.fire({
        title: 'Error en login',
        text: 'Usuario o contraseña incorrectos',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc3545', 
      });

    }
  };

  return (
    <div className="background">
      <div className="login-page">
        <h1 className="gym-title-1">GYM FORCE</h1>
        <div className="login-container">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Usuario"
            />
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Contraseña"
            />
            <button type="submit">Login</button>
            <p>
              ¿No tienes cuenta?{" "}
              <span
                className="link"
                onClick={() => navigate("/register")}
                style={{ color: "#096ec5", cursor: "pointer" }}
              >
                Registrarse
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
