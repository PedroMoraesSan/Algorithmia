
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Edge,
  Connection,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { parseFlowchartResponse } from '@/utils/flowchartUtils';
import { Button } from '@/components/ui/button';
import { Fullscreen, Minimize } from 'lucide-react';

interface FlowchartRendererProps {
  flowData: string;
}

const FlowchartRenderer = ({ flowData }: FlowchartRendererProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Function to set the reactFlowInstance
  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    // Store the instance in the window object for use in downloadUtils
    (window as any).reactFlowInstance = instance;
  };

  const toggleFullscreen = () => {
    if (flowContainerRef.current) {
      if (!isFullscreen) {
        if (flowContainerRef.current.requestFullscreen) {
          flowContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      // When entering or exiting fullscreen, fit view after a short delay
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2 });
        }
      }, 200);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [reactFlowInstance]);

  useEffect(() => {
    if (flowData) {
      try {
        console.log("Processing flowchart data:", flowData.substring(0, 100) + "...");
        const { nodes: flowNodes, edges: flowEdges } = parseFlowchartResponse(flowData);
        
        // Add custom styling to nodes
        const styledNodes = flowNodes.map(node => ({
          ...node,
          style: {
            ...node.style,
            backgroundColor: node.type === 'input' ? '#d0f0fd' : 
                            node.type === 'output' ? '#ffccd5' : '#f5f5f5',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: '#ccc',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }
        }));
        
        setNodes(styledNodes);
        setEdges(flowEdges);
        
        // Fit view after nodes are rendered
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2 });
          }
        }, 100);
      } catch (error) {
        console.error('Error parsing flowchart data:', error);
        // Fallback to a simple flowchart if parsing fails
        const defaultNodes: Node[] = [
          {
            id: '1',
            type: 'input',
            data: { label: 'Start / Início' },
            position: { x: 250, y: 0 },
            style: { backgroundColor: '#d0f0fd', width: 180, padding: '10px' }
          },
          {
            id: '2',
            data: { label: 'Process Data / Processar Dados' },
            position: { x: 250, y: 150 },
            style: { backgroundColor: '#f5f5f5', width: 180, padding: '10px' }
          },
          {
            id: '3',
            type: 'output',
            data: { label: 'End / Fim' },
            position: { x: 250, y: 300 },
            style: { backgroundColor: '#ffccd5', width: 180, padding: '10px' }
          }
        ];

        const defaultEdges: Edge[] = [
          { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
          { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' }
        ];

        setNodes(defaultNodes);
        setEdges(defaultEdges);
      }
    }
  }, [flowData, setNodes, setEdges, reactFlowInstance]);

  return (
    <div 
      ref={flowContainerRef} 
      className={`relative bg-white rounded-md transition-all duration-300 ${isFullscreen ? 'h-screen w-screen' : 'h-[400px] w-full'}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        fitView
        zoomOnScroll={true}
        attributionPosition="bottom-right"
        nodesDraggable={false}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
      >
        <Controls showInteractive={false} />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable 
          pannable
        />
        <Background color="#f8f8f8" gap={16} />
        <Panel position="top-right">
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-white/80 backdrop-blur-sm border shadow-sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4 mr-1" /> 
            ) : (
              <Fullscreen className="h-4 w-4 mr-1" />
            )}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrap component with ReactFlowProvider
const FlowchartRendererWithProvider = (props: FlowchartRendererProps) => (
  <ReactFlowProvider>
    <FlowchartRenderer {...props} />
  </ReactFlowProvider>
);

export default FlowchartRendererWithProvider;
