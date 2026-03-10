'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  listPipelines,
  createPipeline,
  updatePipeline,
  deletePipeline,
  type Pipeline,
  type CreatePipelineInput,
} from '@/lib/api/pipelines';

interface StageFormData {
  id?: string;
  name: string;
  position: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

const DEFAULT_STAGES: StageFormData[] = [
  { name: 'Qualification', position: 0, probability: 10, isWon: false, isLost: false },
  { name: 'Réunion planifiée', position: 1, probability: 25, isWon: false, isLost: false },
  { name: 'Proposition envoyée', position: 2, probability: 50, isWon: false, isLost: false },
  { name: 'Négociation', position: 3, probability: 75, isWon: false, isLost: false },
  { name: 'Fermée gagnée', position: 4, probability: 100, isWon: true, isLost: false },
  { name: 'Fermée perdue', position: 5, probability: 0, isWon: false, isLost: true },
];

export function PipelineSettings() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog state
  const [showPipelineDialog, setShowPipelineDialog] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineIsDefault, setPipelineIsDefault] = useState(false);
  const [stages, setStages] = useState<StageFormData[]>(DEFAULT_STAGES);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deletingPipeline, setDeletingPipeline] = useState<Pipeline | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPipelines = useCallback(async () => {
    try {
      const data = await listPipelines();
      setPipelines(data);
    } catch {
      toast.error('Échec du chargement des pipelines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  const openCreateDialog = () => {
    setEditingPipeline(null);
    setPipelineName('');
    setPipelineIsDefault(false);
    setStages(DEFAULT_STAGES);
    setShowPipelineDialog(true);
  };

  const openEditDialog = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setPipelineName(pipeline.name);
    setPipelineIsDefault(pipeline.isDefault);
    setStages(
      pipeline.stages.map((s) => ({
        id: s.id,
        name: s.name,
        position: s.position,
        probability: s.probability,
        isWon: s.isWon,
        isLost: s.isLost,
      })),
    );
    setShowPipelineDialog(true);
  };

  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        name: '',
        position: prev.length,
        probability: 0,
        isWon: false,
        isLost: false,
      },
    ]);
  };

  const removeStage = (index: number) => {
    setStages((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, position: i })),
    );
  };

  const updateStage = (
    index: number,
    field: keyof StageFormData,
    value: string | number | boolean,
  ) => {
    setStages((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const handleSave = async () => {
    if (!pipelineName.trim()) {
      toast.error('Le nom du pipeline est requis');
      return;
    }

    const validStages = stages.filter((s) => s.name.trim());
    if (validStages.length === 0) {
      toast.error('Au moins une étape est requise');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPipeline) {
        // Update pipeline name/default
        await updatePipeline(editingPipeline.id, {
          name: pipelineName,
          isDefault: pipelineIsDefault,
        });
        toast.success('Pipeline mis à jour');
      } else {
        // Create new pipeline with stages
        const input: CreatePipelineInput = {
          name: pipelineName,
          isDefault: pipelineIsDefault,
          stages: validStages.map((s, i) => ({
            name: s.name,
            position: i,
            probability: s.probability,
            isWon: s.isWon,
            isLost: s.isLost,
          })),
        };
        await createPipeline(input);
        toast.success('Pipeline créé');
      }
      setShowPipelineDialog(false);
      fetchPipelines();
    } catch {
      toast.error('Échec de l\'enregistrement du pipeline');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPipeline) return;
    setIsDeleting(true);
    try {
      await deletePipeline(deletingPipeline.id);
      toast.success('Pipeline supprimé');
      setDeletingPipeline(null);
      fetchPipelines();
    } catch {
      toast.error('Échec de la suppression du pipeline');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Pipelines</h2>
            <p className="text-sm text-muted-foreground">
              Gérez vos pipelines de vente et leurs étapes
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau pipeline
          </Button>
        </div>

        {pipelines.map((pipeline) => (
          <Card key={pipeline.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{pipeline.name}</CardTitle>
                  {pipeline.isDefault && (
                    <Badge variant="secondary">Par défaut</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(pipeline)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => setDeletingPipeline(pipeline)}
                    disabled={pipeline.isDefault && pipelines.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {pipeline.stages.length} étapes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {pipeline.stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm"
                  >
                    <span className="text-xs text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span>{stage.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({stage.probability}%)
                    </span>
                    {stage.isWon && (
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-emerald-100 text-emerald-700 text-[10px] px-1"
                      >
                        Gagnée
                      </Badge>
                    )}
                    {stage.isLost && (
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-red-100 text-red-700 text-[10px] px-1"
                      >
                        Perdue
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogue de création/modification de pipeline */}
      <Dialog open={showPipelineDialog} onOpenChange={setShowPipelineDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPipeline ? 'Modifier le pipeline' : 'Créer un pipeline'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nom du pipeline */}
            <div className="space-y-2">
              <Label htmlFor="pipelineName">Nom du pipeline</Label>
              <Input
                id="pipelineName"
                placeholder="ex. Pipeline de vente"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
              />
            </div>

            {/* Case à cocher par défaut */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={pipelineIsDefault}
                onCheckedChange={(checked) =>
                  setPipelineIsDefault(checked === true)
                }
              />
              <Label htmlFor="isDefault" className="text-sm font-normal">
                Définir comme pipeline par défaut
              </Label>
            </div>

            <Separator />

            {/* Étapes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Étapes</Label>
                <Button variant="outline" size="sm" onClick={addStage}>
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter une étape
                </Button>
              </div>

              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md border p-3"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div className="col-span-2">
                        <Input
                          placeholder="Nom de l'étape"
                          value={stage.name}
                          onChange={(e) =>
                            updateStage(index, 'name', e.target.value)
                          }
                        />
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="%"
                        value={stage.probability}
                        onChange={(e) =>
                          updateStage(
                            index,
                            'probability',
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={stage.isWon}
                            onCheckedChange={(checked) =>
                              updateStage(index, 'isWon', checked === true)
                            }
                          />
                          <span className="text-xs">Gagnée</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={stage.isLost}
                            onCheckedChange={(checked) =>
                              updateStage(index, 'isLost', checked === true)
                            }
                          />
                          <span className="text-xs">Perdue</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-red-500"
                      onClick={() => removeStage(index)}
                      disabled={stages.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPipelineDialog(false)}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : editingPipeline ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression de pipeline */}
      <ConfirmDialog
        open={!!deletingPipeline}
        onOpenChange={(open) => !open && setDeletingPipeline(null)}
        title="Supprimer le pipeline"
        description={`Êtes-vous sûr de vouloir supprimer « ${deletingPipeline?.name} » ? Toutes les étapes de ce pipeline seront supprimées. Les affaires doivent d'abord être déplacées vers un autre pipeline.`}
        confirmLabel="Supprimer le pipeline"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
