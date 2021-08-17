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

function delay(s)
{
	return new Promise((resolve,reject)=>{
		setTimeout(function(){ 
			console.log("...waiting ",s,"sec ...");
			resolve();
		}, s*1000);
	});
}

async function buyMarket(symbol,quantity,liczba_prob)
{ 
	let params={
		type:'MARKET',
		quantity: quantity
	};
	let log={};
	
		do{	
			try {
				log=await binance.futuresMarketBuy( symbol,quantity,params );
			} catch (error) {
				console.log('buyMarket(',symbol,',',quantity,')')
				console.log(error)
			}
			console.log(log);
			liczba_prob --;
			if(log.code<0) await delay(1);
				else log.code = 0;
			console.log('buyMarket::futuresMarketBuy-> Pozostalo prob: ',liczba_prob);
		}while(log.code<0 && liczba_prob>0) 
		
		return log;


}
async function setBuyStopLoss(symbol,quantity,price,liczba_prob)
{
	console.log('setBuyStopLoss(',symbol,', q:',quantity,', price:',price,', n:',liczba_prob,')');
	let params={
		type:'STOP_MARKET',
		stopPrice: price,
		closePosition:true,
		quantity:quantity
	};
	
	do{	
		try {
			log=await binance.futuresMarketSell( symbol,quantity,params );
		} catch (error) {
			
			console.log(error)
		}
			console.log(log);
			liczba_prob --;
			if(log.code == -2021) //msg:'Order would immediately trigger.'
			{ //sellMarket

				break;
			}
			 if(log.code<0) await delay(1);
			 else log.code = 0;
			console.log('setBuyStopLoss::futuresMarketSell-> Pozostalo prob: ',liczba_prob);
		}while(log.code<0 && liczba_prob>0) 
		
	
	return log;
	
}

async function buyWithStopLoss(symbol,quantity,diff_price,liczba_prob)
{
	const buy=await buyMarket(symbol,quantity,liczba_prob);
	if( buy.code == 0)
	{
		const SL_price=buy.price - diff_price;
		const sellCode =await setBuyStopLoss(symbol,quantity,SL_price,liczba_prob);
	}
}

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
		try{
		const r = await pobierzSwieczki15min(element);
		let swieczka = setSwieczke(r,element.symbol,element.interwal);

		swieczka = przeliczSymbol(swieczka);
		swieczki.push(swieczka);
		}catch(err)
		{
			console.log('programInit(',element.symbol,', ',element.interwal,'):pobierzSwieczki15min')
			console.log(err);
		}
	  }
	  let orderAll= [];
	  try{
	  orderAll = await binance.futuresAllOrders();
	  }catch{
		console.log('programInit(',element.symbol,', ',element.interwal,'):futuresAllOrders')
		console.log(err);
	  }
	  for (const el of configTab) {
	//	  let ord = orderAll.filter(x=>x.symbol==el.symbol)
	//	  let order={"symbol":el.symbol, "orderList": ord};
	//	  ordery.push(order);
	  }
}

function pobierzSwieczki15min(e)
{
	console.log("pobierzSwieczki15min: ",e.symbol);
	let r=["brak"];
	return new Promise((resolve, reject) => {
		try{
		const req = binance.candlesticks(e.symbol, e.interwal, function(error, ticks) {
			r=ticks.map(e=>Candle.init(e));		
			resolve(r);
		},{limit: e.liczba});
		}catch(err)
		{
			console.log('pobierzSwieczki15min(',e.symbol,', ',e.interval,')');
			reject(err);
		}
	
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

	buyWithStopLoss('BTCUSDT',0.001,46400,3);
	return;


// When the stop is reached, a stop order becomes a market order
// Note: You must also pass one of these type parameters:
// STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT
let type = "STOP_LOSS";
let quantity = 1;
let price = 50000;
let stopPrice = 19000;
let params={
	type:'TRAILING_STOP_MARKET',
	activationPrice: price-0.02*price,
	callbackRate: 1,

};
let log;
//binance.sell("ETHBTC", quantity, price, {stopPrice: stopPrice, type: type});
//log= await binance.futuresMarketBuy( 'BTCUSDT', 0.01);
	//let log= await binance.futuresBuy( 'BTCUSDT', quantity,price);

	/********* stop loss  ********/
	price = 38500;
	params={
		type:'STOP_MARKET',
		stopPrice:38813,
		closePosition:true,
		workingType:'CONTRACT_PRICE'
	};
 //   log=await binance.futuresMarketSell( 'BTCUSDT', 1,params );
	/********* stop loss  ********/



//	console.info( await binance.futuresGetDataStream() );
	console.log( log);
};

main();