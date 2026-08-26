import React from 'react';

export const metadata = {
  title: 'Checklist PDV',
  description: 'Aplicação de Checklist de Operações PDV',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
