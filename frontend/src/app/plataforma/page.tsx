"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from "@/contexts/AuthContext";

export default function PlataformaPage() {
  const router = useRouter();
  const { loginWithGoogle, isAuthenticated, isLoading, sessionStatus, concurrentSessionId } = useAuth();
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConcurrentModal, setShowConcurrentModal] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && sessionStatus === 'ACTIVE') {
      router.push('/plataforma/inicio');
    }
  }, [isAuthenticated, sessionStatus, router]);

  // Detectar estados especiales de sesión
  useEffect(() => {
    if (sessionStatus === 'PENDING_CONCURRENT_RESOLUTION') {
      setShowConcurrentModal(true);
    } else if (sessionStatus === 'BLOCKED_PENDING_REAUTH') {
      setShowReauthModal(true);
    }
  }, [sessionStatus]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        setIsLoggingIn(true);
        setError(null);
        await loginWithGoogle(codeResponse.code);
      } catch (err) {
        console.error('Error en login:', err);
        setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: (error) => {
      console.error('Error de Google OAuth:', error);
      setError('Error al conectar con Google');
    },
    flow: 'auth-code',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-deep-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Photo with Welcome Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-deep-blue-700 relative overflow-hidden">
        {/* Decorative Ellipses */}
        <div className="absolute w-[200px] h-[200px] rounded-full bg-magenta-violet-600 -left-[35px] bottom-[484px]" />
        <div className="absolute w-[200px] h-[200px] rounded-full bg-magenta-violet-600 right-[46px] top-[46px]" />
        <div className="absolute w-[100px] h-[100px] rounded-full bg-magenta-violet-600 right-[50px] -top-[50px]" />
        <div className="absolute w-[100px] h-[100px] rounded-full bg-magenta-violet-600 -left-[50px] bottom-[375px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-5 px-[100px] py-20 w-full">
          {/* Image */}
          <div className="w-[219px] h-[302px] relative">
            <Image
              src="/images/login/login-photo-531b23.png"
              alt="Estudiante"
              fill
              className="object-cover scale-x-[-1]"
              priority
            />
          </div>

          {/* Welcome Text */}
          <h3 className="text-white text-[40px] font-bold leading-[1.2em] tracking-[-0.01em] text-center w-full">
            ¡Bienvenido de nuevo!
          </h3>

          {/* Description */}
          <p className="text-white text-[18px] font-medium leading-[1.11em] text-center w-full">
            Accede a tus clases grabadas y materiales para asegurar tu éxito en
            la PUCP.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-end justify-center gap-6 px-6 sm:px-12 lg:px-[120px] py-20 lg:py-[200px] bg-white">
        {/* Title */}
        <h5 className="text-gray-900 text-[28px] font-bold leading-[1.14em] tracking-[-0.007em] text-center w-full">
          Ingresar a la Plataforma
        </h5>

        {/* Subtitle */}
        <p className="text-gray-700 text-[15px] font-normal leading-[1.13em] text-center w-full">
          Ingresa con tu correo PUCP para continuar con tu aprendizaje.
        </p>

        {/* Google Sign-In Button - Secondary style with icon */}
        <button
          onClick={() => handleGoogleLogin()}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-deep-blue-700 border border-deep-blue-700 rounded-lg font-medium text-base leading-[1.06em] tracking-[-0.011em] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <>
              <div className="w-5 h-5 border-2 border-deep-blue-700 border-t-transparent rounded-full animate-spin"></div>
              Iniciando sesión...
            </>
          ) : (
            <>
              {/* Google Icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.3333 10.2334C18.3333 9.54998 18.2749 8.89998 18.1666 8.26665H9.99992V11.9583H14.6999C14.5083 13.0083 13.9249 13.9 13.0583 14.5083V16.7916H15.8083C17.3749 15.3583 18.3333 13.0583 18.3333 10.2334Z"
                  fill="#4285F4"
                />
                <path
                  d="M9.99992 18.9999C12.5416 18.9999 14.6749 18.1333 15.8083 16.7916L13.0583 14.5083C12.3166 15.0166 11.3583 15.3249 9.99992 15.3249C7.54159 15.3249 5.46659 13.8833 4.63325 11.7583H1.79159V14.1083C2.92492 16.3666 5.26659 18.9999 9.99992 18.9999Z"
                  fill="#34A853"
                />
                <path
                  d="M4.63325 11.7583C4.47492 11.25 4.38325 10.7083 4.38325 10.1666C4.38325 9.62498 4.47492 9.08331 4.63325 8.57498V6.22498H1.79159C1.23325 7.34165 0.916585 8.59165 0.916585 10.1666C0.916585 11.7416 1.23325 12.9916 1.79159 14.1083L4.13325 12.2083L4.63325 11.7583Z"
                  fill="#FBBC05"
                />
                <path
                  d="M9.99992 4.99998C11.4833 4.99998 12.7999 5.52498 13.8416 6.50831L16.2916 4.05831C14.6749 2.48331 12.5416 1.58331 9.99992 1.58331C5.26659 1.58331 2.92492 4.21665 1.79159 6.47498L4.63325 8.82498C5.46659 6.69998 7.54159 4.99998 9.99992 4.99998Z"
                  fill="#EA4335"
                />
              </svg>
              Iniciar Sesión con Google
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Concurrent Session Modal */}
        {showConcurrentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Sesión activa detectada
              </h3>
              <p className="text-gray-600 mb-6">
                Ya tienes una sesión activa en otro dispositivo. ¿Qué deseas hacer?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Implementar resolución
                    setShowConcurrentModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-deep-blue-700 text-white rounded-lg hover:bg-deep-blue-800 transition-colors"
                >
                  Cerrar otra sesión
                </button>
                <button
                  onClick={() => {
                    setShowConcurrentModal(false);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reauth Modal */}
        {showReauthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Verificación de seguridad requerida
              </h3>
              <p className="text-gray-600 mb-6">
                Detectamos actividad inusual. Por favor, vuelve a autenticarte con Google para continuar.
              </p>
              <button
                onClick={() => handleGoogleLogin()}
                className="w-full px-4 py-2 bg-deep-blue-700 text-white rounded-lg hover:bg-deep-blue-800 transition-colors"
              >
                Re-autenticar con Google
              </button>
            </div>
          </div>
        )}

        {/* Bottom Text with Link */}
        <div className="w-full flex items-center justify-center gap-0.5">
          <span className="text-gray-600 text-[14px] font-normal leading-[1.14em]">
            ¿Aún no eres parte de la academia?
          </span>
          <Link
            href="/#contacto"
            className="text-deep-blue-700 text-[13px] font-medium leading-[1em] tracking-[-0.012em] px-0.5 py-0.5 rounded hover:underline transition-all"
          >
            ¡Inscríbete ahora!
          </Link>
        </div>
      </div>
    </div>
  );
}
