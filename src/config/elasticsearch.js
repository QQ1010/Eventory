import { Client } from "@elastic/elasticsearch";
const elasticsearchUrl = process.env.ELASTICSEARCH_URL ?? "http://localhost:9200";
export const elasticsearchClient = new Client({
    node: elasticsearchUrl,
});
//# sourceMappingURL=elasticsearch.js.map