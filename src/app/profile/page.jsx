
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from "@/lib/LanguageContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, User, Upload, Camera, X, Mail, Phone, MapPin, Calendar, Globe, Briefcase } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import { usePathname ,useRouter } from "next/navigation";

const EngagingMultiStepForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()
  const [profilePicture, setProfilePicture] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        dateOfBirth: "",
        gender: "",
        nationality: "",
        occupation: "",
      },
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const errorData = await response.json();
        
          if (response.status === 401) {
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem("token");
            router.push("/auth/login");
          } else if (response.status === 403) {
            toast.error("Your subscription has expired. Please renew your plan.");
            router.push("/plan/plan-details");
          } else {
            toast.error(errorData.message || "Failed to fetch profile");
          }
        
          throw new Error(errorData.message || "Failed to fetch profile");
        }

        const data = await response.json()

        console.log("Fetched Profile Data:", data)

        setValue("personalInfo", {
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phoneNumber || "",
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            zipCode: data.address?.zipCode || "",
            country: data.address?.country || "",
          },
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          gender: data.gender || "",
          nationality: data.nationality || "",
          occupation: data.occupation || "",
        })

        if (data.profilePicture) {
          setProfilePicture(data.profilePicture)
        }

        toast.success(t.profileLoadedSuccessfully)
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
           router.push("/auth/login");
        } else if (error.response?.status === 403) {
          toast.error("Your subscription has expired. Please renew your plan.");
           router.push("/plan/plan-details");
        } 
        console.error("Error fetching profile data:", error.message)
        toast.error(t.failedToLoadProfile)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [setValue, t])

  const onSubmit = async (data) => {
    console.log("profilePicture", profilePicture)
    try {
      setIsLoading(true)
      toast.loading(t.updatingProfile)

      console.log("Form data before processing:", data)

      const formData = new FormData()

      formData.append(
        "personalInfo",
        JSON.stringify({
          ...data.personalInfo,
          gender: data.personalInfo.gender || "",
        })
      )

      console.log("FormData entries:", Object.fromEntries(formData.entries()))

      
    if (profilePicture instanceof File) {
      formData.append("profilePicture", profilePicture);
      // alert('profile send')
    }


      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t.failedToUpdateProfile)
      }

      toast.dismiss()
      toast.success(t.profileUpdatedSuccessfully)
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Delay in milliseconds
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
         router.push("/auth/login");
      } else if (error.response?.status === 403) {
        toast.error("Your subscription has expired. Please renew your plan.");
         router.push("/plan/plan-details");
      } 
      console.error("Error during profile update:", error.message)
      toast.dismiss()
      toast.error(error.message || t.failedToUpdateProfile)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setProfilePicture(file)
    }
  }

  const openCamera = () => {
    setIsCameraOpen(true)
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      })
      .catch(err => console.error("Error accessing the camera:", err))
  }

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d')
    context.drawImage(videoRef.current, 0, 0, 640, 480)
    const imageDataUrl = canvasRef.current.toDataURL('image/jpeg')
    setCapturedImage(imageDataUrl)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const usePhoto = () => {
    setProfilePicture(capturedImage)
    setCapturedImage(null)
    setIsCameraOpen(false)
    const stream = videoRef.current.srcObject
    const tracks = stream.getTracks()
    tracks.forEach(track => track.stop())
  }

  const closeCamera = () => {
    setIsCameraOpen(false)
    setCapturedImage(null)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <CardTitle className="text-3xl font-bold">{t.personalInformation}</CardTitle>
          <CardDescription className="text-purple-100">{t.pleaseProvideYourDetails}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <Label htmlFor="profilePicture" className="text-lg font-medium text-purple-600 dark:text-purple-400">
                {t.profilePicture}
              </Label>
              <div className="relative flex flex-col items-center space-y-4">
                <Input
                  id="profilePicture"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Label
                  htmlFor="profilePicture"
                  className="cursor-pointer flex items-center justify-center w-40 h-40 bg-purple-100 dark:bg-gray-700 border-2 border-dashed border-purple-300 dark:border-purple-500 rounded-full hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture instanceof File ? URL.createObjectURL(profilePicture) : profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/placeholder.svg?height=160&width=160'
                      }}
                    />
                  ) : (
                    <Upload className="w-10 h-10 text-purple-500 dark:text-purple-400" />
                  )}
                </Label>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t.uploadImage}</span>
                <Button type="button" onClick={openCamera} variant="outline" className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>{t.takePhoto}</span>
                </Button>
              </div>

              {isCameraOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                >
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[90%] max-w-md">
                    <div className="flex justify-end mb-4">
                      <Button onClick={closeCamera} variant="ghost">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    {!capturedImage ? (
                      <>
                        <video
                          ref={videoRef}
                          className="w-full h-auto rounded-md border border-gray-300 dark:border-gray-600 mb-4"
                        />
                        <Button
                          onClick={capturePhoto}
                          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300"
                        >
                          {t.takePhoto}
                        </Button>
                      </>
                    ) : (
                      <>
                        <img
                          src={capturedImage}
                          alt="Captured"
                          className="w-full h-auto rounded-md mb-4"
                        />
                        <div className="flex justify-between space-x-4">
                          <Button
                            onClick={retakePhoto}
                            variant="outline"
                            className="flex-1"
                          >
                            {t.retakePhoto}
                          </Button>
                          <Button
                            onClick={usePhoto}
                            className="flex-1 bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300"
                          >
                            {t.usePhoto}
                          </Button>
                        </div>
                      </>
                    )}
                    <canvas
                      ref={canvasRef}
                      width="640"
                      height="480"
                      className="hidden"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="text-purple-600 dark:text-purple-400">{t.fullName}</Label>
                <Input
                  id="fullName"
                  {...register('personalInfo.fullName', { required: t.requiredField })}
                  className="mt-1"
                />
                {errors.personalInfo?.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.personalInfo.fullName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-purple-600 dark:text-purple-400">{t.email}</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    {...register('personalInfo.email', {
                      required: t.requiredField,
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t.invalidEmail
                      }
                    })}
                  />
                </div>
                {errors.personalInfo?.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.personalInfo.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
              <div>
                <Label htmlFor="dateOfBirth" className="text-purple-600 dark:text-purple-400">{t.dateOfBirth}</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="pl-10"
                    {...register('personalInfo.dateOfBirth', { required: t.requiredField })}
                  />
                </div>
                {errors.personalInfo?.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.personalInfo.dateOfBirth.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-purple-600 dark:text-purple-400">{t.address}</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder={t.street}
                    className="pl-10"
                    {...register('personalInfo.address.street', { required: t.requiredField })}
                  />
                </div>
                <Input
                  placeholder={t.city}
                  {...register('personalInfo.address.city', { required: t.requiredField })}
                />
                <Input
                  placeholder={t.state}
                  {...register('personalInfo.address.state', { required: t.requiredField })}
                />
                <Input
                  placeholder={t.zipCode}
                  {...register('personalInfo.address.zipCode', { required: t.requiredField })}
                />
                <Input
                  placeholder={t.country}
                  {...register('personalInfo.address.country', { required: t.requiredField })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-purple-600 dark:text-purple-400">{t.gender}</Label>
                <RadioGroup
                  value={watch("personalInfo.gender")}
                  onValueChange={(value) => setValue("personalInfo.gender", value, { shouldValidate: true })}
                  className="flex space-x-4 mt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">{t.male}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">{t.female}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">{t.other}</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="nationality" className="text-purple-600 dark:text-purple-400">{t.nationality}</Label>
                <div className="relative mt-1">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="nationality"
                    className="pl-10"
                    {...register('personalInfo.nationality', { required: t.requiredField })}
                  />
                </div>
                {errors.personalInfo?.nationality && (
                  <p className="text-red-500 text-sm mt-1">{errors.personalInfo.nationality.message}</p>
                )}
              </div>
            </div>

           

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  {t.saving}
                </div>
              ) : (
                t.saveChanges
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
          duration: 5000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '16px',
          },
        }}
      />
    </div>
  )
}

export default EngagingMultiStepForm