import type { SkillGroup } from "./types";

export const skills: readonly SkillGroup[] = [
  {
    label: "Languages",
    items: ["Go", "C / C++", "Java", "Python", "TypeScript", "SQL", "Bash", "PromQL"],
  },
  {
    label: "Data & Messaging",
    items: [
      "PostgreSQL",
      "CockroachDB",
      "Redis",
      "Kafka",
      "Elasticsearch",
      "TimescaleDB",
      "Debezium",
    ],
  },
  {
    label: "Infrastructure",
    items: [
      "Docker",
      "Kubernetes",
      "Terraform",
      "AWS",
      "GCP",
      "GitHub Actions",
      "Linux",
      "Apache",
      "Grafana",
    ],
  },
  {
    label: "Frameworks & Protocols",
    items: [
      "Spring Boot",
      "Django",
      "FastAPI",
      "NestJS",
      "Node.js",
      "React",
      "gRPC",
      "Protobuf",
      "GraphQL",
      "REST",
      "SSE",
    ],
  },
  {
    label: "Testing",
    items: ["Pytest", "GoogleTest", "JUnit", "Jest", "Testcontainers", "Postman", "Swagger"],
  },
] as const;
