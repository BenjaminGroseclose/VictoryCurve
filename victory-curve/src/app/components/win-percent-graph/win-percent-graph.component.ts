import { AfterViewInit, Component, computed, input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { IModelPrediction } from "@victory-curve/models";
import { BaseChartDirective } from "ng2-charts";

@Component({
	selector: "vc-win-percent-graph",
	imports: [BaseChartDirective],
	templateUrl: "./win-percent-graph.component.html",
	styleUrl: "./win-percent-graph.component.scss"
})
export class WinPercentGraphComponent {
	predictions = input.required<IModelPrediction[]>();

	options = {
		responsive: true,
		scales: {
			y: {
				min: 0,
				max: 100
			}
		}
	};

	chartData = computed(() => {
		const predictions = this.predictions();
		console.log(predictions);

		return {
			labels: predictions.map((x) => x.minute),
			datasets: [
				{
					label: "Red",
					data: predictions.map((x) => x.red * 100),
					borderColor: "#ff6b6b"
				},
				{
					label: "Blue",
					data: predictions.map((x) => x.blue * 100),
					borderColor: "#87cefa"
				}
			]
		};
	});
}
