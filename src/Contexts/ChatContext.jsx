"use client";
import { getCookie } from "cookies-next";
import { createContext, useEffect, allChateducer } from "react";
import { getApiCall } from "@/api/fatchData";

export const AuthContex = createContext();

const authReducer = (chatState, action) => {
  switch (action.type) {
    case "ADD_AUTH_DATA":
      return { ...chatState, allChat: action.payload };
    default:
      return chatState;
  }
};

export default function AuthContexProvider({ children }) {
  const token = getCookie("accesstoken");

  const [chatState, chatDispatch] = allChateducer(authReducer, {
    allChat: null,
  });

  useEffect(() => {
    if (token && !chatState?.allChat) {
      const fetchData = async () => {
        try {
          const response = await getApiCall("auth/me");
          if (response?.statusCode === 200 && response?.data) {
            chatDispatch({ type: "ADD_AUTH_DATA", payload: response?.data });
          }
        } catch (error) {}
      };

      fetchData();
    }
  }, [token, chatState]);

  return (
    <AuthContex.Provider value={{ chatState, chatDispatch }}>
      {children}
    </AuthContex.Provider>
  );
}