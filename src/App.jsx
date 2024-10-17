import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import topicNode from './TopicNode';
import NodeToolBar from './component/NodeToolBar';
import './component/NodeToolBar.css';
import subTopicNode from './subtopicNode';
import SideBar from './component/SideBar';
import titleNode from './titleNode'

const nodeTypes = { topicNode, subTopicNode , titleNode};

function App() {

  const sizeMap = {
    S: '12px',
    M: '16px',
    L: '20px',
    XL: '24px',
    XXL: '30px',
  };
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null); 

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onEdgeClick = (event, edge) => {
    setSelectedEdge(edge); 
  };

  const onNodesDelete = useCallback(
    (deletedNodes) => {
      const deletedNodeIds = deletedNodes.map((node) => node.id);
      setNodes((nds) => nds.filter((node) => !deletedNodeIds.includes(node.id)));
      setEdges((eds) => eds.filter((edge) => !deletedNodeIds.includes(edge.source) && !deletedNodeIds.includes(edge.target)));
    },
    [setNodes, setEdges]
  );

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const nodeType = event.dataTransfer.getData('application/reactflow');

    if (!nodeType) return;
    console.log(nodeType);

    const canvasBounds = event.target.getBoundingClientRect();
    const position = {
      x: event.clientX - canvasBounds.left,
      y: event.clientY - canvasBounds.top,
    };
    var a = ''
    if(nodeType === 'topicNode'){
      a = 'topicNode'
    }
    else if(nodeType === 'subTopicNode'){
      a = 'subtopicNode'
    }
    else{
      a = 'titleNode'
    }
    const newNode = {
      id: `node-${nodeIdCounter}`,
      type: nodeType,
      position,
      data: { 
        value: a,
        width: 150,
        height: 100,

      },
    };

    setNodes((nds) => nds.concat(newNode));
    setNodeIdCounter((prevId) => prevId + 1);
  }, [nodes, setNodes, nodeIdCounter]);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onNodeDoubleClick = (event, node) => {
    setSelectedNode(node);
    const handleNodeMeasurement = (id, width, height) => {
      setSelectedNode(prevNode => 
        prevNode && prevNode.id === id 
          ? { ...prevNode, data: { ...prevNode.data, width, height }} 
          : prevNode
      );
    };
  
    setNodes(nds => 
      nds.map(n => ( {
        ...n,
        data: {
          ...n.data,
          onSelect: n.id === node.id ? handleNodeMeasurement : undefined
        }
      }))
    );
    setSidebarVisible(true);
  };

  const handleSidebarClose = () => {
    setSidebarVisible(false);
  };

  return (
    <div>
      <NodeToolBar 
        selectedEdge={selectedEdge} 
        setEdges={setEdges} 
      />
      <div
        style={{
          width: 'calc(80vw - 37px)', 
          height: '100vh',
          position: 'absolute',
          right: 0,
          top: 0,
          border: '1px solid black',
          marginLeft: '20vw', 
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          edges={edges}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeClick={onEdgeClick} 
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      {sidebarVisible && selectedNode && (
        <SideBar
          selectedNode={selectedNode}
          setNodes={setNodes}
          setSelectedNode={setSelectedNode} 
          onClose={handleSidebarClose}
        />
      )}
    </div>
  );
}

export default App;
