// Validate data layer schema + cross-references (run: node scripts/validate.js)
const fs = require('fs');
const tools = JSON.parse(fs.readFileSync('data/tools.json', 'utf-8'));
const cats = JSON.parse(fs.readFileSync('data/categories.json', 'utf-8'));
const guides = JSON.parse(fs.readFileSync('data/guides.json', 'utf-8'));
const comps = JSON.parse(fs.readFileSync('data/comparisons.json', 'utf-8'));

let failures = 0;
const check = (cond, msg) => {
  console.log((cond ? '[OK] ' : '[FAIL] ') + msg);
  if (!cond) failures++;
};

// 1. Tool schema fields
const required = ['id','slug','name','provider','categories','tagline','descriptionShort','descriptionLong','pricingSummary','hasFreePlan','startingPrice','affiliateUrl','officialUrl','sponsored','sponsoredLabel','ratingOverall','ratingEaseOfUse','ratingOutputQuality','ratingValue','ratingTrust','ratingSpeed','bestFor','notIdealFor','pros','cons','features','integrations','lastReviewedAt','reviewedBy','seoTitle','seoDescription','faq','relatedToolSlugs','comparisonSlugs','guideSlugs'];
let errs = [];
for (const t of tools) {
  for (const f of required) if (!(f in t)) errs.push(`${t.slug}: missing ${f}`);
}
check(errs.length === 0, `all ${tools.length} tools have all ${required.length} schema fields` + (errs.length ? ' — ' + errs.join(', ') : ''));

// 2. Sponsored rules
const sponsored = tools.filter(t => t.sponsored);
check(sponsored.length === 1, 'exactly 1 sponsored tool');
check(sponsored.every(t => t.sponsoredLabel), 'sponsored tool has sponsoredLabel');

// 3. Related tool slugs resolve
let badRel = [];
for (const t of tools) for (const r of (t.relatedToolSlugs || [])) if (!tools.find(x => x.slug === r)) badRel.push(`${t.slug}->${r}`);
check(badRel.length === 0, 'all relatedToolSlugs resolve' + (badRel.length ? ' — ' + badRel.join(', ') : ''));

// 4. Guide refs
let badGuide = [];
for (const g of guides) {
  for (const r of (g.relatedToolSlugs || [])) if (!tools.find(x => x.slug === r)) badGuide.push(`${g.slug}->${r}`);
  if (!cats.find(c => c.slug === g.categorySlug)) badGuide.push(`${g.slug}->cat ${g.categorySlug}`);
}
check(badGuide.length === 0, 'all guide refs resolve' + (badGuide.length ? ' — ' + badGuide.join(', ') : ''));

// 5. Comparison refs
let badComp = [];
for (const c of comps) {
  if (!tools.find(x => x.slug === c.toolA)) badComp.push(`${c.slug} A=${c.toolA}`);
  if (!tools.find(x => x.slug === c.toolB)) badComp.push(`${c.slug} B=${c.toolB}`);
}
check(badComp.length === 0, 'all comparison refs resolve' + (badComp.length ? ' — ' + badComp.join(', ') : ''));

// 6. Category schema
const catRequired = ['id','name','slug','shortDescription','icon','seoTitle','seoDescription','featuredToolSlugs'];
let badCat = [];
for (const c of cats) {
  for (const f of catRequired) if (!(f in c)) badCat.push(`${c.slug}: missing ${f}`);
  for (const ft of (c.featuredToolSlugs || [])) if (!tools.find(x => x.slug === ft)) badCat.push(`${c.slug} featured->${ft}`);
}
check(badCat.length === 0, `all ${cats.length} categories have full schema + valid featuredToolSlugs` + (badCat.length ? ' — ' + badCat.join(', ') : ''));

// 7. Every tool categorized in at least one category
let uncategorized = tools.filter(t => !(t.categories || []).length);
check(uncategorized.length === 0, 'every tool has ≥1 category' + (uncategorized.length ? ' — ' + uncategorized.map(t=>t.slug).join(',') : ''));

// 8. Shell pages exist
const fs2 = require('fs');
const path = require('path');
let missingShells = [];
for (const t of tools) if (!fs2.existsSync(`tool/${t.slug}/index.html`)) missingShells.push(`tool/${t.slug}/`);
for (const c of cats) if (!fs2.existsSync(`tools/${c.slug}/index.html`)) missingShells.push(`tools/${c.slug}/`);
for (const g of guides) if (!fs2.existsSync(`guides/${g.slug}/index.html`)) missingShells.push(`guides/${g.slug}/`);
for (const c of comps) if (!fs2.existsSync(`compare/${c.slug}/index.html`)) missingShells.push(`compare/${c.slug}/`);
check(missingShells.length === 0, 'all shells exist' + (missingShells.length ? ' — ' + missingShells.join(', ') : ''));

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
