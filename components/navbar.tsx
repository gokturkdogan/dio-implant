import Link from "next/link";

const navItems = [
  { href: "/", label: "Anasayfa" },
  { href: "/api/categories", label: "Kategoriler API" },
  { href: "/api/products", label: "Urunler API" },
];

export function Navbar() {
  return (
    <header className="site-header">
      <div className="container header-content">
        <Link href="/" className="brand">
          DIO Implant
        </Link>

        <nav className="nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
