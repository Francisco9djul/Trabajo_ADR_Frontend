 import React, { useState, useContext } from "react";
import AsyncSelect from "react-select/async";
import { AuthContext } from "../context/AuthContext";
import "../styles/rutinaFormComponent.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";


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
   const { register, handleSubmit,control, getValues, setValue,  formState: { errors } } = useForm({
    defaultValues: {
      bloqueNombre: "",
      bloqueDia: "",
      ejercicios: [{ ejercicio: null, series: 0, repeticiones: 0 }],
    }
  });
  const [agregandoBloque, setAgregandoBloque] = useState(false);

  
  const [rutina, setRutina] = useState({
    nombre: "",
    objetivo: "",
    alumno: null,
    bloques: [],
  });

  const [bloqueNombre, setBloqueNombre] = useState("");
  const [bloqueDia, setBloqueDia] = useState(""); // <-- Estado para el día
  const [ejercicios, setEjercicios] = useState([
  { ejercicio: null, series: 0, repeticiones: 0 },
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
  setEjercicios([...ejercicios, { ejercicio: null, series: "", repeticiones: "" }]);
  setEjercicioError([...ejercicioError, { ejercicio: false, series: false, repeticiones: false }]);
  };

  const eliminarEjercicio = (index) => {
    setEjercicios(ejercicios.filter((_, i) => i !== index));
    setEjercicioError(ejercicioError.filter((_, i) => i !== index));
  };



  const [bloqueError, setBloqueError] = useState({ nombre: false, dia: false });
  const [ejercicioError, setEjercicioError] = useState(
    ejercicios.map(() => ({ ejercicio: false, series: false, repeticiones: false }))
  );

  // Antes de guardar bloque
  const validarBloque = () => {
    let valido = true;

    const nombreValido = bloqueNombre.trim() !== "";
    const diaValido = bloqueDia.trim() !== "";
    setBloqueError({ nombre: !nombreValido, dia: !diaValido });
    if (!nombreValido || !diaValido) valido = false;

    const erroresEj = ejercicios.map((e) => ({
      ejercicio: !e.ejercicio,
      series: !e.series || e.series <= 0,
      repeticiones: !e.repeticiones || e.repeticiones <= 0,
    }));
    setEjercicioError(erroresEj);

    if (erroresEj.some((e) => e.ejercicio || e.series || e.repeticiones)) valido = false;

    return valido;
  };

  

  // ---------Guardar bloque nuevo----------
  const handleAddBloque = () => {

    // Sincronizar estado local con react-hook-form
    setValue("bloqueNombre", bloqueNombre);
    setValue("bloqueDia", bloqueDia)

    const values = getValues(); // obtiene valores actuales del formulario

    // Validar bloque
    if (!values.bloqueNombre || !values.bloqueDia) {
      Swal.fire({ icon: "warning", title: "Debe completar nombre y día del bloque" });
      return;
    }

    const ejerciciosValidos = values.ejercicios.filter(e => e.ejercicio && e.ejercicio.value);

    if (ejerciciosValidos.length === 0) {
      Swal.fire({ icon: "warning", title: "Debe agregar al menos un ejercicio válido" });
      return;
    }

    // Guardar bloque en estado rutina
    setRutina(prev => ({
      ...prev,
      bloques: [
        ...prev.bloques,
        {
          nombre: values.bloqueNombre,
          dia: values.bloqueDia,
          ejercicios: ejerciciosValidos.map(e => ({
            ejercicioId: e.ejercicio.value,
            ejercicio: e.ejercicio.label,
            series: Number(e.series),
            repeticiones: Number(e.repeticiones),
          })),
        },
      ],
    }));

    // Limpiar inputs y estado local
    setValue("bloqueNombre", "");
    setValue("bloqueDia", "");
    setValue("ejercicios", []);
    setBloqueNombre("");
    setBloqueDia("");
    setEjercicios([{ ejercicio: null, series: "", repeticiones: "" }]);
    setEjercicioError([{ ejercicio: false, series: false, repeticiones: false }]);

    // Habilitar nuevamente el botón de agregar bloque
    setAgregandoBloque(false);
  };

  // ---------Guardar cambios al editar bloque-------
  const handleGuardarEdicion = () => {
    if (bloqueSeleccionado === null) return;

    // Sincronizar estado local con react-hook-form
    setValue("bloqueNombre", bloqueNombre);
    setValue("bloqueDia", bloqueDia);

    const values = getValues(); // toma los valores actuales del formulario

    const ejerciciosActualizados = values.ejercicios
      .filter(e => e.ejercicio && e.ejercicio.value)
      .map(e => ({
        ejercicio: e.ejercicio.label,
        ejercicioId: e.ejercicio.value,
        series: Number(e.series),
        repeticiones: Number(e.repeticiones),
      }));

    const bloquesActualizados = [...rutina.bloques];
    bloquesActualizados[bloqueSeleccionado] = {
      nombre: values.bloqueNombre,
      dia: values.bloqueDia,
      ejercicios: ejerciciosActualizados,
    };

    setRutina({ ...rutina, bloques: bloquesActualizados });

    // Limpiar edición y inputs
    setBloqueSeleccionado(null);
    setValue("bloqueNombre", "");
    setValue("bloqueDia", "");
    setValue("ejercicios", []);
    setBloqueNombre("");
    setBloqueDia("");
    setEjercicios([{ ejercicio: null, series: "", repeticiones: "" }]);
    setEjercicioError([{ ejercicio: false, series: false, repeticiones: false }]);

    // Habilitar nuevamente el botón de agregar bloque
    setAgregandoBloque(false);
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
    const ejerciciosBloque = rutina.bloques[index].ejercicios.map((e) => ({
      ejercicio: { value: e.ejercicioId, label: e.ejercicio },
      series: e.series,
      repeticiones: e.repeticiones,
    }));
    setEjercicios(ejerciciosBloque);
    setEjercicioError(ejerciciosBloque.map(() => ({ ejercicio: false, series: false, repeticiones: false })));
  };

  const [alumnoError, setAlumnoError] = useState(false);
      
  const onSubmitRutina = async (data) => {
    // Validación de bloques y ejercicios
    if (!data.alumno) {
      setAlumnoError(true);
      return;
    } else {
      setAlumnoError(false);
    }

    const ejerciciosInvalidos = rutina.bloques.some(b =>
      b.ejercicios.some(ej => !ej.ejercicioId)
    );

    if (ejerciciosInvalidos) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Por favor selecciona un ejercicio para todos los campos.",
        confirmButtonColor: "#096ec5"
      });
      return;
    }

    // Preparar objeto para enviar al backend
    const rutinaData = {
      nombre: data.nombre,       // viene del input
      objetivo: data.objetivo,   // viene del input
      usuario: data.alumno.value, // viene del estado
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
          confirmButtonColor: "#096ec5"
        });
        return;
      }

      const dataResp = await res.json();
      console.log("Rutina creada:", dataResp);

      Swal.fire({
        icon: "success",
        title: "¡Rutina creada!",
        text: "Tu rutina fue creada con éxito ✅",
        confirmButtonText: "Ir al Home",
        confirmButtonColor: "#096ec5"
      }).then(() => {
        navigate("/"); // redirige al home
      });

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema con el servidor.",
        confirmButtonColor: "#096ec5"
      });
    }
  };

  const cancelarBloque = () => {
    setAgregandoBloque(false);     // vuelve a mostrar el botón de agregar
    setBloqueSeleccionado(null);   // limpia selección
    setBloqueNombre("");           // limpia inputs
    setBloqueDia("");
    setEjercicios([{ ejercicio: null, series: "", repeticiones: "" }]);
    setEjercicioError([{ ejercicio: false, series: false, repeticiones: false }]);
    setValue("bloqueNombre", "");
    setValue("bloqueDia", "");
    setValue("ejercicios", []);
  };

  return (
    <div className="form-container">
      <h2 className="title">Crear Rutina</h2>
      <form onSubmit={handleSubmit(onSubmitRutina)}>

        {/* Nombre de la rutina */}
        <label>Nombre de la rutina</label>
        <input
          type="text"
          {...register("nombre", {
            required: "El nombre de la rutina es obligatorio",
            minLength: { value: 3, message: "Debe tener al menos 3 caracteres" },
            maxLength: { value: 50, message: "No puede superar 50 caracteres" }
          })}
          className={errors.nombre ? "input-error" : ""}
          placeholder={errors.nombre ? errors.nombre.message : "Ingrese el nombre de la rutina"}
        />

        {/* Objetivo */}
        <label>Objetivo</label>
        {/* Mensaje de error si no es el requerido */}
        {errors.objetivo && errors.objetivo.type !== "required" && (
          <p className="error-message">{errors.objetivo.message}</p>
        )}

        <input
          type="text"
          {...register("objetivo", {
            required: "El objetivo es obligatorio",
            minLength: { value: 5, message: "Debe tener al menos 5 caracteres" },
            maxLength: { value: 100, message: "No puede superar 100 caracteres" }
          })}
          className={errors.objetivo ? "input-error" : ""}
          placeholder={errors.objetivo ? errors.objetivo.message : "Ingrese el objetivo"}
        />

        {/* Usuario */}
        <label>Seleccionar Usuario</label>
        <Controller
          name="alumno"
          control={control}
          rules={{ required: "Debe seleccionar un Usuario" }}
          render={({ field, fieldState }) => (
            <AsyncSelect
              {...field}
              cacheOptions
              loadOptions={loadAlumnos}
              defaultOptions
              onChange={(option) => {
                field.onChange(option);
                setRutina(prev => ({ ...prev, alumno: option })); // <-- sincroniza con estado
              }}
              value={field.value}
              placeholder={fieldState.error ? fieldState.error.message : "Escribe nombre o apellido..."}
              styles={{
                ...customSelectStyles,
                control: (provided) => ({
                  ...provided,
                  borderColor: fieldState.error ? "red" : "#ccc",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: fieldState.error ? "red" : "#999",
                }),
              }}
            />
          )}
        />

        <h3>{bloqueSeleccionado !== null ? "Editar Bloque" : "Agregar Bloque"}</h3>

        {!agregandoBloque && bloqueSeleccionado === null ? (
          <button type="button" onClick={() => setAgregandoBloque(true)}>
            ➕ Agregar bloque
          </button>
        ) : (
          <>
        

            {/* Nombre del bloque */}
            <input
              type="text"
              {...register("bloqueNombre", {
                required: "El nombre del bloque es obligatorio",
                minLength: { value: 3, message: "Debe tener al menos 3 caracteres" },
                maxLength: { value: 50, message: "No puede superar 50 caracteres" }
              })}
              className={errors.bloqueNombre ? "input-error" : ""}
              placeholder={errors.bloqueNombre ? errors.bloqueNombre.message : "Nombre del bloque (ej: Piernas)"}
              value={bloqueNombre}
              onChange={(e) => setBloqueNombre(e.target.value)}
            />

            {/* Día del bloque */}
            <input
              type="text"
              {...register("bloqueDia", {
                required: "El día del bloque es obligatorio"
              })}
              className={errors.bloqueDia ? "input-error" : ""}
              placeholder={errors.bloqueDia ? errors.bloqueDia.message : "Día del bloque (ej: Lunes)"}
              value={bloqueDia}
              onChange={(e) => setBloqueDia(e.target.value)}
            />

            <h4>Ejercicios del bloque</h4>
            {ejercicios.map((e, index) => (
              <div key={index} className="ejercicio-block">
                {/* Select de ejercicio */}
                <Controller
                  name={`ejercicios.${index}.ejercicio`}
                  control={control}
                  rules={bloqueSeleccionado === null ? { required: "Debe seleccionar un ejercicio" } : {}} 
                  render={({ field, fieldState }) => (
                    <AsyncSelect
                      {...field}
                      cacheOptions
                      loadOptions={loadEjercicios}
                      defaultOptions
                      onChange={(option) => field.onChange(option)} // solo react-hook-form
                      value={field.value ?? null} // evita uncontrolled input
                      placeholder={fieldState.error ? fieldState.error.message : "Buscar ejercicio..."}
                      styles={{
                        ...customSelectStyles,
                        control: (provided) => ({
                          ...provided,
                          borderColor: fieldState.error ? "red" : "#ccc",
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: fieldState.error ? "red" : "#999",
                        }),
                      }}
                    />
                  )}
                />

                <div className="ejercicio-details">
                  {/* Series */}
                  <Controller
                    name={`ejercicios.${index}.series`}
                    control={control}
                    rules={bloqueSeleccionado === null ? { required: "Ingrese series", min: { value: 1, message: "Series > 0" } } : {}}
                    render={({ field, fieldState }) => (
                      <input
                        type="number"
                        {...field}
                        placeholder={fieldState.error ? fieldState.error.message : "Series"}
                        style={{ borderColor: fieldState.error ? "red" : "#ccc" }}
                        value={field.value ?? ""} // valor inicial vacío evita warning
                        min={0}
                        onChange={(e) => field.onChange(Number(e.target.value))} // asegura que sea número
                      />
                    )}
                  />

                  {/* Repeticiones */}
                  <Controller
                    name={`ejercicios.${index}.repeticiones`}
                    control={control}
                    rules={bloqueSeleccionado === null ? { required: "Ingrese Repeticiones", min: { value: 1, message: "Repeticiones > 0" } } : {}}
                    render={({ field, fieldState }) => (
                      <input
                        type="number"
                        {...field}
                        placeholder={fieldState.error ? fieldState.error.message : "Repeticiones"}
                        style={{ borderColor: fieldState.error ? "red" : "#ccc" }}
                        value={field.value ?? ""} // valor inicial vacío evita warning
                        min={0}
                        onChange={(e) => field.onChange(Number(e.target.value))} // asegura que sea número
                      />
                    )}
                  />

                  <button type="button" onClick={() => eliminarEjercicio(index)}>❌</button>
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

            <button type="button" onClick={cancelarBloque} style={{ marginLeft: "8px", color: "red" }}>
              ❌ Cancelar
            </button>
          </>
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
