 "use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" })
    .format(new Date(`${value}T12:00:00Z`))
    .replace(".", "");

export default function EditPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/responses/${token}`).then((r) => r.json()).then((d) => {
      setData(d);
      setName(d.name ?? "");
      setSelected(d.unavailable ?? []);
    });
  }, [token]);

  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const d of data?.weekends ?? []) {
      const key = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" })
        .format(new Date(`${d}T12:00:00Z`));
      (groups[key] ??= []).push(d);
    }
    return groups;
  }, [data]);

  function toggle(date: string) {
    setSelected((current) => current.includes(date) ? current.filter((d) => d !== date) : [...current, date]);
  }

  async function save() {
    await fetch(`/api/responses/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, unavailable: selected })
    });
    setSaved(true);
  }

  if (!data) return <main className="container">Cargando...</main>;

  return (
    <main className="container">
      <p className="eyebrow">EDITAR DISPONIBILIDAD</p>
      <h1>{data.title}</h1>

      <section className="card">
        <label htmlFor="name">Tu nombre</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </section>

      {Object.entries(grouped).map(([month, dates]) => (
        <section className="month" key={month}>
          <h2>{month}</h2>
          {dates.map((date) => {
            const unavailable = selected.includes(date);
            return (
              <button key={date} className={`weekend ${unavailable ? "unavailable" : ""}`} onClick={() => toggle(date)}>
                <span>{formatDate(date)}</span>
                <span>{unavailable ? "✕ No puedo" : "✓ Puedo"}</span>
              </button>
            );
          })}
        </section>
      ))}

      {saved && <div className="success"><strong>Respuesta actualizada.</strong></div>}
      <button className="primary" onClick={save}>Guardar cambios</button>
    </main>
  );
}
