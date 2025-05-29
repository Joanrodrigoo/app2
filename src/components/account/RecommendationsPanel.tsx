
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, Lightbulb, ArrowRight, X, History, ChevronLeft, ChevronRight } from "lucide-react";

interface RecommendationsProps {
  accountId: string;
}

type Priority = "high" | "medium" | "low";
type Category = "bidding" | "ads" | "keywords" | "landing";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  impact: string;
  category: Category;
}

const RecommendationsPanel = ({ accountId }: RecommendationsProps) => {
  const [dismissedRecommendations, setDismissedRecommendations] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const allRecommendations: Recommendation[] = [
    {
      id: "1",
      title: "Optimizar pujas en campañas de búsqueda",
      description: "Detectamos campañas con pujas muy altas que están perdiendo impresiones por presupuesto limitado.",
      priority: "high",
      impact: "+25% impresiones",
      category: "bidding"
    },
    {
      id: "2", 
      title: "Añadir extensiones de anuncio",
      description: "Tus anuncios principales no tienen extensiones de enlace, lo que reduce el CTR potencial.",
      priority: "medium",
      impact: "+15% CTR",
      category: "ads"
    },
    {
      id: "3",
      title: "Revisar palabras clave negativas",
      description: "Hay términos de búsqueda irrelevantes que están generando clics sin conversión.",
      priority: "high",
      impact: "-20% coste",
      category: "keywords"
    },
    {
      id: "4",
      title: "Optimizar landing pages",
      description: "Algunas páginas de destino tienen velocidades de carga lentas afectando el Quality Score.",
      priority: "medium",
      impact: "+10% Quality Score",
      category: "landing"
    },
    {
      id: "5",
      title: "Reducir pujas en palabras de bajo rendimiento",
      description: "Hay keywords con CPC alto y baja tasa de conversión que están consumiendo presupuesto.",
      priority: "low",
      impact: "-15% coste",
      category: "bidding"
    },
    {
      id: "6",
      title: "Mejorar textos de anuncios",
      description: "Los anuncios con menor CTR pueden beneficiarse de mensajes más llamativos.",
      priority: "medium",
      impact: "+12% CTR",
      category: "ads"
    },
    {
      id: "7",
      title: "Expandir lista de palabras clave",
      description: "Encontramos oportunidades de keywords de cola larga con buen potencial.",
      priority: "low",
      impact: "+18% tráfico",
      category: "keywords"
    },
    {
      id: "8",
      title: "Optimizar velocidad de carga",
      description: "Varias landing pages tardan más de 3 segundos en cargar completamente.",
      priority: "high",
      impact: "+20% conversiones",
      category: "landing"
    }
  ];

  const filteredRecommendations = allRecommendations
    .filter(rec => !dismissedRecommendations.includes(rec.id))
    .filter(rec => categoryFilter === "all" || rec.category === categoryFilter)
    .filter(rec => priorityFilter === "all" || rec.priority === priorityFilter);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredRecommendations.length / itemsPerPage);
  const currentRecommendations = filteredRecommendations.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case "bidding":
        return "📈";
      case "ads":
        return "📢";
      case "keywords":
        return "🔍";
      case "landing":
        return "🧭";
    }
  };

  const getCategoryTitle = (category: Category) => {
    switch (category) {
      case "bidding":
        return "Rendimiento de pujas";
      case "ads":
        return "Anuncios";
      case "keywords":
        return "Palabras clave";
      case "landing":
        return "Landing Pages";
    }
  };

  const handleDismiss = (recommendationId: string) => {
    setDismissedRecommendations(prev => [...prev, recommendationId]);
  };

  const handleViewHistory = () => {
    console.log("Ver historial de mejoras aplicadas");
  };

  const handleNext = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (filteredRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Recomendaciones de IA</CardTitle>
            <Button variant="outline" size="sm" onClick={handleViewHistory}>
              <History className="h-4 w-4 mr-2" />
              Ver historial
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">¡Excelente! No hay recomendaciones pendientes.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Recomendaciones de IA</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredRecommendations.length} recomendaciones activas
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleViewHistory}>
            <History className="h-4 w-4 mr-2" />
            Ver historial
          </Button>
        </div>
        
        {/* Filtros */}
        <div className="flex gap-4 mt-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="bidding">📈 Rendimiento de pujas</SelectItem>
              <SelectItem value="ads">📢 Anuncios</SelectItem>
              <SelectItem value="keywords">🔍 Palabras clave</SelectItem>
              <SelectItem value="landing">🧭 Landing Pages</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="high">Alta prioridad</SelectItem>
              <SelectItem value="medium">Media prioridad</SelectItem>
              <SelectItem value="low">Baja prioridad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          {/* Carrusel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRecommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100"
                  onClick={() => handleDismiss(rec.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="flex items-start gap-2 mb-3 pr-8">
                  <span className="text-lg">{getCategoryIcon(rec.category)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">{rec.title}</h4>
                    <div className="flex gap-2 mt-2">
                      {getPriorityIcon(rec.priority)}
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                        {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Media" : "Baja"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{rec.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    {rec.impact}
                  </Badge>
                  <Button size="sm" className="h-7 text-xs px-3">
                    Aplicar
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Controles de navegación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsPanel;