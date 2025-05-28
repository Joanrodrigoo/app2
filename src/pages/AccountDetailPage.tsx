
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import AccountMetrics from "@/components/account/AccountMetrics";
import HierarchicalCampaignsList from "@/components/account/HierarchicalCampaignsList";
import KeywordsList from "@/components/account/KeywordsList";
import AudiencesList from "@/components/account/AudiencesList";
import RecommendationsPanel from "@/components/account/RecommendationsPanel";
import DateRangeFilter from "@/components/account/DateRangeFilter";

export interface NavigationState {
  level: 'campaigns' | 'adgroups' | 'ads';
  selectedCampaign?: string;
  selectedAdGroup?: string;
  campaignName?: string;
  adGroupName?: string;
}

const AccountDetailPage = () => {
  const { accountId } = useParams();
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [navigation, setNavigation] = useState<NavigationState>({ level: 'campaigns' });
  
  // Mock account data
  const account = {
    id: accountId,
    name: "Mi Cuenta Principal",
    accountId: "123-456-7890",
    type: "STANDARD",
    status: "Active",
    currency: "EUR"
  };

  const handleSync = () => {
    console.log("Sincronizando cuenta...");
  };

  const handleNavigationChange = (newNavigation: NavigationState) => {
    setNavigation(newNavigation);
  };

  const renderBreadcrumb = () => {
    const breadcrumbs = ["Campañas"];
    
    if (navigation.selectedCampaign && navigation.campaignName) {
      breadcrumbs.push(navigation.campaignName);
    }
    
    if (navigation.selectedAdGroup && navigation.adGroupName) {
      breadcrumbs.push(navigation.adGroupName);
    }

    return (
      <div className="flex items-center gap-2 mb-4">
        {navigation.level !== 'campaigns' && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (navigation.level === 'ads') {
                setNavigation({ 
                  level: 'adgroups', 
                  selectedCampaign: navigation.selectedCampaign,
                  campaignName: navigation.campaignName 
                });
              } else {
                setNavigation({ level: 'campaigns' });
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        )}
        <div className="text-sm text-muted-foreground">
          {breadcrumbs.join(" > ")}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-muted-foreground">ID: {account.accountId}</span>
              <Badge variant="outline">{account.type}</Badge>
              <Badge variant="default" className="bg-green-500">
                {account.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />
            <Button onClick={handleSync} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
          </div>
        </div>

        {/* Métricas principales */}
        <AccountMetrics accountId={accountId!} dateRange={dateRange} />

        {/* Panel de recomendaciones */}
        <RecommendationsPanel accountId={accountId!} />

        {/* Tabs para navegar por la estructura */}
        <Tabs defaultValue="hierarchy" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hierarchy">Estructura de Campañas</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="audiences">Segmentación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hierarchy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Estructura Jerárquica</CardTitle>
              </CardHeader>
              <CardContent>
                {renderBreadcrumb()}
                <HierarchicalCampaignsList 
                  accountId={accountId!} 
                  dateRange={dateRange}
                  navigation={navigation}
                  onNavigationChange={handleNavigationChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="keywords" className="mt-6">
            <KeywordsList accountId={accountId!} dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="audiences" className="mt-6">
            <AudiencesList accountId={accountId!} dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AccountDetailPage;