import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CheckCircle2, Clock3, Heart, MapPin, MessageCircle, ShieldCheck, Sparkles, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/format";
import { InquiryForm } from "@/components/inquiry-form";
import { GigReviews } from "@/components/gig-reviews";

export default async function GigDetailPage(props: { params: Promise<{ gigId: string }> }) {
  const { gigId } = await props.params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const { data: gig } = await supabase.from("gigs").select("*, profiles!provider_id(name, avatar_url)").eq("id", gigId).single();
  if (!gig) notFound();
  const { data: reviews } = await supabase.from("reviews").select("id, rating, body, created_at, reviewer:profiles!reviews_reviewer_id_profiles_id_fk(name)").eq("gig_id", gigId).order("created_at", { ascending: false });
  const reviewList = reviews ?? [];
  const average = reviewList.length ? reviewList.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewList.length : 0;
  const featured = gig.featured_until && new Date(gig.featured_until) > new Date();
  const ownGig = user?.id === gig.provider_id;
  const providerName = gig.profiles?.name ?? "Serviceer professional";
  const initials = providerName.split(" ").map((part: string) => part[0]).slice(0, 2).join("");

  return <div className="gig-detail-page">
    <div className="gig-detail-container">
      <nav className="gig-breadcrumb"><Link href="/#services"><ArrowLeft /> Explore services</Link><span>/</span><Link href={`/?category=${gig.category?.toLowerCase()}#services`}>{gig.category}</Link></nav>
      <div className="gig-detail-layout">
        <main className="gig-detail-main">
          <section className="gig-hero-card">
            <div className="gig-hero-meta"><span>{gig.category}</span>{featured && <b><Sparkles /> Top pick</b>}</div>
            <h1>{gig.title}</h1>
            <div className="gig-trust-line"><Link href={`/providers/${gig.provider_id}`}><span className="gig-avatar">{initials}</span>{providerName}<BadgeCheck /></Link>{average > 0 ? <span className="gig-rating"><Star fill="currentColor" /> {average.toFixed(1)} <small>({reviewList.length} reviews)</small></span> : <span className="gig-new"><Sparkles /> New on Serviceer</span>}{gig.location && <span><MapPin />{gig.location}</span>}</div>
            <div className="gig-cover-art" aria-hidden="true"><span>{gig.title.charAt(0)}</span><div><i /><i /><i /></div></div>
          </section>
          <section className="gig-content-card"><span className="gig-section-label">About this service</span><h2>What you can expect</h2><p className="gig-description">{gig.description}</p>{gig.tags?.length > 0 && <div className="gig-tags">{gig.tags.map((tag: string) => <Link key={tag} href={`/?q=${encodeURIComponent(tag)}#services`}>{tag}</Link>)}</div>}<div className="gig-expectations"><div><CheckCircle2 /><span><strong>Clear scope</strong><small>Agree on the work before it starts</small></span></div><div><MessageCircle /><span><strong>Direct conversation</strong><small>Keep details together in Serviceer</small></span></div><div><ShieldCheck /><span><strong>Order support</strong><small>A visible record from inquiry to completion</small></span></div></div></section>
          <section className="gig-provider-card"><div className="gig-provider-head"><span className="gig-provider-avatar">{initials}</span><div><span className="gig-section-label">Your professional</span><h2>{providerName} <BadgeCheck /></h2><p>{gig.location || "Available locally"}</p></div><Link href={`/providers/${gig.provider_id}`}>View profile</Link></div><div className="provider-confidence"><span><Clock3 /><b>Responsive</b><small>Message through your order</small></span><span><ShieldCheck /><b>Verified profile</b><small>Marketplace account</small></span><span><Star /><b>{average ? `${average.toFixed(1)} rating` : "New provider"}</b><small>{reviewList.length ? `${reviewList.length} customer reviews` : "Ready for a first review"}</small></span></div></section>
          <section className="gig-reviews-section"><div className="gig-section-heading"><div><span className="gig-section-label">Customer feedback</span><h2>Reviews</h2></div>{average > 0 && <strong><Star fill="currentColor" />{average.toFixed(1)}<small>out of 5</small></strong>}</div><GigReviews reviews={reviewList} /></section>
        </main>
        <aside className="gig-inquiry-column"><div className="gig-inquiry-card"><div className="gig-price"><span>Starting from</span><strong>{formatPrice(gig.price)}</strong><small>Final price is agreed with the provider</small></div>{ownGig ? <div className="gig-own-service"><BadgeCheck /><h3>This is your service</h3><p>Manage the listing or update its details from your workspace.</p><Link href={`/app/gigs/${gig.id}/edit`}>Edit service</Link></div> : !user ? <div className="gig-signin-prompt"><h3>Ready to discuss the job?</h3><p>Sign in to send your requirements and budget directly to {providerName}.</p><Link href={`/sign-in?next=${encodeURIComponent(`/gigs/${gig.id}`)}`}>Sign in to inquire</Link><small>New here? <Link href={`/sign-up?next=${encodeURIComponent(`/gigs/${gig.id}`)}`}>Create an account</Link></small></div> : <><div className="inquiry-heading"><span>Start a conversation</span><h2>Tell {providerName.split(" ")[0]} what you need.</h2></div><InquiryForm gigId={gig.id} providerId={gig.provider_id} startingPrice={gig.price} /></>}<div className="gig-safety-note"><ShieldCheck /><span><strong>Keep it on Serviceer</strong><small>Use the order conversation so support has the full context.</small></span></div></div><button type="button" className="gig-save-action"><Heart /> Save for later</button></aside>
      </div>
    </div>
  </div>;
}
