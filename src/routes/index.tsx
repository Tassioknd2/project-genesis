import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeMotionPostalCard } from "@/components/home/HomeMotionPostalCard";
import { HomeImpactStats } from "@/components/home/HomeImpactStats";
import { HomeFeaturesBento } from "@/components/home/HomeFeaturesBento";
import { HomeScheduleSimulator } from "@/components/home/HomeScheduleSimulator";
import { HomeTestimonials } from "@/components/home/HomeTestimonials";
import { HomeCtaSection } from "@/components/home/HomeCtaSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeContactModal } from "@/components/home/HomeContactModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agenda Cardio — Sistema de Agendamento para Cardiologia" },
      {
        name: "description",
        content:
          "O sistema de agendamento e fluxo de pacientes feito sob medida para a Cardiologia. Elimine o absenteísmo em Ecocardiograma, Holter e MAPA com confirmação ativa no WhatsApp.",
      },
      { property: "og:title", content: "Agenda Cardio — Sistema de Agendamento para Cardiologia" },
      {
        property: "og:description",
        content:
          "O sistema de agendamento e fluxo de pacientes feito sob medida para a Cardiologia. Redução de até 42% nas faltas com confirmação humanizada no WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [contactOpen, setContactOpen] = useState(false);

  const handleScrollToDemo = () => {
    const el = document.getElementById("vitrine");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      id="home-root"
      className="min-h-screen w-full bg-[#FBF7F0] font-sans text-[#2C2018] selection:bg-[#8E3E1E]/20 dark:bg-[#18140f] dark:text-[#f3ede1]"
    >
      <HomeHeader
        onOpenContact={() => setContactOpen(true)}
        onOpenDemo={() => setContactOpen(true)}
      />

      <main>
        <HomeHero onOpenDemo={() => setContactOpen(true)} onScrollToDemo={handleScrollToDemo} />

        <HomeMotionPostalCard />

        <HomeImpactStats />

        <HomeFeaturesBento />

        <HomeScheduleSimulator />

        <HomeTestimonials />

        <HomeCtaSection
          onOpenContact={() => setContactOpen(true)}
          onOpenDemo={() => setContactOpen(true)}
        />
      </main>

      <HomeFooter />

      <HomeContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
