"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { CategoryBrowser } from "@/components/category-browser";
import { GigCard } from "@/components/gig-card";
import { HeroSearch } from "@/components/hero-search";
import { MarketplaceTrust } from "@/components/marketplace-trust";
import { ViewToggle } from "@/components/view-toggle";
import { ExploreServicesLink } from "@/components/explore-services-link";
import { rankGigsByIntent } from "@/lib/search-intent";

interface GigWithStats { id: string; title: string; description: string; category: string; price: number; location: string; tags: string[]; featured_until: string | null; profiles: { name: string } | null; avg_rating: number; review_count: number; }

export function HomePageClient({ allGigs }: { allGigs: GigWithStats[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showAll, setShowAll] = useState(false);
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const filtering = Boolean(q.trim() || category);
  const searchResult = useMemo(() => rankGigsByIntent(allGigs, q, category), [allGigs, category, q]);
  const gigs = searchResult.gigs;
  const featured = allGigs.filter((gig) => gig.featured_until && new Date(gig.featured_until) > new Date()).slice(0, 4);
  const visible = filtering ? gigs : showAll ? allGigs : (featured.length ? featured : allGigs.slice(0, 8));

  useEffect(() => {
    if ((filtering || window.location.hash === "#services") && document.getElementById("services")) {
      window.requestAnimationFrame(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [filtering, q, category]);

  useEffect(() => {
    const browseAll = () => setShowAll(true);
    window.addEventListener("serviceer:browse-all", browseAll);
    return () => window.removeEventListener("serviceer:browse-all", browseAll);
  }, []);

  function browseAll() {
    setShowAll(true);
    window.history.replaceState(null, "", "/#services");
    window.requestAnimationFrame(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="marketplace-home">
      <section className="marketplace-hero">
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker"><span><Sparkles size={14} /></span> Local talent. Properly found.</div>
            <h1>Your to-do list<br />just met its <em>match.</em></h1>
            <p>From a quick repair to a big idea, discover skilled people nearby who are ready to make it happen.</p>
            <HeroSearch />
            <div className="hero-proof"><span><BadgeCheck size={17} /> Trusted profiles</span><span><Star size={17} /> Real reviews</span><span><ShieldCheck size={17} /> Support when needed</span></div>
          </div>
          <div className="hero-story" aria-hidden="true">
            <div className="story-card story-main"><div className="story-image"><span className="story-tool">S</span><div className="story-status"><i /> Available today</div></div><div className="story-person"><span>AH</span><div><strong>Ahmed H.</strong><small><BadgeCheck size={13} /> Home electrician</small></div><b>4.9 <Star size={12} fill="currentColor" /></b></div></div>
            <div className="story-float story-location"><MapPin size={16} /><div><small>Nearby</small><strong>2.4 km away</strong></div></div>
            <div className="story-float story-review"><span>“</span><div><strong>Job done beautifully.</strong><small>— Sana, Lahore</small></div></div>
          </div>
        </div>
      </section>

      <main className="marketplace-container">
        {!filtering && <CategoryBrowser />}
        <section className="services-section" id="services">
          <div className="section-heading-row services-heading">
            <div><span className="eyebrow">{filtering ? "Search results" : showAll ? "All local services" : "Handpicked nearby"}</span><h2>{filtering ? (q || category) : showAll ? `Explore all ${allGigs.length} services.` : "Reliable help, ready when you are."}</h2><p>{filtering ? `${gigs.length} matching ${gigs.length === 1 ? "service" : "services"}` : "Standout professionals worth knowing about."}</p>{q && searchResult.inferredCategory && <div className="intent-notice"><Sparkles size={14} /> We understood this as <strong>{searchResult.inferredCategory}</strong></div>}</div>
            <div className="services-actions">{filtering && <ExploreServicesLink>Clear search</ExploreServicesLink>}<ViewToggle onChange={setView} /></div>
          </div>
          {visible.length > 0 ? <div className={view === "grid" ? "services-grid" : "services-list"}>{visible.map((gig) => <GigCard key={gig.id} gig={gig} view={view} showTags={filtering} />)}</div> : <div className="marketplace-empty"><span>Nothing here yet</span><h3>Try a broader search.</h3><p>Change the wording or browse everything available nearby.</p><ExploreServicesLink>Explore all services <ArrowRight size={16} /></ExploreServicesLink></div>}
          {!filtering && !showAll && allGigs.length > visible.length && <div className="browse-more"><button type="button" onClick={browseAll}>Browse all {allGigs.length} services <ArrowRight size={17} /></button></div>}
        </section>
        <MarketplaceTrust />
        <section className="provider-cta"><div><span className="eyebrow">For professionals</span><h2>Skill deserves a bigger stage.</h2><p>Create your service profile, meet serious customers, and grow your reputation one great job at a time.</p></div><Link href="/sign-up">Start offering services <ArrowRight size={18} /></Link></section>
      </main>
      <footer className="marketplace-footer"><Link href="/" className="footer-brand"><span>S</span> Serviceer</Link><p>Good people. Great work. Right nearby.</p><div><ExploreServicesLink>Explore</ExploreServicesLink><Link href="/sign-up">Become a provider</Link><Link href="/sign-in">Sign in</Link></div><small>© {new Date().getFullYear()} Serviceer</small></footer>
    </div>
  );
}
