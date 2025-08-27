import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, Show } from "solid-js";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();
  const navigate = Route.useNavigate();

  const privateData = useQuery(() => orpc.privateData.queryOptions());

  createEffect(() => {
    if (!session().data && !session().isPending) {
      navigate({
        to: "/login",
      });
    }
  });

  return (
    <div>
      <Show when={session().isPending}>
        <div>Loading...</div>
      </Show>

      <Show when={!session().isPending && session().data}>
        <h1>Dashboard</h1>
        <p>Welcome {session().data?.user.name}</p>
        <p>privateData: {privateData.data?.message}</p>
      </Show>
    </div>
  );
}
