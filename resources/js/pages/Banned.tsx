import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';

export default function Banned() {
  return (
    <AppLayout>
      <Head title="Account Banned" />
      <div className="max-w-xl mx-auto py-16 px-4 space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-red-700">Account Banned</h1>
        <p className="text-sm text-gray-700">
          Your account has been banned from BookClub.
        </p>
        <p className="text-sm text-gray-600">
          If you believe this was a mistake or would like to appeal, please
          contact the administration team.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Back to home
        </Link>
      </div>
    </AppLayout>
  );
}
