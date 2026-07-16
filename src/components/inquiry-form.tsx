import { Banknote, FileText, MessageSquareText, Phone } from "lucide-react";
import { sendContactAction } from "@/app/contact/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

interface InquiryFormProps { gigId: string; providerId: string; startingPrice?: number; }

export function InquiryForm({ gigId, startingPrice }: InquiryFormProps) {
  return <form action={sendContactAction} className="inquiry-form">
    <input type="hidden" name="gigId" value={gigId} />
    <div className="inquiry-field"><label htmlFor="description"><FileText /> What needs to be done? <b>Required</b></label><textarea id="description" name="description" rows={4} required placeholder="Describe the job, the space, and what a good result looks like…" /><small>Useful detail helps the provider respond with an accurate offer.</small></div>
    <div className="inquiry-row"><div className="inquiry-field"><label htmlFor="offered_price"><Banknote /> Your budget <b>PKR</b></label><input id="offered_price" name="offered_price" type="number" min="1" required defaultValue={startingPrice ? Math.round(startingPrice / 100) : undefined} placeholder="e.g. 5,000" /></div><div className="inquiry-field"><label htmlFor="phone"><Phone /> Phone <b>Optional</b></label><input id="phone" name="phone" type="tel" inputMode="tel" placeholder="03XX-XXXXXXX" /></div></div>
    <div className="inquiry-field"><label htmlFor="message"><MessageSquareText /> Anything else? <b>Optional</b></label><textarea id="message" name="message" rows={3} placeholder="Timing, access notes, preferred materials…" /></div>
    <FormSubmitButton className="inquiry-submit" pendingLabel="Sending inquiry…">Send inquiry</FormSubmitButton>
    <p className="inquiry-assurance">No payment is taken now. The provider will review your request first.</p>
  </form>;
}
