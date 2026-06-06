/// <reference types="react/canary" />

// Why this file exists:
//
// RoundDetail (ListeningParty) and SubmissionList (SubmissionItem) are async
// React Server Components — functions that return Promise<ReactNode>. React
// 18.3's *stable* types don't mark that as a valid JSX element type, so a
// standalone `tsc` on this package fails with TS2786. The Next app compiles
// fine because its toolchain pulls in React's "canary" types, which augment
// ReactNode to include Promise<AwaitedReactNode>.
//
// This reference opts the package into those same canary types so it typechecks
// on its own (and in CI via `check-types`). It only *adds* the async-component
// support that the app already relies on — it changes no runtime behavior.
export {};
