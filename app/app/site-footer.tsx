import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

/** Shared site footer used across all pages. */
export function SiteFooter() {
  return (
    <footer
      className="px-6 py-14"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
          {/* Brand Column */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/icon.png"
                alt={`${site.name} Logo`}
                width={28}
                height={28}
                className="w-7 h-7 rounded-lg object-contain"
              />
              <span className="text-sm font-semibold text-text-primary">
                {site.name}
              </span>
            </div>
            <p className="text-sm text-text-tertiary leading-relaxed">
              Production-grade skills for AI coding agents. Built by{" "}
              <a
                href="https://x.com/dqstartupbuild"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent transition-colors"
              >
                @dqstartupbuild
              </a>
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Navigate
              </p>
              <nav className="flex flex-col gap-2 text-sm text-text-secondary">
                <Link href="/" className="transition-colors hover:text-text-primary">
                  Home
                </Link>
                <Link href="/blog" className="transition-colors hover:text-text-primary">
                  Blog
                </Link>
                <a
                  href={site.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-text-primary"
                >
                  GitHub
                </a>
              </nav>
            </div>

            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Legal
              </p>
              <nav className="flex flex-col gap-2 text-sm text-text-secondary">
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-text-primary"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-text-primary"
                >
                  Terms
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div
          className="pt-6 text-center"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
