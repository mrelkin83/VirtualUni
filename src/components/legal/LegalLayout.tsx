import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';

interface LegalLayoutProps {
  titulo: string;
  actualizado: string;
  children: React.ReactNode;
}

/**
 * Envoltorio compartido por las páginas legales públicas (/privacidad,
 * /terminos): no dependen de sesión ni de tenant, para que se puedan leer
 * antes de iniciar sesión o desde un enlace externo.
 */
export const LegalLayout: React.FC<LegalLayoutProps> = ({ titulo, actualizado, children }) => {
  return (
    <div className="min-h-screen bg-pn-surface-2">
      <header className="bg-pn-surface border-b border-pn-line">
        <div className="max-w-3xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <Link to="/login" className="flex items-center gap-2 text-pn-ink-2 hover:text-pn-ink">
            <GraduationCap className="w-6 h-6 text-pn-accent-text" />
            <span className="font-semibold">VirtualUni</span>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1 text-sm text-pn-accent-text hover:text-pn-accent-text"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-pn-ink mb-2">{titulo}</h1>
        <p className="text-sm text-pn-muted mb-10">Última actualización: {actualizado}</p>

        <div className="prose-legal text-pn-ink-2 leading-relaxed space-y-6">{children}</div>
      </main>

      <footer className="border-t border-pn-line">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-pn-muted flex gap-4">
          <Link to="/terminos" className="hover:text-pn-ink-2">Términos de servicio</Link>
          <Link to="/privacidad" className="hover:text-pn-ink-2">Política de privacidad</Link>
        </div>
      </footer>
    </div>
  );
};
