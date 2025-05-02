
import jsPDF from 'jspdf';
import { Message } from '@/types';
import html2canvas from 'html2canvas';

// Function to download content as text file
export const downloadAsText = (content: string, filename: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Function to download content as PDF
export const downloadAsPdf = (content: string, title: string, filename: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  
  // Add content with word wrap
  doc.setFontSize(12);
  const splitText = doc.splitTextToSize(content, 170);
  doc.text(splitText, 20, 30);
  
  doc.save(filename);
};

// Function to download flowchart as PDF with image
export const downloadFlowchartAsPdf = async (filename: string) => {
  try {
    // Find the flowchart element
    const flowchartElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowchartElement) {
      throw new Error("Flowchart element not found");
    }
    
    // Get ReactFlow instance viewport
    const reactFlowInstance = (window as any).reactFlowInstance;
    
    if (reactFlowInstance) {
      // Save current viewport
      const currentViewport = reactFlowInstance.getViewport();
      
      // Fit view to show all nodes
      reactFlowInstance.fitView({ padding: 0.2, duration: 0 });
      
      // Wait for the viewport transition to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create a text-based PDF for flowchart (as requested by user)
      const nodes = reactFlowInstance.getNodes();
      
      // Get all the node labels in order
      const flowSteps = nodes
        .sort((a: any, b: any) => (a.position.y - b.position.y))
        .map((node: any, index: number) => {
          const stepNumber = index + 1;
          const label = node.data?.label || 'Step';
          return `${stepNumber}. ${label}`;
        });
      
      // Create a text description of the flowchart
      const flowchartText = `Flowchart Steps:\n\n${flowSteps.join('\n\n')}`;
      
      // Create PDF with text description
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Flowchart", 20, 20);
      
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(flowchartText, 170);
      doc.text(splitText, 20, 30);
      
      doc.save(`${filename}.pdf`);
      
      // Restore original viewport
      reactFlowInstance.setViewport(currentViewport, { duration: 200 });
    } else {
      throw new Error("ReactFlow instance not available");
    }
  } catch (error) {
    console.error("Error generating flowchart PDF:", error);
    throw error;
  }
};

// Function to handle download based on format type
export const handleDownload = (message: Message, fileType: 'pdf' | 'txt') => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);
  const filename = `algorithm_${message.format || 'descriptive'}_${timestamp}`;
  
  if (fileType === 'txt') {
    downloadAsText(message.content, `${filename}.txt`);
  } else if (fileType === 'pdf') {
    if (message.format === 'flowchart') {
      // For flowcharts, capture the visual diagram
      downloadFlowchartAsPdf(filename);
    } else {
      // For text-based formats (descriptive, pseudocode)
      const title = `Algorithm: ${message.format?.charAt(0).toUpperCase()}${message.format?.slice(1) || 'Descriptive'}`;
      downloadAsPdf(message.content, title, `${filename}.pdf`);
    }
  }
};
