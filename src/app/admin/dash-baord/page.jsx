'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, UserPlus, Settings, LogOut, Edit, Trash2, Loader2, CreditCard, Clock, Shield, Search, Download, Filter, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const API_BASE_URL = 'https://api.fahaor.com/api/admin/routes'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    recentTransactions: [],
    userGrowthData: [],
    subscriptionData: []
  })
  const [userDetails, setUserDetails] = useState(null)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'parent',
    subscriptionPlan: 'free',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: '',
    occupation: '',
    emergencyContact: {
      name: '',
      phone: '',
    },
    socialMediaLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    },
  })

  useEffect(() => {
    fetchUsers()
    fetchAnalytics()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_BASE_URL}/users`)
      setUsers(response.data)
      setIsLoading(false)
    } catch (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics`)
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`)
      setUserDetails(response.data)
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, newUser)
      setUsers([...users, response.data])
      setIsAddUserDialogOpen(false)
      setNewUser({
        username: '',
        email: '',
        fullName: '',
        password: '',
        role: 'parent',
        subscriptionPlan: 'free',
        phoneNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        nationality: '',
        occupation: '',
        emergencyContact: {
          name: '',
          phone: '',
        },
        socialMediaLinks: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
        },
      })
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

const handleUpdateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, {
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      profilePicture: userData.profilePicture,
      subscriptionPlan: userData.subscriptionPlan, // New
      subscriptionStatus: userData.subscriptionStatus, // New
      subscriptionExpiry: userData.subscriptionExpiry, // New
    });

    setUsers(users.map(user => user._id === userId ? response.data : user));
    setIsEditUserDialogOpen(false);
  } catch (error) {
    console.error('Error updating user:', error);
  }
};


  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`)
      setUsers(users.filter(user => user._id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && user.subscriptionPlan === filterStatus;
  });

  const renderAnalyticsDashboard = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.activeUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Premium Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.premiumUsers}</div>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.userGrowthData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.subscriptionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {analytics.subscriptionData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28'][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )

  const renderUserManagement = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="free">Free Plan</SelectItem>
              <SelectItem value="premium">Premium Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback>{user.fullName?.[0] || 'N/A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.subscriptionPlan === 'premium' ? 'default' : 'secondary'}>
                    {user.subscriptionPlan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => {
                    setSelectedUser(user)
                    setIsEditUserDialogOpen(true)
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => handleDeleteUser(user._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )

  const renderAddUserDialog = () => (
    <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
      <DialogContent className="max-w-lg w-full mx-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleAddUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                <Select
                  value={newUser.subscriptionPlan}
                  onValueChange={(value) => setNewUser({ ...newUser, subscriptionPlan: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add User</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )

  const renderEditUserDialog = () => (
    <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
      <DialogContent className="max-w-lg w-full mx-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        {selectedUser && (
          <div className="overflow-y-auto max-h-[70vh]">
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateUser(selectedUser._id, selectedUser)
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={selectedUser.username}
                      onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-fullName">Full Name</Label>
                  <Input
                    id="edit-fullName"
                    value={selectedUser.fullName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-subscriptionPlan">Subscription Plan</Label>
                <Select
  value={selectedUser.subscriptionPlan}
  onValueChange={(value) => setSelectedUser({ ...selectedUser, subscriptionPlan: value })}
>
  <SelectTrigger>
    <SelectValue placeholder="Select plan" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="free">Free</SelectItem>
    <SelectItem value="premium">Premium</SelectItem>
  </SelectContent>
</Select>

<Select
  value={selectedUser.subscriptionStatus}
  onValueChange={(value) => setSelectedUser({ ...selectedUser, subscriptionStatus: value })}
>
  <SelectTrigger>
    <SelectValue placeholder="Subscription Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
    <SelectItem value="cancelled">Cancelled</SelectItem>
  </SelectContent>
</Select>

<div>
  <Label htmlFor="subscriptionExpiry">Subscription Expiry</Label>
  <Input
    id="subscriptionExpiry"
    type="date"
    value={selectedUser.subscriptionExpiry}
    onChange={(e) => setSelectedUser({ ...selectedUser, subscriptionExpiry: e.target.value })}
  />
</div>

                </div>
                <div>
                  <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                  <Input
                    id="edit-phoneNumber"
                    value={selectedUser.phoneNumber}
                    onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address-street"
                    placeholder="Street"
                    value={selectedUser.address?.street || ''}
                    onChange={(e) => setSelectedUser({ 
                      ...selectedUser, 
                      address: { ...selectedUser.address, street: e.target.value } 
                    })}
                  />
                  <Input
                    id="edit-address-city"
                    placeholder="City"
                    value={selectedUser.address?.city || ''}
                    onChange={(e) => setSelectedUser({ 
                      ...selectedUser, 
                      address: { ...selectedUser.address, city: e.target.value } 
                    })}
                  />
                  <Input
                    id="edit-address-state"
                    placeholder="State"
                    value={selectedUser.address?.state || ''}
                    onChange={(e) => setSelectedUser({ 
                      ...selectedUser, 
                      address: { ...selectedUser.address, state: e.target.value } 
                    })}
                  />
                  <Input
                    id="edit-address-zipCode"
                    placeholder="Zip Code"
                    value={selectedUser.address?.zipCode || ''}
                    onChange={(e) => setSelectedUser({ 
                      ...selectedUser, 
                      address: { ...selectedUser.address, zipCode: e.target.value } 
                    })}
                  />
                  <Input
                    id="edit-address-country"
                    placeholder="Country"
                    value={selectedUser.address?.country || ''}
                    onChange={(e) => setSelectedUser({ 
                      ...selectedUser, 
                      address: { ...selectedUser.address, country: e.target.value } 
                    })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  const renderUserDetails = () => (
    <div className="space-y-6">
      {userDetails && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userDetails.profilePicture} />
                    <AvatarFallback>{userDetails.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{userDetails.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{userDetails.email}</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Username</span>
                    <span>{userDetails.username}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Phone Number</span>
                    <span>{userDetails.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Subscription</span>
                    <Badge variant={userDetails.subscriptionPlan === 'premium' ? 'default' : 'outline'}>
                      {userDetails.subscriptionPlan}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Status</span>
                    <Badge variant={userDetails.status === 'active' ? 'success' : 'secondary'}>
                      {userDetails.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Join Date</span>
                    <span>{new Date(userDetails.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
  <span className="font-medium">Subscription Plan</span>
  <span>{userDetails.subscriptionPlan || 'Not provided'}</span>
</div>
<div className="flex justify-between py-2 border-b">
  <span className="font-medium">Subscription Status</span>
  <Badge variant={userDetails.subscriptionStatus === 'active' ? 'success' : 'secondary'}>
    {userDetails.subscriptionStatus}
  </Badge>
</div>
<div className="flex justify-between py-2 border-b">
  <span className="font-medium">Subscription Expiry</span>
  <span>{userDetails.subscriptionExpiry ? new Date(userDetails.subscriptionExpiry).toLocaleDateString() : 'N/A'}</span>
</div>

                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userDetails.children?.map((child) => (
                    <TableRow key={child._id}>
                      <TableCell>{child.name}</TableCell>
                      <TableCell>{child.age}</TableCell>
                      <TableCell>{child.tasks?.length || 0}</TableCell>
                      <TableCell>{child.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userDetails.transactions?.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>${transaction.amount}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'completed' ? 'success' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your users and view analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.location.reload()} className="hover:bg-gray-100">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => {/* Add export functionality */}} className="hover:bg-gray-100">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="border-b border-gray-200">
          <TabsTrigger value="analytics" className="px-4 py-2 text-gray-700 hover:text-gray-900">Analytics</TabsTrigger>
          <TabsTrigger value="users" className="px-4 py-2 text-gray-700 hover:text-gray-900">Users</TabsTrigger>
          <TabsTrigger value="details" className="px-4 py-2 text-gray-700 hover:text-gray-900">User Details</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          {renderAnalyticsDashboard()}
        </TabsContent>
        <TabsContent value="users">
          {renderUserManagement()}
        </TabsContent>
        <TabsContent value="details">
          {renderUserDetails()}
        </TabsContent>
      </Tabs>
      {renderAddUserDialog()}
      {renderEditUserDialog()}
    </div>
  )
}
