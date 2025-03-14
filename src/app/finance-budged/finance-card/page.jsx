"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  DollarSign,
  ShoppingCart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
} from "recharts";
import { useLanguage } from "@/lib/LanguageContext";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Set the base URL for API requests

const OverviewCard = ({
  title,
  amount,
  icon: Icon,
  trend,
  trendAmount,
  gradientFrom,
  gradientTo,
}) => (
  <motion.div
    className="rounded-lg p-6 shadow-lg overflow-hidden relative"
    style={{
      background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
    }}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-3xl font-bold text-white">{amount}</p>
      </div>
      <div className="bg-white bg-opacity-20 rounded-full p-3">
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
    <div className="mt-4">
      <p className="text-sm text-white flex items-center">
        {trend === "up" ? (
          <TrendingUp className="mr-1 h-4 w-4" />
        ) : (
          <TrendingDown className="mr-1 h-4 w-4" />
        )}
        <span>{trendAmount}</span>
      </p>
    </div>
    <div className="absolute -bottom-6 -right-6 opacity-10">
      <Icon className="h-32 w-32 text-white" />
    </div>
  </motion.div>
);

export default function EnhancedFamilyFinancePage() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []); // Empty dependency array ensures this runs once on mount
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [shoppingList, setShoppingList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
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
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    // alert('we are there')
    try {
      const [shoppingItemsRes, transactionsRes, summaryRes] = await Promise.all(
        [
          axios.get(`${API_URL}/api/finance/shopping-items`),
          axios.get(`${API_URL}/api/finance/transactions`),
          axios.get(`${API_URL}/api/finance/summary`),
        ]
      );
      setShoppingList(shoppingItemsRes.data);
      setTransactions(transactionsRes.data);
      setBudgetSummary(summaryRes.data);
      // window.location.reload();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error fetching data:", error);
      toast.error(t("errorFetchingDataDescription"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddShoppingItem = async () => {
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
      toast.success(t("itemAddedDescription"));
      window.location.reload();
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error adding shopping item:", error);
      toast.error(t("errorAddingItemDescription"));
    }
  };

  const handleUpdateShoppingItem = async () => {
    if (!editingItem) return;
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
      toast.success(t("itemUpdatedDescription"));
      window.location.reload();
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error updating shopping item:", error);
      toast.error(t("errorUpdatingItemDescription"));
    }
  };

  const handleDeleteShoppingItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/finance/shopping-items/${id}`);
      setShoppingList(shoppingList.filter((item) => item._id !== id));
      toast.success(t("itemDeletedDescription"));
      fetchData();
      window.location.reload();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error deleting shopping item:", error);
      toast.error(t("errorDeletingItemDescription"));
    }
  };

  const handleAddTransaction = async () => {
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
      toast.success(t("transactionAddedDescription"));
      window.location.reload();
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error adding transaction:", error);
      toast.error(t("errorAddingTransactionDescription"));
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return;
    try {
      const response = await axios.put(
        `/transactions/${editingTransaction._id}`,
        editingTransaction
      );
      setTransactions(
        transactions.map((t) =>
          t._id === editingTransaction._id ? response.data.transaction : t
        )
      );
      setEditingTransaction(null);
      window.location.reload();
      toast.success(t("transactionUpdatedDescription"));
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error updating transaction:", error);
      toast.error(t("errorUpdatingTransactionDescription"));
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`/transactions/${id}`);
      setTransactions(transactions.filter((t) => t._id !== id));
      toast.success(t("transactionDeletedDescription"));
      window.location.reload();
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error deleting transaction:", error);
      toast.error(t("errorDeletingTransactionDescription"));
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <OverviewCard
          title={t.totalIncome}
          amount={`$${budgetSummary.income.toFixed(2)}`}
          icon={DollarSign}
          trend="up"
          trendAmount="+20% from last month"
          gradientFrom="#4CAF50"
          gradientTo="#45B649"
        />
        <OverviewCard
          title={t.totalExpenses}
          amount={`$${budgetSummary.expenses.toFixed(2)}`}
          icon={ShoppingCart}
          trend="down"
          trendAmount="-5% from last month"
          gradientFrom="#FF5252"
          gradientTo="#FF1744"
        />
        <OverviewCard
          title={t.balance}
          amount={`$${budgetSummary.balance.toFixed(2)}`}
          icon={PieChart}
          trend="up"
          trendAmount="+22% from last month"
          gradientFrom="#2196F3"
          gradientTo="#1E88E5"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t.spendingOverview}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RPieChart>
              <Pie
                data={[
                  { name: t.income, value: budgetSummary.income },
                  { name: t.expenses, value: budgetSummary.expenses },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#4CAF50" />
                <Cell fill="#FF5252" />
              </Pie>
              <Tooltip />
              <Legend />
            </RPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderShoppingList = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.shoppingList}</CardTitle>
        <CardDescription>{t.shoppingListDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.name}</TableHead>
              <TableHead>{t.category}</TableHead>
              <TableHead>{t.priority}</TableHead>
              <TableHead>{t.cost}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shoppingList.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>${item.cost.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteShoppingItem(item._id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
            </div>
            <DialogFooter>
              <Button
                onClick={
                  editingItem ? handleUpdateShoppingItem : handleAddShoppingItem
                }
              >
                {editingItem ? t.updateItem : t.addItem}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );

  const renderTransactions = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.transactions}</CardTitle>
        <CardDescription>{t.transactionsDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.type}</TableHead>
              <TableHead>{t.category}</TableHead>
              <TableHead>{t.amount}</TableHead>
              <TableHead>{t.description}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingTransaction(transaction)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTransaction(transaction._id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                <Input
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
                  editingTransaction
                    ? handleUpdateTransaction
                    : handleAddTransaction
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t.familyFinanceDashboard}</h1>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="shopping">{t.shopping}</TabsTrigger>
          <TabsTrigger value="transactions">{t.transactions}</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="overview">{renderOverview()}</TabsContent>

            <TabsContent value="shopping">{renderShoppingList()}</TabsContent>

            <TabsContent value="transactions">
              {renderTransactions()}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
      <Toaster />
    </div>
  );
}
