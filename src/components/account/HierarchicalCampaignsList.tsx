import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, ExternalLink, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { NavigationState } from "@/pages/AccountDetailPage";
import AdDetailsModal from "./AdDetailsModal";
import { getCampaignMetricsByCustomer } from '@/services/api';
import { Campaign } from "@/types/index";


interface HierarchicalCampaignsListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
  navigation: NavigationState;
  onNavigationChange: (navigation: NavigationState) => void;
}

type SortField = string;
type SortOrder = 'asc' | 'desc';



interface AdGroup {
  id: string;
  name: string;
  campaignId: string;
  campaignName: string;
  status: string;
  bid: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  qualityScore: number;
}

interface Ad {
  id: string;
  headline1: string;
  headline2: string;
  description: string;
  adGroupId: string;
  adGroupName: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  finalUrl: string;
}

const HierarchicalCampaignsList = ({ accountId, dateRange, navigation, onNavigationChange }: HierarchicalCampaignsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Estados para datos de la API
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adGroups, setAdGroups] = useState<AdGroup[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar datos completos de la cuenta
const loadCampaignMetrics = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const data = await getCampaignMetricsByCustomer(accountId);
    
    // Suponiendo que data es un array de campañas con la estructura correcta:
    setCampaigns(data.map((campaign: any) => ({
      id: campaign.id || campaign.campaign_id,
      name: campaign.name || campaign.campaign_name,
      status: campaign.status,
      type: campaign.type || campaign.campaign_type,
      budget: parseFloat(campaign.budget || campaign.daily_budget || '0'),
      spend: parseFloat(campaign.spend || campaign.cost || '0'),
      impressions: parseInt(campaign.impressions || '0'),
      clicks: parseInt(campaign.clicks || '0'),
      conversions: parseFloat(campaign.conversions || '0'),
      ctr: parseFloat(campaign.ctr || '0'),
      cpc: parseFloat(campaign.cpc || campaign.avg_cpc || '0')
    })));
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido');
  } finally {
    setLoading(false);
  }
};



  // Cargar datos cuando cambie el accountId o dateRange
  useEffect(() => {
    if (accountId) {
      loadCampaignMetrics();
    }
  }, [accountId]);

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
  switch (type) {
    case "1":
      return <Badge className="bg-blue-100 text-blue-800">SEARCH</Badge>;
    case "2":
      return <Badge className="bg-purple-100 text-purple-800">DISPLAY</Badge>;
    case "3":
      return <Badge className="bg-green-100 text-green-800">SHOPPING</Badge>;
    case "4":
      return <Badge className="bg-red-100 text-red-800">VIDEO</Badge>;
    default:
      return <Badge variant="secondary">Desconocido</Badge>;
  }
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

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={loadCampaignMetrics} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

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
          <Button onClick={loadCampaignMetrics} variant="outline" size="sm">
            Actualizar
          </Button>
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
                  <TableCell>{campaign.ctr.toFixed(2)}%</TableCell>
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
                  <TableCell>{adGroup.ctr.toFixed(2)}%</TableCell>
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
                  <TableCell>{ad.ctr.toFixed(2)}%</TableCell>
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