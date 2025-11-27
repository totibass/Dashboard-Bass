import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Loader2, Bot } from 'lucide-react';
import { ChatMessage } from '../types';

interface CoachChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

const CoachChat: React.FC<CoachChatProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Salut ! Je suis ton coach neuro-optimisé. Une question sur la technique, le solfège ou ton programme ?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY || ''; // Injected by environment
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
      Tu es un coach d'apprentissage de basse électrique neuro-optimisé. 
      Ton but est d'aider l'élève à atteindre le top 1% en 90 jours.
      Tu utilises les principes de :
      1. La répétition espacée.
      2. La méthode Feynman (expliquer simplement).
      3. Le rappel actif (tester les connaissances).
      
      Tu es expert en basse 6 cordes. Tu connais Scott's Bass Lessons, Travis Dykes, Victor Wooten, Jaco Pastorius.
      Sois encourageant mais exigeant. Tes réponses doivent être concises et structurées.
      Si l'élève pose une question sur le planning, réfère-toi aux principes d'apprentissage.
      `;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction }
      });

      // Send recent history context
      // Note: In a real app we would maintain the chat session object properly
      // Here we just send the last message for simplicity in this demo structure or reconstruct history if needed.
      // For this implementation, we'll just send the prompt with the persona context implicitly handled by systemInstruction.
      
      const response = await chat.sendMessage({ message: userMsg.text });
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "Désolé, je n'ai pas pu générer de réponse.",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "J'ai eu un problème de connexion neuronale. Réessaie plus tard.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primaryHover text-white p-4 rounded-full shadow-lg z-50 transition-transform hover:scale-105"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-surface border border-surfaceHighlight rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-surfaceHighlight p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bot className="text-primary" size={20} />
          <h3 className="font-bold text-white">Neuro-Coach</h3>
        </div>
        <button onClick={onToggle} className="text-subtext hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-surfaceHighlight text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-surfaceHighlight p-3 rounded-lg rounded-bl-none">
                <Loader2 className="animate-spin text-primary" size={16} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-surface border-t border-surfaceHighlight flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pose ta question..."
          className="flex-1 bg-background text-white rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary border border-surfaceHighlight"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-primary hover:bg-primaryHover disabled:opacity-50 text-white p-2 rounded-md transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default CoachChat;
