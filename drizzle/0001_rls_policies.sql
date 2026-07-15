-- Custom migration: RLS policies for all tables
-- Applied manually via Supabase SQL editor on 2026-07-15

-- Profiles
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Gigs
create policy "gigs_select_public" on gigs for select using (status = 'approved' or auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "gigs_insert" on gigs for insert with check (auth.uid() = provider_id);
create policy "gigs_update" on gigs for update using (auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "gigs_delete" on gigs for delete using (auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Gig tags
create policy "gig_tags_select" on gig_tags for select using (true);
create policy "gig_tags_insert" on gig_tags for insert with check (exists (select 1 from gigs where id = gig_id and provider_id = auth.uid()));
create policy "gig_tags_delete" on gig_tags for delete using (exists (select 1 from gigs where id = gig_id and provider_id = auth.uid()));

-- Gig media
create policy "gig_media_select" on gig_media for select using (true);
create policy "gig_media_insert" on gig_media for insert with check (exists (select 1 from gigs where id = gig_id and provider_id = auth.uid()));
create policy "gig_media_delete" on gig_media for delete using (exists (select 1 from gigs where id = gig_id and provider_id = auth.uid()));

-- Orders
create policy "orders_select" on orders for select using (auth.uid() = buyer_id or auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "orders_insert" on orders for insert with check (auth.uid() = buyer_id);
create policy "orders_update" on orders for update using (auth.uid() = buyer_id or auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (auth.uid() = buyer_id or auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Messages
create policy "messages_select" on messages for select using (exists (select 1 from orders where id = order_id and (buyer_id = auth.uid() or provider_id = auth.uid())));
create policy "messages_insert" on messages for insert with check (exists (select 1 from orders where id = order_id and (buyer_id = auth.uid() or provider_id = auth.uid())));

-- Reviews
create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (exists (select 1 from orders where id = order_id and (buyer_id = auth.uid() or provider_id = auth.uid())));

-- Ad packages
create policy "ad_packages_select" on ad_packages for select using (true);
create policy "ad_packages_insert" on ad_packages for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "ad_packages_update" on ad_packages for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "ad_packages_delete" on ad_packages for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Provider subscriptions
create policy "provider_subs_select" on provider_subscriptions for select using (auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "provider_subs_insert" on provider_subscriptions for insert with check (auth.uid() = provider_id);
create policy "provider_subs_update" on provider_subscriptions for update using (auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (auth.uid() = provider_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Audit events
create policy "audit_events_select" on audit_events for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "audit_events_insert" on audit_events for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
