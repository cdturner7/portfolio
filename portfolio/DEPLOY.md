# Deploying to Google Cloud Run

The app is a stateless Spring Boot server with no database and no configuration. Cloud Run
runs it as a container, scales to zero when idle (so a personal-traffic portfolio costs
~nothing), and provides HTTPS + custom domains.

## One-time setup

1. Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install) and sign in:
   ```
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
2. Enable the APIs:
   ```
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
   ```

## Deploy

From the `portfolio/` directory (the one with the `Dockerfile`):

```
gcloud run deploy portfolio \
  --source . \
  --region us-east1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0
```

Cloud Build builds the image from the `Dockerfile`, pushes it to Artifact Registry, and
rolls out a revision. The command prints the service URL
(`https://portfolio-xxxxx-ue.a.run.app`) — verify it, then attach the domain.

To ship updates later, re-run the same command (or wire up continuous deployment: in the
Cloud Run console, "Edit & deploy new revision" → "Continuously deploy from a repository"
creates a Cloud Build trigger on push).

## Custom domain: collinturner.com

1. Verify ownership of `collinturner.com` in
   [Google Search Console](https://search.google.com/search-console) (once).
2. Map both the apex and `www`:
   ```
   gcloud beta run domain-mappings create --service portfolio --domain collinturner.com     --region us-east1
   gcloud beta run domain-mappings create --service portfolio --domain www.collinturner.com --region us-east1
   ```
3. Add the DNS records the command prints at your registrar:
   - apex `collinturner.com` → the shown `A` and `AAAA` records
   - `www` → the shown `CNAME` (`ghs.googlehosted.com.`)
4. TLS certificates are provisioned automatically once DNS resolves (minutes to ~an hour).

> Alternative for apex + CDN + multiple backends later: front the service with a global
> external HTTPS load balancer instead of domain mappings. Not needed for a single service.

## Notes

- `application.properties` sets `server.port=${PORT:8080}`; Cloud Run injects `PORT`.
- JVM flags for the small instance are baked into the image
  (`-XX:MaxRAMPercentage=75 -XX:+UseSerialGC`). Bump `--memory` to `1Gi` if you see OOMs.
- Cold start after idle is ~2–4s. Set `--min-instances 1` (small always-on cost) to remove it.
- Logging is console-only (`logback-spring.xml`); Cloud Run ships stdout/stderr to Cloud Logging automatically.
