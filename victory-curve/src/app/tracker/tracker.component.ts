import { AfterViewInit, Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { delay, interval, map, Observable, of, Subject, switchMap, takeUntil, tap } from "rxjs";
import { CommonModule } from "@angular/common";
import { MatDividerModule } from "@angular/material/divider";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule } from "@angular/router";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTabsModule } from "@angular/material/tabs";
import { IChampion, IChampionItem, IGold, IModelData, IModelPrediction, IObjectives } from "@victory-curve/models";
import { FileManagementService, ModelService, RiotService } from "@victory-curve/services";
import { WinPercentGraphComponent } from "@victory-curve/components/win-percent-graph/win-percent-graph.component";
import { GoldGraphComponent } from "@victory-curve/components/gold-graph/gold-graph.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

const championSortMap = new Map([
	["TOP", 5],
	["JUNGLE", 4],
	["MIDDLE", 3],
	["BOTTOM", 2],
	["UTILITY", 1],
	["", 2]
]);

@Component({
	selector: "vc-tracker",
	imports: [
		CommonModule,
		MatDividerModule,
		MatButtonModule,
		RouterModule,
		MatTooltipModule,
		MatTabsModule,
		WinPercentGraphComponent,
		GoldGraphComponent,
		MatProgressSpinnerModule
	],
	templateUrl: "./tracker.component.html",
	styleUrl: "./tracker.component.scss",
	providers: [ModelService, RiotService, FileManagementService]
})
export class TrackerComponent implements OnInit, OnDestroy {
	private readonly modelService = inject(ModelService);
	private readonly riotService = inject(RiotService);
	private readonly fileManagement = inject(FileManagementService);

	allPlayers = signal<any>(null);
	initialLoad = signal<boolean>(true);

	champions = signal<any>(null);
	items = signal<any>(null);

	blueChampions = signal<IChampion[]>([]);
	redChampions = signal<IChampion[]>([]);

	redObjectives = signal<IObjectives | null>(null);
	blueObjectives = signal<IObjectives | null>(null);

	championItems = signal<IChampionItem[]>([]);

	goldTracker = signal<IGold[]>([]);
	predictions = signal<IModelPrediction[]>([]);
	currentPrediction = computed<IModelPrediction>(() => this.predictions()[this.predictions().length - 1]);

	protected componentDestroyed$ = new Subject<boolean>();
	ngOnInit(): void {
		this.fileManagement.getJsonFile("./champions.json").then((champions) => this.champions.set(champions));
		this.fileManagement.getJsonFile("./items.json").then((items) => this.items.set(items));

		// Add tap to set initial load start / end for the first 3 mins
		interval(60000)
			.pipe(
				// delay(120000), // Wait 2 mins
				takeUntil(this.componentDestroyed$),
				switchMap(() => this.riotService.getLiveData()),
				map((riotData) => this.mapRiotData(riotData)),
				tap(() => this.initialLoad.set(false)),
				switchMap((x) => this.modelService.getPrediction(x))
			)
			.subscribe({
				next: (results) => this.predictions.update((items) => [...items, results]),
				error: (err) => this.handleError(err)
			});
	}

	ngOnDestroy(): void {
		this.componentDestroyed$.next(true);
		this.componentDestroyed$.complete();
	}

	getChampionItem(summonerName: string): IChampionItem[] {
		return this.championItems().filter((x) => x.summonerName === summonerName);
	}

	// Clean this up, should be a smaller method
	private mapRiotData(data: any): IModelData {
		const items = this.items();
		let blueChampions = this.blueChampions();
		let redChampions = this.redChampions();

		const players = data.allPlayers;

		if (blueChampions.length === 0 || redChampions.length === 0) {
			const championData = this.getChampions(players);

			blueChampions = championData.blueChampions;
			redChampions = championData.redChampions;
		}

		const blueChampionName = blueChampions.map((x) => x.summonerName);
		const redChampionName = redChampions.map((x) => x.summonerName);

		let blueGold = 0;
		let redGold = 0;

		let blueChampionKills = 0;
		let redChampionKills = 0;

		let blueTowerKills = 0;
		let redTowerKills = 0;

		let blueHeraldKills = 0;
		let redHeraldKills = 0;

		let blueGrubKills = 0;
		let redGrubKills = 0;

		let blueDragonKills = 0;
		let redDragonKills = 0;

		let blueBaronKills = 0;
		let redBaronKills = 0;

		let blueAtakhanKills = 0;
		let redAtakhanKills = 0;

		const championItems: IChampionItem[] = [];
		for (const player of players) {
			let total_gold = 0;
			let name = player.isBot ? player.riotIdGameName + " Bot" : player.riotIdGameName;

			for (const item of player.items) {
				if (item.slot == 6) {
					continue;
				}

				const itemData = items.data[item.itemID];

				total_gold += itemData.gold.total;

				championItems.push({
					summonerName: name,
					image: itemData.image.full,
					name: itemData.name,
					slot: item.slot,
					gold: itemData.gold.total
				});
			}

			if (blueChampionName.includes(name)) {
				blueGold += total_gold;
			} else {
				redGold += total_gold;
			}
		}

		this.championItems.set(championItems);

		for (const event of data.events.Events) {
			switch (event.EventName) {
				case "HordeKill":
					if (blueChampionName.includes(event.KillerName)) {
						blueGrubKills += 1;
					} else {
						redGrubKills += 1;
					}
					break;
				case "DragonKill":
					if (blueChampionName.includes(event.KillerName)) {
						blueDragonKills += 1;
					} else {
						redDragonKills += 1;
					}
					break;
				case "AtakhanKill":
					if (blueChampionName.includes(event.KillerName)) {
						blueAtakhanKills += 1;
					} else {
						redAtakhanKills += 1;
					}
					break;
				case "BaronKill":
					if (blueChampionName.includes(event.KillerName)) {
						blueBaronKills += 1;
					} else {
						redBaronKills += 1;
					}
					break;
				case "ChampionKill":
					if (blueChampionName.includes(event.KillerName)) {
						blueChampionKills += 1;
					} else if (redChampionName.includes(event.KillerName)) {
						redChampionKills += 1;
					}
					break;
				case "HeraldKill":
					if (blueChampionName.includes(event.KillerName)) {
						blueHeraldKills += 1;
					} else if (redChampionName.includes(event.KillerName)) {
						redHeraldKills += 1;
					}
					break;
				case "TurretKilled":
					if (blueChampionName.includes(event.KillerName)) {
						blueTowerKills += 1;
					} else {
						redTowerKills += 1;
					}
					break;
			}
		}

		this.blueObjectives.set({
			gold: blueGold,
			championKills: blueChampionKills,
			towerKills: blueTowerKills,
			grubKills: blueGrubKills,
			heraldKills: blueHeraldKills,
			dragonKills: blueDragonKills,
			baronKills: blueBaronKills,
			atakhan: blueAtakhanKills === 1
		});

		this.redObjectives.set({
			gold: redGold,
			championKills: redChampionKills,
			towerKills: redTowerKills,
			grubKills: redGrubKills,
			heraldKills: redHeraldKills,
			dragonKills: redDragonKills,
			baronKills: redBaronKills,
			atakhan: redAtakhanKills === 1
		});

		this.goldTracker.update((items) => [
			...items,
			{
				blue: blueGold,
				red: redGold,
				minute: Math.round(data.gameData.gameTime / 60)
			}
		]);

		return {
			duration: data.gameData.gameTime,
			blueTop: blueChampions.find((x) => x.position === "TOP")?.championId,
			blueJG: blueChampions.find((x) => x.position === "JUNGLE")?.championId,
			blueMid: blueChampions.find((x) => x.position === "MIDDLE")?.championId,
			blueBot: blueChampions.find((x) => x.position === "BOTTOM")?.championId,
			blueSupp: blueChampions.find((x) => x.position === "UTILITY")?.championId,

			redTop: redChampions.find((x) => x.position === "TOP")?.championId,
			redJG: redChampions.find((x) => x.position === "JUNGLE")?.championId,
			redMid: redChampions.find((x) => x.position === "MIDDLE")?.championId,
			redBot: redChampions.find((x) => x.position === "BOTTOM")?.championId,
			redSupp: redChampions.find((x) => x.position === "UTILITY")?.championId,

			goldDifference: blueGold - redGold,

			blueChampKills: blueChampionKills,
			blueTowerKills: blueTowerKills,
			blueGrubs: blueGrubKills,
			blueHeralds: blueHeraldKills,
			blueDragons: blueDragonKills,
			blueBaron: blueBaronKills,
			blueAtakhan: blueAtakhanKills,

			redChampKills: redChampionKills,
			redTowerKills: redTowerKills,
			redGrubs: redGrubKills,
			redHeralds: redHeraldKills,
			redDragons: redDragonKills,
			redBaron: redBaronKills,
			redAtakhan: redAtakhanKills
		} as IModelData;
	}

	private getChampions(players: any[]): {
		blueChampions: IChampion[];
		redChampions: IChampion[];
	} {
		const blueChampions: IChampion[] = [];
		const redChampions: IChampion[] = [];

		for (const player of players) {
			const champ = this.getChampion(player.championName);

			if (player.team === "ORDER") {
				blueChampions.push({
					summonerName: player.isBot ? player.riotIdGameName + " Bot" : player.riotIdGameName,
					position: player.position,
					championId: champ.key,
					image: champ.image.full,
					name: champ.name,
					displayOrder: championSortMap.get(player.position) ?? 0
				});
			} else {
				redChampions.push({
					summonerName: player.isBot ? player.riotIdGameName + " Bot" : player.riotIdGameName,
					position: player.position,
					championId: champ.key,
					image: champ.image.full,
					name: champ.name,
					displayOrder: championSortMap.get(player.position) ?? 0
				});
			}
		}

		this.blueChampions.set(blueChampions.sort((a, b) => (a.displayOrder - b.displayOrder) * -1));
		this.redChampions.set(redChampions.sort((a, b) => (a.displayOrder - b.displayOrder) * -1));

		return {
			blueChampions,
			redChampions
		};
	}

	private getChampion(championName: string): any {
		const champions = this.champions();
		let retval: any = null;

		Object.values(champions.data).forEach((champion: any) => {
			if (retval != null) {
				return;
			}

			if (champion.name === championName) {
				retval = champion;
			}
		});

		if (retval == null) {
			console.error(`Could not find championId with name ${championName}`);
		}
		return retval;
	}

	private handleError(err: any): Observable<void> {
		// TODO: Save to files
		console.error(err);

		const results = {
			predictions: this.predictions(),
			goldTracker: this.goldTracker(),
			redObjectives: this.redObjectives(),
			blueObjectives: this.redObjectives()
		};

		console.log(results);

		return of();
	}
}
