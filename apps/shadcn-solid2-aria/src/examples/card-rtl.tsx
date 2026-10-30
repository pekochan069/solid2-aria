/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/examples/aria/card-rtl.tsx.
 * Modified for Solid Aria: native Solid 2 JSX, reactive signals, local component imports, and Lucide icons.
 * Licensed under MIT. See ../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

import { Button } from "../registry/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../registry/ui/card";
import { Input } from "../registry/ui/input";
import { Label } from "../registry/ui/label";
import { useTranslation } from "./_support";
import type { Translations } from "./_support";

const translations = {
  ar: {
    dir: "rtl",
    values: {
      description: "أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك",
      email: "البريد الإلكتروني",
      emailPlaceholder: "m@example.com",
      forgotPassword: "نسيت كلمة المرور؟",
      login: "تسجيل الدخول",
      loginWithGoogle: "تسجيل الدخول باستخدام Google",
      password: "كلمة المرور",
      signUp: "إنشاء حساب",
      title: "تسجيل الدخول إلى حسابك",
    },
  },
  en: {
    dir: "ltr",
    values: {
      description: "Enter your email below to login to your account",
      email: "Email",
      emailPlaceholder: "m@example.com",
      forgotPassword: "Forgot your password?",
      login: "Login",
      loginWithGoogle: "Login with Google",
      password: "Password",
      signUp: "Sign Up",
      title: "Login to your account",
    },
  },
  he: {
    dir: "rtl",
    values: {
      description: "הזן את האימייל שלך למטה כדי להתחבר לחשבון שלך",
      email: "אימייל",
      emailPlaceholder: "m@example.com",
      forgotPassword: "שכחת את הסיסמה?",
      login: "התחבר",
      loginWithGoogle: "התחבר עם Google",
      password: "סיסמה",
      signUp: "הירשם",
      title: "התחבר לחשבון שלך",
    },
  },
} satisfies Translations;

export function CardRtl() {
  const { t } = useTranslation(translations, "ar");

  return (
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
        <CardAction>
          <Button variant="link">{t.signUp}</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div class="flex flex-col gap-6">
            <div class="grid gap-2">
              <Label for="email-rtl">{t.email}</Label>
              <Input
                id="email-rtl"
                type="email"
                placeholder={t.emailPlaceholder}
                required
              />
            </div>
            <div class="grid gap-2">
              <div class="flex items-center">
                <Label for="password-rtl">{t.password}</Label>
                <a
                  href="#"
                  class="ms-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {t.forgotPassword}
                </a>
              </div>
              <Input id="password-rtl" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter class="flex-col gap-2">
        <Button type="submit" class="w-full">
          {t.login}
        </Button>
        <Button variant="outline" class="w-full">
          {t.loginWithGoogle}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CardRtl;
