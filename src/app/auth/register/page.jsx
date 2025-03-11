'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation'; // Use next/router for navigation
import axios from 'axios';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link'; // Import Link from next/link
import { Toaster, toast } from 'react-hot-toast'; // Import Toaster and toast
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(''); // Default image
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {
    // Fetch the images from the API
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/images`);
        if (response.data && response.data.length > 0) {
          const { landingImageUrl, loginImageUrl } = response.data[0];
          setBackgroundImage(landingImageUrl || '/family.jpg'); // Fallback to default if not available
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
        role: 'parent',
      });

      if (response.status === 201) {
        const { token } = response.data;
        toast.success('Signed Up successfully!'); // Show success toaster

        localStorage.setItem('token', token); // Store token
        router.push('/profile'); // Redirect to profile
      }
    } catch (error) {
      // Log the error details properly
      console.error('Error signing up:', error.response?.data?.message || error.message || 'Unexpected error');
      alert(error.response?.data?.message || error.message || 'Something went wrong');
      toast.success(error.response?.data?.message || error.message || 'Something went wrong'); // Show success toaster
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="grid h-screen w-full grid-cols-1 lg:grid-cols-2">
      <div
        className="relative hidden h-full w-full bg-cover bg-center bg-no-repeat lg:block"
        style={{ backgroundImage: `url(${backgroundImage})` }} // Dynamically set background image
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent" />
      </div>
      <div className="flex h-full items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium underline">
                Sign in
              </Link>
            </p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner /> : 'Sign up'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
