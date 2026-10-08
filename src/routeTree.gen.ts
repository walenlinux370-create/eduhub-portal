/* eslint-disable */

// @ts-nocheck

// Generated route tree including the public portal and protected AdminEdu routes.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AdmissoesRouteImport } from './routes/admissoes'
import { Route as ContactosRouteImport } from './routes/contactos'
import { Route as EnsinoRouteImport } from './routes/ensino'
import { Route as NoticiasRouteImport } from './routes/noticias'
import { Route as PrivacidadeRouteImport } from './routes/privacidade'
import { Route as SobreRouteImport } from './routes/sobre'
import { Route as PortalRouteImport } from './routes/portal'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as AdminLoginRouteImport } from './routes/admin.login'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const AdmissoesRoute = AdmissoesRouteImport.update({ id: '/admissoes', path: '/admissoes', getParentRoute: () => rootRouteImport } as any)
const ContactosRoute = ContactosRouteImport.update({ id: '/contactos', path: '/contactos', getParentRoute: () => rootRouteImport } as any)
const EnsinoRoute = EnsinoRouteImport.update({ id: '/ensino', path: '/ensino', getParentRoute: () => rootRouteImport } as any)
const NoticiasRoute = NoticiasRouteImport.update({ id: '/noticias', path: '/noticias', getParentRoute: () => rootRouteImport } as any)
const PrivacidadeRoute = PrivacidadeRouteImport.update({ id: '/privacidade', path: '/privacidade', getParentRoute: () => rootRouteImport } as any)
const SobreRoute = SobreRouteImport.update({ id: '/sobre', path: '/sobre', getParentRoute: () => rootRouteImport } as any)
const PortalRoute = PortalRouteImport.update({ id: '/portal', path: '/portal', getParentRoute: () => rootRouteImport } as any)
const AdminRoute = AdminRouteImport.update({ id: '/admin', path: '/admin', getParentRoute: () => rootRouteImport } as any)
const AdminLoginRoute = AdminLoginRouteImport.update({ id: '/admin/login', path: '/admin/login', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admissoes': typeof AdmissoesRoute
  '/contactos': typeof ContactosRoute
  '/ensino': typeof EnsinoRoute
  '/noticias': typeof NoticiasRoute
  '/privacidade': typeof PrivacidadeRoute
  '/sobre': typeof SobreRoute
  '/portal': typeof PortalRoute
  '/admin': typeof AdminRoute
  '/admin/login': typeof AdminLoginRoute
}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/admissoes': typeof AdmissoesRoute
  '/contactos': typeof ContactosRoute
  '/ensino': typeof EnsinoRoute
  '/noticias': typeof NoticiasRoute
  '/privacidade': typeof PrivacidadeRoute
  '/sobre': typeof SobreRoute
  '/portal': typeof PortalRoute
  '/admin': typeof AdminRoute
  '/admin/login': typeof AdminLoginRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/admissoes' | '/contactos' | '/ensino' | '/noticias' | '/privacidade' | '/sobre' | '/portal' | '/admin' | '/admin/login'
  fileRoutesByTo: FileRoutesByTo
  fileRoutesById: FileRoutesById
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/admissoes' | '/contactos' | '/ensino' | '/noticias' | '/privacidade' | '/sobre' | '/portal' | '/admin' | '/admin/login'
  id: '__root__' | '/' | '/admissoes' | '/contactos' | '/ensino' | '/noticias' | '/privacidade' | '/sobre' | '/portal' | '/admin' | '/admin/login'
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdmissoesRoute: typeof AdmissoesRoute
  ContactosRoute: typeof ContactosRoute
  EnsinoRoute: typeof EnsinoRoute
  NoticiasRoute: typeof NoticiasRoute
  PrivacidadeRoute: typeof PrivacidadeRoute
  SobreRoute: typeof SobreRoute
  PortalRoute: typeof PortalRoute
  AdminRoute: typeof AdminRoute
  AdminLoginRoute: typeof AdminLoginRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/admissoes': { id: '/admissoes'; path: '/admissoes'; fullPath: '/admissoes'; preLoaderRoute: typeof AdmissoesRouteImport; parentRoute: typeof rootRouteImport }
    '/contactos': { id: '/contactos'; path: '/contactos'; fullPath: '/contactos'; preLoaderRoute: typeof ContactosRouteImport; parentRoute: typeof rootRouteImport }
    '/ensino': { id: '/ensino'; path: '/ensino'; fullPath: '/ensino'; preLoaderRoute: typeof EnsinoRouteImport; parentRoute: typeof rootRouteImport }
    '/noticias': { id: '/noticias'; path: '/noticias'; fullPath: '/noticias'; preLoaderRoute: typeof NoticiasRouteImport; parentRoute: typeof rootRouteImport }
    '/privacidade': { id: '/privacidade'; path: '/privacidade'; fullPath: '/privacidade'; preLoaderRoute: typeof PrivacidadeRouteImport; parentRoute: typeof rootRouteImport }
    '/sobre': { id: '/sobre'; path: '/sobre'; fullPath: '/sobre'; preLoaderRoute: typeof SobreRouteImport; parentRoute: typeof rootRouteImport }
    '/portal': { id: '/portal'; path: '/portal'; fullPath: '/portal'; preLoaderRoute: typeof PortalRouteImport; parentRoute: typeof rootRouteImport }
    '/admin': { id: '/admin'; path: '/admin'; fullPath: '/admin'; preLoaderRoute: typeof AdminRouteImport; parentRoute: typeof rootRouteImport }
    '/admin/login': { id: '/admin/login'; path: '/admin/login'; fullPath: '/admin/login'; preLoaderRoute: typeof AdminLoginRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute,
  AdmissoesRoute,
  ContactosRoute,
  EnsinoRoute,
  NoticiasRoute,
  PrivacidadeRoute,
  SobreRoute,
  PortalRoute,
  AdminRoute,
  AdminLoginRoute,
}

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'

declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
