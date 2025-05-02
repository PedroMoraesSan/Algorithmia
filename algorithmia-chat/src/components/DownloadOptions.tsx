
import { useState } from 'react';
import { Download, FileIcon, FileText } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { handleDownload } from '@/utils/downloadUtils';
import { Message } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface DownloadOptionsProps {
  message: Message;
}

const DownloadOptions = ({ message }: DownloadOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const handleDownloadClick = (fileType: 'pdf' | 'txt') => {
    try {
      handleDownload(message, fileType);
      toast({
        title: "Download started",
        description: `Your ${fileType.toUpperCase()} file will be downloaded shortly.`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was a problem generating your file.",
        variant: "destructive",
      });
    }
    setIsOpen(false);
  };
  
  // Determine available download options based on format
  const showPdfOption = true; // PDF is available for all formats
  const showTxtOption = message.format !== 'flowchart'; // TXT not available for flowchart
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100" aria-label="Download options">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showPdfOption && (
          <DropdownMenuItem onClick={() => handleDownloadClick('pdf')}>
            <FileIcon className="mr-2 h-4 w-4" />
            <span>PDF</span>
          </DropdownMenuItem>
        )}
        {showTxtOption && (
          <DropdownMenuItem onClick={() => handleDownloadClick('txt')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Text</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadOptions;
