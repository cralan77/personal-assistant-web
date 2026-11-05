"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, Trash2 } from "lucide-react";
import { FoodItem, CreateFoodPayload } from "@/types";
import { healthService } from "@/lib/api/services";

interface FoodCatalogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FoodCatalogModal({ open, onOpenChange }: FoodCatalogModalProps) {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form novo alimento
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [servingSize, setServingSize] = useState("100");
  const [servingUnit, setServingUnit] = useState("g");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");

  useEffect(() => {
    if (open) {
      loadFoods("");
      setIsCreating(false);
    }
  }, [open]);

  const loadFoods = async (q: string) => {
    try {
      setIsLoading(true);
      const list = await healthService.searchFoods(q, 50);
      setFoods(list);
    } catch (err) {
      console.error("Erro ao carregar catálogo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    loadFoods(q);
  };

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories) return;

    try {
      setIsSubmitting(true);
      const payload: CreateFoodPayload = {
        name: name.trim(),
        brand: brand.trim() || undefined,
        servingSizeGrams: parseFloat(servingSize) || 100,
        servingUnitName: servingUnit || "g",
        calories: parseFloat(calories) || 0,
        proteinG: parseFloat(protein) || 0,
        carbsG: parseFloat(carbs) || 0,
        fatG: parseFloat(fat) || 0,
        fiberG: parseFloat(fiber) || 0,
        isFavorite: true,
      };

      await healthService.createFood(payload);
      setName("");
      setBrand("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setFiber("");
      setIsCreating(false);
      loadFoods(search);
    } catch (err) {
      console.error("Erro ao criar alimento:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      await healthService.deleteFood(id);
      loadFoods(search);
    } catch (err) {
      console.error("Erro ao deletar alimento:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-health-primary" />
            Catálogo de Alimentos & Macros
          </DialogTitle>
          <DialogDescription>
            Consulte a tabela de alimentos de referência (TACO / USDA) e gerencie seus próprios itens cadastrados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do alimento..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
            className="h-9 text-xs bg-health-primary text-white hover:bg-health-primary/90"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {isCreating ? "Fechar Formulário" : "Novo Alimento"}
          </Button>
        </div>

        {/* Formulário Novo Alimento */}
        {isCreating && (
          <form onSubmit={handleCreateFood} className="p-4 bg-secondary/30 rounded-lg border border-border/40 space-y-3">
            <h4 className="text-xs font-semibold text-foreground">Cadastrar Novo Alimento Customizado</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome do Alimento *</Label>
                <Input
                  required
                  placeholder="Ex: Iogurte Grego Caseiro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs">Marca / Origem (Opcional)</Label>
                <Input
                  placeholder="Ex: Yopro, Caseiro"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div>
                <Label className="text-[11px]">Porção</Label>
                <Input
                  type="number"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px]">Unidade</Label>
                <Input
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px]">Calorias *</Label>
                <Input
                  required
                  type="number"
                  placeholder="kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px]">Prot (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px]">Carbs (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px]">Gord (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreating(false)} className="h-7 text-xs">
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-7 text-xs bg-health-primary text-white">
                {isSubmitting ? "Salvando..." : "Salvar no Catálogo"}
              </Button>
            </div>
          </form>
        )}

        {/* Lista de Alimentos */}
        <div className="border border-border/40 rounded-lg max-h-72 overflow-y-auto divide-y divide-border/20">
          {isLoading ? (
            <div className="text-xs text-muted-foreground p-4 text-center">Carregando catálogo...</div>
          ) : foods.length === 0 ? (
            <div className="text-xs text-muted-foreground p-4 text-center">Nenhum alimento encontrado.</div>
          ) : (
            foods.map((food) => (
              <div key={food.id} className="p-3 text-xs flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{food.name}</span>
                    {food.brand && (
                      <span className="text-[10px] text-muted-foreground font-normal">({food.brand})</span>
                    )}
                    {food.userId === "SYSTEM" ? (
                      <Badge variant="outline" className="text-[9px] py-0 border-border text-muted-foreground">
                        Padrão TACO/USDA
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] py-0 border-health-primary/30 text-health-primary">
                        Personalizado
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    Porção: {food.servingSizeGrams}{food.servingUnitName} • P: {food.proteinG}g • C: {food.carbsG}g • G: {food.fatG}g • Fibra: {food.fiberG}g
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-orange-500 text-sm">
                    {Math.round(food.calories)} kcal
                  </span>
                  {food.userId !== "SYSTEM" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFood(food.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
