/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tag, FileText, Compass, Trash2, Edit2, ChevronUp, ChevronDown, Check, X, Camera, Calendar, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TrailPoint } from '../types';
import { formatDate, compressImage } from '../utils';

interface PointCardProps {
  key?: string | number;
  point: TrailPoint;
  index: number;
  totalPoints: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedFields: Partial<TrailPoint>) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export default function PointCard({
  point,
  index,
  totalPoints,
  onDelete,
  onUpdate,
  onMoveUp,
  onMoveDown,
}: PointCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [nome, setNome] = useState(point.nome);
  const [local, setLocal] = useState(point.local);
  const [descricao, setDescricao] = useState(point.descricao);
  const [praticas, setPraticas] = useState(point.praticas);
  const [foto, setFoto] = useState(point.foto);
  const [autor, setAutor] = useState(point.autor);
  const [grupo, setGrupo] = useState(point.grupo);

  const fileInputId = `edit-photo-input-${point.id}`;

  const handleSave = () => {
    if (!nome.trim() || !local.trim()) return;
    onUpdate(point.id, {
      nome: nome.trim(),
      local: local.trim(),
      descricao: descricao.trim(),
      praticas: praticas.trim(),
      foto,
      autor: autor.trim(),
      grupo: grupo.trim(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNome(point.nome);
    setLocal(point.local);
    setDescricao(point.descricao);
    setPraticas(point.praticas);
    setFoto(point.foto);
    setAutor(point.autor);
    setGrupo(point.grupo);
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImage(file);
        setFoto(base64);
      } catch (err) {
        alert('Erro ao carregar a imagem.');
      }
    }
  };

  return (
    <article className="bg-brand-paper border-2 border-brand-line border-l-6 border-l-brand-leaf rounded-xl p-5 md:p-6 mb-5 shadow-sm transition-all hover:shadow-md relative print-card">
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-line pb-2 mb-3">
            <span className="font-mono text-xs font-bold text-brand-ochre uppercase">
              Editando Parada {index + 1}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!nome.trim() || !local.trim()}
                className="bg-brand-green hover:bg-brand-leaf text-brand-paper px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check size={12} /> Salvar
              </button>
              <button
                onClick={handleCancel}
                className="bg-brand-parchment hover:bg-brand-line text-brand-terra px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X size={12} /> Cancelar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-brand-green mb-0.5">Nome do Ponto</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-brand-line rounded text-xs bg-brand-parchment/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-brand-green mb-0.5">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-brand-line rounded text-xs bg-brand-parchment/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-brand-green mb-0.5">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-brand-line rounded text-xs bg-brand-parchment/30 h-16"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-brand-green mb-0.5">Práticas Pedagógicas</label>
            <textarea
              value={praticas}
              onChange={(e) => setPraticas(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-brand-line rounded text-xs bg-brand-parchment/30 h-16"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-brand-green mb-0.5">Educador/a (Autor)</label>
              <input
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-brand-line rounded text-xs bg-brand-parchment/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-brand-green mb-0.5">Turma/Grupo</label>
              <input
                type="text"
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-brand-line rounded text-xs bg-brand-parchment/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-brand-green mb-1 flex items-center gap-1">
              <Camera size={12} /> Alterar Foto
            </label>
            {foto ? (
              <div className="flex items-center gap-3 bg-brand-parchment/30 p-2 rounded border border-brand-line">
                <img
                  src={foto}
                  alt="Previa"
                  className="w-16 h-16 object-cover rounded border border-brand-line"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => setFoto(undefined)}
                  className="text-[10px] text-red-600 font-bold hover:underline"
                >
                  Remover Foto
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id={fileInputId}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById(fileInputId)?.click()}
                  className="bg-brand-parchment hover:bg-brand-line border border-brand-line px-3 py-1.5 rounded text-xs font-semibold text-brand-green flex items-center gap-1"
                >
                  <Camera size={12} /> Escolher Foto
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 items-start pr-12">
          {/* Retro Photo Container on the Left */}
          <div className="w-24 h-24 bg-brand-line/50 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-brand-line shadow-inner group/photo">
            {point.foto ? (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="w-full h-full p-0 border-0 bg-transparent cursor-zoom-in focus:outline-none overflow-hidden relative"
                title="Clique para ampliar a foto"
              >
                <img
                  src={point.foto}
                  alt={point.nome}
                  className="w-full h-full object-cover transition-transform group-hover/photo:scale-110 duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="text-[9px] text-white bg-black/60 px-1.5 py-0.5 rounded opacity-0 group-hover/photo:opacity-100 transition-opacity font-sans font-bold">
                    AMPLIAR
                  </span>
                </div>
              </button>
            ) : (
              <div className="text-center italic text-[#8c8878] text-xs font-serif select-none">
                Sem Foto
              </div>
            )}
          </div>

          {/* Main content column */}
          <div className="flex-1 space-y-3">
            {/* Index Label and Badge */}
            <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
              <div>
                <h3 className="font-serif font-bold text-lg md:text-xl text-brand-green leading-tight">
                  {point.nome}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                  <Tag size={12} className="text-brand-ochre shrink-0" />
                  {point.local.split(',').map((tag, tIdx) => {
                    const cleanTag = tag.trim();
                    if (!cleanTag) return null;
                    return (
                      <span key={tIdx} className="bg-[#f0f4ec] text-[#5b8241] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#e6e2d3]/50">
                        {cleanTag}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div className="text-[10px] text-brand-terra font-mono bg-brand-parchment px-2.5 py-1 rounded-full flex items-center gap-1">
                <Calendar size={11} />
                {point.data ? formatDate(point.data) : 'Manual'}
              </div>
            </div>

            {/* Description */}
            {point.descricao && (
              <p className="text-sm text-[#6b6858] italic leading-relaxed whitespace-pre-wrap">
                {point.descricao}
              </p>
            )}

            {/* Pedagogical Practices (Freinet) */}
            {point.praticas && (
              <div className="space-y-1 bg-brand-parchment/30 p-2.5 rounded-xl border border-brand-line/50">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-leaf flex items-center gap-1">
                  <Compass size={11} className="shrink-0" />
                  Práticas Pedagógicas
                </div>
                <p className="text-brand-terra text-xs font-medium leading-relaxed whitespace-pre-wrap">
                  {point.praticas}
                </p>
              </div>
            )}

            {/* Signature Stamps / Footer metadata */}
            <div className="pt-2 border-t border-brand-line/40 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#8c8878]">
              <span className="flex items-center gap-1">
                <User size={12} className="text-brand-ochre shrink-0" />
                <span className="font-bold">Educador/a:</span> {point.autor || 'Geral'}
              </span>
              {point.grupo && (
                <span className="flex items-center gap-1">
                  <Users size={12} className="text-brand-ochre shrink-0" />
                  <span className="font-bold">Grupo:</span> {point.grupo}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons (Absolute or right-aligned container for desktop) - hidden on print */}
          <div className="absolute top-4 right-4 flex flex-row sm:flex-col gap-1.5 no-print">
            {/* Reorder Buttons */}
            <div className="flex sm:flex-col bg-brand-parchment/60 border border-brand-line rounded overflow-hidden">
              <button
                type="button"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                title="Mover para cima"
                className="p-1 text-brand-green hover:bg-brand-line/40 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(index)}
                disabled={index === totalPoints - 1}
                title="Mover para baixo"
                className="p-1 text-brand-green hover:bg-brand-line/40 disabled:opacity-20 disabled:hover:bg-transparent border-l sm:border-l-0 sm:border-t border-brand-line transition-colors cursor-pointer"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex sm:flex-col gap-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Editar parada"
                className="p-1.5 bg-brand-paper hover:bg-brand-parchment text-brand-green border border-brand-line rounded transition-colors cursor-pointer"
              >
                <Edit2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(point.id)}
                title="Excluir parada"
                className="p-1.5 bg-brand-paper hover:bg-red-50 text-red-600 border border-brand-line hover:border-red-200 rounded transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retro-Styled Lightbox Modal to Expand Image */}
      <AnimatePresence>
        {isLightboxOpen && point.foto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-4 md:p-8 cursor-zoom-out no-print"
          >
            {/* Close button with high visibility */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105"
              title="Fechar"
              aria-label="Fechar visualização"
            >
              <X size={20} />
            </button>

            {/* Lightbox main panel with beautiful frame */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] bg-brand-paper p-3 rounded-2xl border-2 border-brand-line shadow-2xl overflow-hidden flex flex-col"
            >
              <img
                src={point.foto}
                alt={point.nome}
                className="max-w-full max-h-[70vh] object-contain rounded-xl select-none"
                referrerPolicy="no-referrer"
              />
              
              {/* Photo Legend & Metadata */}
              <div className="mt-3 px-2 flex flex-col items-center text-center gap-1">
                <h4 className="font-serif font-bold text-base text-brand-green leading-tight">
                  {point.nome}
                </h4>
                <div className="flex flex-wrap justify-center gap-2 items-center text-[10px] text-[#8c8878] font-mono mt-0.5">
                  {point.local && (
                    <span className="bg-[#f0f4ec] text-[#5b8241] font-bold px-2 py-0.5 rounded-full border border-[#e6e2d3]/50">
                      {point.local}
                    </span>
                  )}
                  {point.autor && (
                    <span>• {point.autor}</span>
                  )}
                  {point.grupo && (
                    <span>• {point.grupo}</span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
