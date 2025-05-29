import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { NavigationState } from "@/pages/AccountDetailPage";

interface KeywordsListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
  navigation: NavigationState;
}

type SortField = string;
type SortOrder = 'asc' | 'desc';

const KeywordsList = ({ accountId, dateRange, navigation }: KeywordsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  // Mock data
  const allKeywords = [
    {
      id: "1",
      keyword: "camisetas verano",
      matchType: "BROAD",
      campaignId: "1",
      adGroupId: "1",
      campaignName: "Campaña Verano 2024",
      adGroupName: "Productos Verano - Camisetas",
      bid: 0.85,
      impressions: 12500,
      clicks: 234,
      conversions: 12,
      cost: 45.30,
      ctr: 1.87,
      cpc: 0.19,
      conversionRate: 5.13,
      qualityScore: 7
    },
    {
      id: "2",
      keyword: "shorts hombre",
      matchType: "PHRASE",
      campaignId: "1", 
      adGroupId: "2",
      campaignName: "Campaña Verano 2024",
      adGroupName: "Productos Verano - Shorts",
      bid: 0.75,
      impressions: 8900,
      clicks: 445,
      conversions: 28,
      cost: 67.20,
      ctr: 5.0,
      cpc: 0.15,
      conversionRate: 6.29,
      qualityScore: 8
    },
    {
      id: "3",
      keyword: "[ropa casual]",
      matchType: "EXACT",
      campaignId: "2",
      adGroupId: "3", 
      campaignName: "Display - Awareness",
      adGroupName: "Awareness - General",
      bid: 0.05,
      impressions: 45600,
      clicks: 567,
      conversions: 5,
      cost: 123.45,
      ctr: 1.24,
      cpc: 0.22,
      conversionRate: 0.88,
      qualityScore: 6
    },
    {
      id: "4",
      keyword: "comprar camisetas",
      matchType: "BROAD",
      campaignId: "1",
      adGroupId: "1",
      campaignName: "Campaña Verano 2024", 
      adGroupName: "Productos Verano - Camisetas",
      bid: 1.20,
      impressions: 5670,
      clicks: 89,
      conversions: 3,
      cost: 12.50,
      ctr: 1.57,
      cpc: 0.14,
      conversionRate: 3.37,
      qualityScore: 5
    },
    {
      id: "5",
      keyword: "shorts deportivos",
      matchType: "PHRASE", 
      campaignId: "1",
      adGroupId: "2",
      campaignName: "Campaña Verano 2024",
      adGroupName: "Productos Verano - Shorts",
      bid: 0.90,
      impressions: 7800,
      clicks: 156,
      conversions: 8,
      cost: 23.40,
      ctr: 2.0,
      cpc: 0.15,
      conversionRate: 5.13,
      qualityScore: 7
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

  // Filtrar keywords según navegación
  const filteredKeywords = allKeywords.filter(keyword => {
    const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (navigation.level === 'campaigns') {
      return matchesSearch;
    } else if (navigation.level === 'adgroups' && navigation.selectedCampaign) {
      return matchesSearch && keyword.campaignId === navigation.selectedCampaign;
    } else if (navigation.level === 'ads' && navigation.selectedAdGroup) {
      return matchesSearch && keyword.adGroupId === navigation.selectedAdGroup;
    }
    
    return matchesSearch;
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
      <Badge variant="outline" className={colors[matchType as keyof typeof colors]}>
        {labels[matchType as keyof typeof labels]}
      </Badge>
    );
  };

  const getQualityScoreBadge = (score: number) => {
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="keyword">Keyword</SortableHeader>
                <SortableHeader field="matchType">Concordancia</SortableHeader>
                {navigation.level === 'campaigns' && <SortableHeader field="campaignName">Campaña</SortableHeader>}
                {(navigation.level === 'campaigns' || navigation.level === 'adgroups') && <SortableHeader field="adGroupName">Grupo de Anuncios</SortableHeader>}
                <SortableHeader field="bid">Puja</SortableHeader>
                <SortableHeader field="impressions">Impresiones</SortableHeader>
                <SortableHeader field="clicks">Clics</SortableHeader>
                <SortableHeader field="ctr">CTR</SortableHeader>
                <SortableHeader field="cpc">CPC</SortableHeader>
                <SortableHeader field="conversions">Conversiones</SortableHeader>
                <SortableHeader field="cost">Coste</SortableHeader>
                <SortableHeader field="qualityScore">Quality Score</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentKeywords.map((keyword) => (
                <TableRow key={keyword.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{keyword.keyword}</TableCell>
                  <TableCell>{getMatchTypeBadge(keyword.matchType)}</TableCell>
                  {navigation.level === 'campaigns' && <TableCell className="text-sm">{keyword.campaignName}</TableCell>}
                  {(navigation.level === 'campaigns' || navigation.level === 'adgroups') && <TableCell className="text-sm">{keyword.adGroupName}</TableCell>}
                  <TableCell>{formatCurrency(keyword.bid)}</TableCell>
                  <TableCell>{keyword.impressions.toLocaleString()}</TableCell>
                  <TableCell>{keyword.clicks.toLocaleString()}</TableCell>
                  <TableCell>{keyword.ctr}%</TableCell>
                  <TableCell>{formatCurrency(keyword.cpc)}</TableCell>
                  <TableCell>{keyword.conversions}</TableCell>
                  <TableCell>{formatCurrency(keyword.cost)}</TableCell>
                  <TableCell>{getQualityScoreBadge(keyword.qualityScore)}</TableCell>
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
                  const page = i + 1;
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
      </CardContent>
    </Card>
  );
};

export default KeywordsList;