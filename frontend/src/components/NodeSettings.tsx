import React from 'react';
import { Cpu, Zap, Info } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';
import { useChessSound } from '../hooks/useSound';
import { clsx } from 'clsx';

interface NodeSettingsProps {
  currentNodes: number;
  onNodesChange: (nodes: number) => void;
  disabled: boolean;
}

// Allow between 1 and 10 nodes – Render free tier can handle this range
const MIN_NODES = 1;
const MAX_NODES = 10;

export const NodeSettings: React.FC<NodeSettingsProps> = ({
  currentNodes,
  onNodesChange,
  disabled,
}) => {
  const { isMobile } = useDeviceType();
  const { playSound } = useChessSound();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    onNodesChange(value);
    playSound('buttonClick');
  };

  return (
    <div
      className={clsx(
        'game-panel space-y-4',
        isMobile && 'game-panel-mobile'
      )}
    >
      <h3
        className={clsx(
          'font-semibold text-gray-800 flex items-center space-x-2',
          isMobile ? 'text-base' : 'text-lg'
        )}
      >
        <Cpu className={clsx('w-5 h-5 text-purple-600', isMobile && 'w-4 h-4')} />
        <span>Search Depth</span>
        {!disabled && <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />}
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Nodes ({currentNodes})
          </label>
          <div className="flex items-center space-x-1">
            <Info className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">
              {disabled ? 'In Game' : 'Adjustable'}
            </span>
          </div>
        </div>

        <input
          type="range"
          min={MIN_NODES}
          max={MAX_NODES}
          value={currentNodes}
          onChange={handleChange}
          disabled={disabled}
          className={clsx(
            'skill-slider w-full',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        {/* Marker labels */}
        <div className="flex justify-between mt-2 px-1">
          {[...Array(MAX_NODES - MIN_NODES + 1)].map((_, i) => {
            const nodeVal = i + MIN_NODES;
            return (
              <div
                key={nodeVal}
                className={clsx(
                  'text-xs text-center',
                  nodeVal === currentNodes ? 'text-purple-600 font-bold' : 'text-gray-400'
                )}
              >
                {nodeVal}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};