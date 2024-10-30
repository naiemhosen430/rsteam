"use client";
import { useContext, useEffect } from "react";
import Image from "next/image";
import { AuthContex } from "@/Contexts/AuthContex";
import BottomBar from "./_components/shared/BottomBar";
import { ChatsContex } from "@/Contexts/ChatContext";
import { useRouter } from "next/navigation";

const page = () => {
  const { state, loading } = useContext(AuthContex);
  const user = state?.user;
  const { chatState, chatDispatch } = useContext(ChatsContex);
  const allChats = chatState?.allChat;
  const router = useRouter();

  const ChatCard = ({ chat }) => {
    const lastChatData = chat.chats[chat.chats.length - 1];
    const lastChat = lastChatData ? lastChatData[0] : null;

    return (
      <button
        className="flex items-center w-full p-4 bg-white rounded-lg shadow-md my-2"
        onClick={() => router.push(`/SingleMessage/${chat?._id}`)}
      >
        <Image
          src={chat.customer_obj.avatar || "/default_avatar.png"} // Default avatar path
          alt={chat.user_name || "Avatar"}
          width={50}
          height={50}
          className="rounded-full mr-4"
        />
        <div className="flex flex-col justify-center text-left">
          <span className="font-bold text-black/70 text-lg">
            {chat.user_name || "N/A"}
          </span>
          <span className="text-black text-left">
            {lastChat ? lastChat.text : "No messages yet"}
          </span>
          <span className="text-black/50 text-xs">
            {lastChat ? new Date(lastChat.date).toLocaleDateString() : ""}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen pt-8">
      <BottomBar title={"Home"} />
      <div className="flex flex-col items-center justify-start flex-1 p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="animate-spin">🔄</span> {/* Spinner Icon */}
          </div>
        ) : !allChats || allChats.length === 0 ? (
          <span className="text-gray-500 text-lg">No messages yet.</span>
        ) : (
          allChats.map((chat) => <ChatCard key={chat.msg_id} chat={chat} />)
        )}
      </div>
    </div>
  );
};

export default page;
