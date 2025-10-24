import PublicChatPoller from "@/components/PublicChatPoller";

export default function PublicChatTest() {
  const clubId = 1; // set a real public club id
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold"> Public Chat (Polling)</h1>
      <p>Open this page and POST a message to club {clubId}; it should appear within a couple seconds (logged in your network tab).</p>
      <PublicChatPoller clubId={clubId} />
    </div>
  );
}
