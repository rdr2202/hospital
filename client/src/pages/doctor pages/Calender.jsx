import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";

const CalendarEmbed = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [calendarEmbedLink, setCalendarEmbedLink] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

const CLIENT_ID = "167368098853-dsfqf6639dj4vh37u4mb1g7ocjco3181.apps.googleusercontent.com"; // Update this
const API_KEY = "AIzaSyDziOUEp7O1JGpEBxo_I7gLhB0ORRc0wR8";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events";

useEffect(() => {
  const loadGapiScript = () => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google API script loaded.");
      initClient();
    };
    document.body.appendChild(script);
  };

  const initClient = async () => {
    try {
      setIsLoading(true);
      console.log("Initializing Google API client...");

      await new Promise((resolve) => gapi.load("client:auth2", resolve));

      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
      });

      console.log("Google API initialized.");

      const authInstance = gapi.auth2.getAuthInstance();
      setIsSignedIn(authInstance.isSignedIn.get());

      authInstance.isSignedIn.listen((signedIn) => {
        setIsSignedIn(signedIn);
        if (!signedIn) {
          setCalendarEmbedLink("");
        }
      });
    } catch (error) {
      console.error("Error initializing GAPI client:", error);
      setError("Failed to initialize Google Calendar. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (CLIENT_ID && API_KEY) {
    loadGapiScript();
  } else {
    setError("Missing Google Calendar credentials. Please check your configuration.");
  }

  return () => {
    const script = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
    if (script) {
      document.body.removeChild(script);
    }
  };
}, []);


// useEffect(() => {
//   // Load the Google API script manually
//   const loadGapiScript = () => {
//     const script = document.createElement("script");
//     script.src = "https://apis.google.com/js/api.js";
//     script.async = true;
//     script.defer = true;
//     script.onload = initClient;
//     document.body.appendChild(script);
//   };

//   const initClient = async () => {
//     try {
//       setIsLoading(true);
//       await new Promise((resolve) => gapi.load("client:auth2", resolve));
      
//       await gapi.client.init({
//         apiKey: API_KEY,
//         clientId: CLIENT_ID,
//         scope: SCOPES,
//         discoveryDocs: [
//           "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
//         ],
//         cookiepolicy: 'single_host_origin',
//       });

//       const authInstance = gapi.auth2.getAuthInstance();
//       setIsSignedIn(authInstance.isSignedIn.get());
//       authInstance.isSignedIn.listen((signedIn) => {
//         setIsSignedIn(signedIn);
//         if (!signedIn) {
//           setCalendarEmbedLink("");
//         }
//       });
//     } catch (error) {
//       console.error("Error initializing GAPI client:", error);
//       setError("Failed to initialize Google Calendar. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (CLIENT_ID && API_KEY) {
//     loadGapiScript();
//   } else {
//     setError("Missing Google Calendar credentials. Please check your environment configuration.");
//   }

//   return () => {
//     // Cleanup script on unmount
//     const script = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
//     if (script) {
//       document.body.removeChild(script);
//     }
//   };
// }, []);

const signIn = async () => {
  try {
    console.log("sign is called");
    
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
      console.error("Google Auth instance is not initialized.");
      return;
    }

    await authInstance.signIn();
    console.log("User signed in:", authInstance.isSignedIn.get());

    if (authInstance.isSignedIn.get()) {
      console.log("if is is called");
      loadUserCalendar();
    }

    // await gapi.auth2.getAuthInstance().signIn();
    // if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    //   console.log("if is  is called");
    //   loadUserCalendar();
    // }


  } catch (error) {
    console.error("Error during sign-in:", error);
    alert("Failed to sign in. Please try again.");
  }
};

const signOut = () => {
  gapi.auth2.getAuthInstance().signOut();
  setCalendarEmbedLink("");
};

const loadUserCalendar = () => {
  console.log("load calendar function called");
  
  gapi.client.calendar.calendarList
    .list()
    .then((response) => {
      const primaryCalendar = response.result.items.find(
        (calendar) => calendar.primary
      );
      if (primaryCalendar) {
        const calendarId = primaryCalendar.id;
        const embedLink = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
          calendarId
        )}&ctz=Asia/Kolkata`;
        setCalendarEmbedLink(embedLink);
      }
    })
    .catch((error) => console.error("Error loading calendar:", error));
};

console.log(calendarEmbedLink);


return (
  <div className="flex flex-col items-center p-6">
    <h1 className="text-2xl font-bold mb-4">Google Calendar</h1>
    {isSignedIn ? (
      <button
        onClick={signOut}
        className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
      >
        Sign Out
      </button>
    ) : (
      <button
        onClick={signIn}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Sign In with Google
      </button>
    )}
    {calendarEmbedLink ? (
      <iframe
        src={calendarEmbedLink}
        style={{ border: 0 }}
        width="100%"
        height="600"
        frameBorder="0"
        scrolling="no"
        title="Google Calendar"
        className="shadow-lg rounded-lg"
      ></iframe>
    ) : (
      <p className="text-gray-600">Sign in to view your calendar.</p>
    )}
  </div>
);
};

export default CalendarEmbed;
