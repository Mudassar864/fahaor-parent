
'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Ensure the path is correct

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { format, addDays, parseISO } from "date-fns"
import { CalendarIcon, Plus, Check, MessageSquare, Edit, Trash2, RotateCcw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Toaster, toast } from 'react-hot-toast'; // Import Toaster and toast

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const translations = {
  en: {
    childTaskManagement: "Child Task Management",
    addChild: "Add Child",
    name: "Name",
    age: "Age",
    add: "Add",
    children: "Children",
    tasks: "Tasks",
    rewards: "Rewards",
    analytics: "Analytics",
    tasksCompletedOverTime: "Tasks Completed Over Time",
    categoryBreakdown: "Category Breakdown",
    priorityDistribution: "Priority Distribution",
    completionRateByCategory: "Completion Rate by Category",
    assignTask: "Assign Task",
    taskTitle: "Task Title",
    description: "Description",
    category: "Category",
    priority: "Priority",
    dueDate: "Due Date",
    recurring: "Recurring",
    dependency: "Dependency",
    assign: "Assign",
    high: "High",
    medium: "Medium",
    low: "Low",
    all: "All",
    completed: "Completed",
    inProgress: "In Progress",
    todo: "To Do",
    progress: "Progress",
    filterByCategory: "Filter by Category",
    filterByPriority: "Filter by Priority",
    markAsCompleted: "Mark as Completed",
    taskOverview: "Task Overview",
    taskCompletion: "Task Completion",
    taskDistribution: "Task Distribution",
    addNewTask: "Add New Task",
    editTask: "Edit Task",
    delete: "Delete",
    comments: "Comments",
    addComment: "Add Comment",
    saveChanges: "Save Changes",
    actions: "Actions",
    viewTasks: "View Tasks",
    status: "Status",
    selectCategory: "Select Category",
    selectPriority: "Select Priority",
    selectDependency: "Select Dependency",
    pickADate: "Pick a date",
    addReward: "Add Reward",
    rewardName: "Reward Name",
    rewardPoints: "Points Required",
    availableRewards: "Available Rewards",
    claimReward: "Claim Reward",
    earnedPoints: "Earned Points",
    sortBy: "Sort By",
    dateAdded: "Date Added",
    dragAndDropTasks: "Drag and drop tasks to change status",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    none: "None",
    taskCategories: {
      homework: "Homework",
      chores: "Chores",
      exercise: "Exercise",
      reading: "Reading",
      other: "Other"
    }
  }
}

export default function AdvancedChildTaskManagementPage() {
  const [language, setLanguage] = useState('en')
  const [children, setChildren] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [taskComments, setTaskComments] = useState({})
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isAddingReward, setIsAddingReward] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    dueDate: new Date(),
    recurring: 'none',
    dependency: null,
  })
  const [newReward, setNewReward] = useState({ name: '', points: 0 })
  const [rewards, setRewards] = useState([])

  const t = translations[language]

  useEffect(() => {
    const savedChildren = localStorage.getItem('children')
    const savedTasks = localStorage.getItem('tasks')
    const savedTaskComments = localStorage.getItem('taskComments')
    const savedRewards = localStorage.getItem('rewards')

    if (savedChildren) setChildren(JSON.parse(savedChildren))
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedTaskComments) setTaskComments(JSON.parse(savedTaskComments))
    if (savedRewards) setRewards(JSON.parse(savedRewards))
  }, [fetchChildren])

  useEffect(() => {
    localStorage.setItem('children', JSON.stringify(children))
    localStorage.setItem('tasks', JSON.stringify(tasks))
    localStorage.setItem('taskComments', JSON.stringify(taskComments))
    localStorage.setItem('rewards', JSON.stringify(rewards))
  }, [children, tasks, taskComments, rewards])

  const addChild = (name, age) => {
    const newChild = { id: Date.now(), name, age, points: 0 }
    setChildren([...children, newChild])
    toast({
      title: "Child Added",
      description: "New child has been successfully added.",
    })
  }

  const addTask = () => {
    const task = {
      ...newTask,
      id: Date.now(),
      status: 'todo',
      assignedTo: selectedChild,
      dateAdded: new Date(),
      completionHistory: [],
    }
    setTasks([...tasks, task])
    setNewTask({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      dueDate: new Date(),
      recurring: 'none',
      dependency: null,
    })
    setIsAddingTask(false)
    toast({
      title: "Task Added",
      description: "New task has been successfully added.",
    })
  }

  const editTask = (taskId, updatedTask) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, ...updatedTask } : task))
    toast({
      title: "Task Updated",
      description: "Task has been successfully updated.",
    })
  }

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    toast({
      title: "Task Deleted",
      description: "Task has been successfully deleted.",
    })
  }

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, status: newStatus }
        if (newStatus === 'completed') {
          updatedTask.completionHistory = [...(task.completionHistory || []), new Date()]
          const child = children.find(c => c.id === task.assignedTo)
          if (child) {
            updateChildPoints(child.id, child.points + 10)
          }
        }
        return updatedTask
      }
      return task
    }))
  }

  const addComment = (taskId, comment) => {
    setTaskComments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), { text: comment, date: new Date() }]
    }))
  }

  const addReward = () => {
    const reward = { ...newReward, id: Date.now() }
    setRewards([...rewards, reward])
    setNewReward({ name: '', points: 0 })
    setIsAddingReward(false)
    toast({
      title: "Reward Added",
      description: "New reward has been successfully added.",
    })
  }

  const claimReward = (childId, rewardId) => {
    const child = children.find(c => c.id === childId)
    const reward = rewards.find(r => r.id === rewardId)
    if (child && reward && child.points >= reward.points) {
      updateChildPoints(childId, child.points - reward.points)
      toast({
        title: "Reward Claimed",
        description: `${child.name} has successfully claimed the reward: ${reward.name}`,
      })
    }
  }

  const updateChildPoints = (childId, newPoints) => {
    setChildren(children.map(child => child.id === childId ? { ...child, points: newPoints } : child))
  }

  const calculateProgress = (childId) => {
    const childTasks = tasks.filter(task => task.assignedTo === childId)
    const completedTasks = childTasks.filter(task => task.status === 'completed').length
    return childTasks.length === 0 ? 0 : (completedTasks / childTasks.length) * 100
  }

  const filteredAndSortedTasks = () => {
    let filteredTasks = tasks.filter(task => task.assignedTo === selectedChild)
    if (categoryFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === categoryFilter)
    }
    if (priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter)
    }
    return filteredTasks.sort((a, b) => {
      if (sortBy === 'dateAdded') {
        return new Date(b.dateAdded) - new Date(a.dateAdded)
      } else if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      return 0
    })
  }

  const getTaskDistributionData = (childId) => {
    const childTasks = tasks.filter(task => task.assignedTo === childId)
    const distribution = Object.keys(t.taskCategories).reduce((acc, category) => {
      acc[category] = childTasks.filter(t => t.category === category).length
      return acc
    }, {})
    return Object.entries(distribution).map(([key, value]) => ({
      name: t.taskCategories[key],
      value
    }))
  }

  const getTaskCompletionData = (childId) => {
    const childTasks = tasks.filter(task => task.assignedTo === childId)
    return [
      { name: t.completed, value: childTasks.filter(t => t.status === 'completed').length },
      { name: t.inProgress, value: childTasks.filter(t => t.status === 'inProgress').length },
      { name: t.todo, value: childTasks.filter(t => t.status === 'todo').length },
    ]
  }

  const getTasksCompletedOverTimeData = (childId) => {
    const childTasks = tasks.filter(task => task.assignedTo === childId)
    const completionDates = childTasks.flatMap(task => task.completionHistory || [])
    const sortedDates = completionDates.sort((a, b) => new Date(a) - new Date(b))
    
    let cumulativeCount = 0
    return sortedDates.map(date => {
      cumulativeCount++
      return {
        date: format(new Date(date), 'yyyy-MM-dd'),
        count: cumulativeCount,
      }
    })
  }

  const getCompletionRateByCategoryData = (childId) => {
    const childTasks = tasks.filter(task => task.assignedTo === childId)
    return Object.keys(t.taskCategories).map(category => {
      const categoryTasks = childTasks.filter(task => task.category === category)
      const completedTasks = categoryTasks.filter(task => task.status === 'completed').length
      const completionRate = categoryTasks.length > 0 ? (completedTasks / categoryTasks.length) * 100 : 0
      return {
        category: t.taskCategories[category],
        completionRate: Math.round(completionRate),
      }
    })
  }

  const onDragEnd = (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    const taskId = parseInt(draggableId)

    if (source.droppableId !== destination.droppableId) {
      updateTaskStatus(taskId, destination.droppableId)
    }
  }

  const handleRecurringTask = (task) => {
    if (task.recurring !== 'none' && task.status === 'completed') {
      let newDueDate
      switch (task.recurring) {
        case 'daily':
          newDueDate = addDays(parseISO(task.dueDate.toString()), 1)
          break
        case 'weekly':
          newDueDate = addDays(parseISO(task.dueDate.toString()), 7)
          break
        case 'monthly':
          newDueDate = addDays(parseISO(task.dueDate.toString()), 30)
          break
        default:
          return
      }
      
      const newTask = {
        ...task,
        id: Date.now(),
        status: 'todo',
        dueDate: newDueDate,
        completionHistory: [],
      }
      setTasks([...tasks, newTask])
    }
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">{t.childTaskManagement}</h1>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <Tabs defaultValue="children" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="children">{t.children}</TabsTrigger>
          <TabsTrigger value="tasks">{t.tasks}</TabsTrigger>
          <TabsTrigger value="rewards">{t.rewards}</TabsTrigger>
          <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
        </TabsList>

        <TabsContent value="children" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.addChild}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const name = e.target.name.value
                const age = parseInt(e.target.age.value)
                addChild(name, age)
                e.target.reset()
              }} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.name}</Label>
                    <Input id="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">{t.age}</Label>
                    <Input id="age" type="number" required min="1" max="18" />
                  </div>
                </div>
                <Button type="submit">{t.add}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.children}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.name}</TableHead>
                      <TableHead>{t.age}</TableHead>
                      <TableHead>{t.progress}</TableHead>
                      <TableHead>{t.earnedPoints}</TableHead>
                      <TableHead>{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {children.map((child) => (
                      <TableRow key={child.id}>
                        <TableCell className="font-medium">{child.name}</TableCell>
                        <TableCell>{child.age}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={calculateProgress(child.id)} className="w-[100px]" />
                            <span>{Math.round(calculateProgress(child.id))}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{child.points}</TableCell>
                        <TableCell>
                          <Button variant="outline" onClick={() => setSelectedChild(child.id)}>
                            {t.viewTasks}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.taskOverview}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <Select value={selectedChild?.toString()} onValueChange={(value) => setSelectedChild(parseInt(value))}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder={t.selectChild} />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id.toString()}>{child.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder={t.filterByCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      {Object.entries(t.taskCategories).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder={t.filterByPriority} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="high">{t.high}</SelectItem>
                      <SelectItem value="medium">{t.medium}</SelectItem>
                      <SelectItem value="low">{t.low}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder={t.sortBy} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dateAdded">{t.dateAdded}</SelectItem>
                      <SelectItem value="dueDate">{t.dueDate}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedChild && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>{t.taskCompletion}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={getTaskCompletionData(selectedChild)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {getTaskCompletionData(selectedChild).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>{t.taskDistribution}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={getTaskDistributionData(selectedChild)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#8884d8">
                                {getTaskDistributionData(selectedChild).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{t.tasks}</CardTitle>
                          <Button onClick={() => setIsAddingTask(true)}>
                            <Plus className="mr-2 h-4 w-4" /> {t.addNewTask}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <DragDropContext onDragEnd={onDragEnd}>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['todo', 'inProgress', 'completed'].map((status) => (
                              <Droppable key={status} droppableId={status}>
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef} className="bg-secondary p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">{t[status]}</h3>
                                    {filteredAndSortedTasks()
                                      .filter(task => task.status === status)
                                      .map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className="mb-2"
                                            >
                                              <Card>
                                                <CardContent className="p-4">
                                                  <h4 className="font-semibold">{task.title}</h4>
                                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                                  <div className="flex justify-between items-center mt-2">
                                                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                                                      {t[task.priority]}
                                                    </Badge>
                                                    <span className="text-sm">{format(new Date(task.dueDate), 'PPP')}</span>
                                                  </div>
                                                  <div className="flex justify-between items-center mt-2">
                                                    <Badge variant="outline">{t.taskCategories[task.category]}</Badge>
                                                    {task.recurring !== 'none' && (
                                                      <Badge variant="outline">
                                                        <RotateCcw className="mr-1 h-3 w-3" />
                                                        {t[task.recurring]}
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <div className="flex justify-end space-x-2 mt-2">
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                      editTask(task.id, { ...task, status: status === 'completed' ? 'todo' : 'completed' })
                                                      handleRecurringTask(task)
                                                    }}>
                                                      {status === 'completed' ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Dialog>
                                                      <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                          <MessageSquare className="h-4 w-4" />
                                                        </Button>
                                                      </DialogTrigger>
                                                      <DialogContent>
                                                        <DialogHeader>
                                                          <DialogTitle>{t.comments}</DialogTitle>
                                                        </DialogHeader>
                                                        <ScrollArea className="h-[200px] w-full">
                                                          {(taskComments[task.id] || []).map((comment, index) => (
                                                            <div key={index} className="mb-4">
                                                              <div className="flex items-center space-x-2">
                                                                <Avatar>
                                                                  <AvatarFallback>
                                                                    {children.find(c => c.id === selectedChild)?.name[0]}
                                                                  </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                  <p className="text-sm font-medium">{children.find(c => c.id === selectedChild)?.name}</p>
                                                                  <p className="text-xs text-muted-foreground">{format(new Date(comment.date), 'PPp')}</p>
                                                                </div>
                                                              </div>
                                                              <p className="mt-1 text-sm">{comment.text}</p>
                                                              {index < (taskComments[task.id] || []).length - 1 && <Separator className="my-2" />}
                                                            </div>
                                                          ))}
                                                        </ScrollArea>
                                                        <form onSubmit={(e) => {
                                                          e.preventDefault()
                                                          const comment = e.target.comment.value
                                                          addComment(task.id, comment)
                                                          e.target.reset()
                                                        }} className="mt-4">
                                                          <Textarea name="comment" placeholder={t.addComment} required />
                                                          <DialogFooter>
                                                            <Button type="submit" className="mt-2">{t.addComment}</Button>
                                                          </DialogFooter>
                                                        </form>
                                                      </DialogContent>
                                                    </Dialog>
                                                    <Dialog>
                                                      <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                          <Edit className="h-4 w-4" />
                                                        </Button>
                                                      </DialogTrigger>
                                                      <DialogContent>
                                                        <DialogHeader>
                                                          <DialogTitle>{t.editTask}</DialogTitle>
                                                        </DialogHeader>
                                                        <form onSubmit={(e) => {
                                                          e.preventDefault()
                                                          const updatedTask = {
                                                            title: e.target.title.value,
                                                            description: e.target.description.value,
                                                            category: e.target.category.value,
                                                            priority: e.target.priority.value,
                                                            dueDate: new Date(e.target.dueDate.value),
                                                            recurring: e.target.recurring.value,
                                                            dependency: e.target.dependency.value || null,
                                                          }
                                                          editTask(task.id, updatedTask)
                                                        }} className="space-y-4">
                                                          <div className="space-y-2">
                                                            <Label htmlFor="title">{t.taskTitle}</Label>
                                                            <Input id="title" defaultValue={task.title} required />
                                                          </div>
                                                          <div className="space-y-2">
                                                            <Label htmlFor="description">{t.description}</Label>
                                                            <Textarea id="description" defaultValue={task.description} />
                                                          </div>
                                                          <div className="space-y-2">
                                                            <Label htmlFor="category">{t.category}</Label>
                                                            <Select name="category" defaultValue={task.category}>
                                                              <SelectTrigger>
                                                                <SelectValue placeholder={t.selectCategory} />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                {Object.entries(t.taskCategories).map(([key, value]) => (
                                                                  <SelectItem key={key} value={key}>{value}</SelectItem>
                                                                ))}
                                                              </SelectContent>
                                                            </Select>
                                                          </div>
                                                          <div className="space-y-2">
                                                            <Label htmlFor="priority">{t.priority}</Label>
                                                            <Select name="priority" defaultValue={task.priority}>
                                                              <SelectTrigger>
                                                                <SelectValue placeholder={t.selectPriority} />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                <SelectItem value="high">{t.high}</SelectItem>
                                                                <SelectItem value="medium">{t.medium}</SelectItem>
                                                                <SelectItem value="low">{t.low}</SelectItem>
                                                              </SelectContent>
                                                            </Select>
                                                          </div>
                                                          <div className="space-y-2">
                                                            <Label htmlFor="dueDate">{t.dueDate}</Label>
                                                            <Input
                                                              id="dueDate"
                                                              type="date"
                                                              defaultValue={format(new Date(task.dueDate), 'yyyy-MM-dd')}
                                                              required
                                                            />
                                                          </div>
                                                          <div className="space-y-2">
                                                            <Label htmlFor="recurring">{t.recurring}</Label>
                                                            <Select name="recurring" defaultValue={task.recurring}>
                                                              <SelectTrigger>
                                                                <SelectValue placeholder={t.recurring} />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                <SelectItem value="none">{t.none}</SelectItem>
                                                                <SelectItem value="daily">{t.daily}</SelectItem>
                                                                <SelectItem value="weekly">{t.weekly}</SelectItem>
                                                                <SelectItem value="monthly">{t.monthly}</SelectItem>
                                                              </SelectContent>
                                                            </Select>
                                                          </div>
                                                          <div className="space-y-2">
                                                            <Label htmlFor="dependency">{t.dependency}</Label>
                                                            <Select name="dependency" defaultValue={task.dependency}>
                                                              <SelectTrigger>
                                                                <SelectValue placeholder={t.selectDependency} />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                <SelectItem value="">{t.none}</SelectItem>
                                                                {tasks
                                                                  .filter(t => t.id !== task.id && t.assignedTo === selectedChild)
                                                                  .map(t => (
                                                                    <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                                                                  ))
                                                                }
                                                              </SelectContent>
                                                            </Select>
                                                          </div>
                                                          <DialogFooter>
                                                            <Button type="submit">{t.saveChanges}</Button>
                                                          </DialogFooter>
                                                        </form>
                                                      </DialogContent>
                                                    </Dialog>
                                                    <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            ))}
                          </div>
                        </DragDropContext>
                        <p className="text-sm text-muted-foreground mt-4">{t.dragAndDropTasks}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.addReward}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                addReward()
              }} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rewardName">{t.rewardName}</Label>
                    <Input
                      id="rewardName"
                      value={newReward.name}
                      onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rewardPoints">{t.rewardPoints}</Label>
                    <Input
                      id="rewardPoints"
                      type="number"
                      value={newReward.points}
                      onChange={(e) => setNewReward({ ...newReward, points: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit">{t.add}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.availableRewards}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.rewardName}</TableHead>
                      <TableHead>{t.rewardPoints}</TableHead>
                      <TableHead>{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell className="font-medium">{reward.name}</TableCell>
                        <TableCell>{reward.points}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            onClick={() => claimReward(selectedChild, reward.id)}
                            disabled={!selectedChild || children.find(c => c.id === selectedChild)?.points < reward.points}
                          >
                            {t.claimReward}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.tasksCompletedOverTime}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getTasksCompletedOverTimeData(selectedChild)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.categoryBreakdown}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getTaskDistributionData(selectedChild)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getTaskDistributionData(selectedChild).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.priorityDistribution}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={['high', 'medium', 'low'].map(priority => ({
                    priority: t[priority],
                    count: tasks.filter(task => task.assignedTo === selectedChild && task.priority === priority).length
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.completionRateByCategory}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCompletionRateByCategoryData(selectedChild)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completionRate" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addNewTask}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            addTask()
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t.taskTitle}</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t.category}</Label>
              <Select
                value={newTask.category}
                onValueChange={(value) => setNewTask({ ...newTask, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.taskCategories).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">{t.priority}</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectPriority} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t.high}</SelectItem>
                  <SelectItem value="medium">{t.medium}</SelectItem>
                  <SelectItem value="low">{t.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">{t.dueDate}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTask.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.dueDate ? format(newTask.dueDate, "PPP") : <span>{t.pickADate}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTask.dueDate}
                    onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring">{t.recurring}</Label>
              <Select
                value={newTask.recurring}
                onValueChange={(value) => setNewTask({ ...newTask, recurring: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.recurring} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.none}</SelectItem>
                  <SelectItem value="daily">{t.daily}</SelectItem>
                  <SelectItem value="weekly">{t.weekly}</SelectItem>
                  <SelectItem value="monthly">{t.monthly}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dependency">{t.dependency}</Label>
              <Select
                value={newTask.dependency}
                onValueChange={(value) => setNewTask({ ...newTask, dependency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectDependency} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t.none}</SelectItem>
                  {tasks
                    .filter(task => task.assignedTo === selectedChild)
                    .map(task => (
                      <SelectItem key={task.id} value={task.id.toString()}>{task.title}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{t.addNewTask}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}