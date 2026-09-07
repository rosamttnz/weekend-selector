 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("Despedida de soltera");
  const [startDate, setStartDate] = useState("2026-09-12");
  const [endDate, setEndDate] = useState("2027-05-30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createPoll() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startDate, endDate })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "No se pudo crear la encuesta.");
      setLoading(false);
      return;
    }

    router.push(`/poll/${data.slug}`);
  }

  return (
    <main className="container">
      <p className="eyebrow">WEEKEND SELECTOR</p>
      <h1>Encuentra el mejor finde</h1>
      <p className="description">
        Crea una encuesta y deja que cada persona marque únicamente
        los fines de semana en los que no puede.
      </p>

      <section className="card form">
        <label htmlFor="title">Nombre de la encuesta</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label htmlFor="start">Desde</label>
        <input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <label htmlFor="end">Hasta</label>
        <input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        {error && <p>{error}</p>}

        <button className="primary" onClick={createPoll} disabled={loading || !title.trim()}>
          {loading ? "Creando..." : "Crear encuesta"}
        </button>
      </section>
    </main>
  );
}
