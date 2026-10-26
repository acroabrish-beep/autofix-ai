import { RepairGuide, PossibleCause } from '../types';

/**
 * Technical matching logic to connect diagnostic outcomes to standardized repair guides.
 * This can be expanded to use fuzzy matching or keyword weights in future steps.
 */
export const findRelevantGuide = (cause: PossibleCause, guides: RepairGuide[]): RepairGuide | null => {
  if (!cause || !guides || guides.length === 0) return null;

  const causeTitle = cause.title.toLowerCase();

  // 1. Direct title/keyword match
  const directMatch = guides.find(g =>
    g.title.toLowerCase().includes(causeTitle) ||
    causeTitle.includes(g.title.toLowerCase())
  );
  if (directMatch) return directMatch;

  // 2. Category + Keyword match
  // This assumes cause descriptions might contain technical category names
  const categoryMatch = guides.find(g =>
    cause.description.toLowerCase().includes(g.category.toLowerCase()) &&
    cause.description.toLowerCase().includes(g.title.toLowerCase().split(' ')[0])
  );

  return categoryMatch || null;
};
