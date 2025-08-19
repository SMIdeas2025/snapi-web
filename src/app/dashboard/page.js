"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";

export default function SnapiDashboard() {
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

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const recordingAnimationRef = useRef(null);

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
        setSelectedImage(e.target?.result);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 relative">
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
        <div className="p-6">
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

          <nav className="space-y-4">
            <a href="#" className="block text-white hover:text-cyan-300 py-2">
              Home
            </a>
            <a href="#" className="block text-white hover:text-cyan-300 py-2">
              Recommendations
            </a>
            <a href="#" className="block text-white hover:text-cyan-300 py-2">
              Collections
            </a>
            <a href="#" className="block text-white hover:text-cyan-300 py-2">
              Conversations
            </a>
            <a href="#" className="block text-white hover:text-cyan-300 py-2">
              Missions
            </a>
            <a href="#" className="block text-white hover:text-cyan-300 py-2">
              Settings
            </a>
          </nav>
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
              <img
                src="/user-profile-avatar.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {selectedImage && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Selected Image</h4>
              <button
                onClick={() => setSelectedImage(null)}
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
            Tell me what you're looking for ? I'll fetch the best picks for you!
          </p>
        </div>

        {/* Snapi Recommendations */}
        <div className="mb-8">
          <h3 className="text-2xl font-sans text-white font-medium mb-6">
            Snapi Recommendations
          </h3>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-72 bg-slate-700/50 rounded-xl p-4 border border-slate-600/50"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-600">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{item.name}</h4>
                    <p className="text-slate-400 text-sm mb-2">
                      {item.description}
                    </p>
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
    </div>
  );
}
