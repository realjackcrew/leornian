import React, { useState } from 'react';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      // Here you would typically send the message to the chatbot API
      // and receive a response.
      // For now, we can simulate a response.
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { text: 'This is a response from the bot.', sender: 'bot' }]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-grow p-6 overflow-auto">
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative">
            <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
                placeholder="Message Leo..."
                className="w-full h-16 p-4 pr-16 text-base text-gray-900 bg-white border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            <button
                type="submit"
                className="absolute bottom-3.5 right-4 p-2 text-white bg-blue-500 rounded-lg disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                disabled={!input.trim()}
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
                </svg>
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
