'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Toaster, toast } from 'react-hot-toast';

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
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical } from 'lucide-react';
import { useLanguage } from "@/lib/LanguageContext";

const initialTasks = { 'to-do': [], 'in-progress': [], 'done': [] };

const TaskCard = ({ task, index, t, onDelete, onEdit }) => (
  <Draggable draggableId={task.id} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="bg-card p-4 mb-2 rounded-lg shadow"
      >
        <div className="flex justify-between items-center">
          <span className="font-medium">{task.content}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task.id)}>{t.edit}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)}>{t.delete}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2">
          <span className={`text-xs px-2 py-1 rounded ${
            task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {t[task.priority]}
          </span>
        </div>
      </div>
    )}
  </Draggable>
);

const TaskModal = ({ isOpen, onClose, onAddTask, t }) => {
  const [taskContent, setTaskContent] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      content: taskContent,
      priority: taskPriority,
    };
    await onAddTask(newTask);
    setTaskContent('');
    setTaskPriority('medium');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.addNewTask}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-content" className="text-right">{t.taskContent}</Label>
              <Input
                id="task-content"
                value={taskContent}
                onChange={(e) => setTaskContent(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-priority" className="text-right">{t.priority}</Label>
              <Select value={taskPriority} onValueChange={setTaskPriority}>
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
  );
};

export default function TasksPage() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch('https://backendforfamily-production.up.railway.app/api/parent/tast', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      const tasksByStatus = { 'to-do': [], 'in-progress': [], 'done': [] };
      data.forEach((task) => tasksByStatus[task.status].push({
        id: task._id,
        content: task.content,
        priority: task.priority,
      }));
      setTasks(tasksByStatus);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (newTask) => {
    try {
      const response = await fetch('https://backendforfamily-production.up.railway.app/api/parent/tast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...newTask, status: 'to-do' }),
      });
      const savedTask = await response.json();
      setTasks((prev) => ({
        ...prev,
        'to-do': [...prev['to-do'], { id: savedTask._id, ...newTask }],
      }));
      toast.success(t.taskAdded);

    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
 const deleteAllDoneTasks = async () => {
    try {
      await fetch('https://backendforfamily-production.up.railway.app/api/parent/tast/done', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks((prev) => ({ ...prev, done: [] })); // Clear the "done" tasks in the state
      toast.success('All done tasks deleted!');
    } catch (error) {
      console.error("Error deleting all done tasks:", error);
      toast.error('Failed to delete all done tasks');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`https://backendforfamily-production.up.railway.app/api/parent/tast/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks((prev) => {
        const updatedTasks = { ...prev };
        Object.keys(updatedTasks).forEach((status) => {
          updatedTasks[status] = updatedTasks[status].filter((task) => task.id !== taskId);
        });
        return updatedTasks;
      });
      toast.success(t.taskDeleted);

    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const [movedTask] = sourceColumn.splice(source.index, 1);

    movedTask.status = destination.droppableId;
    destColumn.splice(destination.index, 0, movedTask);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });

    try {
      await fetch(`https://backendforfamily-production.up.railway.app/api/parent/tast/${movedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: movedTask.status }),
      });
      toast.success(t.taskUpdated);

    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const calculateProgress = () => {
    const totalTasks = Object.values(tasks).flat().length;
    const completedTasks = tasks['done'].length;
    return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  };

  const filteredTasks = (columnTasks) => {
    if (filter === 'all') return columnTasks;
    return columnTasks.filter((task) => task.priority === filter);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster /> {/* Render Toaster for notifications */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">{t.taskManagement}</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t.addTask}
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.taskProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={calculateProgress()} className="w-full" />
            <p className="mt-2 text-sm text-muted-foreground">{Math.round(calculateProgress())}% {t.completed}</p>
          </CardContent>
        </Card>

        <div className="mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t.filterByPriority} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all}</SelectItem>
              <SelectItem value="high">{t.high}</SelectItem>
              <SelectItem value="medium">{t.medium}</SelectItem>
              <SelectItem value="low">{t.low}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(tasks).map(([columnId, columnTasks]) => (
              <div key={columnId}>
                <h2 className="text-xl font-semibold mb-4">{t[columnId]}</h2>
                <Droppable droppableId={columnId} isDropDisabled={false}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="bg-muted p-4 rounded-lg min-h-[200px]"
                    >
                      {filteredTasks(columnTasks).map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          t={t}
                          onDelete={deleteTask}
                          onEdit={() => {}}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={addTask}
        t={t}
      />
    </div>
  );
}
