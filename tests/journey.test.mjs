import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';
const loadModule = createRequire(import.meta.url);
// Compile the pure TypeScript domain module in memory; no test runner dependency.
loadModule.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText, filename);
};
process.env.TZ = 'Europe/Lisbon';
const { createJourney, prayerDate, buildSnapshot, missedDays, toggleDay, confirmMissedDay, parseJourney } = loadModule('../lib/journey.ts');
const local = (year, month, day, hour = 12, minute = 0) => new Date(year, month - 1, day, hour, minute);

test('new journeys have 90 uncompleted days and deterministic alternating content', () => {
  const state = createJourney(local(2026, 10, 28));
  const snapshot = buildSnapshot(state, local(2026, 10, 28));
  assert.equal(snapshot.completedThroughDay, 0);
  assert.equal(snapshot.days.length, 90);
  assert.equal(snapshot.days[0].roleType, 'pai');
  assert.equal(snapshot.days[1].roleType, 'mãe');
  assert.equal(snapshot.days[0].affirmationText, snapshot.days[47].affirmationText);
  assert.equal(snapshot.activeDayNumber, 1);
});
test('04:59 belongs to yesterday and 05:00 begins a new prayer day', () => {
  const state = createJourney(local(2026, 10, 28));
  assert.deepEqual(missedDays(state, local(2026, 10, 29, 4, 59)), []);
  assert.deepEqual(missedDays(state, local(2026, 10, 29, 5)), [1]);
  assert.equal(createJourney(local(2026, 10, 29, 4)).startDate, '2026-10-28');
});
test('single forgotten registration can be confirmed, multiple cannot', () => {
  const state = createJourney(local(2026, 10, 28));
  const resolved = confirmMissedDay(state, local(2026, 10, 29, 5));
  assert.deepEqual(missedDays(resolved, local(2026, 10, 29, 5)), []);
  assert.equal(state.completions['1'], undefined);
  assert.throws(() => confirmMissedDay(state, local(2026, 10, 30, 5)));
});
test('pending failure prevents progress mutations and future days are read only', () => {
  const state = createJourney(local(2026, 10, 28));
  assert.throws(() => toggleDay(state, 2, local(2026, 10, 28)));
  assert.throws(() => toggleDay(state, 2, local(2026, 10, 29, 5)));
  assert.throws(() => toggleDay(state, 91, local(2026, 10, 28)));
  const done = toggleDay(state, 1, local(2026, 10, 28));
  assert.ok(done.completions['1']);
  assert.equal(toggleDay(done, 1, local(2026, 10, 28)).completions['1'], undefined);
});
test('month/year transitions and daylight saving respect calendar dates', () => {
  for (const [start, end] of [
    [local(2026, 12, 31), local(2027, 1, 1, 5)],
    [local(2026, 3, 28), local(2026, 3, 29, 5)],
    [local(2026, 10, 24), local(2026, 10, 25, 5)],
  ]) assert.deepEqual(missedDays(createJourney(start), end), [1]);
  assert.equal(prayerDate(local(2026, 3, 29, 4)).getDate(), 28);
});
test('explicit restart preserves consent and increments restart metadata', () => {
  const old = toggleDay(createJourney(local(2026, 10, 28)), 1, local(2026, 10, 28));
  const next = createJourney(local(2026, 10, 30), old);
  assert.equal(next.startDate, '2026-10-30');
  assert.equal(next.consentedAt, old.consentedAt);
  assert.equal(next.resetCount, 1);
  assert.deepEqual(next.completions, {});
  assert.ok(old.completions['1']);
});
test('storage round trip validates corrupt records', () => {
  const state = createJourney(local(2026, 10, 28));
  assert.deepEqual(parseJourney(JSON.stringify(state)), state);
  for (const value of [null, {}, { ...state, version: 2 }, { ...state, startDate: '2026-02-30' },
    { ...state, completions: { 91: new Date().toISOString() } }, { ...state, completions: [] }]) {
    assert.throws(() => parseJourney(JSON.stringify(value)));
  }
  assert.throws(() => parseJourney('invalid json'));
});
test('90 completed days remain complete beyond the journey end', () => {
  const state = createJourney(local(2026, 1, 1));
  for (let i = 1; i <= 90; i++) state.completions[String(i)] = local(2026, 1, i).toISOString();
  const snapshot = buildSnapshot(state, local(2026, 10, 28));
  assert.equal(snapshot.isComplete, true);
  assert.equal(snapshot.activeDayNumber, 90);
  assert.deepEqual(missedDays(state, local(2026, 10, 28)), []);
});

const { messages, languages, translate, errorKey } = loadModule('../lib/i18n.ts');
const { affirmations, getAffirmationForDay, buildPrayer } = loadModule('../lib/content.ts');

test('all languages have complete messages and matching interpolation parameters', () => {
  const keys = Object.keys(messages['pt-BR']).sort();
  for (const language of languages) {
    assert.deepEqual(Object.keys(messages[language]).sort(), keys);
    for (const key of keys) {
      assert.ok(messages[language][key].trim(), `${language}: ${key}`);
      const parameters = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
      assert.deepEqual(parameters(messages[language][key]), parameters(messages['pt-BR'][key]), `${language}: ${key}`);
    }
  }
});

test('all 90 days use the same 47-affirmation rotation in every language', () => {
  for (const language of languages) {
    assert.equal(affirmations[language].length, 47);
    for (let day = 1; day <= 90; day++) {
      assert.equal(getAffirmationForDay(day, language), affirmations[language][(day - 1) % 47]);
      assert.ok(getAffirmationForDay(day, language).length > 0);
    }
  }
  assert.equal(getAffirmationForDay(1), getAffirmationForDay(1, 'pt-BR'));
  assert.notEqual(getAffirmationForDay(1, 'en'), getAffirmationForDay(1));
});

test('prayers retain source wording and endings with resolved parent adaptations', () => {
  for (const language of languages) {
    const father = buildPrayer('pai', language);
    const mother = buildPrayer('mãe', language);
    assert.equal(father.title, translate(language, 'prayerTitle'));
    assert.notEqual(father.opening, mother.opening);
    assert.notDeepEqual(father.paragraphs, mother.paragraphs);
    for (const prayer of [father, mother]) {
      assert.doesNotMatch(prayer.paragraphs.join(' '), /\{\w+\}|\(a\)|allegro\/a/);
    }
  }
  assert.equal(buildPrayer('pai').paragraphs[0], 'Eu perdoo você, por favor, me perdoe.');
  assert.ok(buildPrayer('pai').paragraphs.includes('E eu aprendi a amá-lo e a deixá-lo ir de minha mente.'));
  assert.ok(buildPrayer('mãe').paragraphs.includes('E eu aprendi a amá-la e a deixá-la ir de minha mente.'));
  assert.equal(buildPrayer('pai', 'en').paragraphs.at(-1), 'Thank you so much!');
  assert.match(buildPrayer('mãe', 'it').paragraphs.join(' '), /allegra e sorridente/);
  assert.match(buildPrayer('mãe', 'it').paragraphs.at(-1), /Grazie\.$/);
});

test('errors and active notices can be translated without changing journey data', () => {
  const state = toggleDay(createJourney(local(2026, 10, 28)), 1, local(2026, 10, 28));
  const saved = JSON.stringify(state);
  const snapshot = buildSnapshot(state, local(2026, 10, 28));
  let key;
  try { parseJourney('invalid json'); } catch (cause) { key = errorKey(cause, 'storageReadFailed'); }
  assert.equal(key, 'storageUnreadable');
  assert.equal(errorKey(new Error('Untranslated browser error'), 'storageReadFailed'), 'storageReadFailed');
  for (const language of languages) {
    assert.ok(translate(language, key).length > 20);
    const status = translate(language, 'dayCompleted', { day: 1 });
    assert.match(status, /1/);
    assert.doesNotMatch(status, /\{/);
    buildPrayer(snapshot.days[0].roleType, language);
    getAffirmationForDay(1, language);
    assert.equal(JSON.stringify(state), saved);
    assert.deepEqual(parseJourney(saved), state);
  }
});
