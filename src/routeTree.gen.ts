/* eslint-disable */

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AdmissoesRouteImport } from './routes/admissoes'
import { Route as ContactosRouteImport } from './routes/contactos'
import { Route as EnsinoRouteImport } from './routes/ensino'
import { Route as NoticiasRouteImport } from './routes/noticias'
import { Route as SobreRouteImport } from './routes/sobre'
import { Route as PrivacidadeRouteImport } from './routes/privacidade'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as AdminLoginRouteImport } from './routes/admin.login'
import { Route as AdminRedefinirRouteImport } from './routes/admin.redefinir'
import { Route as AdminAlunosRouteImport } from './routes/admin.alunos'
import { Route as AdminTurmasRouteImport } from './routes/admin.turmas'
import { Route as AdminProfessoresRouteImport } from './routes/admin.professores'
import { Route as AdminDisciplinasRouteImport } from './routes/admin.disciplinas'
import { Route as AdminNotasRouteImport } from './routes/admin.notas'
import { Route as AdminPresencasRouteImport } from './routes/admin.presencas'
import { Route as AdminMateriaisRouteImport } from './routes/admin.materiais'
import { Route as AdminNoticiasRouteImport } from './routes/admin.noticias'
import { Route as AdminAuditoriaRouteImport } from './routes/admin.auditoria'
import { Route as AdminDefinicoesRouteImport } from './routes/admin.definicoes'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const AdmissoesRoute = AdmissoesRouteImport.update({ id: '/admissoes', path: '/admissoes', getParentRoute: () => rootRouteImport } as any)
const ContactosRoute = ContactosRouteImport.update({ id: '/contactos', path: '/contactos', getParentRoute: () => rootRouteImport } as any)
const EnsinoRoute = EnsinoRouteImport.update({ id: '/ensino', path: '/ensino', getParentRoute: () => rootRouteImport } as any)
const NoticiasRoute = NoticiasRouteImport.update({ id: '/noticias', path: '/noticias', getParentRoute: () => rootRouteImport } as any)
const SobreRoute = SobreRouteImport.update({ id: '/sobre', path: '/sobre', getParentRoute: () => rootRouteImport } as any)
const PrivacidadeRoute = PrivacidadeRouteImport.update({ id: '/privacidade', path: '/privacidade', getParentRoute: () => rootRouteImport } as any)
const AdminRoute = AdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminLoginRoute = AdminLoginRouteImport.update({
  id: '/admin/login',
  path: '/admin/login',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminRedefinirRoute = AdminRedefinirRouteImport.update({
  id: '/admin/redefinir',
  path: '/admin/redefinir',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminAlunosRoute = AdminAlunosRouteImport.update({
  id: '/admin/alunos',
  path: '/admin/alunos',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminTurmasRoute = AdminTurmasRouteImport.update({
  id: '/admin/turmas',
  path: '/admin/turmas',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminProfessoresRoute = AdminProfessoresRouteImport.update({
  id: '/admin/professores',
  path: '/admin/professores',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminDisciplinasRoute = AdminDisciplinasRouteImport.update({
  id: '/admin/disciplinas',
  path: '/admin/disciplinas',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminNotasRoute = AdminNotasRouteImport.update({
  id: '/admin/notas',
  path: '/admin/notas',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminPresencasRoute = AdminPresencasRouteImport.update({
  id: '/admin/presencas',
  path: '/admin/presencas',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminMateriaisRoute = AdminMateriaisRouteImport.update({
  id: '/admin/materiais',
  path: '/admin/materiais',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminNoticiasRoute = AdminNoticiasRouteImport.update({
  id: '/admin/noticias',
  path: '/admin/noticias',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminAuditoriaRoute = AdminAuditoriaRouteImport.update({
  id: '/admin/auditoria',
  path: '/admin/auditoria',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminDefinicoesRoute = AdminDefinicoesRouteImport.update({
  id: '/admin/definicoes',
  path: '/admin/definicoes',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admissoes': typeof AdmissoesRoute
  '/contactos': typeof ContactosRoute
  '/ensino': typeof EnsinoRoute
  '/noticias': typeof NoticiasRoute
  '/sobre': typeof SobreRoute
  '/privacidade': typeof PrivacidadeRoute
  '/admin': typeof AdminRoute
  '/admin/login': typeof AdminLoginRoute
  '/admin/redefinir': typeof AdminRedefinirRoute
  '/admin/alunos': typeof AdminAlunosRoute
  '/admin/turmas': typeof AdminTurmasRoute
  '/admin/professores': typeof AdminProfessoresRoute
  '/admin/disciplinas': typeof AdminDisciplinasRoute
  '/admin/notas': typeof AdminNotasRoute
  '/admin/presencas': typeof AdminPresencasRoute
  '/admin/materiais': typeof AdminMateriaisRoute
  '/admin/noticias': typeof AdminNoticiasRoute
  '/admin/auditoria': typeof AdminAuditoriaRoute
  '/admin/definicoes': typeof AdminDefinicoesRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admissoes': typeof AdmissoesRoute
  '/contactos': typeof ContactosRoute
  '/ensino': typeof EnsinoRoute
  '/noticias': typeof NoticiasRoute
  '/sobre': typeof SobreRoute
  '/privacidade': typeof PrivacidadeRoute
  '/admin': typeof AdminRoute
  '/admin/login': typeof AdminLoginRoute
  '/admin/redefinir': typeof AdminRedefinirRoute
  '/admin/alunos': typeof AdminAlunosRoute
  '/admin/turmas': typeof AdminTurmasRoute
  '/admin/professores': typeof AdminProfessoresRoute
  '/admin/disciplinas': typeof AdminDisciplinasRoute
  '/admin/notas': typeof AdminNotasRoute
  '/admin/presencas': typeof AdminPresencasRoute
  '/admin/materiais': typeof AdminMateriaisRoute
  '/admin/noticias': typeof AdminNoticiasRoute
  '/admin/auditoria': typeof AdminAuditoriaRoute
  '/admin/definicoes': typeof AdminDefinicoesRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/admissoes': typeof AdmissoesRoute
  '/contactos': typeof ContactosRoute
  '/ensino': typeof EnsinoRoute
  '/noticias': typeof NoticiasRoute
  '/sobre': typeof SobreRoute
  '/privacidade': typeof PrivacidadeRoute
  '/admin': typeof AdminRoute
  '/admin/login': typeof AdminLoginRoute
  '/admin/redefinir': typeof AdminRedefinirRoute
  '/admin/alunos': typeof AdminAlunosRoute
  '/admin/turmas': typeof AdminTurmasRoute
  '/admin/professores': typeof AdminProfessoresRoute
  '/admin/disciplinas': typeof AdminDisciplinasRoute
  '/admin/notas': typeof AdminNotasRoute
  '/admin/presencas': typeof AdminPresencasRoute
  '/admin/materiais': typeof AdminMateriaisRoute
  '/admin/noticias': typeof AdminNoticiasRoute
  '/admin/auditoria': typeof AdminAuditoriaRoute
  '/admin/definicoes': typeof AdminDefinicoesRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/admissoes'
    | '/contactos'
    | '/ensino'
    | '/noticias'
    | '/sobre'
    | '/privacidade'
    | '/admin'
    | '/admin/login'
    | '/admin/redefinir'
    | '/admin/alunos'
    | '/admin/turmas'
    | '/admin/professores'
    | '/admin/disciplinas'
    | '/admin/notas'
    | '/admin/presencas'
    | '/admin/materiais'
    | '/admin/noticias'
    | '/admin/auditoria'
    | '/admin/definicoes'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/admissoes'
    | '/contactos'
    | '/ensino'
    | '/noticias'
    | '/sobre'
    | '/privacidade'
    | '/admin'
    | '/admin/login'
    | '/admin/redefinir'
    | '/admin/alunos'
    | '/admin/turmas'
    | '/admin/professores'
    | '/admin/disciplinas'
    | '/admin/notas'
    | '/admin/presencas'
    | '/admin/materiais'
    | '/admin/noticias'
    | '/admin/auditoria'
    | '/admin/definicoes'
  id:
    | '__root__'
    | '/admissoes'
    | '/contactos'
    | '/ensino'
    | '/noticias'
    | '/sobre'
    | '/privacidade'
    | '/admin'
    | '/admin/login'
    | '/admin/redefinir'
    | '/admin/alunos'
    | '/admin/turmas'
    | '/admin/professores'
    | '/admin/disciplinas'
    | '/admin/notas'
    | '/admin/presencas'
    | '/admin/materiais'
    | '/admin/noticias'
    | '/admin/auditoria'
    | '/admin/definicoes'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: IndexRoute,
  AdmissoesRoute: AdmissoesRoute,
  ContactosRoute: ContactosRoute,
  EnsinoRoute: EnsinoRoute,
  NoticiasRoute: NoticiasRoute,
  SobreRoute: SobreRoute,
  PrivacidadeRoute: PrivacidadeRoute,
  AdminRoute: AdminRoute,
  AdminLoginRoute: AdminLoginRoute,
  AdminRedefinirRoute: AdminRedefinirRoute,
  AdminAlunosRoute: AdminAlunosRoute,
  AdminTurmasRoute: AdminTurmasRoute,
  AdminProfessoresRoute: AdminProfessoresRoute,
  AdminDisciplinasRoute: AdminDisciplinasRoute,
  AdminNotasRoute: AdminNotasRoute,
  AdminPresencasRoute: AdminPresencasRoute,
  AdminMateriaisRoute: AdminMateriaisRoute,
  AdminNoticiasRoute: AdminNoticiasRoute,
  AdminAuditoriaRoute: AdminAuditoriaRoute,
  AdminDefinicoesRoute: AdminDefinicoesRoute,
}
declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admissoes': {
      id: '/admissoes'
      path: '/admissoes'
      fullPath: '/admissoes'
      preLoaderRoute: typeof AdmissoesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/contactos': {
      id: '/contactos'
      path: '/contactos'
      fullPath: '/contactos'
      preLoaderRoute: typeof ContactosRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/ensino': {
      id: '/ensino'
      path: '/ensino'
      fullPath: '/ensino'
      preLoaderRoute: typeof EnsinoRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/noticias': {
      id: '/noticias'
      path: '/noticias'
      fullPath: '/noticias'
      preLoaderRoute: typeof NoticiasRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/sobre': {
      id: '/sobre'
      path: '/sobre'
      fullPath: '/sobre'
      preLoaderRoute: typeof SobreRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/privacidade': {
      id: '/privacidade'
      path: '/privacidade'
      fullPath: '/privacidade'
      preLoaderRoute: typeof PrivacidadeRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/login': {
      id: '/admin/login'
      path: '/admin/login'
      fullPath: '/admin/login'
      preLoaderRoute: typeof AdminLoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/redefinir': {
      id: '/admin/redefinir'
      path: '/admin/redefinir'
      fullPath: '/admin/redefinir'
      preLoaderRoute: typeof AdminRedefinirRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/alunos': {
      id: '/admin/alunos'
      path: '/admin/alunos'
      fullPath: '/admin/alunos'
      preLoaderRoute: typeof AdminAlunosRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/turmas': {
      id: '/admin/turmas'
      path: '/admin/turmas'
      fullPath: '/admin/turmas'
      preLoaderRoute: typeof AdminTurmasRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/professores': {
      id: '/admin/professores'
      path: '/admin/professores'
      fullPath: '/admin/professores'
      preLoaderRoute: typeof AdminProfessoresRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/disciplinas': {
      id: '/admin/disciplinas'
      path: '/admin/disciplinas'
      fullPath: '/admin/disciplinas'
      preLoaderRoute: typeof AdminDisciplinasRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/notas': {
      id: '/admin/notas'
      path: '/admin/notas'
      fullPath: '/admin/notas'
      preLoaderRoute: typeof AdminNotasRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/presencas': {
      id: '/admin/presencas'
      path: '/admin/presencas'
      fullPath: '/admin/presencas'
      preLoaderRoute: typeof AdminPresencasRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/materiais': {
      id: '/admin/materiais'
      path: '/admin/materiais'
      fullPath: '/admin/materiais'
      preLoaderRoute: typeof AdminMateriaisRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/noticias': {
      id: '/admin/noticias'
      path: '/admin/noticias'
      fullPath: '/admin/noticias'
      preLoaderRoute: typeof AdminNoticiasRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/auditoria': {
      id: '/admin/auditoria'
      path: '/admin/auditoria'
      fullPath: '/admin/auditoria'
      preLoaderRoute: typeof AdminAuditoriaRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/definicoes': {
      id: '/admin/definicoes'
      path: '/admin/definicoes'
      fullPath: '/admin/definicoes'
      preLoaderRoute: typeof AdminDefinicoesRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}
const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdmissoesRoute: AdmissoesRoute,
  ContactosRoute: ContactosRoute,
  EnsinoRoute: EnsinoRoute,
  NoticiasRoute: NoticiasRoute,
  SobreRoute: SobreRoute,
  PrivacidadeRoute: PrivacidadeRoute,
  AdminRoute: AdminRoute,
  AdminLoginRoute: AdminLoginRoute,
  AdminRedefinirRoute: AdminRedefinirRoute,
  AdminAlunosRoute: AdminAlunosRoute,
  AdminTurmasRoute: AdminTurmasRoute,
  AdminProfessoresRoute: AdminProfessoresRoute,
  AdminDisciplinasRoute: AdminDisciplinasRoute,
  AdminNotasRoute: AdminNotasRoute,
  AdminPresencasRoute: AdminPresencasRoute,
  AdminMateriaisRoute: AdminMateriaisRoute,
  AdminNoticiasRoute: AdminNoticiasRoute,
  AdminAuditoriaRoute: AdminAuditoriaRoute,
  AdminDefinicoesRoute: AdminDefinicoesRoute,
}
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()
import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
