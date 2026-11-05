"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, Zap, Utensils, Clock } from "lucide-react";
import { MealType, FoodItem, CreateMealPayload, CreateMealItemPayload } from "@/types";
import { healthService } from "@/lib/api/services";

interface LogMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateLocal: string;
  defaultMealType?: MealType;
  onSuccess: () => void;
}

export function LogMealModal({
  open,
  onOpenChange,
  dateLocal,
  defaultMealType = "LUNCH",
  onSuccess,
}: LogMealModalProps) {
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [mealName, setMealName] = useState("");
  const [timeLocal, setTimeLocal] = useState("12:00");
  const [notes, setNotes] = useState("");

  // Aba Catálogo
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(100);
  const [stagedItems, setStagedItems] = useState<CreateMealItemPayload[]>([]);

  // Aba Quick Log
  const [quickCalories, setQuickCalories] = useState<string>("");
  const [quickProtein, setQuickProtein] = useState<string>("");
  const [quickCarbs, setQuickCarbs] = useState<string>("");
  const [quickFat, setQuickFat] = useState<string>("");
  const [quickFiber, setQuickFiber] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setMealType(defaultMealType);
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setTimeLocal(`${hh}:${mm}`);
      setMealName("");
      setNotes("");
      setStagedItems([]);
      setSelectedFood(null);
      setSearchQuery("");
      setQuickCalories("");
      setQuickProtein("");
      setQuickCarbs("");
      setQuickFat("");
      setQuickFiber("");
      // Busca inicial com alimentos populares
      loadInitialFoods();
    }
  }, [open, defaultMealType]);

  const loadInitialFoods = async () => {
    try {
      setIsSearching(true);
      const list = await healthService.searchFoods("", 20);
      setSearchResults(list);
    } catch (err) {
      console.error("Erro ao carregar catálogo:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    try {
      setIsSearching(true);
      const list = await healthService.searchFoods(q, 20);
      setSearchResults(list);
    } catch (err) {
      console.error("Erro ao buscar alimentos:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setItemQuantity(food.servingSizeGrams || 100);
  };

  const handleAddStagedItem = () => {
    if (!selectedFood) return;
    const ratio = itemQuantity / (selectedFood.servingSizeGrams || 100);
    const item: CreateMealItemPayload = {
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      quantity: itemQuantity,
      unit: selectedFood.servingUnitName || "g",
      calories: Math.round(selectedFood.calories * ratio * 10) / 10,
      proteinG: Math.round(selectedFood.proteinG * ratio * 10) / 10,
      carbsG: Math.round(selectedFood.carbsG * ratio * 10) / 10,
      fatG: Math.round(selectedFood.fatG * ratio * 10) / 10,
      fiberG: Math.round(selectedFood.fiberG * ratio * 10) / 10,
    };
    setStagedItems((prev) => [...prev, item]);
    setSelectedFood(null);
    setSearchQuery("");
  };

  const handleRemoveStagedItem = (index: number) => {
    setStagedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isQuickTab: boolean) => {
    try {
      setIsSubmitting(true);
      const payload: CreateMealPayload = {
        dateLocal,
        timeLocal: timeLocal || null,
        mealType,
        name: mealName.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (isQuickTab) {
        payload.quickCalories = quickCalories ? parseFloat(quickCalories) : undefined;
        payload.quickProteinG = quickProtein ? parseFloat(quickProtein) : undefined;
        payload.quickCarbsG = quickCarbs ? parseFloat(quickCarbs) : undefined;
        payload.quickFatG = quickFat ? parseFloat(quickFat) : undefined;
        payload.quickFiberG = quickFiber ? parseFloat(quickFiber) : undefined;
        payload.items = [];
      } else {
        payload.items = stagedItems;
      }

      await healthService.logMeal(payload);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao registrar refeição:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview das calorias e macros calculados para o alimento selecionado
  const selectedRatio = selectedFood ? itemQuantity / (selectedFood.servingSizeGrams || 100) : 1;
  const previewCalories = selectedFood ? Math.round(selectedFood.calories * selectedRatio) : 0;
  const previewProtein = selectedFood ? (selectedFood.proteinG * selectedRatio).toFixed(1) : "0";
  const previewCarbs = selectedFood ? (selectedFood.carbsG * selectedRatio).toFixed(1) : "0";
  const previewFat = selectedFood ? (selectedFood.fatG * selectedRatio).toFixed(1) : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Utensils className="h-5 w-5 text-health-primary" />
            Registrar Refeição
          </DialogTitle>
          <DialogDescription>
            Adicione alimentos do catálogo com cálculo automático de macros ou faça um registro rápido.
          </DialogDescription>
        </DialogHeader>

        {/* Metadados da Refeição */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-b border-border/40">
          <div>
            <Label className="text-xs">Tipo de Refeição</Label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="BREAKFAST">☕ Café da Manhã</option>
              <option value="LUNCH">🥗 Almoço</option>
              <option value="SNACK">🍎 Lanches & Snacks</option>
              <option value="DINNER">🍽️ Jantar</option>
              <option value="SUPPER">🌙 Ceia</option>
            </select>
          </div>

          <div>
            <Label className="text-xs">Horário</Label>
            <div className="relative mt-1">
              <Input
                type="time"
                value={timeLocal}
                onChange={(e) => setTimeLocal(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Nome / Rótulo (Opcional)</Label>
            <Input
              placeholder="Ex: Pós-treino"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>
        </div>

        {/* Abas: Catálogo vs Quick Log */}
        <Tabs defaultValue="catalog" className="mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="catalog" className="text-xs flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Alimentos do Catálogo
            </TabsTrigger>
            <TabsTrigger value="quick" className="text-xs flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Quick Log (Macros Diretos)
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: CATÁLOGO */}
          <TabsContent value="catalog" className="space-y-4">
            {/* Campo de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimento (ex: Frango, Arroz, Ovo, Aveia)..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Resultados da Busca */}
            <div className="border border-border/40 rounded-lg max-h-40 overflow-y-auto divide-y divide-border/20 bg-secondary/10">
              {isSearching ? (
                <div className="text-xs text-muted-foreground p-3 text-center">Buscando alimentos...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-xs text-muted-foreground p-3 text-center">Nenhum alimento encontrado.</div>
              ) : (
                searchResults.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleSelectFood(f)}
                    className={`p-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors hover:bg-secondary/40 ${
                      selectedFood?.id === f.id ? "bg-health-primary/10 border-l-2 border-health-primary" : ""
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-foreground">{f.name}</span>
                      {f.brand && <span className="text-[10px] text-muted-foreground ml-1.5">({f.brand})</span>}
                      <span className="text-[10px] text-muted-foreground block">
                        Porção ref: {f.servingSizeGrams}{f.servingUnitName}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground">
                      <span className="font-semibold text-orange-500">{Math.round(f.calories)} kcal</span>
                      <span className="block text-[10px]">
                        P: {f.proteinG}g • C: {f.carbsG}g • G: {f.fatG}g
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Configuração da porção do alimento selecionado */}
            {selectedFood && (
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Item selecionado: {selectedFood.name}
                  </span>
                  <Badge variant="outline" className="text-[11px] text-orange-500 border-orange-500/30">
                    {previewCalories} kcal (P: {previewProtein}g, C: {previewCarbs}g, G: {previewFat}g)
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">Quantidade ({selectedFood.servingUnitName})</Label>
                    <Input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddStagedItem}
                    className="mt-5 h-8 text-xs bg-health-primary text-white hover:bg-health-primary/90"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Adicionar à Refeição
                  </Button>
                </div>
              </div>
            )}

            {/* Itens adicionados para a refeição */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                Itens na Refeição ({stagedItems.length})
              </Label>
              {stagedItems.length === 0 ? (
                <div className="text-xs text-muted-foreground/60 italic p-3 border border-dashed border-border/40 rounded-lg text-center">
                  Nenhum item adicionado ainda. Selecione um alimento acima e clique em "Adicionar à Refeição".
                </div>
              ) : (
                <div className="divide-y divide-border/20 border border-border/40 rounded-lg bg-card p-2 space-y-1">
                  {stagedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2">
                      <div>
                        <span className="font-medium text-foreground">{item.foodName}</span>
                        <span className="text-[11px] text-muted-foreground ml-1.5">
                          ({item.quantity} {item.unit})
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          P: {item.proteinG}g • C: {item.carbsG}g • G: {item.fatG}g
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-500">{item.calories} kcal</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStagedItem(idx)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-border/40">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={isSubmitting || stagedItems.length === 0}
                onClick={() => handleSubmit(false)}
                className="bg-health-primary text-white hover:bg-health-primary/90 text-xs"
              >
                {isSubmitting ? "Salvando..." : "Salvar Refeição"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* ABA 2: QUICK LOG */}
          <TabsContent value="quick" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Calorias (kcal)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 450"
                  value={quickCalories}
                  onChange={(e) => setQuickCalories(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
                <span className="text-[10px] text-muted-foreground">Opcional se preencher macros</span>
              </div>

              <div>
                <Label className="text-xs">Proteínas (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 35"
                  value={quickProtein}
                  onChange={(e) => setQuickProtein(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs">Carboidratos (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 50"
                  value={quickCarbs}
                  onChange={(e) => setQuickCarbs(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs">Gorduras (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 12"
                  value={quickFat}
                  onChange={(e) => setQuickFat(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs">Fibras (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 5"
                  value={quickFiber}
                  onChange={(e) => setQuickFiber(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-border/40">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={
                  isSubmitting ||
                  (!quickCalories && !quickProtein && !quickCarbs && !quickFat)
                }
                onClick={() => handleSubmit(true)}
                className="bg-health-primary text-white hover:bg-health-primary/90 text-xs"
              >
                {isSubmitting ? "Salvando..." : "Salvar Quick Log"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </div>
    </Dialog>
  );
}
