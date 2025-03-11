'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from "@/lib/LanguageContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast, Toaster } from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { CheckCircle2, Clock, Sun, Moon, Trash2, Award, Star, RefreshCw, Users } from 'lucide-react'

// Example data (remove in production)
const exampleChildren = [
  { _id: '1', name: "Emma", avatar: "https://i.pravatar.cc/150?img=44", points: 120 },
  { _id: '2', name: "Liam", avatar: "https://i.pravatar.cc/150?img=61", points: 95 },
  { _id: '3', name: "Olivia", avatar: "https://i.pravatar.cc/150?img=47", points: 150 },
]

const exampleTasks = {
  '1': [
    { _id: 'a1', content: 'Brush teeth', status: 'pending', frequency: 'daily', period: 'morning', icon: '🦷' },
    { _id: 'a2', content: 'Make bed', status: 'done', frequency: 'daily', period: 'morning', icon: '🛏️' },
    { _id: 'a3', content: 'Read a book', status: 'pending', frequency: 'daily', period: 'evening', icon: '📚' },
  ],
  '2': [
    { _id: 'b1', content: '5 minute reset', status: 'pending', frequency: 'daily', period: 'morning', icon: '⏰' },
    { _id: 'b2', content: 'Practice piano', status: 'pending', frequency: 'daily', period: 'evening', icon: '🎹' },
    { _id: 'b3', content: 'Water plants', status: 'done', frequency: 'weekly', period: 'any', icon: '🪴' },
  ],
  '3': [
    { _id: 'c1', content: 'Sweep bedroom', status: 'pending', frequency: 'weekly', period: 'any', icon: '🧹' },
    { _id: 'c2', content: 'Homework', status: 'pending', frequency: 'daily', period: 'evening', icon: '📝' },
    { _id: 'c3', content: 'Feed pet', status: 'done', frequency: 'daily', period: 'morning', icon: '🐾' },
  ],
}

const FamilyTaskDashboard = () => {
  const { t } = useLanguage()
  const [children, setChildren] = useState(exampleChildren)
  const [tasks, setTasks] = useState(exampleTasks)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    // In production, fetch children and tasks from API here
    // fetchChildrenAndTasks()
  }, [])

  const fetchChildrenAndTasks = async () => {
    setLoading(true)
    try {
      const childrenResponse = await fetch(`${API_URL}/api/parent/children`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('TokenParent')}`
        }
      })
      if (!childrenResponse.ok) throw new Error('Failed to fetch children')
      const childrenData = await childrenResponse.json()
      setChildren(childrenData)

      const tasksPromises = childrenData.map(child =>
        fetch(`${API_URL}/api/parent/child/${child._id}/tasks`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('TokenParent')}`
          }
        }).then(res => res.json())
      )
      const tasksData = await Promise.all(tasksPromises)
      const tasksObject = childrenData.reduce((acc, child, index) => {
        acc[child._id] = tasksData[index]
        return acc
      }, {})
      setTasks(tasksObject)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(t.errorFetchingData)
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (childId, taskId) => {
    try {
      const response = await fetch(`${API_URL}/api/parent/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('TokenParent')}`
        }
      })
      if (!response.ok) throw new Error('Failed to complete task')
      const updatedTask = await response.json()
      setTasks(prevTasks => ({
        ...prevTasks,
        [childId]: prevTasks[childId].map(task => task._id === taskId ? updatedTask : task)
      }))
      triggerCompletionEffects()
      toast.success(t.taskCompleted)
    } catch (error) {
      console.error('Error completing task:', error)
      toast.error(t.errorCompletingTask)
    }
  }

  const triggerCompletionEffects = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
    const audio = new Audio('/success.mp3')
    audio.play()
  }

  const getCompletedTasksCount = (childId) => tasks[childId].filter(task => task.status === 'done').length

  const filterTasks = (childId, tab) => {
    switch(tab) {
      case 'morning': return tasks[childId].filter(task => task.period === 'morning')
      case 'evening': return tasks[childId].filter(task => task.period === 'evening')
      case 'weekly': return tasks[childId].filter(task => task.frequency === 'weekly')
      default: return tasks[childId]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
            {t.familyTaskDashboard}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {children.map((child, index) => (
            <motion.div
              key={child._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 border-2 border-purple-500">
                      <AvatarImage src={child.avatar} alt={child.name} />
                      <AvatarFallback>{child.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{child.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary" className="mt-1">
                          <Star className="w-4 h-4 mr-1 inline-block text-yellow-500" />
                          {child.points} {t.points}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={(getCompletedTasksCount(child._id) / tasks[child._id].length) * 100} 
                    className="mb-4"
                  />
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {getCompletedTasksCount(child._id)} {t.of} {tasks[child._id].length} {t.tasksCompleted}
                  </p>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                      <TabsTrigger value="all" onClick={() => setActiveTab('all')}>{t.all}</TabsTrigger>
                      <TabsTrigger value="morning" onClick={() => setActiveTab('morning')}>{t.morning}</TabsTrigger>
                      <TabsTrigger value="evening" onClick={() => setActiveTab('evening')}>{t.evening}</TabsTrigger>
                      <TabsTrigger value="weekly" onClick={() => setActiveTab('weekly')}>{t.weekly}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                      <AnimatePresence>
                        {filterTasks(child._id, activeTab).map((task, taskIndex) => (
                          <TaskCard 
                            key={task._id} 
                            task={task} 
                            completeTask={() => completeTask(child._id, task._id)}
                            index={taskIndex}
                            t={t}
                          />
                        ))}
                      </AnimatePresence>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <Button
            onClick={fetchChildrenAndTasks}
            variant="outline"
            className="bg-white dark:bg-gray-800"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t.refresh}
          </Button>
        </motion.div>
      </div>
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

const TaskCard = ({ task, completeTask, index, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        task.status === 'done' ? 'bg-green-50 dark:bg-green-900/20' : 'hover:shadow-lg'
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center space-x-2">
              <span className="text-2xl">{task.icon}</span>
              <span>{task.content}</span>
            </span>
            {task.frequency === 'daily' && (
              task.period === 'morning' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-500" />
              )
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {t[task.frequency]}
            </Badge>
            {task.status === 'done' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-green-600 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {t.completed}
              </motion.div>
            ) : (
              <Button
                onClick={completeTask}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs"
              >
                {t.completeTask}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default FamilyTaskDashboard