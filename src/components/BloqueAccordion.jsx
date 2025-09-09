import React, { useState } from "react";

export default function BloqueAccordion({ bloque }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bloque">
      <div className="bloque-header" onClick={() => setOpen(!open)}>
        <strong>{bloque.nombre}</strong> ({bloque.dia})
        <span>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <ul className="bloque-body">
          {bloque.ejercicios.map((ej) => (
            <li key={ej.id}>
              {ej.nombre} – {ej.series}x{ej.repeticiones}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
