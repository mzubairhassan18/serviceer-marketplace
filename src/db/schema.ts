import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

/* ── Enums ── */
export const userRole = pgEnum("user_role", ["buyer", "provider", "admin"]);
export const gigStatus = pgEnum("gig_status", ["draft", "pending", "approved", "rejected", "archived"]);
export const orderStatus = pgEnum("order_status", ["inquiry", "offered", "accepted", "in_progress", "delivered", "payment_received", "completed", "cancelled", "disputed", "dispute_resolved", "dispute_closed"]);
export const subStatus = pgEnum("subscription_status", ["active", "expired", "cancelled"]);

/* ── Profiles ── */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => authUsers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: userRole("role").default("buyer").notNull(),
  locale: text("locale").default("en").notNull(),
  ...timestamps,
}).enableRLS();

/* ── Gigs ── */
export const gigs = pgTable("gigs", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`).notNull(),
  price: bigint("price", { mode: "number" }).default(0).notNull(),
  currency: text("currency").default("PKR").notNull(),
  location: text("location").default("").notNull(),
  coverImage: text("cover_image"),
  status: gigStatus("status").default("pending").notNull(),
  featuredUntil: timestamp("featured_until", { withTimezone: true }),
  version: integer("version").default(1).notNull(),
  ...timestamps,
}, (table) => [
  index("gigs_provider_idx").on(table.providerId),
  index("gigs_category_idx").on(table.category),
  index("gigs_status_idx").on(table.status),
  index("gigs_featured_idx").on(table.featuredUntil),
  check("gigs_price_check", sql`${table.price} >= 0`),
  check("gigs_version_check", sql`${table.version} > 0`),
]).enableRLS();

/* ── Gig Tags (searchable) ── */
export const gigTags = pgTable("gig_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  gigId: uuid("gig_id").notNull().references(() => gigs.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("gig_tags_gig_idx").on(table.gigId),
  index("gig_tags_tag_idx").on(table.tag),
  uniqueIndex("gig_tags_gig_tag_unique").on(table.gigId, table.tag),
]).enableRLS();

/* ── Gig Media ── */
export const gigMedia = pgTable("gig_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  gigId: uuid("gig_id").notNull().references(() => gigs.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  storagePath: text("storage_path").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("gig_media_gig_idx").on(table.gigId),
]).enableRLS();

/* ── Ad Packages ── */
export const adPackages = pgTable("ad_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  priceMinor: bigint("price_minor", { mode: "number" }).notNull(),
  currency: text("currency").default("PKR").notNull(),
  durationDays: integer("duration_days").notNull(),
  priorityBoost: integer("priority_boost").default(0).notNull(),
  maxGigs: integer("max_gigs").default(1).notNull(),
  features: jsonb("features").default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
}).enableRLS();

/* ── Provider Package Subscriptions ── */
export const providerSubscriptions = pgTable("provider_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  packageId: uuid("package_id").notNull().references(() => adPackages.id, { onDelete: "restrict" }),
  status: subStatus("status").default("active").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).defaultNow().notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  paymentDetails: text("payment_details"),
  ...timestamps,
}, (table) => [
  index("provider_subs_provider_idx").on(table.providerId),
]).enableRLS();

/* ── Orders ── */
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  gigId: uuid("gig_id").notNull().references(() => gigs.id, { onDelete: "restrict" }),
  buyerId: uuid("buyer_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  providerId: uuid("provider_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  status: orderStatus("status").default("inquiry").notNull(),
  initialMessage: text("initial_message").default("").notNull(),
  description: text("description").default("").notNull(),
  offeredPrice: bigint("offered_price", { mode: "number" }),
  contactPhone: text("contact_phone"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  disputeReason: text("dispute_reason"),
  disputeRaisedBy: uuid("dispute_raised_by").references(() => profiles.id, { onDelete: "set null" }),
  disputeCreatedAt: timestamp("dispute_created_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("orders_buyer_idx").on(table.buyerId),
  index("orders_provider_idx").on(table.providerId),
  index("orders_gig_idx").on(table.gigId),
]).enableRLS();

/* ── Messages ── */
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("messages_order_idx").on(table.orderId),
  index("messages_created_idx").on(table.createdAt),
]).enableRLS();

/* ── Reviews ── */
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }).unique(),
  gigId: uuid("gig_id").notNull().references(() => gigs.id, { onDelete: "cascade" }),
  reviewerId: uuid("reviewer_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  body: text("body").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check("reviews_rating_check", sql`${table.rating} between 1 and 5`),
  index("reviews_gig_idx").on(table.gigId),
]).enableRLS();

/* ── Provider Profiles ── */
export const providerProfiles = pgTable("provider_profiles", {
  id: uuid("id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  bio: text("bio").default("").notNull(),
  skills: text("skills").array().default(sql`ARRAY[]::text[]`).notNull(),
  yearsExperience: integer("years_experience").default(0).notNull(),
  website: text("website").default("").notNull(),
  ...timestamps,
}).enableRLS();

/* ── Gig Boosts ── */
export const gigBoosts = pgTable("gig_boosts", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id").notNull().references(() => providerSubscriptions.id, { onDelete: "cascade" }),
  gigId: uuid("gig_id").notNull().references(() => gigs.id, { onDelete: "cascade" }),
  providerId: uuid("provider_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  status: text("status").default("pending").notNull(),
  ...timestamps,
}, (table) => [
  index("gig_boosts_provider_idx").on(table.providerId),
  index("gig_boosts_gig_idx").on(table.gigId),
  index("gig_boosts_sub_idx").on(table.subscriptionId),
]).enableRLS();

/* ── Audit Events ── */
export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => authUsers.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  summary: text("summary").notNull(),
  metadata: jsonb("metadata"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("audit_events_occurred_idx").on(table.occurredAt),
  index("audit_events_entity_idx").on(table.entityType, table.entityId),
]).enableRLS();

/* ── Order Status History ── */
export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  actorId: uuid("actor_id").references(() => profiles.id, { onDelete: "set null" }),
  actorName: text("actor_name").default("").notNull(),
  note: text("note").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("order_status_history_order_idx").on(table.orderId),
]).enableRLS();

/* -- Types -- */
export type Profile = typeof profiles.$inferSelect;
export type Gig = typeof gigs.$inferSelect;
export type AdPackage = typeof adPackages.$inferSelect;
export type ProviderSubscription = typeof providerSubscriptions.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type ProviderProfile = typeof providerProfiles.$inferSelect;
export type GigBoost = typeof gigBoosts.$inferSelect;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
