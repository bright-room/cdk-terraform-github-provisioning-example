import { CloudBackend, NamedCloudWorkspace, TerraformStack } from "cdktf"
import type { Construct } from "constructs"
import { GithubProvider } from "@cdktf/provider-github/lib/provider"
import { OrganizationTeamProvisioner } from "./teams/provisioner"
import { OrganizationTeamProperties } from "./teams/parameters"
import { OrganizationRepositoryProvisioner } from "./repositories/provisioner"
import { OrganizationRepositoryProperties } from "./repositories/parameters"

export class BrightRoomOrganizations extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    new GithubProvider(this, "GithubProvider", {
      owner: "bright-room",
      token: process.env.AUTH_TOKEN,
    })

    new CloudBackend(this, {
      hostname: "app.terraform.io",
      organization: "bright-room",
      workspaces: new NamedCloudWorkspace("github-manager"),
    })

    const { teams } = new OrganizationTeamProvisioner(this, "OrganizationTeamsProvisioner", {
      properties: OrganizationTeamProperties,
    })

    new OrganizationRepositoryProvisioner(this, "OrganizationRepositoryProvisioner", {
      teams: teams,
      properties: OrganizationRepositoryProperties,
    })
  }
}
