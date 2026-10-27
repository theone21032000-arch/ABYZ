"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export function AuthControls() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <span aria-label="Loading authentication">…</span>;
  if (isSignedIn) return <UserButton />;

  return <>
    <SignInButton><button className="secondary">Sign in</button></SignInButton>
    <SignUpButton><button className="primary">Get started</button></SignUpButton>
  </>;
}
