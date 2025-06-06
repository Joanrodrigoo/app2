import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchKeywords } from "@/services/api";

interface KeywordsListProps {
  customerId: string;
  dateRange: { from: Date; to: Date };
  navigation: any;
}

type SortField = string;
type SortOrder = "asc" | "desc";

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
  campaign_name?: string;
  ad_group_name?: string;
}

const KeywordsList = ({ customerId, dateRange, navigation }: KeywordsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [keywordsByPage, setKeywordsByPage] = useState<Map<number, Keyword[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getMatchTypeBadge = (matchType: string | number) => {
    const match = typeof matchType === "string" ? parseInt(matchType) : matchType;
    switch (match) {
      case 1: return <Badge className="bg-purple-100 text-purple-800">Exacta</Badge>;
      case 2: return <Badge className="bg-green-100 text-green-800">Frase</Badge>;
      case 3: return <Badge className="bg-blue-100 text-blue-800">Amplia</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Desconocida</Badge>;
    }
  };

  const handleSort = (field: SortField) => {
    setSortOrder(prev => sortField === field ? (prev === "asc" ? "desc" : "asc") : "asc");
    setSortField(field);
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <TableCell
        className="cursor-pointer select-none"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {children}
          {getSortIcon(field)}
        </div>
      </TableCell>
    </TableHead>
  );

  const processKeywords = (data: Keyword[]) => {
    const filtered = data.filter(keyword => {
      if (keyword.is_negative) return false;
      if (navigation?.level === "adgroups" && navigation?.selectedCampaign && keyword.campaign_id !== navigation.selectedCampaign) return false;
      if (navigation?.level === "ads" && navigation?.selectedAdGroup && keyword.ad_group_id !== navigation.selectedAdGroup) return false;
      if (searchTerm && !keyword.keyword_text?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    const sorted = sortField
      ? [...filtered].sort((a, b) => {
          let aVal = a[sortField as keyof Keyword];
          let bVal = b[sortField as keyof Keyword];
          if (typeof aVal === "string") aVal = aVal.toLowerCase();
          if (typeof bVal === "string") bVal = bVal.toLowerCase();
          return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        })
      : filtered;

    const map = new Map<number, Keyword[]>();
    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    for (let i = 0; i < totalPages; i++) {
      const start = i * itemsPerPage;
      const end = start + itemsPerPage;
      map.set(i + 1, sorted.slice(start, end));
    }

    return map;
  };

  useEffect(() => {
    if (!customerId || !dateRange?.from || !dateRange?.to) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchKeywords(customerId, dateRange);
        const map = processKeywords(data);
        setKeywordsByPage(map);
        setCurrentPage(1);
      } catch (err: any) {
        setError(err.message || "Error al cargar las keywords");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, dateRange, navigation, sortField, sortOrder, searchTerm]);

  const currentKeywords = keywordsByPage.get(currentPage) || [];
  const totalPages = keywordsByPage.size;
  const totalResults = Array.from(keywordsByPage.values()).flat().length;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Keywords ({totalResults})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando keywords...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : totalResults === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No se encontraron keywords</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="keyword_text">Keyword</SortableHeader>
                    <SortableHeader field="match_type">Concordancia</SortableHeader>
                    <SortableHeader field="campaign_name">Campaña</SortableHeader>
                    <SortableHeader field="ad_group_name">Grupo de Anuncios</SortableHeader>
                    <SortableHeader field="average_cpc_micros">Puja</SortableHeader>
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
                      <TableCell>{keyword.campaign_name || "Desconocido"}</TableCell>
                      <TableCell>{keyword.ad_group_name || "Desconocido"}</TableCell>
                      <TableCell>{formatCurrency(keyword.average_cpc_micros / 1e6)}</TableCell>
                      <TableCell>{keyword.impressions.toLocaleString()}</TableCell>
                      <TableCell>{keyword.clicks.toLocaleString()}</TableCell>
                      <TableCell>{(keyword.ctr * 100).toFixed(2)}%</TableCell>
                      <TableCell>{formatCurrency(keyword.average_cpc_micros / 1e6)}</TableCell>
                      <TableCell>{keyword.conversions}</TableCell>
                      <TableCell>{formatCurrency(keyword.cost_micros / 1e6)}</TableCell>
                      <TableCell>
                        {keyword.quality_score !== undefined ? (
                          <Badge className={
                            keyword.quality_score >= 8
                              ? "bg-green-500"
                              : keyword.quality_score >= 6
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }>
                            {keyword.quality_score}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">N/A</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-muted-foreground">
                  Mostrando {currentPage} de {totalPages} páginas
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                    <ChevronRight className="w-4 h-4" />
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
