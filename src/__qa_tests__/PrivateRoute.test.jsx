/**
 * QA test — PrivateRoute component.
 * NOT part of the shipped app; lives here only because CRA's Jest config
 * hardcodes `roots: ['<rootDir>/src']` and cannot discover tests elsewhere.
 * See testing/01_unit/frontend/README.md for the full explanation.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import PrivateRoute from '../components/routing/PrivateRoute';

function renderWithAuth({ user, loading }) {
  return render(
    <AuthContext.Provider value={{ user, loading }}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('PrivateRoute', () => {
  test('shows loading state while auth is resolving', () => {
    renderWithAuth({ user: null, loading: true });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('redirects to /login when user is not authenticated', () => {
    renderWithAuth({ user: null, loading: false });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders protected content when user is authenticated', () => {
    renderWithAuth({ user: { id: '1', email: 'qa@test.com' }, loading: false });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
