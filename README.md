# portfolio

Collin Turner's personal portfolio / "about me" website.

A server-rendered web app built with **Spring Boot 3.5** (Java 21), **Thymeleaf** (with the
layout dialect) for templating, and **Bootstrap 5** for styling. The Maven project lives in
the [`portfolio/`](portfolio/) subdirectory.

## Requirements

- JDK 21+
- No local Maven needed — use the bundled wrapper (`mvnw` / `mvnw.cmd`)

## Run

```bash
cd portfolio
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

The site starts on <http://localhost:8080>.

## Build & test

```bash
cd portfolio
./mvnw clean package            # produces target/portfolio-0.0.1-SNAPSHOT.jar
./mvnw test
java -jar target/portfolio-0.0.1-SNAPSHOT.jar
```

## Configuration

| Property                | Env var                | Purpose                                             |
|-------------------------|------------------------|-----------------------------------------------------|
| `alphavantage.api.key`  | `ALPHAVANTAGE_API_KEY` | Key for the Alpha Vantage demo at `/alpha/{ticker}` |

The `/alpha` route degrades gracefully (shows "no data") when the key is unset.

## Routes

| Path              | Page                                                        |
|-------------------|------------------------------------------------------------|
| `/`               | Home                                                       |
| `/styleguide`     | Style guide — colors/fonts parsed live from `style.css`    |
| `/test`           | Scratch page                                               |
| `/alpha/{ticker}` | Alpha Vantage stock overview demo                          |

## Layout

```
portfolio/src/main/
├── java/com/collindturner/portfolio/
│   ├── controller/   IndexController, StyleGuideController, AlphaClientController, TestController
│   ├── service/      CSSService, ClassPathResourceService, AlphavantageService
│   ├── model/        Result<T>, WebStyles, Stock, Todos
│   ├── config/       CDTConfiguration
│   └── utils/        BaseProcessor (logging base class), CDTUtils
└── resources/
    ├── templates/    layouts/, fragments/, and one file per page
    └── static/       css/, scripts/, images/
```
