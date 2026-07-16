import Link from "next/link";
import { BadgeCheck, MessageCircleMore, ShieldCheck, Sparkles } from "lucide-react";

export function AuthShell({ eyebrow, title, description, children, footer, compact = false }: { eyebrow: string; title: string; description: string; children: React.ReactNode; footer?: React.ReactNode; compact?: boolean }) {
  return <div className={`auth-page${compact ? " auth-page-compact" : ""}`}>
    <aside className="auth-story">
      <Link href="/" className="auth-brand"><span>S</span>Serviceer</Link>
      <div className="auth-story-copy"><span className="auth-story-kicker"><Sparkles size={14} /> Local talent, properly found</span><h2>Get good work<br />moving.</h2><p>Discover trusted people nearby, keep every conversation together, and know what happens next.</p><div className="auth-benefits"><span><BadgeCheck /> Trusted provider profiles</span><span><MessageCircleMore /> Clear conversations and offers</span><span><ShieldCheck /> Support through every order</span></div></div>
      <blockquote>“A simpler way to find the right person for the job.”<small>Built for local communities</small></blockquote>
    </aside>
    <main className="auth-main"><div className="auth-panel"><Link href="/" className="auth-mobile-brand"><span>S</span>Serviceer</Link><span className="auth-eyebrow">{eyebrow}</span><h1>{title}</h1><p className="auth-description">{description}</p>{children}{footer && <div className="auth-footer">{footer}</div>}</div></main>
  </div>;
}
