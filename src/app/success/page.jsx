'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const SuccessPage = () => {
  const searchParams = useSearchParams(); // Use this for accessing query params in app directory.
  const router = useRouter();
  const session_id = searchParams.get('session_id'); // Get the session_id query parameter.

  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  useEffect(() => {
    console.log('Session ID:', session_id); // Check if session_id is being retrieved
    if (session_id) {
      fetchSubscriptionDetails(session_id);
    }
  }, [session_id]);
  
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchSubscriptionDetails = async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/stripe/session/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Include your auth token
        },
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptionDetails(data.subscription);
      } else {
        console.error('Failed to fetch subscription details');
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  if (!subscriptionDetails) {
    return <div>Failed to retrieve subscription details. Please try again later.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
    <div className="max-w-md w-full border rounded-lg p-6 shadow">
      <h1 className="text-xl font-bold text-center mb-4">Subscription Successful!</h1>
      <div className="text-center space-y-4">
        <p className="text-lg">
          <span className="font-semibold">Plan:</span> {subscriptionDetails.plan}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Expiry Date:</span> {new Date(subscriptionDetails.expiry).toLocaleDateString()}
        </p>
        <button
          onClick={() => router.push('/calendar')}
          className="w-full border rounded-lg py-2 px-4 mt-4"
        >
          Go to Home
        </button>
      </div>
    </div>
  </div>
  );
};

export default SuccessPage;
