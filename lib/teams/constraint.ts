export const OrganizationTeam = {
  Administrator: "Administrator",
  Developer: "Developer",
  TechReader: "TechReader",
  TechFullTimeEquivalent: "TechFullTimeEquivalent",
  TechFullTimeEquivalentSecret: "TechFullTimeEquivalentSecret",
}
export type OrganizationTeam = (typeof OrganizationTeam)[keyof typeof OrganizationTeam]

export const Privacy = {
  Secret: "secret",
  Closed: "closed",
} as const
export type Privacy = (typeof Privacy)[keyof typeof Privacy]

export const Role = {
  Member: "member",
  Maintainer: "maintainer",
} as const
export type Role = (typeof Role)[keyof typeof Role]
