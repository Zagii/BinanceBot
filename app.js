//const binance = require('../node-binance-api.js');
const Binance = require('node-binance-api');
const Candle = require('./candle');
const Matematyka = require('./matematyka');
const Secrets = require('./secrets.json');
const Api = require('./api');
const Config= require('./config');

const binance = new Binance().options({
  APIKEY: Secrets.API_KEY,
  APISECRET: Secrets.API_SECRET,
  test: true,
  useServerTime: true,
});


let configTab=[];
let swieczki=[];
let orderyOpen=[];
let pozycje=[];


function setSwieczke(e,symbol,interwal)
{
	console.log("dodaje swieczke: "+symbol);
	let o={'symbol':symbol, "interwal": interwal, "swieczki":e};

	return o;
}
  
function przeliczSymbol(dane,config)
{
	//console.log('przeliczSymbol: '+dane.symbol);
	dane.maxKurs = Matematyka.getMax(dane.swieczki,"high");
	dane.minKurs = Matematyka.getMin(dane.swieczki,"low");
	dane.dataMA = Matematyka.calculateMA(config.maLiczba,dane.swieczki,"close");
//	dane.dataMA10 = Matematyka.calculateMA(10,dane.swieczki,"close");
//	dane.dataMA15 = Matematyka.calculateMA(15,dane.swieczki,"close");
	return dane;
}


async function programInit()
{
	configTab=Config.getConfigTab();
	const exinfo = await binance.futuresExchangeInfo();
	
	for (const [i,element] of configTab.entries()) {
		try{
			configTab[i].exInfo= exinfo.symbols.find(x=>x.symbol===element.symbol);
		const r = await pobierzSwieczki15min(element);
		let swieczka = setSwieczke(r,element.symbol,element.interwal);

		swieczka = przeliczSymbol(swieczka,element);
		swieczki.push(swieczka);
		}catch(err)
		{
			console.log('programInit(',element.symbol,', ',element.interwal,'):pobierzSwieczki15min')
			console.log(err);
		}
	  }
	  
	  pozycje = await Api.getMyPositions();
	  orderyOpen = await Api.getMyOpenOrders();
	 
	 
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


async function nowaSwieczkaWS(candlesticks)
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
	let conf =configTab.find(x=>x.symbol==symbol)
	swieczki[a]= przeliczSymbol(swieczki[a],conf);
}


function subskrybuj()
{
	for (const element of configTab) {
		binance.websockets.candlesticks(element.symbol, element.interwal, (candlesticks) =>nowaSwieczkaWS(candlesticks) );
	}
}

async function cyklicznie()
{
	//pobierz pozycje
	pozycje = await Api.getMyPositions();
	orderyOpen = await Api.getMyOpenOrders();
	// dodac automatycznego stoplosa gdy nie ma orderow konczacych zlecenie na wypadek awarii
	for (const e of configTab)
	{
		let a = swieczki.findIndex(x=>(x.symbol==e.symbol && x.interwal==e.interwal));
		await Api.setOrderJesliTrzeba(e.symbol,e,swieczki[a],pozycje);

		let p= pozycje.find(x=>x.symbol==e.symbol);
		if(!p || p.positionAmt==0) continue;
		let orderType= p.positionAmt>0? 'BUY':'SELL';
		let ord = orderyOpen.filter(x=>x.symbol==e.symbol&& x.side!=orderType );
		let sl;
		let nowySL;
	
		if(orderType=='BUY') //buy
		{
			sl = Matematyka.getMax(ord,"stopPrice");
			nowySL=Matematyka.getNowySL(p,sl,e,orderType);
		}else
		{
			sl = Matematyka.getMin(ord,"stopPrice");
			nowySL=Matematyka.getNowySL(p,sl,e,orderType);
		}
		let ordToCancel=[];
		if(nowySL!=sl)	
		{
			let ordSL = await Api.setOrderStopLoss(orderType,e.symbol,p.positionAmt,nowySL,2,e);
			console.log(ordSL);
			console.log('** NowySL: ',orderType, '-->', e.symbol,', sl: ',sl,', nowySL: ',nowySL);
			ordToCancel=orderyOpen.filter(x=>x.symbol==e.symbol).map(x=>{return {orderId: String(x.orderId)}});
			let cancelStatus = await Api.cancelOrderList(e.symbol,ordToCancel);
			console.log(cancelStatus);
		}
	}
}

async function main()
{
	console.log("Start");
	console.log("liczba symboli, start: "+ swieczki.length);
	await programInit();
	console.log("liczba symboli, await: "+ swieczki.length);
	subskrybuj();
	setInterval(cyklicznie,5000);	
};

main();