export interface IChampion {
	summonerName: string;
	position: "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY" | "";
	championId: number;
	image: string;
	name: string;
	displayOrder: number;
}
