import { Link } from "@tanstack/solid-router";
import UserMenu from "./user-menu";
import { For } from "solid-js";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/todos", label: "Todos" },
  ];

  return (
    <div>
      <div class="flex flex-row items-center justify-between px-2 py-1">
        <nav class="flex gap-4 text-lg">
          <For each={links}>
            {(link) => <Link to={link.to}>{link.label}</Link>}
          </For>
        </nav>
        <div class="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
