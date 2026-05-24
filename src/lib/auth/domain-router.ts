/**
 * Email-domain tier router.
 *
 * One sign-up form, three product surfaces. The user types their email,
 * we hash their domain against an allow-list, and land them on the
 * surface their org actually needs — no tier picker UI required.
 *
 * Tiers:
 *   - free       → /playground          (consumer demo, watermarked)
 *   - nursing    → /rehearse            (Aura-Rehearse-Nurse, audit chain)
 *   - enterprise → /drone               (Aura-Fleet, mission planner, SFSVC)
 *
 * NOTE: Existing app routes are /playground, /rehearse, /drone (no
 * /playground/rehearse or /playground/fleet sub-routes today). This
 * router maps to the existing routes; surface picker stays at /playground
 * for the free tier. If the app later migrates to /playground/* nested
 * routes, change the constants in `LANDING_PATH` only.
 */

export type Tier = "free" | "nursing" | "enterprise";

/* ------------------------------------------------------------------ */
/* Domain allow-lists                                                  */
/* ------------------------------------------------------------------ */

/** Consumer / public webmail providers. */
export const FREE_DOMAINS: ReadonlySet<string> = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.com.hk",
  "icloud.com",
  "me.com",
  "mac.com",
  "outlook.com",
  "outlook.com.hk",
  "hotmail.com",
  "hotmail.com.hk",
  "live.com",
  "live.hk",
  "qq.com",
  "163.com",
  "126.com",
  "foxmail.com",
  "protonmail.com",
  "proton.me",
  "duck.com",
  "fastmail.com",
]);

/**
 * Healthcare + nursing-school institutional domains.
 *
 * Anything matching this set OR `*.edu.hk` resolves to the nursing tier.
 * If you add a new partner hospital, just append the domain — no other
 * code change is needed.
 */
export const INSTITUTIONAL_DOMAINS: ReadonlySet<string> = new Set([
  // Hong Kong Hospital Authority
  "ha.org.hk",
  "ha.gov.hk",
  // Department of Health
  "dh.gov.hk",
  // Universities (medical / nursing schools) – primary roots
  "polyu.edu.hk",
  "hku.hk",
  "cuhk.edu.hk",
  "ust.hk",
  "cityu.edu.hk",
  "eduhk.hk",
  "hkmu.edu.hk",
  "ln.edu.hk",
  "hsmc.edu.hk",
  "cuhk.org.hk",
  "twc.edu.hk",
  // Private hospitals (HK)
  "hkah.org.hk",            // Hong Kong Adventist
  "matilda.org",            // Matilda International
  "hksh.com",               // Hong Kong Sanatorium & Hospital
  "stteresahospital.org.hk",
  "evangel.org.hk",
  "canossahospital.org.hk",
  "unionhosp.org.hk",
  "gleneagles.hk",
]);

/**
 * Corporate / government / contractor domains served by Tier 3.
 *
 * `*.gov.hk` is treated as enterprise unless explicitly placed in
 * INSTITUTIONAL_DOMAINS (e.g. ha.gov.hk, dh.gov.hk are healthcare).
 */
export const ENTERPRISE_DOMAINS: ReadonlySet<string> = new Set([
  // HK government — inspection / infrastructure / aviation
  "emsd.gov.hk",          // Electrical & Mechanical Services
  "bd.gov.hk",            // Buildings Department
  "lcsd.gov.hk",          // Leisure & Cultural Services
  "hkcad.gov.hk",         // Civil Aviation
  "had.gov.hk",           // Home Affairs
  "devb.gov.hk",          // Development Bureau
  "td.gov.hk",            // Transport
  "epd.gov.hk",           // Environmental Protection
  "info.gov.hk",
  // Contractors / property
  "gammon.com",
  "leightonasia.com",
  "leighton.com.au",
  "chunwo.com",
  "henderson-development.com",
  "hki.com.hk",
  "shkp.com",
  "swireproperties.com",
  "hutchison.com.hk",
  "newworld.com",
  // Transport / utilities / airport
  "mtr.com.hk",
  "airport-authority.com",
  "hkairport.com",
  "clp.com.hk",
  "hkelectric.com",
  // Drone / robotics specialists
  "dji.com",
  "skydio.com",
  "parrot.com",
  "asia-aerial.com.hk",
]);

/* ------------------------------------------------------------------ */
/* Suffix rules                                                        */
/* ------------------------------------------------------------------ */

/**
 * Suffix rules apply AFTER the explicit allow-lists. Order matters:
 * the institutional rule wins over the gov.hk rule, so e.g. ha.gov.hk
 * stays nursing-tier (it's explicit in INSTITUTIONAL_DOMAINS).
 */
const NURSING_SUFFIXES: readonly string[] = [
  ".edu.hk",      // every HK academic institution
];

const ENTERPRISE_SUFFIXES: readonly string[] = [
  ".gov.hk",      // every HK government dept not already classed as healthcare
];

/* ------------------------------------------------------------------ */
/* Pure router                                                         */
/* ------------------------------------------------------------------ */

/** Lower-case, trim, and strip any plus-addressing from an email. */
export function normalizeEmail(email: string): string {
  return (email ?? "").trim().toLowerCase();
}

/** Returns the bare domain of an email, or "" if malformed. */
export function domainOf(email: string): string {
  const at = normalizeEmail(email).indexOf("@");
  if (at < 0) return "";
  return normalizeEmail(email).slice(at + 1);
}

/**
 * Resolve the tier for an email address.
 *
 * Resolution order (first match wins):
 *   1. INSTITUTIONAL_DOMAINS (explicit)        → "nursing"
 *   2. `.edu.hk` suffix                        → "nursing"
 *   3. ENTERPRISE_DOMAINS (explicit)           → "enterprise"
 *   4. `.gov.hk` suffix                        → "enterprise"
 *   5. FREE_DOMAINS (explicit)                 → "free"
 *   6. Unknown corporate domain                → "enterprise" (flag for sales)
 *
 * Empty / malformed input → "free" (safe default for the demo surface).
 */
export function tierForEmail(email: string): Tier {
  const domain = domainOf(email);
  // Malformed (no @ or no dot in the domain) → free is the safe default.
  if (!domain || !domain.includes(".")) return "free";

  if (INSTITUTIONAL_DOMAINS.has(domain)) return "nursing";
  if (NURSING_SUFFIXES.some((s) => domain.endsWith(s))) return "nursing";

  if (ENTERPRISE_DOMAINS.has(domain)) return "enterprise";
  if (ENTERPRISE_SUFFIXES.some((s) => domain.endsWith(s))) return "enterprise";

  if (FREE_DOMAINS.has(domain)) return "free";

  // Unknown corporate / non-webmail domain: default to enterprise so
  // sales gets a lead, but mark it so middleware can flag it for review.
  return "enterprise";
}

/**
 * True if a domain was inferred as enterprise without being in the
 * allow-list. The auth callback may use this to drop a "sales-review"
 * cookie so the next page can show a "Welcome — we'll be in touch"
 * banner instead of pretending the user has full Tier-3 access.
 */
export function isUnknownEnterprise(email: string): boolean {
  const domain = domainOf(email);
  if (!domain) return false;
  if (tierForEmail(email) !== "enterprise") return false;
  if (ENTERPRISE_DOMAINS.has(domain)) return false;
  if (ENTERPRISE_SUFFIXES.some((s) => domain.endsWith(s))) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* Landing-path table                                                  */
/* ------------------------------------------------------------------ */

/**
 * Map a tier to its post-sign-in landing path.
 *
 * Keep this in sync with `src/app/<route>/page.tsx`. If you ever migrate
 * to `/playground/rehearse` and `/playground/fleet` sub-routes, change
 * only these three constants.
 */
export const LANDING_PATH: Readonly<Record<Tier, string>> = {
  free: "/playground",
  nursing: "/rehearse",
  enterprise: "/drone",
};

export function landingPathFor(tier: Tier): string {
  return LANDING_PATH[tier];
}

/** One-liner used by the callback. */
export function landingPathForEmail(email: string): string {
  return landingPathFor(tierForEmail(email));
}

/* ------------------------------------------------------------------ */
/* Cookie + claim helpers                                              */
/* ------------------------------------------------------------------ */

export const TIER_COOKIE = "aurasense.tier";
export const SALES_REVIEW_COOKIE = "aurasense.sales_review";

/** Pretty label for UI banners ("Healthcare", "Enterprise", "Free"). */
export function tierLabel(tier: Tier): string {
  switch (tier) {
    case "nursing":
      return "Healthcare";
    case "enterprise":
      return "Enterprise";
    case "free":
    default:
      return "Free";
  }
}
