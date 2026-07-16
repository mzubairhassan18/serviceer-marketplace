import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { InquiryForm } from "@/components/inquiry-form";

export default async function ContactPage(props: { searchParams: Promise<{ gigId: string; providerId: string }> }) {
  const { gigId, providerId } = await props.searchParams;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const { data: gig } = await supabase.from("gigs").select("title, price, provider_id, profiles!provider_id(name)").eq("id", gigId).single();
  const actualProviderId = gig?.provider_id ?? providerId;
  return <div className="contact-page"><div className="contact-container"><Link href={gigId ? `/gigs/${gigId}` : "/#services"} className="contact-back"><ArrowLeft /> Back to service</Link><div className="contact-layout"><section className="contact-summary"><span>Send an inquiry</span><h1>Start with a clear brief.</h1><p>You’re contacting <strong>{gig?.profiles?.name ?? "a Serviceer professional"}</strong> about:</p><div className="contact-gig"><small>Selected service</small><strong>{gig?.title ?? "Service"}</strong></div><div className="contact-promise"><ShieldCheck /><span><strong>No commitment yet</strong><small>The provider reviews your request before anything is agreed.</small></span></div></section><section className="contact-form-card">{!user ? <div className="gig-signin-prompt"><h2>Sign in to continue</h2><p>Your account keeps the inquiry, response, and future order in one secure place.</p><Link href={`/sign-in?next=${encodeURIComponent(`/contact?gigId=${gigId}&providerId=${actualProviderId}`)}`}>Sign in</Link></div> : <InquiryForm gigId={gigId} providerId={actualProviderId} startingPrice={gig?.price} />}</section></div></div></div>;
}
