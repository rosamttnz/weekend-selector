"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Poll = {
  title: string;
  slug: string;
  weekends: string[];
};

type Result = {
  weekend: string;
  available: number;
  total: number;
  unavailable: string[];
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  })
    .format(new Date(`${value}T12:00:00Z`))
    .replace(".", "");

export default function PollPage() {
  const { slug } = useParams<{ slug: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [savedToken, setSavedToken] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [p, r] = await Promise.all([
      fetch(`/api/polls/${slug}`).then((x) => x.json()),
      fetch(`/api/polls/${slug}/responses`).then((x) => x.json()),
    ]);

    setPoll(p);
    setResults(r.results ?? []);
  }

  useEffect(() => {
    if (slug) load();
  }, [slug]);

  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {};

    for (const d of poll?.weekends ?? []) {
      const key = new Intl.DateTimeFormat("es-ES", {
        month: "long",
        year: "numeric",
      }).format(new Date(`${d}T12:00:00Z`));

      (groups[key] ??= []).push(d);
    }

    return groups;
  }, [poll]);

  function toggle(date: string) {
    setSelected((current) =>
      current.includes(date)
        ? current.filter((d) => d !== date)
        : [...current, date]
    );
  }

  async function save() {
    setError("");

    const response = await fetch(`/api/polls/${slug}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        unavailable: selected,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "No se pudo guardar.");
      return;
    }

    setSavedToken(data.editToken);
    await load();
  }

  if (!poll) {
    return <main className="container">Cargando...</main>;
  }

  return (
    <main className="container">
      <p className="eyebrow">DESPEDIDA DE SOLTERA</p>

      <h1>{poll.title}</h1>

      <p className="description">
        Marca únicamente los fines de semana en los que{" "}
        <strong>NO puedes</strong>.
      </p>

      {savedToken ? (
        <section className="success">
          <strong>Disponibilidad guardada.</strong>

          <span>Comparte la encuesta con el grupo:</span>
          <small>{window.location.href}</small>

          <span>Enlace para editar tu respuesta:</span>
          <small>
            {window.location.origin}/edit/{savedToken}
          </small>
        </section>
      ) : (
        <>
          <section className="card">
            <label htmlFor="name">Tu nombre</label>

            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe tu nombre"
            />
          </section>

          {Object.entries(grouped).map(([month, dates]) => (
            <section className="month" key={month}>
              <h2>{month}</h2>

              {dates.map((date) => {
                const unavailable = selected.includes(date);

                return (
                  <button
                    key={date}
                    className={`weekend ${
                      unavailable ? "unavailable" : ""
                    }`}
                    onClick={() => toggle(date)}
                  >
                    <span>{formatDate(date)}</span>

                    <span>
                      {unavailable ? "✕ No puedo" : "✓ Puedo"}
                    </span>
                  </button>
                );
              })}
            </section>
          ))}

          {error && <p>{error}</p>}

          <button
            className="primary"
            disabled={!name.trim()}
            onClick={save}
          >
            Guardar disponibilidad
          </button>
        </>
      )}

      <section>
        <h2>Mejores fines de semana</h2>

        {results.slice(0, 10).map((r, i) => (
          <div className="result" key={r.weekend}>
            <div className="result-main">
              <strong>
                {i < 3
                  ? ["🥇", "🥈", "🥉"][i]
                  : `${i + 1}.`}{" "}
                {formatDate(r.weekend)}
              </strong>

              <small>
                {r.available}/{r.total} personas disponibles
              </small>
            </div>

            <span className="result-percent">
              {r.total
                ? Math.round((r.available / r.total) * 100)
                : 0}
              %
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
