"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Menu,
  Camera,
  Mic,
  Send,
  Heart,
  Play,
  Pause,
  X,
  StopCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { getSessionDetail } from "../../store/actions/Chat";
export default function Page({ params }) {
  const { id } = params;
  const dispatch = useDispatch();
  const { sessionDetail, loadingSessionDetail, errorSessionDetail } =
    useSelector((state) => state.CHAT_SESSION_DETAIL);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState([]);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    console.log("[v0] Component mounted successfully");
  }, []);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result;
        setSelectedImage(base64);
        console.log(
          "[v0] Image converted to base64:",
          base64.substring(0, 50) + "..."
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      console.log("[v0] Recording started");
    } catch (error) {
      console.error("[v0] Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      console.log("[v0] Recording stopped");
    }
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const getSessionData = () => {
    dispatch(getSessionDetail(id));
  };

  useEffect(() => {
    getSessionData();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 👇 whenever responseData changes, push it as a new bot message
  useEffect(() => {
    if (!sessionDetail) return;

    // API gives {response: {...}}, unwrap it
    const apiRes = sessionDetail.response || sessionDetail;

    console.log("🔥 Raw responseData:", sessionDetail.sessionId);
    console.log("🟡 apiRes extracted:", apiRes);

    let botMessage = { id: Date.now(), type: "bot", content: null };

    // Case 1: Clarification
    if (
      sessionDetail.needsClarification &&
      sessionDetail.clarificationQuestion
    ) {
      botMessage.content = sessionDetail.clarificationQuestion;
      botMessage.suggestions = sessionDetail.suggestions || [];
    }

    // Case 2: Shopping results
    if (apiRes.shopping_results && Array.isArray(apiRes.shopping_results)) {
      botMessage.results = apiRes.shopping_results.map((item) => ({
        product_id: item.product_id || item.position,
        title: item.title,
        price: item.price ? `${item.price}` : item.price || "N/A",
        thumbnail: item.thumbnail,
      }));
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
  }, [sessionDetail]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6" />
          <h1 className="text-xl font-semibold italic">Snapi</h1>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <Avatar className="w-8 h-8">
            <AvatarImage src="/user-profile-illustration.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Left Sidebar - Chat Interface */}
        <div className="w-full lg:w-1/3 bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col max-h-96 lg:max-h-none">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* User Message */}

            <div className="flex justify-end">
              <div className="bg-slate-700 rounded-lg px-4 py-2 max-w-xs">
                <p className="text-sm">
                  I want to buy a pair of shoes under 100$
                </p>
              </div>
            </div>

            {/* AI Response */}
            <div className="space-y-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                Here are some stylish and highly rated shoes under $100 USD that
                balance quality, comfort, and value—perfect if you're looking to
                buy online within a budget
              </p>

              {/* Featured Picks Section */}
              <div className="space-y-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <span className="text-green-400">✓</span> Featured Picks
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-white font-medium">
                      • Puma Speed cat OG (about ~$90 USD)
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1">
                      A sleek, slim-profile sneaker with retro racing roots.
                      Celebrated for its understated minimalism and style that
                      complements nearly any casual outfit. Often priced well
                      below $100 depending on color and retailer.
                    </p>
                  </div>

                  <div>
                    <p className="text-white font-medium">
                      • Adidas Superstar II (approx ~$80 USD)
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1">
                      Timeless shell-toe silhouette, loved across decades for
                      its versatility and pop culture credentials. Easily styled
                      with a wide range of looks.
                    </p>
                  </div>

                  <div>
                    <p className="text-white font-medium">
                      • New Balance Fresh Foam 680v8
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1">
                      continues to get rave reviews for comfort and support,
                      often under $80 USD
                    </p>
                  </div>

                  <div>
                    <p className="text-white font-medium">
                      • Allswift FlyLife Athletic Sneakers (~$27 USD):
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1">
                      Nurse-approved, springy and breathable daily-wear sneakers
                      that resemble higher-end brands
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white mt-4">
                  Suggest 2 best options
                </Button>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                Here are 2 of the best shoe options under $100 that strike a
                great balance between style, comfort, and versatility.
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-slate-700">
            {/* Recording indicator */}
            {isRecording && (
              <div className="mb-2 flex items-center justify-center gap-2 text-red-400 text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                Recording... {formatTime(recordingTime)}
              </div>
            )}

            {selectedImage && (
              <div className="mb-3">
                <div className="bg-slate-700 rounded-lg p-2 inline-block relative">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected"
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {audioBlob && (
              <div className="mb-3">
                <div className="bg-slate-700 rounded-lg px-4 py-2 inline-block">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={isPlaying ? pauseAudio : playAudio}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <div className="w-20 h-1 bg-slate-600 rounded-full">
                      <div className="h-full bg-blue-400 rounded-full w-0"></div>
                    </div>
                    <span className="text-xs text-gray-400">0:00</span>
                    <button
                      onClick={() => setAudioBlob(null)}
                      className="text-red-400 hover:text-red-300 transition-colors ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything ..."
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 pr-32"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* Camera button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Voice recording button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`transition-colors ${
                    isRecording
                      ? "text-red-400 hover:text-red-300"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isRecording ? (
                    <StopCircle className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                <button className="text-gray-400 hover:text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Hidden audio element */}
            <audio ref={audioRef} className="hidden" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6">
            Shoes under 100$
          </h2>

          {/* First Row of Shoes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <ShoeCard
              image="/brown-running-shoes.png"
              title="Running shoes"
              description="short description..."
              price="99.99 USD"
              bgColor="bg-gradient-to-br from-orange-400 to-orange-600"
            />
            <ShoeCard
              image="/purple-running-shoes.png"
              title="Running shoes"
              description="short description..."
              price="89.99 USD"
              bgColor="bg-gradient-to-br from-purple-400 to-purple-600"
            />
            <ShoeCard
              image="/white-and-black-running-shoes.png"
              title="Running shoes"
              description="short description..."
              price="89.99 USD"
              bgColor="bg-gradient-to-br from-gray-100 to-gray-300"
              textColor="text-black"
            />
            <ShoeCard
              image="/green-and-black-running-shoes.png"
              title="Running shoes"
              description="short description..."
              price="89.99 USD"
              bgColor="bg-gradient-to-br from-teal-400 to-teal-600"
            />
          </div>

          {/* Top Two Picks Section */}
          <h3 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
            Top Two Picks !
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <ShoeCard
              image="/brown-running-shoes.png"
              title="Running shoes"
              description="short description..."
              price="89.99 USD"
              bgColor="bg-gradient-to-br from-orange-400 to-orange-600"
            />
            <ShoeCard
              image="/white-and-black-running-shoes.png"
              title="Running shoes"
              description="short description..."
              price="89.99 USD"
              bgColor="bg-gradient-to-br from-gray-100 to-gray-300"
              textColor="text-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoeCard({
  image,
  title,
  description,
  price,
  bgColor,
  textColor = "text-white",
}) {
  return (
    <div
      className={`${bgColor} rounded-lg p-3 lg:p-4 relative group cursor-pointer transition-transform hover:scale-105`}
    >
      <div className="aspect-square mb-2 lg:mb-3 flex items-center justify-center">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-16 lg:w-20 h-16 lg:h-20 object-contain"
        />
      </div>
      <h4 className={`font-medium mb-1 text-sm lg:text-base ${textColor}`}>
        {title}
      </h4>
      <p className={`text-xs lg:text-sm opacity-80 mb-2 lg:mb-3 ${textColor}`}>
        {description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-blue-400 font-semibold text-xs lg:text-sm">
          {price}
        </span>
        <Heart
          className={`w-4 lg:w-5 h-4 lg:h-5 ${
            textColor === "text-black" ? "text-gray-600" : "text-white"
          } opacity-70 hover:opacity-100 transition-opacity`}
        />
      </div>
    </div>
  );
}
