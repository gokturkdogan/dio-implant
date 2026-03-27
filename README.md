# DIO Implant

Next.js (App Router) + TypeScript + Neon PostgreSQL + Drizzle ORM ile
kurulmus kategori/urun backend mimarisi ve temel frontend iskeleti.

## Kurulum

1) Bagimliliklari yukle:

```bash
npm install
```

2) Ortam degiskenini hazirla:

```bash
cp .env.example .env.local
```

`.env.local` icindeki `DATABASE_URL` degerini Neon baglanti URL'in ile degistir.

3) Migration olustur ve veritabanina uygula:

```bash
npm run db:generate
npm run db:migrate
```

4) Uygulamayi baslat:

```bash
npm run dev
```

Uygulama: `http://localhost:3000`

## API Endpointleri

- `GET /api/categories`
- `POST /api/categories`
- `GET /api/categories/:id`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/products`
- `GET /api/products?categorySlug=xyz`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
