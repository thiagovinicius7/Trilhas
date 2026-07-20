/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Settings, X, Copy, Check, FileCode, ExternalLink, HelpCircle } from 'lucide-react';

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onSaveUrl: (url: string) => void;
}

const APPS_SCRIPT_CODE = `// ============================================================
// Trilha Pedagógica — Sítio-Escola Geranium
// Backend em Google Apps Script + Google Sheets (Com suporte a Fotos!)
// ============================================================

const NOME_ABA = 'Trilha';

function getAba_() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(NOME_ABA);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA);
    aba.appendRow(['Data/hora', 'Nome do ponto', 'Local', 'Descrição', 'Práticas pedagógicas', 'Autor', 'Turma/grupo', 'Foto (Base64)']);
    aba.setFrozenRows(1);
  }
  return aba;
}

function doPost(e) {
  try {
    const corpo = JSON.parse(e.postData.contents);
    const aba = getAba_();

    if (corpo.acao === 'salvar' && Array.isArray(corpo.pontos)) {
      corpo.pontos.forEach(function (p) {
        aba.appendRow([
          p.data || new Date().toISOString(),
          p.nome || '',
          p.local || '',
          p.descricao || '',
          p.praticas || '',
          p.autor || '',
          p.grupo || '',
          p.foto || '' // Salva a foto compactada em Base64
        ]);
      });
      return resposta_({ ok: true, salvos: corpo.pontos.length });
    }

    return resposta_({ ok: false, erro: 'Ação não reconhecida.' });
  } catch (err) {
    return resposta_({ ok: false, erro: String(err) });
  }
}

function doGet(e) {
  try {
    const aba = getAba_();
    const valores = aba.getDataRange().getValues();
    const linhas = valores.slice(1); // pula o cabeçalho

    const pontos = linhas
      .filter(function (linha) { return linha[1]; }) // precisa ter nome
      .map(function (linha) {
        return {
          data: linha[0],
          nome: linha[1],
          local: linha[2],
          descricao: linha[3],
          praticas: linha[4],
          autor: linha[5],
          grupo: linha[6],
          foto: linha[7] || '' // Retorna a foto salva
        };
      });

    return resposta_({ ok: true, pontos: pontos });
  } catch (err) {
    return resposta_({ ok: false, erro: String(err) });
  }
}

function resposta_(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export default function ConfigDialog({ isOpen, onClose, url, onSaveUrl }: ConfigDialogProps) {
  const [inputUrl, setInputUrl] = useState(url);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'script'>('config');

  useEffect(() => {
    if (isOpen) {
      setInputUrl(url);
    }
  }, [isOpen, url]);

  const handleSave = () => {
    onSaveUrl(inputUrl.trim());
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-green/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
      <div className="bg-brand-paper border border-brand-line rounded-[32px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-brand-green text-brand-parchment p-5 flex items-center justify-between border-b border-brand-line">
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-brand-ochre" />
            <h2 className="font-serif italic text-lg text-brand-paper">Planilha Compartilhada (Google Sheets)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-brand-parchment/70 hover:text-brand-paper p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="bg-[#f9f8f6] border-b border-brand-line flex text-xs font-semibold">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-3 px-4 text-center border-r border-brand-line transition-all cursor-pointer ${
              activeTab === 'config' 
                ? 'bg-brand-paper text-brand-green border-b-2 border-b-brand-leaf font-bold font-serif italic text-[13px]' 
                : 'text-brand-terra/60 hover:bg-[#f5f2ed]'
            }`}
          >
            Configurar URL de Destino
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 py-3 px-4 text-center transition-all cursor-pointer ${
              activeTab === 'script' 
                ? 'bg-brand-paper text-brand-green border-b-2 border-b-brand-leaf font-bold font-serif italic text-[13px]' 
                : 'text-brand-terra/60 hover:bg-[#f5f2ed]'
            }`}
          >
            Código do Apps Script (Com Foto 📷)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'config' ? (
            <div className="space-y-4">
              <p className="text-sm text-brand-terra/80 leading-relaxed">
                Para salvar as trilhas em tempo real e compartilhá-las com outros educadores, integre o aplicativo com uma planilha Google usando o Google Apps Script.
              </p>

              <div>
                <label htmlFor="modal-url" className="block text-[10px] uppercase font-bold text-[#8c8878] mb-1.5">
                  URL do Web App do Google Apps Script
                </label>
                <input
                  id="modal-url"
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full bg-[#f9f8f6] border border-[#e6e2d3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green transition-all text-brand-terra"
                />
              </div>

              <div className="bg-brand-ochre/10 border border-brand-ochre/25 rounded-2xl p-4 text-xs space-y-1.5 text-brand-terra">
                <h4 className="font-serif italic text-sm text-brand-green flex items-center gap-1">
                  <HelpCircle size={14} className="text-brand-ochre" />
                  Passo a Passo de Instalação Rápida:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-brand-terra/90">
                  <li>Abra o Google Sheets e crie uma planilha vazia.</li>
                  <li>No menu superior, vá em <strong>Extensões &gt; Apps Script</strong>.</li>
                  <li>Copie o código fornecido na aba ao lado (com suporte a fotos) e cole-o no editor.</li>
                  <li>Clique em <strong>Implantar &gt; Nova implantação</strong>.</li>
                  <li>Selecione o tipo <strong>App da Web</strong>.</li>
                  <li>Configure <em>Executar como</em> para: <strong>"Eu"</strong>.</li>
                  <li>Configure <em>Quem pode acessar</em> para: <strong>"Qualquer pessoa"</strong>.</li>
                  <li>Clique em <strong>Implantar</strong>, copie a URL do Web App (que termina em <code className="bg-brand-parchment px-1 rounded font-mono">/exec</code>) e cole-a acima.</li>
                </ol>
              </div>

              <div className="flex justify-end pt-4 border-t border-brand-line/40">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-brand-green hover:bg-brand-leaf text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[#8c8878] font-sans">
                  Código de integração atualizado. Suporta armazenamento de fotos compactadas em uma nova coluna na planilha!
                </span>
                <button
                  onClick={handleCopy}
                  className="bg-[#5a5a40] hover:bg-[#4a4a35] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-brand-ochre" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copiar Código
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={APPS_SCRIPT_CODE}
                  className="w-full h-80 font-mono text-[11px] p-4 border border-brand-line rounded-2xl bg-zinc-900 text-zinc-100 resize-none focus:outline-none focus:ring-1 focus:ring-brand-leaf"
                />
              </div>

              <div className="text-xs text-brand-terra/60 leading-relaxed bg-brand-parchment/40 p-4 rounded-2xl border border-brand-line/50 flex items-start gap-2">
                <FileCode size={16} className="text-brand-leaf shrink-0 mt-0.5" />
                <p>
                  <strong>Aviso Importante:</strong> Se você já tinha um script instalado na sua planilha, substitua-o inteiramente por este novo código para que a coluna 8 de fotos em Base64 seja gerada e lida corretamente pela nuvem.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
