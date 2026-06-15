'use client'
import { useState, useEffect, useRef } from 'react'
import { db, auth, googleProvider } from '../lib/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, setDoc, doc, Timestamp } from 'firebase/firestore'

export default function Home() {
  const [user, setUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // 1. Login Check + User Save + Last Seen
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          email: currentUser.email,
          lastSeen: serverTimestamp()
        }, { merge: true })
        setUser(currentUser)
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

  // 3. Messages Load - Fix: Filter null timestamp
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
       .filter(m => m.createdAt) // Fix: serverTimestamp null issue
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
    await signOut(auth)
    setSelectedUser(null) // Fix: Clear chat on logout
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

  if (loading) {
    return (
      <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#111b21', color: 'white'}}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#111b21'}}>
        <button onClick={login} style={{padding: '15px 30px', fontSize: '18px', background: '#00a884', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'}}>
          Google ରେ Login କରି Chat କର
        </button>
      </div>
    )
  }

  return (
    <div style={{height: '100vh', display: 'flex', background: '#0b141a', fontFamily: 'sans-serif'}}>
      {/* Left Side - User List */}
      <div style={{width: '30%', minWidth: '300px', borderRight: '1px solid #2a3942', display: 'flex', flexDirection: 'column'}}>
        <div style={{background: '#202c33', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img src={user.photoURL} referrerPolicy="no-referrer" style={{width: '40px', height: '40px', borderRadius: '50%'}} />
            <div style={{color: 'white', fontWeight: 'bold'}}>{user.displayName}</div>
          </div>
          <button onClick={logout} style={{background: '#d32f2f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px'}}>Logout</button>
        </div>

        <div style={{flex: 1, overflowY: 'auto', background: '#111b21'}}>
          <div style={{color: '#8696a0', padding: '15px', fontSize: '14px'}}>Chats</div>
          {allUsers.length === 0 && <div style={{color: '#8696a0', padding: '15px', textAlign: 'center'}}>No users found</div>}
          {allUsers.map(u => (
            <div key={u.uid} onClick={() => setSelectedUser(u)} style={{padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: selectedUser?.uid === u.uid? '#2a3942' : 'transparent', borderBottom: '1px solid #2a3942'}}>
              <img src={u.photoURL} referrerPolicy="no-referrer" style={{width: '49px', height: '49px', borderRadius: '50%'}} />
              <div style={{color: 'white'}}>{u.displayName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat */}
      {selectedUser? (
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{background: '#202c33', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img src={selectedUser.photoURL} referrerPolicy="no-referrer" style={{width: '40px', height: '40px', borderRadius: '50%'}} />
            <div style={{color: 'white', fontWeight: 'bold'}}>{selectedUser.displayName}</div>
          </div>

          <div style={{flex: 1, overflowY: 'auto', padding: '20px', backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)'}}>
            {messages.map(msg => (
              <div key={msg.id} style={{display: 'flex', justifyContent: msg.uid === user.uid? 'flex-end' : 'flex-start', marginBottom: '10px'}}>
                <div style={{background: msg.uid === user.uid? '#005c4b' : '#202c33', color: 'white', padding: '8px 12px', borderRadius: '8px', maxWidth: '60%', wordWrap: 'break-word'}}>
                  <div>{msg.text}</div>
                  <div style={{fontSize: '10px', color: '#8696a0', textAlign: 'right', marginTop: '4px'}}>
                    {msg.createdAt?.toDate().toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{background: '#202c33', padding: '10px', display: 'flex', gap: '10px', alignItems: 'center'}}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#2a3942', color: 'white', outline: 'none'}}
            />
            <button onClick={sendMessage} style={{background: '#00a884', border: 'none', borderRadius: '50%', width: '45px', height: '45px', color: 'white', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>➤</button>
          </div>
        </div>
      ) : (
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222e35'}}>
          <div style={{textAlign: 'center', color: '#8696a0'}}>
            <h2>Connect Chat</h2>
            <p>Select a user to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}