//const binance = require('../node-binance-api.js');
const Binance = require('node-binance-api');
const Candle = require('./candle');
const Matematyka = require('./matematyka');
const Secrets = require('./secrets.json')

const binance = new Binance().options({
  APIKEY: Secrets.API_KEY,
  APISECRET: Secrets.API_SECRET,
  test: true
});


const configTab=[
	{ 
		'symbol':'BTCUSDT',
		'interwal':'15m',
		'liczba': 20
	},
/*	{ 
		'symbol':'BNBBTC',
		'interwal':'15m',
		'liczba': 20
}*/
];

let swieczki=[];

function setSwieczke(e,symbol,interwal)
{
	console.log("dodaje swieczke: "+symbol);
	let o={'symbol':symbol, "interwal": interwal, "swieczki":e};

	return o;
}
  
function przeliczSymbol(dane)
{
	console.log('przeliczSymbol: '+dane.symbol);
	dane.maxKurs = Matematyka.maxKurs(dane.swieczki,"high");
	dane.minKurs = Matematyka.minKurs(dane.swieczki,"low");
	dane.dataMA5 = Matematyka.calculateMA(5,dane.swieczki,"close");
	dane.dataMA10 = Matematyka.calculateMA(10,dane.swieczki,"close");
	dane.dataMA15 = Matematyka.calculateMA(15,dane.swieczki,"close");
	return dane;
}


async function programInit()
{

	for (const element of configTab) {
		const r = await pobierzSwieczki15min(element);
		let swieczka = setSwieczke(r,element.symbol,element.interwal);

		swieczka = przeliczSymbol(swieczka);
		swieczki.push(swieczka);
	  }

}

function pobierzSwieczki15min(e)
{
	console.log("pobierzSwieczki15min: ",e.symbol);
	let r=["brak"];
	return new Promise((resolve, reject) => {
		const req = binance.candlesticks(e.symbol, e.interwal, function(error, ticks) {
			r=ticks.map(e=>Candle.init(e));		
			resolve(r);
		},{limit: e.liczba});
	
	
	});
}


/*
// Getting latest price of a symbol

// Getting list of current balances
binance.balance(function(error, balances) {
	console.log("balances()", balances);
	if ( typeof balances.ETH !== "undefined" ) {
		console.log("ETH balance: ", balances.ETH.available);
	}
});
*/

// Getting list of open orders
//binance.openOrders("ETHBTC", function(error, json) {
//	console.log("openOrders()",json);
//});

// Check an order's status
//let orderid = "7610385";
//binance.orderStatus("ETHBTC", orderid, function(error, json) {
//	console.log("orderStatus()",json);
//});

// Cancel an order
//binance.cancel("ETHBTC", orderid, function(error, response) {
//	console.log("cancel()",response);
//});


// Get all account orders; active, canceled, or filled.
//binance.allOrders("ETHBTC", function(error, json) {
//	console.log(json);
//});

//Placing a LIMIT order
//binance.buy(symbol, quantity, price);
//binance.buy("ETHBTC", 1, 0.0679);
//binance.sell("ETHBTC", 1, 0.069);

//Placing a MARKET order
//binance.buy(symbol, quantity, price, type);
//binance.buy("ETHBTC", 1, 0, "MARKET")
//binance.sell(symbol, quantity, 0, "MARKET");


function nowaSwieczkaWS(candlesticks)
{

	let { e:eventType, E:eventTime, s:symbol, k:ticks, } = candlesticks;
	let interval=ticks.i;
	const e= Candle.initWS(ticks);
	console.info(symbol+" "+interval+" nowaSwieczkaWS");
	let a = swieczki.findIndex(x=>(x.symbol==symbol && x.interwal==interval));
	if (a<0) 
	{
		console.log("** ERR nieznana swieczka");
		console.log(e);
		return;
	}
	if (e.isFinal)
	{	// przesuwa okno pomiarowe
			swieczki[a].swieczki.shift();
			swieczki[a].swieczki.push(e);
	}else
	{ // update ostatniej swieczki
		swieczki[a].swieczki[swieczki[a].swieczki.length-1] = e;
	}
	swieczki[a]= przeliczSymbol(swieczki[a]);

	//sprawdz stop loss (czy zamknac pozycje)
	//sprawdz czy przesunac SL
	//sprawdz czy otwarta pozycja
	//czy otworzyc pozycje?
	// buy
	// sell
}
function subskrybuj()
{
	for (const element of configTab) {
		binance.websockets.candlesticks(element.symbol, element.interwal, (candlesticks) =>nowaSwieczkaWS(candlesticks) );
	}
}


async function main()
{
	console.log("Start");
	console.log("liczba symboli, start: "+ swieczki.length);
	await programInit();
	console.log("liczba symboli, await: "+ swieczki.length);
	subskrybuj();

	console.info( await binance.futuresOpenOrders() );
};

main();