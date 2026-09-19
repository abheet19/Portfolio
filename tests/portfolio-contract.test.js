'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'public');
const html = fs.readFileSync(path.join(publicRoot, 'index.html'), 'utf8');

test('visible copy does not regress to removed portfolio wording', () => {
  const removed = [
    '(replica, counter)',
    '100,000-operation benchmark',
    'One replica goes offline',
    'After a company-wide restructuring',
    '100+ editors',
  ];

  for (const phrase of removed) {
    assert.equal(html.includes(phrase), false, `removed wording returned: ${phrase}`);
  }
});

test('all local links and demo-reel assets exist', () => {
  const localPaths = new Set();
  for (const match of html.matchAll(/\b(?:href|data-src|data-poster)="(\/[^"]+)"/g)) {
    const value = match[1];
    if (!value.startsWith('/#')) localPaths.add(value.split(/[?#]/, 1)[0]);
  }

  for (const localPath of localPaths) {
    assert.equal(
      fs.existsSync(path.join(publicRoot, localPath.slice(1))),
      true,
      `missing local CTA or media target: ${localPath}`,
    );
  }
});

test('public profile CTA uses the live LinkedIn slug', () => {
  assert.match(html, /https:\/\/www\.linkedin\.com\/in\/abheet-singh-isher-951920175\//);
  assert.equal(html.includes('linkedin.com/in/abheet-singh-isher"'), false);
});

test('new-tab links cannot retain an opener', () => {
  const links = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((match) => match[0]);
  assert.ok(links.length > 0, 'expected at least one new-tab link');
  for (const link of links) assert.match(link, /\brel="[^"]*noopener[^"]*"/);
});

test('interactive controls have unique ids', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate id found');
});

test('portfolio assistant keeps untrusted text out of HTML sinks', () => {
  assert.match(html, /m\.textContent=text/);
  assert.match(html, /c\.textContent=/);
  assert.match(html, /maxlength="500"/);
  assert.match(html, /looksLikePromptInjection/);
  assert.equal(/\.innerHTML\s*=/.test(html), false, 'assistant page contains an innerHTML assignment');
});
