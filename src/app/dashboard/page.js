"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { getRecommendationProduct } from "../store/actions/Product/index";
import { getChatHistory, handleUserQuery } from "../store/actions/Chat/index";
import io from "socket.io-client";
import UserChatHistory from "./userChatHistory";
import { useRouter } from "next/navigation";

export default function SnapiDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { recommendationData, recommendationLoading, recommendationError } =
    useSelector((state) => state.GET_RECOMMENDATION);
  const { history, historyLoading, historyError } = useSelector(
    (state) => state.CHAT_HISTORY
  );
  const { responseData, queryLoading, queryError } = useSelector(
    (state) => state.USER_QUERY
  );
  const [myQuery, setMyQuery] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const [recordingAnalyser, setRecordingAnalyser] = useState(null);
  const [recordingDataArray, setRecordingDataArray] = useState(null);
  const [addingAesthetic, setAddingAesthetic] = useState(false);
  const [addingMemory, setAddingMemory] = useState(null);
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newAestheticInput, setNewAestheticInput] = useState("");
  const [newMemoryInput, setNewMemoryInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Jane Doe",
    location: "West Chester, Ohio",
    aestheticTypes: ["Urban Edge", "Minimalist Chic", "Bohemian"],
    memory: {
      "Fitness & sports": ["Nike", "Addidas", "Lacoste"],
      "Bedding & Furniture": ["IKEA", "Amazon"],
      Apparel: ["Calvin Cline", "H&M", "Zara", "Something", "Something"],
    },
  });
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState([]);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const recordingAnimationRef = useRef(null);
  const [sessionId, setSessionId] = useState("");
  const [base64Image, setBase64Image] = useState(null);

  useEffect(() => {
    dispatch(getRecommendationProduct());
  }, []);

  useEffect(() => {
    dispatch(getChatHistory());
  }, []);

  useEffect(() => {
    if (isPlaying && analyser && dataArray) {
      const animate = () => {
        analyser.getByteFrequencyData(dataArray);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser, dataArray]);

  useEffect(() => {
    if (isRecording && recordingAnalyser && recordingDataArray) {
      const animate = () => {
        recordingAnalyser.getByteFrequencyData(recordingDataArray);
        recordingAnimationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else if (recordingAnimationRef.current) {
      cancelAnimationFrame(recordingAnimationRef.current);
    }

    return () => {
      if (recordingAnimationRef.current) {
        cancelAnimationFrame(recordingAnimationRef.current);
      }
    };
  }, [isRecording, recordingAnalyser, recordingDataArray]);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result; // ✅ this is base64
        console.log("Base64 Image:", base64String);
        setBase64Image(base64String);
        // if you want to keep in state
        setSelectedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      if (recordingAnimationRef.current) {
        cancelAnimationFrame(recordingAnimationRef.current);
      }
      setRecordingAnalyser(null);
      setRecordingDataArray(null);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const analyserNode = ctx.createAnalyser();
        const source = ctx.createMediaStreamSource(stream);

        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArr = new Uint8Array(bufferLength);

        source.connect(analyserNode);

        setRecordingAnalyser(analyserNode);
        setRecordingDataArray(dataArr);

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioBlob(audioBlob);
          setAudioUrl(audioUrl);
          stream.getTracks().forEach((track) => track.stop());
          ctx.close();
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Could not access microphone. Please check permissions.");
      }
    }
  };

  const sendImageResponse = () => {
    try {
      let payload = {
        message: myQuery,
        userId: localStorage.getItem("userId"),
        sessionId: sessionId,
        imageBase64: base64Image,
      };

      const userMessage = {
        id: Date.now(),
        type: "user",
        image: base64Image,
        content: myQuery,
      };
      setResponses((prev) => [...prev, userMessage]);
      socket.emit("image-query", payload, (ack) => {
        console.log("✅ Ack from server:", ack);
      });
      setBase64Image(null);
      setMyQuery("");
      setSelectedImage(null);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleMessageSend = () => {
    if (!socket || !myQuery.trim()) return;
    if (base64Image) {
      sendImageResponse();
      return;
    }
    const payload = JSON.stringify({
      message: myQuery,
      userId: localStorage.getItem("userId"),
      sessionId: sessionId,
    });
    let payload_one = {
      message: myQuery,
      userId: localStorage.getItem("userId"),
      sessionId: sessionId,
    };
    const userMessage = {
      id: Date.now(),
      type: "user",
      image: base64Image,
      content: myQuery,
    };

    setResponses((prev) => [...prev, userMessage]);

    dispatch(handleUserQuery(payload));

    console.log("📤 Sending:", payload);

    socket.emit("user-query", payload_one, (ack) => {
      console.log("✅ Ack from server:", ack);
    });

    setMyQuery("");
  };

  const handleMessageSendFromProp = (v) => {
    if (!socket || !v.trim()) return;

    const payload = JSON.stringify({
      message: v,
      userId: localStorage.getItem("userId"),
      sessionId: sessionId,
    });

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: v,
    };

    setResponses((prev) => [...prev, userMessage]);

    dispatch(handleUserQuery(payload));

    console.log("📤 Sending:", payload);

    socket.emit("user-query", payload, (ack) => {
      console.log("✅ Ack from server:", ack);
    });

    setMyQuery("");
  };

  const playRecording = async () => {
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Create audio context for visualization
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const analyserNode = ctx.createAnalyser();
        const source = ctx.createMediaElementSource(audio);

        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArr = new Uint8Array(bufferLength);

        source.connect(analyserNode);
        analyserNode.connect(ctx.destination);

        setAudioContext(ctx);
        setAnalyser(analyserNode);
        setDataArray(dataArr);

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          ctx.close();
        };
        audio.onpause = () => setIsPlaying(false);

        await audio.play();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  };

  const ListeningIndicator = () => {
    if (!recordingDataArray) {
      return (
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full animate-pulse"
              style={{
                height: `${12 + Math.sin(Date.now() * 0.01 + i) * 8}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
          <span className="text-red-400 text-sm ml-2">Listening...</span>
        </div>
      );
    }

    // Real-time bars when analyser is available
    const bars = Array.from(recordingDataArray.slice(0, 8)).map((value, i) => (
      <div
        key={i}
        className="w-1.5 bg-red-400 rounded-full transition-all duration-75"
        style={{ height: `${Math.max(4, (value / 255) * 32)}px` }}
      />
    ));

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-1 h-8">{bars}</div>
        <span className="text-red-400 text-sm ml-2">
          Listening to your voice...
        </span>
      </div>
    );
  };

  const AudioEqualizer = () => {
    if (!dataArray) return null;

    const bars = Array.from(dataArray.slice(0, 12)).map((value, i) => (
      <div
        key={i}
        className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
        style={{ height: `${Math.max(4, (value / 255) * 24)}px` }}
      />
    ));

    return <div className="flex items-end gap-1 h-6">{bars}</div>;
  };

  const recommendations = [
    {
      id: 1,
      name: "Running shoes",
      description: "short description...",
      price: "99.99 USD",
      image: "/running-shoes-on-track.png",
    },
    {
      id: 2,
      name: "Running shoes",
      description: "short description...",
      price: "89.99 USD",
      image: "/white-running-sneakers.png",
    },
    {
      id: 3,
      name: "Chair",
      description: "short description...",
      price: "99.99 USD",
      image: "/placeholder-cs1lj.png",
    },
    {
      id: 4,
      name: "Television",
      description: "short description...",
      price: "99.99 USD",
      image: "/placeholder-cs1lj.png",
    },
    {
      id: 5,
      name: "Watch",
      description: "short description...",
      price: "199.99 USD",
      image: "/luxury-wristwatch.png",
    },
  ];

  const smartCollections = [
    "Luxury watches",
    "Trending this week",
    "Under 50$",
    "Camping essentials",
  ];

  const recentConversations = [
    "Show all recent conversations",
    "Airpods under 200$",
    "Shoe price comparison",
    "Skincare Routine",
  ];

  const missions = ["Home decor", "Study setup", "Camping essentials"];

  const removeAestheticType = (type) => {
    setProfileData((prev) => ({
      ...prev,
      aestheticTypes: prev.aestheticTypes.filter((t) => t !== type),
    }));
  };

  const removeMemoryItem = (category, item) => {
    setProfileData((prev) => ({
      ...prev,
      memory: {
        ...prev.memory,
        [category]: prev.memory[category].filter((i) => i !== item),
      },
    }));
  };

  const addAestheticType = () => {
    if (newAestheticInput.trim()) {
      setProfileData((prev) => ({
        ...prev,
        aestheticTypes: [...prev.aestheticTypes, newAestheticInput.trim()],
      }));
      setNewAestheticInput("");
      setAddingAesthetic(false);
    }
  };

  const addMemoryItem = (category) => {
    if (newMemoryInput.trim()) {
      setProfileData((prev) => ({
        ...prev,
        memory: {
          ...prev.memory,
          [category]: [...prev.memory[category], newMemoryInput.trim()],
        },
      }));
      setNewMemoryInput("");
      setAddingMemory(null);
    }
  };

  const addNewCategory = () => {
    if (newCategoryInput.trim()) {
      setProfileData((prev) => ({
        ...prev,
        memory: {
          ...prev.memory,
          [newCategoryInput.trim()]: [],
        },
      }));
      setNewCategoryInput("");
      setAddingNewCategory(false);
    }
  };

  // helper to build a bot message
  const buildBotMessage = (data) => {
    const apiRes = data.response || {};
    let botMessage = { id: Date.now(), type: "bot", content: null };

    // Case 1: Clarification
    if (data.needsClarification && data.clarificationQuestion) {
      botMessage.content = data.clarificationQuestion;
      botMessage.suggestions = data.suggestions || [];
    }

    // Case 2: Visual matches (products)
    if (apiRes.visual_matches && Array.isArray(apiRes.visual_matches)) {
      botMessage.results = apiRes.visual_matches.map((item, idx) => ({
        product_id: item.product_id || item.position || idx,
        title: item.title,
        price: item.price?.value || item.price?.extracted_value || "N/A",
        thumbnail: item.thumbnail || item.image,
        link: item.link,
        source: item.source,
      }));
    }

    // Case 3: fallback text
    if (!botMessage.content && !botMessage.results) {
      botMessage.content = data.message || "Here are some results.";
    }

    return botMessage;
  };

  {
    /* Profile Popup Overlay */
  }
  useEffect(() => {
    const newSocket = io("ws://54.173.124.156:3002/shopping", {
      query: { userId: localStorage.getItem("userId") },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("image-query-response", (data) => {
      console.log("📩 Incoming event (raw):", JSON.stringify(data, null, 2));

      const apiRes = data.response || {};
      console.log("🔎 apiRes keys:", Object.keys(apiRes));

      const botMessage = buildBotMessage(data);

      console.log("🟢 Bot message mapped:", botMessage);

      if (botMessage.content || botMessage.suggestions || botMessage.results) {
        setResponses((prev) => [...prev, botMessage]);
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    newSocket.on("exception", (err) => {
      console.error("❌ Server exception:", err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 👇 whenever responseData changes, push it as a new bot message
  useEffect(() => {
    if (!responseData) return;

    // API gives {response: {...}}, unwrap it
    const apiRes = responseData.response || responseData;

    console.log("🔥 Raw responseData:", responseData.sessionId);
    console.log("🟡 apiRes extracted:", apiRes);

    let botMessage = { id: Date.now(), type: "bot", content: null };

    // Case 1: Clarification
    if (responseData.needsClarification && responseData.clarificationQuestion) {
      botMessage.content = responseData.clarificationQuestion;
      botMessage.suggestions = responseData.suggestions || [];
    }

    // Case 2: Shopping results
    if (apiRes.shopping_results && Array.isArray(apiRes.shopping_results)) {
      botMessage.results = apiRes.shopping_results.map((item) => ({
        product_id: item.product_id || item.position,
        title: item.title,
        price: item.price ? `${item.price}` : item.price || "N/A",
        thumbnail: item.thumbnail,
      }));
      // router.push("/chat/" + responseData.sessionId);
    }

    // Case 3: fallback text
    if (!botMessage.content && !botMessage.results && apiRes.message) {
      botMessage.content = apiRes.message;
    }

    // Push only if something exists
    if (botMessage.content || botMessage.suggestions || botMessage.results) {
      setResponses((prev) => [...prev, botMessage]);
    }

    console.log("🟢 Bot message mapped:", botMessage);
  }, [responseData]);

  return (
    <div
      className="min-h-screen  relative"
      style={{
        background: `#111827`,
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-slate-800 transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-white italic">Snapi</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2 mb-8">
            <a
              href="#"
              className="flex items-center gap-3 text-white hover:text-cyan-300 py-3 px-2 rounded-lg hover:bg-slate-700/50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-lg">Home</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 text-white hover:text-cyan-300 py-3 px-2 rounded-lg hover:bg-slate-700/50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-3m-10 11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span className="text-lg">Missions</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 text-white hover:text-cyan-300 py-3 px-2 rounded-lg hover:bg-slate-700/50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-3m-10 11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span className="text-lg">New Chat</span>
            </a>
            <a
              href="/snapilist"
              className="flex items-center gap-3 text-white hover:text-cyan-300 py-3 px-2 rounded-lg hover:bg-slate-700/50"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-lg">Snapi list</span>
            </a>
          </nav>

          <div className="flex-1 overflow-hidden">
            <h3 className="text-slate-400 text-sm font-medium mb-4 px-2">
              Chats
            </h3>
            <div className="space-y-1 overflow-y-auto h-full pb-20">
              {history.map((chat, index) => (
                <a
                  key={index}
                  href="#"
                  className="block text-slate-300 hover:text-white hover:bg-slate-700/50 py-3 px-2 rounded-lg text-sm transition-colors truncate"
                >
                  {chat.mainPrompt}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-3xl font-serif text-white italic">Snapi</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-white hover:text-gray-300">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z"
                />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-400 overflow-hidden">
              <button
                onClick={() => setProfileOpen(true)}
                className="w-10 h-10 rounded-full bg-gray-400 overflow-hidden hover:ring-2 hover:ring-cyan-400 transition-all"
              >
                <img
                  src="/user-profile-avatar.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>

        {selectedImage && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Selected Image</h4>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setBase64Image(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Selected"
              className="max-w-xs max-h-48 rounded-lg"
            />
          </div>
        )}

        {audioUrl && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h4 className="text-white font-medium">Audio Recording</h4>
                {isPlaying && <AudioEqualizer />}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={playRecording}
                  disabled={isPlaying}
                  className={`px-3 py-1 ${
                    isPlaying
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700"
                  } text-white rounded-lg text-sm`}
                >
                  {isPlaying ? "Playing..." : "Play"}
                </button>
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                    }
                    if (audioContext) {
                      audioContext.close();
                    }
                    setAudioUrl(null);
                    setAudioBlob(null);
                    setIsPlaying(false);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-red-500/50">
            <ListeningIndicator />
          </div>
        )}

        <div className="mb-100">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-sans text-white font-medium mb-2">
              Good Morning !
            </h2>
            <p className="text-slate-300 font-sans text-lg mb-4">
              I'm your personal shopping buddy. Let's explore the way of life
              together
            </p>
            <p className="text-slate-300 font-sans text-lg">
              Tell me what you're looking for ? I'll fetch the best picks for
              you!
            </p>
          </div>

          {/* Snapi Recommendations */}
          <div className="mb-8">
            <h3 className="text-2xl font-sans text-white font-medium mb-6">
              Snapi Recommendations
            </h3>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {recommendationData.map((item) => (
                <div
                  key={item.product_id}
                  className="flex-shrink-0 w-72 bg-slate-700/50 rounded-xl p-4 border border-slate-600/50"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-600">
                      <img
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">
                        {item.title}
                      </h4>
                      {/* <p className="text-slate-400 text-sm mb-2">
                      {item.description}
                    </p> */}
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-400 font-medium">
                          {item.price}
                        </span>
                        <button className="text-yellow-400 hover:text-yellow-300">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Collections */}
          <div className="mb-8">
            <h3 className="text-2xl font-sans text-white font-medium mb-6">
              Smart Collections
            </h3>
            <div className="flex flex-wrap gap-4">
              {smartCollections.map((collection, index) => (
                <Button
                  key={index}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-sans"
                >
                  {collection}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="mb-8">
            <h3 className="text-2xl font-sans text-white font-medium mb-6">
              Recent Conversations
            </h3>
            <div className="flex flex-wrap gap-4">
              {recentConversations.map((conversation, index) => (
                <Button
                  key={index}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-sans"
                >
                  {conversation}
                </Button>
              ))}
            </div>
          </div>

          {/* My Missions */}
          <div className="mb-8">
            <h3 className="text-2xl font-sans text-white font-medium mb-6">
              My Missions
            </h3>
            <div className="flex flex-wrap gap-4">
              {missions.map((mission, index) => (
                <Button
                  key={index}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-sans"
                >
                  {mission}
                </Button>
              ))}
            </div>
          </div>
          {/* Chat History */}

          <UserChatHistory
            response={responses}
            handleMessageSend={handleMessageSendFromProp}
            setMyQuery={setMyQuery}
          />
        </div>

        {/* Bottom Input Area */}
        <div className="fixed bottom-6 left-6 right-6">
          <div className="max-w-4xl mx-auto">
            {isRecording && (
              <div className="mb-4 p-4 bg-slate-700/80 backdrop-blur-sm rounded-xl border border-red-500/50">
                <ListeningIndicator />
              </div>
            )}

            {audioUrl && (
              <div className="mb-4 p-4 bg-slate-700/80 backdrop-blur-sm rounded-xl border border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h4 className="text-white font-medium">Audio Recording</h4>
                    {isPlaying && <AudioEqualizer />}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={playRecording}
                      disabled={isPlaying}
                      className={`px-3 py-1 ${
                        isPlaying
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-cyan-600 hover:bg-cyan-700"
                      } text-white rounded-lg text-sm`}
                    >
                      {isPlaying ? "Playing..." : "Play"}
                    </button>
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current = null;
                        }
                        if (audioContext) {
                          audioContext.close();
                        }
                        setAudioUrl(null);
                        setAudioBlob(null);
                        setIsPlaying(false);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-700/80 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50">
              {selectedImage && (
                <div className="mb-4 p-3 bg-slate-600/50 rounded-lg border border-slate-500/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">
                      Selected Image
                    </span>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected"
                    className="max-w-32 max-h-24 rounded-md"
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Ask anything ..."
                  className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
                  onChange={(e) => setMyQuery(e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCameraClick}
                    className="text-white hover:text-gray-300"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleMicClick}
                    className={`${
                      isRecording ? "text-red-400" : "text-white"
                    } hover:text-gray-300`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </button>
                  <button
                    className="text-white hover:text-gray-300"
                    onClick={handleMessageSend}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {profileOpen && (
        <div className="fixed inset-0 bg-black- bg-opacity-60 z-60 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Profile Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-600">
                    <img
                      src="/user-profile-avatar.png"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">
                      {profileData.name}
                    </h2>
                    <p className="text-slate-400">{profileData.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-8">
              {/* Preferred Aesthetic Types */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Preferred Aesthetic Types
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profileData.aestheticTypes.map((type, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-full"
                    >
                      <span className="text-white">{type}</span>
                      <button
                        onClick={() => removeAestheticType(type)}
                        className="text-slate-400 hover:text-white"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {addingAesthetic ? (
                    <div className="flex items-center gap-2 bg-slate-600 px-4 py-2 rounded-full">
                      <input
                        type="text"
                        value={newAestheticInput}
                        onChange={(e) => setNewAestheticInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && addAestheticType()
                        }
                        placeholder="Enter aesthetic type"
                        className="bg-transparent text-white placeholder-slate-300 outline-none text-sm w-32"
                        autoFocus
                      />
                      <button
                        onClick={addAestheticType}
                        className="text-green-400 hover:text-green-300"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setAddingAesthetic(false);
                          setNewAestheticInput("");
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingAesthetic(true)}
                      className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-full text-white"
                    >
                      <span>Add More</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Snapi AI Memory */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Snapi AI Memory
                  </h3>
                </div>

                <div className="space-y-6">
                  {Object.entries(profileData.memory).map(
                    ([category, items]) => (
                      <div key={category}>
                        <h4 className="text-lg font-medium text-white mb-3">
                          {category}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-full"
                            >
                              <span className="text-white">{item}</span>
                              <button
                                onClick={() => removeMemoryItem(category, item)}
                                className="text-slate-400 hover:text-white"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}

                          {addingMemory === category ? (
                            <div className="flex items-center gap-2 bg-slate-600 px-4 py-2 rounded-full">
                              <input
                                type="text"
                                value={newMemoryInput}
                                onChange={(e) =>
                                  setNewMemoryInput(e.target.value)
                                }
                                onKeyPress={(e) =>
                                  e.key === "Enter" && addMemoryItem(category)
                                }
                                placeholder="Enter brand/item"
                                className="bg-transparent text-white placeholder-slate-300 outline-none text-sm w-32"
                                autoFocus
                              />
                              <button
                                onClick={() => addMemoryItem(category)}
                                className="text-green-400 hover:text-green-300"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setAddingMemory(null);
                                  setNewMemoryInput("");
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingMemory(category)}
                              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-full text-white"
                            >
                              <span>Add More</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Add More to Memory */}
                <div className="mt-8 pt-6 border-t border-slate-700">
                  {addingNewCategory ? (
                    <div className="flex items-center gap-4 bg-slate-700 p-4 rounded-xl">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && addNewCategory()
                        }
                        placeholder="Enter new category name"
                        className="flex-1 bg-slate-600 text-white placeholder-slate-300 outline-none px-4 py-2 rounded-lg"
                        autoFocus
                      />
                      <button
                        onClick={addNewCategory}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddingNewCategory(false);
                          setNewCategoryInput("");
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingNewCategory(true)}
                      className="w-full flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 py-4 rounded-xl text-white font-medium"
                    >
                      <span>Add More to Memory</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
