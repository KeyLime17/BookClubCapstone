import { PropsWithChildren } from "react";
import { Link, usePage } from "@inertiajs/react";

export default function AppLayout({ children }: PropsWithChildren) {
  const page = usePage<any>();
  const user = page.props.auth?.user as
    | { name: string; email?: string; is_admin?: boolean }
    | undefined;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold">BookClub</Link>
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/catalog" className="hover:underline">Catalog</Link>
            <Link href="/clubs/private" className="hover:underline">Private Clubs</Link>

            {user?.is_admin && (
              <>
                <Link href="/review" className="hover:underline">
                  Review
                </Link>
                <Link href="/moderation" className="hover:underline">
                  Moderation
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm">Hi, {user.name}</span>
                <Link
                  href="/profile"
                  className="rounded px-3 py-1 text-sm ring-1 ring-gray-300 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  href="/logout"
                  method="post"
                  as="button"
                  className="rounded px-3 py-1 text-sm ring-1 ring-gray-300 hover:bg-gray-100"
                >
                  Log out
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm hover:underline">Log in</Link>
                <Link
                  href="/register"
                  className="rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800"
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
