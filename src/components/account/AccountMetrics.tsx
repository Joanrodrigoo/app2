import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { googleAdsApi } from "@/services/api";

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

const AccountMetrics = ({ accountId, dateRange }: AccountMetricsProps) => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos de la API
  const fetchAccountMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await googleAdsApi.getFullAccountData(accountId);
      
      if (response.success && response.data) {
        // Aquí necesitarás adaptar según la estructura real de tu respuesta
        // Este es un ejemplo de cómo mapear los datos
        const apiData = response.data;
        
        const metricsData: MetricsData = {
          spend: apiData.spend || apiData.cost || 0,
          impressions: apiData.impressions || 0,
          clicks: apiData.clicks || 0,
          conversions: apiData.conversions || 0,
          ctr: apiData.ctr || (apiData.clicks && apiData.impressions ? (apiData.clicks / apiData.impressions) * 100 : 0),
          cpc: apiData.cpc || apiData.averageCpc || (apiData.cost && apiData.clicks ? apiData.cost / apiData.clicks : 0),
          conversionRate: apiData.conversionRate || (apiData.conversions && apiData.clicks ? (apiData.conversions / apiData.clicks) * 100 : 0),
          costPerConversion: apiData.costPerConversion || (apiData.cost && apiData.conversions ? apiData.cost / apiData.conversions : 0)
        };
        
        setMetrics(metricsData);
      } else {
        setError(response.error || "Error al obtener los datos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos cuando cambie accountId o dateRange
  useEffect(() => {
    if (accountId) {
      fetchAccountMetrics();
    }
  }, [accountId, dateRange]);

  // Estados de carga y error
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error al cargar las métricas: {error}</p>
              <button 
                onClick={fetchAccountMetrics}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No hay datos disponibles</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular cambios porcentuales (esto requeriría datos históricos, por ahora son valores mock)
  const getChangeValue = (metric: keyof MetricsData) => {
    // Aquí podrías implementar lógica real para calcular cambios
    // basándose en datos históricos o comparaciones de períodos
    const mockChanges = {
      spend: "+12.5%",
      impressions: "+8.2%",
      clicks: "+15.3%",
      conversions: "+22.1%",
      ctr: "+0.3%",
      cpc: "-5.2%",
      conversionRate: "+0.8%",
      costPerConversion: "-12.1%"
    };
    return mockChanges[metric] || "0%";
  };

  const metricCards = [
    { title: "Gasto", value: formatCurrency(metrics.spend), change: getChangeValue('spend') },
    { title: "Impresiones", value: metrics.impressions.toLocaleString(), change: getChangeValue('impressions') },
    { title: "Clics", value: metrics.clicks.toLocaleString(), change: getChangeValue('clicks') },
    { title: "Conversiones", value: metrics.conversions.toString(), change: getChangeValue('conversions') },
    { title: "CTR", value: `${metrics.ctr.toFixed(2)}%`, change: getChangeValue('ctr') },
    { title: "CPC", value: formatCurrency(metrics.cpc), change: getChangeValue('cpc') },
    { title: "Tasa Conv.", value: `${metrics.conversionRate.toFixed(2)}%`, change: getChangeValue('conversionRate') },
    { title: "Coste/Conv.", value: formatCurrency(metrics.costPerConversion), change: getChangeValue('costPerConversion') }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className={`text-xs ${
              metric.change.startsWith('+') ? 'text-green-600' : 
              metric.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
            }`}>
              {metric.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AccountMetrics;