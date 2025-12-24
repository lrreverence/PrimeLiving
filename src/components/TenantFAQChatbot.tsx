import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FAQ {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  question?: string;
  answer?: string;
  category?: string;
}

const faqs: FAQ[] = [
  {
    question: "How do I pay my rent?",
    answer: "You can pay your rent by:\n1. Generating a QR code from the 'Payments' tab\n2. Scanning the QR code with GCash, PayMaya, or other mobile payment apps\n3. Uploading a receipt after payment\n4. Your payment will be confirmed by the apartment manager within 1-2 business days.",
    category: "Payments",
    keywords: ["pay", "rent", "payment", "how to pay", "pay rent", "qr code", "gcash", "paymaya"]
  },
  {
    question: "When is my rent due?",
    answer: "Rent is typically due on the 15th of each month. You can check your contract details in the 'Overview' tab for your specific contract period and payment schedule.",
    category: "Payments",
    keywords: ["due", "when", "rent due", "payment due", "deadline", "date"]
  },
  {
    question: "How do I submit a maintenance request?",
    answer: "To submit a maintenance request:\n1. Go to the 'Maintenance' tab\n2. Click 'Submit Maintenance Request'\n3. Fill in the details (category, description, priority)\n4. Upload photos if needed\n5. Submit the request\nYou'll receive updates on the status of your request.",
    category: "Maintenance",
    keywords: ["maintenance", "repair", "fix", "issue", "problem", "broken", "submit", "request"]
  },
  {
    question: "How can I check my payment history?",
    answer: "You can view your complete payment history in the 'Payments' tab. This includes all past payments, their status (pending, confirmed, rejected), and payment dates. You can also filter by year or status.",
    category: "Payments",
    keywords: ["history", "past", "previous", "transactions", "payment history", "receipt"]
  },
  {
    question: "Where can I find my contract documents?",
    answer: "Your contract documents are available in the 'Documents' tab. You can view and download your rental contract, payment receipts, and other important documents at any time.",
    category: "Documents",
    keywords: ["contract", "document", "agreement", "lease", "download", "view"]
  },
  {
    question: "How do I update my profile information?",
    answer: "To update your profile:\n1. Go to the 'Profile' tab\n2. Click 'Edit Profile'\n3. Update your information (contact number, emergency contacts, occupation, etc.)\n4. Click 'Save Changes'\nNote: Some information like email may require verification.",
    category: "Profile",
    keywords: ["profile", "update", "edit", "change", "information", "personal"]
  },
  {
    question: "What should I do if I have an emergency?",
    answer: "For emergencies:\n1. Contact your apartment manager immediately using the contact information in your dashboard\n2. For maintenance emergencies, submit a high-priority maintenance request\n3. For life-threatening emergencies, call 911 or local emergency services\nYour emergency contact information should be up to date in your profile.",
    category: "Emergency",
    keywords: ["emergency", "urgent", "help", "immediate", "critical"]
  },
  {
    question: "How do I view my notifications?",
    answer: "All your notifications are displayed in the 'Notifications' tab. You'll see important updates about payments, maintenance requests, contract renewals, and general announcements. Make sure your notification preferences are enabled.",
    category: "Notifications",
    keywords: ["notification", "alert", "message", "update", "announcement"]
  },
  {
    question: "Can I pay partial rent?",
    answer: "Partial payments may be possible depending on your contract terms. Please contact your apartment manager to discuss payment arrangements. You can find their contact information in your dashboard or submit a message through the system.",
    category: "Payments",
    keywords: ["partial", "installment", "split", "half", "part"]
  },
  {
    question: "How do I know if my payment was received?",
    answer: "After uploading your payment receipt, your payment status will show as 'Pending' until the apartment manager confirms it. Once confirmed, the status will change to 'Confirmed' and you'll receive a notification. Check the 'Payments' tab for real-time status updates.",
    category: "Payments",
    keywords: ["received", "confirmed", "status", "pending", "approved"]
  },
  {
    question: "What maintenance issues can I report?",
    answer: "You can report various maintenance issues including:\n- Plumbing problems (leaks, clogged drains)\n- Electrical issues (power outages, faulty wiring)\n- HVAC problems (air conditioning, heating)\n- Appliance repairs\n- Structural issues\n- Pest control\n- Other property-related issues\nUse the 'Maintenance' tab to submit detailed requests with photos if possible.",
    category: "Maintenance",
    keywords: ["what", "issues", "problems", "report", "types", "kinds"]
  },
  {
    question: "How long does it take to process maintenance requests?",
    answer: "Maintenance request processing times vary:\n- Emergency/High Priority: Usually addressed within 24 hours\n- Medium Priority: 2-3 business days\n- Low Priority: 5-7 business days\nYou can track the status of your request in the 'Maintenance' tab. The apartment manager will update you on progress.",
    category: "Maintenance",
    keywords: ["how long", "time", "duration", "process", "when", "timeline"]
  },
  {
    question: "Can I renew my contract?",
    answer: "Contract renewal is possible. You'll receive notifications as your contract end date approaches. Contact your apartment manager to discuss renewal terms and conditions. Contract details are available in the 'Overview' tab.",
    category: "Contract",
    keywords: ["renew", "renewal", "extend", "contract", "lease"]
  },
  {
    question: "How do I contact the apartment manager?",
    answer: "You can contact the apartment manager through:\n1. The contact information displayed in your dashboard\n2. Submitting a maintenance request with a message\n3. Using the notification system\n4. Calling the office phone number provided in your contract documents",
    category: "Contact",
    keywords: ["contact", "manager", "reach", "call", "email", "phone"]
  }
];

export const TenantFAQChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: "Hello! I'm here to help answer your frequently asked questions. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Show suggested questions when chat opens
      setSuggestedQuestions([
        "How do I pay my rent?",
        "How do I submit a maintenance request?",
        "Where can I find my contract?",
        "How do I update my profile?"
      ]);
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findBestMatch = (query: string): FAQ | null => {
    const lowerQuery = query.toLowerCase().trim();
    
    // Exact match first
    for (const faq of faqs) {
      if (faq.question.toLowerCase() === lowerQuery) {
        return faq;
      }
    }

    // Keyword matching
    const queryWords = lowerQuery.split(/\s+/);
    let bestMatch: FAQ | null = null;
    let bestScore = 0;

    for (const faq of faqs) {
      let score = 0;
      for (const keyword of faq.keywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }
      // Also check if question contains query words
      for (const word of queryWords) {
        if (faq.question.toLowerCase().includes(word) || faq.answer.toLowerCase().includes(word)) {
          score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    return bestMatch;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInput('');
    setSuggestedQuestions([]);

    // Find best matching FAQ
    const match = findBestMatch(userMessage);

    setTimeout(() => {
      if (match) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: match.answer,
          question: match.question,
          answer: match.answer,
          category: match.category
        }]);
        // Show related questions
        const related = faqs
          .filter(f => f.category === match.category && f.question !== match.question)
          .slice(0, 2)
          .map(f => f.question);
        if (related.length > 0) {
          setSuggestedQuestions(related);
        }
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: "I'm sorry, I couldn't find an answer to that question. Here are some common questions I can help with:\n\n" +
            faqs.slice(0, 5).map(f => `• ${f.question}`).join('\n') +
            "\n\nTry asking about payments, maintenance, contracts, or your profile."
        }]);
        setSuggestedQuestions([
          "How do I pay my rent?",
          "How do I submit a maintenance request?",
          "Where can I find my contract?"
        ]);
      }
    }, 500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gray-900 text-white hover:bg-gray-800 shadow-lg z-50 flex items-center justify-center"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50 flex flex-col shadow-2xl rounded-lg border border-gray-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-900 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">FAQ Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setMessages([{
                  type: 'bot',
                  content: "Hello! I'm here to help answer your frequently asked questions. What would you like to know?"
                }]);
                setInput('');
                setSuggestedQuestions([]);
              }}
              className="h-8 w-8 p-0 text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.type === 'bot' && message.question && message.answer ? (
                      <div className="space-y-2">
                        <div className="font-semibold text-sm">{message.question}</div>
                        <div className="text-sm whitespace-pre-line text-gray-700">{message.answer}</div>
                        {message.category && (
                          <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                            Category: {message.category}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-line">{message.content}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && (
            <div className="px-4 pb-2 border-t bg-gray-50">
              <p className="text-xs text-gray-500 mb-2 mt-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs h-auto py-1.5 px-2"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gray-900 text-white hover:bg-gray-800"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask about payments, maintenance, contracts, or your profile
            </p>
          </div>
        </div>
      )}
    </>
  );
};

