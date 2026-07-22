/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// [Snyk × RMIT Cyber Day] Workshop resilience: this app is deliberately being
// attacked, and some challenge handlers fire unhandled promise rejections that
// would otherwise crash the process (e.g. a failed Product.reload after a UNION
// SQLi). Log and keep serving so a live demo never dies mid-attack.
process.on('unhandledRejection', (reason) => {
  console.warn('[cyberday] ignored unhandledRejection:', reason instanceof Error ? reason.message : reason)
})

async function app () {
  const { default: validateDependencies } = await import('./lib/startup/validateDependenciesBasic')
  await validateDependencies()

  const server = await import('./server')
  await server.start()
}

app()
  .catch(err => {
    throw err
  })
