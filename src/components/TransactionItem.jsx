import React from 'react';

/**
 * TransactionItem Component
 * Displays a single transaction in transaction history
 *
 * Props:
 *   transaction: Object - Transaction data
 */
const TransactionItem = ({ transaction }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'win':
        return '✓';
      case 'loss':
        return '✗';
      case 'deposit':
        return '+';
      case 'withdrawal':
        return '-';
      case 'bonus':
        return '🎁';
      default:
        return '•';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'win':
      case 'deposit':
      case 'bonus':
        return 'positive';
      case 'loss':
      case 'withdrawal':
        return 'negative';
      default:
        return 'neutral';
    }
  };

  const amountColor = transaction.amount >= 0 ? 'positive' : 'negative';

  return (
    <div className="transaction-item">
      <div className="transaction-left">
        <div className={`transaction-icon icon-${getTransactionColor(transaction.type)}`}>
          {getTransactionIcon(transaction.type)}
        </div>
        <div className="transaction-info">
          <p className="transaction-description">{transaction.description}</p>
          {transaction.game && (
            <span className="transaction-game-badge">{transaction.game}</span>
          )}
          <span className="transaction-date">{transaction.date}</span>
        </div>
      </div>

      <div className="transaction-right">
        <span className={`transaction-amount amount-${amountColor}`}>
          {transaction.amount >= 0 ? '+' : ''}₺{transaction.amount}
        </span>
        <span className="transaction-balance">
          Balance: ₺{transaction.balance?.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default TransactionItem;
