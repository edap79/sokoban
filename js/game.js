function Game()
{
	this.main = function()
	{
		var mapTerrains = 
		[
			// name, symbol, color, isPassable, isMovable
			new MapTerrain("Goal", 		"+", "LightGreen", 	true, false),
			new MapTerrain("Floor", 	".", "Black",		true, false),
			new MapTerrain("Player",	"p", "Cyan", 		false, true),
			new MapTerrain("Slider", 	"o", "Brown", 		false, true),
			new MapTerrain("Wall", 		"x", "LightGray", 	false, false),
		];

		var level0 = new Level
		(
			"Level 0",
			new Map
			(
				mapTerrains,
				[
					"xxxxxxxxxxxx",
					"x..........x",
					"x.p........x",
					"x.....x....x",
					"x.....x..+.x",
					"x.....x....x",
					"x..o..x..+.x",
					"x.....x....x",
					"x..o..x....x",
					"x..........x",
					"x..........x",
					"xxxxxxxxxxxx",
				]
			)
		);

		Globals.Instance.initialize 
		(
			new Coords(120, 120), // viewSizeInPixels
			level0
		);
	}
}

new Game().main();