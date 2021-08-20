const configTab=[
	{ 
		'symbol':'BTCUSDT',
		'interwal':'15m', // na jakich świeczkach operujemy
		'liczba': 20,	// liczba świeczek do analizy
		'slPips':10000,	// liczba pipsów dla stop loss
		'maLiczba':7,	// jaki MA liczymy
		'maOrderTrigger':1000, // jaka musi być różnica MA-kurs by zlozyc zlecenie
		'quantity':0.025, // wielkosc zakladu
	},
	{ 
		'symbol':'BNBUSDT',
		'interwal':'15m', // na jakich świeczkach operujemy
		'liczba': 20,	// liczba świeczek do analizy
		'slPips':2000,	// liczba pipsów dla stop loss
		'maLiczba':7,	// jaki MA liczymy
		'maOrderTrigger':500, // jaka musi być różnica MA-kurs by zlozyc zlecenie
		'quantity':10, // wielkosc zakladu
	},
	{ 
		'symbol':'ETHUSDT',
		'interwal':'15m', // na jakich świeczkach operujemy
		'liczba': 20,	// liczba świeczek do analizy
		'slPips':3000,	// liczba pipsów dla stop loss
		'maLiczba':7,	// jaki MA liczymy
		'maOrderTrigger':1000, // jaka musi być różnica MA-kurs by zlozyc zlecenie
		'quantity':0.05, // wielkosc zakladu
	},
	{ 
		'symbol':'BCHUSDT',
		'interwal':'15m', // na jakich świeczkach operujemy
		'liczba': 20,	// liczba świeczek do analizy
		'slPips':300,	// liczba pipsów dla stop loss
		'maLiczba':7,	// jaki MA liczymy
		'maOrderTrigger':150, // jaka musi być różnica MA-kurs by zlozyc zlecenie
		'quantity':0.02, // wielkosc zakladu
	}
];
var config={

getConfigTab: function(){
    return configTab;
}

};

module.exports=config;