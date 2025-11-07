import type {
  ContributorPermission,
  RepositoryVisibility,
  RuleSetByPassActorType,
  RuleSetBypassMode,
  RuleSetEnforcement,
} from "./constraint"
import type { OrganizationTeam } from "../teams/constraint"

export interface OrganizationRepositoryProperty {
  repository: RepositoryConfiguration
  branch: BranchConfigurations
  issueLabels: IssueLabel[]
  contributorTeams: RepositoryContributorTeam[]
}

export interface IssueLabel {
  name: string
  description: string
  color: string
}

export interface RepositoryConfiguration {
  name: string
  description: string
  homepageUrl: string
  topics: string[]
  visibility: RepositoryVisibility
  mergeOptions: {
    allowMergeCommit: boolean
    allowSquashMerge: boolean
    allowRebaseMerge: boolean
    deleteBranchOnMerge: boolean
  }
  assetOptions: {
    hasIssues: boolean
    hasProjects: boolean
    hasWiki: boolean
    hasDownloads: boolean
  }
  securities: {
    vulnerabilityAlerts: boolean
  }
  repositoryOptions: {
    isTemplate: boolean
    archived: boolean
  }
}

export interface BranchConfigurations {
  defaultBranch: DefaultBranchConfiguration
  additionalBranches: AdditionalBranchConfiguration[]
}

export interface DefaultBranchConfiguration {
  protection: RepositoryProtectionConfiguration
}

export interface AdditionalBranchConfiguration {
  branch: string
  protection: RepositoryProtectionConfiguration
}

export interface RepositoryProtectionConfiguration {
  ruleName: string
  enforcement: RuleSetEnforcement
  bypassActors: RuleSetBypassActor[]
  ruleSet: {
    deletion: boolean
    blockedForcePush: boolean
    pullRequest: {
      dismissStaleReviewsOnPush: boolean
      requireCodeOwnerReview: boolean
      requiredApprovingReviewCount: number
    }
    requiredStatusChecks?: {
      contexts: string[]
    }
  }
}

export interface RuleSetBypassActor {
  id: number
  type: RuleSetByPassActorType
  mode: RuleSetBypassMode
}

export interface RepositoryContributorTeam {
  team: OrganizationTeam
  permission: ContributorPermission
}
