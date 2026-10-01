import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchProgram, SearchResult } from "../api/client";

export default function ResultsPage() {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const navigate = useNavigate();

  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);
    searchProgram(query)
      .then(setResult)
      .catch(() => setError("Axtarış zamanı xəta baş verdi. Yenidən cəhd edin."))
      .finally(() => setLoading(false));
  }, [query]);

  function goToForm(field: string) {
    navigate(`/muraciet?field=${encodeURIComponent(field)}`);
  }

  const hasResults =
    result && (result.incentives.length > 0 || result.programItems.length > 0);

  return (
    <section className="results-page">
      <h1>Nəticələr: "{query}"</h1>

      {loading && <p>Axtarılır...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && result && !hasResults && (
        <div className="empty-state">
          <p>
            "{query}" üzrə Dövlət Proqramında konkret bənd və ya dəstək
            mexanizmi tapılmadı.
          </p>
          <p>
            Bu, sizin sahənizin proqram çərçivəsindən kənar olduğu demək
            deyil — mövcud məlumat bazası proqram mətnində aydın qeyd olunan
            mexanizmlərlə məhdudlaşır. İstəsəniz, ümumi investisiya niyyəti
            kimi müraciət edə bilərsiniz.
          </p>
          <button onClick={() => goToForm(query)}>
            İnvestisiya niyyəti bildir
          </button>
        </div>
      )}

      {!loading && !error && hasResults && (
        <>
          {result!.incentives.length > 0 && (
            <div className="result-block">
              <h2>Dövlət dəstəyi mexanizmləri</h2>
              <ul className="card-list">
                {result!.incentives.map((inc) => (
                  <li key={inc.id} className="card">
                    <h3>{inc.name}</h3>
                    <p>{inc.description}</p>
                    {inc.related_items.length > 0 && (
                      <p className="meta">
                        Əlaqəli bəndlər: {inc.related_items.join(", ")}
                      </p>
                    )}
                    <button onClick={() => goToForm(inc.name)}>
                      Bu sahədə müraciət et
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result!.programItems.length > 0 && (
            <div className="result-block">
              <h2>Dövlət Proqramı bəndləri</h2>
              <ul className="card-list">
                {result!.programItems.map((item) => (
                  <li key={item.id} className="card">
                    <h3>
                      Bənd {item.bend_no}: {item.title}
                    </h3>
                    <p>{item.text}</p>
                    <p className="meta">İcraçı: {item.executor}</p>
                    <p className="meta">Müddət: {item.muddet}</p>
                    <button onClick={() => goToForm(item.title)}>
                      Bu sahədə müraciət et
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <button className="link-button" onClick={() => navigate("/")}>
        Yeni axtarış
      </button>
    </section>
  );
}
