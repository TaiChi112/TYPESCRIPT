import { Background } from "./components/utilities/Background";
import { Header } from "./components/common/Header";
import { Section } from "./components/common/Section";
import { Footer } from "./components/common/Footer";
export default function Home() {
  return (
    <>
        <main style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Header />
          <Background />
        </main>
        <Section />
        <Footer />
    </>
  );
}
