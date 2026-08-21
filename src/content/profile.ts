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
   * A hero subhead, not a résumé summary — two different genres. The
   * headline, the kicker above it and the band below already state role,
   * school and availability, so anything restating those reads as
   * repetition. This says the one thing they cannot.
   *
   * The professional summary proper lives on /resume, where it belongs.
   */
  intro: "I love building systems that stay up under load.",
};
