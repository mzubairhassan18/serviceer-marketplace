import Link from "next/link";
import { Brush, Construction, Hammer, KeyRound, PaintRoller, PlugZap, ShieldCheck, Sparkles } from "lucide-react";

const categories = [
  { name: "Cleaning", icon: Sparkles, note: "Fresh spaces" },
  { name: "Electrical", icon: PlugZap, note: "Safe & powered" },
  { name: "Plumbing", icon: KeyRound, note: "Leaks to installs" },
  { name: "Painting", icon: PaintRoller, note: "A new look" },
  { name: "Carpentry", icon: Hammer, note: "Made to fit" },
  { name: "Construction", icon: Construction, note: "Build better" },
  { name: "Security", icon: ShieldCheck, note: "Peace of mind" },
  { name: "More services", icon: Brush, note: "Explore all" },
];

export function CategoryBrowser() {
  return (
    <section className="category-section" aria-labelledby="category-heading">
      <div className="section-heading-row">
        <div><span className="eyebrow">Explore by need</span><h2 id="category-heading">Whatever needs doing, start here.</h2></div>
        <Link href="/gigs">Browse all <span>→</span></Link>
      </div>
      <div className="category-grid">
        {categories.map(({ name, icon: Icon, note }, index) => (
          <Link key={name} href={index === categories.length - 1 ? "/gigs" : `/?category=${name.toLowerCase()}#services`} className={`category-tile category-${index + 1}`}>
            <span className="category-icon"><Icon size={24} strokeWidth={1.8} /></span>
            <strong>{name}</strong><small>{note}</small><span className="category-arrow">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
