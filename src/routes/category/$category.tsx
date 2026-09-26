import { createFileRoute } from "@tanstack/react-router";
import { CategoryProductsPage } from "@/components/pages";

export const Route = createFileRoute("/category/$category")({
  head: ({ params }) => {
    const rawCat = params.category || "fruits";
    const formatted = rawCat
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      meta: [
        { title: `${formatted} Products | PureFarm` },
        {
          name: "description",
          content: `Browse certified ${formatted} products and inputs on PureFarm.`,
        },
      ],
    };
  },
  component: CategoryRouteComponent,
});

function CategoryRouteComponent() {
  const { category } = Route.useParams();
  return <CategoryProductsPage categorySlug={category} />;
}
