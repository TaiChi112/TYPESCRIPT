export default function Layout({ children }: { children: React.ReactNode }) {
    return <>
        <nav>Sub component blog</nav>
        {children}
        <footer>Sub component blog</footer>
    </>;
}