import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/register.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "user",
    password: "",
    password2: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password2) {
        Swal.fire({
        title: "Error",
        text: "Las contraseñas no coinciden",
        icon: "error",
        confirmButtonColor: "#dc3545",
        });
        return;
    }

    try {
        const res = await fetch("http://localhost:8000/api/accounts/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {

        // Mapeo de campos al español
        const camposES = {
            username: "Usuario",
            first_name: "Nombre",
            last_name: "Apellido",
            email: "Email",
            password: "Contraseña",
            password2: "Repetir contraseña",
            role: "Rol"
        };

        // Construir mensaje legible
        let mensaje = '';
        for (const campo in data) {
            const errores = data[campo].map(msg => {
            if (msg === "This field may not be blank.") return "No puede estar vacío.";
            if (msg.includes("already exists")) return "Ya existe.";
            return msg;
            }).join(', ');

            mensaje += `${camposES[campo] || campo}: ${errores}\n`;
        }

        Swal.fire({
            title: "Error en el registro",
            html: mensaje.replace(/\n/g, "<br>"),
            icon: "error",
            confirmButtonColor: "#dc3545",
        });
        return;
        }

        Swal.fire({
        title: "Registro exitoso",
        text: "Ahora puedes iniciar sesión",
        icon: "success",
        confirmButtonColor: "#096ec5",
        }).then(() => navigate("/login"));

    } catch (err) {
        console.error(err);
        Swal.fire({
        title: "Error",
        text: "No se pudo registrar el usuario",
        icon: "error",
        confirmButtonColor: "#dc3545",
        });
    }
    };


  return (
    <div className="register-background">
      <div className="register-page">
        <h1 className="register-title">GYM FORCE</h1>
        <div className="register-container">
          <h2>Registrar Usuario</h2>
          <form onSubmit={handleSubmit} autoComplete="off">
            <input
                name="username"
                placeholder="Usuario"
                onChange={handleChange}
                autoComplete="off"          // evita sugerencias de usuarios guardados
            />
            <input
                name="first_name"
                placeholder="Nombre"
                onChange={handleChange}
                autoComplete="off"
            />
            <input
                name="last_name"
                placeholder="Apellido"
                onChange={handleChange}
                autoComplete="off"
            />
            <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                autoComplete="off"
            />
            <select name="role" onChange={handleChange} value={form.role}>
                <option value="user">User</option>
                <option value="profesor">Profesor</option>
            </select>
            <input
                name="password"
                type="password"
                placeholder="Contraseña"
                onChange={handleChange}
                autoComplete="new-password" // evita autocompletar contraseñas guardadas
            />
            <input
                name="password2"
                type="password"
                placeholder="Repetir Contraseña"
                onChange={handleChange}
                autoComplete="new-password"
            />
            <button type="submit">Registrarse</button>

            <p>
              ¿Ya tienes cuenta?{" "}
              <span
                className="link"
                onClick={() => navigate("/login")}
                style={{ color: "#096ec5", cursor: "pointer" }}
              >
                Loguearse
              </span>
            </p>

            </form>
        </div>
      </div>
    </div>
  );
}
