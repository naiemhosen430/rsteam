"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContex } from "@/Contexts/AuthContex";
import { ChatsContex } from "@/Contexts/ChatContext";
import { useParams } from "next/navigation";
import BottomBar from "@/app/_components/shared/BottomBar";
import { getApiCall } from "@/api/fatchData";
import socket from "@/api/connectIo";

const Page = () => {
  const { state } = useContext(AuthContex);
  const user = state?.user;
  const { chatState, chatDispatch } = useContext(ChatsContex);
  const allChats = chatState?.allChat;
  const { msgid } = useParams();
  const [messagesFull, setMessagesFull] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      if (msgid) {
        if (allChats) {
          const foundData = allChats.find((s_chat) => s_chat._id === msgid);
          setMessagesFull(foundData);
          setMessages(foundData?.chats?.flat() || []);
        } else {
          try {
            setLoading(true);
            const response = await getApiCall("message/getallsupports");
            const filteredData = response?.data?.data?.find(
              (s_chat) => s_chat.msg_id === msgid
            );
            chatDispatch({
              type: "ADD_CHATS_DATA",
              payload: response.data.data,
            });
            setMessages(filteredData?.chats?.flat() || []);
            setMessagesFull(filteredData);
          } catch (error) {
            console.error("Error fetching messages:", error);
          } finally {
            setLoading(false);
          }
        }
      }
    };

    fetchMessages();
  }, [msgid, allChats, chatDispatch]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      msgid,
      date: Date.now(),
      type: "agent",
      text: newMessage,
      senderId: user._id,
    };

    try {
      socket.emit("sendMessage", messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);

      chatDispatch({
        type: "ADD_CHATS_DATA",
        payload: allChats.map((s_data) => {
          if (messagesFull?._id === s_data?._id) {
            return {
              ...s_data,
              chats: [...s_data.chats, messageData],
            };
          }
          return s_data;
        }),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight; // Automatically scroll to bottom
    }
  }, [messages]); // Scroll when messages change

  return (
    <div className="flex flex-col h-screen">
      <BottomBar title={messagesFull?.user_name || "N/A"} />
      <div className="flex-1 flex flex-col justify-between">
        <div ref={scrollViewRef} className="overflow-auto h-[82%] p-2">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <span className="animate-spin">🔄</span>
            </div>
          ) : messages.length === 0 ? (
            <span className="text-gray-500 text-lg">No messages yet.</span>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex w-full my-2 ${
                  msg.type === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[80%] ${
                    msg.type === "bot" ? "bg-gray-300" : "bg-green-200"
                  }`}
                >
                  <span className="text-lg text-black">{msg.text}</span>
                  <span className="text-gray-500 block text-[10px]">
                    {new Date(msg.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center p-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-l-md p-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button
            className="bg-gray-300 rounded-r-md px-4 py-2"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
