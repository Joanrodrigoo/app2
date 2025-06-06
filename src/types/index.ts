// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface PendingRegistration {
  email: string;
  token: string;
  expiresAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Google Ads related types
export interface GoogleAdsAccount {
  id: string;
  accountId: string;
  accountName: string;
  connected: boolean;
  userId: string;
  refreshToken: string;
  createdAt: string;
  lastSyncedAt: string | null;
  accountType: 'STANDARD' | 'MCC'; // Nuevo campo para distinguir tipos de cuenta
  parentAccountId?: string; // ID de la cuenta MCC padre si es una subcuenta
}

export interface Campaign {
  id: string;
  accountId: string;
  campaignId: string;
  name: string;
  type: 'SEARCH' | 'DISPLAY' | 'SHOPPING' | 'VIDEO';
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  budget: number;
  startDate: string;
  endDate: string | null;
  lastSyncedAt: string;
}

export interface AdGroup {
  id: string;
  campaignId: string;
  adGroupId: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
}

export interface Ad {
  id: string;
  adGroupId: string;
  adId: string;
  headline: string;
  description: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
}

export interface Metrics {
  id: string;
  entityId: string; // Could be campaign ID, ad group ID, or ad ID
  entityType: 'CAMPAIGN' | 'ADGROUP' | 'AD';
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  date: string;
}

// AI Feedback related types
export interface AiFeedback {
  id: string;
  entityId: string; // Could be campaign ID, ad group ID, or ad ID
  entityType: 'CAMPAIGN' | 'ADGROUP' | 'AD';
  feedback: string;
  recommendations: string[];
  createdAt: string;
}

export interface Recomendacion {
  id: number;
  customer_id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  impacto_estimado: string;
  tipo_objeto: string;
  objeto_id: number | null;
  estado: 'pendiente' | 'aplicada' | 'rechazada' | 'fallida';
  fecha_aplicacion: string | null;
  fecha_creacion: string;
   resultado?: {
    estado: "improved" | "no_change" | "worsened";
    mejora_real: string;
    periodo_comparacion: string;
    variacion_kpi: number;
  };
  detalle?: {
    justificacion: string;
    kpi_objetivo: string;
    valor_actual: string;
    valor_esperado: string;
  };
  nombre_objeto?: string;

}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
