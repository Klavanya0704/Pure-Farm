import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "@/components/pages";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Product ${params.id} | PureFarm` },
      {
        name: "description",
        content:
          "PureFarm product details, price, seller, availability, cart, and related products.",
      },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  const { id } = Route.useParams();
  return <ProductDetailPage id={id} />;
}
