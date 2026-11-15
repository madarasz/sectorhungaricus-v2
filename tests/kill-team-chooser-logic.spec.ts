import { test, expect } from './fixtures';
import { Answers, FACTION_TREE, answersFromSearch, buildSearch, matchesAnswers } from '@/components/content-blocks/kill-team-chooser/filters';
import { getLegality } from '@/components/content-blocks/kill-team-chooser/legality';
import type { KillTeam, KillTeamStyle } from '@/types/content';
import { TestKillTeam, chooserLabels, findKillTeam, killTeams } from './helpers/content';

// These tests check the filter and legality logic without a browser; the chooser spec checks that the page uses it

const NOW = new Date();
const isLegal = (team: TestKillTeam, now = NOW) => getLegality(team.legal_until, now) !== 'declassified';
const matches = (team: TestKillTeam, answers: Answers) => matchesAnswers(team as KillTeam, answers, NOW);
const has = (team: TestKillTeam, ...factions: string[]) => factions.every((f) => team.factions.includes(f));
const hasNone = (team: TestKillTeam, ...factions: string[]) => factions.every((f) => !team.factions.includes(f));
const largestSize = (team: TestKillTeam) => team.operatives ?? team.operatives_max ?? 0;
const smallestSize = (team: TestKillTeam) => team.operatives ?? team.operatives_min ?? 0;

test.describe('Kill Team chooser filters', () => {
  test('multiple main factions match teams of any selected faction', () => {
    const imperiumTeam = findKillTeam('legal imperium, not xenos', (t) => isLegal(t) && has(t, 'imperium') && hasNone(t, 'xenos'));
    const xenosTeam = findKillTeam('legal xenos', (t) => isLegal(t) && has(t, 'xenos'));
    const chaosOnlyTeam = findKillTeam('legal chaos, not imperium or xenos', (t) => isLegal(t) && has(t, 'chaos') && hasNone(t, 'imperium', 'xenos'));
    const answers: Answers = { faction: ['imperium', 'xenos'] };

    expect(matches(imperiumTeam, answers)).toBe(true);
    expect(matches(xenosTeam, answers)).toBe(true);
    expect(matches(chaosOnlyTeam, answers)).toBe(false);
  });

  test('sub faction matches only teams that also have a selected main faction with it', () => {
    // Sub faction of both chaos and imperium, with a team of each main faction only
    const sharedSub = FACTION_TREE.chaos.find((sub) =>
      FACTION_TREE.imperium.includes(sub) &&
      killTeams().some((t) => isLegal(t) && has(t, 'chaos', sub) && hasNone(t, 'imperium')) &&
      killTeams().some((t) => isLegal(t) && has(t, 'imperium', sub) && hasNone(t, 'chaos')))!;
    const chaosTeam = findKillTeam(`legal chaos ${sharedSub}`, (t) => isLegal(t) && has(t, 'chaos', sharedSub) && hasNone(t, 'imperium'));
    const imperiumTeam = findKillTeam(`legal imperium ${sharedSub}`, (t) => isLegal(t) && has(t, 'imperium', sharedSub) && hasNone(t, 'chaos'));

    expect(matches(chaosTeam, { faction: ['chaos'], sub: [sharedSub] })).toBe(true);
    expect(matches(imperiumTeam, { faction: ['chaos'], sub: [sharedSub] })).toBe(false);
    expect(matches(imperiumTeam, { faction: ['chaos', 'imperium'], sub: [sharedSub] })).toBe(true);
  });

  test('sub faction in the URL without its main faction is ignored', () => {
    const xenosSub = FACTION_TREE.xenos.find((sub) => !FACTION_TREE.imperium.includes(sub))!;
    const answers = answersFromSearch(`?faction=imperium&sub=${xenosSub}`);

    expect(answers).toEqual({ faction: ['imperium'] });
    expect(buildSearch(answers, null)).toBe('?faction=imperium');
  });

  test('horde answer matches only teams with 11 or more operatives', () => {
    const hordeTeam = findKillTeam('legal horde', (t) => isLegal(t) && largestSize(t) >= 11);
    const smallTeam = findKillTeam('legal not horde', (t) => isLegal(t) && largestSize(t) < 11 && smallestSize(t) > 0);

    expect(matches(hordeTeam, { size: 'horde' })).toBe(true);
    expect(matches(smallTeam, { size: 'horde' })).toBe(false);
  });

  test('only one box answer hides teams that need more boxes', () => {
    const oneBoxTeam = findKillTeam('legal needing one box', (t) => isLegal(t) && t.boxes <= 1);
    const multiBoxTeam = findKillTeam('legal needing more boxes', (t) => isLegal(t) && t.boxes > 1);

    expect(matches(oneBoxTeam, { boxes: 'one' })).toBe(true);
    expect(matches(multiBoxTeam, { boxes: 'one' })).toBe(false);
  });

  test('selected play styles match only teams that have all of them', () => {
    const styleTeam = findKillTeam('legal with styles', (t) => isLegal(t) && t.style.length > 1);
    const [first, second] = styleTeam.style;
    const firstOnlyTeam = findKillTeam(`legal with ${first} without ${second}`, (t) => isLegal(t) && t.style.includes(first) && !t.style.includes(second));

    expect(matches(styleTeam, { style: [first, second] })).toBe(true);
    expect(matches(firstOnlyTeam, { style: [first] })).toBe(true);
    expect(matches(firstOnlyTeam, { style: [first, second] })).toBe(false);
  });

  test('URL answers keep only the known values', () => {
    const [style] = chooserLabels('en').styles.map((s) => s.value as KillTeamStyle);
    const answers = answersFromSearch(`?exp=new&exp=unknown&size=huge&style=${style}&style=unknown&faction=unknown&team=any`);

    expect(answers).toEqual({ exp: 'new', style: [style] });
    expect(buildSearch(answers, 'any')).toBe(`?exp=new&style=${style}&team=any`);
  });
});

test.describe('Kill Team legality', () => {
  // Teams are tournament legal until 30 November of their legal until year
  const legalUntil = Math.min(...killTeams().flatMap((t) => (t.legal_until === undefined ? [] : [t.legal_until])));

  test('is classified until 30 November a year before the legal until year', () => {
    expect(getLegality(legalUntil, new Date(`${legalUntil - 1}-03-01T12:00:00`))).toBe('classified');
    expect(getLegality(legalUntil, new Date(`${legalUntil - 1}-11-30T23:59:59`))).toBe('classified');
  });

  test('rotates soon from 1 December a year before until 30 November of the legal until year', () => {
    expect(getLegality(legalUntil, new Date(`${legalUntil - 1}-12-01T00:00:00`))).toBe('rotates_soon');
    expect(getLegality(legalUntil, new Date(`${legalUntil}-11-30T23:59:59`))).toBe('rotates_soon');
  });

  test('is declassified from 1 December of the legal until year, or without a legal until year', () => {
    expect(getLegality(legalUntil, new Date(`${legalUntil}-12-01T00:00:00`))).toBe('declassified');
    expect(getLegality(undefined, NOW)).toBe('declassified');
  });

  test('declassified teams match only with the declassified answer', () => {
    const team = findKillTeam(`legal until ${legalUntil}`, (t) => t.legal_until === legalUntil);
    const after = new Date(`${legalUntil}-12-01T12:00:00`);

    expect(matchesAnswers(team as KillTeam, {}, after)).toBe(false);
    expect(matchesAnswers(team as KillTeam, { legal: 'declassified' }, after)).toBe(true);
  });
});
