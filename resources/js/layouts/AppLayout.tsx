import { PropsWithChildren } from "react";
import { Link, usePage } from "@inertiajs/react";

export default function AppLayout({ children }: PropsWithChildren) {
  const page = usePage<any>();
  const user = page.props.auth?.user as
    | { name: string; email?: string; is_admin?: boolean }
    | undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-3 py-2">
          {/* LEFT: logo + main links */}
          <div className="flex items-center gap-4">
            {/* Hide BookClub text on very small screens */}
            <Link
              href="/"
              className="text-lg font-semibold text-primary hidden sm:inline"
            >
              BookClub
            </Link>

            <Link
              href="/"
              className="text-sm text-foreground/80 hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/catalog"
              className="text-sm text-foreground/80 hover:text-primary"
            >
              Catalog
            </Link>

            {/* Hide these extra links on mobile to avoid crowding */}
            <Link
              href="/clubs/private"
              className="hidden sm:inline text-sm text-foreground/80 hover:text-primary"
            >
              Private Clubs
            </Link>

            {!!user?.is_admin && (
              <>
                <Link href="/review" className="hover:underline">Review</Link>
                <Link href="/moderation" className="hover:underline">Moderation</Link>
              </>
            )}
          </div>

          {/* RIGHT: auth area */}
          <div className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                {/* Hide greeting on very small screens */}
                <span className="hidden sm:inline text-foreground/80">
                  Hi, {user.name}
                </span>
                
                <Link
                  href="/logout"
                  method="post"
                  as="button"
                  className="rounded px-3 py-1 border border-border hover:bg-card/80"
                >
                  Log out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-foreground/80 hover:text-primary"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded bg-primary px-3 py-1 text-primary-foreground hover:bg-primary/90"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
