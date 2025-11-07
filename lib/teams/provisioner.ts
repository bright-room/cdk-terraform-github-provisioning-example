import { Construct } from "constructs"
import { Team as GithubTeam } from "@cdktf/provider-github/lib/team"
import { TeamMembership as GithubTeamMembership } from "@cdktf/provider-github/lib/team-membership"
import type { OrganizationTeamMember, OrganizationTeamProperty, OrganizationTeamStructure } from "./properties"
import type { OrganizationTeam } from "./constraint"
import { OrganizationTeams } from "./model"

export interface OrganizationTeamProvisionerProps {
  properties: OrganizationTeamProperty[]
}

export class OrganizationTeamProvisioner extends Construct {
  readonly teams: OrganizationTeams

  constructor(scope: Construct, id: string, props: OrganizationTeamProvisionerProps) {
    super(scope, id)

    const map = new Map<OrganizationTeam, GithubTeam>()

    const properties = props.properties
    properties.forEach((property) => {
      const structure = property.structure
      const team = structure.team

      const { githubTeam } = new OrganizationParentTeamCreator(this, team, property.structure)
      map.set(team, githubTeam)

      const children = property.children
      children.forEach((childStructure) => {
        const childTeam = childStructure.team
        const { childGithubTeam } = new OrganizationChildrenTeamCreator(this, childTeam, githubTeam, childStructure)
        map.set(childTeam, childGithubTeam)
      })
    })

    this.teams = new OrganizationTeams(map)
  }
}

export class OrganizationParentTeamCreator extends Construct {
  readonly githubTeam: GithubTeam

  constructor(scope: Construct, id: string, structure: OrganizationTeamStructure) {
    super(scope, id)

    const githubTeam = new GithubTeam(this, "OrganizationParentTeamCreator", {
      name: structure.team,
      description: structure.description,
      privacy: structure.privacy,
    })

    const members = structure.members
    members.forEach((member) => {
      const username = member.username
      new OrganizationTeamMemberAssigner(this, username, githubTeam, member)
    })

    this.githubTeam = githubTeam
  }
}

export class OrganizationChildrenTeamCreator extends Construct {
  readonly childGithubTeam: GithubTeam

  constructor(scope: Construct, id: string, parentGithubTeam: GithubTeam, structure: OrganizationTeamStructure) {
    super(scope, id)

    const childGithubTeam = new GithubTeam(this, "OrganizationChildrenTeamCreator", {
      name: structure.team,
      description: structure.description,
      privacy: structure.privacy,
      parentTeamId: parentGithubTeam.id,
    })

    const members = structure.members
    members.forEach((member) => {
      const username = member.username
      new OrganizationTeamMemberAssigner(this, username, childGithubTeam, member)
    })

    this.childGithubTeam = childGithubTeam
  }
}

export class OrganizationTeamMemberAssigner extends Construct {
  constructor(scope: Construct, id: string, team: GithubTeam, member: OrganizationTeamMember) {
    super(scope, id)

    new GithubTeamMembership(this, "OrganizationTeamMemberAssigner", {
      username: member.username,
      role: member.role,
      teamId: team.id,
    })
  }
}
