import React from 'react';
import { Shield, Terminal } from 'lucide-react';

const Header = ({ version }) => (
  <header className="relative z-10 py-8 px-4 border-b border-white/5 bg-gray-900/50 backdrop-blur-md">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4 group">
        <div className="p-3 bg-indigo-500 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            EL TRIBUNAL <span className="text-indigo-400">GAMING</span>
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <Terminal className="w-3 h-3" />
            <span>SISTEMA DE AUDITORÍA CRÍTICA</span>
            <span className="px-1.5 py-0.5 bg-gray-800 rounded text-indigo-400 font-bold">{version}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
