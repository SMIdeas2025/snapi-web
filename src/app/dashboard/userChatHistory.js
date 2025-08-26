import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export default function UserChatHistory({
  response,
  handleMessageSend,
  setMyQuery,
}) {
  const { queryLoading, queryError } = useSelector((state) => state.USER_QUERY);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response, queryLoading]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {response.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-lg shadow ${
                msg.type === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              }`}
            >
              {/* Message text */}
              {msg.content && <p className="mb-2">{msg.content}</p>}

              {/* Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2 w-[100%] bg-transparent flex space-x-2 overflow-x-auto scrollbar-hide">
                  {msg.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        // alert(s);
                        // setMyQuery(s);
                        handleMessageSend(s);
                      }}
                      className="px-3 py-1 text-sm border border-white text-white rounded-full hover:bg-blue-500 transition whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Product results */}
              {msg.results &&
                Array.isArray(msg.results) &&
                msg.results.length > 0 && (
                  <div className="flex gap-6 overflow-x-auto pb-4 mt-3">
                    {msg.results.map((item, i) => (
                      <div
                        key={item.product_id || i}
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
                )}
            </div>
          </div>
        ))}

        {/* Thinking animation */}
        {queryLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg shadow">
              <span className="text-white text-sm">Thinking</span>
              <div className="flex space-x-1">
                <span className="w-1 h-4 bg-blue-400 animate-bounce"></span>
                <span className="w-1 h-4 bg-blue-400 animate-bounce delay-150"></span>
                <span className="w-1 h-4 bg-blue-400 animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}

        {queryError && (
          <div className="flex justify-start text-red-500">
            Error: {queryError}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
    </div>
  );
}
