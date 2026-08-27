/**
 * OpenSearch bool/must filter clause shapes produced by {@link QueryTransformer}.
 * Kept narrow on purpose — these are the only two shapes the codebase emits today.
 */

export interface OpenSearchTermsClause {
  terms: { [field: string]: string[] };
}

export interface OpenSearchNestedTermsClause {
  nested: {
    path: string;
    query: OpenSearchTermsClause;
  };
}

export type OpenSearchFilterClause = OpenSearchTermsClause | OpenSearchNestedTermsClause;
