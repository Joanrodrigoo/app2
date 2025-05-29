import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import AccountMetrics from "@/components/account/AccountMetrics";
import HierarchicalCampaignsList from "@/components/account/HierarchicalCampaignsList";
import KeywordsList from "@/components/account/KeywordsList";
import AudiencesList from "@/components/account/AudiencesList";
import RecommendationsPanel from "@/components/account/RecommendationsPanel";
import DateRangeFilter from "@/components/account/DateRangeFilter";
import { googleAdsApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export interface NavigationState {
  level: 'campaigns' | 'adgroups' | 'ads';
  selectedCampaign?: string;
  selectedAdGroup?: string;
  campaignName?: string;
  adGroupName?: string;
}

interface AccountInfo {
  id: string;
  name: string;
  accountId: string;
  type: string;
  status: string;
  currency: string;
}

const AccountDetailPage = () => {
  const { accountId } = useParams();
  const [dateRange, setDateRange] = useState({ 
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });
  const [navigation, setNavigation] = useState<NavigationState>({ level: 'campaigns' });
  
  // Estados para la información de la cuenta
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);

  // Cargar información básica de la cuenta
  const loadAccountInfo = async () => {
    if (!accountId) return;
    
    setAccountLoading(true);
    try {
      const response = await googleAdsApi.getFullAccountData(accountId);
      
      if (response.success && response.data) {
        // Extraer información básica de la cuenta de la respuesta
        const accountInfo = response.data.account || {
          id: accountId,
          name: response.data.accountName || `Cuenta ${accountId}`,
          accountId: accountId,
          type: response.data.accountType || "STANDARD",
          status: response.data.accountStatus || "Active",
          currency: response.data.currency || "EUR"
        };
        
        setAccount(accountInfo);
      } else {
        // Fallback con datos básicos si no se puede cargar
        setAccount({
          id: accountId,
          name: `Cuenta ${accountId}`,
          accountId: accountId,
          type: "STANDARD",
          status: "Active", 
          currency: "EUR"
        });
        
        if (response.error) {
          toast({
            title: "Advertencia",
            description: "No se pudo cargar toda la información de la cuenta",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error loading account info:", error);
      // Fallback con datos básicos
      setAccount({
        id: accountId,
        name: `Cuenta ${accountId}`,
        accountId: accountId,
        type: "STANDARD",
        status: "Active",
        currency: "EUR"
      });
    } finally {
      setAccountLoading(false);
    }
  };

  // Cargar información de la cuenta al montar el componente
  useEffect(() => {
    loadAccountInfo();
  }, [accountId]);

  const handleSync = async () => {
    if (!accountId) return;
    
    setSyncLoading(true);
    try {
      // Forzar recarga de datos
      const response = await googleAdsApi.getFullAccountData(accountId);
      
      if (response.success) {
        toast({
          title: "Sincronización exitosa",
          description: "Los datos de la cuenta se han actualizado correctamente"
        });
        
        // Recargar información de la cuenta
        await loadAccountInfo();
        
        // El componente HierarchicalCampaignsList se actualizará automáticamente
        // gracias a su useEffect que depende de accountId y dateRange
      } else {
        toast({
          title: "Error de sincronización",
          description: response.error || "No se pudieron actualizar los datos",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error syncing account:", error);
      toast({
        title: "Error de sincronización",
        description: "Ocurrió un error al sincronizar los datos",
        variant: "destructive"
      });
    } finally {
      setSyncLoading(false);
    }
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

  // Mostrar loading mientras se carga la información básica de la cuenta
  if (accountLoading || !account) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando información de la cuenta...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
              <Badge variant="secondary">{account.currency}</Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />
            <Button 
              onClick={handleSync} 
              variant="outline" 
              className="w-full sm:w-auto"
              disabled={syncLoading}
            >
              {syncLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {syncLoading ? "Sincronizando..." : "Sincronizar"}
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