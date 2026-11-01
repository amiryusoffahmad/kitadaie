import assert from 'node:assert/strict';

const origin = process.env.AUTH_TEST_URL || 'http://localhost:3000';
const app = new URL(origin);
if (!['localhost', '127.0.0.1'].includes(app.hostname)) throw Error('Run this check against a local app only.');
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }

const alternate = new URL('/sign-in?callbackUrl=%2Fhome', app);
alternate.hostname = app.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
const redirected = await fetch(alternate, { redirect: 'manual' });
check('alternate host redirects before OAuth and retains the destination', () => {
  assert.equal(redirected.status, 307);
  assert.equal(redirected.headers.get('location'), `${origin}/sign-in?callbackUrl=%2Fhome`);
});

const stale = await fetch(`${origin}/sign-in`, { redirect: 'manual', headers: { cookie: 'kitadaie.session_token=invalid' } });
check('a stale session cookie can reach sign-in without a redirect loop', () => assert.equal(stale.status, 200));

const start = await fetch(`${origin}/api/auth/sign-in/social`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', origin },
  body: JSON.stringify({ provider: 'google', callbackURL: '/dashboard', errorCallbackURL: '/sign-in', disableRedirect: true }),
});
assert.equal(start.status, 200);
const authorization = new URL((await start.json()).url);
const stateCookie = start.headers.getSetCookie().find((cookie) => /kitadaie\.state=/.test(cookie));
check('Google returns to the same configured origin', () => {
  assert.equal(authorization.origin, 'https://accounts.google.com');
  assert.equal(authorization.searchParams.get('redirect_uri'), `${origin}/api/auth/callback/google`);
});
check('OAuth state uses an HTTP-compatible, HttpOnly SameSite cookie locally', () => {
  assert.ok(stateCookie);
  assert.match(stateCookie, /HttpOnly/i);
  assert.match(stateCookie, /SameSite=Lax/i);
  assert.equal(/;\s*Secure(?:;|$)/i.test(stateCookie), app.protocol === 'https:');
});

// A provider cancellation exercises state verification without Google credentials
// or exchanging a code. Successful state validation consumes this test state.
const callback = new URL('/api/auth/callback/google', app);
callback.searchParams.set('state', authorization.searchParams.get('state'));
callback.searchParams.set('error', 'access_denied');
const returned = await fetch(callback, { redirect: 'manual', headers: { cookie: stateCookie.split(';')[0] } });
const destination = new URL(returned.headers.get('location'), app);
check('a fresh callback validates its state and returns to the retry page', () => {
  assert.equal(destination.pathname, '/sign-in');
  assert.equal(destination.searchParams.get('error'), 'access_denied');
});
const replay = await fetch(callback, { redirect: 'manual', headers: { cookie: stateCookie.split(';')[0] } });
const rejected = new URL(replay.headers.get('location'), app);
check('replayed state is rejected and returns to sign-in', () => {
  assert.equal(rejected.pathname, '/sign-in');
  assert.equal(rejected.searchParams.get('error'), 'state_mismatch');
});
console.log(`Sign-in integration: ${checks} checks passed.`);
