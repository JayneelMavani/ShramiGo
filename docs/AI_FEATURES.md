# ShramiGo AI Features

ShramiGo includes a lightweight, explainable AI recommendation layer that works with the existing PostgreSQL data and does not require an external AI API key.

## 1. Service intent detection

The customer can describe a problem in natural language, for example:

> My kitchen tap is leaking and water is coming out continuously.

The backend normalizes the text, compares relevant service vocabulary and aliases, and identifies the most suitable service from the active service catalogue.

## 2. Smart worker matching

After identifying the service, eligible workers are ranked using:

- Service/skill match
- Current availability
- Customer-to-worker distance when location is available
- Worker rating and review count
- Experience
- Worker service price (including custom worker price)
- Verification status

The API returns an explainable match score and the reasons that contributed to the ranking.

## API

`POST /api/ai/recommendations`

The endpoint is customer-authenticated. It accepts a problem description, optional service, optional maximum price, optional current coordinates and result limit.

This implementation is intentionally deterministic and explainable for the current MVP. A trained ML/LLM model can be added later without changing the customer-facing workflow.
