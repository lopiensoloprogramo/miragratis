
import { Link } from "react-router-dom";
import { Crown, ArrowRight } from "lucide-react";

export default function VipBanner() {
  return (
    <div className="relative mb-8 overflow-hidden rounded-xl border border-yellow-500/30 bg-gradient-to-r from-[#171717] via-[#242016] to-[#171717] p-5 sm:p-6">

      {/* Decoración */}
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Crown size={20} className="text-yellow-400" />
            <span className="text-sm font-bold tracking-wider text-yellow-400">
              MIRAGRATIS VIP
            </span>
          </div>

          <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
            ¡Disfruta MiraGratis sin publicidad!
          </h2>

          <p className="max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
            Accede a nuestra biblioteca privada de películas y series,
            disfruta de contenido exclusivo y recibe novedades sobre
            nuevas subidas.
          </p>

          <p className="mt-3 text-sm font-semibold text-yellow-400">
            🚀 Hazte VIP por solo S/5
          </p>
        </div>

        <div className="shrink-0">
          <Link
            to="/vip"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-3 font-bold text-black transition hover:bg-yellow-400 sm:w-auto"
          >
            Descubrir VIP
            <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}
