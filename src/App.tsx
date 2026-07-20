/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Cloud, 
  RefreshCw, 
  Printer, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Map,
  FileCode,
  Info,
  FolderOpen,
  Save,
  Plus,
  Share2,
  Tag,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TrailPoint, SavedRoadmap } from './types';
import Header from './components/Header';
import EducatorProfile from './components/EducatorProfile';
import AddPointForm from './components/AddPointForm';
import PointCard from './components/PointCard';
import ConfigDialog from './components/ConfigDialog';

// URL padrão do Google Apps Script (Sincronização com Google Sheets para o Banco de Práticas)
// Quando alguém acessar o app, este caminho já estará pronto para salvar e carregar as práticas!
const DEFAULT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwALBbJy6SpBnNKFjABHVP6-aZqH5TU1gTnIvIB9OQPjh6poY8hfVly4rkGMVpHg8wN/exec';

// Helper function for accent-insensitive and case-insensitive search
const normalizeSearchText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export default function App() {
  const [pontos, setPontos] = useState<TrailPoint[]>(() => {
    try {
      const stored = localStorage.getItem('geranium_trilha_pontos');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [autor, setAutor] = useState(() => {
    return localStorage.getItem('geranium_trilha_autor') || '';
  });
  const [grupo, setGrupo] = useState(() => {
    return localStorage.getItem('geranium_trilha_grupo') || '';
  });
  const [webAppUrl, setWebAppUrl] = useState(() => {
    const saved = localStorage.getItem('geranium_trilha_url');
    if (!saved || saved.includes('_example/exec') || saved !== DEFAULT_WEB_APP_URL) {
      localStorage.setItem('geranium_trilha_url', DEFAULT_WEB_APP_URL);
      return DEFAULT_WEB_APP_URL;
    }
    return saved;
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeZoomedPhoto, setActiveZoomedPhoto] = useState<{ src: string, title: string } | null>(null);
  
  // Tab control and shared practices
  const [activeTab, setActiveTab] = useState<'meu-roteiro' | 'banco-ideias'>('meu-roteiro');
  const [sharedPoints, setSharedPoints] = useState<TrailPoint[]>([]);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterTag, setSelectedFilterTag] = useState<string | null>(null);

  // Saved Roadmaps (Roteiros Salvos) state hooks
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>(() => {
    try {
      const stored = localStorage.getItem('geranium_roteiros_salvos');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(() => {
    return localStorage.getItem('geranium_active_roadmap_id') || null;
  });
  const [roadmapNameInput, setRoadmapNameInput] = useState('');
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [isRoadmapsExpanded, setIsRoadmapsExpanded] = useState(false);

  // Status feedback states
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'ok' | 'erro' | ''>('');
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  // Load initial data from localStorage
  useEffect(() => {
    // States are already synchronously loaded on initialization!
  }, []);

  // Sync state helpers that update localStorage
  const updatePontosAndStore = (newPontos: TrailPoint[]) => {
    setPontos(newPontos);
    localStorage.setItem('geranium_trilha_pontos', JSON.stringify(newPontos));
  };

  const handleProfileChange = (newAutor: string, newGrupo: string) => {
    setAutor(newAutor);
    setGrupo(newGrupo);
    localStorage.setItem('geranium_trilha_autor', newAutor);
    localStorage.setItem('geranium_trilha_grupo', newGrupo);
    
    // Update existing unsaved points with newly defined author/group if they are blank
    const updated = pontos.map(p => ({
      ...p,
      autor: p.autor || newAutor,
      grupo: p.grupo || newGrupo
    }));
    updatePontosAndStore(updated);
    showStatus('Identificação atualizada!', 'ok');
  };

  // Save/Update the entire current roadmap locally
  const handleSaveRoadmapLocally = (name: string) => {
    if (!name.trim()) {
      showStatus('Por favor, digite um nome para o roteiro.', 'erro');
      return;
    }

    let updatedRoadmaps = [...savedRoadmaps];
    const now = new Date().toISOString();

    if (activeRoadmapId) {
      // Update existing
      updatedRoadmaps = updatedRoadmaps.map(rm => {
        if (rm.id === activeRoadmapId) {
          return {
            ...rm,
            nome: name,
            pontos: pontos,
            autor: autor,
            grupo: grupo,
          };
        }
        return rm;
      });
      showStatus(`Roteiro "${name}" atualizado localmente!`, 'ok');
    } else {
      // Create new saved roadmap
      const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      const newRoadmap: SavedRoadmap = {
        id: newId,
        nome: name,
        dataCriacao: now,
        pontos: pontos,
        autor: autor,
        grupo: grupo
      };
      updatedRoadmaps.push(newRoadmap);
      setActiveRoadmapId(newId);
      localStorage.setItem('geranium_active_roadmap_id', newId);
      showStatus(`Roteiro "${name}" criado e salvo localmente!`, 'ok');
    }

    setSavedRoadmaps(updatedRoadmaps);
    localStorage.setItem('geranium_roteiros_salvos', JSON.stringify(updatedRoadmaps));
    setIsSavePanelOpen(false);
    setIsRoadmapsExpanded(true);
  };

  const handleCreateNewRoadmap = () => {
    if (pontos.length > 0 && !window.confirm('Iniciar novo roteiro? Certifique-se de salvar o roteiro atual se desejar guardá-lo.')) {
      return;
    }
    updatePontosAndStore([]);
    setActiveRoadmapId(null);
    localStorage.removeItem('geranium_active_roadmap_id');
    setRoadmapNameInput('');
    showStatus('Novo roteiro em branco iniciado. Adicione paradas abaixo!', 'info');
  };

  const handleLoadRoadmap = (id: string) => {
    const found = savedRoadmaps.find(rm => rm.id === id);
    if (found) {
      updatePontosAndStore(found.pontos);
      setAutor(found.autor);
      setGrupo(found.grupo);
      localStorage.setItem('geranium_trilha_autor', found.autor);
      localStorage.setItem('geranium_trilha_grupo', found.grupo);
      setActiveRoadmapId(found.id);
      localStorage.setItem('geranium_active_roadmap_id', found.id);
      setRoadmapNameInput(found.nome);
      showStatus(`Roteiro "${found.nome}" carregado com sucesso.`, 'ok');
    }
  };

  const handleDeleteSavedRoadmap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering load on click
    if (window.confirm('Tem certeza de que deseja excluir permanentemente este roteiro salvo?')) {
      const filtered = savedRoadmaps.filter(rm => rm.id !== id);
      setSavedRoadmaps(filtered);
      localStorage.setItem('geranium_roteiros_salvos', JSON.stringify(filtered));
      
      if (activeRoadmapId === id) {
        setActiveRoadmapId(null);
        localStorage.removeItem('geranium_active_roadmap_id');
        updatePontosAndStore([]);
        setRoadmapNameInput('');
      }
      showStatus('Roteiro excluído com sucesso.', 'ok');
    }
  };

  const handleSaveUrl = (newUrl: string) => {
    setWebAppUrl(newUrl);
    localStorage.setItem('geranium_trilha_url', newUrl);
    showStatus('URL do Google Sheets configurada com sucesso.', 'ok');
  };

  // Silent cloud sync for background auto-saving
  const savePointToCloudSilently = async (point: TrailPoint) => {
    if (!webAppUrl) return;

    try {
      const payload = {
        acao: 'salvar',
        pontos: [{
          id: point.id,
          data: point.data,
          nome: point.nome,
          local: point.local,
          Tags: point.local,
          tags: point.local,
          descricao: point.descricao,
          praticas: point.praticas,
          autor: point.autor,
          grupo: point.grupo,
          foto: point.foto || ''
        }]
      };

      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      const result = JSON.parse(responseText);

      if (result.ok) {
        showStatus(`"${point.nome}" salvo e sincronizado na nuvem!`, 'ok');
        // Retrieve newly assigned row IDs silently in the background
        loadSharedPoints(true);
      } else {
        console.warn('Erro ao salvar silenciosamente:', result.erro);
      }
    } catch (e) {
      console.warn('Erro ao salvar silenciosamente na nuvem:', e);
    }
  };

  const syncLocalIDsWithCloud = (cloudPoints: TrailPoint[]) => {
    let hasChanges = false;
    const updatedPontos = pontos.map(localPoint => {
      // If it already has a row-X ID, keep it
      if (localPoint.id.startsWith('row-')) {
        return localPoint;
      }
      // Match with cloud points by ignoring surrounding spaces and cases
      const match = cloudPoints.find(cp => 
        cp.nome.trim().toLowerCase() === localPoint.nome.trim().toLowerCase() && 
        cp.autor.trim().toLowerCase() === localPoint.autor.trim().toLowerCase() && 
        cp.descricao.trim().toLowerCase() === localPoint.descricao.trim().toLowerCase()
      );
      if (match) {
        hasChanges = true;
        return { ...localPoint, id: match.id };
      }
      return localPoint;
    });

    if (hasChanges) {
      setPontos(updatedPontos);
      localStorage.setItem('geranium_trilha_pontos', JSON.stringify(updatedPontos));

      // Synchronize in saved roadmaps list as well if there is an active roadmap
      if (activeRoadmapId) {
        const updatedRoadmaps = savedRoadmaps.map(rm => {
          if (rm.id === activeRoadmapId) {
            return { ...rm, pontos: updatedPontos };
          }
          return rm;
        });
        setSavedRoadmaps(updatedRoadmaps);
        localStorage.setItem('geranium_roteiros_salvos', JSON.stringify(updatedRoadmaps));
      }
    }
  };

  const handleAddPoint = (pointFields: {
    nome: string;
    local: string;
    descricao: string;
    praticas: string;
    foto?: string;
  }) => {
    const newPoint: TrailPoint = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      data: new Date().toISOString(),
      autor: autor || 'Educador Geral',
      grupo: grupo || 'Trilha',
      ...pointFields,
    };

    const newPontos = [...pontos, newPoint];
    updatePontosAndStore(newPontos);
    showStatus(`"${newPoint.nome}" salvo localmente!`, 'ok');

    // Trigger background cloud sync
    if (webAppUrl) {
      savePointToCloudSilently(newPoint);
    }
  };

  // Fetch shared points for the "Banco de Práticas"
  const loadSharedPoints = async (silent = false) => {
    if (!webAppUrl) {
      if (!silent) {
        showStatus('Configure a URL da planilha Google primeiro.', 'erro');
      }
      return;
    }

    setIsLoadingShared(true);
    if (!silent) {
      showStatus('Buscando práticas compartilhadas...', 'info');
    }

    try {
      const response = await fetch(`${webAppUrl}?acao=listar`);
      const responseText = await response.text();
      const result = JSON.parse(responseText);

      if (result.ok && Array.isArray(result.pontos)) {
        const formattedPoints: TrailPoint[] = result.pontos.map((p: any, idx: number) => ({
          id: p.id || `cloud-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          data: p.data || new Date().toISOString(),
          nome: p.nome || 'Ponto sem nome',
          local: p.local || p.Tags || p.tags || 'Local não informado',
          descricao: p.descricao || '',
          praticas: p.praticas || '',
          autor: p.autor || 'Geral',
          grupo: p.grupo || '',
          foto: p.foto || undefined
        }));

        // Reverse to show the most recent first
        setSharedPoints([...formattedPoints].reverse());

        // Sync local points' client-side IDs with Google Sheets row-X IDs
        syncLocalIDsWithCloud(formattedPoints);

        if (!silent) {
          showStatus(`${formattedPoints.length} práticas carregadas do mural!`, 'ok');
        }
      } else {
        if (!silent) {
          showStatus(`Erro ao buscar dados: ${result.erro || 'A planilha não retornou paradas válidas'}`, 'erro');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (!silent) {
        showStatus('Falha ao conectar com a planilha de práticas compartilhadas.', 'erro');
      }
    } finally {
      setIsLoadingShared(false);
    }
  };

  const handleCopySharedPoint = (point: TrailPoint) => {
    const copiedPoint: TrailPoint = {
      ...point,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      data: new Date().toISOString(), // stamp with copy date
    };

    updatePontosAndStore([...pontos, copiedPoint]);
    showStatus(`"${point.nome}" copiado para o seu roteiro local!`, 'ok');
    setActiveTab('meu-roteiro');
  };

  // Fetch shared points when switching tabs
  useEffect(() => {
    if (activeTab === 'banco-ideias' && webAppUrl) {
      loadSharedPoints(true);
    }
  }, [activeTab, webAppUrl]);

  const handleDeletePoint = (id: string) => {
    const filtered = pontos.filter(p => p.id !== id);
    updatePontosAndStore(filtered);
    showStatus('Estação removida do roteiro.', 'ok');
  };

  const handleUpdatePoint = (id: string, updatedFields: Partial<TrailPoint>) => {
    let updatedPoint: TrailPoint | null = null;
    const updated = pontos.map(p => {
      if (p.id === id) {
        updatedPoint = { ...p, ...updatedFields };
        return updatedPoint;
      }
      return p;
    });
    updatePontosAndStore(updated);
    showStatus('Parada atualizada.', 'ok');

    // Trigger background cloud sync for the updated point
    if (webAppUrl && updatedPoint) {
      savePointToCloudSilently(updatedPoint);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const listCopy = [...pontos];
    const temp = listCopy[index];
    listCopy[index] = listCopy[index - 1];
    listCopy[index - 1] = temp;
    updatePontosAndStore(listCopy);
  };

  const handleMoveDown = (index: number) => {
    if (index === pontos.length - 1) return;
    const listCopy = [...pontos];
    const temp = listCopy[index];
    listCopy[index] = listCopy[index + 1];
    listCopy[index + 1] = temp;
    updatePontosAndStore(listCopy);
  };

  const handleClearRoute = () => {
    if (window.confirm('Deseja realmente limpar todas as paradas do roteiro atual? Essa ação não apaga dados salvos no Google Sheets.')) {
      updatePontosAndStore([]);
      showStatus('Roteiro local limpo.', 'info');
    }
  };

  // Toast / Status helper
  const showStatus = (msg: string, type: 'info' | 'ok' | 'erro') => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage(current => current === msg ? '' : current);
      setStatusType(current => current === msg ? '' : current);
    }, 5000);
  };

  // CLOUD INTEGRATION: POST to Apps Script Web App
  const saveToCloud = async () => {
    if (!webAppUrl) {
      showStatus('Configure a URL da planilha Google primeiro.', 'erro');
      setIsConfigOpen(true);
      return;
    }
    if (pontos.length === 0) {
      showStatus('Adicione ao menos uma parada no roteiro antes de salvar.', 'erro');
      return;
    }

    setIsSavingCloud(true);
    setStatusMessage('Enviando dados para a nuvem...');
    setStatusType('info');

    try {
      const payload = {
        acao: 'salvar',
        pontos: pontos.map(p => ({
          id: p.id,
          data: p.data,
          nome: p.nome,
          local: p.local,
          Tags: p.local,
          tags: p.local,
          descricao: p.descricao,
          praticas: p.praticas,
          autor: p.autor,
          grupo: p.grupo,
          foto: p.foto || '' // sends optimized base64
        }))
      };

      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Standard Apps Script CORS payload
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      const result = JSON.parse(responseText);
      
      if (result.ok) {
        showStatus(`Roteiro compartilhado com sucesso! Fortalecendo o banco de práticas pedagógicas.`, 'ok');
        setActiveTab('banco-ideias');
        // Trigger list reload
        loadSharedPoints(true);
      } else {
        showStatus(`Falha ao compartilhar: ${result.erro || 'Erro desconhecido'}`, 'erro');
      }
    } catch (err: any) {
      console.error(err);
      showStatus('Não foi possível conectar à planilha. Verifique sua internet ou a URL configurada.', 'erro');
    } finally {
      setIsSavingCloud(false);
    }
  };

  // CLOUD INTEGRATION: GET from Apps Script Web App
  const loadFromCloud = async () => {
    if (!webAppUrl) {
      showStatus('Configure a URL da planilha Google primeiro.', 'erro');
      setIsConfigOpen(true);
      return;
    }

    setIsLoadingCloud(true);
    setStatusMessage('Buscando roteiros compartilhados na planilha...');
    setStatusType('info');

    try {
      const response = await fetch(`${webAppUrl}?acao=listar`);
      const responseText = await response.text();
      const result = JSON.parse(responseText);

      if (result.ok && Array.isArray(result.pontos)) {
        // Map fetched array to add client-side IDs
        const formattedPoints: TrailPoint[] = result.pontos.map((p: any, idx: number) => ({
          id: p.id || `cloud-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          data: p.data || new Date().toISOString(),
          nome: p.nome || 'Ponto sem nome',
          local: p.local || p.Tags || p.tags || 'Local não informado',
          descricao: p.descricao || '',
          praticas: p.praticas || '',
          autor: p.autor || 'Geral',
          grupo: p.grupo || '',
          foto: p.foto || undefined
        }));

        updatePontosAndStore(formattedPoints);
        showStatus(`Trilha sincronizada! ${formattedPoints.length} parada(s) carregada(s).`, 'ok');
      } else {
        showStatus(`Erro ao buscar dados: ${result.erro || 'A planilha não retornou paradas válida'}`, 'erro');
      }
    } catch (err: any) {
      console.error(err);
      showStatus('Falha na comunicação com a planilha. Verifique se o Script está publicado como "Qualquer pessoa".', 'erro');
    } finally {
      setIsLoadingCloud(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-parchment text-brand-terra selection:bg-brand-ochre/20 selection:text-brand-green font-sans pb-16">
      {/* O usuário não precisa configurar a planilha manualmente, ela já vem configurada e pronta para usar! */}
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Identification (Once) */}
        <div className="no-print">
          <EducatorProfile 
            autor={autor} 
            grupo={grupo} 
            onChange={handleProfileChange} 
          />
        </div>

        {/* Step 3: Gerenciador de Roteiros Locais (Offline e Confiável) */}
        <div className="no-print mt-4 mb-6 bg-brand-paper border border-brand-line rounded-[28px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsRoadmapsExpanded(!isRoadmapsExpanded)}
              className="font-serif font-bold text-sm text-brand-green flex items-center gap-2 hover:opacity-80 transition-all focus:outline-none cursor-pointer"
              title={isRoadmapsExpanded ? "Clique para recolher" : "Clique para expandir"}
            >
              <FolderOpen size={16} className="text-brand-ochre" />
              <span>Meus Roteiros Salvos</span>
              {isRoadmapsExpanded ? (
                <ChevronUp size={14} className="text-brand-ochre transition-transform" />
              ) : (
                <ChevronDown size={14} className="text-brand-ochre animate-pulse" />
              )}
            </button>
            <button
              type="button"
              onClick={handleCreateNewRoadmap}
              className="text-[11px] bg-brand-green/10 hover:bg-brand-green/20 text-brand-green font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus size={12} />
              <span>Novo Roteiro</span>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isRoadmapsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden space-y-4 pt-1"
              >
                {/* Active Roadmap Info */}
                <div className="bg-brand-parchment/65 border border-brand-line/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#8c8878] tracking-wider block">Roteiro Ativo</span>
                    <span className="font-serif font-bold text-sm text-brand-green leading-snug">
                      {activeRoadmapId 
                        ? savedRoadmaps.find(rm => rm.id === activeRoadmapId)?.nome || "Roteiro Selecionado"
                        : "Roteiro em Branco / Não Salvo"
                      }
                    </span>
                    <span className="text-[11px] text-brand-terra/60 block">
                      {pontos.length} {pontos.length === 1 ? 'parada registrada' : 'paradas registradas'}
                    </span>
                  </div>

                  {/* Save panel toggle or inline form */}
                  {!isSavePanelOpen ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentName = activeRoadmapId 
                          ? savedRoadmaps.find(rm => rm.id === activeRoadmapId)?.nome || '' 
                          : '';
                        setRoadmapNameInput(currentName);
                        setIsSavePanelOpen(true);
                      }}
                      className="self-start sm:self-center bg-[#d4a373] hover:bg-[#b58656] text-white font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Save size={13} />
                      <span>{activeRoadmapId ? 'Atualizar Roteiro' : 'Salvar Roteiro'}</span>
                    </button>
                  ) : (
                    <div className="flex-1 max-w-sm flex items-center gap-2">
                      <input
                        type="text"
                        value={roadmapNameInput}
                        onChange={(e) => setRoadmapNameInput(e.target.value)}
                        placeholder="Nome do roteiro (ex: Aula do 5º Ano)"
                        className="flex-1 bg-brand-paper border border-[#e6e2d3] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green text-brand-terra"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRoadmapLocally(roadmapNameInput)}
                        className="bg-brand-green hover:bg-[#4a4a35] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSavePanelOpen(false)}
                        className="text-xs text-brand-terra/50 hover:text-brand-terra font-semibold px-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {/* List of saved roadmaps */}
                {savedRoadmaps.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-brand-line/40">
                    <span className="text-[10px] uppercase font-bold text-[#8c8878] tracking-wider block">Histórico de Roteiros</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {savedRoadmaps.map((rm) => (
                        <div
                          key={rm.id}
                          onClick={() => handleLoadRoadmap(rm.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            activeRoadmapId === rm.id
                              ? 'bg-[#f0f4ec] border-brand-green/40 text-brand-green font-medium'
                              : 'bg-brand-parchment/30 hover:bg-[#fbfaf8] border-brand-line/50 text-brand-terra/80 hover:text-brand-green'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="text-xs font-bold truncate leading-tight">{rm.nome}</p>
                            <p className="text-[10px] text-brand-terra/50 mt-0.5">
                              {rm.pontos.length} {rm.pontos.length === 1 ? 'parada' : 'paradas'} · {new Date(rm.dataCriacao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSavedRoadmap(rm.id, e)}
                            className="text-brand-terra/40 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors shrink-0"
                            title="Excluir roteiro"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 2: Form to Add Points (excludes Autor/Grupo fields) */}
        <div className="no-print">
          <AddPointForm 
            onAddPoint={handleAddPoint} 
            hasProfile={!!autor && !!grupo} 
          />
        </div>

        {/* Tab Segmented Control */}
        <div className="no-print mt-2">
          <div className="flex bg-[#f5f2ed] p-1.5 rounded-[24px] mb-6 border border-brand-line/50 select-none">
            <button
              type="button"
              onClick={() => setActiveTab('meu-roteiro')}
              className={`flex-1 py-3 px-4 rounded-[20px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'meu-roteiro'
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'text-brand-terra/60 hover:text-brand-green'
              }`}
            >
              <Map size={15} />
              <span>Meu Roteiro ({pontos.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('banco-ideias')}
              className={`flex-1 py-3 px-4 rounded-[20px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'banco-ideias'
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'text-brand-terra/60 hover:text-brand-green'
              }`}
            >
              <Compass size={15} />
              <span>Banco de Práticas</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Local Route (Always visible when printing) */}
        <div className={activeTab === 'meu-roteiro' ? 'block' : 'hidden print:block'}>
          <section className="mt-4">
            <div className="flex items-center justify-between mb-5 border-b border-brand-line pb-2">
              <h2 className="font-serif font-bold text-2xl text-brand-green flex items-center gap-2">
                <Map size={24} className="text-brand-ochre" />
                Roteiro da Trilha
              </h2>
              
              {pontos.length > 0 && (
                <button
                  onClick={handleClearRoute}
                  className="text-xs text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 font-semibold transition-colors cursor-pointer no-print"
                >
                  <Trash2 size={13} />
                  Limpar Roteiro
                </button>
              )}
            </div>

            {pontos.length === 0 ? (
              <div className="text-center py-12 px-6 border border-brand-line rounded-[32px] bg-brand-paper shadow-sm">
                <div className="w-16 h-16 bg-brand-parchment rounded-full flex items-center justify-center text-brand-ochre mx-auto mb-4 border border-brand-line/50">
                  <Compass size={32} className="animate-spin-slow" />
                </div>
                <h3 className="font-serif font-bold text-lg text-brand-green mb-1">Seu roteiro está vazio</h3>
                <p className="text-sm text-brand-terra/60 max-w-sm mx-auto">
                  Utilize o formulário acima para mapear e registrar os pontos da aula-passeio do Sítio-Escola Geranium.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pontos.map((p, idx) => (
                  <PointCard
                    key={p.id}
                    point={p}
                    index={idx}
                    totalPoints={pontos.length}
                    onDelete={handleDeletePoint}
                    onUpdate={handleUpdatePoint}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                  />
                ))}
              </div>
            )}
          </section>

          {pontos.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3 no-print">
              <button
                type="button"
                onClick={saveToCloud}
                disabled={isSavingCloud}
                className="flex-1 bg-brand-ochre hover:bg-[#b87614] text-white font-bold text-sm px-6 py-4 rounded-full flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Share2 size={16} />
                <span>{isSavingCloud ? 'Sincronizando...' : '☁ Compartilhar no Banco de Práticas'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-brand-green hover:bg-[#4a4a35] text-white font-bold text-sm px-6 py-4 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Printer size={16} />
                <span>🖨 Imprimir Roteiro</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 2: Shared Practice Pool (Hidden when printing) */}
        <div className={`no-print ${activeTab === 'banco-ideias' ? 'block animate-in fade-in duration-200' : 'hidden'}`}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Buscar por ponto, educador ou prática..."
                className="flex-1 bg-[#f9f8f6] border border-[#e6e2d3] rounded-full px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green text-brand-terra"
              />
              <button
                type="button"
                onClick={() => loadSharedPoints(false)}
                disabled={isLoadingShared}
                className="bg-brand-green hover:bg-[#4a4a35] text-white font-bold text-xs px-5 py-3 rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
                title="Atualizar mural"
              >
                <RefreshCw size={13} className={isLoadingShared ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
            </div>

            {/* Clickable Quick Tag Filters */}
            {sharedPoints.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs bg-[#fbfaf8] border border-brand-line/40 p-2.5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-[#8c8878] mr-1 flex items-center gap-1">
                  <Tag size={10} className="text-brand-ochre" />
                  Filtrar por Tag:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFilterTag(null)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    selectedFilterTag === null
                      ? 'bg-brand-ochre text-white border-brand-ochre shadow-sm'
                      : 'bg-[#f9f8f6] text-[#8c8878] border-[#e6e2d3] hover:bg-[#f5f2ed]'
                  }`}
                >
                  Todas
                </button>
                {Array.from(new Set([
                  'infantil', 'fundamental', 'contraturno',
                  ...sharedPoints.flatMap(p => 
                    p.local ? p.local.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : []
                  )
                ])).map((tag) => {
                  const isSelected = selectedFilterTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedFilterTag(isSelected ? null : tag)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer capitalize ${
                        isSelected
                          ? 'bg-brand-green text-white border-brand-green shadow-sm'
                          : 'bg-[#f9f8f6] text-[#8c8878] border-[#e6e2d3] hover:bg-[#f5f2ed]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}

            {!webAppUrl ? (
              <div className="text-center py-10 px-6 border border-brand-line rounded-[24px] bg-brand-paper shadow-sm">
                <Settings size={28} className="text-brand-ochre mx-auto mb-3" />
                <h4 className="font-serif font-bold text-base text-brand-green mb-1">Integração não configurada</h4>
                <p className="text-xs text-brand-terra/60 max-w-sm mx-auto mb-4">
                  Para acessar o Banco de Práticas Compartilhadas das outras professoras, configure a planilha Google Sheets clicando no botão de engrenagem no topo.
                </p>
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="bg-brand-green hover:bg-brand-leaf text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
                >
                  Configurar Agora
                </button>
              </div>
            ) : isLoadingShared && sharedPoints.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw size={24} className="animate-spin text-brand-ochre mx-auto mb-2" />
                <p className="text-xs text-brand-terra/60">Buscando práticas compartilhadas...</p>
              </div>
            ) : (
              <>
                {(() => {
                  const query = normalizeSearchText(searchQuery);
                  const filtered = sharedPoints.filter(p => {
                    const matchesText = !query || 
                      normalizeSearchText(p.nome).includes(query) ||
                      normalizeSearchText(p.local).includes(query) ||
                      normalizeSearchText(p.descricao).includes(query) ||
                      normalizeSearchText(p.praticas).includes(query) ||
                      normalizeSearchText(p.autor).includes(query) ||
                      normalizeSearchText(p.grupo).includes(query);
                    
                    const matchesTag = !selectedFilterTag || 
                      normalizeSearchText(p.local).split(',').map(t => t.trim().toLowerCase()).includes(normalizeSearchText(selectedFilterTag));
                      
                    return matchesText && matchesTag;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 px-4 border border-brand-line rounded-[24px] bg-brand-paper shadow-sm">
                        <p className="text-xs text-brand-terra/60 font-medium">Nenhuma prática compartilhada encontrada para os filtros selecionados.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filtered.map((point) => (
                        <div key={point.id} className="bg-brand-paper border border-brand-line rounded-[24px] p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row gap-5 items-start">
                          {/* Photo or Placeholder */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f5f2ed] rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-brand-line shadow-inner">
                            {point.foto ? (
                              <button
                                type="button"
                                onClick={() => setActiveZoomedPhoto({ src: point.foto!, title: point.nome })}
                                className="w-full h-full p-0 border-0 bg-transparent cursor-zoom-in focus:outline-none overflow-hidden relative group/shared-photo"
                                title="Clique para ampliar a foto"
                              >
                                <img
                                  src={point.foto}
                                  alt={point.nome}
                                  className="w-full h-full object-cover animate-fade-in transition-transform group-hover/shared-photo:scale-110 duration-500"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/shared-photo:bg-black/10 transition-colors flex items-center justify-center">
                                  <span className="text-[8px] text-white bg-black/60 px-1 py-0.5 rounded opacity-0 group-hover/shared-photo:opacity-100 transition-opacity font-sans font-bold uppercase">
                                    Ampliar
                                  </span>
                                </div>
                              </button>
                            ) : (
                              <span className="text-[10px] italic text-[#8c8878] font-serif">Sem foto</span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-brand-leaf font-bold uppercase tracking-wider mb-0.5">
                                <span className="bg-[#f0f4ec] px-2 py-0.5 rounded-full text-brand-green">{point.grupo || 'Grupo'}</span>
                                <span className="text-brand-terra/50 font-normal">por {point.autor || 'Educadora'}</span>
                              </div>
                              <h4 className="font-serif font-bold text-base text-brand-green leading-snug">{point.nome}</h4>
                              
                              {/* Display Tags as Badges */}
                              <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                                <Tag size={12} className="text-brand-ochre shrink-0" />
                                {(point.local || '').split(',').map((tag, tIdx) => {
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

                            {point.descricao && (
                              <p className="text-xs text-[#6b6858] italic leading-relaxed line-clamp-3">
                                {point.descricao}
                              </p>
                            )}

                            {point.praticas && (
                              <div className="bg-[#fcfbf9] border border-brand-line/45 p-3 rounded-xl text-[11px] leading-relaxed">
                                <strong className="text-brand-green block font-serif italic text-xs mb-0.5">💡 Prática Sugerida:</strong>
                                <p className="text-brand-terra/90">{point.praticas}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="w-full sm:w-auto self-stretch sm:self-center flex sm:flex-col justify-end items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-line/40">
                            <button
                              type="button"
                              onClick={() => handleCopySharedPoint(point)}
                              className="w-full sm:w-auto bg-brand-green hover:bg-brand-leaf text-white font-bold text-xs px-4 py-2.5 rounded-full flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                            >
                              <span>+ Usar Prática</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>

        {/* Unified Status Notifications */}
        {statusMessage && (
          <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full no-print animate-in slide-in-from-bottom-5 duration-300">
            <div className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 ${
              statusType === 'ok' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : statusType === 'erro' 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}>
              {statusType === 'ok' ? (
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : statusType === 'erro' ? (
                <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw size={20} className="text-indigo-600 shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="text-xs font-semibold leading-relaxed">
                {statusMessage}
              </div>
            </div>
          </div>
        )}

        {/* Settings/Apps Script Dialog */}
        <ConfigDialog 
          isOpen={isConfigOpen} 
          onClose={() => setIsConfigOpen(false)} 
          url={webAppUrl}
          onSaveUrl={handleSaveUrl}
        />

        {/* Retro-Styled Lightbox Modal to Expand Image for the shared gallery */}
        <AnimatePresence>
          {activeZoomedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveZoomedPhoto(null)}
              className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-4 md:p-8 cursor-zoom-out no-print"
            >
              {/* Close button with high visibility */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveZoomedPhoto(null);
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
                  src={activeZoomedPhoto.src}
                  alt={activeZoomedPhoto.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl select-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* Photo Legend */}
                <div className="mt-3 px-2 flex flex-col items-center text-center gap-1">
                  <h4 className="font-serif font-bold text-base text-brand-green leading-tight">
                    {activeZoomedPhoto.title}
                  </h4>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helpful instructions footer */}
        <footer className="mt-12 text-center text-xs text-brand-terra/40 border-t border-brand-line/40 pt-4 max-w-lg mx-auto leading-relaxed no-print">
          <p className="font-semibold mb-1">Sítio-Escola Geranium · Brasília - DF</p>
          <p>
            Esta ferramenta apoia o planejamento de aulas-passeio baseadas no tateamento experimental de Freinet através da colaboração mútua de professores.
          </p>
        </footer>
      </main>
    </div>
  );
}
