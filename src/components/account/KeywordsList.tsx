import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { NavigationState } from "@/pages/AccountDetailPage";
import { googleAdsApi } from "@/services/api"; // Ajusta la ruta según tu estructura

interface KeywordsListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
  navigation: NavigationState;
}

type SortField = string;
type SortOrder = 'asc' | 'desc';

interface Keyword {
  customer_id: string;
  campaign_id: string;
  ad_group_id: string;
  criterion_id: string;
  keyword_text: string;
  match_type: string;
  is_negative: boolean;
  status: string;
  impressions: number;
  clicks: number;
  ctr: number;
  average_cpc_micros: number;
  cost_micros: number;
  conversions: number;
  quality_score?: number;
  creative_quality_score?: string;
  post_click_quality_score?: string;
  search_predicted_ctr?: string;
}

interface Campaign {
  id: string;
  name: string;
  ad_groups: AdGroup[];
}

interface AdGroup {
  ad_group_id: string;
  ad_group_name: string;
  campaign_id: string;
  keywords: Keyword[];
}

const KeywordsList = ({ accountId, dateRange, navigation }: KeywordsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await googleAdsApi.getFullAccountData(accountId);
        
        if (response.success && response.data) {
          const { campaigns: campaignsData } = response.data;
          setCampaigns(campaignsData);
          
          // Extraer todas las keywords de todas las campañas y grupos de anuncios
          const allKeywords: Keyword[] = [];
          
          campaignsData.forEach((campaign: Campaign) => {
            campaign.ad_groups.forEach((adGroup: AdGroup) => {
              adGroup.keywords.forEach((keyword: Keyword) => {
                allKeywords.push({
                  ...keyword,
                  campaign_name: campaign.name,
                  ad_group_name: adGroup.ad_group_name
                } as any);
              });
            });
          });
          
          setKeywords(allKeywords);
        } else {
          setError(response.error || "Error al cargar los datos");
        }
      } catch (err) {
        setError("Error de conexión al cargar los datos");
        console.error("Error fetching keywords:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId, dateRange]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
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

  // Filtrar keywords según navegación
  const filteredKeywords = keywords.filter(keyword => {
    // Filtrar por término de búsqueda
    const matchesSearch = keyword.keyword_text.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar keywords negativas si no queremos mostrarlas
    const isNotNegative = !keyword.is_negative;
    
    if (navigation.level === 'campaigns') {
      return matchesSearch && isNotNegative;
    } else if (navigation.level === 'adgroups' && navigation.selectedCampaign) {
      return matchesSearch && isNotNegative && keyword.campaign_id === navigation.selectedCampaign;
    } else if (navigation.level === 'ads' && navigation.selectedAdGroup) {
      return matchesSearch && isNotNegative && keyword.ad_group_id === navigation.selectedAdGroup;
    }
    
    return matchesSearch && isNotNegative;
  });

  const sortedKeywords = sortData(filteredKeywords);
  const totalPages = Math.ceil(sortedKeywords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentKeywords = sortedKeywords.slice(startIndex, startIndex + itemsPerPage);

  const getMatchTypeBadge = (matchType: string) => {
    const colors = {
      BROAD: "bg-blue-100 text-blue-800",
      PHRASE: "bg-green-100 text-green-800",
      EXACT: "bg-purple-100 text-purple-800"
    };
    
    const labels = {
      BROAD: "Amplia",
      PHRASE: "Frase", 
      EXACT: "Exacta"
    };
    
    return (
      <Badge variant="outline" className={colors[matchType as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[matchType as keyof typeof labels] || matchType}
      </Badge>
    );
  };

  // Función para obtener el nombre de la campaña
  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.name || "Campaña desconocida";
  };

  // Función para obtener el nombre del grupo de anuncios
  const getAdGroupName = (campaignId: string, adGroupId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    const adGroup = campaign?.ad_groups.find(ag => ag.ad_group_id === adGroupId);
    return adGroup?.ad_group_name || "Grupo desconocido";
  };

  const getQualityScoreBadge = (score?: number) => {
    if (!score) return <Badge variant="outline" className="bg-gray-100 text-gray-600">N/A</Badge>;
    if (score >= 8) return <Badge className="bg-green-500">{score}</Badge>;
    if (score >= 6) return <Badge className="bg-yellow-500">{score}</Badge>;
    return <Badge className="bg-red-500">{score}</Badge>;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando keywords...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Keywords ({filteredKeywords.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar keywords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredKeywords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron keywords</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="keyword_text">Keyword</SortableHeader>
                    <SortableHeader field="match_type">Concordancia</SortableHeader>
                    {navigation.level === 'campaigns' && <SortableHeader field="campaign_name">Campaña</SortableHeader>}
                    {(navigation.level === 'campaigns' || navigation.level === 'adgroups') && <SortableHeader field="ad_group_name">Grupo de Anuncios</SortableHeader>}
                    <SortableHeader field="status">Estado</SortableHeader>
                    <SortableHeader field="impressions">Impresiones</SortableHeader>
                    <SortableHeader field="clicks">Clics</SortableHeader>
                    <SortableHeader field="ctr">CTR</SortableHeader>
                    <SortableHeader field="average_cpc_micros">CPC</SortableHeader>
                    <SortableHeader field="conversions">Conversiones</SortableHeader>
                    <SortableHeader field="cost_micros">Coste</SortableHeader>
                    <SortableHeader field="quality_score">Quality Score</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentKeywords.map((keyword) => (
                    <TableRow key={`${keyword.customer_id}-${keyword.criterion_id}`} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{keyword.keyword_text}</TableCell>
                      <TableCell>{getMatchTypeBadge(keyword.match_type)}</TableCell>
                      {navigation.level === 'campaigns' && (
                        <TableCell className="text-sm">{getCampaignName(keyword.campaign_id)}</TableCell>
                      )}
                      {(navigation.level === 'campaigns' || navigation.level === 'adgroups') && (
                        <TableCell className="text-sm">{getAdGroupName(keyword.campaign_id, keyword.ad_group_id)}</TableCell>
                      )}
                      <TableCell>
                        <Badge 
                          variant={keyword.status === 'ENABLED' ? 'default' : 'secondary'}
                          className={keyword.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                        >
                          {keyword.status === 'ENABLED' ? 'Activo' : keyword.status === 'PAUSED' ? 'Pausado' : keyword.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{keyword.impressions.toLocaleString()}</TableCell>
                      <TableCell>{keyword.clicks.toLocaleString()}</TableCell>
                      <TableCell>{(keyword.ctr * 100).toFixed(2)}%</TableCell>
                      <TableCell>{formatCurrency(keyword.average_cpc_micros / 1000000)}</TableCell>
                      <TableCell>{keyword.conversions}</TableCell>
                      <TableCell>{formatCurrency(keyword.cost_micros / 1000000)}</TableCell>
                      <TableCell>{getQualityScoreBadge(keyword.quality_score)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedKeywords.length)} de {sortedKeywords.length} keywords
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordsList;