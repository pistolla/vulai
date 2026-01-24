import { League, Match } from "@/models";
import { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { firebaseLeagueService } from "@/services/firebaseCorrespondence";

interface LeagueVisualizerProps {
  league: League;
}

export const LeagueVisualizer: React.FC<LeagueVisualizerProps> = ({ league }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if ((node.data as any)?.match) {
      setSelectedMatch((node.data as any).match);
    }
  }, []);

  useEffect(() => {
    const loadLeagueData = async () => {
      try {
        const groups = await firebaseLeagueService.listGroups(league.id!);
        const allNodes: Node[] = [];
        const allEdges: Edge[] = [];
        let nodeId = 1;

        for (const group of groups) {
          const stages = await firebaseLeagueService.listStages(league.id!, group.id!);

          for (const stage of stages) {
            const matches = await firebaseLeagueService.listMatches(league.id!, group.id!, stage.id!);

            // Add stage node
            allNodes.push({
              id: `stage-${stage.id}`,
              type: 'default',
              position: { x: 100 + (stages.indexOf(stage) * 300), y: 100 + (groups.indexOf(group) * 200) },
              data: {
                label: `${stage.name} (${stage.type})`,
                stage,
                group
              },
              style: {
                background: '#e3f2fd',
                border: '2px solid #2196f3',
                borderRadius: '8px',
                padding: '10px',
              },
            });

            // Connect stage to matches
            matches.forEach((match, index) => {
              const matchNodeId = `match-${match.id}`;
              allNodes.push({
                id: matchNodeId,
                type: 'default',
                position: {
                  x: 100 + (stages.indexOf(stage) * 300) + (index % 2) * 150,
                  y: 200 + (groups.indexOf(group) * 300) + Math.floor(index / 2) * 100
                },
                data: {
                  label: `Match #${match.matchNumber}`,
                  match
                },
                style: {
                  background: match.status === 'completed' ? '#c8e6c9' : '#fff3e0',
                  border: `2px solid ${match.status === 'completed' ? '#4caf50' : '#ff9800'}`,
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  fontSize: '10px'
                },
              });

              allEdges.push({
                id: `edge-${stage.id}-${match.id}`,
                source: `stage-${stage.id}`,
                target: matchNodeId,
                type: 'smoothstep',
                style: { stroke: '#666', strokeDasharray: '5,5' },
              });
            });

            // Connect stages based on parentStageId
            if (stage.parentStageId) {
              allEdges.push({
                id: `stage-edge-${stage.parentStageId}-${stage.id}`,
                source: `stage-${stage.parentStageId}`,
                target: `stage-${stage.id}`,
                type: 'bezier',
                label: 'leads to',
                animated: true,
                style: { stroke: '#2196f3', strokeWidth: 3 },
              });
            }
          }
        }

        setNodes(allNodes as any);
        setEdges(allEdges as any);
      } catch (error) {
        console.error('Failed to load league data for visualization:', error);
      }
    };

    if (league.id) {
      loadLeagueData();
    }
  }, [league.id, setNodes, setEdges]);

  return (
    <div className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>

      {selectedMatch && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg border max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Match #{selectedMatch.matchNumber}
            </h3>
            <button
              onClick={() => setSelectedMatch(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Date:</strong> {new Date(selectedMatch.date).toLocaleString()}</p>
            <p><strong>Venue:</strong> {selectedMatch.venue || 'TBD'}</p>
            <p><strong>Status:</strong> {selectedMatch.status}</p>
            <div>
              <strong>Participants:</strong>
              <ul className="mt-1">
                {selectedMatch.participants.map((p, idx) => (
                  <li key={idx} className="text-xs">
                    {p.name || p.refId} {p.score > 0 && `(Score: ${p.score})`}
                  </li>
                ))}
              </ul>
            </div>
            {selectedMatch.winnerId && (
              <p><strong>Winner:</strong> {selectedMatch.participants.find(p => p.refId === selectedMatch.winnerId)?.name || selectedMatch.winnerId}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};