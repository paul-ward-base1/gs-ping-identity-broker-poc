export const normalizeClosingQuestions = (content?: string | string[]): string[] =>
  (Array.isArray(content) ? content : content ? [content] : []).filter(Boolean);
