/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Tag, Heading, FileText, Compass, Camera, X, Plus, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../utils';

interface AddPointFormProps {
  onAddPoint: (point: {
    nome: string;
    local: string;
    descricao: string;
    praticas: string;
    foto?: string;
  }) => void;
  hasProfile: boolean;
  existingNames?: string[];
}

export default function AddPointForm({ onAddPoint, hasProfile, existingNames = [] }: AddPointFormProps) {
  const [nome, setNome] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('geranium_tags_disponiveis');
      return saved ? JSON.parse(saved) : ['infantil', 'fundamental', 'contraturno'];
    } catch (e) {
      return ['infantil', 'fundamental', 'contraturno'];
    }
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [descricao, setDescricao] = useState('');
  const [praticas, setPraticas] = useState('');
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sugestões inteligentes de nomes de locais já existentes
  const suggestions = (existingNames || []).filter(name => {
    if (!name) return false;
    // Se o campo estiver vazio, mostra até 8 sugestões comuns, caso contrário, filtra o que foi digitado
    if (!nome.trim()) return true;
    return name.toLowerCase().includes(nome.toLowerCase()) && name.toLowerCase() !== nome.toLowerCase();
  }).slice(0, 8);

  const handleSuggestionClick = (selectedName: string) => {
    setNome(selectedName);
    setIsFocused(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndSetFile(file);
    }
  };

  const processAndSetFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, envie apenas arquivos de imagem.');
      return;
    }
    try {
      setErrorMsg('');
      const base64 = await compressImage(file);
      setFoto(base64);
    } catch (err) {
      setErrorMsg('Falha ao processar a imagem. Tente outro arquivo.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processAndSetFile(file);
    }
  };

  const removeFoto = () => {
    setFoto(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddCustomTag = (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanTag = newTagInput.trim().toLowerCase();
    if (!cleanTag) return;
    if (!availableTags.includes(cleanTag)) {
      const updated = [...availableTags, cleanTag];
      setAvailableTags(updated);
      localStorage.setItem('geranium_tags_disponiveis', JSON.stringify(updated));
    }
    if (!selectedTags.includes(cleanTag)) {
      setSelectedTags([...selectedTags, cleanTag]);
    }
    setNewTagInput('');
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || selectedTags.length === 0) {
      setErrorMsg('Preencha o Nome do ponto e selecione ao menos uma Tag.');
      return;
    }

    onAddPoint({
      nome: nome.trim(),
      local: selectedTags.join(', '),
      descricao: descricao.trim(),
      praticas: praticas.trim(),
      foto,
    });

    // Reset fields except profile fields which are kept on the profile level!
    setNome('');
    setSelectedTags([]);
    setDescricao('');
    setPraticas('');
    setFoto(undefined);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="bg-brand-paper border border-brand-line rounded-[32px] p-8 mb-6 shadow-sm">
      <div className="border-b border-brand-line pb-3 mb-5">
        <h2 className="font-serif text-xl italic text-brand-green flex items-center gap-2">
          <span className="w-3 h-3 bg-brand-ochre rounded-full inline-block" />
          Novo Ponto de Observação
        </h2>
        <p className="text-xs text-brand-terra/60 mt-1">
          Complete os dados específicos do ponto. O nome do educador e grupo serão herdados automaticamente.
        </p>
      </div>

      {!hasProfile && (
        <div className="bg-brand-ochre/10 border border-brand-ochre/30 text-brand-terra text-xs rounded-xl p-4 mb-4 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-brand-ochre flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lembrete:</span> preencha seu nome e grupo no topo da página para que fiquem gravados permanentemente no rodapé das paradas da trilha!
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Point Name and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ponto-nome" className="block text-[10px] uppercase font-bold text-[#8c8878] mb-1 flex items-center gap-1.5">
              <Heading size={13} className="text-brand-leaf" />
              Nome do Ponto *
            </label>
            <div className="relative">
              <input
                id="ponto-nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  // Pequeno delay para permitir que o evento onMouseDown seja registrado na sugestão
                  setTimeout(() => setIsFocused(false), 150);
                }}
                placeholder="Ex.: Minhocário Experimental"
                className="w-full bg-[#f9f8f6] border border-[#e6e2d3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green transition-all text-brand-terra"
                autoComplete="off"
              />
              {/* Balão flutuante de sugestões de locais que já existem no ecossistema do app */}
              {isFocused && suggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-brand-paper border border-[#e6e2d3] rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-brand-line/30">
                  <div className="px-3 py-1.5 bg-[#fbfaf8] text-[9px] uppercase font-bold text-[#8c8878] tracking-wider border-b border-brand-line/30">
                    Sugestões existentes
                  </div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 text-xs text-brand-terra hover:bg-[#f5f2ed] hover:text-brand-green transition-colors focus:outline-none focus:bg-[#f5f2ed] flex items-center justify-between cursor-pointer"
                    >
                      <span>{suggestion}</span>
                      <span className="text-[10px] text-brand-leaf font-bold">Usar</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#8c8878] mb-1.5 flex items-center gap-1.5">
              <Tag size={13} className="text-brand-leaf" />
              Tags (Segmentos) *
            </label>
            
            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-brand-green text-white border-brand-green shadow-sm'
                        : 'bg-[#f9f8f6] text-[#8c8878] border-[#e6e2d3] hover:bg-[#f5f2ed] hover:text-brand-green'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Ex: integral"
                className="flex-1 bg-[#f9f8f6] border border-[#e6e2d3] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green text-brand-terra"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag(e as any);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="bg-brand-green/10 hover:bg-brand-green/20 text-brand-green font-bold text-xs px-3 py-2 rounded-xl border border-brand-green/20 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus size={12} />
                <span>+ Tag</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="ponto-descricao" className="block text-[10px] uppercase font-bold text-[#8c8878] mb-1 flex items-center gap-1.5">
            <FileText size={13} className="text-brand-leaf" />
            Descrição da Área
          </label>
          <textarea
            id="ponto-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="O que foi descoberto hoje? Observações dos sentidos, reflexões do grupo..."
            className="w-full bg-[#f9f8f6] border border-[#e6e2d3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green transition-all min-h-[80px] resize-y text-brand-terra"
          />
        </div>

        {/* Pedagogical Practices */}
        <div>
          <label htmlFor="ponto-praticas" className="block text-[10px] uppercase font-bold text-[#8c8878] mb-1 flex items-center gap-1.5">
            <Compass size={13} className="text-brand-leaf" />
            Práticas Pedagógicas
          </label>
          <textarea
            id="ponto-praticas"
            value={praticas}
            onChange={(e) => setPraticas(e.target.value)}
            placeholder="Ex.: Tateamento experimental do solo, desenho de observação..."
            className="w-full bg-[#f9f8f6] border border-[#e6e2d3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green transition-all min-h-[80px] resize-y text-brand-terra"
          />
        </div>

        {/* PHOTO COMPONENT: Space to add a photo */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-[#8c8878] mb-1 flex items-center gap-1.5">
            <Camera size={13} className="text-brand-leaf" />
            Registro Fotográfico
          </label>

          {foto ? (
            <div className="relative inline-block mt-1">
              <div className="bg-brand-paper p-3 border border-brand-line rounded-2xl shadow-sm max-w-xs transition-all hover:shadow-md">
                <img
                  src={foto}
                  alt="Prévia do ponto"
                  className="rounded-xl object-cover w-full h-40 border border-brand-line/50"
                  referrerPolicy="no-referrer"
                />
                <div className="text-[11px] text-brand-terra/50 mt-1.5 font-mono flex items-center justify-between">
                  <span>Foto anexada (leve)</span>
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <X size={12} /> Remover
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-ochre bg-brand-ochre/10 scale-[0.99]'
                  : 'border-[#e6e2d3] hover:border-brand-leaf bg-[#fdfdfb] hover:bg-[#f5f2ed]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center">
                  <Camera size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-green">
                    Arraste uma foto aqui ou <span className="text-brand-ochre underline">escolha um arquivo</span>
                  </p>
                  <p className="text-[10px] text-brand-terra/50 mt-1">
                    Formatos suportados: JPG, PNG. A imagem será otimizada automaticamente para carregamento ultra rápido.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle size={14} />
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-[#5a5a40] hover:bg-[#4a4a35] text-white py-4 rounded-full font-bold text-sm tracking-wide hover:bg-[#4a4a35] shadow-lg shadow-[#5a5a40]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>SALVAR NA TRILHA</span>
        </button>
      </form>
    </section>
  );
}
