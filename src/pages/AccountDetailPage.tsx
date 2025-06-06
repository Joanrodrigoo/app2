import React, { useState, useEffect } from "react";
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
import { fetchGoogleAccounts } from "@/services/api";

export interface NavigationState {
  level: 'campaigns' | 'adgroups' | 'ads';
  selectedCampaign?: string;
  selectedAdGroup?: string;
  campaignName?: string;
  adGroupName?: string;
}

type Account = {
  id: string;
  accountId: string;
  accountName: string;
  accountType: string;
  connected: boolean;
  lastSyncedAt: string | null;
  parentAccountId?: string;
};

const AccountDetailPage = () => {
  const { accountId } = useParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [navigation, setNavigation] = useState<NavigationState>({
    level: 'campaigns',
  });

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const accounts = await fetchGoogleAccounts();
        const found = accounts.find((acc) => acc.accountId === accountId);
        if (!found) {
          throw new Error("Cuenta no encontrada");
        }
        setAccount(found);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la cuenta");
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      loadAccount();
    }
  }, [accountId]);

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
                  campaignName: navigation.campaignName,
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
      {loading ? (
        <div className="p-6 text-muted-foreground">Cargando cuenta...</div>
      ) : error || !account ? (
        <div className="p-6 text-red-500">{error || "Cuenta no encontrada"}</div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{account.accountName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-muted-foreground text-sm">ID: {account.accountId}</span>
                <Badge variant="outline">{account.accountType}</Badge>
                <Badge variant="default" className="bg-green-500">Conectada</Badge>
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
          <AccountMetrics accountId={account.accountId} dateRange={dateRange} />

          {/* Recomendaciones */}
          <RecommendationsPanel accountId={account.accountId} navigation={navigation} />

          {/* Campañas */}
          <Card>
            <CardContent className="overflow-x-auto pt-6">
              {renderBreadcrumb()}
              <HierarchicalCampaignsList
                accountId={account.accountId}
                dateRange={dateRange}
                navigation={navigation}
                onNavigationChange={handleNavigationChange}
              />
            </CardContent>
          </Card>

          {/* Palabras clave y Audiencias */}
          <div className="space-y-6">
            <KeywordsList
              customerId={account.accountId}
              dateRange={dateRange}
              navigation={navigation}
            />
            <AudiencesList accountId={account.accountId} dateRange={dateRange} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AccountDetailPage;
