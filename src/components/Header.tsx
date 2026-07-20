/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Leaf, Map, Compass, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenConfig?: () => void;
}

export default function Header({ onOpenConfig }: HeaderProps) {
  return (
    <header className="bg-brand-green text-brand-parchment py-8 px-6 text-center border-b-6 border-brand-ochre shadow-md relative overflow-hidden">
      {onOpenConfig && (
        <button
          type="button"
          onClick={onOpenConfig}
          className="absolute top-4 right-4 text-brand-parchment/60 hover:text-brand-ochre hover:bg-black/15 p-2.5 rounded-full transition-all z-20 cursor-pointer no-print flex items-center justify-center"
          title="Configurar Planilha"
        >
          <Settings size={20} />
        </button>
      )}
      {/* Decorative background leaf patterns */}
      <div className="absolute top-0 left-0 opacity-5 -translate-x-1/4 -translate-y-1/4 select-none pointer-events-none">
        <Leaf size={240} />
      </div>
      <div className="absolute top-0 right-0 opacity-5 translate-x-1/4 -translate-y-1/4 select-none pointer-events-none">
        <Compass size={240} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
        {/* Handcrafted Brand Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-brand-paper rounded-full border-2 border-brand-ochre flex items-center justify-center shadow-inner hover:rotate-6 transition-transform duration-300">
            {/* Elegant SVG inspired by Sítio-Escola Geranium's logo (orange-yellow book-leaf/flower, green core) */}
            <svg viewBox="0 0 100 100" className="w-9 h-9">
              {/* Orange Leaf Left */}
              <path 
                d="M 50,85 C 40,70 20,60 25,35 C 30,15 50,25 50,50 Z" 
                fill="#f18a22" 
                opacity="0.9"
              />
              {/* Orange Leaf Right */}
              <path 
                d="M 50,85 C 60,70 80,60 75,35 C 70,15 50,25 50,50 Z" 
                fill="#f8ab37" 
                opacity="0.9"
              />
              {/* Green Core Leaf */}
              <path 
                d="M 50,85 C 45,70 40,55 50,30 C 60,55 55,70 50,85 Z" 
                fill="#5b8241" 
              />
            </svg>
          </div>
          <span className="font-serif font-bold text-2xl tracking-wide text-brand-ochre">Sítio-Escola Geranium</span>
        </div>

        <h1 className="font-serif font-bold text-3xl md:text-4xl text-brand-paper tracking-tight mb-2 drop-shadow-sm">
          Trilhas Pedagógicas
        </h1>
        
        <p className="text-brand-parchment/90 text-sm md:text-base font-medium max-w-xl italic border-t border-brand-line/20 pt-2 mt-1">
          Pedagogia de Célestin Freinet
        </p>

        {/* Small pedagogical quote for atmospheric alignment */}
        <div className="mt-4 bg-black/10 px-4 py-1.5 rounded-full text-xs text-brand-parchment/80 max-w-lg tracking-wide">
          "Não se prepara a democracia de amanhã pela autocracia. Prepara-se pela cooperação." — Inspirada em uma invariante de Freinet
        </div>
      </div>
    </header>
  );
}
