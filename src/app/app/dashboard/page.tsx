import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, CircleDollarSign, Clock3, MessageSquare, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: myGigs }, { count: orderCount }, { count: activeSubs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("gigs").select("id, title, status, created_at").eq("provider_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("provider_id", user!.id),
    supabase.from("provider_subscriptions").select("*", { count: "exact", head: true }).eq("provider_id", user!.id).eq("status", "active"),
  ]);
  const approved = myGigs?.filter((gig) => gig.status === "approved").length ?? 0;
  const pending = myGigs?.filter((gig) => gig.status === "pending").length ?? 0;

  return <div className="workspace-page">
    <section className="workspace-welcome"><div><span className="workspace-eyebrow">Your business at a glance</span><h1>Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {profile?.name?.split(" ")[0] ?? "there"}.</h1><p>Keep your services fresh, respond quickly, and turn local interest into great work.</p></div><Link href="/app/gigs/create" className="workspace-primary-action"><Plus size={18} /> Create a service</Link></section>
    <div className="metric-grid provider-metrics">
      <div className="metric-card metric-emphasis"><span className="metric-icon"><BriefcaseBusiness /></span><div><small>Published services</small><strong>{approved}</strong><p>{pending ? `${pending} waiting for review` : "Your live storefront"}</p></div></div>
      <div className="metric-card"><span className="metric-icon"><ShoppingBag /></span><div><small>Total orders</small><strong>{orderCount ?? 0}</strong><p>Across your account</p></div></div>
      <div className="metric-card"><span className="metric-icon"><CircleDollarSign /></span><div><small>Active growth plans</small><strong>{activeSubs ?? 0}</strong><p>Visibility and boosts</p></div></div>
      <div className="metric-card"><span className="metric-icon"><CheckCircle2 /></span><div><small>Profile readiness</small><strong>{profile?.bio ? "90%" : "65%"}</strong><p>{profile?.bio ? "Looking strong" : "Add your provider bio"}</p></div></div>
    </div>
    <div className="workspace-dashboard-grid">
      <section className="workspace-panel"><div className="panel-heading"><div><span>Recent services</span><h2>Your storefront</h2></div><Link href="/app/gigs">Manage all <ArrowRight size={15} /></Link></div>{myGigs?.length ? <div className="workspace-item-list">{myGigs.slice(0, 4).map((gig) => <Link href={`/app/gigs/${gig.id}/edit`} key={gig.id}><span className="item-symbol">{gig.title.charAt(0)}</span><div><strong>{gig.title}</strong><small>Updated {new Date(gig.created_at).toLocaleDateString()}</small></div><span className={`status-badge ${gig.status}`}>{gig.status}</span></Link>)}</div> : <div className="workspace-empty"><Sparkles /><h3>Build your storefront</h3><p>Your first service is the start of being discovered.</p><Link href="/app/gigs/create">Create your first service</Link></div>}</section>
      <aside className="workspace-side-stack"><section className="workspace-panel quick-panel"><div className="panel-heading"><div><span>Shortcuts</span><h2>Move things forward</h2></div></div><Link href="/app/orders"><ShoppingBag /><span><strong>Review orders</strong><small>See requests and delivery status</small></span><ArrowRight /></Link><Link href="/app/messages"><MessageSquare /><span><strong>Reply to customers</strong><small>Keep response times healthy</small></span><ArrowRight /></Link><Link href="/app/packages"><Sparkles /><span><strong>Boost visibility</strong><small>Reach more people nearby</small></span><ArrowRight /></Link></section><section className="workspace-tip"><Clock3 /><div><strong>Small habit, big impact</strong><p>Profiles that reply quickly feel more trustworthy and convert more enquiries.</p></div></section></aside>
    </div>
  </div>;
}
