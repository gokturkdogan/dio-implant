const featureItems = [
  {
    title: "Kategoriler",
    description:
      "Kategori olusturma, listeleme, guncelleme ve silme islemleri icin REST endpointleri.",
  },
  {
    title: "Urunler",
    description:
      "Kategoriye bagli urun yonetimi, slug uretimi ve kategori slug ile filtreleme destegi.",
  },
  {
    title: "Temiz Mimari",
    description:
      "Route handlerlar sadece HTTP katmani olarak calisir, tum is kurallari service katmanindadir.",
  },
];

export default function HomePage() {
  return (
    <section className="home">
      <div className="hero">
        <p className="badge">Production-ready backend starter</p>
        <h1>Next.js App Router ile olceklenebilir backend altyapisi</h1>
        <p className="lead">
          Bu proje, authentication olmadan kategori ve urun yonetimini temiz bir
          servis katmani ile sunar.
        </p>
      </div>

      <div className="grid">
        {featureItems.map((item) => (
          <article key={item.title} className="card">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <article className="card api-card">
        <h2>Hazir Endpointler</h2>
        <ul>
          <li>/api/categories</li>
          <li>/api/categories/[id]</li>
          <li>/api/products</li>
          <li>/api/products/[id]</li>
        </ul>
      </article>
    </section>
  );
}
