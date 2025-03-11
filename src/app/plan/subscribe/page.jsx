'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, AlertTriangle, CreditCard, Calendar, Users, ArrowRight } from 'lucide-react'

const CurrentPlan = () => {
  const { t } = useLanguage()

  // This would typically come from your backend or state management
  const currentPlan = {
    name: 'Pro',
    price: 19.99,
    billingCycle: 'monthly',
    nextBillingDate: '2023-12-01',
    features: [
      '10 family members',
      'Advanced calendar',
      'Full task management',
      'Comprehensive budget tools',
      'Priority support'
    ],
    usageStats: {
      familyMembers: {
        used: 8,
        total: 10
      },
      storage: {
        used: 7.5,
        total: 10
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold text-center mb-8">{t.currentPlan}</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{currentPlan.name} {t.plan}</span>
                <Badge variant="secondary">{t.active}</Badge>
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">${currentPlan.price}</span> / {t.month}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{t.planFeatures}</h3>
                  <ul className="space-y-2">
                    {currentPlan.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t.usage}</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t.familyMembers}</span>
                        <span>{currentPlan.usageStats.familyMembers.used} / {currentPlan.usageStats.familyMembers.total}</span>
                      </div>
                      <Progress value={(currentPlan.usageStats.familyMembers.used / currentPlan.usageStats.familyMembers.total) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t.storage}</span>
                        <span>{currentPlan.usageStats.storage.used}GB / {currentPlan.usageStats.storage.total}GB</span>
                      </div>
                      <Progress value={(currentPlan.usageStats.storage.used / currentPlan.usageStats.storage.total) * 100} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-yellow-500">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>{t.approachingLimit}</span>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span>{t.billingCycle}: {t[currentPlan.billingCycle]}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{t.nextBillingDate}: {currentPlan.nextBillingDate}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">{t.changePlan}</Button>
              <Button variant="outline">{t.cancelSubscription}</Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t.needMoreFeatures}</CardTitle>
              <CardDescription>{t.upgradeDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{t.unlimitedFamilyMembers}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Check className="h-5 w-5" />
                <span>{t.allProFeatures}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                {t.upgradeToEnterprise}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default CurrentPlan