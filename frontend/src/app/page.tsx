import LandingLayout from "@/components/layouts/LandingLayout";
import HeroSection from "@/components/landing/HeroSection";
import PromiseSection from "@/components/landing/PromiseSection";
import ModalitiesSection from "@/components/landing/ModalitiesSection";
import CoursesSection from "@/components/landing/CoursesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ContactSection from "@/components/landing/ContactSection";

export default function Home() {
  return (
    <LandingLayout>
      <HeroSection />
      <PromiseSection />
      <ModalitiesSection />
      <CoursesSection />
      <TestimonialsSection />
      <ContactSection />
    </LandingLayout>
  );
}
