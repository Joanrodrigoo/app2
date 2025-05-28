
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AdGroupsListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
}

const AdGroupsList = ({ accountId, dateRange }: AdGroupsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const adGroups = [
    {
      id: "1",
      name: "Productos Verano - Camisetas",
      campaignName: "Campaña Verano 2024",
      status: "ENABLED",
      bid: 0.85,
      spend: 45.30,
      impressions: 12345,
      clicks: 234,
      conversions: 12,
      ctr: 1.9,
      cpc: 0.19,
      qualityScore: 7
    },
    {
      id: "2",
      name: "Productos Verano - Shorts",
      campaignName: "Campaña Verano 2024", 
      status: "ENABLED",
      bid: 0.75,
      spend: 67.20,
      impressions: 18976,
      clicks: 445,
      conversions: 28,
      ctr: 2.3,
      cpc: 0.15,
      qualityScore: 8
    },
    {
      id: "3",
      name: "Awareness - General",
      campaignName: "Display - Awareness",
      status: "ENABLED", 
      bid: 0.05,
      spend: 123.45,
      impressions: 45678,
      clicks: 567,
      conversions: 5,
      ctr: 1.2,
      cpc: 0.22,
      qualityScore: 6
    }
  ];

  const filteredAdGroups = adGroups.filter(adGroup =>
    adGroup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adGroup.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENABLED":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "PAUSED":
        return <Badge variant="outline">Pausado</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getQualityScoreBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-500">{score}</Badge>;
    if (score >= 6) return <Badge className="bg-yellow-500">{score}</Badge>;
    return <Badge className="bg-red-500">{score}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Grupos de Anuncios ({filteredAdGroups.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar grupos de anuncios..."
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
              <TableHead>Grupo de Anuncios</TableHead>
              <TableHead>Campaña</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Puja</TableHead>
              <TableHead>Gasto</TableHead>
              <TableHead>Impresiones</TableHead>
              <TableHead>Clics</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Conversiones</TableHead>
              <TableHead>Quality Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdGroups.map((adGroup) => (
              <TableRow key={adGroup.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{adGroup.name}</TableCell>
                <TableCell className="text-muted-foreground">{adGroup.campaignName}</TableCell>
                <TableCell>{getStatusBadge(adGroup.status)}</TableCell>
                <TableCell>{formatCurrency(adGroup.bid)}</TableCell>
                <TableCell>{formatCurrency(adGroup.spend)}</TableCell>
                <TableCell>{adGroup.impressions.toLocaleString()}</TableCell>
                <TableCell>{adGroup.clicks.toLocaleString()}</TableCell>
                <TableCell>{adGroup.ctr}%</TableCell>
                <TableCell>{formatCurrency(adGroup.cpc)}</TableCell>
                <TableCell>{adGroup.conversions}</TableCell>
                <TableCell>{getQualityScoreBadge(adGroup.qualityScore)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdGroupsList;
