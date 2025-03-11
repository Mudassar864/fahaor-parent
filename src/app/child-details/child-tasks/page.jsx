'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Calendar, CheckCircle, Trash2, Edit, Plus, PieChart, Activity, Star, Award } from 'lucide-react'
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast, Toaster } from "react-hot-toast"

import { useLanguage } from "@/lib/LanguageContext"

const MotionCard = motion(Card)

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

export default function EnhancedChildTaskManager() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const { t } = useLanguage()
  const predefinedRewards = [
    { title: t.newtoy, description: "Extra play time", points: 20 },
    { title: t.Visittothecinema, description: "Cinema outing", points: 50 },
    { title: t.extraplayingtime, description: "New toy", points: 100 },
    { title: t.Visittotheamusementpark, description: "Amusement park visit", points: 200 },
  ];
  
  const [children, setChildren] = useState([])
  const [tasks, setTasks] = useState([])
  const [rewards, setRewards] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [isChildModalOpen, setIsChildModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)
  const [newChild, setNewChild] = useState({ name: "", email: "", password: "", dob: "", grade: "" })
  const [newTask, setNewTask] = useState({ content: "", priority: "medium", child: "" })
  const [rewardUpdate, setRewardUpdate] = useState({ title: "", description: "", points: 0 })

  useEffect(() => {
    fetchChildren()
  }, [])

  useEffect(() => {
    if (selectedChild) {
      fetchTasks(selectedChild)
      fetchRewards(selectedChild)
    }
  }, [selectedChild])

  const fetchChildren = async () => {
    try {
      const response = await fetch(`${API_URL}/api/children`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!response.ok) throw new Error('Failed to fetch children')
      const data = await response.json()
      setChildren(data)
    } catch (error) {
      console.error("Error fetching children:", error)
      toast.error(t.errorFetchingChildren)
    }
  }

  const fetchTasks = async (childId) => {
    alert('we are there')
    try {
      const response = await fetch(
        `${API_URL}/api/child-tasks/${childId}?timestamp=${new Date().getTime()}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error(t.errorFetchingTasks);
    }
  };
  

  const fetchRewards = async (childId) => {
    try {
      const response = await fetch(`${API_URL}/api/rewards/${childId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!response.ok) throw new Error('Failed to fetch rewards')
      const data = await response.json()
      setRewards(data)
    } catch (error) {
      console.error("Error fetching rewards:", error)
      toast.error(t.errorFetchingRewards)
    }
  }

  const addChild = async () => {
    try {
      const response = await fetch(`${API_URL}/api/child-tasks/add-childx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newChild),
      })
      if (!response.ok) throw new Error('Failed to add child')
      const addedChild = await response.json()
      setChildren(prevChildren => [...prevChildren, addedChild])
      toast.success(t.childAddedSuccess)
      setIsChildModalOpen(false)
      setNewChild({ name: "", email: "", password: "", dob: "", grade: "" })
    } catch (error) {
      console.error("Error adding child:", error)
      toast.error(t.childAddFailed)
    }
  }

  const addTask = async () => {
    try {
      const response = await fetch(`${API_URL}/api/child-tasks/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...newTask, childId: selectedChild }),
      });
  
      if (!response.ok) throw new Error('Failed to add task');
  
      const addedTask = await response.json();
      setTasks((prevTasks) => [...prevTasks, addedTask]); // Optimistic Update
      fetchTasks(selectedChild); // Ensure tasks match backend
      toast.success(t.taskAddedSuccess);
      setIsTaskModalOpen(false);
      setNewTask({ content: "", priority: "medium", child: "" });
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error(t.taskAddFailed);
    }
  };
  
  

  const completeTask = async (taskId) => {
    try {
      // Step 1: Mark the task as done
      const response = await fetch(`${API_URL}/api/child-tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "done" }),
      });
  
      if (!response.ok) throw new Error("Failed to complete task");
  
      // Step 2: Update tasks in the state immediately
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: "done" } : task
        )
      );
  
      // Notify user about task completion
      toast.success(t.taskCompletedSuccess);
  
      // Step 3: Add 10 reward points using the reward API
      const rewardResponse = await fetch(`${API_URL}/api/rewards/${selectedChild}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!rewardResponse.ok) throw new Error("Failed to fetch rewards");
  
      const rewards = await rewardResponse.json();
  
      if (rewards.length === 0) {
        // Create a new reward if none exists
        const newReward = {
          title: t.cumulativeReward,
          description: t.cumulativeRewardDescription,
          points: 10,
          childId: selectedChild,
        };
  
        const createResponse = await fetch(`${API_URL}/api/rewards/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newReward),
        });
  
        if (!createResponse.ok) throw new Error("Failed to create reward");
  
        const addedReward = await createResponse.json();
        setRewards([addedReward]); // Update state with the new reward
      } else {
        // Update existing reward
        const rewardToUpdate = rewards[0];
        const updatedPoints = rewardToUpdate.points + 10;
  
        const updateResponse = await fetch(`${API_URL}/api/rewards/${rewardToUpdate._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ points: updatedPoints }),
        });
  
        if (!updateResponse.ok) throw new Error("Failed to update reward");
  
        setRewards((prevRewards) =>
          prevRewards.map((reward) =>
            reward._id === rewardToUpdate._id
              ? { ...reward, points: updatedPoints }
              : reward
          )
        );
      }
  
      toast.success(t.rewardUpdatedSuccess);
    } catch (error) {
      console.error("Error completing task and updating reward:", error);
      toast.error(t.taskCompleteFailed);
    }
  };
  

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/api/child-tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error('Failed to delete task')
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId))
      toast.success(t.taskDeletedSuccess)
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error(t.taskDeleteFailed)
    }
  }

  const deleteAllCompletedTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/child-tasks/${selectedChild}/delete-completed`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!response.ok) throw new Error('Failed to delete completed tasks')
      setTasks(prevTasks => prevTasks.filter(task => task.status !== "done"))
      toast.success(t.allCompletedTasksDeletedSuccess)
    } catch (error) {
      console.error("Error deleting completed tasks:", error)
      toast.error(t.allCompletedTasksDeleteFailed)
    }
  }

  const updateReward = async (pointsToAdd) => {
    try {
      const currentReward = rewards[0]
      if (!currentReward) {
        // Create a new reward if it doesn't exist
        const newReward = {
          title: t.cumulativeReward,
          description: t.cumulativeRewardDescription,
          points: pointsToAdd,
          childId: selectedChild,
        }
        const response = await fetch(`${API_URL}/api/rewards/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newReward),
        })
        if (!response.ok) throw new Error('Failed to create reward')
        const addedReward = await response.json()
        setRewards([addedReward])
      } else {
        // Update existing reward
        const updatedPoints = currentReward.points + pointsToAdd
        const response = await fetch(`${API_URL}/api/rewards/${currentReward._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ points: updatedPoints }),
        })
        if (!response.ok) throw new Error('Failed to update reward')
        setRewards(prevRewards => [
          { ...prevRewards[0], points: updatedPoints },
          ...prevRewards.slice(1)
        ])
      }
    } catch (error) {
      console.error("Error updating reward:", error)
      toast.error(t.rewardUpdateFailed)
    }
  }

  const editReward = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rewards/edit/${rewards[0]._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(rewardUpdate),
      })
      if (!response.ok) throw new Error('Failed to edit reward')
      setRewards(prevRewards => [
        { ...prevRewards[0], ...rewardUpdate },
        ...prevRewards.slice(1)
      ])
      toast.success(t.rewardUpdatedSuccess)
      setIsRewardModalOpen(false)
    } catch (error) {
      console.error("Error updating reward:", error)
      toast.error(t.rewardUpdateFailed)
    }
  }
  const addPredefinedReward = async (reward) => {
    try {
      const response = await fetch(`${API_URL}/api/rewards/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...reward, childId: selectedChild }),
      });
      if (!response.ok) throw new Error("Failed to add reward");
      const addedReward = await response.json();
      setRewards((prevRewards) => [...prevRewards, addedReward]);
      toast.success(t.rewardAddedSuccess);
    } catch (error) {
      console.error("Error adding predefined reward:", error);
      toast.error(t.rewardAddFailed);
    }
  };
  
  const calculateProgress = () => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.status === "done").length
    return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100
  }

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
              {children.map(child => (
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
                      <AvatarFallback>{child.name[0]}</AvatarFallback>
                    </Avatar>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-muted-foreground">
                        {child.tasks ? child.tasks.length : 0} {t.tasks}
                      </div>
                      <Badge variant={child.tasks && child.tasks.length > 0 ? "default" : "secondary"}>
                        {child.tasks && child.tasks.length > 0 ? `${(child.tasks.filter(task => task.status === "done").length / child.tasks.length * 100).toFixed(0)}% ${t.complete}` : t.noTasks}
                      </Badge>
                    </div>
                    <Progress value={child.tasks ? (child.tasks.filter(task => task.status === "done").length / child.tasks.length * 100) : 0} className="w-full" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => setSelectedChild(child._id)}>
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
  )

  const renderTaskList = () => (
    <motion.div {...fadeInUp}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2" />
            {t.tasksFor} {children.find(child => child._id === selectedChild)?.name}
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
                {tasks.filter(task => task.status === "to-do").map(task => (
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
                          <CardDescription>{t.priority}: {task.priority}</CardDescription>
                        </div>
                        <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                          {task.priority}
                        </Badge>
                      </CardHeader>
                      <CardFooter className="flex justify-between">
                        <Button size="sm" onClick={() => completeTask(task._id)}>
                          <CheckCircle className="mr-2 h-4 w-4" /> {t.markAsDone}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTask(task._id)}>
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
                {tasks.filter(task => task.status === "done").map(task => (
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
                          <CardTitle className="line-through">{task.content}</CardTitle>
                          <CardDescription>{t.priority}: {task.priority}</CardDescription>
                        </div>
                        <Badge variant="secondary">{t.completed}</Badge>
                      </CardHeader>
                      <CardFooter className="flex justify-end">
                        <Button size="sm" variant="destructive" onClick={() => deleteTask(task._id)}>
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
  )

  const renderReward = () => (
    <motion.div {...fadeInUp}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2" />
            {t.reward}
          </CardTitle>
          <CardDescription>{t.rewardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {rewards.length > 0 ? (
            rewards.map((reward, index) => (
              <motion.div
                key={index}
                className="space-y-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <h3 className="text-lg font-semibold">{reward.title}</h3>
                <p className="text-sm text-muted-foreground">{reward.description}</p>
                <div className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-yellow-500" />
                  <motion.span
                    className="text-xl font-bold"
                    key={reward.points}
                    initial={{ scale: 1.5, color: "#FFD700" }}
                    animate={{ scale: 1, color: "#000000" }}
                    transition={{ duration: 0.5 }}
                  >
                    {reward.points} {t.points}
                  </motion.span>
                </div>
              </motion.div>
            ))
          ) : (
            <>
              <p className="mb-4">{t.noRewardAvailable}</p>
              <div className="space-y-2">
              {predefinedRewards.map((reward, index) => (
  <div key={index} className="p-4 border rounded-lg shadow-md">
    <h3 className="text-lg font-semibold">{reward.title}</h3>
    <p className="text-sm text-muted-foreground">{reward.description}</p>
    <p className="font-bold">{reward.points} {t.points}</p>
    <Button size="sm" onClick={() => addPredefinedReward(reward)}>
      {t.addReward}
    </Button>
  </div>
))}

              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
  

  const renderTaskPriorityChart = () => {
    const priorityData = [
      { name: t.high, value: tasks.filter(task => task.priority === "high").length },
      { name: t.medium, value: tasks.filter(task => task.priority === "medium").length },
      { name: t.low, value: tasks.filter(task => task.priority === "low").length },
    ]

    const COLORS = ['#FF8042', '#FFBB28', '#00C49F']

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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

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
          {selectedChild && renderReward()}
          {selectedChild && renderTaskPriorityChart()}
        </div>
      </div>

      <Dialog open={isChildModalOpen} onOpenChange={setIsChildModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addNewChild}</DialogTitle>
            <DialogDescription>{t.addNewChildDescription}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addChild(); }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="child-name" className="text-right">{t.name}</Label>
                <Input
                  id="child-name"
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="child-email" className="text-right">{t.email}</Label>
                <Input
                  id="child-email"
                  type="email"
                  value={newChild.email}
                  onChange={(e) => setNewChild({ ...newChild, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="child-password" className="text-right">{t.password}</Label>
                <Input
                  id="child-password"
                  type="password"
                  value={newChild.password}
                  onChange={(e) => setNewChild({ ...newChild, password: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="child-dob" className="text-right">{t.dateOfBirth}</Label>
                <Input
                  id="child-dob"
                  type="date"
                  value={newChild.dob}
                  onChange={(e) => setNewChild({ ...newChild, dob: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="child-grade" className="text-right">{t.grade}</Label>
                <Input
                  id="child-grade"
                  value={newChild.grade}
                  onChange={(e) => setNewChild({ ...newChild, grade: e.target.value })}
                  className="col-span-3"
                />
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
          <form onSubmit={(e) => { e.preventDefault(); addTask(); }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-content" className="text-right">{t.taskContent}</Label>
                <Input
                  id="task-content"
                  value={newTask.content}
                  onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-priority" className="text-right">{t.priority}</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
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
            <DialogTitle>{t.editReward}</DialogTitle>
            <DialogDescription>{t.editRewardDescription}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); editReward(); }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward-title" className="text-right">{t.title}</Label>
                <Input
                  id="reward-title"
                  value={rewardUpdate.title}
                  onChange={(e) => setRewardUpdate({ ...rewardUpdate, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward-description" className="text-right">{t.description}</Label>
                <Textarea
                  id="reward-description"
                  value={rewardUpdate.description}
                  onChange={(e) => setRewardUpdate({ ...rewardUpdate, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward-points" className="text-right">{t.points}</Label>
                <Input
                  id="reward-points"
                  type="number"
                  value={rewardUpdate.points}
                  onChange={(e) => setRewardUpdate({ ...rewardUpdate, points: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t.updateReward}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}