import type { Team as GithubTeam } from "@cdktf/provider-github/lib/team"
import type { OrganizationTeam } from "./constraint"

export class OrganizationTeams {
  private readonly _map: Map<OrganizationTeam, GithubTeam>

  constructor(map: Map<OrganizationTeam, GithubTeam>) {
    this._map = map
  }

  find(key: OrganizationTeam): GithubTeam {
    if (!this._map.has(key)) {
      throw new Error("key not found.")
    }
    return <GithubTeam>this._map.get(key)
  }
}
