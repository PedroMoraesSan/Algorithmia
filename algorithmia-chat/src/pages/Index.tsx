
import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
        <p className="text-muted-foreground">
          An error occurred while loading the chat interface:
        </p>
        <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[200px] text-left">
          {error.message}
        </pre>
        <Button 
          onClick={resetErrorBoundary} 
          variant="default"
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Try again
        </Button>
      </div>
    </div>
  );
};

const Index = () => {
  const [key, setKey] = useState(0);

  const handleReset = () => {
    // Reset the component by changing the key
    setKey(prevKey => prevKey + 1);
  };

  return (
    <ThemeProvider defaultTheme="light">
      <div className="h-screen flex flex-col bg-background">
        <div className="flex-1 overflow-hidden max-w-4xl mx-auto w-full">
          <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset} key={key}>
            <ChatInterface />
          </ErrorBoundary>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
