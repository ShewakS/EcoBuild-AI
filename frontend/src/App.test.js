import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders EcoBuild AI heading', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const heading = screen.getByText(/EcoBuild AI/i);
  expect(heading).toBeInTheDocument();
});
