"use client"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Send, Paperclip, Search, Circle, X, FileText, Download, Bot, User } from "lucide-react"
import { io } from "socket.io-client"

const SOCKET_URL = "http://localhost:5000"

const Messenger = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [appointedDoctors, setAppointedDoctors] = useState([])
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [lastSeen, setLastSeen] = useState({})
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState(null)
  
  // Bot-related states
  const [botTyping, setBotTyping] = useState(false)
  const [currentBotFlow, setCurrentBotFlow] = useState('greeting')
  const [botInitialized, setBotInitialized] = useState(false)
  
  const socketRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)
  const userId = localStorage.getItem("userId")

  // Initialize bot greeting when a doctor is selected
  const initializeBotGreeting = () => {
    if (botInitialized) return

    const doctorName = transformedDoctors.find(d => d.id === selectedDoctor)?.name || 'Doctor'
    
    const botGreetingMessages = [
      {
        _id: `bot-greeting-${Date.now()}-1`,
        sender: 'ai-bot',
        receiver: userId,
        message: `Hello! 👋 I'm your AI Health Assistant. I'm here to help you with your healthcare needs while you wait for Dr. ${doctorName}.`,
        timestamp: new Date(),
        senderName: 'AI Assistant',
        messageType: 'bot'
      },
      {
        _id: `bot-greeting-${Date.now()}-2`,
        sender: 'ai-bot',
        receiver: userId,
        message: `Please choose one of the following options:`,
        timestamp: new Date(),
        senderName: 'AI Assistant',
        messageType: 'bot'
      },
      {
        _id: `bot-options-${Date.now()}`,
        sender: 'ai-bot',
        receiver: userId,
        message: '',
        timestamp: new Date(),
        senderName: 'AI Assistant',
        messageType: 'bot',
        isOptions: true,
        options: [
          { id: 1, text: '1. General Query', value: 'general' },
          { id: 2, text: '2. New Consultation', value: 'new_consultation' },
          { id: 3, text: '3. Existing Consultation', value: 'existing_consultation' }
        ]
      }
    ]

    setMessages(prev => [...prev, ...botGreetingMessages])
    setBotInitialized(true)
  }

  // Handle bot option selection
  const handleBotOptionSelect = (option) => {
    // Add user's selection to chat
    const userMessage = {
      _id: `user-selection-${Date.now()}`,
      sender: userId,
      receiver: selectedDoctor,
      message: option.text,
      timestamp: new Date(),
      senderName: 'You',
      messageType: 'user'
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentBotFlow(option.value)

    // Simulate bot typing
    setBotTyping(true)
    
    setTimeout(() => {
      setBotTyping(false)
      let botResponse = {}

      switch (option.value) {
        case 'general':
          botResponse = {
            _id: `bot-general-${Date.now()}`,
            sender: 'ai-bot',
            receiver: userId,
            message: 'I can help you with general health questions, medication information, symptoms guidance, and health tips. What would you like to know?',
            timestamp: new Date(),
            senderName: 'AI Assistant',
            messageType: 'bot'
          }
          break
        case 'new_consultation':
          botResponse = {
            _id: `bot-new-consultation-${Date.now()}`,
            sender: 'ai-bot',
            receiver: userId,
            message: 'I can help you book a new consultation with our doctors. Please describe your symptoms or health concerns, and I\'ll guide you to the right specialist.',
            timestamp: new Date(),
            senderName: 'AI Assistant',
            messageType: 'bot'
          }
          break
        case 'existing_consultation':
          botResponse = {
            _id: `bot-existing-consultation-${Date.now()}`,
            sender: 'ai-bot',
            receiver: userId,
            message: 'I can help you with your existing consultations. You can ask about your treatment plan, medication schedules, follow-up appointments, or any questions about your ongoing care.',
            timestamp: new Date(),
            senderName: 'AI Assistant',
            messageType: 'bot'
          }
          break
        default:
          botResponse = {
            _id: `bot-default-${Date.now()}`,
            sender: 'ai-bot',
            receiver: userId,
            message: 'How can I assist you today?',
            timestamp: new Date(),
            senderName: 'AI Assistant',
            messageType: 'bot'
          }
      }

      setMessages(prev => [...prev, botResponse])
    }, 1500)
  }

  // Handle sending message to bot
  const sendBotMessage = (userMessage) => {
    const botMessage = {
      _id: `bot-response-${Date.now()}`,
      sender: 'ai-bot',
      receiver: userId,
      message: getBotResponse(userMessage, currentBotFlow),
      timestamp: new Date(),
      senderName: 'AI Assistant',
      messageType: 'bot'
    }

    setMessages(prev => [...prev, botMessage])
  }

  // Simple bot response logic
  const getBotResponse = (userMessage, flow) => {
    const lowerMessage = userMessage.toLowerCase()
    const doctorName = transformedDoctors.find(d => d.id === selectedDoctor)?.name || 'Doctor'
    
    if (lowerMessage.includes('doctor') || lowerMessage.includes('speak') || lowerMessage.includes('talk')) {
      return `I'll notify Dr. ${doctorName} that you'd like to speak with them. In the meantime, I'm here to help with any questions you might have.`
    }
    
    if (flow === 'general') {
      if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
        return 'For fever, it\'s important to stay hydrated and rest. If your temperature is above 101°F (38.3°C) or persists for more than 3 days, please consult with your doctor.'
      } else if (lowerMessage.includes('headache')) {
        return 'Headaches can have various causes. Try to rest in a quiet, dark room and stay hydrated. If headaches are severe or persistent, I recommend speaking with your doctor.'
      } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
        return 'For medication-related questions, it\'s best to consult with your doctor or pharmacist. They can provide personalized advice based on your medical history.'
      }
    } else if (flow === 'new_consultation') {
      return 'Based on your symptoms, I\'ll help you find the right specialist. Would you like me to help you book an appointment with one of our available doctors?'
    } else if (flow === 'existing_consultation') {
      return 'I can see you have consultations with our doctors. Would you like to review your treatment plan, check medication schedules, or ask about your recent appointments?'
    }
    
    return 'Thank you for your message. For detailed medical advice, I recommend consulting with your doctor. Is there anything specific I can help clarify while you wait?'
  }

  // Connect socket and set up event listeners
  useEffect(() => {
    if (!userId) return

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token: localStorage.getItem("token"),
      },
    })

    socketRef.current.emit("join", {
      userId,
      role: "patient",
      name: localStorage.getItem("patientName") || "Patient",
    })

    socketRef.current.on("onlineUsers", (users) => {
      setOnlineUsers(new Set(users))
    })

    socketRef.current.on("userOnline", (userData) => {
      setOnlineUsers((prev) => new Set([...prev, userData.userId]))
    })

    socketRef.current.on("userOffline", (userData) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userData.userId)
        return newSet
      })

      if (userData.lastSeen) {
        setLastSeen((prev) => ({
          ...prev,
          [userData.userId]: userData.lastSeen,
        }))
      }
    })

    socketRef.current.on("userTyping", ({ userId: typingUserId, isTyping }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev)
        if (isTyping) {
          newSet.add(typingUserId)
        } else {
          newSet.delete(typingUserId)
        }
        return newSet
      })
    })

    // ✅ FIX: Enhanced real-time message handling to prevent duplicates
    socketRef.current.on("receiveMessage", (msg) => {
      const isRelevant =
        (msg.sender === selectedDoctor && msg.receiver === userId) ||
        (msg.receiver === selectedDoctor && msg.sender === userId)

      if (isRelevant) {
        // Add messageType for doctor messages
        const doctorMessage = {
          ...msg,
          messageType: 'doctor'
        }

        setMessages((prev) => {
          // ✅ Better deduplication check including messageId for temporary messages
          const messageExists = prev.some(existingMsg => 
            (existingMsg._id === msg._id && existingMsg._id) || // Check database IDs
            (existingMsg.messageId === msg.messageId && msg.messageId) || // Check temporary IDs
            (existingMsg.messageId && msg._id && existingMsg.messageId.includes('temp') && // Replace temp with real
             existingMsg.sender === msg.sender && 
             existingMsg.receiver === msg.receiver &&
             Math.abs(new Date(existingMsg.timestamp) - new Date(msg.timestamp)) < 5000) // 5 second window
          )

          if (!messageExists) {
            return [...prev, doctorMessage]
          }
          return prev
        })
      }
    })

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server")
    })

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from socket server")
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [userId, selectedDoctor]) // Removed transformedDoctors dependency

  // Fetch appointed doctors
  useEffect(() => {
    if (!userId) return

    const fetchDoctors = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/patient/getAppointedDocs?id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        if (response.data && Array.isArray(response.data)) {
          setAppointedDoctors(response.data)
          if (response.data.length > 0) {
            setSelectedDoctor(response.data[0]._id)
          }
        } else {
          console.error("Invalid response format:", response.data)
          setAppointedDoctors([])
        }
      } catch (error) {
        console.error("Failed to fetch appointed doctors:", error)
        setAppointedDoctors([])
      }
    }

    fetchDoctors()
  }, [userId])

  // Fetch chat history and initialize bot
  useEffect(() => {
    if (!selectedDoctor || !userId) {
      setMessages([])
      setBotInitialized(false)
      return
    }

    const fetchChatHistory = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/chat/${userId}/${selectedDoctor}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        // Add messageType to existing messages
        const messagesWithType = (response.data || []).map(msg => ({
          ...msg,
          messageType: msg.sender === userId ? 'user' : 'doctor'
        }))
        
        setMessages(messagesWithType)
        setBotInitialized(false)
        
        // Initialize bot greeting after a short delay
        setTimeout(() => {
          initializeBotGreeting()
        }, 1000)
        
      } catch (error) {
        console.error("Failed to fetch chat history:", error)
        setMessages([])
        setBotInitialized(false)
        // Still initialize bot greeting even if fetch fails
        setTimeout(() => {
          initializeBotGreeting()
        }, 1000)
      }
    }

    fetchChatHistory()
  }, [selectedDoctor, userId])

  // Handle typing indicator
  const handleTyping = (isTyping) => {
    if (socketRef.current && selectedDoctor) {
      socketRef.current.emit("typing", {
        userId,
        receiverId: selectedDoctor,
        isTyping,
      })
    }
  }

  // Handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value)
    handleTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false)
    }, 1000)
  }

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      alert("File type not supported. Please upload images, PDFs, or documents.")
      return
    }

    setSelectedFile(file)

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadPreview({
          type: 'image',
          url: e.target.result,
          name: file.name,
          size: file.size
        })
      }
      reader.readAsDataURL(file)
    } else {
      setUploadPreview({
        type: 'file',
        name: file.name,
        size: file.size
      })
    }
  }

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file) => {
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem("token")
      const response = await axios.post('http://localhost:5000/api/upload/cloudinary', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // Clear file selection
  const clearFileSelection = () => {
    setSelectedFile(null)
    setUploadPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Transform doctor data with online status
  const transformedDoctors = appointedDoctors.map((doc) => ({
    id: doc._id,
    name: "Consult Homeopathy" ? doc.name.toUpperCase() : "UNKNOWN DOCTOR",
    specialization: doc.specialization || "General Physician",
    time: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A",
    avatar: doc.name ? doc.name.charAt(0).toUpperCase() : "D",
    phone: doc.phone || "",
    email: doc.email || "",
    isOnline: onlineUsers.has(doc._id),
    lastSeen: lastSeen[doc._id],
  }))

  const activeDoctor = transformedDoctors.find((d) => d.id === selectedDoctor)

  // ✅ Enhanced handler for sending message
  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !selectedDoctor) return

    // Check if message is directed to bot (simple detection)
    const isBotMessage = message.toLowerCase().includes('@bot') || 
                        message.toLowerCase().includes('bot') ||
                        currentBotFlow !== 'greeting'

    handleTyping(false)

    try {
      let fileData = null

      // Upload file if selected (only for doctor messages)
      if (selectedFile && !isBotMessage) {
        const uploadResult = await uploadToCloudinary(selectedFile)
        fileData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size
        }
      }

      const messageData = {
        sender: userId,
        receiver: selectedDoctor,
        message: message.trim() || (fileData ? `Sent ${fileData.fileName}` : ''),
        senderName: localStorage.getItem("patientName") || "Patient",
        receiverName: activeDoctor?.name || "",
        timestamp: new Date(),
        messageId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        messageType: 'user',
        ...(fileData && { 
          fileAttachment: fileData,
          messageType: 'file'
        })
      }

      // Add message to local state immediately
      setMessages(prev => [...prev, messageData])

      // If it's a bot message, handle it locally
      if (isBotMessage) {
        setBotTyping(true)
        setTimeout(() => {
          setBotTyping(false)
          sendBotMessage(message.trim())
        }, 1500)
      } else {
        // Send to server for doctor messages
        socketRef.current.emit("sendMessage", messageData)
      }

      // Clear inputs immediately after sending
      setMessage("")
      clearFileSelection()

    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  // Get file size in readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Enhanced file attachment rendering with proper null checks
  const renderFileAttachment = (fileAttachment) => {
    if (!fileAttachment || !fileAttachment.fileName || !fileAttachment.fileSize) return null

    const isImage = fileAttachment.fileType?.startsWith('image/')
    const isPDF = fileAttachment.fileType === 'application/pdf'

    return (
      <div className="mt-2">
        {isImage ? (
          <div className="relative">
            <img 
              src={fileAttachment.url} 
              alt={fileAttachment.fileName}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(fileAttachment.url, '_blank')}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-white bg-opacity-50 rounded-lg border">
            {isPDF ? (
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 18h12V6l-4-4H4v16zm8-12V2l4 4h-4z"/>
              </svg>
            ) : (
              <FileText className="w-4 h-4 text-gray-600" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {fileAttachment.fileName}
              </p>
              <p className="text-xs text-gray-600">
                {formatFileSize(fileAttachment.fileSize)} • {isPDF ? 'PDF Document' : 'Document'}
              </p>
            </div>
            <button
              onClick={() => {
                if (isPDF) {
                  const link = document.createElement('a')
                  link.href = fileAttachment.url
                  link.download = fileAttachment.fileName
                  link.target = '_blank'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                } else {
                  window.open(fileAttachment.url, '_blank')
                }
              }}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    )
  }

  // Render bot option buttons
  const renderBotOptions = (options) => {
    return (
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleBotOptionSelect(option)}
            className="block w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm text-blue-800 transition-colors"
          >
            {option.text}
          </button>
        ))}
      </div>
    )
  }

  // Get status text for doctor
  const getDoctorStatus = (doctor) => {
    if (doctor.isOnline) {
      return "Online"
    } else if (doctor.lastSeen) {
      const lastSeenDate = new Date(doctor.lastSeen)
      const now = new Date()
      const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))

      if (diffMinutes < 1) {
        return "Just now"
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`
      } else if (diffMinutes < 1440) {
        return `${Math.floor(diffMinutes / 60)}h ago`
      } else {
        return `${Math.floor(diffMinutes / 1440)}d ago`
      }
    }
    return "Offline"
  }

  const messagesEndRef = useRef(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Doctor List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Search doctors..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Doctor List */}
        <div className="flex-1 overflow-y-auto">
          {transformedDoctors.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No doctors found</div>
          ) : (
            transformedDoctors.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedDoctor === doc.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                onClick={() => setSelectedDoctor(doc.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {doc.avatar}
                      </div>
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${doc.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900">Consult Homepathy</h3>
                      <span className="text-xs text-gray-500">{doc.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{doc.specialization}</p>
                    <div className="flex items-center gap-1">
                      <Circle className={`w-2 h-2 ${doc.isOnline ? "text-green-500 fill-current" : "text-gray-400"}`} />
                      <span className={`text-xs ${doc.isOnline ? "text-green-600" : "text-gray-500"}`}>
                        {getDoctorStatus(doc)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {activeDoctor ? (
          <>
            {/* Header */}
            <div className="bg-green-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-700">AI Assistant is integrated in this chat</span>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700">Manage</button>
            </div>

            {/* Doctor Profile Section */}
            <div className="bg-white border-b border-gray-200 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {activeDoctor.avatar}
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{activeDoctor.name}</h2>
                  <p className="text-sm text-green-600">Consulting • AI Assistant Available</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.map((msg, index) => (
                <div
                  key={msg._id || msg.messageId || `${msg.sender}-${msg.timestamp}-${index}`}
                  className={`flex gap-3 ${msg.sender === userId ? "justify-end" : "justify-start"}`}
                >
                  {/* Avatar for doctor/bot messages (left side) */}
                  {msg.sender !== userId && (
                    <div className="flex-shrink-0">
                      {msg.messageType === 'bot' || msg.sender === 'ai-bot' ? (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${msg.sender === userId ? "order-first" : ""}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.sender === userId
                          ? "bg-pink-50 border border-pink-200" // Patient messages
                          : msg.messageType === 'bot' || msg.sender === 'ai-bot'
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200" // Bot messages
                            : "bg-white border border-gray-200 shadow-sm" // Doctor messages
                      }`}
                    >
                      {/* Message sender label for clarity */}
                      {msg.sender !== userId && (
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {msg.messageType === 'bot' || msg.sender === 'ai-bot' ? 'AI Assistant' : 'Doctor'}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-900">{msg.message || msg.text}</p>
                      {msg.isOptions && renderBotOptions(msg.options)}
                      {msg.messageType !== 'bot' && msg.sender !== 'ai-bot' && renderFileAttachment(msg.fileAttachment)}
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${msg.sender === userId ? "text-right" : "text-left"}`}>
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : ""}
                    </p>
                  </div>

                  {/* Avatar for patient messages (right side) */}
                  {msg.sender === userId && (
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      P
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicators */}
              {/* Bot typing indicator */}
              {botTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="max-w-xs lg:max-w-md">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">AI Assistant</p>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor typing indicator */}
              {typingUsers.has(selectedDoctor) && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="max-w-xs lg:max-w-md">
                    <div className="bg-white border border-gray-200 shadow-sm p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Doctor</p>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* WhatsApp-style file preview above input */}
            {uploadPreview && (
              <div className="bg-white border-t border-gray-200 px-4 py-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {uploadPreview.type === 'image' ? (
                      <img 
                        src={uploadPreview.url} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{uploadPreview.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{formatFileSize(uploadPreview.size)}</p>
                    <p className="text-xs text-blue-600 mt-1">Ready to send</p>
                  </div>
                  <button
                    onClick={clearFileSelection}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-md flex-shrink-0"
                  disabled={isUploading}
                >
                  <Paperclip className={`w-4 h-4 ${isUploading ? 'text-gray-300' : 'text-gray-400'}`} />
                </button>
                <input
                  placeholder={isUploading ? "Uploading..." : "Type your message to doctor or bot..."}
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  onBlur={() => handleTyping(false)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUploading}
                />
                <button 
                  onClick={handleSendMessage} 
                  className={`p-2 rounded-md flex-shrink-0 ${isUploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  disabled={isUploading}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Helper text */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                Messages are sent to the doctor. Bot responds automatically to help with health queries.
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
            <div className="text-center">
              <p className="text-lg mb-2">Select a doctor to start messaging</p>
              <p className="text-sm">Choose a doctor from the left panel to begin your consultation with AI assistance</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messenger