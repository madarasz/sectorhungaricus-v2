import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { KillTeam, KillTeamChooserLabels, KillTeamStyle } from '@/types/content';

// Tests read the expected texts from the CMS content, so content and translation changes do not break them

export type Locale = 'en' | 'hu';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface ContentFile {
  slug: string;
  data: Record<string, unknown>;
  body: string;
}

export function readContent(collection: string, slug: string, locale?: Locale): ContentFile {
  const fileName = locale ? `${slug}.${locale}.md` : `${slug}.md`;
  const { data, content } = matter(fs.readFileSync(path.join(CONTENT_DIR, collection, fileName), 'utf8'));
  return { slug, data, body: content };
}

export function readCollection(collection: string, locale?: Locale): ContentFile[] {
  const suffix = locale ? `.${locale}.md` : '.md';
  return fs
    .readdirSync(path.join(CONTENT_DIR, collection))
    .filter((file) => file.endsWith(suffix) && (locale || !/\.[a-z]{2}\.md$/.test(file)))
    .map((file) => readContent(collection, file.slice(0, -suffix.length), locale));
}

export function pageData(slug: string, locale: Locale): Record<string, string> {
  return readContent('pages', slug, locale).data as Record<string, string>;
}

export function subpageData(slug: string, locale: Locale): Record<string, unknown> {
  return readContent('subpages', slug, locale).data;
}

export function gameData(slug: string, locale: Locale): Record<string, string> {
  return readContent('games', slug, locale).data as Record<string, string>;
}

// Texts of the markdown headings at the given level
export function markdownHeadings(body: string, level: number): string[] {
  const pattern = new RegExp(`^#{${level}}\\s+(.+?)\\s*$`, 'gm');
  return [...body.matchAll(pattern)].map((match) => match[1]);
}

// Bold terms at the start of markdown list items
export function markdownListTerms(body: string): string[] {
  return [...body.matchAll(/^\s*[-*]\s+\*\*(.+?)\*\*/gm)].map((match) => match[1]);
}

// Plain text of the first paragraph, as the browser shows it
export function firstParagraphText(body: string): string {
  const paragraph = body.trim().split(/\n\s*\n/)[0];
  return paragraph
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\\(.)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Absolute http(s) link targets in the markdown fields of the subpage content blocks
export function subpageExternalLinks(slug: string, locale: Locale): string[] {
  const blocks = (subpageData(slug, locale).content_blocks as Array<Record<string, unknown>>) ?? [];
  const texts = blocks.flatMap((block) => [block.content, block.left_content, block.right_content]).filter((text): text is string => typeof text === 'string');
  return texts.flatMap((text) => [...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1]));
}

export function galleryImageCount(slug: string): number {
  const images = readContent('galleries', slug).data.images as unknown[] | undefined;
  return images?.length ?? 0;
}

// Tournaments on or after the given date, earliest first
export function upcomingTournaments(now: Date): Array<{ title: string; date: Date }> {
  return readCollection('tournaments')
    .map(({ data }) => ({ title: data.title as string, date: new Date(data.date as string) }))
    .filter(({ date }) => date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Replaces {name} placeholders of a CMS label
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);
}

// --- Kill Team chooser ---

export function chooserLabels(locale: Locale): KillTeamChooserLabels {
  const blocks = subpageData('kill-team-choose-a-team', locale).content_blocks as Array<{ type: string; labels?: KillTeamChooserLabels }>;
  const labels = blocks.find((block) => block.type === 'kill_team_chooser')?.labels;
  if (!labels) throw new Error(`No kill_team_chooser labels in the ${locale} choose-a-team subpage`);
  return labels;
}

export function chooserStyle(locale: Locale, value: KillTeamStyle): { label: string; description: string } {
  const style = chooserLabels(locale).styles.find((s) => s.value === value);
  if (!style) throw new Error(`No ${value} style label in ${locale}`);
  return style;
}

// "Label: description" text of a style, as tooltips and descriptions show it
export function chooserStyleText(locale: Locale, value: KillTeamStyle): string {
  const { label, description } = chooserStyle(locale, value);
  return `${label}: ${description}`;
}

// Style labels of a team in the CMS label order, as the page shows them
export function chooserStyleLabels(locale: Locale, styles: KillTeamStyle[]): string[] {
  return chooserLabels(locale).styles.filter((s) => styles.includes(s.value)).map((s) => s.label);
}

export function chooserFactionLabel(locale: Locale, value: string): string {
  const faction = chooserLabels(locale).factions.find((f) => f.value === value);
  if (!faction) throw new Error(`No ${value} faction label in ${locale}`);
  return faction.label;
}

// Faction labels of a team in the CMS label order, as the page shows them
export function chooserFactionLabels(locale: Locale, factions: string[]): string[] {
  return chooserLabels(locale).factions.filter((f) => factions.includes(f.value)).map((f) => f.label);
}

// Kill team fields that are stored only in the default locale file, the same as in src/lib/markdown.ts
const KILL_TEAM_SHARED_FIELDS = ['factions', 'operatives', 'operatives_min', 'operatives_max', 'boxes', 'box_type', 'store_boxes', 'tier', 'skill', 'style', 'legal_until', 'image', 'second_image'];
const KILL_TEAM_DEFAULT_LOCALE: Locale = 'en';

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

export type TestKillTeam = Pick<KillTeam, 'slug' | 'name' | 'factions' | 'boxes' | 'box_type' | 'skill' | 'style' | 'operatives' | 'operatives_min' | 'operatives_max' | 'legal_until' | 'boxes_note' | 'store_boxes'>;

// Reviewed teams, the same set that the chooser shows
export function killTeams(locale: Locale = KILL_TEAM_DEFAULT_LOCALE): TestKillTeam[] {
  const defaults = readCollection('killteams', KILL_TEAM_DEFAULT_LOCALE);
  return readCollection('killteams', locale)
    .filter(({ data }) => typeof data.reviewed === 'string' && data.reviewed.trim() !== '')
    .map(({ slug, data }) => {
      const defaultData = defaults.find((team) => team.slug === slug)?.data ?? {};
      const shared = Object.fromEntries(KILL_TEAM_SHARED_FIELDS.map((field) => [field, defaultData[field]]));
      const team = { ...data, ...shared } as Record<string, unknown>;
      return {
        slug,
        name: team.name as string,
        factions: (team.factions as string[]) ?? [],
        boxes: team.boxes as number,
        box_type: team.box_type as KillTeam['box_type'],
        skill: team.skill as KillTeam['skill'],
        style: (team.style as KillTeamStyle[]) ?? [],
        operatives: optionalNumber(team.operatives),
        operatives_min: optionalNumber(team.operatives_min),
        operatives_max: optionalNumber(team.operatives_max),
        legal_until: optionalNumber(team.legal_until),
        boxes_note: (team.boxes_note as string) || undefined,
        store_boxes: (team.store_boxes as KillTeam['store_boxes']) || undefined,
      };
    });
}

export function killTeam(slug: string, locale: Locale = KILL_TEAM_DEFAULT_LOCALE): TestKillTeam {
  const team = killTeams(locale).find((t) => t.slug === slug);
  if (!team) throw new Error(`No reviewed kill team ${slug}`);
  return team;
}

// First reviewed team that matches, to keep the tests independent of which teams have which data
export function findKillTeam(description: string, predicate: (team: TestKillTeam) => boolean): TestKillTeam {
  const team = killTeams().find(predicate);
  if (!team) throw new Error(`No reviewed kill team: ${description}`);
  return team;
}
