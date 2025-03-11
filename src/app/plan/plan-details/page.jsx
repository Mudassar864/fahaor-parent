'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadStripe } from '@stripe/stripe-js'; // Import Stripe.js

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);  // State to store fetched plans
  const [loading, setLoading] = useState(false);
  const [stripePublishableKey, setStripePublishableKey] = useState('');  // State to store Stripe publishable key
  const [stripeSecretKey, setStripeSecretKey] = useState('');  // State to store Stripe secret key
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch pricing plans from API
  useEffect(() => {
    const fetchStripeKeys = async () => {
      try {
        const response = await fetch(`${API_URL}/api/stripe-keys`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Optional auth token if needed
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch Stripe keys');
        }

        const data = await response.json();
        setStripePublishableKey(data.stripePublishableKey);  // Set the publishable key from the API response
        setStripeSecretKey(data.stripeSecretKey);  // Set the secret key from the API response
        console.log('Fetched Stripe publishable key:', data.stripePublishableKey);  // For debugging
        
      } catch (error) {
        console.error('Error fetching Stripe keys:', error);
      }
    };

    const fetchPlans = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pricing`);
        const data = await response.json();
        
        // Check if the response is an array
        if (Array.isArray(data)) {
          setPlans(data);  // Set plans if the response is valid
        } else {
          console.error("Received data is not an array:", data);
          setPlans([]);  // Set empty array if response is invalid
        }
      } catch (error) {
        console.error("Error fetching pricing plans:", error);
      }
    };

    fetchStripeKeys();  // Fetch the Stripe keys from the backend
    fetchPlans(); // Fetch pricing plans when the component mounts
  }, []);

  const handleGetStarted = async (plan) => {
    setLoading(true);

    try {
      // Create a checkout session with the secret key
      const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Auth token from localStorage
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          subscriptionPlan: plan.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      console.log('Session ID:', sessionId);

      if (sessionId && stripePublishableKey) {
        alert(stripePublishableKey)
        // Load Stripe.js and redirect to checkout using the publishable key
        const stripe = await loadStripe(stripePublishableKey); // Use the publishable key fetched from the backend
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf4ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan._id}  // Assuming `_id` is present in the fetched plan
              className="relative flex flex-col items-center p-8 bg-[#fdf4ff] border-0 shadow-none"
            >
              {plan.badge && (
                <div className="text-[#ff00ff] text-xl font-medium mb-4">
                  {plan.badge}
                </div>
              )}
              <h2 className="text-4xl font-bold text-[#1a0033] mb-4">
                {plan.name}
              </h2>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-[#1a0033] text-2xl">€</span>
                <span className="text-[#1a0033] text-7xl font-bold">
                  {plan.monthlyPrice.split(' ')[0]}  {/* Extract number from the price string */}
                </span>
                <span className="text-[#1a0033] text-2xl">/mo</span>
              </div>
              <div className="text-[#1a0033] text-xl mb-8">
                {plan.description}
              </div>
              <Button 
                className="w-full max-w-[300px] h-14 bg-[#1a0033] hover:bg-[#2a0053] text-white text-lg rounded-2xl"
                onClick={() => handleGetStarted(plan)}
                disabled={loading || !stripePublishableKey}  // Disable button if publishable key isn't loaded yet
              >
                {loading ? 'Processing...' : 'Get started'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
