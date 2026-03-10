'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getForecast,
  type ForecastEntry,
  type ForecastResponse,
} from '@/lib/api/deals';
import { listPipelines, type Pipeline } from '@/lib/api/pipelines';
import { formatCurrency } from './utils';

export function ForecastView() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>(
    'quarter',
  );
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPipelines() {
      try {
        const data = await listPipelines();
        setPipelines(data);
        const defaultPipeline = data.find((p) => p.isDefault) ?? data[0];
        if (defaultPipeline) {
          setSelectedPipelineId(defaultPipeline.id);
        }
      } catch {
        toast.error('Échec du chargement des pipelines');
      }
    }
    loadPipelines();
  }, []);

  const fetchForecast = useCallback(async () => {
    if (!selectedPipelineId) return;
    setIsLoading(true);
    try {
      const data = await getForecast(selectedPipelineId, period);
      setForecast(data);
    } catch {
      toast.error('Échec du chargement des données de prévision');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPipelineId, period]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  // Calculate max weighted amount for bar chart scaling
  const maxWeighted = forecast
    ? Math.max(...forecast.entries.map((e) => e.weightedAmount), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {pipelines.length > 1 && (
          <Select
            value={selectedPipelineId}
            onValueChange={setSelectedPipelineId}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Sélectionner un pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((pipeline) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mensuel</SelectItem>
            <SelectItem value="quarter">Trimestriel</SelectItem>
            <SelectItem value="year">Annuel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : forecast ? (
        <>
          {/* Cartes de résumé */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Prévision pondérée
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(forecast.totalWeighted)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ajusté par la probabilité de l&apos;étape
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valeur totale du pipeline
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(forecast.totalUnweighted)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Montants complets avant pondération
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Visualisation en barres */}
          {forecast.entries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Prévisions par période
                </CardTitle>
                <CardDescription>
                  Montants des affaires pondérés par la probabilité de l&apos;étape
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecast.entries.map((entry: ForecastEntry) => (
                    <div key={entry.period} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{entry.period}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(entry.weightedAmount)} pondéré
                          &middot; {entry.dealCount} affaires
                        </span>
                      </div>
                      <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${(entry.weightedAmount / maxWeighted) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Total : {formatCurrency(entry.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tableau de détails */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détails des prévisions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Période</TableHead>
                    <TableHead className="text-right">Affaires</TableHead>
                    <TableHead className="text-right">Montant total</TableHead>
                    <TableHead className="text-right">
                      Montant pondéré
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast.entries.length > 0 ? (
                    forecast.entries.map((entry: ForecastEntry) => (
                      <TableRow key={entry.period}>
                        <TableCell className="font-medium">
                          {entry.period}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.dealCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(entry.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(entry.weightedAmount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        Aucune donnée de prévision disponible
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
