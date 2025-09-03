 import React, { useState, useContext } from "react";
import AsyncSelect from "react-select/async";
import { AuthContext } from "../context/AuthContext";
import "../styles/rutinaFormComponent.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// estilos personalizados
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "white",
    color: "#333",
    borderRadius: 6,
    borderColor: "#ccc",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#333",
  }),
  input: (provided) => ({
    ...provided,
    color: "#333",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#f0f0f0",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#d9d9d9" : "#f0f0f0",
    color: "#333",
    cursor: "pointer",
  }),
};

export default function RutinaForm() {
  const { token } = useContext(AuthContext);
   const navigate = useNavigate(); 

  const [rutina, setRutina] = useState({
    nombre: "",
    objetivo: "",
    alumno: null,
    bloques: [],
  });

  const [bloqueNombre, setBloqueNombre] = useState("");
  const [bloqueDia, setBloqueDia] = useState(""); // <-- Estado para el día
  const [ejercicios, setEjercicios] = useState([
    { ejercicio: null, series: "", repeticiones: "" },
  ]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);

  // Buscar alumnos
  const loadAlumnos = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await fetch(
        `http://localhost:8000/api/accounts/users/search/?q=${inputValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return [];
      }
    } catch (err) {
      console.error("Error buscando alumnos:", err);
      return [];
    }
  };

  // Buscar ejercicios
  const loadEjercicios = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const res = await fetch(
        `http://localhost:8000/api/ejercicios/?search=${inputValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        return data.map((e) => ({ value: e.id, label: e.nombre }));
      } catch {
        return [];
      }
    } catch (err) {
      console.error("Error buscando ejercicios:", err);
      return [];
    }
  };

  // Manejo de ejercicios dentro de un bloque
  const handleEjercicioChange = (index, field, value) => {
    const nuevos = [...ejercicios];
    nuevos[index][field] = value;
    setEjercicios(nuevos);
  };

  const agregarEjercicio = () => {
    setEjercicios([
      ...ejercicios,
      { ejercicio: null, series: "", repeticiones: "" },
    ]);
  };

  const eliminarEjercicio = (index) => {
    setEjercicios(ejercicios.filter((_, i) => i !== index));
  };

  // Guardar bloque nuevo
  const handleAddBloque = () => {
    if (!bloqueNombre || ejercicios.length === 0) return;

    const ejerciciosValidos = ejercicios.filter(e => e.ejercicio && e.ejercicio.value);

    setRutina({
      ...rutina,
      bloques: [
        ...rutina.bloques,
        {
          nombre: bloqueNombre,
          dia: bloqueDia,
          ejercicios: ejerciciosValidos.map((e) => ({
            ejercicioId: e.ejercicio.value,
            ejercicio: e.ejercicio.label,
            series: e.series,
            repeticiones: e.repeticiones,
            label: e.ejercicio.label, // opcional, solo para UI
          })),
        },
      ],
    });

    setBloqueNombre("");
    setBloqueDia("");
    setEjercicios([{ ejercicio: null, series: "", repeticiones: "" }]);
  };

  // Guardar cambios al editar bloque
  const handleGuardarEdicion = () => {
    if (bloqueSeleccionado === null) return;

    const ejerciciosValidos = ejercicios.filter(e => e.ejercicio && e.ejercicio.value);

    const bloquesActualizados = [...rutina.bloques];
    bloquesActualizados[bloqueSeleccionado] = {
      nombre: bloqueNombre,
      dia: bloqueDia,
      ejercicios: ejerciciosValidos.map(e => ({
        ejercicio: e.ejercicio.label,
        ejercicioId: e.ejercicio.value,
        series: e.series,
        repeticiones: e.repeticiones,
      })),
    };

    setRutina({ ...rutina, bloques: bloquesActualizados });
    setBloqueSeleccionado(null);
    setBloqueNombre("");
    setBloqueDia("");
    setEjercicios([{ ejercicio: null, series: "", repeticiones: "" }]);
  };

  // Eliminar un ejercicio de un bloque ya guardado
  const eliminarEjercicioDeBloque = (bloqueIndex, ejercicioIndex) => {
    const bloquesActualizados = [...rutina.bloques];
    bloquesActualizados[bloqueIndex].ejercicios = bloquesActualizados[
      bloqueIndex
    ].ejercicios.filter((_, i) => i !== ejercicioIndex);

    setRutina({ ...rutina, bloques: bloquesActualizados });
  };

  // Eliminar bloque completo
  const eliminarBloque = (index) => {
    const bloquesActualizados = [...rutina.bloques];
    bloquesActualizados.splice(index, 1);
    setRutina({ ...rutina, bloques: bloquesActualizados });

    if (bloqueSeleccionado === index) {
      setBloqueSeleccionado(null);
      setBloqueNombre("");
      setBloqueDia("");
      setEjercicios([{ ejercicio: null, series: "", repeticiones: "" }]);
    }
  };

  // Editar bloque existente: cargar nombre, día y ejercicios
  const editarBloque = (index) => {
    setBloqueSeleccionado(index);
    setBloqueNombre(rutina.bloques[index].nombre);
    setBloqueDia(rutina.bloques[index].dia || "");
    setEjercicios(
      rutina.bloques[index].ejercicios.map((e) => ({
        ejercicio: { value: e.ejercicioId, label: e.ejercicio },
        series: e.series,
        repeticiones: e.repeticiones,
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ejerciciosInvalidos = rutina.bloques.some(b =>
      b.ejercicios.some(ej => !ej.ejercicioId)
    );

    if (ejerciciosInvalidos) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Por favor selecciona un ejercicio para todos los campos.",
        confirmButtonColor: "#096ec5" // Azul
      });
      return;
    }

    // Preparar data para enviar al backend
    const rutinaData = {
      nombre: rutina.nombre,
      objetivo: rutina.objetivo,
      usuario: rutina.alumno?.value, 
      bloques: rutina.bloques.map((b) => ({
      nombre: b.nombre,
      dia: b.dia || "",
      bloque_ejercicios: b.ejercicios.map((e) => ({
        ejercicioId: Number(e.ejercicioId),
        series: Number(e.series) || 0,
        repeticiones: Number(e.repeticiones) || 0,
      })),
    })),
    };

    try {
      console.log(rutinaData)
      const res = await fetch("http://localhost:8000/api/rutinas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rutinaData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error al crear la rutina:", errorData);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo crear la rutina. Intenta de nuevo.",
          confirmButtonColor: "#096ec5" // Azul
        });
        return;
      }

      const data = await res.json();
      console.log("Rutina creada:", data);


      // Pop up de éxito + redirección
      Swal.fire({
        icon: "success",
        title: "¡Rutina creada!",
        text: "Tu rutina fue creada con éxito ✅",
        confirmButtonText: "Ir al Home",
        confirmButtonColor: "#096ec5" // Azul
      }).then(() => {
        navigate("/"); // redirige al home después de cerrar el pop up
      });


    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema con el servidor.",
        confirmButtonColor: "#096ec5" // Azul
      });
    }
  };

  return (
    <div className="form-container">
      <h2 className="title">Crear Rutina</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre de la rutina</label>
        <input
          type="text"
          value={rutina.nombre}
          onChange={(e) => setRutina({ ...rutina, nombre: e.target.value })}
        />

        <label>Objetivo</label>
        <input
          type="text"
          value={rutina.objetivo}
          onChange={(e) => setRutina({ ...rutina, objetivo: e.target.value })}
        />

        <label>Seleccionar Usuario</label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadAlumnos}
          defaultOptions
          value={rutina.alumno}
          onChange={(option) => setRutina({ ...rutina, alumno: option })}
          placeholder="Escribe nombre o apellido..."
          styles={customSelectStyles}
        />

        <h3>{bloqueSeleccionado !== null ? "Editar Bloque" : "Agregar Bloque"}</h3>
        <input
          type="text"
          placeholder="Nombre del bloque (ej: Piernas)"
          value={bloqueNombre}
          onChange={(e) => setBloqueNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Día del bloque (ej: Lunes)"
          value={bloqueDia}
          onChange={(e) => setBloqueDia(e.target.value)}
        />

        <h4>Ejercicios del bloque</h4>
        {ejercicios.map((e, index) => (
          <div key={index}  className="ejercicio-block">
            {/* Select de búsqueda de ejercicio */}
            <div className="ejercicio-select">
              <AsyncSelect
                cacheOptions
                loadOptions={loadEjercicios}
                defaultOptions
                value={e.ejercicio}
                onChange={(option) =>
                  handleEjercicioChange(index, "ejercicio", option)
                }
                placeholder="Buscar ejercicio..."
                styles={customSelectStyles}
              />
            </div>
            <div className="ejercicio-details">
              <input
                type="number"
                placeholder="Series"
                value={e.series}
                onChange={(ev) =>
                  handleEjercicioChange(index, "series", ev.target.value)
                }
              />
              <input
                type="number"
                placeholder="Repeticiones"
                value={e.repeticiones}
                onChange={(ev) =>
                  handleEjercicioChange(index, "repeticiones", ev.target.value)
                }
              />
              <button type="button" onClick={() => eliminarEjercicio(index)}>
                ❌
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={agregarEjercicio}>
          ➕ Agregar ejercicio
        </button>

        {bloqueSeleccionado === null ? (
          <button type="button" onClick={handleAddBloque}>
            📦 Guardar bloque
          </button>
        ) : (
          <button type="button" onClick={handleGuardarEdicion}>
            💾 Guardar cambios
          </button>
        )}

        <h3>Bloques añadidos</h3>
        <ul>
          {rutina.bloques.map((b, i) => (
            <li key={i}>
              <strong>{b.nombre} ({b.dia})</strong>
              <ul>
                {b.ejercicios.map((ej, j) => (
                  <li key={j}>
                    {ej.ejercicio} ({ej.series}x{ej.repeticiones})  {/* <-- usar ej.ejercicio directamente */}
                    <button
                      type="button"
                      onClick={() => eliminarEjercicioDeBloque(i, j)}
                      style={{ marginLeft: "8px", color: "red" }}
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => editarBloque(i)}>
                ✏️ Editar
              </button>
              <button
                type="button"
                onClick={() => eliminarBloque(i)}
                style={{ marginLeft: "8px", color: "red" }}
              >
                🗑️ Borrar bloque
              </button>
            </li>
          ))}
        </ul>

        <button type="submit">✅ Crear Rutina</button>
      </form>
    </div>
  );
}
