"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "@/lib/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash,
  Check,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function FamilyFinancePage() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []); // Empty dependency array ensures this runs once on mount
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [activeTab, setActiveTab] = useState("shopping");
  const [shoppingList, setShoppingList] = useState([]);
  const [budget, setBudget] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });
  const [transactions, setTransactions] = useState([]);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    priority: "Medium",
    notes: "",
    cost: 0,
  });
  const [editingItem, setEditingItem] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    type: "expense",
    category: "",
    amount: 0,
    description: "",
  });
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    fetchShoppingItems();
    fetchTransactions();
    fetchBudgetSummary();
  }, []);

  const fetchShoppingItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/finance/shopping-items`);
      setShoppingList(response.data);
    } catch (error) {
      console.error("Error fetching shopping items:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/finance/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchBudgetSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/finance/summary`);
      setBudget(response.data);
    } catch (error) {
      console.error("Error fetching budget summary:", error);
    }
  };

  const addShoppingItem = async () => {
    if (newItem.name && newItem.category && newItem.cost) {
      try {
        const response = await axios.post(
          `${API_URL}/api/finance/shopping-items`,
          newItem
        );
        setShoppingList([...shoppingList, response.data.shoppingItem]);
        setNewItem({
          name: "",
          category: "",
          priority: "Medium",
          notes: "",
          cost: 0,
        });
        fetchBudgetSummary(); // Refresh budget summary after adding item
        toast({
          title: t.itemAdded,
          description: t.itemAddedDescription,
        });
      } catch (error) {
        console.error("Error adding shopping item:", error);
        toast({
          title: t.errorAddingItem,
          description: t.errorAddingItemDescription,
          variant: "destructive",
        });
      }
    }
  };

  const updateShoppingItem = async () => {
    if (editingItem) {
      try {
        const response = await axios.put(
          `${API_URL}/api/finance/shopping-items/${editingItem._id}`,
          editingItem
        );
        setShoppingList(
          shoppingList.map((item) =>
            item._id === editingItem._id ? response.data.shoppingItem : item
          )
        );
        setEditingItem(null);
        fetchBudgetSummary(); // Refresh budget summary after updating item
        toast({
          title: t.itemUpdated,
          description: t.itemUpdatedDescription,
        });
      } catch (error) {
        console.error("Error updating shopping item:", error);
        toast({
          title: t.errorUpdatingItem,
          description: t.errorUpdatingItemDescription,
          variant: "destructive",
        });
      }
    }
  };

  const deleteShoppingItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/finance/shopping-items/${id}`);
      setShoppingList(shoppingList.filter((item) => item._id !== id));
      fetchBudgetSummary(); // Refresh budget summary after deleting item
      toast({
        title: t.itemDeleted,
        description: t.itemDeletedDescription,
      });
    } catch (error) {
      console.error("Error deleting shopping item:", error);
      toast({
        title: t.errorDeletingItem,
        description: t.errorDeletingItemDescription,
        variant: "destructive",
      });
    }
  };

  const addTransaction = async () => {
    if (newTransaction.category && newTransaction.amount) {
      try {
        const response = await axios.post(
          `${API_URL}/api/finance/transactions`,
          newTransaction
        );
        setTransactions([...transactions, response.data.transaction]);
        setNewTransaction({
          type: "expense",
          category: "",
          amount: 0,
          description: "",
        });
        fetchBudgetSummary(); // Refresh budget summary after adding transaction
        toast({
          title: t.transactionAdded,
          description: t.transactionAddedDescription,
        });
      } catch (error) {
        console.error("Error adding transaction:", error);
        toast({
          title: t.errorAddingTransaction,
          description: t.errorAddingTransactionDescription,
          variant: "destructive",
        });
      }
    }
  };

  const updateTransaction = async () => {
    if (editingTransaction) {
      try {
        const response = await axios.put(
          `${API_URL}/api/finance/transactions/${editingTransaction._id}`,
          editingTransaction
        );
        setTransactions(
          transactions.map((t) =>
            t._id === editingTransaction._id ? response.data.transaction : t
          )
        );
        setEditingTransaction(null);
        fetchBudgetSummary(); // Refresh budget summary after updating transaction
        toast({
          title: t.transactionUpdated,
          description: t.transactionUpdatedDescription,
        });
      } catch (error) {
        console.error("Error updating transaction:", error);
        toast({
          title: t.errorUpdatingTransaction,
          description: t.errorUpdatingTransactionDescription,
          variant: "destructive",
        });
      }
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/finance/transactions/${id}`);
      setTransactions(transactions.filter((t) => t._id !== id));
      fetchBudgetSummary(); // Refresh budget summary after deleting transaction
      toast({
        title: t.transactionDeleted,
        description: t.transactionDeletedDescription,
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: t.errorDeletingTransaction,
        description: t.errorDeletingTransactionDescription,
        variant: "destructive",
      });
    }
  };

  const renderShoppingList = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.shoppingList}</CardTitle>
        <CardDescription>{t.shoppingListDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shoppingList.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>
                <span className={item.purchased ? "line-through" : ""}>
                  {item.name}
                </span>
                <Badge
                  variant={
                    item.priority === "High"
                      ? "destructive"
                      : item.priority === "Medium"
                      ? "default"
                      : "secondary"
                  }
                >
                  {item.priority}
                </Badge>
                <Badge variant="outline">{item.category}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">${item.cost}</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingItem(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteShoppingItem(item._id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button>{editingItem ? t.editItem : t.addItem}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? t.editItem : t.addItem}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t.name}
                </Label>
                <Input
                  id="name"
                  value={editingItem ? editingItem.name : newItem.name}
                  onChange={(e) =>
                    editingItem
                      ? setEditingItem({ ...editingItem, name: e.target.value })
                      : setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  {t.category}
                </Label>
                <Input
                  id="category"
                  value={editingItem ? editingItem.category : newItem.category}
                  onChange={(e) =>
                    editingItem
                      ? setEditingItem({
                          ...editingItem,
                          category: e.target.value,
                        })
                      : setNewItem({ ...newItem, category: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  {t.priority}
                </Label>
                <Select
                  value={editingItem ? editingItem.priority : newItem.priority}
                  onValueChange={(value) =>
                    editingItem
                      ? setEditingItem({ ...editingItem, priority: value })
                      : setNewItem({ ...newItem, priority: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectPriority} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">{t.high}</SelectItem>
                    <SelectItem value="Medium">{t.medium}</SelectItem>
                    <SelectItem value="Low">{t.low}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">
                  {t.cost}
                </Label>
                <Input
                  id="cost"
                  type="number"
                  value={editingItem ? editingItem.cost : newItem.cost}
                  onChange={(e) =>
                    editingItem
                      ? setEditingItem({
                          ...editingItem,
                          cost: parseFloat(e.target.value),
                        })
                      : setNewItem({
                          ...newItem,
                          cost: parseFloat(e.target.value),
                        })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  {t.notes}
                </Label>
                <Textarea
                  id="notes"
                  value={editingItem ? editingItem.notes : newItem.notes}
                  onChange={(e) =>
                    editingItem
                      ? setEditingItem({
                          ...editingItem,
                          notes: e.target.value,
                        })
                      : setNewItem({ ...newItem, notes: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={editingItem ? updateShoppingItem : addShoppingItem}
              >
                {editingItem ? t.updateItem : t.addItem}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );

  const renderBudget = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.budgetManagement}</CardTitle>
        <CardDescription>{t.budgetManagementDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{t.totalIncome}</p>
              <p className="text-2xl font-bold text-green-600">
                ${budget.income.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="font-semibold">{t.totalExpenses}</p>
              <p className="text-2xl font-bold text-red-600">
                ${budget.expenses.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="font-semibold">{t.balance}</p>
              <p className="text-2xl font-bold">${budget.balance.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t.transactions}</h3>
            {transactions.map((transaction) => (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-2 border rounded mb-2"
              >
                <div>
                  <span
                    className={
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {transaction.type === "income" ? "+" : "-"} $
                    {transaction.amount}
                  </span>
                  <Badge variant="outline">{transaction.category}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingTransaction(transaction)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTransaction(transaction._id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              {editingTransaction ? t.editTransaction : t.addTransaction}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? t.editTransaction : t.addTransaction}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  {t.type}
                </Label>
                <Select
                  value={
                    editingTransaction
                      ? editingTransaction.type
                      : newTransaction.type
                  }
                  onValueChange={(value) =>
                    editingTransaction
                      ? setEditingTransaction({
                          ...editingTransaction,
                          type: value,
                        })
                      : setNewTransaction({ ...newTransaction, type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t.income}</SelectItem>
                    <SelectItem value="expense">{t.expense}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  {t.category}
                </Label>
                <Input
                  id="category"
                  value={
                    editingTransaction
                      ? editingTransaction.category
                      : newTransaction.category
                  }
                  onChange={(e) =>
                    editingTransaction
                      ? setEditingTransaction({
                          ...editingTransaction,
                          category: e.target.value,
                        })
                      : setNewTransaction({
                          ...newTransaction,
                          category: e.target.value,
                        })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  {t.amount}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={
                    editingTransaction
                      ? editingTransaction.amount
                      : newTransaction.amount
                  }
                  onChange={(e) =>
                    editingTransaction
                      ? setEditingTransaction({
                          ...editingTransaction,
                          amount: parseFloat(e.target.value),
                        })
                      : setNewTransaction({
                          ...newTransaction,
                          amount: parseFloat(e.target.value),
                        })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  {t.description}
                </Label>
                <Textarea
                  id="description"
                  value={
                    editingTransaction
                      ? editingTransaction.description
                      : newTransaction.description
                  }
                  onChange={(e) =>
                    editingTransaction
                      ? setEditingTransaction({
                          ...editingTransaction,
                          description: e.target.value,
                        })
                      : setNewTransaction({
                          ...newTransaction,
                          description: e.target.value,
                        })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={
                  editingTransaction ? updateTransaction : addTransaction
                }
              >
                {editingTransaction ? t.updateTransaction : t.addTransaction}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );

  const renderFinanceOverview = () => {
    const savingsGoal = 1000; // Example savings goal
    const savingsProgress =
      ((budget.income - budget.expenses) / savingsGoal) * 100;

    const spendingTrends = [
      { name: "Jan", amount: 500 },
      { name: "Feb", amount: 600 },
      { name: "Mar", amount: 550 },
      { name: "Apr", amount: 700 },
      { name: "May", amount: 650 },
      { name: "Jun", amount: 600 },
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.financeOverview}</CardTitle>
          <CardDescription>{t.financeOverviewDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-semibold">{t.totalIncome}</p>
                <p className="text-2xl font-bold text-green-600">
                  ${budget.income.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="font-semibold">{t.totalExpenses}</p>
                <p className="text-2xl font-bold text-red-600">
                  ${budget.expenses.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="font-semibold">{t.savingsProgress}</p>
                <Progress value={savingsProgress} className="mt-2" />
                <p className="text-sm text-muted-foreground">
                  {savingsProgress.toFixed(1)}% of goal
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t.spendingTrends}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={spendingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t.recurringExpenses}</h3>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>{t.rent}</span>
                  <Badge variant="outline">
                    <Calendar className="mr-1 h-3 w-3" /> {t.dueOn(15)}
                  </Badge>
                </li>
                <li className="flex justify-between items-center">
                  <span>{t.utilities}</span>
                  <Badge variant="outline">
                    <Calendar className="mr-1 h-3 w-3" /> {t.dueOn(20)}
                  </Badge>
                </li>
                <li className="flex justify-between items-center">
                  <span>{t.subscriptions}</span>
                  <Badge variant="outline">
                    <Calendar className="mr-1 h-3 w-3" /> {t.dueOn(5)}
                  </Badge>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t.familyFinanceApp}</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shopping">{t.shopping}</TabsTrigger>
          <TabsTrigger value="budget">{t.budget}</TabsTrigger>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="shopping">{renderShoppingList()}</TabsContent>

            <TabsContent value="budget">{renderBudget()}</TabsContent>

            <TabsContent value="overview">
              {renderFinanceOverview()}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <Toaster />
    </div>
  );
}
