import AppLayout from "@/layouts/AppLayout";

export default function Catalog() {
  return (
    <AppLayout>
      <h1 className="mb-4 text-2xl font-semibold">Catalog</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">Sample Book Card</div>
        <div className="rounded-lg border bg-white p-4">Sample Book Card</div>
        <div className="rounded-lg border bg-white p-4">Sample Book Card</div>
      </div>
    </AppLayout>
  );
}
