"use client";
import { useState } from "react";
import { Search, Camera, MoreVertical, Archive, MessageSquare, Radio, Users, Phone } from "lucide-react";

const chatData = [
  {
    id: 1,
    name: "Meta AI",
    msg: "ବାପୁନ ଭାଇ, File Save ହେଲାନି। ପୁଣି...",
    time: "14:11",
    unread: 0,
    online: true,
    avatar: "M",
    color: "bg-purple-500",
  },
  {
    id: 2,
    name: "Lopa Bani",
    msg: "✓ 📷 Photo",
    time: "14:08",
    unread: 0,
    online: false,
    avatar: "L",
    color: "bg-orange-400",
  },
  {
    id: 3,
    name: "Princess",
    msg: "✓✓ https://connect-chat-gold.vercel.a...",
    time: "13:21",
    unread: 0,
    online: false,
    avatar: "P",
    color: "bg-pink-500",
  },
  {
    id: 4,
    name: "Tata Neu Credit",
    msg: "IMPORTANT UPDATE TATWA: You...",
    time: "11:18",
    unread: 1,
    online: false,
    avatar: "T",
    color: "bg-blue-500",
  },
  {
    id: 5,
    name: "Prakash Padhan Vle",
    msg: "✓✓ 📷 2 photos",
    time: "11:13",
    unread: 0,
    online: true,
    avatar: "P",
    color: "bg-green-600",
  },
  {
    id: 6,
    name: "Ashutosh Khuntia",
    msg: "✓✓ 🎥 Video",
    time: "Yesterday",
    unread: 0,
    online: true,
    avatar: "A",
    color: "bg-red-500",
  },
  {
    id: 7,
    name: "Sumantra",
    msg: "📷 2 photos",
    time: "Yesterday",
    unread: 0,
    online: false,
    avatar: "S",
    color: "bg-yellow-600",
  },
];

export default function WhatsAppUI() {
  const [activeTab, setActiveTab] = useState("Chats");

  return (
    <div className="bg-[#0b141a] min-h-screen text-white max-w-md mx-auto">
      {/* Header */}
      <div className="bg-[#202c33] px-4 pt-3 pb-1">
        <div className="flex justify-between items-center">
          <h1 className="text-[#00a884] text-xl font-semibold">WhatsApp</h1>
          <div className="flex gap-6 text-[#aebac1]">
            <span className="text-lg">₹</span>
            <Camera size={22} />
            <MoreVertical size={22} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#202c33] px-3 pb-3">
        <div className="bg-[#2a3942] rounded-lg flex items-center px-3 py-2">
          <Search size={20} className="text-[#8696a0] mr-3" />
          <input
            placeholder="Ask Meta AI or Search"
            className="bg-transparent outline-none text-[#e9edef] w-full text-[15px] placeholder:text-[#8696a0]"
          />
        </div>
      </div>

      {/* Archived */}
      <div className="bg-[#0b141a] px-4 py-3 flex justify-between items-center border-b border-[#222d34]">
        <div className="flex gap-5 items-center text-[#00a884]">
          <Archive size={20} />
          <span className="text-[15px]">Archived</span>
        </div>
        <span className="text-[#00a884] text-sm">32</span>
      </div>

      {/* Chat List */}
      <div className="bg-[#0b141a]">
        {chatData.map((chat) => (
          <div key={chat.id} className="flex gap-3 px-4 py-3 active:bg-[#202c33] border-b border-[#222d34]">
            {/* Avatar with Online Dot */}
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 ${chat.color} rounded-full flex items-center justify-center text-white text-xl font-medium`}>
                {chat.avatar}
              </div>
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] rounded-full border-2 border-[#0b141a]"></div>
              )}
            </div>

            {/* Chat Details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="text-[#e9edef] font-medium text-[17px] truncate">{chat.name}</h3>
                <span className={`text-xs ${chat.unread? 'text-[#00a884] font-medium' : 'text-[#8696a0]'}`}>
                  {chat.time}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-[#8696a0] text-[14px] truncate pr-2">{chat.msg}</p>
                {chat.unread > 0 && (
                  <span className="bg-[#00a884] text-[#111b21] text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#202c33] border-t border-[#2a3942] flex justify-around py-2">
        {[
          { name: "Chats", icon: MessageSquare, count: 22 },
          { name: "Updates", icon: Radio, dot: true },
          { name: "Communities", icon: Users },
          { name: "Calls", icon: Phone },
        ].map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className="flex flex-col items-center gap-1 px-6 py-1 relative"
          >
            <div className="relative">
              <tab.icon
                size={24}
                className={activeTab === tab.name? "text-[#00a884]" : "text-[#8696a0]"}
                fill={activeTab === tab.name? "#00a884" : "none"}
              />
              {tab.count && (
                <span className="absolute -top-1 -right-2 bg-[#00a884] text-[#111b21] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {tab.count}
                </span>
              )}
              {tab.dot && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#00a884] w-2 h-2 rounded-full"></span>
              )}
            </div>
            <span className={`text-[11px] ${activeTab === tab.name? "text-[#00a884] font-medium" : "text-[#8696a0]"}`}>
              {tab.name}
            </span>
          </button>
        ))}
      </div>

      {/* Floating New Chat Button */}
      <button className="fixed bottom-20 right-4 bg-[#00a884] w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
        <MessageSquare size={24} className="text-[#111b21]" fill="#111b21" />
      </button>
    </div>
  );
}