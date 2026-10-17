# Render Hosting Recommendation Report

Date: March 27, 2026
Project: Heal Mental Health Support Platform

## Executive Summary

We recommend **Render** as the next hosting platform for the Heal backend and database as the project moves beyond the MVP stage.

The current MVP is hosted on free Netlify, which works well for a lightweight frontend launch. However, this workspace now contains functionality that goes beyond static site hosting:

- User authentication
- Protected API routes
- Chat sessions and message history
- Mood tracking and dashboard data
- Crisis support workflows
- AI integrations
- A future path to support a Flutter mobile app

Because of these needs, the project now benefits from a hosting platform that can support a production API, persistent data, managed databases, and easier scaling. Render is the best fit for that next phase because it offers a strong balance of affordability, simplicity, and growth readiness.

## Current Technical Context

The workspace shows a split architecture:

- A **Next.js frontend** configured as a static export in [next.config.js](/home/bigman/Desktop/hackathon-heal/next.config.js#L3)
- A **Go backend** intended for standalone deployment in [backend/main.go](/home/bigman/Desktop/hackathon-heal/backend/main.go)
- A **NestJS backend** using SQLite in [server/src/app.module.ts](/home/bigman/Desktop/hackathon-heal/server/src/app.module.ts#L22)
- A frontend API client already pointing to a Render-hosted backend fallback in [lib/api.ts](/home/bigman/Desktop/hackathon-heal/lib/api.ts#L1)
- Existing Render deployment configuration in [backend/render.yaml](/home/bigman/Desktop/hackathon-heal/backend/render.yaml#L1)

This means the codebase already aligns naturally with a deployment model where:

- the frontend stays on low-cost static hosting
- the backend runs as a dedicated web service
- the database is managed separately and scaled cleanly

## Why We Are Moving Beyond Free Netlify

Free Netlify is suitable for an MVP landing page or a mostly static frontend. It becomes less ideal when the application starts depending on backend state, authentication, persistent user records, and scaling-sensitive functionality.

For Heal, the platform is no longer just a website. It is becoming a product with:

- ongoing user sessions
- persistent records
- private and sensitive data flows
- AI-assisted interactions
- future multi-client support across web and mobile

This type of application needs infrastructure designed for backend reliability, persistent storage, and controlled scale-up.

## Why Render Was Chosen

### 1. Strong Fit for the Current Architecture

Render works well with the architecture already present in this repository.

- The frontend can remain statically hosted at low cost.
- The backend can run as a standard web service.
- A managed Postgres database can replace SQLite for production readiness.

This avoids forcing the whole system into a serverless-only model and reduces rework.

### 2. Easy Scaling Path

Render provides a clear path from MVP to production:

- start with a single web service
- attach a managed database
- increase CPU/RAM as traffic grows
- move to autoscaling on higher tiers if needed

This is a practical upgrade path for a startup or hackathon project that expects gradual growth rather than immediate enterprise traffic.

### 3. Better for Persistent Backend Workloads

Heal includes chat history, user data, mood logs, and support resources. These are not ideal fits for purely ephemeral or frontend-centric hosting models.

Render supports:

- always-on backend services
- managed Postgres
- persistent disks
- health checks
- logs and operational visibility

That makes it a better platform for a backend that needs reliability and persistence.

### 4. Good Cost-to-Stability Ratio

Render is not the cheapest option in every possible case, but it is one of the best-value options for a small production system.

A practical starting point is:

- Static frontend: free or very low cost
- Backend web service: about $7/month
- Managed Postgres: about $6/month

This makes the expected starting production cost roughly **$13/month and up**, which is still affordable while being more production-ready than an MVP-only setup.

### 5. Better Long-Term Structure for Mobile Expansion

If Heal later adds a Flutter mobile app, Render remains a good backend choice.

The backend can serve:

- the current web frontend
- a future Flutter mobile app
- any future admin dashboard or partner integrations

This is possible because Render hosts the backend as a normal HTTPS API service rather than tying it only to one frontend runtime.

## Comparison With Railway

Railway was a strong alternative and remains a valid option.

### Why Railway Was Considered

- fast setup
- low entry cost
- good developer experience
- simple monorepo deployment flow

### Why Render Was Preferred

- more predictable production structure
- stronger fit for a stable web service plus managed database model
- easier to explain as a scaling platform for a product that is becoming more operationally serious
- clearer path for managed infrastructure as the app grows

In short:

- **Railway** is excellent for fast, low-friction deployment
- **Render** is better for this project’s next phase of stable, scalable backend hosting

## Risks and Tradeoffs

Choosing Render does not remove all infrastructure work. A few important follow-up improvements are still needed.

### 1. Database Migration

The current backend code still uses SQLite in places, including [server/src/app.module.ts](/home/bigman/Desktop/hackathon-heal/server/src/app.module.ts#L22).

For real scaling, the production backend should move to **Postgres**.

Why this matters:

- SQLite is not ideal for concurrent production workloads
- scaling is easier with a managed network database
- backups, durability, and future mobile growth are better supported

### 2. Security Cleanup

The codebase includes client-side AI integrations and public environment variable patterns that should be reviewed before broader production rollout.

The long-term goal should be:

- keep sensitive keys server-side where possible
- let the backend own protected AI calls
- reduce exposure of secrets in public frontend environments

### 3. Deployment Consistency

The current Netlify and Next.js configuration should be cleaned up so the frontend deployment strategy is fully consistent with the chosen architecture.

## Recommended Deployment Model

### Phase 1: Immediate Upgrade

- Keep the frontend on Netlify or move it later to Render Static Site
- Deploy the Go backend on Render
- Configure environment variables in Render
- Point `NEXT_PUBLIC_API_URL` to the Render backend

### Phase 2: Production Hardening

- Migrate from SQLite to Render Postgres
- tighten CORS and auth configuration
- move sensitive AI access behind backend endpoints
- add monitoring and health checks

### Phase 3: Scale-Up Readiness

- resize the backend service as usage grows
- move to autoscaling tier if traffic requires it
- support Flutter and other clients from the same API

## Final Recommendation

We choose **Render** because it provides the best balance of:

- affordability
- backend reliability
- managed database support
- easier growth from MVP to production
- compatibility with future web and mobile clients

For the Heal platform, Render is the most practical next step after free Netlify. It supports the product as it evolves from a hackathon MVP into a real, scalable application.

## Sources

- Render Pricing: https://render.com/pricing
- Render Persistent Disks Docs: https://render.com/docs/disks
- Netlify Pricing: https://www.netlify.com/pricing
- Netlify Next.js Docs: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- Vercel Pricing: https://vercel.com/pricing
- Vercel Storage Docs: https://vercel.com/docs/storage
- Fly.io Pricing: https://fly.io/docs/about/pricing/
