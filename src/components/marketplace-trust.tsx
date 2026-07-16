import Link from "next/link";
import { BadgeCheck, MessageCircleMore, ShieldCheck } from "lucide-react";

export function MarketplaceTrust() {
  return (
    <section className="trust-section">
      <div className="trust-copy">
        <span className="eyebrow eyebrow-light">The Serviceer standard</span>
        <h2>Good work starts with good people.</h2>
        <p>Compare local professionals with more confidence. Profiles, past ratings, and a clear order trail help you choose without the guesswork.</p>
        <Link href="/sign-up" className="light-button">Join Serviceer <span>→</span></Link>
      </div>
      <div className="trust-cards">
        <div><BadgeCheck /><strong>Identity-led profiles</strong><span>Know who you are hiring before the work begins.</span></div>
        <div><MessageCircleMore /><strong>Everything in one place</strong><span>Offers, conversations, and progress stay connected.</span></div>
        <div><ShieldCheck /><strong>Built-in accountability</strong><span>Reviews and dispute support keep both sides protected.</span></div>
      </div>
    </section>
  );
}
