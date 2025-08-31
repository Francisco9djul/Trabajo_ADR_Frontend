import { createContext, useState, useEffect } from 'react';
import API from '../api/axios';
import jwt_decode from 'jwt-decode';



export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setUser({ username: decoded.username, role: decoded.role });
      } catch (err) {
        console.error('Token inválido', err);
        logout();
      }
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await API.post('/token/', { username, password });
      const accessToken = response.data.access;
      setToken(accessToken);
      localStorage.setItem('token', accessToken);

      const decoded = jwt_decode(accessToken);
      setUser({ username: decoded.username, role: decoded.role });

      return response.data;
    } catch (err) {
      console.error('Error al iniciar sesión', err);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
