
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AudiencesListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
}

const AudiencesList = ({ accountId, dateRange }: AudiencesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const audiences = [
    {
      id: "1",
      name: "Remarketing - Visitantes Web",
      type: "REMARKETING",
      campaignName: "Campaña Verano 2024",
      targeting: "TARGETING",
      bidAdjustment: 50,
      impressions: 12345,
      clicks: 234,
      conversions: 18,
      ctr: 1.9,
      cpc: 0.45,
      audienceSize: "10K - 50K"
    },
    {
      id: "2",
      name: "Audiencia Similar - Compradores",
      type: "SIMILAR", 
      campaignName: "Display - Awareness",
      targeting: "TARGETING",
      bidAdjustment: 25,
      impressions: 45678,
      clicks: 567,
      conversions: 12,
      ctr: 1.2,
      cpc: 0.32,
      audienceSize: "100K - 500K"
    },
    {
      id: "3",
      name: "Intereses - Moda y Ropa",
      type: "AFFINITY",
      campaignName: "Display - Awareness",
      targeting: "OBSERVATION",
      bidAdjustment: 0,
      impressions: 78901,
      clicks: 890,
      conversions: 23,
      ctr: 1.1,
      cpc: 0.28,
      audienceSize: "1M - 5M"
    },
    {
      id: "4",
      name: "Datos demográficos - 25-34 años",
      type: "DEMOGRAPHIC",
      campaignName: "Campaña Verano 2024",
      targeting: "TARGETING",
      bidAdjustment: 15,
      impressions: 23456,
      clicks: 345,
      conversions: 28,
      ctr: 1.5,
      cpc: 0.35,
      audienceSize: "500K - 1M"
    }
  ];

  const filteredAudiences = audiences.filter(audience =>
    audience.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audience.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    const colors = {
      REMARKETING: "bg-purple-100 text-purple-800",
      SIMILAR: "bg-blue-100 text-blue-800",
      AFFINITY: "bg-green-100 text-green-800",
      DEMOGRAPHIC: "bg-orange-100 text-orange-800",
      CUSTOM: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      REMARKETING: "Remarketing",
      SIMILAR: "Similar",
      AFFINITY: "Afinidad",
      DEMOGRAPHIC: "Demográfico",
      CUSTOM: "Personalizada"
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const getTargetingBadge = (targeting: string) => {
    switch (targeting) {
      case "TARGETING":
        return <Badge className="bg-green-500">Segmentación</Badge>;
      case "OBSERVATION":
        return <Badge variant="outline">Observación</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getBidAdjustmentBadge = (adjustment: number) => {
    if (adjustment > 0) {
      return <Badge className="bg-green-500">+{adjustment}%</Badge>;
    } else if (adjustment < 0) {
      return <Badge className="bg-red-500">{adjustment}%</Badge>;
    } else {
      return <Badge variant="outline">0%</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Segmentación de Audiencias ({filteredAudiences.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar audiencias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Audiencia</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Campaña</TableHead>
              <TableHead>Segmentación</TableHead>
              <TableHead>Ajuste Puja</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Impresiones</TableHead>
              <TableHead>Clics</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Conversiones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAudiences.map((audience) => (
              <TableRow key={audience.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{audience.name}</TableCell>
                <TableCell>{getTypeBadge(audience.type)}</TableCell>
                <TableCell className="text-muted-foreground">{audience.campaignName}</TableCell>
                <TableCell>{getTargetingBadge(audience.targeting)}</TableCell>
                <TableCell>{getBidAdjustmentBadge(audience.bidAdjustment)}</TableCell>
                <TableCell>{audience.audienceSize}</TableCell>
                <TableCell>{audience.impressions.toLocaleString()}</TableCell>
                <TableCell>{audience.clicks.toLocaleString()}</TableCell>
                <TableCell>{audience.ctr}%</TableCell>
                <TableCell>{formatCurrency(audience.cpc)}</TableCell>
                <TableCell>{audience.conversions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AudiencesList;
