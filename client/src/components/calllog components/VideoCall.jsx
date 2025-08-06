import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import axios from "axios"; // Import Axios
// import '../css/WorkTable.css';
import config from "../../config";
const API_URL = config.API_URL;
const VideoCall = () => {
    const { patientId } = useParams();
    const meetingRef = useRef(null);
    const [draft, setDraft] = useState(""); // State to manage the draft text

    useEffect(() => {
        const myMeeting = async (element) => {
            const appID = 909999327;
            const serverSecret = "93f3b67ec1b69b2022c023ed58556cfd"; // Store securely
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID, 
                serverSecret, 
                patientId, 
                Date.now().toString(),
                "12345" // User ID
            );

            const zp = ZegoUIKitPrebuilt.create(kitToken);
            zp.joinRoom({
                container: element,
                sharedLinks: [
                    {
                        name: "Copy Link",
                        url: window.location.href,
                    },
                ],
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showScreenSharingButton: false,
            })
            .then(() => {
                console.log("Joined room successfully");
            })
            .catch((error) => {
                console.error("Failed to join the room:", error);
            });

            // Listen for the end of the call
            zp.on('roomEnded', async () => {
                await saveNote();
            });
        };

        if (meetingRef.current) {
            myMeeting(meetingRef.current);
        }
    }, [patientId]);

    // Function to handle text area change
    const handleDraftChange = (event) => {
        setDraft(event.target.value);
    };

    // Function to save the note to the database
    const saveNote = async () => {
        window.alert("saving");
        try {
            await axios.post(`${API_URL}/api/notes`, {
                patientId,
                content: draft,
            });
            console.log("Note saved successfully.");
            setDraft(""); // Clear the draft after saving
        } catch (error) {
            console.error("Failed to save note:", error);
        }
    };

    return (
        <div className="video-call-container">
            <div ref={meetingRef} className="meeting" />
            <div className="draft-container">
                <textarea
                    className="draft-textarea"
                    value={draft}
                    onChange={handleDraftChange}
                    placeholder="Write your notes here..."
                />
                <button onClick={saveNote}>Submit</button>
            </div>
        </div>
    );
};

export default VideoCall;