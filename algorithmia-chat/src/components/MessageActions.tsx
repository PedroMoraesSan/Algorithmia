
import { useState } from "react";
import { Copy, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { handleDownload } from "@/utils/downloadUtils";
import { generateMermaidCode, generateMermaidWithStyleFromGroq } from "@/utils/flowchartUtils";

interface MessageActionsProps {
  message: Message;
  isLatest: boolean;
  onRegenerate: () => void;
}

const MessageActions = ({ message, isLatest, onRegenerate }: MessageActionsProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    let textToCopy = message.content;
    // Para fluxogramas, busca o Mermaid ESTILIZADO na IA Groq e copia ao clipboard
    if (message.format === "flowchart") {
      try {
        setIsCopying(true);
        toast({ title: "Gerando código Mermaid estilizado...", description: "Aguarde um instante", duration: 2000 });
        textToCopy = await generateMermaidWithStyleFromGroq(message.content);
        await navigator.clipboard.writeText(textToCopy);
        toast({
          title: "Código Mermaid copiado!",
          description: "O código customizado (com estilos visuais) foi copiado para a área de transferência.",
        });
      } catch (err) {
        toast({
          title: "Erro ao gerar/copiar Mermaid",
          description: "Houve um problema ao gerar seu código Mermaid estilizado.",
          variant: "destructive",
        });
        setIsCopying(false);
        return;
      }
      setIsCopying(false);
      return;
    }
    // Para outros formatos, apenas copia o texto
    await navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copiado para área de transferência",
      description: "O texto foi copiado para a área de transferência.",
    });
  };

  const handleRegenerate = () => {
    onRegenerate();
  };

  const handleDownloadClick = (fileType: "pdf" | "txt") => {
    try {
      handleDownload(message, fileType);
      toast({
        title: "Download iniciado",
        description: `Seu arquivo ${fileType.toUpperCase()} será baixado em instantes.`,
      });
    } catch (error) {
      console.error("Erro no download:", error);
      toast({
        title: "Download falhou",
        description: "Houve um problema ao gerar seu arquivo.",
        variant: "destructive",
      });
    }
  };

  const showPdfOption = true;
  const showTxtOption = message.format !== "flowchart";

  return (
    <div
      className="flex items-center gap-1 transition-opacity duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Copiar */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-70 hover:opacity-100"
        onClick={handleCopy}
        aria-label="Copiar texto"
        disabled={isCopying}
      >
        <Copy className="h-4 w-4" />
      </Button>

      {/* Download */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-70 hover:opacity-100"
          onClick={() => handleDownloadClick("pdf")}
          aria-label="Baixar"
        >
          <Download className="h-4 w-4" />
        </Button>
        {showTxtOption && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-70 hover:opacity-100"
            onClick={() => handleDownloadClick("txt")}
            aria-label="Baixar como texto"
          >
            <span className="text-xs font-mono">TXT</span>
          </Button>
        )}
      </div>

      {/* Regenerar */}
      {(isLatest || isHovered) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-70 hover:opacity-100"
          onClick={handleRegenerate}
          aria-label="Regenerar resposta"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default MessageActions;
