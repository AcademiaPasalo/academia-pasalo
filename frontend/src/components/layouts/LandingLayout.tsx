import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-gray-50">{children}</main>      
      <Footer />
    </>
  );
}
