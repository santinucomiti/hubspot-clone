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
  { name: 'Meeting Scheduled', position: 1, probability: 25, isWon: false, isLost: false },
  { name: 'Proposal Sent', position: 2, probability: 50, isWon: false, isLost: false },
  { name: 'Negotiation', position: 3, probability: 75, isWon: false, isLost: false },
  { name: 'Closed Won', position: 4, probability: 100, isWon: true, isLost: false },
  { name: 'Closed Lost', position: 5, probability: 0, isWon: false, isLost: true },
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
      toast.error('Failed to load pipelines');
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
      toast.error('Pipeline name is required');
      return;
    }

    const validStages = stages.filter((s) => s.name.trim());
    if (validStages.length === 0) {
      toast.error('At least one stage is required');
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
        toast.success('Pipeline updated');
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
        toast.success('Pipeline created');
      }
      setShowPipelineDialog(false);
      fetchPipelines();
    } catch {
      toast.error('Failed to save pipeline');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPipeline) return;
    setIsDeleting(true);
    try {
      await deletePipeline(deletingPipeline.id);
      toast.success('Pipeline deleted');
      setDeletingPipeline(null);
      fetchPipelines();
    } catch {
      toast.error('Failed to delete pipeline');
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
              Manage your sales pipelines and stages
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New Pipeline
          </Button>
        </div>

        {pipelines.map((pipeline) => (
          <Card key={pipeline.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{pipeline.name}</CardTitle>
                  {pipeline.isDefault && (
                    <Badge variant="secondary">Default</Badge>
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
                {pipeline.stages.length} stages
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
                        Won
                      </Badge>
                    )}
                    {stage.isLost && (
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-red-100 text-red-700 text-[10px] px-1"
                      >
                        Lost
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Pipeline Dialog */}
      <Dialog open={showPipelineDialog} onOpenChange={setShowPipelineDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPipeline ? 'Edit Pipeline' : 'Create Pipeline'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Pipeline Name */}
            <div className="space-y-2">
              <Label htmlFor="pipelineName">Pipeline Name</Label>
              <Input
                id="pipelineName"
                placeholder="e.g. Sales Pipeline"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
              />
            </div>

            {/* Default Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={pipelineIsDefault}
                onCheckedChange={(checked) =>
                  setPipelineIsDefault(checked === true)
                }
              />
              <Label htmlFor="isDefault" className="text-sm font-normal">
                Set as default pipeline
              </Label>
            </div>

            <Separator />

            {/* Stages */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Stages</Label>
                <Button variant="outline" size="sm" onClick={addStage}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Stage
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
                          placeholder="Stage name"
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
                          <span className="text-xs">Won</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={stage.isLost}
                            onCheckedChange={(checked) =>
                              updateStage(index, 'isLost', checked === true)
                            }
                          />
                          <span className="text-xs">Lost</span>
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
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingPipeline ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pipeline Confirmation */}
      <ConfirmDialog
        open={!!deletingPipeline}
        onOpenChange={(open) => !open && setDeletingPipeline(null)}
        title="Delete Pipeline"
        description={`Are you sure you want to delete "${deletingPipeline?.name}"? All stages in this pipeline will be removed. Deals must be moved to another pipeline first.`}
        confirmLabel="Delete Pipeline"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
