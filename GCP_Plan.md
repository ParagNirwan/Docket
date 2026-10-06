# Docket on GCP — Learning & Deployment Plan

Goal: take Docket from "runs locally via Aspire" to "actually deployed and
reachable on the internet," using this as the vehicle to genuinely learn GCP
and DevOps fundamentals — not just click through a tutorial, but understand
each piece well enough to explain it in an interview.

Budget: the $300 / 90-day free trial credit covers everything in this plan
comfortably if followed in order, with Phase 0's budget alert as a safety net.

---

## Phase 0 — Account setup & safety net (do this first, before anything else)

- [ ] Create a GCP account, start the free trial ($300 / 90 days)
- [ ] Create a dedicated GCP **Project** for Docket (a Project is GCP's
      top-level container for all resources belonging to one thing — think
      of it like a workspace, similar in spirit to how a tenant isolates
      data in Docket itself)
- [ ] Set up a **Budget Alert**: Billing → Budgets & alerts → create a
      budget of e.g. $20, with email alerts at 50%/90%/100%. This emails
      you well before you're anywhere near real spend — set this up before
      creating a single other resource
- [ ] Install the `gcloud` CLI tool locally (free) — this is how you'll
      interact with GCP from your terminal, similar in spirit to how
      `dotnet` is the CLI for .NET

## Phase 1 — Core concepts crash course (conceptual, no building yet)

Understand these five ideas before touching anything else — everything
later builds on them:
- [ ] **Project** — the container for all your resources (billing,
      permissions, and resources are scoped to one)
- [ ] **IAM (Identity and Access Management)** — who is allowed to do what.
      This is the cloud-scale version of the `TenantAuthorizationService`
      role checks you already built — same underlying idea, applied to
      cloud infrastructure instead of your own app's data
- [ ] **Region / Zone** — a Region is a geographic area (e.g.
      `us-central1`), a Zone is a specific datacenter within it. Where you
      deploy affects latency and sometimes cost
- [ ] **Service Account** — a non-human "identity" your deployed app uses
      to talk to other GCP services (e.g. your API needs a Service Account
      with permission to read/write a specific Cloud Storage bucket)
- [ ] **Billing** — how usage translates to cost; understand the free tier
      vs. trial credit distinction from Phase 0

## Phase 2 — Containers to the cloud: Artifact Registry

- [ ] Create an **Artifact Registry** repository (GCP's equivalent of
      Docker Hub, but private to your project) — this is where your built
      Docker images will live
- [ ] Manually build and push the `Docket.Api` Docker image to it using
      `gcloud` and `docker` CLI commands — the goal here is understanding
      the build → tag → push flow by hand, before automating it later

## Phase 3 — Deploy the API: Cloud Run

- [ ] Deploy the pushed `Docket.Api` image to **Cloud Run** (runs
      containers, scales to zero when idle — you pay only when it's
      actually handling requests)
- [ ] Get a real public HTTPS URL for your API
- [ ] Understand environment variables / secrets injection in Cloud Run —
      how your JWT signing key gets to the deployed app without being
      baked into the Docker image

## Phase 4 — Real managed database: Cloud SQL

- [ ] Create a **Cloud SQL for PostgreSQL** instance
- [ ] Point `Docket.Api`'s connection string (via Cloud Run environment
      config) at Cloud SQL instead of your local Aspire-managed Postgres
- [ ] Run your EF Core migrations against the real Cloud SQL instance
- [ ] Understand Cloud SQL's networking model (public IP + authorized
      networks, vs. the more secure private-IP/VPC approach) — start with
      the simpler option, note the more secure one for later

## Phase 5 — File storage: Cloud Storage

- [ ] Create a **Cloud Storage bucket** for uploaded documents
- [ ] Update the upload endpoint's storage logic so `BlobRef` can point at
      a Cloud Storage object instead of a local disk path — this is the
      exact "swap the implementation behind BlobRef" moment we designed
      for back when we first built the Archive feature
- [ ] Set up a Service Account with narrowly-scoped permission (only this
      bucket, only read/write) for `Docket.Api` to use

## Phase 6 — Deploy the frontend

- [ ] Build `Docket.Client` for production (`npm run build`)
- [ ] Deploy the built static files — either as a second Cloud Run service
      (serving static files via a tiny web server) or via **Cloud Storage +
      Cloud CDN** (a common, cheaper pattern for static frontends)
- [ ] Point the frontend's `VITE_API_URL` at the real deployed Cloud Run
      API URL from Phase 3

## Phase 7 — Automate it: CI/CD

- [ ] Set up GitHub Actions (or **Cloud Build**, GCP's native option) so
      pushing to `main` automatically builds and deploys both the API and
      frontend — closing the loop from "manual gcloud commands" (Phase 2-3)
      to "real automated deployment pipeline"

## Phase 8 — Secrets done properly

- [ ] Move the JWT signing key (and any other secret) into **Secret
      Manager** instead of a plain environment variable — understand why
      this is a meaningfully different/better security posture

## Phase 9 — Observability basics

- [ ] Explore **Cloud Logging** — see your API's real logs centralized,
      searchable, from the deployed environment
- [ ] Set up one basic **Cloud Monitoring** alert (e.g. error rate spike)

---

## Stretch goals (optional, after the above is solid)
- [ ] Terraform — define all of the above as code instead of clicking
      through the console, the real "Infrastructure as Code" DevOps skill
- [ ] A custom domain + managed SSL cert for the deployed app
- [ ] GKE (Kubernetes) — a deliberately heavier alternative to Cloud Run,
      worth understanding conceptually even if Cloud Run remains the
      better fit for this project's actual scale

---

## Ground rules while working through this
- Check the GCP Billing dashboard after each phase — build the habit of
  knowing what you're spending, not just trusting the budget alert alone.
- Tear down / delete resources you're not actively using between sessions
  where practical (especially Cloud SQL, which bills by the hour whether
  you're using it or not) — Cloud Run scaling to zero means it naturally
  costs nothing when idle, Cloud SQL does not.
- Treat each phase the same way we've built every feature in this
  project: one step at a time, verify it actually works before moving on,
  don't trust that something "should" work without checking.