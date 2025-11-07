import type { OrganizationTeam, Privacy, Role } from "./constraint"

export interface OrganizationTeamProperty {
  structure: OrganizationTeamStructure
  children: OrganizationTeamStructure[]
}

export interface OrganizationTeamStructure {
  team: OrganizationTeam
  description: string
  privacy: Privacy
  members: OrganizationTeamMember[]
}

export interface OrganizationTeamMember {
  username: string
  role: Role
}
