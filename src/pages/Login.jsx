import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import '../styles/login.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      alert('Login exitoso');
      navigate('/'); // redirige a Home
    } catch (err) {
      alert('Error en login');
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
          </form>
        </div>
      </div>
    </div>
  );
}
