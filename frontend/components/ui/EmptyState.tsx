import React from 'react';
import Link from 'next/link';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonText?: string;
  buttonHref?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, buttonText, buttonHref }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50 rounded-xl">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 8-8-8" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-secondary mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-8">{message}</p>
      {buttonText && buttonHref && (
        <Link href={buttonHref}>
          <Button>{buttonText}</Button>
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
