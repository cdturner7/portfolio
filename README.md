# portfolio

Collin Turner's personal portfolio / "about me" website &mdash; rendered to look like the
IntelliJ IDEA IDE. The homepage is an IDE shell: a project tree of "files" that open in
draggable, closable editor tabs, with content loaded on demand.

Built with **Spring Boot 4.1** (Java 21), **Thymeleaf** (layout dialect), a hand-rolled
vanilla-JS front end, and one CSS file approximating IntelliJ's "New UI" dark theme. The
Maven project lives in the [`portfolio/`](portfolio/) subdirectory.

The shell goes a fair way past looks: Search Everywhere (double-Shift), a tabbed bottom
tool window (Problems / TODO / Git log / Terminal), right-click context menus, Recent
Files + breadcrumbs, a Structure outline, a Settings dialog, notification balloons, an
`F1` shortcuts cheat-sheet, hash routing with working back/forward, an embedded
`Resume.pdf` viewer, `Skills.json` as a collapsible tree, a `mailto:`-composing contact
form, and a mobile drawer. The running list lives in the in-app `TODO.md`; shipped items
move to `Projects/portfolio-site.md`.

## Requirements

- JDK 21+
- No local Maven needed &mdash; use the bundled wrapper (`mvnw` / `mvnw.cmd`)

## Run

```bash
cd portfolio
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

The site starts on <http://localhost:8080> (`server.port` follows `$PORT` when set).

## Build & test

```bash
cd portfolio
./mvnw clean package            # produces target/portfolio-0.0.1-SNAPSHOT.jar
./mvnw test
java -jar target/portfolio-0.0.1-SNAPSHOT.jar
```

## Deploying

See [`portfolio/DEPLOY.md`](portfolio/DEPLOY.md) for Google Cloud Run (`Dockerfile` +
`gcloud` steps + attaching `collinturner.com`).

## How it works

- `IndexController` serves the IDE shell (`ide.html`) and renders the project tree from
  the `ProjectStructure` bean.
- Opening a file calls `GET /content?path=…`, which `ContentController` answers with a
  Thymeleaf fragment (`templates/pages/**`) injected into a cached editor pane.
- Open tabs, tab order, the active file, folder collapse state, panel sizes, theme and the
  terminal persist to `localStorage`; every file is deep-linkable with a `#/Experience.md`
  URL hash, so browser back/forward walk the open-file history (legacy `?file=` links are
  migrated on load).
- `ResumeController` serves `/resume` (a standalone, printable résumé page that the
  `Resume.pdf` tab embeds). `SeoController` serves `/robots.txt`, `/sitemap.xml`, and
  `/og.png` — a 1200×630 share card drawn with Java 2D and cached. `SeoAdvice` feeds the
  request host to every view as `${baseUrl}` for canonical / Open Graph URLs.
- `/styleguide` and `/test` remain as standalone pages; `.config/` in the tree surfaces
  them inside the IDE.

## Layout

```
portfolio/src/main/
├── java/com/collindturner/portfolio/
│   ├── controller/   IndexController, ContentController, ResumeController, SeoController,
│   │                 StyleGuideController, TestController
│   ├── config/       ProjectStructure (the project-tree definition), SeoAdvice
│   ├── service/      CSSService, ClassPathResourceService
│   ├── model/        ProjectNode, Result<T>, WebStyles, Todos
│   └── utils/        BaseProcessor (logging base class), CDTUtils
└── resources/
    ├── templates/    ide.html, layouts/, fragments/, pages/**
    └── static/       css/ (ide.css, style.css), scripts/ (ide.js, …), images/
```
