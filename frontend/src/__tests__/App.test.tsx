import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from '../App';

// Mock the hooks and components
vi.mock('../hooks/useDeviceType', () => ({
  useDeviceType: vi.fn(() => ({
    isMobile: false,
    isTablet: false,
    isTouch: false,
    orientation: 'landscape',
  })),
}));

vi.mock('../components/ChessGame', () => ({
  ChessGame: () => <div data-testid="chess-game">Chess Game Component</div>,
}));

vi.mock('../components/Header', () => ({
  Header: () => <div data-testid="header">Header Component</div>,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders header component', () => {
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders chess game component', () => {
    render(<App />);
    expect(screen.getByTestId('chess-game')).toBeInTheDocument();
  });

  it('has proper app structure', () => {
    render(<App />);
    const appContainer = screen.getByTestId('chess-game').closest('.min-h-screen');
    expect(appContainer).toBeInTheDocument();
  });

  it('applies correct background gradient classes', () => {
    const { container } = render(<App />);
    const appDiv = container.firstChild;
    expect(appDiv).toHaveClass('bg-gradient-to-br');
  });

  it('has proper main element with container classes', () => {
    render(<App />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });
});