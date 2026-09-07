import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppHeader } from "@/components/AppHeader";
import { WhatsAppDashboard } from "@/components/whatsapp/WhatsAppDashboard";
import { ScrollProgressHeart } from "@/components/ScrollProgressHeart";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({
    meta: [
      { title: "Agenda Cardio — Automação WhatsApp" },
      {
        name: "description",
        content:
          "Automação de confirmação de consultas por WhatsApp: QR code para conexão, disparos programados e respostas em tempo real.",
      },
      { property: "og:title", content: "Agenda Cardio — WhatsApp" },
      {
        property: "og:description",
        content: "Automação de WhatsApp e confirmações de consultas médicas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhatsAppPage,
});

function WhatsAppPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-paper font-sans text-ink selection:bg-amber/20">
        <AppHeader />
        <ScrollProgressHeart />
        <main className="pb-24 md:pb-12">
          <WhatsAppDashboard />
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}
