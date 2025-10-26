import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import ChatBox from '@/components/ChatBox';

type Props = {
  club: { id: number; name: string; book_id: number; is_public: boolean };
};

export default function PrivateClubChat({ club }: Props) {
  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{club.name}</h1>
        <p className="text-sm text-gray-600">Private chat for this book</p>
      </div>

      {/* Reuse ChatBox against this club via its book_id; you’re a member so it will work */}
      <section className="mt-4">
        <ChatBox bookId={club.book_id} canPost />
      </section>
    </AppLayout>
  );
}
