# Deploying to Google Cloud Run

The app is a stateless Spring Boot server with no database and no configuration. Cloud Run
runs it as a container, scales to zero when idle (so a personal-traffic portfolio costs
~nothing), and provides HTTPS + custom domains.

Live: <https://portfolio-970392287693.us-east1.run.app>
Project: `collinturner-portfolio` · region `us-east1` · service `portfolio`

## One-time setup

Already done for `collinturner-portfolio` (project created, billing linked, APIs enabled).
To reproduce in a fresh project:

1. Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install) and sign in:
   ```
   gcloud auth login
   gcloud config set project PROJECT_ID
   ```
2. Enable the APIs:
   ```
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
   ```

## Deploy

**Run this from inside the `portfolio/` directory** — the one holding the `Dockerfile`.
That matters: `gcloud run deploy --source .` only builds with our multi-stage `Dockerfile`
when a `Dockerfile` is present in the source dir; run from anywhere else and it silently
falls back to Buildpacks, which builds a different (and here, broken) image.

```
cd portfolio
gcloud run deploy portfolio \
  --project collinturner-portfolio \
  --source . \
  --region us-east1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0
```

Confirm the log line reads **"Building using Dockerfile"** (not "using Buildpacks"). Say
`y` if prompted to create the `cloud-run-source-deploy` Artifact Registry repo. Cloud Build
runs the Maven build (~4–7 min the first time), pushes the image, and rolls out a revision;
the command prints the service URL.

To ship updates later, re-run the same command from `portfolio/`. For push-to-deploy, wire
a Cloud Build trigger: Cloud Run console → the service → "Edit & deploy new revision" →
"Continuously deploy from a repository".

> Windows note: if `gcloud` isn't found, the SDK isn't on that shell's PATH yet. Use a
> fresh terminal, or call it by full path, e.g.
> `& "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" run deploy ...`

## Custom domain: collinturner.com

1. Verify ownership of `collinturner.com` in
   [Google Search Console](https://search.google.com/search-console) (once). The first
   `domain-mappings create` below fails with a link and the TXT record to add.
2. Map both the apex and `www`:
   ```
   gcloud beta run domain-mappings create --service portfolio --domain collinturner.com     --region us-east1 --project collinturner-portfolio
   gcloud beta run domain-mappings create --service portfolio --domain www.collinturner.com --region us-east1 --project collinturner-portfolio
   ```
3. Add the DNS records the command prints at your DNS host:
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
