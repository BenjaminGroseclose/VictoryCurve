import { Component, computed, input } from "@angular/core";
import { IGold, IModelPrediction } from "@victory-curve/models";
import { BaseChartDirective } from "ng2-charts";

@Component({
	selector: "vc-gold-graph",
	imports: [BaseChartDirective],
	templateUrl: "./gold-graph.component.html",
	styleUrl: "./gold-graph.component.scss"
})
export class GoldGraphComponent {
	gold = input.required<IGold[]>();

	options = {
		responsive: true
	};

	chartData = computed(() => {
		const gold = this.gold();
		console.log(gold);

		return {
			labels: gold.map((x) => x.minute),
			datasets: [
				{
					label: "Red",
					data: gold.map((x) => x.red),
					borderColor: "#ff6b6b"
				},
				{
					label: "Blue",
					data: gold.map((x) => x.blue),
					borderColor: "#87cefa"
				}
			]
		};
	});
}
