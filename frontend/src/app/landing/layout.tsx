import TopBar from "@/components/landing/TopBar";
import Footer from "@/components/landing/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
