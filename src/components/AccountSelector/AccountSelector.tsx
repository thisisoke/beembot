import type { Account } from '../../types';
import './AccountSelector.css';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccount: Account | null;
  onSelect: (account: Account) => void;
}

export function AccountSelector({ accounts, selectedAccount, onSelect }: AccountSelectorProps) {
  return (
    <div className="account-selector">
      {accounts.map((account) => {
        const isSelected = selectedAccount?.id === account.id;
        return (
          <button
            key={account.id}
            className={`account-option ${isSelected ? 'account-option--selected' : ''}`}
            onClick={() => onSelect(account)}
          >
            <div className="account-option-details">
              <span className="account-option-name">{account.name}</span>
              <span className="account-option-meta">
                {account.type} ####{account.lastFour}
              </span>
            </div>
            {isSelected && (
              <svg className="account-option-check" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="#1565c0" />
                <polyline points="7 12 10 15 17 9" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
