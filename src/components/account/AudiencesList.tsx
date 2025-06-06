import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { googleAdsApi } from "@/services/api";

interface Audience {
  id: string;
  name: string;
  type: string;
  campaignName: string;
  targeting: string;
  bidAdjustment: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  audienceSize: string;
}

interface AudiencesListProps {
  accountId: string;
  dateRange: { from: Date; to: Date };
}

type SortField = keyof Audience;
type SortOrder = 'asc' | 'desc';

// Configuraciones estáticas optimizadas
const TYPE_CONFIG = {
  REMARKETING: { className: "bg-purple-100 text-purple-800", label: "Remarketing" },
  SIMILAR: { className: "bg-blue-100 text-blue-800", label: "Similar" },
  AFFINITY: { className: "bg-green-100 text-green-800", label: "Afinidad" },
  DEMOGRAPHIC: { className: "bg-orange-100 text-orange-800", label: "Demográfico" },
  CUSTOM: { className: "bg-gray-100 text-gray-800", label: "Personalizada" }
};

// Componente Badge de tipo memoizado
const TypeBadge = React.memo(({ type }: { type: string }) => {
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.CUSTOM;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
});

// Componente Badge de segmentación memoizado
const TargetingBadge = React.memo(({ targeting }: { targeting: string }) => {
  const config = useMemo(() => {
    switch (targeting) {
      case "TARGETING":
        return { className: "bg-green-500", label: "Segmentación" };
      case "OBSERVATION":
        return { variant: "outline" as const, label: "Observación" };
      default:
        return { variant: "secondary" as const, label: "Desconocido" };
    }
  }, [targeting]);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
});

// Componente Badge de ajuste de puja memoizado
const BidAdjustmentBadge = React.memo(({ adjustment }: { adjustment: number }) => {
  const config = useMemo(() => {
    if (adjustment > 0) {
      return { className: "bg-green-500", label: `+${adjustment}%` };
    } else if (adjustment < 0) {
      return { className: "bg-red-500", label: `${adjustment}%` };
    } else {
      return { variant: "outline" as const, label: "0%" };
    }
  }, [adjustment]);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
});

// Hook personalizado para ordenación
const useSorting = () => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField]);

  const getSortIcon = useCallback((field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  }, [sortField, sortOrder]);

  return { sortField, sortOrder, handleSort, getSortIcon };
};

// Hook personalizado para paginación
const usePagination = (totalItems: number, itemsPerPage: number = 15) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    resetPage
  };
};

const AudiencesList = ({ accountId, dateRange }: AudiencesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sortField, sortOrder, handleSort, getSortIcon } = useSorting();

  // Filtrado optimizado con useMemo
  const filteredAudiences = useMemo(() => {
    if (!searchTerm) return audiences;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return audiences.filter(audience =>
      audience.name.toLowerCase().includes(lowercaseSearch) ||
      audience.campaignName.toLowerCase().includes(lowercaseSearch) ||
      audience.type.toLowerCase().includes(lowercaseSearch)
    );
  }, [audiences, searchTerm]);

  // Ordenación optimizada con useMemo
  const sortedAudiences = useMemo(() => {
    if (!sortField) return filteredAudiences;

    return [...filteredAudiences].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Manejar valores numéricos
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Manejar strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredAudiences, sortField, sortOrder]);

  const { currentPage, totalPages, startIndex, endIndex, handlePageChange, resetPage } = usePagination(sortedAudiences.length);

  // Audiencias de la página actual
  const currentAudiences = useMemo(() => {
    return sortedAudiences.slice(startIndex, endIndex);
  }, [sortedAudiences, startIndex, endIndex]);

  // Carga de datos
   /*useEffect(() => {
   const fetchAudiences = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = null //await googleAdsApi.getFullAccountData(accountId);
        if (res.success && res.data) {
          setAudiences(res.data.audiences || []);
        } else {
          setError(res.error || "Error al cargar las audiencias");
        }
      } catch (err) {
        setError("Error de conexión al cargar las audiencias");
        console.error("Error fetching audiences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudiences();
  }, [accountId, dateRange]);
*/
  // Handler optimizado para búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    resetPage();
  }, [resetPage]);

  // Handler optimizado para ordenación con reset de página
  const handleSortWithReset = useCallback((field: SortField) => {
    handleSort(field);
    resetPage();
  }, [handleSort, resetPage]);

  // Componente Header ordenable memoizado
  const SortableHeader = React.memo(({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSortWithReset(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {getSortIcon(field)}
      </div>
    </TableHead>
  ));

  // Componente de fila optimizado
  const AudienceRow = React.memo(({ audience }: { audience: Audience }) => (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">{audience.name}</TableCell>
      <TableCell><TypeBadge type={audience.type} /></TableCell>
      <TableCell className="text-muted-foreground">{audience.campaignName}</TableCell>
      <TableCell><TargetingBadge targeting={audience.targeting} /></TableCell>
      <TableCell><BidAdjustmentBadge adjustment={audience.bidAdjustment} /></TableCell>
      <TableCell>{audience.audienceSize}</TableCell>
      <TableCell>{audience.impressions.toLocaleString()}</TableCell>
      <TableCell>{audience.clicks.toLocaleString()}</TableCell>
      <TableCell>{audience.ctr.toFixed(2)}%</TableCell>
      <TableCell>{formatCurrency(audience.cpc)}</TableCell>
      <TableCell>{audience.conversions}</TableCell>
    </TableRow>
  ));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segmentación de Audiencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando audiencias...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segmentación de Audiencias</CardTitle>
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
          <CardTitle>Segmentación de Audiencias ({filteredAudiences.length})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar audiencias..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAudiences.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron audiencias que coincidan con la búsqueda" : "No hay audiencias disponibles"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="name">Audiencia</SortableHeader>
                    <SortableHeader field="type">Tipo</SortableHeader>
                    <SortableHeader field="campaignName">Campaña</SortableHeader>
                    <SortableHeader field="targeting">Segmentación</SortableHeader>
                    <SortableHeader field="bidAdjustment">Ajuste Puja</SortableHeader>
                    <SortableHeader field="audienceSize">Tamaño</SortableHeader>
                    <SortableHeader field="impressions">Impresiones</SortableHeader>
                    <SortableHeader field="clicks">Clics</SortableHeader>
                    <SortableHeader field="ctr">CTR</SortableHeader>
                    <SortableHeader field="cpc">CPC</SortableHeader>
                    <SortableHeader field="conversions">Conversiones</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAudiences.map((audience) => (
                    <AudienceRow key={audience.id} audience={audience} />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {endIndex} de {sortedAudiences.length} audiencias
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

export default AudiencesList;