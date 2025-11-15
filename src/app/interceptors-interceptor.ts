import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ✅ ESCLUDI le rotte pubbliche (login, register, ecc.)
  const publicRoutes = ['/api/auth/', '/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
  
  console.log('🔐 Auth Interceptor attivato');
  console.log('🌐 URL richiesta:', req.url);
  console.log('🔓 È una rotta pubblica?', isPublicRoute ? 'SI (skip token)' : 'NO');
  
  // Se è una rotta pubblica, passa la richiesta senza modificarla
  if (isPublicRoute) {
    console.log('⏭️ Rotta pubblica, skip interceptor');
    return next(req);
  }
  
  const token = localStorage.getItem('token');
  console.log('🔑 Token presente:', token ? 'SI ✅' : 'NO ❌');
  
  // Se c'è un token, clona la richiesta e aggiungi l'header Authorization
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Token aggiunto all\'header Authorization');
    console.log('📤 Headers:', clonedRequest.headers.keys());
    
    return next(clonedRequest);
  }
  
  console.log('⚠️ Nessun token trovato, richiesta inviata senza Authorization');
  return next(req);
};