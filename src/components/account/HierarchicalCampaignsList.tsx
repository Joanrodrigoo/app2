import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { NavigationState } from "@/pages/AccountDetailPage";
import AdDetailsModal from "./AdDetailsModal";

interface HierarchicalCampaignsListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
  navigation: NavigationState;
  onNavigationChange: (navigation: NavigationState) => void;
}

type SortField = string;
type SortOrder = 'asc' | 'desc';

const HierarchicalCampaignsList = ({ accountId, dateRange, navigation, onNavigationChange }: HierarchicalCampaignsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Mock data - campañas
  const campaigns = [
    {
      id: "1",
      name: "Campaña Verano 2024",
      status: "ENABLED",
      type: "SEARCH",
      budget: 150,
      spend: 142.50,
      impressions: 45678,
      clicks: 1234,
      conversions: 45,
      ctr: 2.7,
      cpc: 0.12
    },
    {
      id: "2", 
      name: "Display - Awareness",
      status: "ENABLED",
      type: "DISPLAY",
      budget: 300,
      spend: 287.30,
      impressions: 123456,
      clicks: 2345,
      conversions: 23,
      ctr: 1.9,
      cpc: 0.12
    }
  ];

  // Mock data - grupos de anuncios
  const adGroups = [
    {
      id: "1",
      name: "Productos Verano - Camisetas",
      campaignId: "1",
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
      campaignId: "1",
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
      campaignId: "2",
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

  // Mock data - anuncios
  const ads = [
    {
      id: "1",
      headline1: "Camisetas de Verano 2024",
      headline2: "Descuentos hasta 50%",
      description: "Encuentra las mejores camisetas para este verano. Envío gratis a partir de 50€.",
      adGroupId: "1",
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
      adGroupId: "2",
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
      adGroupId: "3",
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const sortData = (data: any[]) => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

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

  const getTypeBadge = (type: string) => {
    const colors = {
      SEARCH: "bg-blue-100 text-blue-800",
      DISPLAY: "bg-purple-100 text-purple-800", 
      SHOPPING: "bg-green-100 text-green-800",
      VIDEO: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {type}
      </Badge>
    );
  };

  const getQualityScoreBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-500">{score}</Badge>;
    if (score >= 6) return <Badge className="bg-yellow-500">{score}</Badge>;
    return <Badge className="bg-red-500">{score}</Badge>;
  };

  const handleAdClick = (ad: any) => {
    setSelectedAd(ad);
    setIsAdModalOpen(true);
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {getSortIcon(field)}
      </div>
    </TableHead>
  );

  // Renderizar campañas
  if (navigation.level === 'campaigns') {
    const filteredCampaigns = campaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const sortedCampaigns = sortData(filteredCampaigns);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campañas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="name">Campaña</SortableHeader>
                <SortableHeader field="status">Estado</SortableHeader>
                <SortableHeader field="type">Tipo</SortableHeader>
                <SortableHeader field="budget">Presupuesto</SortableHeader>
                <SortableHeader field="spend">Gasto</SortableHeader>
                <SortableHeader field="impressions">Impresiones</SortableHeader>
                <SortableHeader field="clicks">Clics</SortableHeader>
                <SortableHeader field="ctr">CTR</SortableHeader>
                <SortableHeader field="cpc">CPC</SortableHeader>
                <SortableHeader field="conversions">Conversiones</SortableHeader>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCampaigns.map((campaign) => (
                <TableRow 
                  key={campaign.id} 
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onNavigationChange({
                    level: 'adgroups',
                    selectedCampaign: campaign.id,
                    campaignName: campaign.name
                  })}
                >
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>{getTypeBadge(campaign.type)}</TableCell>
                  <TableCell>{formatCurrency(campaign.budget)}/día</TableCell>
                  <TableCell>{formatCurrency(campaign.spend)}</TableCell>
                  <TableCell>{campaign.impressions.toLocaleString()}</TableCell>
                  <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                  <TableCell>{campaign.ctr}%</TableCell>
                  <TableCell>{formatCurrency(campaign.cpc)}</TableCell>
                  <TableCell>{campaign.conversions}</TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Renderizar grupos de anuncios
  if (navigation.level === 'adgroups') {
    const filteredAdGroups = adGroups
      .filter(adGroup => adGroup.campaignId === navigation.selectedCampaign)
      .filter(adGroup => adGroup.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const sortedAdGroups = sortData(filteredAdGroups);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="name">Grupo de Anuncios</SortableHeader>
                <SortableHeader field="status">Estado</SortableHeader>
                <SortableHeader field="bid">Puja</SortableHeader>
                <SortableHeader field="spend">Gasto</SortableHeader>
                <SortableHeader field="impressions">Impresiones</SortableHeader>
                <SortableHeader field="clicks">Clics</SortableHeader>
                <SortableHeader field="ctr">CTR</SortableHeader>
                <SortableHeader field="cpc">CPC</SortableHeader>
                <SortableHeader field="conversions">Conversiones</SortableHeader>
                <SortableHeader field="qualityScore">Quality Score</SortableHeader>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAdGroups.map((adGroup) => (
                <TableRow 
                  key={adGroup.id} 
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onNavigationChange({
                    level: 'ads',
                    selectedCampaign: navigation.selectedCampaign,
                    selectedAdGroup: adGroup.id,
                    campaignName: navigation.campaignName,
                    adGroupName: adGroup.name
                  })}
                >
                  <TableCell className="font-medium">{adGroup.name}</TableCell>
                  <TableCell>{getStatusBadge(adGroup.status)}</TableCell>
                  <TableCell>{formatCurrency(adGroup.bid)}</TableCell>
                  <TableCell>{formatCurrency(adGroup.spend)}</TableCell>
                  <TableCell>{adGroup.impressions.toLocaleString()}</TableCell>
                  <TableCell>{adGroup.clicks.toLocaleString()}</TableCell>
                  <TableCell>{adGroup.ctr}%</TableCell>
                  <TableCell>{formatCurrency(adGroup.cpc)}</TableCell>
                  <TableCell>{adGroup.conversions}</TableCell>
                  <TableCell>{getQualityScoreBadge(adGroup.qualityScore)}</TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Renderizar anuncios
  if (navigation.level === 'ads') {
    const filteredAds = ads
      .filter(ad => ad.adGroupId === navigation.selectedAdGroup)
      .filter(ad => 
        ad.headline1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.headline2.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
    const sortedAds = sortData(filteredAds);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Anuncio</TableHead>
                <SortableHeader field="status">Estado</SortableHeader>
                <SortableHeader field="impressions">Impresiones</SortableHeader>
                <SortableHeader field="clicks">Clics</SortableHeader>
                <SortableHeader field="ctr">CTR</SortableHeader>
                <SortableHeader field="cpc">CPC</SortableHeader>
                <SortableHeader field="conversions">Conversiones</SortableHeader>
                <TableHead>URL Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAds.map((ad) => (
                <TableRow 
                  key={ad.id} 
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleAdClick(ad)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-blue-600">{ad.headline1}</div>
                      <div className="font-medium text-blue-600">{ad.headline2}</div>
                      <div className="text-sm text-muted-foreground">{ad.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(ad.status)}</TableCell>
                  <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                  <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                  <TableCell>{ad.ctr}%</TableCell>
                  <TableCell>{formatCurrency(ad.cpc)}</TableCell>
                  <TableCell>{ad.conversions}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={ad.finalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AdDetailsModal 
          ad={selectedAd}
          isOpen={isAdModalOpen}
          onClose={() => setIsAdModalOpen(false)}
        />
      </div>
    );
  }

  return null;
};

export default HierarchicalCampaignsList;