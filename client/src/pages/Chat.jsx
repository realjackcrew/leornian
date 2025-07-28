import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function Chat() {
  const { token } = useContext(AuthContext);
  // Show login prompt if not authenticated
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-900 rounded-2xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full animate-fadein">
          <Lock size={48} className="text-white mb-4" />
          <div className="text-3xl font-bold mb-2 text-white">Sign in required</div>
          <div className="text-lg text-white/80 mb-6 text-center">You need to be logged in to access this page. Please log in to continue.</div>
          <Link to="/login" className="px-8 py-3 bg-black/80 rounded-lg text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform border border-white/10">Go to Login</Link>
        </div>
      </div>
    );
  }
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [includeHistory, setIncludeHistory] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const userMessage = { text: input, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: input,
            conversationHistory: includeHistory ? messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })) : [],
            includeHistory
          })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (data.success) {
          const botMessage = { 
            text: data.response, 
            sender: 'bot',
            jsonIntent: data.jsonIntent,
            parsedIntent: data.parsedIntent,
            queryResult: data.queryResult,
            parseError: data.parseError,
            rawLlmResponse: data.rawLlmResponse
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          const errorMessage = { 
            text: `Error: ${data.error}`, 
            sender: 'bot',
            isError: true 
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = { 
          text: 'Sorry, I encountered an error. Please try again.', 
          sender: 'bot',
          isError: true 
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatJsonResponse = (text, parsedIntent, queryResult, parseError, rawLlmResponse) => {
    // If we have a successful query result, just show the formatted response
    if (queryResult && queryResult.success) {
      return (
        <div className="space-y-4">
          {/* Main Response */}
                                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-lg border border-blue-700/30">
                            <ReactMarkdown components={{
                                p: ({children}) => <p className="text-white">{children}</p>,
                                h1: ({children}) => <h1 className="text-white text-2xl font-bold mb-4">{children}</h1>,
                                h2: ({children}) => <h2 className="text-white text-xl font-bold mb-3">{children}</h2>,
                                h3: ({children}) => <h3 className="text-white text-lg font-bold mb-2">{children}</h3>,
                                ul: ({children}) => <ul className="text-white list-disc list-inside mb-4">{children}</ul>,
                                ol: ({children}) => <ol className="text-white list-decimal list-inside mb-4">{children}</ol>,
                                li: ({children}) => <li className="text-white mb-1">{children}</li>,
                                strong: ({children}) => <strong className="text-white font-bold">{children}</strong>,
                                em: ({children}) => <em className="text-white italic">{children}</em>,
                                code: ({children}) => <code className="text-green-400 bg-gray-800 px-1 rounded">{children}</code>,
                                pre: ({children}) => <pre className="text-green-400 bg-gray-800 p-2 rounded overflow-x-auto">{children}</pre>,
                                blockquote: ({children}) => <blockquote className="text-gray-300 border-l-4 border-blue-500 pl-4 italic">{children}</blockquote>
                            }}>
                                {text}
                            </ReactMarkdown>
                        </div>

          {/* Query Results Section */}
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
            <div className="text-gray-400 mb-3 font-semibold">📊 Query Results</div>
            
            {/* Data Count */}
            <div className="mb-3 text-sm text-gray-300">
              Found {queryResult.data?.length || 0} records
              {queryResult.totalCount && queryResult.totalCount !== queryResult.data?.length && 
                ` (showing ${queryResult.data?.length} of ${queryResult.totalCount} total)`
              }
            </div>

            {/* Warnings */}
            {queryResult.warnings && queryResult.warnings.length > 0 && (
              <div className="bg-yellow-900/30 p-3 rounded border border-yellow-700/50 mb-3">
                <div className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Warnings:</div>
                <ul className="text-yellow-200 text-sm list-disc list-inside">
                  {queryResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Aggregations */}
            {queryResult.aggregations && Object.keys(queryResult.aggregations).length > 0 && (
              <div className="bg-blue-900/30 p-3 rounded border border-blue-700/50 mb-3">
                <div className="text-blue-400 text-sm font-semibold mb-2">📈 Aggregations:</div>
                <div className="space-y-1 text-sm">
                  {Object.entries(queryResult.aggregations).map(([key, value]) => (
                    <div key={key} className="text-blue-200">
                      <span className="text-blue-300 font-mono">{key}:</span> {typeof value === 'number' ? value.toFixed(2) : value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Table (for small result sets) */}
            {queryResult.data && queryResult.data.length > 0 && queryResult.data.length <= 10 && (
              <div className="bg-gray-800/50 p-3 rounded border border-gray-600/50">
                <div className="text-gray-300 text-sm font-semibold mb-2">📋 Data:</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600/50">
                        {queryResult.data[0] && Object.keys(queryResult.data[0])
                          .filter(key => !['id', 'userId', 'createdAt', 'updatedAt'].includes(key))
                          .map(key => (
                            <th key={key} className="text-left py-2 px-3 text-gray-400 font-medium">
                              {key}
                            </th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.data.map((row, index) => (
                        <tr key={index} className="border-b border-gray-700/30">
                          {Object.entries(row)
                            .filter(([key]) => !['id', 'userId', 'createdAt', 'updatedAt'].includes(key))
                            .map(([key, value]) => (
                              <td key={key} className="py-2 px-3 text-gray-200">
                                {typeof value === 'object' && value !== null 
                                  ? `{${Object.keys(value).slice(0, 3).join(', ')}}` 
                                  : String(value)
                                }
                              </td>
                            ))
                          }
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Large result sets summary */}
            {queryResult.data && queryResult.data.length > 10 && (
              <div className="bg-gray-800/50 p-3 rounded border border-gray-600/50 text-sm text-gray-300">
                Large result set ({queryResult.data.length} records). Use pagination or filters to see specific data.
              </div>
            )}
          </div>

          {/* Debug Section (collapsible) */}
          <details className="bg-gray-900/30 rounded-lg border border-gray-700/30">
            <summary className="p-3 cursor-pointer text-gray-400 text-sm hover:text-gray-300">
              🔧 Debug Info (click to expand)
            </summary>
            <div className="p-3 pt-0 space-y-3">
              {rawLlmResponse && (
                <div>
                  <div className="text-gray-400 text-xs mb-1">Raw LLM Response:</div>
                  <pre className="text-green-400 text-xs overflow-x-auto whitespace-pre-wrap bg-gray-800/50 p-2 rounded">
                    {rawLlmResponse}
                  </pre>
                </div>
              )}
              
              {parsedIntent && (
                <div>
                  <div className="text-gray-400 text-xs mb-1">Parsed Intent:</div>
                  <pre className="text-blue-400 text-xs overflow-x-auto whitespace-pre-wrap bg-gray-800/50 p-2 rounded">
                    {JSON.stringify(parsedIntent, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        </div>
      );
    }

    // If query failed, show error with debug info
    if (queryResult && !queryResult.success) {
      return (
        <div className="space-y-4">
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-700/50">
            <div className="text-red-400 mb-2">❌ Query Error:</div>
            <div className="text-red-200">{queryResult.error}</div>
          </div>
          
          {parseError && (
            <div className="bg-red-900/30 p-4 rounded-lg border border-red-700/50">
              <div className="text-red-400 mb-2">Parse Error:</div>
              <div className="text-red-200">{parseError}</div>
            </div>
          )}
        </div>
      );
    }

    // Fallback: try to parse as JSON (legacy format)
    try {
      const jsonObj = JSON.parse(text);
      return (
        <div className="space-y-4">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 font-mono text-sm">
            <div className="text-gray-400 mb-2">JSON Query Intent:</div>
            <pre className="text-green-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(jsonObj, null, 2)}
            </pre>
          </div>
          
          {parseError && (
            <div className="bg-red-900/30 p-4 rounded-lg border border-red-700/50">
              <div className="text-red-400 mb-2">Parse Error:</div>
              <div className="text-red-200">{parseError}</div>
            </div>
          )}
        </div>
      );
    } catch (e) {
                  // If it's not valid JSON, return as regular markdown
            return <ReactMarkdown components={{
                p: ({children}) => <p className="text-white">{children}</p>,
                h1: ({children}) => <h1 className="text-white text-2xl font-bold mb-4">{children}</h1>,
                h2: ({children}) => <h2 className="text-white text-xl font-bold mb-3">{children}</h2>,
                h3: ({children}) => <h3 className="text-white text-lg font-bold mb-2">{children}</h3>,
                ul: ({children}) => <ul className="text-white list-disc list-inside mb-4">{children}</ul>,
                ol: ({children}) => <ol className="text-white list-decimal list-inside mb-4">{children}</ol>,
                li: ({children}) => <li className="text-white mb-1">{children}</li>,
                strong: ({children}) => <strong className="text-white font-bold">{children}</strong>,
                em: ({children}) => <em className="text-white italic">{children}</em>,
                code: ({children}) => <code className="text-green-400 bg-gray-800 px-1 rounded">{children}</code>,
                pre: ({children}) => <pre className="text-green-400 bg-gray-800 p-2 rounded overflow-x-auto">{children}</pre>,
                blockquote: ({children}) => <blockquote className="text-gray-300 border-l-4 border-blue-500 pl-4 italic">{children}</blockquote>
            }}>{text}</ReactMarkdown>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header with toggle */}
      <div className="bg-gray-900/50 border-b border-gray-700/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Chat with Leo</h1>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-300">
              Include conversation history
            </label>
            <button
              onClick={() => setIncludeHistory(!includeHistory)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeHistory ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeHistory ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow p-6 overflow-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'user' ? (
                <div
                  className="max-w-xs lg:max-w-md p-3 rounded-lg bg-blue-500 text-white"
                >
                  <div className="text-sm">{message.text}</div>
                </div>
              ) : (
                <div
                  className={`w-full p-3 ${
                    message.isError
                      ? 'bg-red-800/30 text-red-200 rounded-lg'
                      : 'bg-transparent text-white'
                  }`}
                  style={{ overflowX: 'auto' }}
                >
                  {message.jsonIntent ? 
                    formatJsonResponse(message.text, message.parsedIntent, message.queryResult, message.parseError, message.rawLlmResponse) : 
                    <ReactMarkdown components={{
                        p: ({children}) => <p className="text-white">{children}</p>,
                        h1: ({children}) => <h1 className="text-white text-2xl font-bold mb-4">{children}</h1>,
                        h2: ({children}) => <h2 className="text-white text-xl font-bold mb-3">{children}</h2>,
                        h3: ({children}) => <h3 className="text-white text-lg font-bold mb-2">{children}</h3>,
                        ul: ({children}) => <ul className="text-white list-disc list-inside mb-4">{children}</ul>,
                        ol: ({children}) => <ol className="text-white list-decimal list-inside mb-4">{children}</ol>,
                        li: ({children}) => <li className="text-white mb-1">{children}</li>,
                        strong: ({children}) => <strong className="text-white font-bold">{children}</strong>,
                        em: ({children}) => <em className="text-white italic">{children}</em>,
                        code: ({children}) => <code className="text-green-400 bg-gray-800 px-1 rounded">{children}</code>,
                        pre: ({children}) => <pre className="text-green-400 bg-gray-800 p-2 rounded overflow-x-auto">{children}</pre>,
                        blockquote: ({children}) => <blockquote className="text-gray-300 border-l-4 border-blue-500 pl-4 italic">{children}</blockquote>
                    }}>{message.text}</ReactMarkdown>
                  }
                  {message.jsonIntent && !message.isError && (
                    <div className="text-xs text-gray-400 mt-1">
                      🔍 Generated query intent
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span className="text-gray-300">Thinking...</span>
                </div>
              </div>
            </div>
          )}
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
              placeholder="Ask me about your health data..."
              className="w-full h-16 p-4 pr-16 text-base text-white bg-gray-900/50 border border-gray-700/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute bottom-3.5 right-4 p-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg disabled:from-blue-800 disabled:to-purple-800 disabled:cursor-not-allowed"
              disabled={!input.trim() || isLoading}
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
}
