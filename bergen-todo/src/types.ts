export type Priority = 'lav' | 'medium' | 'høy';

export type FilterType = 'alle' | 'ferdige' | 'uferdige';

export interface Todo {
  id: string;
  tittel: string;
  beskrivelse: string;
  prioritet: Priority;
  forfallsdato: string | null;
  ferdig: boolean;
  opprettet: string;
}
