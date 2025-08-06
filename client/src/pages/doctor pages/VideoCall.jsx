import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import config from '../../config';
const API_URL = config.API_URL;

const VideoCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [meetLink, setMeetLink] = useState("");
  const [appointmentID, setAppointmentID] = useState("");
  const [notes, setNotes] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [notesWindow, setNotesWindow] = useState(null);
  const lastSavedNotes = useRef("");
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (location.state?.meetLink && location.state?.appointmentID) {
      setMeetLink(location.state.meetLink);
      setAppointmentID(location.state.appointmentID);
      
      // Load any previously saved notes for this appointment
      const savedNotes = localStorage.getItem(`notes_${location.state.appointmentID}`);
      if (savedNotes) {
        setNotes(savedNotes);
        lastSavedNotes.current = savedNotes;
      }
    }
  }, [location.state]);

  // A simplified approach to save notes
  useEffect(() => {
    if (!appointmentID || notes === lastSavedNotes.current) return;
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout - only save after user stops typing for 2 seconds
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(`notes_${appointmentID}`, notes);
      lastSavedNotes.current = notes;
      setSaveStatus("Saved");
      
      // Clear status after 2 seconds
      setTimeout(() => {
        setSaveStatus("");
      }, 2000);
    }, 2000);
    
    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, appointmentID]);

  // Handle communication with the notes window
  useEffect(() => {
    if (!notesWindow || notesWindow.closed) return;

    // Function to receive messages from the notes window
    const handleMessageFromNotesWindow = (event) => {
      // Make sure the message is from our notes window
      if (event.source !== notesWindow) return;
      
      const { type, payload } = event.data;
      
      if (type === 'NOTES_UPDATED') {
        setNotes(payload);
      } else if (type === 'NOTES_SUBMITTED') {
        handleSubmitNotes();
      } else if (type === 'NOTES_WINDOW_CLOSED') {
        setNotesWindow(null);
      }
    };

    window.addEventListener('message', handleMessageFromNotesWindow);
    
    // Send initial data to the notes window
    notesWindow.postMessage({
      type: 'INIT_NOTES',
      payload: {
        appointmentID,
        notes,
        saveStatus
      }
    }, '*');
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessageFromNotesWindow);
    };
  }, [notesWindow, notes, appointmentID, saveStatus]);

  // Send updates to the notes window when relevant state changes
  useEffect(() => {
    if (!notesWindow || notesWindow.closed) return;
    
    notesWindow.postMessage({
      type: 'UPDATE_NOTES_STATE',
      payload: {
        notes,
        saveStatus,
        isSaving
      }
    }, '*');
  }, [notes, saveStatus, isSaving, notesWindow]);

  const handleJoinCall = () => {
    if (meetLink) {
      // Open Zoom meeting in a new tab
      window.open(meetLink, '_blank');
      setIsCallActive(true);
      
      // Open notes in a separate window
      setTimeout(() => {
        openNotesWindow();
      }, 1000);
    }
  };

  const openNotesWindow = () => {
    // Define features for the new window
    const windowFeatures = 'width=400,height=500,resizable=yes,scrollbars=yes,status=yes';
    
    // Create HTML for the notes window
    const notesHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Patient Notes - Appointment ${appointmentID}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body, html { height: 100%; margin: 0; overflow: hidden; }
          #notes-container { display: flex; flex-direction: column; height: 100%; }
          #notes-area { flex: 1; resize: none; padding: 12px; border: none; outline: none; }
          #voice-btn.recording { background-color: red !important; }
        </style>
      </head>
      <body>
        <div id="notes-container">
          <div class="bg-blue-600 text-white p-3 flex justify-between items-center">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              <h3 class="font-medium">Patient Notes</h3>
            </div>
            <div class="flex items-center">
              <span id="save-status" class="text-xs text-white italic mr-3"></span>
            </div>
          </div>
          
          <textarea 
            id="notes-area" 
            placeholder="Enter your clinical notes here or use voice typing..."
          ></textarea>

          <!-- Voice Typing Button -->
          <div class="flex justify-center p-3">
            <button id="voice-btn" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18v3m-4-3a4 4 0 118 0m-8 0h8"></path>
              </svg>
              Start Voice Typing
            </button>
          </div>
          
          <div class="bg-gray-100 p-3 flex justify-between">
            <span class="text-xs text-gray-500">Notes are saved automatically</span>
            <button 
              id="submit-btn"
              class="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Submit Notes
            </button>
          </div>
        </div>
        
        <script>
          const notesArea = document.getElementById('notes-area');
          const saveStatus = document.getElementById('save-status');
          const submitBtn = document.getElementById('submit-btn');
          const voiceBtn = document.getElementById('voice-btn');
          let appointmentID = "";
          let recognition;
          let isRecording = false;
          let finalTranscript = '';
          let interimTranscript = '';
          let cursorPosition = 0;

          // Check if browser supports Speech Recognition
          if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onstart = () => {
              // Save cursor position when starting voice typing
              cursorPosition = notesArea.selectionStart;
            };

            recognition.onresult = (event) => {
              interimTranscript = '';
              finalTranscript = '';
              
              // Process all results
              for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                  finalTranscript += transcript;
                } else {
                  interimTranscript += transcript;
                }
              }
              
              // Only insert the final transcript when it's ready
              if (finalTranscript) {
                // Get the text before and after the cursor
                const beforeCursor = notesArea.value.substring(0, cursorPosition);
                const afterCursor = notesArea.value.substring(cursorPosition);
                
                // Insert the final transcript at the cursor position with a space if needed
                const space = (beforeCursor.length > 0 && !beforeCursor.endsWith(' ')) ? ' ' : '';
                notesArea.value = beforeCursor + space + finalTranscript + afterCursor;
                
                // Update cursor position
                cursorPosition = beforeCursor.length + space.length + finalTranscript.length;
                notesArea.selectionStart = cursorPosition;
                notesArea.selectionEnd = cursorPosition;
                
                // Send updated text to parent
                sendNotesUpdate();
                
                // Reset the final transcript
                finalTranscript = '';
              }
            };

            recognition.onend = () => {
              if (isRecording) {
                // Restart if we're still supposed to be recording
                recognition.start();
              }
            };

            recognition.onerror = (event) => {
              console.error("Speech recognition error:", event);
              stopVoiceRecognition();
            };
          } else {
            voiceBtn.disabled = true;
            voiceBtn.textContent = "Voice Typing Not Supported";
            voiceBtn.classList.add("bg-gray-400");
          }

          // Start/Stop Voice Typing
          voiceBtn.addEventListener('click', function () {
            if (isRecording) {
              stopVoiceRecognition();
            } else {
              startVoiceRecognition();
            }
          });

          function startVoiceRecognition() {
            recognition.start();
            isRecording = true;
            voiceBtn.textContent = "Stop Voice Typing";
            voiceBtn.classList.add("recording");
          }

          function stopVoiceRecognition() {
            recognition.stop();
            isRecording = false;
            voiceBtn.textContent = "Start Voice Typing";
            voiceBtn.classList.remove("recording");
          }

          // Listen for messages from the parent window
          window.addEventListener('message', function(event) {
            const { type, payload } = event.data;
            
            if (type === 'INIT_NOTES') {
              appointmentID = payload.appointmentID;
              notesArea.value = payload.notes;
              saveStatus.textContent = payload.saveStatus;
              // Set cursor position to end of text
              cursorPosition = notesArea.value.length;
              notesArea.selectionStart = cursorPosition;
              notesArea.selectionEnd = cursorPosition;
            } else if (type === 'UPDATE_NOTES_STATE') {
              saveStatus.textContent = payload.saveStatus;
              submitBtn.disabled = payload.isSaving;
              submitBtn.classList.toggle('bg-gray-400', payload.isSaving);
              submitBtn.classList.toggle('bg-green-600', !payload.isSaving);
            }
          });

          // Update cursor position on click or key movement
          notesArea.addEventListener('click', function() {
            cursorPosition = notesArea.selectionStart;
          });
          
          notesArea.addEventListener('keyup', function() {
            cursorPosition = notesArea.selectionStart;
          });

          // Send updates to parent window when notes change
          notesArea.addEventListener('input', sendNotesUpdate);
          
          function sendNotesUpdate() {
            window.opener.postMessage({
              type: 'NOTES_UPDATED',
              payload: notesArea.value
            }, '*');
          }

          // Submit notes
          submitBtn.addEventListener('click', function() {
            if (!notesArea.value.trim()) {
              alert("Please add some notes before submitting.");
              return;
            }

            window.opener.postMessage({
              type: 'NOTES_SUBMITTED',
              payload: notesArea.value
            }, '*');
          });

          // Handle window close
          window.addEventListener('beforeunload', function() {
            window.opener.postMessage({
              type: 'NOTES_WINDOW_CLOSED'
            }, '*');
          });
        </script>
      </body>
      </html>
    `;
    
    // Open a new window with the notes HTML
    const newWindow = window.open('', '_blank', windowFeatures);
    
    if (newWindow) {
      newWindow.document.write(notesHtml);
      newWindow.document.close();
      setNotesWindow(newWindow);
    } else {
      alert("Please allow pop-ups for this application to use the notes feature.");
    }
  };

  const handleSubmitNotes = async () => {
    if (!notes.trim()) {
      alert("Please add some notes before submitting.");
      return;
    }
    
    setIsSaving(true);
    setSaveStatus("Submitting...");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not authenticated. Please log in.");
        navigate("/login");
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/api/doctor/notes`,
        { appointmentID, notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success) {
        setSaveStatus("Notes submitted successfully!");
        
        // Notify the notes window if it exists
        if (notesWindow && !notesWindow.closed) {
          notesWindow.postMessage({
            type: 'NOTES_SUBMITTED_SUCCESS'
          }, '*');
        }
        
        setTimeout(() => {
          localStorage.removeItem(`notes_${appointmentID}`);
          
          // Close the notes window if it's still open
          if (notesWindow && !notesWindow.closed) {
            notesWindow.close();
          }
          
          navigate("/doctor-dashboard", { 
            state: { message: "Notes submitted successfully!" } 
          });
        }, 1500);
      } else {
        setSaveStatus("Failed to submit notes");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    } catch (error) {
      console.error("Error submitting notes:", error);
      setSaveStatus("Error submitting notes");
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndCall = () => {
    if (confirm("Are you sure you want to end the call? Please make sure to save your notes.")) {
      // Close the notes window if it's open
      if (notesWindow && !notesWindow.closed) {
        notesWindow.close();
      }
      
      setIsCallActive(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      {!isCallActive ? (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
              Telemedicine Session
            </h2>
            
            {meetLink ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    Session Information
                  </h3>
                  <p className="text-gray-700">
                    <span className="font-medium">Patient ID:</span> {appointmentID}
                  </p>
                </div>
                
                <button 
                  onClick={handleJoinCall}
                  className="w-full py-4 px-6 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md"
                >
                  Start Telemedicine Session
                </button>
                
                <p className="text-sm text-gray-500 text-center">
                  The meeting will open in a new tab, and a notes window will appear separately
                </p>
              </div>
            ) : (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <p className="font-medium">No meeting link found!</p>
                <p className="text-sm mt-1">
                  Please return to the appointments page and try again.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Active call view with control panel only
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-100">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Telemedicine Session in Progress
            </h2>
            
            <div className="flex flex-col space-y-4">
              <p className="text-center text-gray-600">
                Meeting is currently running in a separate tab
              </p>
              
              {notesWindow ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                  <p className="text-green-700">Notes window is open</p>
                </div>
              ) : (
                <button 
                  onClick={openNotesWindow}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Open Notes Window
                </button>
              )}
              
              <button 
                onClick={handleSubmitNotes}
                disabled={isSaving || !notes.trim()}
                className={`w-full py-3 px-4 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${
                  isSaving || !notes.trim() 
                    ? "bg-gray-400 cursor-not-allowed text-gray-200" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                Submit Notes
              </button>
              
              <button 
                onClick={handleEndCall}
                className="w-full py-3 px-4 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                End Session
              </button>
              
              {saveStatus && (
                <p className="text-sm text-center text-gray-500 italic">
                  {saveStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;