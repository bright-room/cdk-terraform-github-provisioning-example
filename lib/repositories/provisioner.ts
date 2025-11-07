import { Construct } from "constructs"
import type {
  AdditionalBranchConfiguration,
  DefaultBranchConfiguration,
  IssueLabel,
  OrganizationRepositoryProperty,
  RepositoryConfiguration,
  RepositoryContributorTeam,
  RuleSetBypassActor,
} from "./properties"
import type { OrganizationTeams } from "../teams/model"
import { Repository as GithubRepository } from "@cdktf/provider-github/lib/repository"
import { IssueLabels as GithubIssueLabels } from "@cdktf/provider-github/lib/issue-labels"
import { RepositoryRuleset as GithubRepositoryRuleset } from "@cdktf/provider-github/lib/repository-ruleset"
import { Branch as GithubBranch } from "@cdktf/provider-github/lib/branch"
import { TeamRepository as GIthubTeamRepository } from "@cdktf/provider-github/lib/team-repository"
import { BranchDefault } from "@cdktf/provider-github/lib/branch-default"

const DEFAULT_BRANCH_NAME = "main"

const toPascalCase = (str: string): string =>
  str
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

export interface OrganizationRepositoryProvisionerProps {
  teams: OrganizationTeams
  properties: OrganizationRepositoryProperty[]
}

export class OrganizationRepositoryProvisioner extends Construct {
  constructor(scope: Construct, id: string, props: OrganizationRepositoryProvisionerProps) {
    super(scope, id)

    const properties = props.properties

    properties.forEach((property) => {
      const repositoryConfig = property.repository
      const { repository } = new RepositoryCreator(this, `${toPascalCase(repositoryConfig.name)}`, repositoryConfig)

      const branchConfig = property.branch
      const defaultBranchConfig = branchConfig.defaultBranch
      new DefaultBranchProtectionCreator(
        this,
        `${toPascalCase(repositoryConfig.name)}${DEFAULT_BRANCH_NAME}Branch`,
        repository,
        defaultBranchConfig
      )

      const additionalBranchConfigs = branchConfig.additionalBranches
      additionalBranchConfigs.forEach((additionalBranchConfig: AdditionalBranchConfiguration) => {
        new AdditionalBranchCreator(
          this,
          `${toPascalCase(repositoryConfig.name)}${toPascalCase(additionalBranchConfig.branch)}Branch`,
          repository,
          additionalBranchConfig
        )
      })

      const labelConfigs = property.issueLabels
      new IssueLabelLabelCreator(this, `${toPascalCase(repositoryConfig.name)}Label`, repository, labelConfigs)

      const contributorTeamConfigs = property.contributorTeams
      contributorTeamConfigs.forEach((contributorTeamConfig: RepositoryContributorTeam) => {
        new RepositoryContributorTeamAssigner(
          this,
          `${toPascalCase(repositoryConfig.name)}${contributorTeamConfig.team}ContributorTeamsAssign`,
          repository,
          props.teams,
          contributorTeamConfig
        )
      })
    })
  }
}

export class RepositoryCreator extends Construct {
  readonly repository: GithubRepository

  constructor(scope: Construct, id: string, config: RepositoryConfiguration) {
    super(scope, id)

    this.repository = new GithubRepository(this, "RepositoryCreator", {
      name: config.name,
      description: config.description,
      homepageUrl: config.homepageUrl,
      topics: config.topics,
      allowMergeCommit: config.mergeOptions.allowMergeCommit,
      allowSquashMerge: config.mergeOptions.allowSquashMerge,
      allowRebaseMerge: config.mergeOptions.allowRebaseMerge,
      deleteBranchOnMerge: config.mergeOptions.deleteBranchOnMerge,
      hasIssues: config.assetOptions.hasIssues,
      hasProjects: config.assetOptions.hasProjects,
      hasWiki: config.assetOptions.hasWiki,
      hasDownloads: config.assetOptions.hasDownloads,
      autoInit: true,
      visibility: config.visibility,
      isTemplate: config.repositoryOptions.isTemplate,
      archived: config.repositoryOptions.archived,
      vulnerabilityAlerts: config.securities.vulnerabilityAlerts,
      lifecycle: {
        preventDestroy: false,
        ignoreChanges: ["auto_init"],
      },
    })
  }
}

export class DefaultBranchProtectionCreator extends Construct {
  constructor(scope: Construct, id: string, repository: GithubRepository, configuration: DefaultBranchConfiguration) {
    super(scope, id)

    new BranchDefault(this, "DefaultBranchCreator", {
      branch: DEFAULT_BRANCH_NAME,
      repository: repository.name,
    })

    const protection = configuration.protection
    const ruleSet = protection.ruleSet
    const pullRequest = ruleSet.pullRequest

    const rulesetBypassActors = protection.bypassActors
    const bypassActors = rulesetBypassActors.map((actor: RuleSetBypassActor) => ({
      actorId: actor.id,
      actorType: actor.type,
      bypassMode: actor.mode,
    }))

    const requiredStatusChecks =
      ruleSet.requiredStatusChecks === undefined
        ? undefined
        : {
            requiredCheck: ruleSet.requiredStatusChecks.contexts.map((ctx: string) => ({
              context: ctx,
              integrationId: undefined,
            })),
          }

    new GithubRepositoryRuleset(this, "DefaultBranchProtectionCreator", {
      name: protection.ruleName,
      repository: repository.name,
      enforcement: protection.enforcement,
      target: "branch",
      bypassActors: bypassActors,
      conditions: {
        refName: {
          include: ["~DEFAULT_BRANCH"],
          exclude: [],
        },
      },
      rules: {
        deletion: ruleSet.deletion,
        nonFastForward: ruleSet.blockedForcePush,
        pullRequest: {
          dismissStaleReviewsOnPush: pullRequest.dismissStaleReviewsOnPush,
          requireCodeOwnerReview: pullRequest.requireCodeOwnerReview,
          requiredApprovingReviewCount: pullRequest.requiredApprovingReviewCount,
        },
        requiredStatusChecks: requiredStatusChecks,
      },
    })
  }
}

export class AdditionalBranchCreator extends Construct {
  constructor(
    scope: Construct,
    id: string,
    repository: GithubRepository,
    configuration: AdditionalBranchConfiguration
  ) {
    super(scope, id)

    new GithubBranch(this, "AdditionalBranchCreator", {
      branch: configuration.branch,
      repository: repository.name,
      sourceBranch: DEFAULT_BRANCH_NAME,
    })

    const protection = configuration.protection
    const ruleSet = protection.ruleSet
    const pullRequest = ruleSet.pullRequest

    const rulesetBypassActors = protection.bypassActors
    const bypassActors = rulesetBypassActors.map((actor: RuleSetBypassActor) => ({
      actorId: actor.id,
      actorType: actor.type,
      bypassMode: actor.mode,
    }))

    const requiredStatusChecks =
      ruleSet.requiredStatusChecks === undefined
        ? undefined
        : {
            requiredCheck: ruleSet.requiredStatusChecks.contexts.map((ctx: string) => ({
              context: ctx,
              integrationId: undefined,
            })),
          }

    new GithubRepositoryRuleset(this, "AdditionalBranchProtectionCreator", {
      name: protection.ruleName,
      repository: repository.name,
      enforcement: protection.enforcement,
      target: "branch",
      bypassActors: bypassActors,
      rules: {
        branchNamePattern: {
          name: `${configuration.branch}-branch-protection`,
          operator: "contains",
          pattern: configuration.branch,
        },
        deletion: ruleSet.deletion,
        nonFastForward: ruleSet.blockedForcePush,
        pullRequest: {
          dismissStaleReviewsOnPush: pullRequest.dismissStaleReviewsOnPush,
          requireCodeOwnerReview: pullRequest.requireCodeOwnerReview,
          requiredApprovingReviewCount: pullRequest.requiredApprovingReviewCount,
        },
        requiredStatusChecks: requiredStatusChecks,
      },
    })
  }
}

export class IssueLabelLabelCreator extends Construct {
  constructor(scope: Construct, id: string, repository: GithubRepository, issueLabels: IssueLabel[]) {
    super(scope, id)

    const labels = issueLabels.map((parameter) => {
      return {
        name: parameter.name,
        description: parameter.description,
        color: parameter.color,
      }
    })

    new GithubIssueLabels(this, `IssueLabelLabelCreator`, {
      repository: repository.name,
      label: labels,
    })
  }
}

export class RepositoryContributorTeamAssigner extends Construct {
  constructor(
    scope: Construct,
    id: string,
    repository: GithubRepository,
    organizationTeams: OrganizationTeams,
    contributor: RepositoryContributorTeam
  ) {
    super(scope, id)

    const team = organizationTeams.find(contributor.team)
    new GIthubTeamRepository(this, `RepositoryContributorTeamAssigner`, {
      teamId: team.id,
      repository: repository.name,
      permission: contributor.permission,
    })
  }
}
