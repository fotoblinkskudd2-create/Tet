import { ProjectStatus } from './types';

export const PROJECT_STATUSES: ProjectStatus[] = ['planned', 'in_progress', 'completed', 'cancelled'];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'Planlagt',
  in_progress: 'Pågår',
  completed: 'Fullført',
  cancelled: 'Avlyst',
};
