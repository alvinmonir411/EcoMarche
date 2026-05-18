import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, center = false }) => {
  return (
    <div className={`mb-6 md:mb-16 ${center ? 'md:text-center' : ''}`}>
      <h2 className="text-2xl md:text-4xl font-black text-secondary mb-2 md:mb-4 tracking-tighter leading-none">{title}</h2>
      {subtitle && <p className="hidden md:block text-muted text-sm font-medium tracking-wide max-w-lg">{subtitle}</p>}
      <div className={`h-[3px] w-10 md:w-12 bg-primary mt-3 md:mt-6 ${center ? 'md:mx-auto' : ''}`}></div>
    </div>
  );
};

export default SectionTitle;
