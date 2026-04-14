'use client';

interface TeamLogoProps {
  logo: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-6 h-6 text-lg',
  md: 'w-8 h-8 text-2xl',
  lg: 'w-10 h-10 text-3xl',
  xl: 'w-14 h-14 text-5xl',
};

export function TeamLogo({ logo, name, size = 'lg' }: TeamLogoProps) {
  const cls = sizeMap[size];
  const isUrl = logo.startsWith('http');

  if (isUrl) {
    return (
      <img
        src={logo}
        alt={name}
        className={`${cls} object-contain`}
      />
    );
  }

  return <span className={cls.split(' ').pop()}>{logo}</span>;
}
