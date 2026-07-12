/**
 * QA test — AdminRoute component.
 * See testing/01_unit/frontend/README.md for why this lives under src/.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import AdminRoute from '../components/routing/AdminRoute';

function renderWithAuth({ user, loading }) {
  return render(
    <AuthContext.Provider value={{ user, loading }}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<div>Admin Panel</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('AdminRoute', () => {
  test('shows loading state while auth is resolving', () => {
    renderWithAuth({ user: null, loading: true });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('redirects to home when user is not authenticated', () => {
    renderWithAuth({ user: null, loading: false });
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  test('redirects to home when user is authenticated but NOT admin', () => {
    renderWithAuth({ user: { id: '1', role: 'user' }, loading: false });
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  test('renders admin content when user has role=admin', () => {
    renderWithAuth({ user: { id: '1', role: 'admin' }, loading: false });
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  test('SECURITY: role check is case-sensitive and exact-match — "Admin" (capitalized) must NOT pass', () => {
    renderWithAuth({ user: { id: '1', role: 'Admin' }, loading: false });
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });
});
