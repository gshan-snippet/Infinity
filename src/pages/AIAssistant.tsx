import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Bot, User, Sparkles,
  Calendar, BookOpen, MapPin, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const suggestedQuestions = [
  { icon: Sparkles, text: 'How to use this app?' },
  { icon: Calendar, text: 'When is UPSC Prelims 2025?' },
  { icon: BookOpen, text: 'NEET syllabus for 2025' },
  { icon: FileText, text: 'Previous year question papers' },
  { icon: MapPin, text: 'Best coaching in Delhi' },
];

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: 'bot',
    text: "Hi! I'm your CareerVerse assistant. I can help you with app navigation, exam dates, syllabus information, and more. How can I assist you today?",
    time: 'Now'
  }
];

const AIAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      text: messageText,
      time: 'Now'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses: { [key: string]: string } = {
        'How to use this app?': "CareerVerse is easy to use! Start by clicking 'Start Your Journey' on the home page. Select your current situation, and I'll create a personalized roadmap for you. You can track your progress, access resources, and get daily guidance.",
        'When is UPSC Prelims 2025?': "UPSC Civil Services Preliminary Examination 2025 is scheduled for June 1, 2025. The notification is expected in February 2025. Make sure to check the official UPSC website for updates.",
        'NEET syllabus for 2025': "NEET 2025 syllabus covers Physics, Chemistry, and Biology from Class 11 and 12 NCERT. Key topics include Mechanics, Thermodynamics, Organic Chemistry, Human Physiology, and Genetics. Would you like detailed topic-wise breakdown?",
        'Previous year question papers': "You can find previous year question papers in the Goal Dashboard under 'Coaching & Resources' tab. We have papers from the last 10 years with detailed solutions.",
        'Best coaching in Delhi': "Top coaching institutes in Delhi include:\n1. Vision IAS (for UPSC)\n2. Allen (for NEET/JEE)\n3. Drishti IAS\n4. Vajiram & Ravi\n\nWould you like detailed reviews and fee structures?"
      };

      const botMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponses[messageText] || "I understand you're asking about " + messageText + ". Let me help you with that. You can find more information in the relevant section of the app, or I can guide you to the right resource.",
        time: 'Now'
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-semibold">AI Assistant</h1>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-2xl space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'gradient-primary text-primary-foreground'
                }`}>
                  {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-md' 
                    : 'bg-muted rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-end gap-2"
            >
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="p-4 rounded-2xl bg-muted rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-border">
          <div className="container mx-auto max-w-2xl">
            <p className="text-xs text-muted-foreground mb-3">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(q.text)}
                  className="gap-2"
                >
                  <q.icon className="h-3 w-3" />
                  {q.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="container mx-auto max-w-2xl">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1"
            />
            <Button type="submit" variant="hero" size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
