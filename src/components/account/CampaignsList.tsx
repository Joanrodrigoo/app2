
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CampaignsListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
}

const CampaignsList = ({ accountId, dateRange }: CampaignsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  // Mock data
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
      cpc: 0.12,
      conversionRate: 3.6
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
      cpc: 0.12,
      conversionRate: 0.98
    },
    {
      id: "3",
      name: "Shopping - Productos",
      status: "PAUSED",
      type: "SHOPPING",
      budget: 200,
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      conversionRate: 0
    }
  ];

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENABLED":
        return <Badge className="bg-green-500">Activa</Badge>;
      case "PAUSED":
        return <Badge variant="outline">Pausada</Badge>;
      case "REMOVED":
        return <Badge variant="destructive">Eliminada</Badge>;
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Campañas ({filteredCampaigns.length})</CardTitle>
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Campaña</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Presupuesto</TableHead>
              <TableHead>Gasto</TableHead>
              <TableHead>Impresiones</TableHead>
              <TableHead>Clics</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>CPC</TableHead>
              <TableHead>Conversiones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map((campaign) => (
              <React.Fragment key={campaign.id}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedCampaign(
                        expandedCampaign === campaign.id ? null : campaign.id
                      )}
                    >
                      {expandedCampaign === campaign.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
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
                </TableRow>
                
                {expandedCampaign === campaign.id && (
                  <TableRow>
                    <TableCell colSpan={11} className="bg-muted/30">
                      <div className="p-4">
                        <h4 className="font-medium mb-2">Detalles de la campaña</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Tasa de conversión:</span>
                            <p>{campaign.conversionRate}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Coste por conversión:</span>
                            <p>{campaign.conversions > 0 ? formatCurrency(campaign.spend / campaign.conversions) : "N/A"}</p>
                          </div>
                          <div>
                            <span className="font-medium">Presupuesto utilizado:</span>
                            <p>{campaign.budget > 0 ? Math.round((campaign.spend / campaign.budget) * 100) : 0}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Estado optimización:</span>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              Revisión requerida
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CampaignsList;
