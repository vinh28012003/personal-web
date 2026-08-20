import type { Experience } from "./types";

/** Most recent first. */
export const experience: readonly Experience[] = [
  {
    org: "Kihara Lab, Purdue University",
    role: "Visiting Scholar",
    location: "West Lafayette, Indiana",
    start: "April 2026",
    end: "Present",
    startISO: "2026-04",
    stack: ["Python", "Django", "pytest", "Apache", "Linux", "Git", "PyMOL"],
    bullets: [
      {
        text: "Verified a behavior-preserving refactor of a production Django cryo-EM application by re-running old and new logic across every production job record, then shipped it as small independently-reviewed pull requests.",
        metric: {
          value: "10,219",
          unit: "job records verified",
          plain:
            "Refactor verified against all 10,219 production job records.",
        },
      },
      {
        text: "Resolved recurring web-server outages by moving static-file serving off the Python application to Apache, freeing the WSGI worker pool for requests that actually needed it.",
      },
      {
        text: "Migrated an untracked production service into Git, replacing direct edits on the server with reviewed pull requests.",
      },
      {
        text: "Added automated pytest coverage to a codebase that had none, which is what made the refactor safe to attempt at all.",
      },
      {
        text: "Ramped up on structural biology with PyMOL, comparing AlphaFold2 and AlphaFold3 predictions against experimental PDB structures.",
      },
    ],
  },

  {
    org: "Dong Quang Group",
    role: "Software Engineer Intern",
    location: "Hanoi, Vietnam",
    start: "June 2025",
    end: "August 2025",
    startISO: "2025-06",
    endISO: "2025-08",
    stack: ["TypeScript", "TimescaleDB", "Redis", "Docker", "SSE"],
    bullets: [
      {
        text: "Led a team of five interns building a price service microservice that streams live stock prices over server-sent events.",
        metric: {
          value: "1,000",
          suffix: "+",
          unit: "concurrent clients",
          plain:
            "Scaled server-sent-event delivery to over 1,000 concurrent clients, supporting three times the user growth with no additional infrastructure.",
        },
      },
      {
        text: "Cut price-update delay by moving distribution onto Redis pub/sub, letting traders react to market movement sooner.",
        metric: {
          from: "500ms",
          to: "80ms",
          value: "80ms",
          unit: "price update delay",
          plain: "Price update delay reduced from 500 milliseconds to 80 milliseconds.",
        },
      },
      {
        text: "Cached candlestick data per symbol and time-frame so price charts load from memory rather than re-querying on every view.",
        metric: {
          from: "350ms",
          to: "65ms",
          value: "65ms",
          unit: "chart load",
          plain: "Chart loading latency reduced from 350 milliseconds to 65 milliseconds.",
        },
      },
      {
        text: "Optimized PostgreSQL queries by eliminating N+1 fetches and adding composite indexes.",
        metric: {
          from: "300ms",
          to: "165ms",
          value: "165ms",
          unit: "page load",
          plain: "Page load time reduced from 300 milliseconds to 165 milliseconds.",
        },
      },
    ],
  },

  {
    org: "Euro Vision Development Investment",
    role: "Software Engineer Intern",
    location: "Hanoi, Vietnam",
    start: "June 2024",
    end: "August 2024",
    startISO: "2024-06",
    endISO: "2024-08",
    stack: [
      "Java",
      "Spring Boot",
      "Kafka",
      "CockroachDB",
      "Debezium",
      "Elasticsearch",
      "Docker",
      "GCP",
    ],
    bullets: [
      {
        text: "Architected an e-commerce backend as separate order, payment, and inventory services on Spring Boot, deployed to GCP Cloud Run with rolling updates.",
      },
      {
        text: "Halved order processing time by replacing synchronous REST calls between services with Kafka-based event streaming.",
        metric: {
          from: "800ms",
          to: "400ms",
          value: "400ms",
          unit: "order processing",
          plain: "Order processing time reduced from 800 milliseconds to 400 milliseconds.",
        },
      },
      {
        text: "Built a change-data-capture pipeline with Debezium and Kafka to sync CockroachDB mutations into Elasticsearch, holding replication lag under a second.",
      },
      {
        text: "Introduced a Redis caching layer for product catalog and category endpoints.",
        metric: {
          from: "350ms",
          to: "85ms",
          value: "85ms",
          unit: "API response",
          plain:
            "Average API response time reduced from 350 milliseconds to 85 milliseconds.",
        },
      },
      {
        text: "Containerized every service with Docker, cutting local environment setup from two hours to ten minutes.",
        metric: {
          from: "2 hrs",
          to: "10 min",
          value: "10 min",
          unit: "environment setup",
          plain: "Developer environment setup reduced from two hours to ten minutes.",
        },
      },
    ],
  },

  {
    org: "Savvycom",
    role: "Software Engineer Intern",
    location: "Hanoi, Vietnam",
    start: "June 2023",
    end: "August 2023",
    startISO: "2023-06",
    endISO: "2023-08",
    stack: ["React", "Web3.js", "PostgreSQL", "AWS RDS", "GraphQL", "Grafana", "PromQL"],
    bullets: [
      {
        text: "Developed a data pipeline with Web3.js that fetches and processes on-chain transactions, powering real-time hedging analytics on DefiLlama.",
      },
      {
        text: "Designed a PostgreSQL schema on AWS RDS to handle read and write traffic at scale.",
        metric: {
          from: "320ms",
          to: "175ms",
          value: "175ms",
          unit: "query latency",
          plain: "Query latency reduced from 320 milliseconds to 175 milliseconds.",
        },
      },
      {
        text: "Built a React dashboard consuming GraphQL APIs, displaying queryable analytics with sub-second refresh from Redis.",
      },
      {
        text: "Configured Grafana dashboards with PromQL across all services, cutting how long it took to notice an incident.",
        metric: {
          from: "30 min",
          to: "5 min",
          value: "5 min",
          unit: "incident detection",
          plain:
            "Average incident detection time reduced from 30 minutes to 5 minutes.",
        },
      },
    ],
  },
] as const;
