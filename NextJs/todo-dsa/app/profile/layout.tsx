export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>something</header>
      <section>{children}</section>
      <footer>Footer in layout profile</footer>
    </>
  );
}
