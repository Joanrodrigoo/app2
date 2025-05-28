
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KeywordsListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
}

const KeywordsList = ({ accountId, dateRange }: KeywordsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const keywords = [
    {
      id: "1",
      keyword: "camisetas verano",
      matchType: "BROAD",
      adGroupName: "Productos Verano - Camisetas",
      status: "ENABLED",
      bid: 0.85,
      spend: 23.45,
      impressions: 5678,
      clicks: 89,
      conversions: 5,
      ctr: 1.6,
      cpc: 0.26,
      qualityScore: 7,
      searchImpressionShare: 45.2
    },
    {
      id: "2", 
      keyword: "[camisetas hombre]",
      matchType: "EXACT",
      adGroupName: "Productos Verano - Camisetas",
      status: "ENABLED",
      bid: 1.20,
      spend: 45.67,
      impressions: 2345,
      clicks: 156,
      conversions: 12,
      ctr: 6.7,
      cpc: 0.29,
      qualityScore: 8,
      searchImpressionShare: 78.5
    },
    {
      id: "3",
      keyword: "shorts deportivos",
      matchType: "PHRASE",
      adGroupName: "Productos Verano - Shorts",
      status: "ENABLED",
      bid: 0.65,
      spend: 34.21,
      impressions: 4567,
      clicks: 123,
      conversions: 8,
      ctr: 2.7,
      cpc: 0.28,
      qualityScore: 6,
      searchImpressionShare: 32.1
    }
  ];

  const filteredKeywords = keywords.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    keyword.adGroupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMatchTypeBadge = (matchType: string) => {
    const colors = {
      BROAD: "bg-blue-100 text-blue-800",
      PHRASE: "bg-yellow-100 text-yellow-800",
      EXACT: "bg-green-100 text-green-800"
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENABLED":
        return <Badge className="bg-green-500">Activa</Badge>;
      case "PAUSED":
        return <Badge variant="outline">Pausada</Badge>;
      default:
        return <Badge variant="secondary">Desconocida</Badge>;
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
          <CardTitle>Keywords ({filteredKeywords.length})</CardTitle>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead>Tipo Concordancia</TableHead>
              <TableHead>Grupo de Anuncios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Puja</TableHead>
              <TableHead>Gasto</TableHead>
              <TableHead>Impresiones</TableHead>
              <TableHead>Clics</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Conv.</TableHead>
              <TableHead>Quality Score</TableHead>
              <TableHead>Search IS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKeywords.map((keyword) => (
              <TableRow key={keyword.id} className="hover:bg-muted/50">
                <TableCell className="font-medium font-mono">{keyword.keyword}</TableCell>
                <TableCell>{getMatchTypeBadge(keyword.matchType)}</TableCell>
                <TableCell className="text-muted-foreground">{keyword.adGroupName}</TableCell>
                <TableCell>{getStatusBadge(keyword.status)}</TableCell>
                <TableCell>{formatCurrency(keyword.bid)}</TableCell>
                <TableCell>{formatCurrency(keyword.spend)}</TableCell>
                <TableCell>{keyword.impressions.toLocaleString()}</TableCell>
                <TableCell>{keyword.clicks.toLocaleString()}</TableCell>
                <TableCell>{keyword.ctr}%</TableCell>
                <TableCell>{formatCurrency(keyword.cpc)}</TableCell>
                <TableCell>{keyword.conversions}</TableCell>
                <TableCell>{getQualityScoreBadge(keyword.qualityScore)}</TableCell>
                <TableCell>{keyword.searchImpressionShare}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default KeywordsList;
