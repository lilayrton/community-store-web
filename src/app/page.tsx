import Link from "next/link";
import { Store, MapPin, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { UserMenu } from "@/components/user-menu";

export default async function StoreSelectionPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <header className="w-full h-16 px-4 md:px-8 flex justify-between items-center z-50 fixed top-0 left-0 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900">
            ComunitariasCaba
          </span>
        </div>
        <UserMenu user={user} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-8 px-4 z-10 w-full">
        <div className="w-full max-w-5xl mt-4 md:mt-8">
          <div className="w-full text-center mb-10 px-2 md:px-0">
            <h1 className="font-extrabold text-slate-800 text-4xl md:text-5xl uppercase tracking-widest">
              Elige tu Tienda
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
            
            {/* Sucursal Malabia */}
            <Link
              href="/store/malabia"
              className="group relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Badge Top Left */}
              <div className="absolute top-6 left-6 z-20 flex items-center bg-white/20 text-white rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                Pedidos Abiertos
              </div>

              {/* Huge Background Icon Top Right */}
              <Store className="absolute -top-8 -right-8 w-48 h-48 text-indigo-900/30 rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

              {/* Decorative Circle */}
              <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-start text-left mt-12">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                  MALABIA
                </h2>

                <div className="flex items-center text-white/95 font-medium bg-black/20 px-4 py-2 rounded-xl text-sm mb-8 w-fit border border-white/5 shadow-inner">
                  <MapPin className="w-4 h-4 mr-2 opacity-80" />
                  <span>Malabia 5678, Palermo</span>
                </div>

                <div className="w-full bg-white/20 h-px mb-6" />

                <div className="flex items-center justify-between w-full text-white font-bold text-sm">
                  <span className="opacity-90 group-hover:opacity-100 transition-opacity">Ingresar a la sucursal</span>
                  <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>

            {/* Sucursal Alsina */}
            <Link
              href="/store/alsina"
              className="group relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-8 md:p-10 shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Badge Top Left */}
              <div className="absolute top-6 left-6 z-20 flex items-center bg-white/20 text-white rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                Pedidos Abiertos
              </div>

              {/* Huge Background Icon Top Right */}
              <Store className="absolute -top-8 -right-8 w-48 h-48 text-orange-900/30 rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

              {/* Decorative Circle */}
              <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-start text-left mt-12">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                  ALSINA
                </h2>

                <div className="flex items-center text-white/95 font-medium bg-black/20 px-4 py-2 rounded-xl text-sm mb-8 w-fit border border-white/5 shadow-inner">
                  <MapPin className="w-4 h-4 mr-2 opacity-80" />
                  <span>Av. Alsina 1234, CABA</span>
                </div>

                <div className="w-full bg-white/20 h-px mb-6" />

                <div className="flex items-center justify-between w-full text-white font-bold text-sm">
                  <span className="opacity-90 group-hover:opacity-100 transition-opacity">Ingresar a la sucursal</span>
                  <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}
