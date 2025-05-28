import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardSummary {
  avgImpressions: number;
  avgClicks: number;
  avgCost: number;
  avgConversions: number;
}

interface Metric {
  label: string;
  value: string | number;
  prevValue: string | number;
  change: number;
  prefix?: string;
  increased?: boolean;
}

const MetricsOverview = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard-summary")
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data: DashboardSummary) => {
        setSummary(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando métricas...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!summary) return null;

  // Aquí podrías calcular métricas de cambio entre periodos si tu backend las entrega,
  // por simplicidad vamos a poner valores de ejemplo para prevValue y cambio:

  const metrics: Metric[] = [
  {
    label: "Total Impressions",
    value: typeof summary.avgImpressions === "number" ? summary.avgImpressions.toLocaleString() : "0",
    prevValue: "48,200", // ejemplo
    change: 35.9,
    increased: true,
  },
  {
    label: "Total Clicks",
    value: typeof summary.avgClicks === "number" ? summary.avgClicks.toLocaleString() : "0",
    prevValue: "1,890",
    change: 20.1,
    increased: true,
  },
  {
    label: "Total Cost",
    value: typeof summary.avgCost === "number" ? summary.avgCost : 0,
    prevValue: 3850.75,
    change: 11.7,
    prefix: "$",
    increased: true,
  },
  {
    label: "Avg. Conversions",
    value:
      typeof summary.avgConversions === "number"
        ? summary.avgConversions.toFixed(2)
        : "0.00",
    prevValue: 2.5,
    change: -6.9,
    increased: false,
  },
];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
            {metric.increased !== undefined && (
              <div className={`flex items-center space-x-1 ${metric.increased ? "text-green-500" : "text-red-500"}`}>
                {metric.increased ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-xs font-medium">{metric.change}%</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof metric.value === "number" && metric.prefix
                ? formatCurrency(metric.value)
                : metric.prefix
                ? `${metric.prefix}${metric.value}`
                : metric.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs.{" "}
              {typeof metric.prevValue === "number" && metric.prefix
                ? formatCurrency(metric.prevValue)
                : metric.prefix
                ? `${metric.prefix}${metric.prevValue}`
                : metric.prevValue}{" "}
              last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsOverview;
