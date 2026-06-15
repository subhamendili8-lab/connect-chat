'use client'
import { useState, useEffect, useRef } from 'react'
import { db, auth, googleProvider } from '../lib/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, setDoc, doc, Timestamp } from 'firebase/firestore'
import { Search, Camera, MoreVertical, MessageSquare, ArrowLeft, Send } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)

  // 1. Login Check + User Save + Online Status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          email: currentUser.email,
          lastSeen: serverTimestamp(),
          online: true
        }, { merge: true })
        setUser(currentUser)

        window.addEventListener('beforeunload', () => {
          setDoc(doc(db, 'users', currentUser.uid), {
            online: false,
            lastSeen: serverTimestamp()
          }, { merge: true })
        })
      } else {
        setUser(null)
        setSelectedUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 2. All Users List
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data()).filter(u => u.uid!== user.uid)
      setAllUsers(users)
    })
    return () => unsubscribe()
  }, [user])

  const getRoomId = (uid1, uid2) => {
    return uid1 < uid2? `${uid1}_${uid2}` : `${uid2}_${uid1}`
  }

  // 3. Messages Load
  useEffect(() => {
    if (!user ||!selectedUser) {
      setMessages([])
      return
    }
    const roomId = getRoomId(user.uid, selectedUser.uid)
    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('createdAt')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
       .map(doc => ({ id: doc.id,...doc.data() }))
       .filter(m => m.createdAt)
      setMessages(msgs)
    })
    return () => unsubscribe()
  }, [user, selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.log(error)
      alert('Login Failed: ' + error.message)
    }
  }

  const logout = async () => {
    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        online: false,
        lastSeen: serverTimestamp()
      }, { merge: true })
    }
    await signOut(auth)
    setSelectedUser(null)
  }

  const sendMessage = async () => {
    if (newMessage.trim() === '' ||!selectedUser ||!user) return
    const roomId = getRoomId(user.uid, selectedUser.uid)
    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: user.uid,
      photoURL: user.photoURL,
      displayName: user.displayName,
      roomId: roomId
    })
    setNewMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' &&!e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getLastSeen = (lastSeen) => {
    if (!lastSeen) return 'offline'
    const now = Timestamp.now().toDate()
    const seen = lastSeen.toDate()
    const diff = (now - seen) / 1000

    if (diff < 60) return 'online'
    if (diff < 3600) return `last seen ${Math.floor(diff/60)} min ago`
    if (diff < 86400) return `last seen ${Math.floor(diff/3600)} hr ago`
    return `last seen ${seen.toLocaleDateString()}`
  }

  const filteredUsers = allUsers.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b141a] text-white">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b141a]">
        <button onClick={login} className="px-8 py-4 text-lg bg-[#00a884] text-white border-none rounded-lg cursor-pointer font-medium">
          Google ରେ Login କରି Chat କର
        </button>
      </div>
    )
  }

  // Mobile: Chat View
  if (selectedUser) {
    return (
      <div className="h-screen flex flex-col bg-[#0b141a] max-w-md mx-auto">
        {/* Chat Header - Fixed */}
        <div className="bg-[#202c33] px-2 py-2 flex items-center gap-2">
          <button onClick={() => setSelectedUser(null)} className="text-[#aebac1] p-2">
            <ArrowLeft size={24} />
          </button>
          <img src={selectedUser.photoURL} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <div className="text-[#e9edef] font-medium">{selectedUser.displayName}</div>
            <div className="text-[#8696a0] text-xs">
              {selectedUser.online? 'online' : getLastSeen(selectedUser.lastSeen)}
            </div>
          </div>
          <MoreVertical size={22} className="text-[#aebac1]" />
        </div>

        {/* Messages - Fixed */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0b141a]" style={{backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)'}}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex mb-2 ${msg.uid === user.uid? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg max-w-[75%] ${msg.uid === user.uid? 'bg-[#005c4b]' : 'bg-[#202c33]'} text-white`}>
                <div className="text-sm break-words">{msg.text}</div>
                <div className="text-xs text-[#8696a0] text-right mt-1">
                  {msg.createdAt?.toDate().toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-[#202c33] p-2 flex gap-2 items-center">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="flex-1 px-4 py-3 rounded-lg border-none bg-[#2a3942] text-white outline-none text-sm"
          />
          <button onClick={sendMessage} className="bg-[#00a884] border-none rounded-full w-12 h-12 text-white cursor-pointer flex items-center justify-center">
            <Send size={20} />
          </button>
        </div>
      </div>
    )
  }

  // Mobile: User List View
  return (
    <div className="bg-[#0b141a] min-h-screen text-white max-w-md mx-auto">
      {/* Header */}
      <div className="bg-[#202c33] px-4 pt-3 pb-1">
        <div className="flex justify-between items-center">
          <h1 className="text-[#00a884] text-xl font-semibold">Connect Chat</h1>
          <div className="flex gap-6 text-[#aebac1] items-center">
            <button onClick={logout} className="text-xs bg-red-600 px-2 py-1 rounded">Logout</button>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="bg-transparent outline-none text-[#e9edef] w-full text-sm placeholder:text-[#8696a0]"
          />
        </div>
      </div>

      {/* User List */}
      <div className="bg-[#0b141a]">
        {filteredUsers.length === 0 && (
          <div className="text-[#8696a0] p-4 text-center">No users found</div>
        )}
        {filteredUsers.map((u) => (
          <div key={u.uid} onClick={() => setSelectedUser(u)} className="flex gap-3 px-4 py-3 active:bg-[#202c33] border-b border-[#222d34]">
            {/* Avatar with Online Dot */}
            <div className="relative flex-shrink-0">
              <img src={u.photoURL} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full" />
              {u.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] rounded-full border-2 border-[#0b141a]"></div>
              )}
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="text-[#e9edef] font-medium text-sm truncate">{u.displayName}</h3>
                <span className="text-xs text-[#8696a0]">
                  {u.lastSeen?.toDate().toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-[#8696a0] text-sm truncate pr-2">
                  {u.online? 'online' : getLastSeen(u.lastSeen)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}