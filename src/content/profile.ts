import type { Profile } from "./types";

export const profile: Profile = {
  name: "Vinh Tran",
  role: "Backend / Infrastructure Engineer",
  school: "Purdue University",
  graduation: "BS Computer Science, December 2025",
  email: "tranquangvinh2801@gmail.com",
  github: "https://github.com/vinh28012003",
  linkedin: "https://linkedin.com/in/vinhtran2801",
  resumePath: "/resume/vinh-tran-resume.pdf",

  // Hard-broken on purpose. At wdth 125 / weight 900 the full string is
  // ~437px and would overflow a 375px viewport if left to wrap naturally.
  heroLines: ["VINH", "TRAN"],

  /**
   * Reads as a progression: what he builds, the constraint he holds it to,
   * then the tradeoff.
   *
   * "Fast by default, durable on request" is not a slogan — it is what the
   * WAIT sync barrier in Redis Lite actually does. Asynchronous replication
   * keeps the system available during a partition; WAIT is the opt-in path
   * for a caller that needs the stronger guarantee. Stating the choice is a
   * better signal than naming the theorem behind it.
   */
  strapline: [
    "Idea to product",
    "Simple but scalable",
    "Fast by default",
    "Durable on request",
  ],
};
