import type { SupportSkill } from '../types/card';

/** 'YYYY-MM-DD' -> 'yy.MM' */
export function formatReleaseDate(releaseDate: string): string {
  const [year, month] = releaseDate.split('-');
  return `${year.slice(2)}.${month}`;
}

/** 'YYYY-MM-DD' -> 'YYYY.MM.DD' */
export function formatFullDate(releaseDate: string): string {
  return releaseDate.replace(/-/g, '.');
}

export function formatSkillLabel(skill: SupportSkill): string {
  if (skill.type === '쥬얼' && skill.gemColor && skill.gemSize) {
    return `쥬얼(${skill.gemColor}/${skill.gemSize})`;
  }
  return skill.type;
}

export function formatRowLabel(label: string, stage: number | null): string {
  return stage === null ? label : `${label} ${stage}차`;
}
