import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule } from "@angular/router";
import { MatDividerModule } from "@angular/material/divider";

@Component({
	selector: "vc-home",
	imports: [MatButtonModule, RouterModule, MatDividerModule],
	templateUrl: "./home.component.html",
	styleUrl: "./home.component.scss"
})
export class HomeComponent {}
