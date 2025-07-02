import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ChessGame } from '../ChessGame';

// Basic smoke-test to ensure the component renders without crashing.
describe('ChessGame component', () => {
  it('renders board and controls', () => {
    render(<ChessGame />);

    // Game controls present
    expect(screen.getByText(/new game/i)).toBeInTheDocument();
  });
});