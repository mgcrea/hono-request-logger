# Hono Request Logger

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://www.npmjs.com/package/@mgcrea/hono-request-logger">
    <img src="https://img.shields.io/npm/v/@mgcrea/hono-request-logger.svg?style=for-the-badge" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/hono-request-logger">
    <img src="https://img.shields.io/npm/dt/@mgcrea/hono-request-logger.svg?style=for-the-badge" alt="npm total downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/hono-request-logger">
    <img src="https://img.shields.io/npm/dm/@mgcrea/hono-request-logger.svg?style=for-the-badge" alt="npm monthly downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/hono-request-logger">
    <img src="https://img.shields.io/npm/l/@mgcrea/hono-request-logger.svg?style=for-the-badge" alt="npm license" />
  </a>
  <br />
  <a href="https://github.com/mgcrea/hono-request-logger/actions/workflows/main.yaml">
    <img src="https://img.shields.io/github/actions/workflow/status/mgcrea/hono-request-logger/main.yaml?style=for-the-badge&branch=master" alt="build status" />
  </a>
  <a href="https://depfu.com/github/mgcrea/hono-request-logger">
    <img src="https://img.shields.io/depfu/dependencies/github/mgcrea/hono-request-logger?style=for-the-badge" alt="dependencies status" />
  </a>
</p>
<!-- markdownlint-enable MD037 -->

## Features

A lightweight HTTP request logging middleware for [Hono](https://hono.dev/) built on top of [@logtape/logtape](https://github.com/dahlia/logtape).

- Logs incoming requests and outgoing responses with method, path, status code, and latency.
- Color-coded status codes (2xx/3xx green, 4xx yellow, 5xx red) via [picocolors](https://github.com/alexeyraspopov/picocolors).
- Automatically skips noisy `/metrics` and `/healthz` endpoints.
- Picks log level from response status: `debug` for 2xx/3xx, `warn` for 4xx, `error` for 5xx.
- Ships with an opinionated ANSI color formatter (`prettyFormatter`) that understands logtape `requestId` context properties.
- Unicode-aware — falls back to ASCII arrows on terminals that don't support UTF-8.
- Built with [TypeScript](https://www.typescriptlang.org/) for static type checking with exported types along the library.

## Usage

```bash
npm install @mgcrea/hono-request-logger @logtape/logtape hono --save
# or
pnpm add @mgcrea/hono-request-logger @logtape/logtape hono
```

### Basic usage with Hono

```ts
import { Hono } from "hono";
import { configureLogger, httpLogger } from "@mgcrea/hono-request-logger";

await configureLogger();

const app = new Hono();

app.use("*", httpLogger());

app.get("/", (c) => c.text("Hello Hono!"));

export default app;
```

### Disabling incoming request logs

By default the middleware logs both the incoming request and the outgoing response. Pass `logIncoming: false` to only log responses:

```ts
app.use("*", httpLogger({ logIncoming: false }));
```

### Using the formatter with your own logtape configuration

If you already bootstrap logtape elsewhere, you can plug in the provided formatter directly:

```ts
import { configure, getConsoleSink } from "@logtape/logtape";
import { prettyFormatter } from "@mgcrea/hono-request-logger";

await configure({
  sinks: { console: getConsoleSink({ formatter: prettyFormatter }) },
  loggers: [{ category: [], sinks: ["console"], lowestLevel: "debug" }],
});
```

## Authors

- [Olivier Louvignes](https://github.com/mgcrea) <<olivier@mgcrea.io>>

## License

```txt
The MIT License

Copyright (c) 2026 Olivier Louvignes <olivier@mgcrea.io>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
