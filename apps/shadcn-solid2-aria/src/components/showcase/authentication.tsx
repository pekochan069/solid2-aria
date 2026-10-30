/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/examples/authentication/page.tsx and components/user-auth-form.tsx.
 * Modified for Solid Aria: Solid 2 reactive form state, native validation, local Aria controls, and responsive layout.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { createSignal, Show } from "solid-js";

import { Button } from "../../registry/ui/button";
import { Input } from "../../registry/ui/input";
import { GithubMark } from "./github-mark";

export function Authentication() {
  const [email, setEmail] = createSignal("");
  const [sent, setSent] = createSignal(false);
  const [login, setLogin] = createSignal(false);

  return (
    <>
      <div class="showcase-mobile-preview">
        <img
          src="/examples/authentication-light.png"
          width="1280"
          height="843"
          alt="Authentication"
          class="gallery-light"
        />
        <img
          src="/examples/authentication-dark.png"
          width="1280"
          height="843"
          alt="Authentication"
          class="gallery-dark"
        />
      </div>
      <section class="showcase-auth">
        <aside>
          <a href="/" class="showcase-brand">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              width="24"
              height="24"
              aria-hidden="true"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>{" "}
            Acme Inc
          </a>
          <blockquote>
            “This library has saved me countless hours of work and helped me
            deliver stunning designs to my clients faster than ever before.” -
            Sofia Davis
          </blockquote>
        </aside>
        <div class="showcase-auth-content">
          <Button
            variant="ghost"
            class="showcase-auth-login"
            onPress={() => {
              setLogin((value) => !value);
              setSent(false);
            }}
          >
            {login() ? "Create account" : "Login"}
          </Button>
          <div class="showcase-auth-form">
            <div class="showcase-auth-heading">
              <h1>{login() ? "Welcome back" : "Create an account"}</h1>
              <p>
                Enter your email below to {login() ? "sign in to" : "create"}{" "}
                your account
              </p>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <label for="auth-email" class="sr-only">
                Email
              </label>
              <Input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                autocomplete="email"
                value={email()}
                onInput={(event) => {
                  setEmail(event.currentTarget.value);
                  setSent(false);
                }}
              />
              <Button type="submit" class="w-full">
                Sign In with Email
              </Button>
            </form>
            <Show when={sent()}>
              <p role="status">Demo sign-in link prepared for {email()}.</p>
            </Show>
            <div class="showcase-divider">
              <span>Or continue with</span>
            </div>
            <a
              class="showcase-button"
              href="https://github.com/login"
              target="_blank"
              rel="noreferrer"
            >
              <GithubMark /> GitHub
            </a>
            <p class="showcase-small">
              By clicking continue, you agree to our{" "}
              <a
                href="https://ui.shadcn.com/terms"
                target="_blank"
                rel="noreferrer"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://ui.shadcn.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
