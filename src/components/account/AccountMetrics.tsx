
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface AccountMetricsProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
}

const AccountMetrics = ({ accountId, dateRange }: AccountMetricsProps) => {
  // Mock data
  const metrics = {
    spend: 12543.67,
    impressions: 1245789,
    clicks: 34567,
    conversions: 456,
    ctr: 2.77,
    cpc: 0.36,
    conversionRate: 1.32,
    costPerConversion: 27.51
  };

  const metricCards = [
    { title: "Gasto", value: formatCurrency(metrics.spend), change: "+12.5%" },
    { title: "Impresiones", value: metrics.impressions.toLocaleString(), change: "+8.2%" },
    { title: "Clics", value: metrics.clicks.toLocaleString(), change: "+15.3%" },
    { title: "Conversiones", value: metrics.conversions.toString(), change: "+22.1%" },
    { title: "CTR", value: `${metrics.ctr}%`, change: "+0.3%" },
    { title: "CPC", value: formatCurrency(metrics.cpc), change: "-5.2%" },
    { title: "Tasa Conv.", value: `${metrics.conversionRate}%`, change: "+0.8%" },
    { title: "Coste/Conv.", value: formatCurrency(metrics.costPerConversion), change: "-12.1%" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {metric.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AccountMetrics;