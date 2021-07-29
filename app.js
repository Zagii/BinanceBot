//const binance = require('../node-binance-api.js');
const Binance = require('node-binance-api');
const Candle = require('./candle');
const Matematyka = require('./matematyka');
const Secrets = require('./secrets.json')

const binance = new Binance().options({
  APIKEY: Secrets.API_KEY,
  APISECRET: Secrets.API_SECRET,
  test: true,
  useServerTime: true,
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

let listenKey;
let swieczki=[];
let ordery=[];

function setSwieczke(e,symbol,interwal)
{
	console.log("dodaje swieczke: "+symbol);
	let o={'symbol':symbol, "interwal": interwal, "swieczki":e};

	return o;
}
  
function przeliczSymbol(dane)
{
	//console.log('przeliczSymbol: '+dane.symbol);
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
	  let orderAll= [];
	  orderAll = await binance.futuresAllOrders();
	  for (const el of configTab) {
		  let ord = orderAll.filter(x=>x.symbol==el.symbol)
		  let order={"symbol":el.symbol, "orderList": ord};
		  ordery.push(order);
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


function nowaSwieczkaWS(candlesticks)
{

	let { e:eventType, E:eventTime, s:symbol, k:ticks, } = candlesticks;
	let interval=ticks.i;
	const e= Candle.initWS(ticks);
	//console.info(symbol+" "+interval+" nowaSwieczkaWS");
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
	//symbol, quantity, price, params = {}

	// sell
}
function subskrybuj()
{
	for (const element of configTab) {
		binance.websockets.candlesticks(element.symbol, element.interwal, (candlesticks) =>nowaSwieczkaWS(candlesticks) );
	}

	//binance.futuresSubscribe(,console.log)
	//binance.deliveryAllOrders(consol.log)
	
}


async function main()
{
	console.log("Start");
	console.log("liczba symboli, start: "+ swieczki.length);
	await programInit();
	console.log("liczba symboli, await: "+ swieczki.length);
	subskrybuj();


// When the stop is reached, a stop order becomes a market order
// Note: You must also pass one of these type parameters:
// STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT
let type = "STOP_LOSS";
let quantity = 1;
let price = 40000;
let stopPrice = 19000;
let params={
	type:'TRAILING_STOP_MARKET',
	activationPrice: price-0.02*price,
	callbackRate: 1,

};
//binance.sell("ETHBTC", quantity, price, {stopPrice: stopPrice, type: type});
//log= await binance.futuresBuy( 'BTCUSDT', quantity,price, params );
	//let log= await binance.futuresBuy( 'BTCUSDT', quantity,price);
	
	price = 47500;
	params={
		type:'STOP_MARKET',
		stopPrice:39000
	
	};
//	log= await binance.futuresBuy( 'BTCUSDT', quantity );
//log=await binance.futuresMarketBuy( 'BTCUSDT', 1,params );
//	console.info( await binance.futuresGetDataStream() );
	console.info( log);
};

main();