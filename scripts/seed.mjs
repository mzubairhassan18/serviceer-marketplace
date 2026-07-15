import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL. Add it to .env.local");
  process.exit(1);
}

const ADMIN_EMAIL = process.argv[2] || "";
if (!ADMIN_EMAIL) {
  console.error("Usage: node --env-file=.env.local scripts/seed.mjs your@email.com");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: "require" });

try {
  const [profile] = await sql`
    update profiles set role = 'admin' where email = ${ADMIN_EMAIL} returning id, name, email, role
  `;

  if (!profile) {
    console.log(`No profile found with email "${ADMIN_EMAIL}". Sign up first, then run this script.`);
    process.exit(1);
  }

  console.log(`Admin set: ${profile.name} (${profile.email}) — role: ${profile.role}`);

  const existing = await sql`select count(*) from ad_packages`;
  if (existing[0].count === "0") {
    await sql`
      insert into ad_packages (name, description, price_minor, currency, duration_days, priority_boost, features) values
      ('Basic Boost', 'Featured for 3 days', 50000, 'PKR', 3, 1, '{"highlight":true}'),
      ('Premium Boost', 'Featured for 7 days', 100000, 'PKR', 7, 2, '{"highlight":true,"badge":true}'),
      ('Platinum Boost', 'Featured for 14 days', 180000, 'PKR', 14, 3, '{"highlight":true,"badge":true,"homepage":true}')
    `;
    console.log("Ad packages seeded: Basic, Premium, Platinum");
  } else {
    console.log("Ad packages already exist, skipping seed.");
  }

  console.log("Seed complete.");
} finally {
  await sql.end();
}
