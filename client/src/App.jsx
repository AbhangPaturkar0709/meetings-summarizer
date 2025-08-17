import React, { useState, useEffect } from "react";
import { Send, Save, XCircle, FileText, Bot, Edit, Share2 } from "lucide-react";
import * as api from "./api"; // ✅ use real api.js instead of mock

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("Summarize in bullet points for executives");
  const [generated, setGenerated] = useState("");
  const [summaryId, setSummaryId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  // State for managing multiple email addresses
  const [emails, setEmails] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [subject, setSubject] = useState("Meeting Summary");
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTranscript(ev.target.result);
    reader.readAsText(file);
  };

  async function onGenerate() {
    if (!transcript.trim()) {
      setMessage({ type: "error", text: "Please provide a transcript to summarize." });
      return;
    }
    setLoading(true);
    setGenerated("");
    setSummaryId(null);
    try {
      const resp = await api.generateSummary(transcript, prompt);
      const { generated, summaryId } = resp.data;
      setGenerated(generated);
      setSummaryId(summaryId);
      setIsEditing(true);
      setMessage({ type: "success", text: "Summary generated successfully!" });
    } catch (err) {
      console.error("Error generating summary:", err);
      setMessage({ type: "error", text: "Error generating summary. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    if (!summaryId) {
      setMessage({ type: "error", text: "No summary to save yet." });
      return;
    }
    try {
      await api.saveSummary(summaryId, generated);
      setIsEditing(false);
      setMessage({ type: "success", text: "Summary saved." });
    } catch (err) {
      console.error("Save error:", err);
      setMessage({ type: "error", text: "Error saving summary. Please try again." });
    }
  }

  // --- New functions for email tags ---
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      handleAddEmail(inputValue);
    }
  };

  const handleAddEmail = (email) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail && !emails.includes(trimmedEmail)) {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(trimmedEmail)) {
        setEmails([...emails, trimmedEmail]);
        setInputValue("");
      } else {
        setMessage({ type: "error", text: `Invalid email format: ${trimmedEmail}` });
        setInputValue(trimmedEmail);
      }
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  async function handleShare() {
    // If there's leftover text in the input field, add it as an email
    if (inputValue.trim()) {
      handleAddEmail(inputValue);
    }

    if (emails.length === 0) {
      setMessage({ type: "error", text: "Please enter at least one recipient email address." });
      return;
    }

    try {
      await api.sendMail(emails.join(", "), subject, generated);
      setMessage({ type: "success", text: "Email sent successfully!" });
      setShowEmailModal(false);
      setEmails([]);
      setInputValue("");
    } catch (err) {
      console.error("Email error:", err);
      setMessage({ type: "error", text: "Email failed to send. Please check the recipient(s)." });
    }
  }
  // --- End of new functions ---

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 p-4 font-inter overflow-hidden">
      
      {/* App Header */}
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 leading-tight">AI Meeting Summarizer & Sharer</h1>
        <p className="text-sm text-gray-500">Generate, edit, and share concise summaries of your meeting transcripts.</p>
      </div>

      {/* Status message component at the top right */}
      <div className="fixed top-4 right-4 z-50">
        {message && (
          <div className={`p-4 rounded-xl flex items-center space-x-2 transition-opacity duration-300 transform animate-fade-in ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <XCircle size={20} />
            <span className="font-medium">{message.text}</span>
          </div>
        )}
      </div>

      {/* Main content container with fixed height and two columns */}
      <div className="flex flex-grow w-full max-w-7xl mx-auto rounded-2xl shadow-md bg-white overflow-hidden">

        {/* Left Section: Transcript and Prompt */}
        <div className="flex flex-col w-full lg:w-1/2 p-4 border-r border-gray-200 space-y-8">
          <div className="flex flex-col h-full space-y-4">
            <div className="space-y-4 p-4 border border-gray-200 rounded-xl shadow-inner flex-grow flex flex-col">
              <div className="flex items-center space-x-2">
                <FileText className="text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-700">Transcript</h3>
              </div>
              <label className="block text-sm font-medium text-gray-600">Upload a .txt file or paste the transcript below</label>
              <input
                type="file"
                accept=".txt"
                onChange={onFile}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste transcript here..."
                className="w-full flex-grow p-3 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all overflow-y-auto"
              />
            </div>

            <div className="space-y-4 p-4 border border-gray-200 rounded-xl shadow-inner">
              <div className="flex items-center space-x-2">
                <Bot className="text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-700">Instruction</h3>
              </div>
              <label className="block text-sm font-medium text-gray-600">Customize the summarization prompt</label>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
                <button
                  onClick={onGenerate}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-6 py-3 font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md disabled:bg-indigo-400"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Generate Summary</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setTranscript(""); setGenerated(""); setSummaryId(null); }}
                  className="flex items-center justify-center space-x-2 px-6 py-3 font-semibold rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors shadow-md"
                >
                  <XCircle size={18} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Summary and Email */}
        <div className="flex flex-col w-full lg:w-1/2 p-4 space-y-8">
          <div className="flex flex-col h-full space-y-4">
            {generated ? (
              <div className="space-y-4 p-4 border border-gray-200 rounded-xl shadow-inner flex-grow flex flex-col">
                <div className="flex items-center space-x-2">
                  <Edit className="text-gray-500" />
                  <h3 className="text-xl font-semibold text-gray-700">Editable Summary</h3>
                </div>
                {/* The summary is now rendered in a textarea that can be made read-only */}
                <textarea
                  value={generated}
                  onChange={(e) => setGenerated(e.target.value)}
                  readOnly={!isEditing}
                  className={`w-full flex-grow p-3 text-sm rounded-lg border border-gray-300 resize-none overflow-y-auto ${!isEditing ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}`}
                />

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-end">
                  {isEditing ? (
                    <button
                      onClick={onSave}
                      className="flex items-center justify-center space-x-2 px-6 py-3 font-semibold rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors shadow-md"
                    >
                      <Save size={18} />
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center space-x-2 px-6 py-3 font-semibold rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors shadow-md"
                    >
                      <Edit size={18} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    <Share2 size={18} />
                    <span>Share via Email</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center text-center text-gray-400">
                <p>Your summarized transcript will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Share via Email</h3>
            {/* New email input section with tags */}
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all min-h-[44px] bg-white">
              {emails.map((email) => (
                <span key={email} className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                  >
                    <XCircle size={16} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={emails.length === 0 ? "Recipient(s) email" : ""}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[50px] p-1 text-sm bg-transparent border-none outline-none"
              />
            </div>

            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 font-semibold rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
