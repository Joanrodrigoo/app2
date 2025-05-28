
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Lightbulb, ArrowRight } from "lucide-react";

interface RecommendationsProps {
  accountId: string;
}

type Priority = "high" | "medium" | "low";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  impact: string;
  category: string;
}

const RecommendationsPanel = ({ accountId }: RecommendationsProps) => {
  const recommendations: Recommendation[] = [
    {
      id: "1",
      title: "Optimizar pujas en campañas de búsqueda",
      description: "Detectamos campañas con pujas muy altas que están perdiendo impresiones por presupuesto limitado.",
      priority: "high",
      impact: "+25% impresiones",
      category: "Pujas"
    },
    {
      id: "2", 
      title: "Añadir extensiones de anuncio",
      description: "Tus anuncios principales no tienen extensiones de enlace, lo que reduce el CTR potencial.",
      priority: "medium",
      impact: "+15% CTR",
      category: "Extensiones"
    },
    {
      id: "3",
      title: "Revisar palabras clave negativas",
      description: "Hay términos de búsqueda irrelevantes que están generando clics sin conversión.",
      priority: "high",
      impact: "-20% coste",
      category: "Keywords"
    },
    {
      id: "4",
      title: "Optimizar landing pages",
      description: "Algunas páginas de destino tienen velocidades de carga lentas afectando el Quality Score.",
      priority: "medium",
      impact: "+10% Quality Score",
      category: "Landing Pages"
    },
    {
      id: "5",
      title: "Ajustar segmentación geográfica",
      description: "Hay ubicaciones con bajo rendimiento que consumen presupuesto sin generar conversiones.",
      priority: "low",
      impact: "+8% ROAS",
      category: "Segmentación"
    }
  ];

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

  const groupedRecommendations = {
    high: recommendations.filter(r => r.priority === "high"),
    medium: recommendations.filter(r => r.priority === "medium"),
    low: recommendations.filter(r => r.priority === "low")
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Recomendaciones de IA</h2>
        
        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Prioridad Alta</p>
                  <p className="text-2xl font-bold text-red-900">{groupedRecommendations.high.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Prioridad Media</p>
                  <p className="text-2xl font-bold text-yellow-900">{groupedRecommendations.medium.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Prioridad Baja</p>
                  <p className="text-2xl font-bold text-blue-900">{groupedRecommendations.low.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de recomendaciones */}
      <div className="grid gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(rec.priority)}
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                  <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                    {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Media" : "Baja"}
                  </Badge>
                </div>
                <Badge variant="secondary">{rec.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{rec.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Impacto estimado:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {rec.impact}
                  </Badge>
                </div>
                <Button size="sm">
                  Aplicar recomendación
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPanel;
