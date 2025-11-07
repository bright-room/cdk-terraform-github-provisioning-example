export const RepositoryVisibility = {
  Public: "public",
  Private: "private",
} as const
export type RepositoryVisibility = (typeof RepositoryVisibility)[keyof typeof RepositoryVisibility]

export const ContributorPermission = {
  Admin: "admin",
  Maintain: "maintain",
  Push: "push",
  Triage: "triage",
  Pull: "pull",
} as const
export type ContributorPermission = (typeof ContributorPermission)[keyof typeof ContributorPermission]

export const RuleSetEnforcement = {
  Disabled: "disabled",
  Active: "active",
  Evaluate: "evaluate",
} as const
export type RuleSetEnforcement = (typeof RuleSetEnforcement)[keyof typeof RuleSetEnforcement]

export const RuleSetByPassActorType = {
  Team: "Team",
  Integration: "Integration",
  Organization: "Organization",
  Admin: "Admin",
  DeployKey: "DeployKey",
  RepositoryRole: "RepositoryRole",
} as const
export type RuleSetByPassActorType = (typeof RuleSetByPassActorType)[keyof typeof RuleSetByPassActorType]

export const RuleSetBypassMode = {
  Always: "always",
  Pull_request: "pull_request",
  Exempt: "exempt",
} as const
export type RuleSetBypassMode = (typeof RuleSetBypassMode)[keyof typeof RuleSetBypassMode]
