# DIO Implant — Kurumsal Web Sitesi

DIO Implant’ın **Türkiye kamu web sitesi**: ürünler, dijital çözümler, akademi takvimi, kataloglar, iletişim ve dijital kütüphane gibi içeriklerin ziyaretçiye sunulması; metin, görsel ve bağlantıların **yönetim paneli** üzerinden güncellenmesi için geliştirilmiş bir uygulamadır.

---

## Proje ne?

Tek bir kod tabanında:

- **Ziyaretçi tarafı** — Hızlı, SEO uyumlu sayfalar; kurumsal tasarım; çok sayfalı bilgilendirme (hakkımızda, ürün detayları, eğitim etkinlikleri, katalog indirme, iletişim haritası vb.).
- **İçerik yönetimi** — Şifreli admin alanından ürünler, kategoriler, site metinleri, pop-up, bakım modu, bayi listesi ve benzeri kayıtların veritabanında tutulması ve sitede yansıması.

Yani hem **vitrin** hem **içerik güncelleme aracı** aynı Next.js uygulaması içindedir.

---

## Ne işe yarar?

| Kim | Ne yapar? |
|-----|-----------|
| **Ziyaretçi** | Ürün ve çözümleri inceler, katalog / dijital kütüphane dosyalarına ulaşır, iletişim ve bayi bilgilerini görür, akademi takvimini takip eder. |
| **Editör / yönetici** | `/admin-panel` üzerinden giriş yapar; ürün görselleri, katalog PDF bağlantıları, iletişim bilgileri, duyuru penceresi vb. alanları günceller — değişiklikler veritabanına yazılır ve bir sonraki sayfa yüklemesinde sitede görünür. |

Tıbbi cihaz markası için **bilgilendirici kurumsal site** odaklıdır; ziyaretçi tarafında hesap veya üyelik akışı yoktur.

---

## Genel akış

1. **İçerik** PostgreSQL veritabanında tutulur (Neon üzerinde barındırılabilir).
2. **Sunucu bileşenleri** (Next.js sunucu) sayfa veya API isteğinde veriyi okur, HTML veya JSON döner.
3. **Ziyaretçi** tarayıcıda sayfayı görür; gerektiğinde istemci tarafında ek etkileşim (takvim, kırpma alanları vb.) çalışır.
4. **Yönetici** JWT tabanlı oturum ile korunan API’lere istek atar; yalnızca yetkili oturumda kayıt oluşturma / güncelleme / silme yapılır.

Özet: **Veritabanı → sunucu işlemleri → web arayüzü**; güncellemeler admin panelinden tek merkezden yönetilir.

---

## Kullanılan teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| **Uygulama çatısı** | [Next.js](https://nextjs.org/) (App Router), React, TypeScript |
| **Veritabanı** | PostgreSQL ([Neon](https://neon.tech/) ile uyumlu bağlantı) |
| **ORM / şema** | [Drizzle ORM](https://orm.drizzle.team/), Drizzle Kit ile migration |
| **Doğrulama & güvenlik** | Zod; yönetici oturumu için `jose` (JWT), `bcryptjs` |
| **Medya** | Cloudinary; görseller ve yönetim paneli yüklemeleri |
| **Takvim / tarih** | react-big-calendar, react-day-picker, date-fns |
| **Görüntü işleme (sunucu)** | sharp |

---

## Geliştiriciler için kısa başlangıç

Bağımlılıkları yükleyin, `.env.example` dosyasını referans alarak `.env.local` oluşturun (`DATABASE_URL` ve yönetim için gerekli gizli anahtarlar). Veritabanı migration’larını uyguladıktan sonra:

```bash
npm install
npm run dev
```

Geliştirme sunucusu varsayılan olarak `http://localhost:3000` adresindedir. Ayrıntılı ortam değişkenleri ve migration komutları için projedeki `package.json` script’leri ve `.env.example` kullanılabilir.

---

*Bu README projenin amacını ve mimarisini özetler; üretim dağıtımı ve hukuki metinler şirket süreçlerine tabidir.*
