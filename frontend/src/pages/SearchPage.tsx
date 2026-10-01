import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const EXAMPLES = ["istixana", "süd", "suvarma", "arıçılıq", "quşçuluq", "pambıq"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/neticeler?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section className="search-page">
      <h1>Sahənizi axtarın</h1>
      <p className="lead">
        Maraqlandığınız sahəni (məsələn, "istixana", "süd", "suvarma") yazın
        və Dövlət Proqramı çərçivəsindəki dövlət dəstəyi mexanizmlərini,
        həmçinin müvafiq proqram bəndlərini görün.
      </p>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Məsələn: istixana, süd, suvarma..."
          aria-label="Axtarış sorğusu"
          autoFocus
        />
        <button type="submit">Axtar</button>
      </form>
      <div className="example-chips">
        <span>Nümunələr:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="chip"
            onClick={() => navigate(`/neticeler?q=${encodeURIComponent(ex)}`)}
          >
            {ex}
          </button>
        ))}
      </div>
    </section>
  );
}
