"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { format, addDays, startOfWeek } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  Search,
  Star,
  Printer,
  Filter,
  Clock,
  AlertTriangle,
  ChevronDown,
  Plus,
  Edit,
  Trash,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "react-hot-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MealPlanner() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const { t } = useLanguage();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [meals, setMeals] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAllergen, setFilterAllergen] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [activeTab, setActiveTab] = useState("planner");
  const [isLoading, setIsLoading] = useState(true);
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    image: "/placeholder.svg?height=100&width=100",
    tags: [],
    prepTime: 0,
    allergens: [],
    rating: 0,
    calories: 0,
    ingredients: [],
    instructions: "",
  });

  const componentRef = useRef();

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    fetchWeeklyMealPlan();
  }, [currentWeek]);

  const fetchWeeklyMealPlan = async () => {
    setIsLoading(true);
    const startDate = format(currentWeek, "yyyy-MM-dd");
    const endDate = format(addDays(currentWeek, 6), "yyyy-MM-dd");

    try {
      const response = await fetch(
        `${API_URL}/api/meal/week?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch weekly meal plan");

      const data = await response.json();
      console.log("Fetched meal data:", data); // Debug log

      const mealData = {};
      data.forEach(({ date, meals }) => {
        mealData[format(new Date(date), "yyyy-MM-dd")] = meals;
      });

      setMeals(mealData);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      } else {
        console.error("Error fetching weekly meal plan:", error);
        toast.error(t.errorFetchingMealPlan);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/recipe`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error fetching recipes:", error);
      toast.error(t.errorFetchingRecipes);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Meal Planner",
    onAfterPrint: () => toast.success(t.printSuccess),
  });

  const addRecipe = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newRecipe),
      });
      if (!response.ok) throw new Error("Failed to add recipe");
      const data = await response.json();
      setRecipes([...recipes, data]);
      toast.success(t.recipeAddedSuccess);
      setNewRecipe({
        name: "",
        image: "/placeholder.svg?height=100&width=100",
        tags: [],
        prepTime: 0,
        allergens: [],
        rating: 0,
        calories: 0,
        ingredients: [],
        instructions: "",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error adding recipe:", error);
      toast.error(t.errorAddingRecipe);
    }
  };

  const updateRecipe = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/recipe/${editingRecipe._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(editingRecipe),
        }
      );
      if (!response.ok) throw new Error("Failed to update recipe");
      const updatedRecipe = await response.json();
      setRecipes(
        recipes.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
      );
      toast.success(t.recipeUpdatedSuccess);
      setEditingRecipe(null);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error updating recipe:", error);
      toast.error(t.errorUpdatingRecipe);
    }
  };

  const deleteRecipe = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/recipe/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete recipe");
      setRecipes(recipes.filter((r) => r._id !== id));
      toast.success(t.recipeDeletedSuccess);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error deleting recipe:", error);
      toast.error(t.errorDeletingRecipe);
    }
  };

  const assignMeal = async (date, mealType, recipe) => {
    try {
      console.log("Assigning meal:", { date, mealType, recipe }); // Debug log
      const response = await fetch(`${API_URL}/api/meal/${date}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          [mealType]: { recipeId: recipe._id, recipeName: recipe.name },
        }),
      });

      if (!response.ok) throw new Error("Failed to assign meal");

      const updatedMeal = await response.json();
      console.log("Updated meal from backend:", updatedMeal); // Debug log

      // Update local state
      setMeals((prevMeals) => ({
        ...prevMeals,
        [date]: {
          ...prevMeals[date],
          [mealType]: recipe,
        },
      }));
      toast.success(t.mealAssignedSuccess);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error assigning meal:", error);
      toast.error(t.errorAssigningMeal);
    }
  };

  const removeMeal = async (date, mealType) => {
    try {
      const response = await fetch(`${API_URL}/api/meal/${date}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [mealType]: null }),
      });
      if (!response.ok) throw new Error("Failed to remove meal");
      setMeals((prevMeals) => ({
        ...prevMeals,
        [date]: {
          ...prevMeals[date],
          [mealType]: null,
        },
      }));
      toast.success(t.mealRemovedSuccess);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error removing meal:", error);
      toast.error(t.errorRemovingMeal);
    }
  };

  const filteredRecipes = recipes.filter(
    (recipe) =>
      (recipe.name?.toLowerCase().includes(searchTerm?.toLowerCase() || "") ||
        "") &&
      (filterAllergen === "" || !recipe.allergens?.includes(filterAllergen))
  );

  const renderMealCell = (date, mealType) => {
    const meal = meals[date] ? meals[date][mealType] : null;
    return (
      <div className="bg-secondary p-2 rounded-md min-h-[100px] flex flex-col justify-between">
        {meal ? (
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
            <CardHeader className="p-2">
              <CardTitle className="text-sm font-medium">{meal.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {meal.prepTime} min
              </Badge>
              <Badge variant="outline" className="text-xs">
                {meal.calories} kcal
              </Badge>
            </CardContent>
            <CardFooter className="p-2 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-1"
                onClick={() => setEditingMeal({ date, mealType, meal })}
              >
                <Edit className="h-3 w-3 mr-1" />
                {t.edit}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-1"
                onClick={() => removeMeal(date, mealType)}
              >
                <Trash className="h-3 w-3 mr-1" />
                {/* {t.remove} */}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Button
            variant="ghost"
            className="w-full h-full text-xs"
            onClick={() => setEditingMeal({ date, mealType, meal: null })}
          >
            {t.addMeal}
          </Button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl" ref={componentRef}>
      <h1 className="text-3xl font-bold mb-6">{t.mealPlanner}</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="planner">{t.weeklyPlanner}</TabsTrigger>
          <TabsTrigger value="recipes">{t.recipeLibrary}</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="planner">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
                <Button
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                >
                  <ChevronLeft className="mr-2" />
                  {t.previousWeek}
                </Button>
                <h2 className="text-xl font-semibold text-center">
                  {format(currentWeek, "MMMM d, yyyy")} -{" "}
                  {format(addDays(currentWeek, 6), "MMMM d, yyyy")}
                </h2>
                <Button onClick={() => setCurrentWeek(addDays(currentWeek, 7))}>
                  {t.nextWeek}
                  <ChevronRight className="ml-2" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-8 gap-2 min-w-[800px]">
                  <div className="font-bold"></div>
                  {[...Array(7)].map((_, i) => {
                    const date = addDays(currentWeek, i);
                    return (
                      <div key={i} className="font-bold text-center">
                        <div>{format(date, "EEE")}</div>
                        <div>{format(date, "MMM d")}</div>
                      </div>
                    );
                  })}
                  {["breakfast", "lunch", "dinner"].map((mealType) => (
                    <React.Fragment key={mealType}>
                      <div className="font-semibold capitalize">{mealType}</div>
                      {[...Array(7)].map((_, i) => {
                        const date = format(
                          addDays(currentWeek, i),
                          "yyyy-MM-dd"
                        );
                        return (
                          <div key={`${date}-${mealType}`}>
                            {renderMealCell(date, mealType)}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {/* <Button onClick={handlePrint} className="mt-4">
              <Printer className="mr-2" />
              {t.printMealPlan}
            </Button> */}
            </TabsContent>

            <TabsContent value="recipes">
              <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t.searchRecipes}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2" />
                      {t.filterAllergens}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setFilterAllergen("")}>
                      {t.all}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setFilterAllergen("Gluten")}
                    >
                      {t.gluten}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilterAllergen("Soy")}>
                      {t.soy}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setFilterAllergen("Fish")}
                    >
                      {t.fish}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2" />
                      {t.addRecipe}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t.addNewRecipe}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          {t.name}
                        </Label>
                        <Input
                          id="name"
                          value={newRecipe.name}
                          onChange={(e) =>
                            setNewRecipe({ ...newRecipe, name: e.target.value })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="prepTime" className="text-right">
                          {t.prepTime}
                        </Label>
                        <Input
                          id="prepTime"
                          type="number"
                          value={newRecipe.prepTime}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              prepTime: parseInt(e.target.value),
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="calories" className="text-right">
                          {t.calories}
                        </Label>
                        <Input
                          id="calories"
                          type="number"
                          value={newRecipe.calories}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              calories: parseInt(e.target.value),
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="ingredients" className="text-right">
                          {t.ingredients}
                        </Label>
                        <Textarea
                          id="ingredients"
                          value={newRecipe.ingredients.join(", ")}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              ingredients: e.target.value
                                .split(",")
                                .map((item) => item.trim()),
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="instructions" className="text-right">
                          {t.instructions}
                        </Label>
                        <Textarea
                          id="instructions"
                          value={newRecipe.instructions}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              instructions: e.target.value,
                            })
                          }
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={addRecipe}>
                        {t.addRecipe}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredRecipes.map((recipe) => (
                    <motion.div
                      key={recipe._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="flex justify-between items-center">
                            <span className="truncate">{recipe.name}</span>
                            <div className="flex">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedRecipe(recipe)}
                              >
                                <Star
                                  className={
                                    recipe.rating >= 4.5
                                      ? "text-yellow-400 fill-yellow-400"
                                      : ""
                                  }
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingRecipe({ ...recipe })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteRecipe(recipe._id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {/* <div className="aspect-square relative mb-2">
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="rounded-md object-cover w-full h-full"
                          />
                        </div> */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {recipe.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center text-muted-foreground mb-2">
                            <Clock className="mr-1" size={16} />
                            <span>{recipe.prepTime} min</span>
                          </div>
                          {recipe.allergens.map((allergen) => (
                            <Badge
                              key={allergen}
                              variant="destructive"
                              className="mr-1"
                            >
                              <AlertTriangle className="mr-1" size={12} />
                              {allergen}
                            </Badge>
                          ))}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="flex items-center">
                            <Star
                              className="text-yellow-400 fill-yellow-400 mr-1"
                              size={16}
                            />
                            <span>{recipe.rating.toFixed(1)}</span>
                          </div>
                          <Badge variant="outline">
                            {recipe.calories} kcal
                          </Badge>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {selectedRecipe && (
        <Dialog
          open={!!selectedRecipe}
          onOpenChange={() => setSelectedRecipe(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedRecipe.name}</DialogTitle>
              <DialogDescription>
                {selectedRecipe.prepTime} min | {selectedRecipe.calories} kcal
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ingredients" className="text-right">
                  {t.ingredients}
                </Label>
                <ul className="col-span-3 text-sm list-disc pl-5">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructions" className="text-right">
                  {t.instructions}
                </Label>
                <p className="col-span-3 text-sm">
                  {selectedRecipe.instructions}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editingRecipe && (
        <Dialog
          open={!!editingRecipe}
          onOpenChange={() => setEditingRecipe(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t.editRecipe}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  {t.name}
                </Label>
                <Input
                  id="edit-name"
                  value={editingRecipe.name}
                  onChange={(e) =>
                    setEditingRecipe({ ...editingRecipe, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-prep-time" className="text-right">
                  {t.prepTime}
                </Label>
                <Input
                  id="edit-prep-time"
                  type="number"
                  value={editingRecipe.prepTime}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      prepTime: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-calories" className="text-right">
                  {t.calories}
                </Label>
                <Input
                  id="edit-calories"
                  type="number"
                  value={editingRecipe.calories}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      calories: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-ingredients" className="text-right">
                  {t.ingredients}
                </Label>
                <Textarea
                  id="edit-ingredients"
                  value={editingRecipe.ingredients.join(", ")}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      ingredients: e.target.value
                        .split(",")
                        .map((item) => item.trim()),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-instructions" className="text-right">
                  {t.instructions}
                </Label>
                <Textarea
                  id="edit-instructions"
                  value={editingRecipe.instructions}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      instructions: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={updateRecipe}>
                {t.updateRecipe}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editingMeal && (
        <Dialog open={!!editingMeal} onOpenChange={() => setEditingMeal(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingMeal.meal ? t.editMeal : t.addMeal}
              </DialogTitle>
              <DialogDescription>
                {format(new Date(editingMeal.date), "MMMM d, yyyy")} -{" "}
                {editingMeal.mealType}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meal-recipe" className="text-right">
                  {t.recipe}
                </Label>
                <Select
                  value={editingMeal.meal ? editingMeal.meal._id : ""}
                  onValueChange={(value) => {
                    const recipe = recipes.find((r) => r._id === value);
                    assignMeal(editingMeal.date, editingMeal.mealType, recipe);
                    setEditingMeal(null);
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectRecipe} />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe._id} value={recipe._id}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editingMeal.meal && (
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => {
                    removeMeal(editingMeal.date, editingMeal.mealType);
                    setEditingMeal(null);
                  }}
                >
                  {t.removeMeal}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}

      <Toaster />
    </div>
  );
}
