import { Link } from "react-router-dom";
import { usePageMeta } from "../seo";

export default function NotFound() {
  usePageMeta({ title: "Səhifə tapılmadı", noindex: true });

  return (
    <section>
      <h1>Səhifə tapılmadı</h1>
      <p>
        Axtardığınız səhifə mövcud deyil. <Link to="/">Əsas səhifəyə qayıdın</Link>.
      </p>
    </section>
  );
}
