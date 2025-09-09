// src/pages/RutinasPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import RutinaAccordion from "../components/RutinaAccordion";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import '../styles/rutinaPage.css';

export default function RutinasPage() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/rutinas/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener rutinas");

        const data = await res.json();
        setRutinas(data);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las rutinas",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRutinas();
  }, [token]);

  return (
    <div className="main-container">
      {/* Navbar arriba */}
      <div className="navbar">
        <h2 className="logo">GYM FORCE</h2>
        <div className="nav-buttons">
          <button onClick={() => navigate("/")}>Home</button> 
          <button onClick={handleLogout}>Salir</button> 
        </div>
      </div>

      {/* Contenedor de rutinas */}
      <div className="rutinas-card">
        <h2>Mis Rutinas</h2>
        {loading ? (
          <p>Cargando rutinas...</p>
        ) : rutinas.length === 0 ? (
          <p>No tenés rutinas asignadas.</p>
        ) : (
          rutinas.map(rutina => <RutinaAccordion key={rutina.id} rutina={rutina} />)
        )}
      </div>
    </div>
  );
}
