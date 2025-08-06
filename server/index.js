const express = require("express");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const twilio = require("twilio");
const { Server } = require("socket.io");
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

// Load environment variables first
require("dotenv").config();

// ✅ CLOUDINARY CONFIGURATION
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ MULTER CONFIGURATION FOR FILE UPLOADS
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
    }
  }
});

// Models
const Message = require("./models/messageModel");
const patientModel = require("./models/patientModel");
const Appointment = require("./models/appointmentModel");

// Database connection
const dbConnection = require("./configs/dbConnection");
dbConnection();

// Routes imports
const otpRoute = require("./routes/otpRoutes");
const patientRoute = require("./routes/patientRoutes");
const doctorRoute = require("./routes/doctorRoutes");
const validateToken = require("./middlewares/validateTokenHandler");
const assignTasks = require("./routes/AssignTasksRoute");
const chatRoutes = require("./routes/chatRoutes");
const callLog = require("./routes/CallLogRoutes");
const formRoutes = require("./routes/formRoute");
const postRoute = require("./routes/postRoutes.js");
const leaveRoutes = require("./routes/leaveRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const workHoursRoutes = require("./routes/workHoursRoute.js");
const salaryRoutes = require("./routes/payrollRoutes.js");
const salaryStructure = require("./routes/SalaryStructureRoutes.js");
const shiftRoutes = require("./routes/shiftRoutes.js");
const attendance = require("./routes/attendanceRoute.js");
const videoCallRoutes = require("./routes/VideoCallRoutes");
const workshopRoutes = require("./routes/workshopRoutes.js");
const prescriptionRoute = require("./routes/prescription.js");
const medicineRoute = require("./routes/medicineRoute.js");
const rawMaterialRoute = require("./routes/rawMaterialRoute.js");
const vendorRoutes = require("./routes/VendorRoutes.js");
const orderRoutes = require("./routes/OrderRoute.js");
const medPrepSummary = require("./routes/medPrepSummary.js");
const paymentRoutes = require("./routes/paymentRoutes");
const { analyzePatientMessage, triggerActionFromIntent, conversationalFallback } = require("./services/groqservice");


// Initialize Express app
const app = express();
app.set("trust proxy", 1);

// Create HTTP server
const server = http.createServer(app);

// ✅ Initialize Socket.IO with enhanced configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// ✅ Enhanced user presence tracking
const connectedUsers = new Map(); // userId -> { socketId, role, name, lastSeen }
const typingUsers = new Map(); // userId -> { receiverId, timeout }

// ✅ Helper functions for user presence
const broadcastOnlineUsers = () => {
  const onlineUserIds = Array.from(connectedUsers.keys());
  io.emit('onlineUsers', onlineUserIds);
};

const notifyUserOnline = (userId, userData) => {
  io.emit('userOnline', { userId, ...userData });
};

const notifyUserOffline = (userId, lastSeen) => {
  io.emit('userOffline', { userId, lastSeen });
};

const clearUserTyping = (userId) => {
  if (typingUsers.has(userId)) {
    const typingData = typingUsers.get(userId);
    clearTimeout(typingData.timeout);
    typingUsers.delete(userId);
    
    // Notify receiver that user stopped typing
    const receiverSocket = connectedUsers.get(typingData.receiverId);
    if (receiverSocket) {
      io.to(`user_${typingData.receiverId}`).emit('userTyping', {
        userId,
        isTyping: false
      });
    }
  }
};

const sendBotReply = (io, patientId, text) => {
  // Try to find the patient's socket
  const receiverSocket = connectedUsers.get(patientId);

  if (receiverSocket) {
    io.to(`user_${patientId}`).emit('receiveMessage', {
      sender: 'ai_bot',               // virtual sender ID
      senderName: 'AI Assistant',     // display name for UI
      receiver: patientId,
      message: text,
      timestamp: new Date(),
      messageType: 'text'
    });

    console.log(`🤖 Bot reply sent to patient ${patientId}`);
  } else {
    console.warn(`⚠️ Patient ${patientId} is offline. Bot reply not delivered.`);
  }
};



// ✅ Enhanced Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining with enhanced presence tracking
  socket.on('join', ({ userId, role, name }) => {
    console.log(`${role} ${userId} (${name || 'Unknown'}) joined`);
    
    // Store user data with enhanced info
    const userData = {
      socketId: socket.id,
      role,
      name: name || 'Unknown',
      lastSeen: new Date(),
      connectedAt: new Date()
    };
    
    connectedUsers.set(userId, userData);
    socket.join(`user_${userId}`);
    socket.userId = userId; // Store userId on socket for cleanup
    
    // Notify all users about new online user
    notifyUserOnline(userId, userData);
    
    // Send current online users to the newly connected user
    broadcastOnlineUsers();
    
    console.log(`Total connected users: ${connectedUsers.size}`);
  });

  

// ✅ Enhanced sendMessage handler with Groq LLM intent analysis
socket.on('sendMessage', async (messageData) => {
  try {
    console.log('Message received:', messageData);

    // Clear typing indicator for sender
    clearUserTyping(messageData.sender);

    // Prepare message data for database
    const messageDoc = {
      sender: messageData.sender,
      receiver: messageData.receiver,
      message: messageData.message || (messageData.fileAttachment ? `Sent ${messageData.fileAttachment.fileName}` : ''),
      senderName: messageData.senderName,
      receiverName: messageData.receiverName,
      timestamp: new Date()
    };

    // Add file attachment if present
    if (messageData.fileAttachment) {
      messageDoc.fileAttachment = messageData.fileAttachment;
      messageDoc.messageType = 'file';
    }

    // Save message to database
    const newMessage = new Message(messageDoc);
    await newMessage.save();

    // Prepare message for broadcasting
    const messageToSend = {
      _id: newMessage._id,
      sender: messageData.sender,
      receiver: messageData.receiver,
      message: newMessage.message,
      senderName: messageData.senderName,
      receiverName: messageData.receiverName,
      timestamp: newMessage.timestamp,
      messageType: newMessage.messageType || 'text'
    };

    // Include file attachment if present
    if (newMessage.fileAttachment) {
      messageToSend.fileAttachment = newMessage.fileAttachment;
    }

    // Send to receiver if online
    const receiverSocket = connectedUsers.get(messageData.receiver);
    if (receiverSocket) {
      io.to(`user_${messageData.receiver}`).emit('receiveMessage', messageToSend);
      console.log(`Message delivered to online user: ${messageData.receiver}`);
    } else {
      console.log(`User ${messageData.receiver} is offline - message saved for later`);
    }

    // Send to sender's other devices/sessions
    io.to(`user_${messageData.sender}`).emit('receiveMessage', messageToSend);

    // Confirm to sender
    socket.emit('messageSent', {
      success: true,
      messageId: newMessage._id,
      timestamp: newMessage.timestamp
    });

    // ✅ Run Groq LLM intent analysis only if sender is a patient
    if (messageData) {
      try {
        console.log('🧠 Running Groq intent analysis for patient message:', messageData.message);
        const analysis = await analyzePatientMessage(messageData.message);
        console.log('📊 Groq analysis result:', analysis);

        // Trigger intent-based action
        const actionDone = await triggerActionFromIntent(analysis, messageData, io);

        // Fallback if no action was triggered
        if (!actionDone) {
          console.log('💬 No specific action triggered, sending fallback bot reply.');
          const fallbackReply = await conversationalFallback(messageData.message);
          sendBotReply(io, messageData.sender, fallbackReply);
        }
      } catch (intentErr) {
        console.error("❌ Groq intent analysis error:", intentErr);
        // Always respond, even if Groq fails
        sendBotReply(io, messageData.sender, "I'm here to help! Could you tell me more about your concern?");
      }
    }

  } catch (error) {
    console.error('Error saving message:', error);
    socket.emit('messageError', { 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});
  // Handle typing indicators
  socket.on('typing', ({ userId, receiverId, isTyping }) => {
    console.log(`${userId} is ${isTyping ? 'typing' : 'stopped typing'} to ${receiverId}`);
    
    if (isTyping) {
      // Clear existing timeout
      clearUserTyping(userId);
      
      // Set new typing timeout
      const timeout = setTimeout(() => {
        clearUserTyping(userId);
      }, 3000); // Auto-clear after 3 seconds
      
      typingUsers.set(userId, { receiverId, timeout });
      
      // Notify receiver
      const receiverSocket = connectedUsers.get(receiverId);
      if (receiverSocket) {
        io.to(`user_${receiverId}`).emit('userTyping', {
          userId,
          isTyping: true
        });
      }
    } else {
      clearUserTyping(userId);
    }
  });

  // Handle user status requests
  socket.on('getUserStatus', (targetUserId, callback) => {
    const user = connectedUsers.get(targetUserId);
    if (user) {
      callback({
        isOnline: true,
        lastSeen: user.lastSeen,
        role: user.role
      });
    } else {
      callback({
        isOnline: false,
        lastSeen: null,
        role: null
      });
    }
  });

  // Handle heartbeat/ping for connection monitoring
  socket.on('ping', () => {
    socket.emit('pong');
    
    // Update last seen time
    if (socket.userId && connectedUsers.has(socket.userId)) {
      const userData = connectedUsers.get(socket.userId);
      userData.lastSeen = new Date();
      connectedUsers.set(socket.userId, userData);
    }
  });

  // Handle manual disconnect
  socket.on('disconnect-user', () => {
    handleUserDisconnect(socket);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
    handleUserDisconnect(socket);
  });

  // Enhanced disconnect handler
  function handleUserDisconnect(socket) {
    if (socket.userId) {
      const userData = connectedUsers.get(socket.userId);
      
      if (userData) {
        const lastSeen = new Date();
        
        // Clear any typing indicators
        clearUserTyping(socket.userId);
        
        // Remove from connected users
        connectedUsers.delete(socket.userId);
        
        // Notify all users about user going offline
        notifyUserOffline(socket.userId, lastSeen);
        
        // Broadcast updated online users list
        broadcastOnlineUsers();
        
        console.log(`${userData.role} ${socket.userId} (${userData.name}) disconnected. Total connected: ${connectedUsers.size}`);
      }
    }
  }

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// ✅ Periodic cleanup for stale connections
setInterval(() => {
  const now = new Date();
  const staleThreshold = 5 * 60 * 1000; // 5 minutes
  
  for (const [userId, userData] of connectedUsers.entries()) {
    if (now - userData.lastSeen > staleThreshold) {
      console.log(`Cleaning up stale connection for user: ${userId}`);
      connectedUsers.delete(userId);
      notifyUserOffline(userId, userData.lastSeen);
      broadcastOnlineUsers();
    }
  }
}, 60000); // Run every minute

// ✅ MIDDLEWARE CONFIGURATION
app.use(helmet({
  contentSecurityPolicy: false // Disable for Socket.IO
}));

// CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for Socket.IO
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json());
app.use(morgan('combined'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ CLOUDINARY FILE UPLOAD ENDPOINT
app.post("/api/upload/cloudinary", validateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Determine resource type based on file type
    const resourceType = req.file.mimetype.startsWith('image/') ? 'image' : 'raw';
    
    // Generate a unique filename
    const timestamp = Date.now();
    const originalName = req.file.originalname.split('.')[0];
    const publicId = `chat_files/${timestamp}_${originalName}`;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          public_id: publicId,
          folder: 'chat_attachments',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    console.log('File uploaded successfully to Cloudinary:', uploadResult.secure_url);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      original_filename: req.file.originalname
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message
    });
  }
});

// ✅ DELETE FILE FROM CLOUDINARY
app.delete("/api/upload/cloudinary/:publicId", validateToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: "File deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "File not found or already deleted"
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: "File deletion failed",
      error: error.message
    });
  }
});

// ✅ API ROUTES
app.use("/api/otp", otpRoute);
app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/post", postRoute);
app.use("/api/log", callLog);
app.use("/api/forms", formRoutes);
app.use("/api/assign", assignTasks);
app.use("/api", chatRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/work-hours", workHoursRoutes);
app.use("/api/payslip", salaryRoutes);
app.use("/api/salary", salaryStructure);
app.use("/api/shift", shiftRoutes);
app.use("/api/attendance", attendance);
app.use("/api/video-call", videoCallRoutes);
app.use("/api/workshop", workshopRoutes);
app.use("/api/prescription", prescriptionRoute);
app.use("/api/medicines", medicineRoute);
app.use("/api/inventory", rawMaterialRoute);
app.use("/api/vendor", vendorRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/medicine-summary", medPrepSummary);
app.use("/api/payments", paymentRoutes);

// ✅ TWILIO CONFIGURATION
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// ✅ Enhanced CHAT API ENDPOINTS with file support
app.get("/api/chat/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Enhanced user status endpoints
app.get("/api/users/online", (req, res) => {
  const onlineUsers = Array.from(connectedUsers.entries()).map(([userId, userData]) => ({
    userId,
    role: userData.role,
    name: userData.name,
    connectedAt: userData.connectedAt,
    lastSeen: userData.lastSeen
  }));
  
  res.json({
    success: true,
    count: onlineUsers.length,
    users: onlineUsers
  });
});

app.get("/api/users/:userId/status", (req, res) => {
  const { userId } = req.params;
  const userData = connectedUsers.get(userId);
  
  if (userData) {
    res.json({
      success: true,
      isOnline: true,
      lastSeen: userData.lastSeen,
      role: userData.role,
      name: userData.name
    });
  } else {
    res.json({
      success: true,
      isOnline: false,
      lastSeen: null,
      role: null,
      name: null
    });
  }
});

// ✅ Send message endpoint with presence awareness
app.post("/api/chat/send", async (req, res) => {
  try {
    const { sender, receiver, message, senderName, receiverName } = req.body;

    const newMessage = new Message({
      sender,
      receiver,
      message,
      senderName,
      receiverName,
      timestamp: new Date()
    });

    const savedMessage = await newMessage.save();

    // Check if receiver is online
    const receiverSocket = connectedUsers.get(receiver);
    const isReceiverOnline = !!receiverSocket;

    if (receiverSocket) {
      io.to(`user_${receiver}`).emit('receiveMessage', {
        _id: savedMessage._id,
        sender,
        receiver,
        message,
        senderName,
        receiverName,
        timestamp: savedMessage.timestamp
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: savedMessage,
      receiverOnline: isReceiverOnline
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message
    });
  }
});

// ✅ OTHER ENDPOINTS (keeping existing functionality)
let currentId = 0;

app.get("/api/generate-employee-id", (req, res) => {
  currentId += 1;
  const customId = `EMP-${String(currentId).padStart(5, "0")}`;
  res.json({ success: true, employeeID: customId });
});

app.get("/api/example", (req, res) => {
  res.json({ message: "Hello, the API is working!" });
});

app.get("/Tarun", (req, res) => {
  return res.status(200).json({ message: "Endpoint reached" });
});

app.post("/api/validate-token", validateToken, (req, res) => {
  console.log("Token is valid");
  res.status(200).json({
    success: true,
    message: "Token is valid",
    user: req.user,
  });
});

// ✅ TWILIO ENDPOINTS (keeping existing functionality)
app.post("/twiml", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.record({
    action: "/recording-status",
    recordingStatusCallback: "/recording-status",
  });
  twiml.dial().number(req.query.to);
  res.type("text/xml");
  res.send(twiml.toString());
});

app.post("/recording-status", (req, res) => {
  const recordingUrl = req.body.RecordingUrl;
  const recordingSid = req.body.RecordingSid;
  console.log(`New recording available: ${recordingUrl}`);
  res.sendStatus(200);
});

app.get("/api/recordings/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const calls = await client.calls.list({ to: phone, limit: 20 });
    const recordingsPromises = calls.map((call) =>
      client.recordings.list({ callSid: call.sid })
    );
    const recordingsArrays = await Promise.all(recordingsPromises);
    const recordings = recordingsArrays.flat().map((recording) => ({
      sid: recording.sid,
      duration: recording.duration,
      dateCreated: recording.dateCreated,
      url: `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings/${recording.sid}`,
      callSid: recording.callSid,
    }));
    res.json(recordings);
  } catch (error) {
    console.error("Error fetching recordings:", error);
    res.status(500).json({ error: "Failed to fetch recordings" });
  }
});

app.post("/make-call", (req, res) => {
  const { to } = req.body;
  const twimlUrl = `${process.env.NGROK_URL}/twiml?to=${encodeURIComponent(to)}`;
  
  client.calls
    .create({
      url: twimlUrl,
      to: "+916382786758",
      from: process.env.TWILIO_PHONE_NUMBER,
      record: true,
      recordingStatusCallback: "/recording-status",
    })
    .then((call) => res.status(200).send(call.sid))
    .catch((error) => res.status(500).send(error));
});

app.post("/generateToken", (req, res) => {
  const { sdkKey, sdkSecret, meetingNumber, role } = req.body;
  const payload = {
    sdkKey,
    mn: meetingNumber,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  const token = jwt.sign(payload, sdkSecret, { algorithm: "HS256" });
  res.json({ token: token });
});

// ✅ CRON JOBS
cron.schedule("* * * * *", async () => {
  try {
    const expiredDrafts = await Appointment.find({
      status: "draft",
      expiresAt: { $lt: new Date() },
    });

    if (expiredDrafts.length > 0) {
      console.log(`Deleting ${expiredDrafts.length} expired draft appointments...`);
      await Appointment.deleteMany({
        _id: { $in: expiredDrafts.map((appt) => appt._id) },
      });
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

// ✅ Enhanced error handling for file uploads
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: error.message
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
});

// ✅ ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io server ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 CORS enabled for all origins`);
});

// ✅ GRACEFUL SHUTDOWN
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  // Notify all connected users about server shutdown
  io.emit('serverShutdown', { message: 'Server is shutting down for maintenance' });
  
  // Close all socket connections
  io.close(() => {
    console.log('Socket.io server closed');
    
    server.close(() => {
      console.log('HTTP server closed');
      console.log('Process terminated');
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  
  // Notify all connected users
  io.emit('serverShutdown', { message: 'Server is shutting down' });
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };