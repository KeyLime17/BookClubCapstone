import React, { PropsWithChildren, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import NotificationBell from "@/components/NotificationBell";


export default function AppLayout({ children }: PropsWithChildren) {
  const page = usePage<any>();
  const user = page.props.auth?.user as
    | { id: number; name: string; email?: string; is_admin?: boolean }
    | undefined;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // local form state for modal
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const errors = (page.props as any).errors ?? {};
  const flash = (page.props as any).flash ?? {};

  const submitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    router.patch("/profile", { name, email }, { preserveScroll: true });
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    router.patch(
      "/profile/password",
      {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirm,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setNewPasswordConfirm("");
        },
      }
    );
  };

  const submitDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to permanently delete your account?")) {
      return;
    }

    setDeleting(true);

    router.delete("/profile", {
      data: { password: deletePassword },
      preserveScroll: true,
      onFinish: () => setDeleting(false),
    });
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative z-40 border-b bg-card/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Left side: brand + nav */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Mobile: BookClub is a toggle */}
            <button
              type="button"
              className="sm:hidden text-lg font-semibold"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              BookClub
            </button>

            {/* Desktop: BookClub is a normal link */}
            <Link
              href="/"
              className="hidden sm:inline text-lg font-semibold"
            >
              BookClub
            </Link>

            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/catalog" className="hover:underline">
                Catalog
              </Link>
              <Link href="/clubs/private" className="hover:underline">
                Private Clubs
              </Link>
              <Link href="/messages" className="hover:underline">
                Messages
              </Link>


              {!!user?.is_admin && (
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
          </div>

          {/* Right side: auth / profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Bell BEFORE username */}
                <NotificationBell />

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(true);
                    setName(user.name ?? "");
                    setEmail(user.email ?? "");
                  }}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm hover:bg-card/80"
                >
                  <span className="hidden sm:inline text-xs text-muted-foreground">
                    Logged in as
                  </span>
                  <span className="font-medium">{user.name}</span>
                </button>

                <Link
                  href="/logout"
                  method="post"
                  as="button"
                  className="hidden sm:inline rounded px-3 py-1 text-sm ring-1 ring-border hover:bg-card/80"
                >
                  Log out
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm hover:underline">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  Register
                </Link>
              </>
            )}
          </div>

        </nav>

        {/* Mobile dropdown nav (under header) */}
        {mobileNavOpen && (
          <div className="sm:hidden border-t border-border bg-card/95">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 text-sm">
              <Link
                href="/"
                className="py-1 hover:underline"
                onClick={closeMobileNav}
              >
                Home
              </Link>
              <Link
                href="/catalog"
                className="py-1 hover:underline"
                onClick={closeMobileNav}
              >
                Catalog
              </Link>
              <Link
                href="/clubs/private"
                className="py-1 hover:underline"
                onClick={closeMobileNav}
              >
                Private Clubs
              </Link>

              {!!user?.is_admin && (
                <>
                  <Link
                    href="/review"
                    className="py-1 hover:underline"
                    onClick={closeMobileNav}
                  >
                    Review
                  </Link>
                  <Link
                    href="/moderation"
                    className="py-1 hover:underline"
                    onClick={closeMobileNav}
                  >
                    Moderation
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      {/* PROFILE MODAL */}
      {user && profileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-card shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Your profile</h2>
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {flash.success && (
              <div className="mb-3 rounded border border-border bg-card px-3 py-2 text-xs text-foreground">
                {flash.success}
              </div>
            )}

            {/* Name + email */}
            <form onSubmit={submitProfile} className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
                  type="email"
                  value={email ?? ""}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email as string}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save profile
              </button>
            </form>

            {/* Change password */}
            <form onSubmit={submitPassword} className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold">Change password</h3>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Current password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                {errors.current_password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.current_password as string}
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    New password
                  </label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  />
                </div>
              </div>

              {(errors.password || errors.password_confirmation) && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password || errors.password_confirmation}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded border border-border px-3 py-2 text-xs hover:bg-card/80"
              >
                Update password
              </button>
            </form>

            {/* Delete account */}
            <form onSubmit={submitDelete} className="space-y-3">
              <h3 className="text-sm font-semibold text-red-600">
                Delete account
              </h3>
              <p className="text-xs text-muted-foreground">
                This will permanently remove your account and all data related
                to it. This action cannot be undone.
              </p>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Confirm with password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password as string}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={deleting}
                className="inline-flex w-full items-center justify-center rounded border border-red-400 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Yes, delete my account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setProfileOpen(false)}
              className="mt-4 w-full rounded px-3 py-2 text-sm border border-border hover:bg-card/80"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
