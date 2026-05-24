// Tests for src/lib/auth/domain-router.ts.
//
// As with the other unit tests in this folder, node --test runs JS only,
// so we mirror the routing contract here and assert behaviour. If you
// change the allow-lists or resolution order in domain-router.ts, update
// this file in lockstep.
//
// Run with: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'

const FREE = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.com.hk', 'icloud.com', 'me.com', 'mac.com',
  'outlook.com', 'outlook.com.hk', 'hotmail.com', 'hotmail.com.hk',
  'live.com', 'live.hk', 'qq.com', '163.com', '126.com', 'foxmail.com',
  'protonmail.com', 'proton.me', 'duck.com', 'fastmail.com',
])

const INST = new Set([
  'ha.org.hk', 'ha.gov.hk', 'dh.gov.hk',
  'polyu.edu.hk', 'hku.hk', 'cuhk.edu.hk', 'ust.hk', 'cityu.edu.hk',
  'eduhk.hk', 'hkmu.edu.hk', 'ln.edu.hk', 'hsmc.edu.hk', 'cuhk.org.hk', 'twc.edu.hk',
  'hkah.org.hk', 'matilda.org', 'hksh.com', 'stteresahospital.org.hk',
  'evangel.org.hk', 'canossahospital.org.hk', 'unionhosp.org.hk', 'gleneagles.hk',
])

const ENT = new Set([
  'emsd.gov.hk', 'bd.gov.hk', 'lcsd.gov.hk', 'hkcad.gov.hk', 'had.gov.hk',
  'devb.gov.hk', 'td.gov.hk', 'epd.gov.hk', 'info.gov.hk',
  'gammon.com', 'leightonasia.com', 'leighton.com.au', 'chunwo.com',
  'henderson-development.com', 'hki.com.hk', 'shkp.com', 'swireproperties.com',
  'hutchison.com.hk', 'newworld.com',
  'mtr.com.hk', 'airport-authority.com', 'hkairport.com', 'clp.com.hk', 'hkelectric.com',
  'dji.com', 'skydio.com', 'parrot.com', 'asia-aerial.com.hk',
])

function domainOf(email) {
  const e = (email ?? '').trim().toLowerCase()
  const at = e.indexOf('@')
  return at < 0 ? '' : e.slice(at + 1)
}

function tierForEmail(email) {
  const d = domainOf(email)
  if (!d || !d.includes('.')) return 'free'
  if (INST.has(d)) return 'nursing'
  if (d.endsWith('.edu.hk')) return 'nursing'
  if (ENT.has(d)) return 'enterprise'
  if (d.endsWith('.gov.hk')) return 'enterprise'
  if (FREE.has(d)) return 'free'
  return 'enterprise' // unknown corp default
}

function landingPathFor(tier) {
  return { free: '/playground', nursing: '/rehearse', enterprise: '/drone' }[tier]
}

test('webmail → free tier → /playground', () => {
  for (const d of ['gmail.com', 'qq.com', 'icloud.com', 'proton.me']) {
    assert.equal(tierForEmail(`alice@${d}`), 'free')
    assert.equal(landingPathFor(tierForEmail(`alice@${d}`)), '/playground')
  }
})

test('hospital authority → nursing → /rehearse', () => {
  assert.equal(tierForEmail('nurse@ha.org.hk'), 'nursing')
  assert.equal(tierForEmail('nurse@ha.gov.hk'), 'nursing')
  assert.equal(landingPathFor(tierForEmail('nurse@ha.org.hk')), '/rehearse')
})

test('any .edu.hk → nursing (incl. sub-domains)', () => {
  for (const d of ['polyu.edu.hk', 'student.polyu.edu.hk', 'cs.cuhk.edu.hk', 'med.hku.edu.hk']) {
    assert.equal(tierForEmail(`s@${d}`), 'nursing', `${d} should resolve to nursing`)
  }
})

test('hku.hk and ust.hk (no .edu.hk) → nursing via INSTITUTIONAL_DOMAINS', () => {
  assert.equal(tierForEmail('dr@hku.hk'), 'nursing')
  assert.equal(tierForEmail('eng@ust.hk'), 'nursing')
})

test('private HK hospitals → nursing', () => {
  for (const d of ['hksh.com', 'matilda.org', 'hkah.org.hk']) {
    assert.equal(tierForEmail(`m@${d}`), 'nursing')
  }
})

test('EMSD / BD / HKCAD → enterprise → /drone', () => {
  for (const d of ['emsd.gov.hk', 'bd.gov.hk', 'hkcad.gov.hk']) {
    assert.equal(tierForEmail(`insp@${d}`), 'enterprise')
    assert.equal(landingPathFor(tierForEmail(`insp@${d}`)), '/drone')
  }
})

test('any unlisted .gov.hk → enterprise (catch-all)', () => {
  assert.equal(tierForEmail('officer@policy.gov.hk'), 'enterprise')
})

test('major contractors / drone vendors → enterprise', () => {
  for (const d of ['gammon.com', 'mtr.com.hk', 'dji.com', 'shkp.com']) {
    assert.equal(tierForEmail(`u@${d}`), 'enterprise')
  }
})

test('unknown corporate domain → enterprise (sales-review fallback)', () => {
  assert.equal(tierForEmail('cto@some-new-startup.io'), 'enterprise')
})

test('healthcare domains in INSTITUTIONAL win over .gov.hk suffix', () => {
  // ha.gov.hk is BOTH in INSTITUTIONAL and matches .gov.hk; resolution
  // order guarantees it stays nursing.
  assert.equal(tierForEmail('nurse@ha.gov.hk'), 'nursing')
  assert.equal(tierForEmail('dr@dh.gov.hk'), 'nursing')
})

test('case-insensitive and whitespace-tolerant', () => {
  assert.equal(tierForEmail('  NURSE@HA.Org.HK  '), 'nursing')
  assert.equal(tierForEmail('ENG@DJI.COM'), 'enterprise')
})

test('malformed / empty → free (safe default)', () => {
  for (const e of ['', '   ', 'not-an-email', '@nodomain', null, undefined]) {
    assert.equal(tierForEmail(e), 'free')
  }
})
