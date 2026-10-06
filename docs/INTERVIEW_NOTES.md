# Interview Notes

Use these prompts to prepare, not as memorized claims.

- Why is the AI model isolated from the Node API?
  - It keeps Python ML dependencies and model lifecycle separate from product/business logic and allows independent scaling/versioning.
- Why MongoDB?
  - Flexible event/document/candidate schemas map naturally to product data and keep the stack aligned with MERN.
- How would you productionize this?
  - Add authentication/RBAC, validation, rate limits, structured logging, metrics/tracing, persistent queues/vector stores where relevant, tests and cloud deployment.
- What would you test?
  - API contracts, model-service error paths, schema validation, deterministic business rules, UI states and end-to-end happy paths.
- What are the main ML risks?
  - Data drift, threshold/model quality, bias or hallucination depending on the project, latency and observability.
