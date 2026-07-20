/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TrailPoint {
  id: string;
  data: string;
  nome: string;
  local: string;
  descricao: string;
  praticas: string;
  autor: string;
  grupo: string;
  foto?: string; // Base64 data URL
}

export interface SavedRoadmap {
  id: string;
  nome: string;
  dataCriacao: string;
  pontos: TrailPoint[];
  autor: string;
  grupo: string;
}

export interface WebAppConfig {
  url: string;
}
