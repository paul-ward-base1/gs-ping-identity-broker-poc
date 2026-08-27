"use client";

interface LogoutButtonProps {
  onSignOut: () => void;
  className?: string;
}

export function LogoutButton({ onSignOut, className }: LogoutButtonProps) {
  return (
    <button
      onClick={onSignOut}
      className={className ?? "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"}
    >
      Sign Out
    </button>
  );
}
