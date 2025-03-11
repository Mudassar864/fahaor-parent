'use client'
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

const LandingPage = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [landingPage, setLandingPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPricing, setNewPricing] = useState({
    name: "",
    description: "",
    monthlyPrice: "",
    yearlyPrice: "",
    monthlyUrl: "",
    yearlyUrl: "",
    badge: "",
  });
  const [updatedImages, setUpdatedImages] = useState({
    loginPageImage: "",
    landingPageImage: "",
  });
  const [selectedPricing, setSelectedPricing] = useState(null); // for selecting a pricing plan to edit

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/landing-page`);
        setLandingPage(response.data);
      } catch (error) {
        console.error("Error fetching landing page", error);
        setLandingPage({}); // Handle error gracefully
      }
    };
    fetchLandingPage();
  }, []);

  const handleImageUpload = async (event, imageType) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios.post(`${API_URL}/api/upload-image/${imageType}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setUpdatedImages((prev) => ({
          ...prev,
          [imageType]: response.data.imageUrl,
        }));

        const updatedLandingPage = { ...landingPage, [imageType]: response.data.imageUrl };
        setLandingPage(updatedLandingPage);
      } catch (error) {
        console.error("Error uploading image", error);
      }
    }
  };

  const handlePricingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/landing-page`, {
        pricing: [newPricing],
      });
      setLandingPage((prev) => ({
        ...prev,
        pricing: [...prev.pricing, response.data.newPricing],
      }));
      setIsEditing(false);
      setNewPricing({});
    } catch (error) {
      console.error("Error adding pricing", error);
    }
  };

  const handlePricingEdit = async (plan) => {
    setSelectedPricing(plan);
    setIsEditing(true);
    setNewPricing({
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      monthlyUrl: plan.monthlyUrl,
      yearlyUrl: plan.yearlyUrl,
      badge: plan.badge,
    });
  };

  const handlePricingUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/api/landing-page/${selectedPricing._id}`, {
        pricing: newPricing,
      });

      setLandingPage((prev) => ({
        ...prev,
        pricing: prev.pricing.map((plan) =>
          plan._id === selectedPricing._id ? response.data.updatedPricing : plan
        ),
      }));

      setIsEditing(false);
      setSelectedPricing(null);
    } catch (error) {
      console.error("Error updating pricing", error);
    }
  };

  const handlePricingDelete = async (planId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/landing-page/pricing/${planId}`);
      setLandingPage((prev) => ({
        ...prev,
        pricing: prev.pricing.filter((plan) => plan._id !== planId),
      }));
    } catch (error) {
      console.error("Error deleting pricing", error);
    }
  };

  const isEmptyData = landingPage === null || (landingPage && Object.keys(landingPage).length === 0);

  return (
    <div className="min-h-screen bg-white text-black p-6">
      {isEmptyData ? (
        <div className="text-center text-gray-500 mt-6">
          <p>No data available. Please add the data below:</p>
          <div className="mt-4">
            <button onClick={() => setIsEditing(true)} className="bg-black text-white py-2 px-4 rounded-md">Add Pricing Plan</button>
          </div>
          <div className="mt-4">
            <button onClick={() => document.getElementById("landingPageImageUpload").click()} className="bg-black text-white py-2 px-4 rounded-md">Add Landing Page Image</button>
          </div>
          <div className="mt-4">
            <button onClick={() => document.getElementById("loginPageImageUpload").click()} className="bg-black text-white py-2 px-4 rounded-md">Add Login Page Image</button>
          </div>
        </div>
      ) : (
        <div>
          {/* Displaying Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Landing Page Image */}
            <div className="relative group">
              <Image src={updatedImages.landingPageImage || landingPage.landingPageImage} alt="Landing Page" width={1200} height={800} className="w-full h-80 object-cover rounded-lg shadow-lg transition-all duration-300 group-hover:opacity-75" />
              <input id="landingPageImageUpload" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "landingPageImage")} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
            </div>

            {/* Login Page Image */}
            <div className="relative group">
              <Image src={updatedImages.loginPageImage || landingPage.loginPageImage} alt="Login Page" width={600} height={400} className="w-full h-60 object-cover rounded-lg shadow-lg transition-all duration-300 group-hover:opacity-75" />
              <input id="loginPageImageUpload" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "loginPageImage")} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          {/* Pricing Plans Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold">Pricing Plans</h2>
            {landingPage.pricing.length === 0 ? (
              <div className="text-center text-gray-500 mt-6">
                <p>No pricing plans available. Add a new plan below.</p>
                <button onClick={() => setIsEditing(true)} className="mt-4 bg-black text-white py-2 px-4 rounded-md">Add New Pricing Plan</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {landingPage.pricing.map((plan) => (
                  <div key={plan._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => handlePricingEdit(plan)}>
                    {plan.badge && <span className="text-sm bg-black text-white py-1 px-3 rounded-full mb-4 inline-block">{plan.badge}</span>}
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                    <div className="mt-4">
                      <p className="text-lg font-semibold">Monthly: ${plan.monthlyPrice}</p>
                      <p className="text-lg font-semibold">Yearly: ${plan.yearlyPrice}</p>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <button className="text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handlePricingDelete(plan._id); }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Form */}
          {isEditing && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold">{selectedPricing ? "Edit Pricing Plan" : "Add New Pricing Plan"}</h2>
              <form onSubmit={selectedPricing ? handlePricingUpdate : handlePricingSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold">Name</label>
                  <input type="text" value={newPricing.name} onChange={(e) => setNewPricing({ ...newPricing, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Description</label>
                  <textarea value={newPricing.description} onChange={(e) => setNewPricing({ ...newPricing, description: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md" rows="4"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold">Monthly Price</label>
                    <input type="number" value={newPricing.monthlyPrice} onChange={(e) => setNewPricing({ ...newPricing, monthlyPrice: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Yearly Price</label>
                    <input type="number" value={newPricing.yearlyPrice} onChange={(e) => setNewPricing({ ...newPricing, yearlyPrice: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold">Monthly URL</label>
                  <input type="url" value={newPricing.monthlyUrl} onChange={(e) => setNewPricing({ ...newPricing, monthlyUrl: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Yearly URL</label>
                  <input type="url" value={newPricing.yearlyUrl} onChange={(e) => setNewPricing({ ...newPricing, yearlyUrl: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Badge</label>
                  <input type="text" value={newPricing.badge} onChange={(e) => setNewPricing({ ...newPricing, badge: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md" />
                </div>
                <button type="submit" className="w-full bg-black text-white py-2 px-4 rounded-md">Save</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
