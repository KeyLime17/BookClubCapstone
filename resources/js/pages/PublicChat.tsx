import React from 'react';
import PublicChatListener from '@/components/PublicChatListener';

export default function PublicChatTest() {
  // Change this to a valid public club ID from your database
  const publicClubId = 1;

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-2">Public Chat Listener</h1>
      <p>Open the console and post a message to this club to see live events.</p>

      <PublicChatListener clubId={publicClubId} />
    </div>
  );
}
