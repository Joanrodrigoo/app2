
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AdsListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
}

const AdsList = ({ accountId, dateRange }: AdsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const ads = [
    {
      id: "1",
      headline1: "Camisetas de Verano 2024",
      headline2: "Descuentos hasta 50%",
      description: "Encuentra las mejores camisetas para este verano. Envío gratis a partir de 50€.",
      adGroupName: "Productos Verano - Camisetas",
      status: "ENABLED",
      impressions: 8765,
      clicks: 123,
      conversions: 8,
      ctr: 1.4,
      cpc: 0.18,
      finalUrl: "https://ejemplo.com/camisetas-verano"
    },
    {
      id: "2",
      headline1: "Shorts Modernos",
      headline2: "Calidad Premium",
      description: "Shorts cómodos y modernos para el día a día. Múltiples colores disponibles.",
      adGroupName: "Productos Verano - Shorts",
      status: "ENABLED",
      impressions: 12456,
      clicks: 287,
      conversions: 19,
      ctr: 2.3,
      cpc: 0.23,
      finalUrl: "https://ejemplo.com/shorts"
    },
    {
      id: "3",
      headline1: "Tu Marca Favorita",
      headline2: "Nuevos Productos",
      description: "Descubre nuestra nueva colección de ropa casual para esta temporada.",
      adGroupName: "Awareness - General",
      status: "PAUSED",
      impressions: 5432,
      clicks: 67,
      conversions: 1,
      ctr: 1.2,
      cpc: 0.45,
      finalUrl: "https://ejemplo.com/nueva-coleccion"
    }
  ];

  const filteredAds = ads.filter(ad =>
    ad.headline1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.headline2.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.adGroupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENABLED":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "PAUSED":
        return <Badge variant="outline">Pausado</Badge>;
      case "REMOVED":
        return <Badge variant="destructive">Eliminado</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Anuncios ({filteredAds.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar anuncios..."
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
              <TableHead className="w-[300px]">Anuncio</TableHead>
              <TableHead>Grupo de Anuncios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Impresiones</TableHead>
              <TableHead>Clics</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Conversiones</TableHead>
              <TableHead>URL Final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAds.map((ad) => (
              <TableRow key={ad.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-blue-600">{ad.headline1}</div>
                    <div className="font-medium text-blue-600">{ad.headline2}</div>
                    <div className="text-sm text-muted-foreground">{ad.description}</div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{ad.adGroupName}</TableCell>
                <TableCell>{getStatusBadge(ad.status)}</TableCell>
                <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                <TableCell>{ad.ctr}%</TableCell>
                <TableCell>{formatCurrency(ad.cpc)}</TableCell>
                <TableCell>{ad.conversions}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={ad.finalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdsList;
