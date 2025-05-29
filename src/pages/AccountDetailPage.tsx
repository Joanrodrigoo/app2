
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
    accountId: accountId,
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{account.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-muted-foreground text-sm">ID: {account.accountId}</span>
              <Badge variant="outline">{account.type}</Badge>
              <Badge variant="default" className="bg-green-500">
                {account.status}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />
            <Button onClick={handleSync} variant="outline" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
          </div>
        </div>

        {/* Métricas principales */}
        <AccountMetrics accountId={accountId!} dateRange={dateRange} />

        {/* Recomendaciones de IA */}
        <RecommendationsPanel accountId={accountId!} />

        {/* Estructura de campañas */}
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            {renderBreadcrumb()}
            <HierarchicalCampaignsList 
              accountId={accountId!} 
              dateRange={dateRange}
              navigation={navigation}
              onNavigationChange={handleNavigationChange}
            />
          </CardContent>
        </Card>

        {/* Keywords y Segmentación en una columna */}
        <div className="space-y-6">
          <KeywordsList 
            accountId={accountId!} 
            dateRange={dateRange}
            navigation={navigation}
          />
          <AudiencesList accountId={accountId!} dateRange={dateRange} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountDetailPage;