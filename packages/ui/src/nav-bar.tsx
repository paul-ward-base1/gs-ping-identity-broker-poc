"use client";

import Link from "next/link";

interface NavLink {
  href: string;
  label: string;
  adminOnly?: boolean;
}

interface NavBarProps {
  appName: string;
  links: NavLink[];
  user?: { name?: string | null; email?: string | null } | null;
  roles?: string[];
  accentColor?: string;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function NavBar({
  appName,
  links,
  user,
  roles = [],
  accentColor = "bg-green-700",
  onSignIn,
  onSignOut,
}: NavBarProps) {
  return (
    <nav className={`${accentColor} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {appName}
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            {links.filter((link) => !link.adminOnly || roles.includes("admin")).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
            ))}
          </div>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/80 hidden sm:inline">
                {user.name ?? user.email}
              </span>
              <button
                onClick={onSignOut}
                className="text-sm px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="text-sm px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
