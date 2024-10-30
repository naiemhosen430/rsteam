"use client";
import React, { useContext, useState } from "react";
import { AuthContex } from "@/Contexts/AuthContex";
import { postApiCall } from "@/api/fatchData";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

const HomeScreen = () => {
  const navigation = useRouter();
  const { state, dispatch } = useContext(AuthContex);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (phone && password) {
      setLoading(true);

      try {
        const response = await postApiCall("auth/login", {
          phone,
          password,
        });

        if (response.data) {
          const token = response?.token;
          dispatch("ADD_AUTH_DATA", response.data);
          setCookie("usertoken", token);
          navigation.push("/", { scroll: true });
        } else {
          alert("Login failed: " + (response.message || "An error occurred"));
        }
      } catch (error) {
        alert("Error: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Phone and password are required!");
    }
  };

  return (
    <div className="flex container flex-col justify-center items-center h-screen p-5 bg-gray-100">
      <input
        type="text"
        placeholder="Phone"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full mb-2 p-2 border text-black rounded"
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-2 p-2 border text-black rounded"
      />
      <button
        onClick={handleLogin}
        className={`w-full py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-blue-500"
        }`}
        disabled={loading}
      >
        {loading ? <span className="loader">Loading....</span> : "Login"}
      </button>
      {loading && (
        <div className="mt-4">
          <span className="loader">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
