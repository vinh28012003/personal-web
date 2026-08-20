import type { Project } from "./types";

export const projects: readonly Project[] = [
  {
    slug: "redis-lite",
    name: "Redis Lite",
    tagline: "A Redis server built from scratch in C++",
    period: "January 2026 — February 2026",
    stack: ["C++", "Go", "Docker", "AWS EKS", "Terraform", "GitHub Actions"],
    hook: "A single-threaded epoll event loop that serves 375K pipelined operations per second, with automatic failover in under five seconds.",
    headlineMetrics: [
      {
        value: "375K",
        suffix: "+",
        unit: "pipelined ops/sec",
        plain:
          "375,000 or more pipelined SET and GET operations per second.",
      },
      {
        value: "5x",
        unit: "write throughput",
        plain:
          "Five times the pipelined write throughput after adding a dedicated IO writer thread.",
      },
      {
        value: "<5s",
        unit: "failover",
        plain: "Failover completes in under five seconds.",
      },
    ],
    sections: [
      {
        heading: "Why build a Redis",
        body: [
          "Reading about an event loop and writing one are different kinds of understanding. I wanted the second kind, so I implemented a Redis-compatible server in C++ and pushed it until the numbers stopped improving.",
          "The constraint I set was the one Redis itself accepts: a single thread handling all command execution. No locks around the keyspace, no per-connection threads, no shared mutable state to coordinate. Every performance gain has to come from doing less work per operation or from batching syscalls, which is exactly the discipline I wanted to practise.",
        ],
      },
      {
        heading: "The event loop",
        body: [
          "The core is a single-threaded epoll loop. Every client socket is registered once and the loop reacts to readiness rather than polling, so idle connections cost nothing beyond a file descriptor.",
          "The gain that mattered most was client buffering. Rather than issuing a write syscall per reply, replies accumulate in a per-client output buffer and flush once per loop iteration. Under a pipelined workload — where a client sends many commands without waiting for responses — this collapses thousands of small writes into a handful of large ones. That is the bulk of the 375K ops/sec figure.",
        ],
      },
      {
        heading: "Durability without stalling the loop",
        body: [
          "Fsync is slow and it does not belong on the thread that serves commands. I moved persistence onto a dedicated IO writer thread, so the event loop hands off work and immediately returns to serving clients.",
          "Clients that need a durability guarantee use a WAIT sync barrier, which blocks only the caller until its writes are acknowledged rather than blocking the server. Separating the two paths — fast by default, durable on request — produced a five-fold improvement in pipelined write throughput over the version that synced inline.",
        ],
      },
      {
        heading: "Replication and failover",
        body: [
          "Replication supports partial resync, so a replica that briefly disconnects catches up from an offset instead of pulling a full snapshot. Full resyncs are the expensive path, and avoiding them is what keeps a brief network blip from turning into a long rebuild.",
          "A separate health monitor written in Go watches the cluster and promotes a replica when the primary stops responding, switching roles automatically. End to end, failover completes in under five seconds.",
        ],
      },
      {
        heading: "Proving it works",
        body: [
          "The server has over 90% test coverage across GoogleTest for the C++ core and Pytest for protocol-level integration tests. A GitHub Actions pipeline builds, tests, and deploys to Kubernetes on every push, with the cluster itself defined in Terraform and running on AWS EKS.",
          "Coverage on a project like this is less about catching regressions than about being able to change the event loop at all. Without the protocol tests I would not have been willing to touch the buffering logic.",
        ],
      },
    ],
  },

  {
    slug: "cforge",
    name: "CForge",
    tagline: "Runtime configuration without redeploying",
    period: "March 2026 — April 2026",
    stack: ["JavaScript", "Python", "gRPC", "Protobuf", "Redis", "PostgreSQL", "React"],
    hook: "An open-source library that injects configuration into a running application in under 10 milliseconds — no restart, no redeploy.",
    headlineMetrics: [
      {
        from: "45ms",
        to: "8ms",
        value: "8ms",
        unit: "injection latency",
        plain:
          "Configuration injection latency reduced from 45 milliseconds to 8 milliseconds.",
      },
      {
        value: "<10ms",
        unit: "gRPC delivery",
        plain:
          "Sub-10-millisecond configuration delivery from server to application.",
      },
      {
        value: "2",
        unit: "registries published",
        plain: "Published to two package registries: npm and PyPI.",
      },
    ],
    sections: [
      {
        heading: "The problem",
        body: [
          "Changing a feature flag or a rate limit should not require a deploy. Most teams either rebuild and ship for a one-line change, or they wire up something ad hoc with an environment variable and a restart.",
          "CForge is a client library plus a server that lets an application read live key-value configuration at runtime. Clients exist for both JavaScript and Python, published to npm and PyPI respectively, so a polyglot stack can share one source of configuration truth.",
        ],
      },
      {
        heading: "Getting to 8 milliseconds",
        body: [
          "The first version read configuration straight from PostgreSQL on every request, which cost about 45 milliseconds. Postgres is the right place for the durable record — it also tracks which users own which projects — but it is the wrong place to serve a read that happens on a hot path.",
          "Adding Redis as the serving layer brought that to 8 milliseconds. Postgres remains the system of record; Redis holds the resolved configuration that clients actually read.",
        ],
      },
      {
        heading: "Why gRPC and Protobuf",
        body: [
          "Client-server communication runs over gRPC with Protobuf-encoded messages. Protobuf keeps the payloads small and, more usefully, makes the configuration schema explicit and versioned — both the JavaScript and Python clients generate from the same definition, so the two implementations cannot drift apart.",
          "Together with the Redis serving layer this delivers configuration from server to application in under 10 milliseconds.",
        ],
      },
      {
        heading: "Access control",
        body: [
          "Authentication goes through Google's Identity Platform rather than a hand-rolled implementation. PostgreSQL tracks the relationships between users and projects, which is what decides who can read or change a given key.",
          "Configuration that can be changed without a deploy is configuration that can be broken without a deploy, so knowing precisely who is allowed to touch what is part of the feature, not an afterthought.",
        ],
      },
    ],
  },
] as const;

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
