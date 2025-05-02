import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Message, FormatOption, ModelOption } from "@/types";
import FlowchartRenderer from "./FlowchartRenderer";
import { generateAlgorithm } from "@/utils/groqApi";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from 'react-markdown';
import MessageActions from "./MessageActions";
import { ArrowUp, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ThemeToggle } from "./ThemeToggle";
import { generateMermaidCode } from "@/utils/flowchartUtils";

const formatOptions: FormatOption[] = [
  { value: "descriptive", label: "Descriptive" },
  { value: "pseudocode", label: "Pseudocode" },
  { value: "flowchart", label: "Flowchart" },
];

const modelOptions: ModelOption[] = [
  { value: "llama3-8b-8192", label: "LLaMA 3 8B" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<FormatOption["value"]>("descriptive");
  const [selectedModel, setSelectedModel] = useState<string>("llama3-8b-8192");
  const [isLoading, setIsLoading] = useState(false);
  const [userLanguage, setUserLanguage] = useState<string>("english");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const browserLanguage = navigator.language || (navigator as any).userLanguage;
    const primaryLang = browserLanguage.split('-')[0].toLowerCase();
    const languageMap: {[key: string]: string} = {
      'en': 'english',
      'pt': 'portuguese',
      'es': 'spanish',
      'fr': 'french',
      'de': 'german',
      'it': 'italian',
      'ru': 'russian',
      'zh': 'chinese',
      'ja': 'japanese',
      'ko': 'korean',
    };
    setUserLanguage(languageMap[primaryLang] || 'english');
    console.log(`Detected user language: ${languageMap[primaryLang] || 'english'}`);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        chatId: "default",
        content: inputText,
        role: "user",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setIsLoading(true);
      setIsTyping(true);
      
      console.log(`Generating ${selectedFormat} using ${selectedModel} for: ${inputText} in ${userLanguage}`);
      
      const response = await generateAlgorithm(
        inputText,
        selectedModel,
        selectedFormat,
        userLanguage
      );
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        chatId: "default",
        content: response,
        role: "assistant",
        format: selectedFormat,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error generating algorithm:", error);
      toast({
        title: "Error",
        description: "Failed to generate algorithm. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleRegenerateResponse = async (userMessageIndex: number) => {
    const userMessage = messages[userMessageIndex];
    if (!userMessage || userMessage.role !== 'user') return;
    
    try {
      const newMessages = messages.slice(0, userMessageIndex + 1);
      setMessages(newMessages);
      setIsLoading(true);
      setIsTyping(true);
      
      const response = await generateAlgorithm(
        userMessage.content,
        selectedModel,
        selectedFormat,
        userLanguage
      );
      
      const botResponse: Message = {
        id: Date.now().toString(),
        chatId: "default",
        content: response,
        role: "assistant",
        format: selectedFormat,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error regenerating algorithm:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate algorithm. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const userMessageAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };
  
  const assistantMessageAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const markdownComponents = {
    h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
    h4: ({ node, ...props }: any) => <h4 className="text-base font-semibold mt-3 mb-2" {...props} />,
    h5: ({ node, ...props }: any) => <h5 className="text-sm font-semibold mt-2 mb-1" {...props} />,
    h6: ({ node, ...props }: any) => <h6 className="text-sm font-semibold text-gray-500 mt-2 mb-1" {...props} />,
    p: ({ node, ...props }: any) => <p className="my-2" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 my-3" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 my-3" {...props} />,
    li: ({ node, ...props }: any) => <li className="my-1" {...props} />,
    a: ({ node, ...props }: any) => <a className="text-blue-500 hover:underline" {...props} />,
    blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold" {...props} />,
    em: ({ node, ...props }: any) => <em className="italic" {...props} />,
    table: ({ node, ...props }: any) => <table className="border-collapse border border-gray-300 my-4 w-full" {...props} />,
    thead: ({ node, ...props }: any) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
    tbody: ({ node, ...props }: any) => <tbody {...props} />,
    tr: ({ node, ...props }: any) => <tr className="border-b border-gray-300 dark:border-gray-700" {...props} />,
    th: ({ node, ...props }: any) => <th className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />,
    td: ({ node, ...props }: any) => <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />,
    hr: ({ node, ...props }: any) => <hr className="my-4 border-gray-300 dark:border-gray-700" {...props} />,
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'text';
      
      return !inline ? (
        <div className="relative group my-4">
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 bg-gray-700/50 text-gray-200 hover:bg-gray-600"
              onClick={() => {
                let textToCopy = String(children).replace(/\n$/, '');
                
                const latestMessage = messages.find(m => m.role === "assistant" && m.format === "flowchart");
                if (latestMessage && language === 'javascript' && latestMessage.format === 'flowchart') {
                  textToCopy = generateMermaidCode(latestMessage.content);
                }
                
                navigator.clipboard.writeText(textToCopy);
                toast({
                  title: "Code copied",
                  description: "Code has been copied to clipboard",
                });
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
          </div>
          <div className="text-xs text-gray-400 bg-gray-800 px-4 py-1 rounded-t-md border-b border-gray-700">
            {language}
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            {...props}
            className="rounded-b-md !mt-0"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b bg-card/70 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-primary">Algorithmia Chat</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[160px] focus:ring-1">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ThemeToggle />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-2 max-w-3xl mx-auto">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                {...(message.role === "user" ? userMessageAnimation : assistantMessageAnimation)}
                className="group"
              >
                <Card 
                  className={`p-4 max-w-[85%] ${
                    message.role === "user" 
                      ? "ml-auto bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                      : "mr-auto bg-card border rounded-2xl rounded-tl-sm"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      {message.role === "user" ? (
                        <div>{message.content}</div>
                      ) : (
                        <div className="text-sm text-muted-foreground mb-3">
                          Here's a {message.format} for: {messages.find(m => m.role === "user" && m.id < message.id)?.content}
                        </div>
                      )}
                    </div>
                    
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-1">
                        <MessageActions 
                          message={message} 
                          isLatest={index === messages.length - 1} 
                          onRegenerate={() => handleRegenerateResponse(index - 1)} 
                        />
                      </div>
                    )}
                  </div>
                  
                  {message.role === "assistant" && message.format === "flowchart" && (
                    <div className="mt-4 bg-background rounded-md p-2">
                      <FlowchartRenderer flowData={message.content} />
                    </div>
                  )}
                  
                  {message.role === "assistant" && message.format === "pseudocode" && (
                    <div className="mt-4 rounded-md overflow-auto">
                      <SyntaxHighlighter
                        style={oneDark}
                        language="javascript"
                        className="rounded-md"
                      >
                        {message.content}
                      </SyntaxHighlighter>
                    </div>
                  )}
                  
                  {message.role === "assistant" && message.format === "descriptive" && (
                    <div className="mt-4 bg-background rounded-md p-4 whitespace-pre-line">
                      <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="p-4 max-w-[85%] mr-auto border rounded-2xl rounded-tl-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </Card>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-2 border-t bg-card/70 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto relative">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Select 
                value={selectedFormat} 
                onValueChange={(value) => setSelectedFormat(value as FormatOption["value"])}
              >
                <SelectTrigger className="w-[140px] focus:ring-1">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="text-sm text-muted-foreground">
                {selectedFormat === "descriptive" ? "Generate a detailed textual description" : 
                 selectedFormat === "pseudocode" ? "Generate code-like step-by-step instructions" : 
                 "Generate a visual flowchart diagram"}
              </div>
            </div>
            
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe the algorithm you need..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="border rounded-xl pr-14 min-h-[52px] max-h-[160px] resize-none focus-visible:ring-1"
                rows={1}
                disabled={isLoading}
              />
              
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputText.trim()}
                className="absolute bottom-2 right-2 px-2 h-8 bg-primary hover:bg-primary/90 transition-colors rounded-full"
                size="icon"
                type="submit"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              Press Enter to send, Shift+Enter for a new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
