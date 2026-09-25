export interface FreezerItemAge {
  label: string;
  stale: boolean;
}

export function freezerItemAge(iso: string, now: Date = new Date()): FreezerItemAge {
  const then = new Date(`${iso}T00:00:00`);
  const days = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86_400_000));
  let label: string;
  if (days === 0) label = "aujourd'hui";
  else if (days === 1) label = 'hier';
  else if (days < 7) label = `il y a ${days} j`;
  else if (days < 60) label = `il y a ${Math.floor(days / 7)} sem.`;
  else if (days < 365) label = `il y a ${Math.floor(days / 30)} mois`;
  else label = `il y a ${Math.floor(days / 365)} an${days >= 730 ? 's' : ''}`;
  return { label, stale: days >= 90 };
}
