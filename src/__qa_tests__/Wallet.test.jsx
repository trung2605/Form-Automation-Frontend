/**
 * QA test — Wallet component (money-handling UI, high risk area).
 * See testing/01_unit/frontend/README.md for why this lives under src/.
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axiosClient from '../services/axiosClient';
import Wallet from '../pages/Wallet/Wallet';

jest.mock('../services/axiosClient');
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), warn: jest.fn() },
}));

const mockUser = { id: 'qa1', email: 'qa@test.com', wallet_balance: 42 };

function renderWallet(user = mockUser) {
  return render(
    <AuthContext.Provider value={{ user, refreshWallet: jest.fn() }}>
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  axiosClient.get.mockResolvedValue({ data: [] });
});

describe('Wallet — balance display', () => {
  test('renders current balance from AuthContext user object', async () => {
    renderWallet();
    expect(await screen.findByText(/42/)).toBeInTheDocument();
  });

  test('renders 0 balance gracefully when wallet_balance is missing/undefined', async () => {
    renderWallet({ id: 'qa2', email: 'x@test.com' }); // no wallet_balance field
    await waitFor(() => {
      expect(screen.getByText(/0/).closest('.balance-amount')).toBeInTheDocument();
    });
  });
});

describe('Wallet — transaction history', () => {
  test('shows loading state, then empty state when no transactions exist', async () => {
    renderWallet();
    await waitFor(() => {
      expect(screen.getByText(/chưa có giao dịch/i)).toBeInTheDocument();
    });
  });

  test('renders transaction history table when transactions exist', async () => {
    axiosClient.get.mockResolvedValue({
      data: [
        {
          id: 'tx1', amount: 500, type: 'deposit', status: 'completed',
          description: 'Nạp 500 credits', created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'tx2', amount: -1, type: 'text_to_voice', status: 'completed',
          description: 'Text to Voice', created_at: '2026-01-02T00:00:00Z',
        },
      ],
    });
    renderWallet();
    expect(await screen.findByText('Nạp 500 credits')).toBeInTheDocument();
    expect(screen.getByText('+500')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  test('positive amount is styled/labeled as deposit, negative as spend', async () => {
    axiosClient.get.mockResolvedValue({
      data: [{ id: 'tx1', amount: 100, type: 'deposit', status: 'completed', description: 'x', created_at: '2026-01-01T00:00:00Z' }],
    });
    renderWallet();
    expect(await screen.findByText('Nạp tiền')).toBeInTheDocument();
  });

  test('pending transaction status displayed distinctly from completed', async () => {
    axiosClient.get.mockResolvedValue({
      data: [{ id: 'tx1', amount: 500, type: 'deposit', status: 'pending', description: 'x', created_at: '2026-01-01T00:00:00Z' }],
    });
    renderWallet();
    expect(await screen.findByText(/chờ thanh toán/i)).toBeInTheDocument();
  });
});

describe('Wallet — custom deposit validation (client-side)', () => {
  test('rejects deposit amount below 20 credits without calling the API', async () => {
    renderWallet();
    await screen.findByText(/chưa có giao dịch/i);

    const input = screen.getByRole('spinbutton'); // type="number" input
    fireEvent.change(input, { target: { value: '5' } });

    const submitBtn = screen.getByRole('button', { name: /thanh toán/i });
    fireEvent.click(submitBtn);

    // create-payment-link should NOT have been called for an invalid amount
    expect(axiosClient.post).not.toHaveBeenCalled();
  });

  test('accepts deposit amount >= 20 and calls create-payment-link with correct credits', async () => {
    axiosClient.post.mockResolvedValue({ data: { checkoutUrl: 'https://payos.test/checkout/abc' } });
    delete window.location;
    window.location = { href: '' };

    renderWallet();
    await screen.findByText(/chưa có giao dịch/i);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '100' } });

    const submitBtn = screen.getByRole('button', { name: /thanh toán/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith('/payment/create-payment-link', { credits: 100 });
    });
  });

  test('FINDING: negative deposit amount is not blocked by the <20 check as one might assume', async () => {
    /**
     * The component's guard is `if (depositAmount < 20)`. A negative number
     * like -50 IS < 20, so it correctly gets rejected too — this test just
     * documents/confirms that the same guard also covers negative input,
     * not just "too small positive" input. Included because money-input
     * validation deserves an explicit negative-number check rather than
     * assuming a single `< 20` comparison covers it (it does here, but the
     * assumption should be verified, not inferred).
     */
    renderWallet();
    await screen.findByText(/chưa có giao dịch/i);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '-50' } });

    const submitBtn = screen.getByRole('button', { name: /thanh toán/i });
    fireEvent.click(submitBtn);

    expect(axiosClient.post).not.toHaveBeenCalled();
  });
});

describe('Wallet — package purchase buttons', () => {
  test('clicking a package button calls create-payment-link with package_id', async () => {
    axiosClient.post.mockResolvedValue({ data: { checkoutUrl: 'https://payos.test/checkout/xyz' } });
    delete window.location;
    window.location = { href: '' };

    renderWallet();
    await screen.findByText(/chưa có giao dịch/i);

    const starterBtn = screen.getAllByText('Mua gói này')[0];
    fireEvent.click(starterBtn);

    await waitFor(() => {
      expect(axiosClient.post).toHaveBeenCalledWith('/payment/create-payment-link', { package_id: 'starter' });
    });
  });
});
