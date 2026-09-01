import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Send, Bot, User, FileText, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const Chat = () => {
  const [messages, setMessages] = useState<Array<{role: 'user'|'assistant', content: string, sources?: any[]}>>([
    { role: 'assistant', content: 'Hello. I am Sentinel AI. Ask me anything about your secure knowledge base.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { prompt: userMessage });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.response,
        sources: res.data.sources
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered a secure connection error while trying to process that.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Intelligence</h1>
        <p className="text-text-muted mt-2">Grounded answers based only on your authorized documents.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border bg-surface/50">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-[#000] rounded-tr-sm font-medium' 
                    : 'bg-surface border border-border text-white rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-background/50 prose-pre:border prose-pre:border-border">
                      <ReactMarkdown>
                        {msg.content || ''}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold text-text-muted flex items-center gap-1 uppercase tracking-wider">
                      <FileText className="w-3 h-3" /> Grounded Sources
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-background border border-border text-xs text-text-muted">
                          <FileText className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[150px]">{src.filename}</span>
                          <span className="opacity-50">· {(src.score * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 order-2">
                  <User className="w-4 h-4 text-text-muted" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-border rounded-tl-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce delay-75" />
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-surface border-t border-border">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your organization's knowledge..."
              className="w-full pl-4 pr-14 py-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-text-muted"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-2 rounded-lg px-3 h-10"
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="text-center mt-3 text-[11px] text-text-muted font-medium">
            Sentinel AI enforces strict access control. You will only receive answers based on documents you are authorized to view.
          </div>
        </div>
      </Card>
    </div>
  );
};

//  this is the ui for the chat how to chat and made sure that the format of the chat is proper way
