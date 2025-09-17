import AppLayout from "@/layouts/AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <h1 className="mb-2 text-2xl font-semibold">Home</h1>
      <p className="text-sm text-gray-600">
        Welcome to BookClub. We’ll add a trending books here later.
      </p>
    </AppLayout>
  );
}
