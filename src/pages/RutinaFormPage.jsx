import React from "react";
import RutinaForm from "../components/RutinaForm";
import '../styles/rutinaFormPage.css';
import { useNavigate } from "react-router-dom";

export default function RutinaFormPage() {
    const navigate = useNavigate(); // hook de navegación

  return (
    <div className="main-container">
      {/* Navbar arriba */}
      <div className="navbar">
        <h2 className="logo">GYM FORCE</h2>
        <div className="nav-buttons">
          <button onClick={() => navigate("/")}>Home</button> 
          <button onClick={() => navigate("/login")}>Salir</button> 
        </div>
      </div>

      {/* Card con el formulario */}
      <div className="form-card">
        <RutinaForm />
      </div>
    </div>
  );
}
