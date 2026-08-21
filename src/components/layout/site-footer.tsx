import { profile } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-rule px-5 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 font-mono text-label uppercase text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {profile.name} · {profile.graduation}
        </p>
        <p>Built with Next.js. Hosted on Vercel.</p>
      </div>
    </footer>
  );
}
