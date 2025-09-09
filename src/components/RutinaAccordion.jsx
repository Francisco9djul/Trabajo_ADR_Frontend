// src/components/RutinaAccordion.jsx
import React, { useState } from "react";

export default function RutinaAccordion({ rutina }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rutina-accordion">
      <div
        className="rutina-header"
        onClick={() => setOpen(!open)}
        style={{
          cursor: "pointer",
          background: "#f0f0f0",
          padding: "10px",
          margin: "5px 0",
          color: "#222",
        }}
      >
        <strong>{rutina.nombre}</strong> - {rutina.objetivo}
      </div>

      {open && (
        <div className="rutina-body" style={{ paddingLeft: "20px" }}>
          {rutina.bloques_read.length === 0 ? (
            <p>Esta rutina no tiene bloques.</p>
          ) : (
            rutina.bloques_read.map((bloque) => (
              <div key={bloque.id} className="bloque">
                <h4>
                  {bloque.nombre} ({bloque.dia})
                </h4>
                <ul>
                  {bloque.bloque_ejercicios.map((ej) => (
                    <li key={ej.id}>
                      {ej.ejercicio.nombre} - {ej.series}x{ej.repeticiones}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
