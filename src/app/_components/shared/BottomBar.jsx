"use client";
import { useContext, useEffect, useState } from "react";
import { FaBars, FaChevronRight, FaHome } from "react-icons/fa";
import { AuthContex } from "@/Contexts/AuthContex";
import { useRouter } from "next/navigation";
import { ChatsContex } from "@/Contexts/ChatContext";
import socket from "@/api/connectIo";
import { getCookie } from "cookies-next";
import { getApiCall } from "@/api/fatchData";

export default function BottomBar({ title }) {
  const router = useRouter();
  const { state, setLoading, loading } = useContext(AuthContex);
  const user = state?.user;
  const [barState, setBarState] = useState(false);

  const { chatState, chatDispatch } = useContext(ChatsContex);
  const allChat = chatState?.allChat;
  const [token, set_token] = useState(null);

  useEffect(() => {
    if (!token) {
      const fan = async () => {
        const token_data = await getCookie("usertoken");
        set_token(token_data);
      };
      fan();
    }
  }, [token]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getApiCall("message/getallsupports");
        chatDispatch({
          type: "ADD_CHATS_DATA",
          payload: response?.data?.data,
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchMessages();
    }
  }, [token]);

  useEffect(() => {
    const handleNewSupportMessage = (data) => {
      chatDispatch({
        type: "ADD_CHATS_DATA",
        payload: (prevAllChat) => {
          return prevAllChat.map((s_data) => {
            if (data?.id === s_data?._id) {
              const updatedChats = [...s_data.chats, data.data];
              return {
                ...s_data,
                chats: updatedChats,
              };
            }
            return s_data;
          });
        },
      });

      showNotification("New Message", data?.data?.text);
    };

    if (user) {
      socket.on(`${user._id}-newmessage`, handleNewSupportMessage);

      return () => {
        socket.off(`${user._id}-newmessage`, handleNewSupportMessage);
      };
    }
  }, [user, allChat, socket]);

  useEffect(() => {
    const handleNewSupportMessage = (data) => {
      data;
      chatDispatch({
        type: "ADD_CHATS_DATA",
        payload: (prevAllChat) => {
          return [...prevAllChat, data];
        },
      });

      showNotification("New Message", data?.chats[0]?.text);
    };

    if (user) {
      socket.on(`${user._id}-newmessageobj`, handleNewSupportMessage);

      return () => {
        socket.off(`${user._id}-newmessageobj`, handleNewSupportMessage);
      };
    }
  }, [user, allChat, socket]);

  return (
    <>
      <div className="flex items-center justify-between p-2 border-b-2">
        <div className="w-10 flex items-center">
          <button onClick={() => setBarState(true)}>
            <FaBars size={30} className="text-black" />
          </button>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-lg text-black">{title}</h1>
        </div>
      </div>

      {/* SideBar */}
      {barState && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setBarState(false)}
        >
          <div
            className="absolute left-0 h-full w-2/3 bg-white p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setBarState(false);
                router.push("/home");
              }}
              className="flex items-center p-2 border-b"
            >
              <FaHome size={30} className="text-black" />
              <span className="ml-2 text-black">Home</span>
            </button>

            {user?.access_routes?.flat().map((menu) => (
              <button
                key={menu?._id}
                onClick={() => {
                  // Add your logic here
                }}
                className="flex items-center p-2 border-b"
              >
                <span className="flex items-center">
                  <FaChevronRight size={30} className="text-black" />
                  <span className="ml-2 text-black">{menu?.label}</span>
                </span>
              </button>
            ))}

            <button onClick={() => logout()} className="flex items-center p-2">
              <span className="ml-2">LogOut</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
