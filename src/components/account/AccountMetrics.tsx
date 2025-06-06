import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCampaignMetrics } from "@/services/api";

interface AccountMetricsProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
}

interface MetricsData {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  costPerConversion: number;
}

// Cache para evitar llamadas duplicadas
const metricsCache = new Map<string, { data: MetricsData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Componente de skeleton optimizado
const MetricSkeleton = React.memo(() => (
  <Card className="animate-pulse">
    <CardHeader className="pb-2">
      <div className="h-4 bg-muted rounded w-3/4"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/4"></div>
    </CardContent>
  </Card>
));

// Componente de tarjeta de métrica optimizado
const MetricCard = React.memo(({ 
  title, 
  value, 
  change, 
  isLoading 
}: { 
  title: string; 
  value: string; 
  change: string; 
  isLoading?: boolean;
}) => {
  const changeColor = useMemo(() => {
    if (change.startsWith('+')) return 'text-green-600';
    if (change.startsWith('-')) return 'text-red-600';
    return 'text-muted-foreground';
  }, [change]);

  const ChangeIcon = useMemo(() => {
    if (change.startsWith('+')) return TrendingUp;
    if (change.startsWith('-')) return TrendingDown;
    return Minus;
  }, [change]);

  if (isLoading) return <MetricSkeleton />;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className={`flex items-center gap-1 text-xs ${changeColor}`}>
          <ChangeIcon className="h-3 w-3" />
          <span>{change}</span>
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

const AccountMetrics = ({ accountId, dateRange }: AccountMetricsProps) => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Ref para cancelar requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Generar clave de cache
  const cacheKey = useMemo(() => 
    `${accountId}-${dateRange.from.getTime()}-${dateRange.to.getTime()}`,
    [accountId, dateRange]
  );

  // Función para limpiar cache expirado
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of metricsCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        metricsCache.delete(key);
      }
    }
  }, []);

  // Función optimizada para mapear datos de la API
  const mapApiDataToMetrics = useCallback((apiData: any): MetricsData => {
    const spend = apiData.spend || apiData.cost || 0;
    const impressions = apiData.impressions || 0;
    const clicks = apiData.clicks || 0;
    const conversions = apiData.conversions || 0;

    return {
      spend,
      impressions,
      clicks,
      conversions,
      ctr: apiData.ctr || (clicks && impressions ? (clicks / impressions) * 100 : 0),
      cpc: apiData.cpc || apiData.averageCpc || (spend && clicks ? spend / clicks : 0),
      conversionRate: apiData.conversionRate || (conversions && clicks ? (conversions / clicks) * 100 : 0),
      costPerConversion: apiData.costPerConversion || (spend && conversions ? spend / conversions : 0)
    };
  }, []);

  // Función para obtener datos con cache y optimizaciones
  const fetchAccountMetrics = useCallback(async (forceRefresh = false) => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpiar cache expirado
    cleanExpiredCache();

    // Verificar cache si no es refresh forzado
    if (!forceRefresh) {
      const cached = metricsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setMetrics(cached.data);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(!forceRefresh);
    setIsRefreshing(forceRefresh);
    setError(null);

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    
    try {
      // Timeout para evitar esperas largas
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const apiPromise = getCampaignMetrics(accountId);
      
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      // Verificar si el request fue cancelado
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      if (response) {
  const metricsData = mapApiDataToMetrics(response);

        
        // Guardar en cache
        metricsCache.set(cacheKey, {
          data: metricsData,
          timestamp: Date.now()
        });
        
        setMetrics(metricsData);
        setError(null);
      } else {
        throw new Error(response.error || "Error al obtener los datos");
      }
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return; // Request cancelado, no mostrar error
      }
      
      console.error("Error fetching metrics:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      
      // En caso de error, intentar usar datos de cache aunque estén expirados
      const cached = metricsCache.get(cacheKey);
      if (cached) {
        setMetrics(cached.data);
        setError("Mostrando datos en cache (pueden estar desactualizados)");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [accountId, cacheKey, cleanExpiredCache, mapApiDataToMetrics]);

  // Efecto principal para cargar datos
  useEffect(() => {
    if (accountId) {
      fetchAccountMetrics();
    }

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [accountId, dateRange, fetchAccountMetrics]);

  // Función para manejar refresh manual
  const handleRefresh = useCallback(() => {
    fetchAccountMetrics(true);
  }, [fetchAccountMetrics]);

  // Memoizar cálculo de cambios (valores mock optimizados)
  const mockChanges = useMemo(() => ({
    spend: "+12.5%",
    impressions: "+8.2%",
    clicks: "+15.3%",
    conversions: "+22.1%",
    ctr: "+0.3%",
    cpc: "-5.2%",
    conversionRate: "+0.8%",
    costPerConversion: "-12.1%"
  }), []);

  const getChangeValue = useCallback((metric: keyof MetricsData) => 
    mockChanges[metric] || "0%",
    [mockChanges]
  );

  // Memoizar configuración de tarjetas
  const metricCards = useMemo(() => {
    if (!metrics) return [];
    
    return [
      { 
        title: "Gasto", 
        value: formatCurrency(metrics.spend), 
        change: getChangeValue('spend'),
        key: 'spend'
      },
      { 
        title: "Impresiones", 
        value: metrics.impressions.toLocaleString(), 
        change: getChangeValue('impressions'),
        key: 'impressions'
      },
      { 
        title: "Clics", 
        value: metrics.clicks.toLocaleString(), 
        change: getChangeValue('clicks'),
        key: 'clicks'
      },
      { 
        title: "Conversiones", 
        value: metrics.conversions.toString(), 
        change: getChangeValue('conversions'),
        key: 'conversions'
      },
      { 
        title: "CTR", 
        value: `${metrics.ctr.toFixed(2)}%`, 
        change: getChangeValue('ctr'),
        key: 'ctr'
      },
      { 
        title: "CPC", 
        value: formatCurrency(metrics.cpc), 
        change: getChangeValue('cpc'),
        key: 'cpc'
      },
      { 
        title: "Tasa Conv.", 
        value: `${metrics.conversionRate.toFixed(2)}%`, 
        change: getChangeValue('conversionRate'),
        key: 'conversionRate'
      },
      { 
        title: "Coste/Conv.", 
        value: formatCurrency(metrics.costPerConversion), 
        change: getChangeValue('costPerConversion'),
        key: 'costPerConversion'
      }
    ];
  }, [metrics, getChangeValue]);

  // Estado de carga inicial
  if (loading && !metrics) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Métricas de la Cuenta</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <MetricSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Estado de error sin datos
  if (error && !metrics) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Métricas de la Cuenta</h3>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="mb-4">Error al cargar las métricas: {error}</p>
              <Button onClick={handleRefresh} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Métricas de la Cuenta</h3>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>
      
      {error && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <MetricCard
            key={metric.key}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            isLoading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(AccountMetrics);