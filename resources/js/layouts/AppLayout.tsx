import { PropsWithChildren } from "react";
import { Link, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";

export default function AppLayout({ children }: PropsWithChildren) {
  const { auth } = usePage<PageProps>().props;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold">BookClub</Link>
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/catalog" className="hover:underline">Catalog</Link>
            <Link href="/clubs/private" className="hover:underline">Private Clubs</Link>
          </div>

          <div className="flex items-center gap-4">
            {auth?.user ? (
              <>
                <span className="text-sm">Hi, {auth.user.name}</span>
                <Link
                  href="/profile"
                  className="rounded px-3 py-1 text-sm ring-1 ring-gray-300 hover:bg-gray-100"
                >
                  Profile
                </Link>
                {/* NEW: logout as POST */}
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
