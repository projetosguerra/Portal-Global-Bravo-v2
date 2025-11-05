'use server';

import { cookies } from 'next/headers';
import { auth as sdkAuth } from '@pgb/sdk';

const MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === '1';

export async function loginAction(form: { email: string; password: string }) {
  try {
    const session = await sdkAuth.login(form.email, form.password);
    if (MOCK) {
      (await cookies()).set('pgb_session', session.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 60 * 60,
      });
    }
    return { ok: true, redirectTo: '/dashboard' };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Falha ao entrar' };
  }
}

export type RegisterInput = {
  cnpj?: string;
  name: string;
  email: string;
  password: string;
};

export async function registerAction(form: RegisterInput) {
  try {
    const session = await sdkAuth.register(form);
    if (MOCK) {
      (await cookies()).set('pgb_session', session.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 60 * 60,
      });
    }
    return { ok: true, redirectTo: '/dashboard' };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Falha ao cadastrar' };
  }
}