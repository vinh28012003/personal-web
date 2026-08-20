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

  intro:
    "I build the parts of a system that have to stay up — event loops, replication, caching layers, and the pipelines that move data between services. Most of my work is measured in the difference between the number before and the number after.",
};
