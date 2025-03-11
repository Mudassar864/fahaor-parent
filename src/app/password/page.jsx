'use client'

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/lib/LanguageContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { toast, Toaster } from "react-hot-toast"
import { Eye, EyeOff, Lock, Key, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

const ChangePasswordForm = () => {
  const { t } = useLanguage()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(true)
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/api/profile/get-password`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || t.failedToFetchPassword)
        }

        const data = await response.json()
        setOldPassword(data.password || "")
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
           router.push("/auth/login");
        } else if (error.response?.status === 403) {
          toast.error("Your subscription has expired. Please renew your plan.");
           router.push("/plan/plan-details");
        } 
        toast.error(error.message || t.errorFetchingPassword)
      } finally {
        setIsFormLoading(false)
      }
    }

    fetchPassword()
  }, [t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error(t.passwordsMismatch)
      return
    }
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/profile/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || t.failedToChangePassword)
      }

      toast.success(t.passwordChangedSuccessfully)
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
         router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
         router.push("/plan/plan-details");
      } 
      toast.error(error.message || t.failedToChangePassword)
    } finally {
      setIsLoading(false)
    }
  }

  const PasswordInput = ({ id, value, onChange, placeholder, show, setShow }) => (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="pr-10"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
        onClick={() => setShow(!show)}
      >
        {show ? (
          <EyeOff className="h-5 w-5 text-gray-400" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400" />
        )}
      </button>
    </div>
  )

  return (
    <AnimatePresence>
      {!isFormLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md mx-auto mt-10">
            <CardHeader>
              <CardTitle>{t.changePassword}</CardTitle>
              <CardDescription>{t.changePasswordDescription}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">{t.oldPassword}</Label>
                  <PasswordInput
                    id="oldPassword"
                    value={oldPassword}
                    onChange={() => {}}
                    placeholder={t.oldPassword}
                    show={showOldPassword}
                    setShow={setShowOldPassword}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.enterNewPassword}
                    show={showNewPassword}
                    setShow={setShowNewPassword}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmNewPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.changing}
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      {t.changePassword}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      )}
      {isFormLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '',
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        }}
      />
    </AnimatePresence>
  )
}

export default ChangePasswordForm