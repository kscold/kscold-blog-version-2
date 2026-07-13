export interface AdminNightStep {
  id: string;
  title: string;
  description: string;
}

export interface AdminNightOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description: string;
}

export interface AdminNightProgramPhase {
  id: string;
  label: string;
  title: string;
  description: string;
  state: 'active' | 'next' | 'later';
}

export interface AdminNightProgramAgendaItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}

export interface AdminNightProgramTimelineItem {
  time: string;
  title: string;
  goal: string;
}
