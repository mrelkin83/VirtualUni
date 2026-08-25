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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">VirtualUni</span>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{titulo}</h1>
        <p className="text-sm text-gray-500 mb-10">Última actualización: {actualizado}</p>

        <div className="prose-legal text-gray-700 leading-relaxed space-y-6">{children}</div>
      </main>

      <footer className="border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-6 text-sm text-gray-500 flex gap-4">
          <Link to="/terminos" className="hover:text-gray-700">Términos de servicio</Link>
          <Link to="/privacidad" className="hover:text-gray-700">Política de privacidad</Link>
        </div>
      </footer>
    </div>
  );
};
