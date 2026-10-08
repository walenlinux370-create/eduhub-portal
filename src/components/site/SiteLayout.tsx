import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre Nós" },
  { to: "/ensino", label: "Ensino" },
  { to: "/admissoes", label: "Admissões" },
  { to: "/noticias", label: "Notícias" },
  { to: "/contactos", label: "Contactos" },
  { to: "/privacidade", label: "Privacidade" },
] as const;

const LOGO_URL = "https://raw.githubusercontent.com/walenlinux370-create/jossyquina/main/assets/logo.webp";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-3" aria-label="Escola Comunitária Jossyquina — Início">
          <img src={LOGO_URL} alt="Logótipo da Escola Comunitária Jossyquina" className="h-12 w-12 rounded-full object-contain" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold text-primary">Jossyquina</span>
            <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">Escola Comunitária</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary border-b-2 border-gold pb-1" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          className="rounded-md border border-border px-3 py-2 text-sm lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? "Fechar" : "Menu"}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col border-t border-border px-5 py-3 lg:hidden" aria-label="Navegação móvel">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2 text-sm font-medium">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy-deep text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-gold">Escola Comunitária Jossyquina</p>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Educar com rigor, valores e compromisso com a comunidade.
          </p>
        </div>
        <div className="text-sm text-primary-foreground/80">
          <p className="eyebrow mb-3">Contactos</p>
          <p>Moçambique</p>
          <p>info@jossyquina.edu.mz</p>
          <p>+258 84 000 0000</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Navegação</p>
          <ul className="space-y-1.5 text-primary-foreground/80">
            {nav.slice(1).map((n) => (
              <li key={n.to}><Link to={n.to} className="hover:text-gold">{n.label}</Link></li>
            ))}
            <li><Link to="/portal" className="font-semibold text-gold hover:text-primary-foreground">Portal administrativo</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} Escola Comunitária Jossyquina. Todos os direitos reservados.
      </div>
    </footer>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-primary-foreground/75">{intro}</p>}
      </div>
    </section>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-6xl px-5 py-16 md:py-20 ${className}`}>{children}</section>;
}

export const btnGold =
  "inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-105";
export const btnOutline =
  "inline-flex items-center justify-center rounded-md border border-primary-foreground/40 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10";
export const btnPrimary =
  "inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-navy-deep";
