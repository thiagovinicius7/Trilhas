/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Users, Check, Edit2, Sparkles } from 'lucide-react';

interface EducatorProfileProps {
  autor: string;
  grupo: string;
  onChange: (autor: string, grupo: string) => void;
}

export default function EducatorProfile({ autor, grupo, onChange }: EducatorProfileProps) {
  const [isEditing, setIsEditing] = useState(!autor);
  const [tempAutor, setTempAutor] = useState(autor);
  const [tempGrupo, setTempGrupo] = useState(grupo);

  // Sync state if props change (e.g. loaded persistently)
  React.useEffect(() => {
    if (autor && grupo) {
      setTempAutor(autor);
      setTempGrupo(grupo);
      setIsEditing(false);
    }
  }, [autor, grupo]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(tempAutor.trim(), tempGrupo.trim());
    setIsEditing(false);
  };

  return (
    <section className="bg-brand-paper border border-brand-line rounded-[32px] p-8 mb-6 shadow-sm relative overflow-hidden transition-all duration-300">
      {/* Visual background texture resembling vintage library cards */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-ochre/10 rounded-full blur-2xl pointer-events-none" />
      
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-line pb-2">
            <h2 className="font-serif text-lg italic text-brand-green flex items-center gap-2">
              <Sparkles size={18} className="text-brand-ochre" />
              Identificação do/a Educador/a
            </h2>
            <span className="text-xs text-brand-terra/60 font-mono italic">
              Configurar uma única vez
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-autor" className="block text-[10px] uppercase font-bold text-[#8c8878] mb-1 flex items-center gap-1.5">
                <User size={13} className="text-brand-leaf" />
                Seu Nome (Educador/a Responsável) *
              </label>
              <input
                id="profile-autor"
                type="text"
                required
                value={tempAutor}
                onChange={(e) => setTempAutor(e.target.value)}
                placeholder="Ex.: Professor Thiago Vinícius"
                className="w-full bg-[#f9f8f6] border border-[#e6e2d3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green transition-all text-brand-terra"
              />
            </div>
            
            <div>
              <label htmlFor="profile-grupo" className="block text-[10px] uppercase font-bold text-[#8c8878] mb-1 flex items-center gap-1.5">
                <Users size={13} className="text-brand-leaf" />
                Turma, Escola ou Grupo *
              </label>
              <input
                id="profile-grupo"
                type="text"
                required
                value={tempGrupo}
                onChange={(e) => setTempGrupo(e.target.value)}
                placeholder="Ex.: 4º Ano - Escola Municipal"
                className="w-full bg-[#f9f8f6] border border-[#e6e2d3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green transition-all text-brand-terra"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!tempAutor.trim() || !tempGrupo.trim()}
              className="bg-brand-green hover:bg-brand-leaf text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              <Check size={14} />
              Confirmar Identificação
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brand-parchment rounded-xl border border-brand-line flex items-center justify-center text-brand-green flex-shrink-0">
              <User size={24} />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-brand-leaf font-bold">
                Identificação
              </div>
              <h3 className="font-serif font-bold text-lg text-brand-green">
                {autor || 'Não especificado'}
              </h3>
              <p className="text-sm text-brand-terra/80 flex items-center gap-1">
                <Users size={14} className="text-brand-ochre inline" />
                {grupo || 'Sem turma configurada'}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setTempAutor(autor);
              setTempGrupo(grupo);
              setIsEditing(true);
            }}
            className="self-start sm:self-center bg-[#f9f8f6] hover:bg-brand-line/50 text-brand-green border border-brand-line text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit2 size={12} />
            Alterar Identificação
          </button>
        </div>
      )}
    </section>
  );
}
