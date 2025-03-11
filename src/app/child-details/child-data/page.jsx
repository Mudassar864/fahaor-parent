"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  CheckCircle,
  Trash2,
  Edit,
  Plus,
  PieChart,
  Activity,
  Star,
  Award,
  Loader2,
  Upload,
  Repeat,
  Gift,
} from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast, Toaster } from "react-hot-toast";

import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";

const MotionCard = motion(Card);

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export default function EnhancedChildTaskManager() {
  const { t } = useLanguage();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [children, setChildren] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [predefinedRewards, setPredefinedRewards] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [newChild, setNewChild] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    grade: "",
    profilePicture: null,
  });
  const [newTask, setNewTask] = useState({
    content: "",
    priority: "medium",
    childId: "",
    dueDate: "",
    recurrence: "none",
    forAllChildren: false,
  });
  const [newReward, setNewReward] = useState({
    title: "",
    description: "",
    points: 0,
  });
  const [availablePoints, setAvailablePoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
    fetchPredefinedRewards();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchTasks(selectedChild);
      fetchRewards(selectedChild);
      fetchPoints(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/children`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch children");
      const data = await response.json();
      setChildren(data);
      console.log("Children added:: ", data);
      // alert(data.points)
      setAvailablePoints(data.points);
    } catch (error) {
      console.error("Error fetching children:", error);
      // toast.error(t.errorFetchingChildren)
    } finally {
      setIsLoading(false);
    }
  }, [t]);
  const checkLateTasks = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/child-tasks/check-late-tasks`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!response.ok) throw new Error("Failed to check late tasks");
      const data = await response.json();
      console.log("Late tasks updated:", data);
      // Refresh tasks after updating late status
      if (selectedChild) {
        fetchTasks(selectedChild);
      }
    } catch (error) {
      console.error("Error checking late tasks:", error);
      toast.error(t.errorCheckingLateTasks);
    }
  }, [selectedChild, t]);

  const fetchTasks = useCallback(
    async (childId) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/child-tasks/${childId}?timestamp=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error(t.errorFetchingTasks);
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  const fetchRewards = useCallback(
    async (childId) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/api/rewards/${childId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch rewards");
        const data = await response.json();
        console.log("Points fetched :: f", data.points);
        setRewards(data);
      } catch (error) {
        console.error("Error fetching rewards:", error);
        toast.error(t.errorFetchingRewards);
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  const fetchPredefinedRewards = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/rewards/predefined/list`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch predefined rewards");
      const data = await response.json();
      setPredefinedRewards(data);
    } catch (error) {
      console.error("Error fetching predefined rewards:", error);
      toast.error(t.errorFetchingPredefinedRewards);
    }
  };

  const fetchPoints = async (childId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/rewards/${childId}/points`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch points");

      const data = await response.json();

      // Log the points data for debugging
      console.log("Fetched Points:", data.points);

      // Set the available points state with the fetched points
      setAvailablePoints(data.points);
    } catch (error) {
      // console.error("Error fetching points:", error);
      // toast.error(t.errorFetchingPoints);
    }
  };
  const addChild = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Loop over newChild fields and append to formData, excluding email and password
      for (const key in newChild) {
        // Ensure email and password are not appended
        if (key !== "email" && key !== "password") {
          formData.append(key, newChild[key]);
        }
      }

      const response = await fetch(
        `${API_URL}/api/child-tasks/add-childx`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to add child");
      const addedChild = await response.json();
      setChildren((prevChildren) => [...prevChildren, addedChild]);
      toast.success(t.childAddedSuccess);
      window.location.reload(); // Refresh page after adding child
      setIsChildModalOpen(false);
      setNewChild({ name: "", dob: "", grade: "", profilePicture: null }); // Reset fields without email
    } catch (error) {
      console.error("Error adding child:", error);
      toast.error(t.childAddFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async () => {
    setIsLoading(true);
    try {
      if (!newTask.forAllChildren && !newTask.childId) {
        toast.error(t.selectChildForTask);
        return;
      }

      // Build the task payload including recurrence
      const payload = {
        content: newTask.content,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        recurrence: newTask.recurrence, // Set recurrence like daily, weekly
        forAllChildren: newTask.forAllChildren,
        childIds: newTask.forAllChildren
          ? children.map((child) => child._id)
          : [newTask.childId],
      };

      // Make API request to add the task
      const response = await fetch(
        `${API_URL}/api/child-tasks/add-task`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to add task");

      const addedTask = await response.json();

      // Fetch updated tasks for all children or specific child
      if (newTask.forAllChildren) {
        children.forEach((child) => fetchTasks(child._id));
      } else {
        await fetchTasks(newTask.childId);
      }

      toast.success(t.taskAddedSuccess);

      // Reset task form
      setNewTask({
        content: "",
        priority: "medium",
        childId: "",
        dueDate: "",
        recurrence: "none", // Default to 'none'
        forAllChildren: false,
      });

      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error adding task:", error.message);
      toast.error(t.taskAddFailed);
    } finally {
      setIsLoading(false);
    }
  };
  const completeTask = async (taskId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/child-tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "done" }),
        }
      );
      if (!response.ok) throw new Error("Failed to complete task");

      // Update tasks state immediately
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: "done" } : task
        )
      );

      // Update rewards immediately
      const pointsToAdd = 10;
      setRewards((prevRewards) => {
        if (prevRewards.length === 0) {
          return [
            {
              title: t.cumulativeReward,
              description: t.cumulativeRewardDescription,
              points: pointsToAdd,
              childId: selectedChild,
            },
          ];
        } else {
          return [
            { ...prevRewards[0], points: prevRewards[0].points + pointsToAdd },
            ...prevRewards.slice(1),
          ];
        }
      });

      // const pointsToAdd = 10;
      await updateReward(pointsToAdd);

      toast.success(t.taskCompletedSuccess);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error completing task:", error);
      toast.error(t.taskCompleteFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReward = async (pointsToAdd) => {
    try {
      const currentReward = rewards[0];
      if (!currentReward) {
        // Create a new reward if it doesn't exist
        const newReward = {
          title: t.cumulativeReward,
          description: t.cumulativeRewardDescription,
          points: pointsToAdd,
          childId: selectedChild,
        };
        const response = await fetch(`${API_URL}/api/rewards/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newReward),
        });
        if (!response.ok) throw new Error("Failed to create reward");
      } else {
        // Update existing reward
        const updatedPoints = currentReward.points + pointsToAdd;
        const response = await fetch(
          `${API_URL}/api/rewards/edit/${rewardUpdate._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(rewardUpdate),
          }
        );

        if (!response.ok) throw new Error("Failed to update reward");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
        router.push("/plan/plan-details");
      }
      console.error("Error updating reward:", error);
      toast.error(t.rewardUpdateFailed);
    }
  };
  const deleteTask = async (taskId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/child-tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete task");
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      toast.success(t.taskDeletedSuccess);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(t.taskDeleteFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllCompletedTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/child-tasks/${selectedChild}/delete-completed`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete completed tasks");
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.status !== "done")
      );
      toast.success(t.allCompletedTasksDeletedSuccess);
    } catch (error) {
      console.error("Error deleting completed tasks:", error);
      toast.error(t.allCompletedTasksDeleteFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const redeemReward = async (rewardId, isPredefined = false) => {
    setIsLoading(true);
    try {
      const endpoint = isPredefined
        ? `${API_URL}/api/rewards/predefined/redeem`
        : `${API_URL}/api/rewards/${selectedChild}/redeem`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          rewardId,
          childId: selectedChild,
        }),
      });

      if (!response.ok) throw new Error("Failed to redeem reward");
      const data = await response.json();

      if (isPredefined) {
        setAvailablePoints(
          (prevPoints) => prevPoints - data.reward.pointsRequired
        );
      }

      fetchRewards(selectedChild);
      toast.success(t.rewardRedeemedSuccess);
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast.error(t.rewardRedeemFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomReward = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/rewards/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...newReward,
          childId: selectedChild,
        }),
      });
      if (!response.ok) throw new Error("Failed to add custom reward");
      const addedReward = await response.json();
      setRewards((prevRewards) => [...prevRewards, addedReward]);
      toast.success(t.customRewardAddedSuccess);
      setIsRewardModalOpen(false);
      setNewReward({ title: "", description: "", points: 0 });
    } catch (error) {
      console.error("Error adding custom reward:", error);
      toast.error(t.customRewardAddFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "done"
    ).length;
    return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  };
  const handleSelectChild = (childId) => {
    const selectedChild = children.find((child) => child._id === childId);
    setAvailablePoints(selectedChild?.points || 0);
  };
  // Use useEffect to check for late tasks periodically
  useEffect(() => {
    // const intervalId = setInterval(checkLateTasks, 60000); // Check every minute
    // return () => clearInterval(intervalId);
  }, [checkLateTasks]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewChild({ ...newChild, profilePicture: file });
    }
  };

  const renderChildrenList = () => (
    <motion.div {...fadeInUp}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2" />
            {t.children}
          </CardTitle>
          <CardDescription>{t.childrenDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {children.map((child) => (
                <MotionCard
                  key={child._id}
                  className="hover:shadow-lg transition-shadow duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {child.name}, {child.grade} {t.grade}
                    </CardTitle>
                    <Avatar>
                      <AvatarImage
                        src={child.profilePicture}
                        alt={child.name}
                      />
                      <AvatarFallback>
                        {child?.name?.[0] || "N/A"}
                      </AvatarFallback>
                    </Avatar>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      {/* <div className="text-xs text-muted-foreground">
                        {child.tasks ? child.tasks.length : 0} {t.tasks}
                      </div> */}
                      {/* <Badge variant={child.tasks && child.tasks.length > 0 ? "default" : "secondary"}>
                        {child.tasks && child.tasks.length > 0 ? `${(child.tasks.filter(task => task.status === "done").length / child.tasks.length * 100).toFixed(0)}% ${t.complete}` : t.noTasks}
                      </Badge> */}
                    </div>
                    {/* <Progress value={child.tasks ? (child.tasks.filter(task => task.status === "done").length / child.tasks.length * 100) : 0}
                      className="w-full" /> */}
                    <div className="mt-2 text-sm font-medium">
                      {t.points}: {child.points || 0}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedChild(child._id); // Set the selected child
                        setAvailablePoints(child.points || 0); // Set the available points
                      }}
                    >
                      {t.viewTasks}
                    </Button>
                  </CardFooter>
                </MotionCard>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsChildModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t.addChild}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
  const TaskList = ({ childId }) => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
      const loadTasks = async () => {
        const taskData = await fetchTasks(childId);
        setTasks(taskData);
      };
      loadTasks();
    }, [childId]);

    return (
      <div>
        <h3>Tasks for Child</h3>
        {tasks.map((task) => (
          <div
            key={task._id}
            className={`task ${task.status === "done" ? "completed" : ""}`}
          >
            <h4>{task.content}</h4>
            <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
            <p>Status: {task.status}</p>
            {task.recurrence !== "none" && <p>Recurrence: {task.recurrence}</p>}
            {task.lateDays > 0 && (
              <p className="late-status">
                Late by {task.lateDays} {task.lateDays === 1 ? "day" : "days"}
              </p>
            )}
            {task.status !== "done" && (
              <button onClick={() => handleCompleteTask(task._id)}>
                Mark as Done
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };
  const renderTaskList = () => (
    <motion.div {...fadeInUp}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2" />
            {t.tasksFor}{" "}
            {children.find((child) => child._id === selectedChild)?.name}
          </CardTitle>
          <CardDescription>{t.tasksDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todo" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="todo">{t.todo}</TabsTrigger>
              <TabsTrigger value="completed">{t.completed}</TabsTrigger>
            </TabsList>
            <TabsContent value="todo">
              <AnimatePresence>
                {tasks
                  .filter((task) => task.status === "to-do")
                  .map((task) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <Card className="mb-4">
                        <CardHeader className="flex flex-row items-center">
                          <div className="flex-1">
                            <CardTitle>{task.content}</CardTitle>
                            <CardDescription>
                              {t.priority}: {task.priority}
                              {task.dueDate &&
                                ` | ${t.dueDate}: ${new Date(
                                  task.dueDate
                                ).toLocaleDateString()}`}
                              {task.recurrence !== "none" &&
                                ` | ${t.recurrence}: ${task.recurrence}`}
                              {task.lateDays > 0 &&
                                ` | ${t.late}: ${task.lateDays} ${t.days}`}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </CardHeader>
                        <CardFooter className="flex justify-between">
                          <Button
                            size="sm"
                            onClick={() => completeTask(task._id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />{" "}
                            {t.markAsDone}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTask(task._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> {t.delete}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="completed">
              <AnimatePresence>
                {tasks
                  .filter((task) => task.status === "done")
                  .map((task) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <Card className="mb-4">
                        <CardHeader className="flex flex-row items-center">
                          <div className="flex-1">
                            <CardTitle className="line-through">
                              {task.content}
                            </CardTitle>
                            <CardDescription>
                              {t.priority}: {task.priority}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">{t.completed}</Badge>
                        </CardHeader>
                        <CardFooter className="flex justify-end">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTask(task._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> {t.delete}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={() => setIsTaskModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t.addTask}
          </Button>
          <Button variant="destructive" onClick={deleteAllCompletedTasks}>
            <Trash2 className="mr-2 h-4 w-4" /> {t.deleteAllCompleted}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  const renderRewards = () => (
    <motion.div {...fadeInUp}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2" />
            {t.rewards}
          </CardTitle>
          <CardDescription>{t.rewardsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{t.availablePoints}</h3>
            <div className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-500" />
              <span className="text-xl font-bold">{availablePoints}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">{t.predefinedRewards}</h4>
            {predefinedRewards.map((reward) => {
              // Mapping the reward title to the corresponding translation key
              const rewardTitle = {
                Kinobesuch: "Visittothecinema",
                "Neues Spielzeug": "newtoy",
                "Extra Spielzeit": "extraplayingtime",
                "Besuch im Freizeitpark": "Visittotheamusementpark",
              };

              return (
                <Card key={reward._id}>
                  <CardHeader>
                    {/* Dynamically render the title using translation */}
                    <CardTitle>
                      {t[rewardTitle[reward.title]] || reward.title}
                    </CardTitle>{" "}
                    {/* If no translation key found, fallback to the original title */}
                    <CardDescription>
                      {t[reward.description] || reward.description}
                    </CardDescription>{" "}
                    {/* Similarly for description */}
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">
                      {reward.pointsRequired} {t.points}
                    </Badge>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => redeemReward(reward._id, true)}
                      disabled={availablePoints < reward.pointsRequired}
                    >
                      {availablePoints >= reward.pointsRequired
                        ? t.redeem
                        : t.notEnoughPoints}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          {rewards.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium">{t.customRewards}</h4>
              {rewards.map((reward) => (
                <Card key={reward._id} className="mt-4">
                  <CardHeader>
                    <CardTitle>{reward.title}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">
                      {reward.points} {t.points}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setIsRewardModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t.addCustomReward}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  const renderTaskPriorityChart = () => {
    const priorityData = [
      {
        name: t.high,
        value: tasks.filter((task) => task.priority === "high").length,
      },
      {
        name: t.medium,
        value: tasks.filter((task) => task.priority === "medium").length,
      },
      {
        name: t.low,
        value: tasks.filter((task) => task.priority === "low").length,
      },
    ];

    const COLORS = ["#FF8042", "#FFBB28", "#00C49F"];

    return (
      <motion.div {...fadeInUp}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2" />
              {t.taskPriorityDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {priorityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-4xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t.childTaskManager}
      </motion.h1>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      <motion.div {...fadeInUp}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2" />
              {t.overallProgress}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Progress value={calculateProgress()} className="w-full" />
              </motion.div>
              <p className="text-sm text-muted-foreground text-center">
                {calculateProgress().toFixed(0)}% {t.tasksCompleted}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {renderChildrenList()}
          {selectedChild && renderTaskList()}
        </div>
        <div>
          {selectedChild && renderRewards()}
          {selectedChild && renderTaskPriorityChart()}
        </div>
      </div>

      <Dialog open={isChildModalOpen} onOpenChange={setIsChildModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addNewChild}</DialogTitle>
            <DialogDescription>{t.addNewChildDescription}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addChild();
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="child-name" className="text-right">
                  {t.name}
                </Label>
                <Input
                  id="child-name"
                  value={newChild.name}
                  onChange={(e) =>
                    setNewChild({ ...newChild, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                {/* <Label htmlFor="child-email" className="text-right">{t.email}</Label>
                <Input
                  id="child-email"
                  type="email"
                  value={newChild.email}
                  onChange={(e) => setNewChild({ ...newChild, email: e.target.value })}
                  className="col-span-3"
                /> */}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                {/* <Label htmlFor="child-password" className="text-right">{t.password}</Label> */}
                {/* <Input
                  id="child-password"
                  type="password"
                  value={newChild.password}
                  onChange={(e) => setNewChild({ ...newChild, password: e.target.value })}
                  className="col-span-3"
                /> */}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="child-dob" className="text-right">
                  {t.dateOfBirth}
                </Label>
                <Input
                  id="child-dob"
                  type="date"
                  value={newChild.dob}
                  onChange={(e) =>
                    setNewChild({ ...newChild, dob: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="child-grade" className="text-right">
                  {t.grade}
                </Label>
                <Input
                  id="child-grade"
                  value={newChild.grade}
                  onChange={(e) =>
                    setNewChild({ ...newChild, grade: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="child-profile-picture" className="text-right">
                  {t.profilePicture}
                </Label>
                <div className="col-span-3">
                  <Input
                    id="child-profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t.addChild}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addNewTask}</DialogTitle>
            <DialogDescription>{t.addNewTaskDescription}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTask();
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-content" className="text-right">
                  {t.taskContent}
                </Label>
                <Input
                  id="task-content"
                  value={newTask.content}
                  onChange={(e) =>
                    setNewTask({ ...newTask, content: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-priority" className="text-right">
                  {t.priority}
                </Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, priority: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectPriority} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">{t.high}</SelectItem>
                    <SelectItem value="medium">{t.medium}</SelectItem>
                    <SelectItem value="low">{t.low}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-due-date" className="text-right">
                  {t.dueDate}
                </Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-recurrence" className="text-right">
                  {t.recurrence}
                </Label>
                <Select
                  value={newTask.recurrence}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, recurrence: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t.selectRecurrence} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.none}</SelectItem>
                    <SelectItem value="daily">{t.daily}</SelectItem>
                    <SelectItem value="weekly">{t.weekly}</SelectItem>
                    <SelectItem value="monthly">{t.monthly}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-for-all-children" className="text-right">
                  {t.forAllChildren}
                </Label>
                <div className="col-span-3">
                  <Checkbox
                    id="task-for-all-children"
                    checked={newTask.forAllChildren}
                    onCheckedChange={(checked) =>
                      setNewTask({ ...newTask, forAllChildren: checked })
                    }
                  />
                </div>
              </div>
              {!newTask.forAllChildren && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="task-child" className="text-right">
                    {t.selectChild}
                  </Label>
                  <Select
                    value={newTask.childId}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, childId: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t.selectChild} />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child._id} value={child._id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">{t.addTask}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRewardModalOpen} onOpenChange={setIsRewardModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addCustomReward}</DialogTitle>
            <DialogDescription>
              {t.addCustomRewardDescription}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCustomReward();
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward-title" className="text-right">
                  {t.title}
                </Label>
                <Input
                  id="reward-title"
                  value={newReward.title}
                  onChange={(e) =>
                    setNewReward({ ...newReward, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward-description" className="text-right">
                  {t.description}
                </Label>
                <Textarea
                  id="reward-description"
                  value={newReward.description}
                  onChange={(e) =>
                    setNewReward({ ...newReward, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward-points" className="text-right">
                  {t.points}
                </Label>
                <Input
                  id="reward-points"
                  type="number"
                  value={newReward.points}
                  onChange={(e) =>
                    setNewReward({
                      ...newReward,
                      points: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t.addReward}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Link href={"https://child.fahaor.com/"}>
        <div class="fixed bottom-6 right-6 flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 border-2 border-white">
          <span class="text-base font-semibold">Child Portal</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-arrow-up-right w-5 h-5"
          >
            <path d="M7 7h10v10"></path>
            <path d="M7 17 17 7"></path>
          </svg>
        </div>
      </Link>
      <Toaster />
    </div>
  );
}
