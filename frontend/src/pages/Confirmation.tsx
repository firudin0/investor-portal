import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const appNumber = (location.state as { appNumber?: string } | null)?.appNumber;

  if (!appNumber) {
    return (
      <section className="confirmation-page">
        <p>Müraciət nömrəsi tapılmadı.</p>
        <button onClick={() => navigate("/")}>Əsas səhifəyə qayıt</button>
      </section>
    );
  }

  return (
    <section className="confirmation-page">
      <h1>Müraciətiniz qeydə alındı</h1>
      <p className="app-number">{appNumber}</p>
      <p>
        Müraciət nömrənizi qeyd edin. Müvafiq qurum sizinlə göstərdiyiniz
        əlaqə vasitələri ilə bağlantı quracaq.
      </p>
      <Link to="/">Əsas səhifəyə qayıt</Link>
    </section>
  );
}
