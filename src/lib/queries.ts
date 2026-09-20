import { db } from '@/lib/db';
import { revalidateTag } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';

// ─── Revalidation tag ────────────────────────────────────────────────
export const REVALIDATE_TAG = 'public-content';

// Opt out of static rendering — always fetch fresh
export function dynamicQuery() {
  noStore();
}

// ─── Site Settings (singleton) ──────────────────────────────────────
export async function getSiteSettings() {
  dynamicQuery();
  return db.siteSetting.findFirst();
}

// ─── Nav Items ──────────────────────────────────────────────────────
export async function getNavItems(location?: string) {
  dynamicQuery();
  return db.navItem.findMany({
    where: location ? { location: location as any } : undefined,
    orderBy: { order: 'asc' },
  });
}

// ─── Homepage Sections ──────────────────────────────────────────────
export async function getHomepageSections() {
  dynamicQuery();
  return db.homepageSection.findMany({
    orderBy: { order: 'asc' },
  });
}

export async function getHomepageSection(key: string) {
  dynamicQuery();
  return db.homepageSection.findUnique({ where: { key } });
}

// ─── Stats ──────────────────────────────────────────────────────────
export async function getStats() {
  dynamicQuery();
  return db.stat.findMany({ orderBy: { order: 'asc' } });
}

// ─── Solutions ───────────────────────────────────────────────────────
export async function getSolutions(options?: { published?: boolean; take?: number }) {
  dynamicQuery();
  return db.solution.findMany({
    where: options?.published !== undefined ? { isPublished: options.published } : undefined,
    orderBy: { order: 'asc' },
    take: options?.take,
    include: { features: { orderBy: { order: 'asc' } } },
  });
}

export async function getSolutionBySlug(slug: string) {
  dynamicQuery();
  return db.solution.findUnique({
    where: { slug },
    include: { features: { orderBy: { order: 'asc' } } },
  });
}

// ─── Team Members ───────────────────────────────────────────────────
export async function getTeamMembers(published = true) {
  dynamicQuery();
  return db.teamMember.findMany({
    where: published ? { isPublished: true } : undefined,
    orderBy: { order: 'asc' },
  });
}

// ─── Testimonials ───────────────────────────────────────────────────
export async function getTestimonials(published = true) {
  dynamicQuery();
  return db.testimonial.findMany({
    where: published ? { isPublished: true } : undefined,
    orderBy: { order: 'asc' },
  });
}

// ─── Client Logos ───────────────────────────────────────────────────
export async function getClientLogos(options?: { showOnHomepage?: boolean; published?: boolean }) {
  dynamicQuery();
  return db.clientLogo.findMany({
    where: {
      ...(options?.showOnHomepage !== undefined ? { showOnHomepage: options.showOnHomepage } : {}),
      ...(options?.published !== undefined ? { isPublished: options.published } : {}),
    },
    orderBy: { order: 'asc' },
  });
}

// ─── Posts ──────────────────────────────────────────────────────────
export async function getPosts(options?: { type?: string; status?: string }) {
  dynamicQuery();
  return db.post.findMany({
    where: {
      ...(options?.type ? { type: options.type as any } : {}),
      ...(options?.status ? { status: options.status as any } : {}),
    },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getPostBySlug(slug: string) {
  dynamicQuery();
  return db.post.findUnique({ where: { slug } });
}

// ─── Jobs ────────────────────────────────────────────────────────────
export async function getJobs(status = 'OPEN') {
  dynamicQuery();
  return db.job.findMany({
    where: { status: status as any },
    orderBy: { postedAt: 'desc' },
  });
}

// ─── Revalidation helper ────────────────────────────────────────────
export async function revalidatePublicContent() {
  revalidateTag(REVALIDATE_TAG);
}

// ─── Globe Countries (Trusted Across Borders) ────────────────────────
export async function getGlobeCountries() {
  dynamicQuery();
  return db.globeCountry.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}
