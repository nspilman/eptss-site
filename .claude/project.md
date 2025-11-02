# EPTSS Repository Philosophy

## Core Principle: Discovery Before Creation

Every line of code already written is more valuable than any new code. Before implementing anything, you must understand what exists. Read the packages directory like a library catalog. Study their exports like API documentation. Examine their dependencies to understand architectural relationships. Never write what might already exist.

When you spot similar code in multiple places, that's not coincidence—it's an opportunity for extraction. Duplication signals missing abstraction. Your job is to notice these patterns and suggest better organization that improves cohesion while preserving all existing functionality.

## Architectural Philosophy: Layered Dependencies

This codebase follows strict layered architecture. Dependencies flow downward only, never upward or sideways. Think of it like a pyramid: foundation supports infrastructure, infrastructure supports features, features support applications. Each layer knows only about layers below it.

**Foundation Layer** contains primitives that have no dependencies: constants, types, pure UI components with no business logic. These are the atoms of the system.

**Infrastructure Layer** builds on foundation with core services: database access, external integrations, data patterns. These are the molecules—combinations of atoms that provide basic capabilities.

**Feature Layer** combines infrastructure and UI into complete user-facing functionality: authentication flows, profile management, content creation. These are the organisms—complex combinations serving specific purposes.

**Application Layer** orchestrates everything into runnable applications. This is the ecosystem where all other layers come together.

When adding a dependency, you must verify the target is in the same or lower layer. Violating this creates circular dependencies that break the architecture. If you need something from a higher layer, extract the shared concern into a lower layer instead.

## Pattern Consistency Over Individual Preference

This codebase has established patterns for everything: how components are structured, how data flows, how exports are organized, how tests are written. Your preference doesn't matter. The existing pattern does.

Find 2-3 examples of similar code. Study their structure, naming, organization. Match that pattern exactly. If you think you've found a better way, you're probably wrong—you just haven't understood the existing pattern deeply enough. The consistency of doing things the same way everywhere is more valuable than any micro-optimization.

Patterns exist for imports (granular, subpath-based for tree-shaking), for database access (ORM through services and providers), for components (composition with utility-based styling), for forms (declarative with schema validation). Discover the pattern, then follow it.

## Monorepo as Organizational Principle

The monorepo isn't just a technical choice—it's an organizational philosophy. Code is grouped by responsibility and cohesion, not by technology or arbitrary boundaries. Each package has a single clear purpose. Dependencies between packages are explicit and intentional.

When considering where code belongs, ask: what responsibility does this serve? Does it fit naturally with an existing package's purpose? Or does it represent a new concern that deserves its own package? Cohesion is the metric. Related things should be together. Unrelated things should be separate.

## Separation of Concerns as Non-Negotiable

UI packages contain only presentation logic. No database calls. No business rules. Just components that render based on props. If a component needs data, it receives it through props. If it needs to trigger actions, it calls functions passed as props.

Business logic lives in feature or infrastructure packages. They fetch data, apply rules, coordinate operations. They export functions and hooks that UI can consume.

This separation isn't academic purity—it's pragmatic. UI components in isolation can be tested in Storybook. Business logic in isolation can be unit tested. The separation makes both sides better.

## Discovery Process as Mandatory Practice

Before every implementation, you perform discovery. List packages. Read their manifests. Examine their structure. Search for similar implementations. Document what you find. This isn't optional. This isn't "if you have time." This is the first step, every time.

When you present a solution, you show your work: "I examined packages X, Y, and Z. Package X handles auth, Y handles data, Z handles UI. The pattern in X shows validation happens through schemas in the schemas/ directory. I followed that pattern for this new validator."

The discovery process is visible. The reasoning is explicit. The pattern matching is deliberate.

## Cohesion as Architectural North Star

When code handling related concerns lives in multiple places, cohesion is broken. When unrelated concerns live in the same package, cohesion is broken. The goal is high cohesion within packages, loose coupling between packages.

If you spot code that should be extracted, name the cohesion benefit. "These three files all handle date formatting, but they're scattered across different packages. Extracting them into a shared date utilities package improves cohesion and makes the pattern discoverable."

If you spot code that should be separated, name the coupling problem. "This UI package imports database models directly, creating tight coupling. The UI should receive serialized data through an interface."

## Communication as Showing Work

Never say "I'll put this here" without explaining why. Never choose a pattern without showing you discovered it from existing code. Never add a dependency without verifying the layer relationship.

Your communication should demonstrate understanding: "This belongs in the infrastructure layer because it handles database access. I found the existing pattern in the data-access package at src/services/userService.ts:42, which uses this ORM method and this export structure. I'm matching that pattern."

When uncertain, present options with clear reasoning: "This could live in package A (pros: X, Y; cons: Z) or package B (pros: A, B; cons: C). Which better matches the intended architecture?"

## Types Over Documentation

The codebase should be self-documenting through clear naming and TypeScript types. Don't document what the types already express. Do document why—the reasoning, the constraints, the edge cases the types can't capture.

Public APIs get JSDoc explaining their purpose and usage. Complex algorithms get comments explaining their approach. But straightforward code with clear names needs no documentation—the code itself is the documentation.

## This Document Is Principle, Not Prescription

This document doesn't list every package or enumerate every command. It explains how to think about the codebase. The specifics will change—packages will be renamed, dependencies will be updated, patterns will evolve. But these principles remain.

Your job is to discover the current state, understand the principles that govern it, and extend it consistently. Not to follow a checklist, but to think architecturally.
