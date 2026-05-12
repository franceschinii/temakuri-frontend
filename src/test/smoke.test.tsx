import { render, screen } from '@testing-library/react';

describe('vitest setup', () => {
  it('renders a React element into happy-dom', () => {
    render(<button>Hello Temakuri</button>);
    expect(screen.getByRole('button', { name: /hello temakuri/i })).toBeInTheDocument();
  });
});
