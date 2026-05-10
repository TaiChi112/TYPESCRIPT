# Contributing Guide

This guide is for changes that scale the system or keep it healthy over time.

Before you start, decide whether your change is a `scale` change or a `maintenance` change.

## If You Want To Scale

Scale work means the system needs to support more load, more features, or more consumers.

Starting points:

- [src/domain/](../src/domain/)
- [src/infrastructure/](../src/infrastructure/)
- [src/delivery/](../src/delivery/)

What usually changes:

- add new service methods or new use cases in the domain
- expand repository contracts and their implementations
- add new HTTP routes or tool adapters
- update [index.ts](../index.ts) when wiring new dependencies

Three scale todo examples:

1. Add alumni profile registration flow.
   - Start at [src/domain/ProfileService.ts](../src/domain/ProfileService.ts) and [src/domain/ProfileFactory.ts](../src/domain/ProfileFactory.ts).
   - Update [src/core/types.ts](../src/core/types.ts) and [src/core/schemas.ts](../src/core/schemas.ts).
   - Add persistence changes in [src/infrastructure/PrismaProfileRepository.ts](../src/infrastructure/PrismaProfileRepository.ts) and [prisma/schema.prisma](../prisma/schema.prisma).
   - If you add a new profile variant, also update [src/integration/McpToolAdapter.ts](../src/integration/McpToolAdapter.ts) and [src/delivery/ProfileApiServer.ts](../src/delivery/ProfileApiServer.ts).

2. Add pagination or filtering for profile lists.
   - Start in [src/domain/ProfileRepository.ts](../src/domain/ProfileRepository.ts) and [src/domain/ProfileService.ts](../src/domain/ProfileService.ts).
   - Update [src/infrastructure/PrismaProfileRepository.ts](../src/infrastructure/PrismaProfileRepository.ts) and likely [tests/domain/ProfileService.test.ts](../tests/domain/ProfileService.test.ts).
   - If you expose it over HTTP, extend [src/delivery/ProfileApiServer.ts](../src/delivery/ProfileApiServer.ts).
   - If the payload shape changes, update [src/core/schemas.ts](../src/core/schemas.ts).

3. Add a second external integration or event publisher.
   - Start from [src/integration/](../src/integration/).
   - Wire dependencies in [index.ts](../index.ts).
   - If it needs persistence, update [src/infrastructure/](../src/infrastructure/) and [prisma/schema.prisma](../prisma/schema.prisma).
   - If it touches public APIs, reflect the new contract in [src/delivery/ProfileApiServer.ts](../src/delivery/ProfileApiServer.ts).

## If You Want To Maintain

Maintenance work means the code should stay reliable, consistent, and easy to operate.

Starting points:

- [src/core/](../src/core/)
- [tests/domain/](../tests/domain/)
- [.github/workflows/](../.github/workflows/)

What usually changes:

- tighten validation and error handling
- improve tests around existing behavior
- refresh documentation or CI checks
- clean up logging, startup flow, or environment handling

Three maintenance todo examples:

1. Add coverage for error branches in `ProfileService`.
   - Start at [tests/domain/ProfileService.test.ts](../tests/domain/ProfileService.test.ts).
   - If the failure behavior changes, review [src/core/errors.ts](../src/core/errors.ts) and [src/domain/ProfileService.ts](../src/domain/ProfileService.ts).
   - If a new repository method is introduced, update [src/domain/ProfileRepository.ts](../src/domain/ProfileRepository.ts).

2. Improve startup and shutdown safety.
   - Start at [index.ts](../index.ts) and [src/core/config.ts](../src/core/config.ts).
   - If you add runtime resources, make sure they are disconnected or cleaned up in [src/infrastructure/PrismaProfileRepository.ts](../src/infrastructure/PrismaProfileRepository.ts).
   - If startup behavior changes, update [docs/README.md](README.md) so the project guide stays accurate.

3. Keep CI and docs aligned with the codebase.
   - Start at [.github/workflows/ci.yml](../.github/workflows/ci.yml) and [README.md](../README.md).
   - If you add a new command or workflow step, reflect it in the docs.
   - If test strategy changes, update [tests/domain/ProfileService.test.ts](../tests/domain/ProfileService.test.ts) and CI at the same time.

## Contribution Notes

- If a change touches the domain contract, update the domain, infrastructure, and tests together.
- If a change adds runtime data, update `types`, `schemas`, and Prisma in the same pass.
- If a change affects boot flow, update [index.ts](../index.ts) and any resource cleanup path.
- If a change affects external consumers, check both [src/delivery/ProfileApiServer.ts](../src/delivery/ProfileApiServer.ts) and [src/integration/McpToolAdapter.ts](../src/integration/McpToolAdapter.ts).

## Quick Mental Model

- core defines the shape
- domain defines the rule
- infrastructure performs the work
- integration exports it to AI tools
- delivery exports it to HTTP clients

That is the safest order to touch when you want to contribute without breaking the architecture.
