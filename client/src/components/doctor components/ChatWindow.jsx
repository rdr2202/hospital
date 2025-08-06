import { useEffect, useState } from "react"

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      role: "patient",
      text: "Hi doctor, I have a question regarding my prescription.",
      time: "10:05 AM"
    },
    {
      role: "doctor",
      text: "Sure, go ahead.",
      time: "10:06 AM"
    },
    {
      role: "patient",
      text: "Can I take it before breakfast?",
      time: "10:07 AM",
      attachment: "prescription.pdf",
      label: "Important"
    },
    {
      role: "doctor",
      text: "Yes, that's fine.",
      time: "10:08 AM"
    }
  ]);

  const labelStyles = {
    Important: "bg-red-100 text-red-600",
    Info: "bg-blue-100 text-blue-600",
    Note: "bg-yellow-100 text-yellow-700"
  };

  return (
    <>
      <section className="flex flex-col flex-1 bg-white rounded-xl my-4 mr-6 ml-0">
        <header className="flex justify-between items-start py-4 px-6 border-b border-gray-200">
          <div>
            <span className="text-lg font-semibold mr-2">Tharun S</span>
            <span className="bg-[#ffe5b4] text-[#7c4a03] px-2 py-0.5 rounded text-xs mr-3 align-middle">
              Pending
            </span>
            <span className="text-xs text-gray-500">Last reply 30 mins ago</span>
          </div>
          <div>
            <button className="bg-gray-100 text-[#3a5d7d] font-semibold px-4 py-2 rounded ml-2">
              Call
            </button>
            <button className="bg-gray-100 text-[#3a5d7d] font-semibold px-4 py-2 rounded ml-2">
              View
            </button>
          </div>
        </header>

        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-5 max-w-[65%] flex flex-col ${msg.role === "doctor" ? "self-end" : "self-start"
                }`}
            >
              <div
                className={`p-4 rounded-lg ${msg.role === "doctor"
                    ? "bg-[#fbeffa]"
                    : "bg-[#f8eaea]"
                  }`}
              >
                <span className="block">{msg.text}</span>
                {msg.attachment && (
                  <div className="mt-2 flex items-center bg-[#ffe] px-2 py-1 rounded text-sm">
                    <span className="mr-1">📎</span>
                    {msg.attachment}
                  </div>
                )}
                {msg.label && (
                  <span
                    className={`ml-2 inline-block px-2 py-0.5 rounded text-xs mt-2 ${labelStyles[msg.label]}`}
                  >
                    {msg.label}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-1">{msg.time}</span>
            </div>
          ))}

          <div className="flex justify-between items-center bg-[#fffbe7] border border-[#f5ddb5] text-[#a78007] rounded p-4 mt-6">
            <span>Patient waiting for reply – 30 minutes ago</span>
            <button className="bg-[#fff7cd] text-[#9b7b13] px-4 py-2 rounded ml-4">
              Reply Now
            </button>
          </div>
        </div>

        <footer className="border-t border-gray-200 px-6 py-4 flex">
          <input
            placeholder="Type a message..."
            className="flex-1 rounded-lg px-4 py-2 bg-[#f7f7fa] border-none mr-2 outline-none"
          />
          <button className="bg-[#4b8eda] text-white text-xl rounded-lg px-5 py-2">
            &#8594;
          </button>
        </footer>
      </section>
    </>
  );
};

export default ChatWindow;