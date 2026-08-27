import { defaultProvider } from '@aws-sdk/credential-provider-node'; // V3 SDK.
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';

const REGION = process.env.AWS_REGION;
const ENDPOINT = process.env.OPENSEARCH_COLLECTION_ENDPOINT;

if (!REGION || !ENDPOINT) {
  throw new Error('AWS_REGION and OPENSEARCH_COLLECTION_ENDPOINT environment variables must be set.');
}

const createOpenSearchClient = () => {
  return new Client({
    ...AwsSigv4Signer({
      region: REGION,
      service: 'aoss',
      getCredentials: () => {
        const credentialsProvider = defaultProvider();
        return credentialsProvider();
      },
    }),
    node: ENDPOINT,
  });
};

/**
 * Maximum number of results to return in a single query.
 */
export const MAX_SIZE = 10000;

let client: Client | null = null;
/**
 * Returns a singleton OpenSearch client instance.
 */
export const getOpenSearchClient = () => {
  if (client == null) {
    client = createOpenSearchClient();
    console.log(`OpenSearch client created: ${ENDPOINT}`);
  }

  return client;
};
