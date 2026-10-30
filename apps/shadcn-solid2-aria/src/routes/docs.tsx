import { createFileRoute } from "@tanstack/solid-router";

import { DocsLayout } from "../components/docs/docs-layout";

export const Route = createFileRoute("/docs")({ component: DocsLayout });
