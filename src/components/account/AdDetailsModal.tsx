import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Image, Video } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Ad {
  id: string;
  headline1: string;
  headline2: string;
  headline3?: string;
  description: string;
  description2?: string;
  adGroupName: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  finalUrl: string;
  // Información adicional para el modal
  headlines?: string[];
  descriptions?: string[];
  paths?: string[];
  callouts?: string[];
  sitelinks?: Array<{title: string, url: string}>;
  images?: Array<{url: string, type: string}>;
  videos?: Array<{url: string, type: string}>;
}

interface AdDetailsModalProps {
  ad: Ad | null;
  isOpen: boolean;
  onClose: () => void;
}

const AdDetailsModal = ({ ad, isOpen, onClose }: AdDetailsModalProps) => {
  if (!ad) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENABLED":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "PAUSED":
        return <Badge variant="outline">Pausado</Badge>;
      case "REMOVED":
        return <Badge variant="destructive">Eliminado</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  // Mock data adicional para demo
  const extendedAd = {
    ...ad,
    headlines: [ad.headline1, ad.headline2, "Títular adicional 3", "Títular adicional 4"],
    descriptions: [ad.description, "Descripción adicional con más detalles sobre el producto", "Tercera descripción"],
    paths: ["/verano-2024", "/ofertas"],
    callouts: ["Envío Gratis", "Garantía 2 años", "Devolución fácil"],
    sitelinks: [
      { title: "Catálogo Completo", url: "https://ejemplo.com/catalogo" },
      { title: "Ofertas Especiales", url: "https://ejemplo.com/ofertas" },
      { title: "Atención Cliente", url: "https://ejemplo.com/contacto" }
    ],
    images: [
      { url: "/placeholder.svg", type: "Logo" },
      { url: "/placeholder.svg", type: "Producto Principal" },
      { url: "/placeholder.svg", type: "Banner Promocional" }
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles del Anuncio</span>
            {getStatusBadge(ad.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Información General</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Grupo de Anuncios:</span>
                <p className="text-muted-foreground">{ad.adGroupName}</p>
              </div>
              <div>
                <span className="font-medium">URL Final:</span>
                <p className="text-muted-foreground">
                  <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                    <a href={ad.finalUrl} target="_blank" rel="noopener noreferrer">
                      {ad.finalUrl}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Títulos */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Títulos</h3>
            <div className="grid gap-2">
              {extendedAd.headlines.map((headline, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded border border-blue-200">
                  <span className="text-sm font-medium text-blue-800">Título {index + 1}: </span>
                  <span className="text-blue-900">{headline}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Descripciones */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Descripciones</h3>
            <div className="grid gap-2">
              {extendedAd.descriptions.map((description, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Descripción {index + 1}: </span>
                  <span className="text-gray-900">{description}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Extensiones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rutas de URL */}
            <div>
              <h4 className="font-semibold mb-2">Rutas de URL</h4>
              <div className="space-y-1">
                {extendedAd.paths.map((path, index) => (
                  <div key={index} className="text-sm bg-green-50 p-2 rounded border border-green-200">
                    {path}
                  </div>
                ))}
              </div>
            </div>

            {/* Extensiones de llamada */}
            <div>
              <h4 className="font-semibold mb-2">Extensiones de Llamada</h4>
              <div className="space-y-1">
                {extendedAd.callouts.map((callout, index) => (
                  <div key={index} className="text-sm bg-purple-50 p-2 rounded border border-purple-200">
                    {callout}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sitelinks */}
          <div>
            <h4 className="font-semibold mb-2">Enlaces de Sitio</h4>
            <div className="grid gap-2">
              {extendedAd.sitelinks.map((sitelink, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                  <span className="font-medium text-yellow-800">{sitelink.title}</span>
                  <Button variant="link" size="sm" className="p-0 h-auto text-yellow-700" asChild>
                    <a href={sitelink.url} target="_blank" rel="noopener noreferrer">
                      {sitelink.url}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Assets */}
          <div>
            <h4 className="font-semibold mb-2">Recursos (Assets)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {extendedAd.images.map((image, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="h-4 w-4" />
                    <span className="text-sm font-medium">{image.type}</span>
                  </div>
                  <img src={image.url} alt={image.type} className="w-full h-20 object-cover rounded" />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Métricas */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Rendimiento</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold">{ad.impressions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Impresiones</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold">{ad.clicks.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Clics</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold">{ad.ctr}%</p>
                <p className="text-sm text-muted-foreground">CTR</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold">{formatCurrency(ad.cpc)}</p>
                <p className="text-sm text-muted-foreground">CPC</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold">{ad.conversions}</p>
                <p className="text-sm text-muted-foreground">Conversiones</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdDetailsModal;