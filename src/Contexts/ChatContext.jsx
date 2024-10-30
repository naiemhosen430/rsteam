"use client";
import { getCookie } from "cookies-next";
import {
  createContext,
  useEffect,
  allChateducer,
  useReducer,
  useState,
} from "react";
import { getApiCall } from "@/api/fatchData";

export const ChatsContex = createContext();

const chatsReducer = (chatState, action) => {
  switch (action.type) {
    case "ADD_CHATS_DATA":
      return { ...chatState, allChat: action.payload };
    default:
      return chatState;
  }
};

export default function ChatsContexProvider({ children }) {
  const token = getCookie("usertoken");
  const [loadingChats, setLoadingChats] = useState(false);

  const [chatState, chatDispatch] = useReducer(chatsReducer, {
    allChat: null,
  });

  useEffect(() => {
    if (token && !chatState?.allChat) {
      const fetchData = async () => {
        try {
          const response = await getApiCall("message/getallsupports");
          if (response?.statusCode === 200 && response?.data) {
            chatDispatch({ type: "ADD_CHATS_DATA", payload: response?.data });
          }
        } catch (error) {}
      };

      fetchData();
    }
  }, [token, chatState]);

  return (
    <ChatsContex.Provider
      value={{ chatState, chatDispatch, loadingChats, setLoadingChats }}
    >
      {children}
    </ChatsContex.Provider>
  );
}
