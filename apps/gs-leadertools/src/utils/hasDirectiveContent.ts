interface DirectiveContentSource {
  directiveTitle?: string;
  directiveDescription?: { html?: string };
}

export const hasDirectiveContent = (source: DirectiveContentSource): boolean =>
  !!(source.directiveTitle?.trim() || source.directiveDescription?.html?.trim());
