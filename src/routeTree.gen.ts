/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SetupImport } from './routes/setup'
import { Route as GridImport } from './routes/grid'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const SetupRoute = SetupImport.update({
  path: '/setup',
  getParentRoute: () => rootRoute,
} as any)

const GridRoute = GridImport.update({
  path: '/grid',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/grid': {
      id: '/grid'
      path: '/grid'
      fullPath: '/grid'
      preLoaderRoute: typeof GridImport
      parentRoute: typeof rootRoute
    }
    '/setup': {
      id: '/setup'
      path: '/setup'
      fullPath: '/setup'
      preLoaderRoute: typeof SetupImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  GridRoute,
  SetupRoute,
})

/* prettier-ignore-end */
