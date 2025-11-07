import { App } from "cdktf"
import { BrightRoomOrganizations } from "./lib"

const app = new App()
new BrightRoomOrganizations(app, "BrightRoomOrganizations")

app.synth()
