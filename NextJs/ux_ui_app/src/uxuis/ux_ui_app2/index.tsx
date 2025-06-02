export default function UXUIApp2() {
  return (
    <nav className="bg-black text-yellow-400 p-4 font-mono">
      <ul className="grid grid-cols-3 gap-4 text-center">
        <li><a href="/discover">🔍 Discover</a></li>
        <li><a href="/blog">📜 Blog</a></li>
        <li><a href="/settings">⚙️ Settings</a></li>
      </ul>
    </nav>
  );
}
