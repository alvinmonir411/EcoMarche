type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-950">Order Details</h1>
      <p className="mt-3 text-stone-600">Order ID: {id}</p>
      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6">
        <p className="text-stone-600">
          Order information will appear here after backend connection.
        </p>
      </div>
    </section>
  );
}
