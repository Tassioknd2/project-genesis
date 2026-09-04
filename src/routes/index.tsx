import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, HeartPulse, MessageCircle, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import dashboardDesktop from "@/assets/dashboard-desktop.png.asset.json";
import appMobile from "@/assets/app-mobile.png.asset.json";
import pacientesDesktop from "@/assets/pacientes-desktop.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Agenda Cardio — Agenda e confirmação no WhatsApp para clínicas de cardiologia",
      },
      {
        name: "description",
        content:
          "Veja as telas reais do Agenda Cardio: painel do dia, confirmações automáticas no WhatsApp e cadastro de pacientes. 30 dias grátis para a sua clínica.",
      },
      {
        property: "og:title",
        content: "Agenda Cardio — Agenda e confirmação no WhatsApp",
      },
      {
        property: "og:description",
        content:
          "Painel do dia, confirmação automática no WhatsApp e ficha de pacientes em um só lugar. Telas reais do produto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

export function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Navegação */}
      <header className="sticky top-0 z-40 border-b border-line2/60 bg-paper/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-ink">
              <HeartPulse className="size-4.5 text-amber" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Agenda<span className="text-amber">Cardio</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <a
              href="#produto"
              className="hidden text-sm font-medium text-inksoft transition-colors hover:text-ink sm:block"
            >
              Produto
            </a>
            <Link
              to="/planos"
              className="hidden text-sm font-medium text-inksoft transition-colors hover:text-ink sm:block"
            >
              Planos
            </Link>
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-lg bg-ink px-5 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
            >
              Entrar
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto w-full max-w-4xl px-5 pt-20 pb-14 text-center sm:pt-28">
          <span className="inline-flex items-center rounded-full border border-amber/25 bg-amber/10 px-4 py-1 font-mono text-[11px] font-semibold tracking-wider text-amberdeep uppercase">
            Software para clínicas de cardiologia
          </span>

          <h1 className="mt-7 text-4xl leading-[1.12] font-bold tracking-tight text-balance sm:text-6xl">
            A agenda do dia resolvida <br className="hidden sm:block" />
            <span className="text-amber">antes do telefone tocar.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-inksoft sm:text-lg">
            Confirmações automáticas no WhatsApp, orientações de preparo por exame e a ficha
            completa do paciente — tudo na mesma tela da recepção.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/cadastro"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber px-7 py-3.5 text-base font-bold text-cream shadow-lg shadow-amber/20 transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              Testar 30 dias grátis
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border-2 border-ink/15 bg-card px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/40 sm:w-auto"
            >
              Ver o painel
            </Link>
          </div>
        </section>

        {/* Vitrine principal — painel real no desktop */}
        <section id="produto" className="mx-auto w-full max-w-6xl px-5 pb-24">
          <figure className="relative">
            <div className="overflow-hidden rounded-2xl border border-line2 bg-card shadow-2xl">
              <div className="flex h-10 items-center gap-1.5 border-b border-line2/70 bg-paper px-4">
                <span className="size-2.5 rounded-full bg-line2" />
                <span className="size-2.5 rounded-full bg-line2" />
                <span className="size-2.5 rounded-full bg-line2" />
                <span className="ml-3 font-mono text-[11px] text-inksoft">
                  painel.agendacardio.com.br/agenda
                </span>
              </div>
              <img
                src={dashboardDesktop.url}
                alt="Painel do dia do Agenda Cardio no computador, com indicadores, filtros e cartões de pacientes"
                width={1900}
                height={853}
                loading="lazy"
                className="w-full"
              />
            </div>

            {/* Cartão flutuante de confirmação */}
            <div className="absolute -bottom-8 right-6 hidden w-[300px] rounded-xl border border-line2 bg-card p-4 shadow-xl lg:block">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-ok/15">
                  <MessageCircle className="size-4 text-ok" />
                </span>
                <span className="text-xs font-bold">Confirmação automática</span>
              </div>
              <p className="text-[13px] leading-relaxed text-inksoft">
                A paciente respondeu no WhatsApp e a agenda das 08:05 foi confirmada sozinha.
              </p>
            </div>

            <figcaption className="mt-12 text-center font-mono text-[11px] tracking-wider text-inksoft uppercase lg:mt-8">
              01 · Painel do dia no computador
            </figcaption>
          </figure>
        </section>

        {/* Galeria — mobile + pacientes */}
        <section className="border-y border-line2/60 bg-card/40 py-20">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-5 lg:grid-cols-[300px_1fr]">
            <figure className="mx-auto w-full max-w-[300px]">
              <img
                src={appMobile.url}
                alt="Agenda Cardio no celular, mostrando a agenda do dia e a barra de navegação"
                width={338}
                height={594}
                loading="lazy"
                className="w-full rounded-3xl border border-line2 shadow-xl"
              />
              <figcaption className="mt-5 text-center font-mono text-[11px] tracking-wider text-inksoft uppercase">
                02 · No celular da recepção
              </figcaption>
            </figure>

            <figure>
              <img
                src={pacientesDesktop.url}
                alt="Aba Pacientes do Agenda Cardio, com cadastro, convênio, contato e observações clínicas"
                width={1410}
                height={635}
                loading="lazy"
                className="w-full rounded-2xl border border-line2 shadow-xl"
              />
              <figcaption className="mt-5 font-mono text-[11px] tracking-wider text-inksoft uppercase">
                03 · Ficha completa de pacientes
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Três pilares */}
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-5 py-24 md:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              titulo: "Confirmação no WhatsApp",
              texto:
                "Lembretes e orientações de preparo saem sozinhos. A resposta do paciente atualiza a agenda em tempo real.",
            },
            {
              icon: CheckCircle2,
              titulo: "Menos faltas no dia",
              texto:
                "Pendências, faltas e reagendamentos ficam visíveis em uma linha só, com ações rápidas em cada cartão.",
            },
            {
              icon: ShieldCheck,
              titulo: "Dados protegidos",
              texto:
                "Prontuário, contato e observações clínicas com controle de acesso e conformidade com a LGPD.",
            },
          ].map((item) => (
            <article
              key={item.titulo}
              className="group rounded-2xl border border-line2 bg-card p-7 transition-shadow hover:shadow-lg"
            >
              <span className="mb-6 flex size-11 items-center justify-center rounded-xl bg-amber/10 text-amber transition-colors group-hover:bg-amber group-hover:text-cream">
                <item.icon className="size-5" />
              </span>
              <h2 className="mb-2.5 text-lg font-bold">{item.titulo}</h2>
              <p className="text-sm leading-relaxed text-inksoft">{item.texto}</p>
            </article>
          ))}
        </section>

        {/* Chamada final */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-24">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-ink px-8 py-14 text-center">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-cream text-balance sm:text-4xl">
              Comece hoje com a agenda da sua clínica.
            </h2>
            <p className="max-w-lg text-sm text-cream/70">
              Sem instalação e sem cartão de crédito. 30 dias para testar com a sua equipe.
            </p>
            <Link
              to="/cadastro"
              className="inline-flex items-center gap-2 rounded-xl bg-amber px-7 py-3.5 text-base font-bold text-cream transition-transform hover:-translate-y-0.5"
            >
              Criar minha conta
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line2/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-inksoft sm:flex-row">
          <span className="font-mono tracking-wider uppercase">
            Agenda Cardio · Cardiologia & Diagnóstico
          </span>
          <span>© {new Date().getFullYear()} · Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  );
}
