const { waitForDebugger } = require('inspector');
const Binance = require('node-binance-api');
const binance = new Binance().options({
  
  //test
  APIKEY: '***',
  APISECRET: '***', 
  test: true,
  useServerTime: true
});

function parsuj(x)
{
 //t= x[0];
 s= 'BTCUSDT';
 t= x.find(a=>a.symbol==s);
 console.log(t.symbol +' '+ t.markPrice);
}

async function bot() {
 // console.info( await binance.futuresPrices() );
 // let ticker = await binance.prices();
 // console.info(ticker);
  //console.info(`Price of BNB: ${ticker.BNBUSDT}`);
  //console.info( await binance.futuresBalance() );
  console.info( 'Testowy market BTC\n' );
  //console.info( await binance.futuresMarketBuy('BTCUSDT', 0.01));
  // result2 = await binance.futuresMarketBuy( 'BTCUSDT', 0.001, { newOrderRespType: 'RESULT' } );
  // console.info(result2.avgPrice);
  // console.info( await binance.futuresSell( 'BTCUSDT', 0.001, 0 ,  { type: 'STOP_MARKET', stopPrice: result2.avgPrice - 1000 }) );
  // result3 = await binance.futuresMarketBuy( 'DASHUSDT', 90, { newOrderRespType: 'RESULT' } );
  // console.info(result3.avgPrice);
  // console.info(parseFloat(result3.avgPrice).toFixed( 2 ));
  // console.info( await binance.futuresSell( 'DASHUSDT', 90, 0 ,  { type: 'STOP_MARKET', stopPrice: parseFloat(result3.avgPrice).toFixed( 2 ) - 1 }) );
  //console.log(binance);

  //binance.futuresMarkPriceStream(x=>{ parsuj(x)} );
  //binance.futuresMarkPriceStream( console.log );
  //binance.futuresMarkPriceStream( 'BTCUSDT', console.log );

}

//bot();

async function _00PobierzSwieczki(Para,Interval = "1m",Limit){
  //wynik = await binance.deliveryMarkPriceKlines(Para,Interval,{limit: Limit});
  //console.log(await binance.deliveryMarkPriceKlines(Para,Interval,{limit: Limit}))
  wynikjs = await binance.deliveryMarkPriceKlines(Para,Interval,{limit: Limit});
return wynikjs;
}

async function _01SprawdzAktualnyTrend(Para,Ilosc){
  wynikjs = await binance.futuresTrades(Para,{limit: Ilosc});
  if (Number(wynikjs[0].price) <= Number(wynikjs[Ilosc-1].price)) return "BUY"; else return "SELL";
}

async function _10AnalizaSwieczek(PobraneSwieczki,IleSwieczekOdpuscic,OdlegloscOdSredniejWProcentach){
  OdchylenieOdDelty = OdlegloscOdSredniejWProcentach/100;
  //Ile Swieczek do analizy wejscia
  IleAnalizowacOstatnich = IleSwieczekOdpuscic;

  var PO = 0;
  var PC = 0;
  var NumerLinii = 0;
  var RoznicaDelty = 0;
  var SredniaChwilowa = 0;
  var SredniaKroczaca = 0;
  var SumaMax = 0;
  var SumaMin = 0;
  var DeltaMin = 0;
  var DeltaMax = 0;
  var Delta = 0;

  Decyzja="NIE";

  //Jaka jest probka
  IloscSwieczek = PobraneSwieczki.length;

  IlePierwszychSwieczek = IloscSwieczek - IleAnalizowacOstatnich;

  for (var i=0; i < PobraneSwieczki.length; i++){
    PriceOpen = Number(PobraneSwieczki[i][1]);
    PriceClose = Number(PobraneSwieczki[i][4]);
    PO = PriceOpen;
    PC = PriceClose;
    NumerLinii++;
    if (PriceOpen < PriceClose) {
      PriceHigh = PriceClose;
      PriceLow = PriceOpen;
    } else {
      PriceHigh = PriceOpen;
      PriceLow = PriceClose;
    }

    if (NumerLinii == 1) {
      SredniaChwilowa = (PriceHigh + PriceLow) / 2;
      console.log(SredniaChwilowa);
      SumaMin = SumaMin + PriceLow;
      SumaMax = SumaMax + PriceHigh;
      SredniaKroczaca = (SumaMin + SumaMax) / 2;
      //zdefiniowanie startu badania delty
      DeltaMin = SredniaChwilowa;
      DeltaMax = SredniaChwilowa;
    } else {
      SredniaChwilowa = (PriceHigh + PriceLow) / 2;
      SumaMin = SumaMin + PriceLow;
      SumaMax = SumaMax + PriceHigh;
      SredniaKroczaca = ((SumaMin / NumerLinii) + (SumaMax / NumerLinii)) / 2;
      if (NumerLinii < IlePierwszychSwieczek) {
        if (DeltaMin > SredniaChwilowa) DeltaMin = SredniaChwilowa;
        if (DeltaMax < SredniaChwilowa) DeltaMax = SredniaChwilowa;
      }
    }
    //sprawdzenie czy wchodzic przy ostatniej linii
    if (NumerLinii == IloscSwieczek){
      RoznicaDelty = DeltaMax - DeltaMin;
      OdlegloscOdSredniejKroczacej = PriceClose - SredniaKroczaca;
      console.log("Roznica delty:",RoznicaDelty * OdchylenieOdDelty);
      console.log("OdlOdSredniejKrocz:",OdlegloscOdSredniejKroczacej);
      if (Math.abs(OdlegloscOdSredniejKroczacej) > (RoznicaDelty * OdchylenieOdDelty)){
        Decyzja="TAK";
      }
    }
  
  }
  
  if (PC > SredniaKroczaca){
    Kierunek = "BUY";
  } else {
    Kierunek="SELL";
  }
 console.log(Decyzja + " " + SredniaKroczaca + " " + RoznicaDelty + " " + Kierunek);
 return {Wchodzic:Decyzja,SredniaKroczaca:SredniaKroczaca,Odleglosc:RoznicaDelty,Kierunek:Kierunek}
}

async function _21WystawZlecenie(Para,Kierunek,Ilosc){
  if (Kierunek == 'BUY') {
    result = await binance.futuresMarketBuy(Para,Ilosc, { newOrderRespType: 'RESULT' } );
    return {avgPrice: result.avgPrice,orderId: result.orderId};
  }
  if (Kierunek == 'SELL') {
    result = await binance.futuresMarketSell(Para,Ilosc, { newOrderRespType: 'RESULT' } );
    return {avgPrice: result.avgPrice,orderId: result.orderId};
  }

}

async function _22UstawStoploss(Para,Kierunek,CenaSL){
  // console.info( await binance.futuresSell( 'DASHUSDT', 90, 0 ,  { type: 'STOP_MARKET', stopPrice: parseFloat(result3.avgPrice).toFixed( 2 ) - 1 }) );
  if (Kierunek == 'BUY'){
    result =  await binance.futuresBuy( Para, 0.001, 0 ,  { type: 'STOP_MARKET', stopPrice: CenaSL, closePosition: true });
    return result;
  }
  if (Kierunek == 'SELL'){
    result = await binance.futuresSell( Para, 0.001, 0 ,  { type: 'STOP_MARKET', stopPrice: CenaSL, closePosition: true });
    return result;
  }
}

async function _24UsunWszystkieStoplossy(Para){
  console.log( await binance.futuresCancelAll(Para) );
}


lockBTCUSDT=false;

async function _333Hellbot(Para) {
  console.log(Para);
  //konfig dla BTCUSDT
  IleSwieczekPobrac=5;
  IleSwieczekOminac=1;
  OdlegloscOdSredniej=10; //procent
  
  //Trend
  ZIluOrderowSprawdzacTrend=20;
  
  //Wejscie na pozycje
  IloscCoina=0.02;
  CenaStart=46000;
  Precyzja=2;
  SLMin=0.05; // w dolarach
  SLBig=0.10;
  CzasPoPostawieniuPozycjiDoSL=3; //s
  //SLPierwszyRoznicaOdPozycji=$(echo "scale=$Precyzja; $CenaStart - (($CenaStart * $IloscCoina - $SLMin) / $IloscCoina)" | bc -l | sed -e 's/^-\./-0./' -e 's/^\./0./');
  SLPierwszyRoznicaOdPozycji=CenaStart-((CenaStart*IloscCoina-SLMin)/IloscCoina);
  //Obserwacja Pozycji
  //CoIleKolejnySL=$(echo "scale=$Precyzja; $CenaStart - (($CenaStart * $IloscCoina - $SLBig) / $IloscCoina)" | bc -l | sed -e 's/^-\./-0./' -e 's/^\./0./');
  CoIleKolejnySL=CenaStart-((CenaStart*IloscCoina-SLBig)/IloscCoina);
  
  console.log("SLPierwszyRoznicaOdPozycji=",SLPierwszyRoznicaOdPozycji);
  console.log("CoIleKolejnySL=",CoIleKolejnySL);
    
  CenaSL=0;

  if ( lockBTCUSDT == true ) {
    console.log("Lock istnieje");
    CenaZlecenia=_25SprawdzCeneZlecenia(Para);
    if ( CenaZlecenia == 0 ) {
      console.log("Pozycji brak.");
      console.log("Zdejmuje locka");
      lockBTCUSDT=false;
      console.log("Zdejmuje wszystkie SL");
      _24UsunWszystkieStoplossy(Para);
      console.log("");
    }
    return;
  }
  
  //sprawdzenie, czy lapie sie na wejscie
  //Pobranie swieczek
  PobraneSwieczki = await _00PobierzSwieczki(Para,'1m',IleSwieczekPobrac);
  //Analiza Pobranych Swieczek
  console.log("Pobrane swieczki dla ",Para);
  console.log(PobraneSwieczki);
  AnalizaSwieczek = await _10AnalizaSwieczek(PobraneSwieczki,IleSwieczekOminac,OdlegloscOdSredniej);
  // console.log(AnalizaSwieczek.Kierunek);
  if (AnalizaSwieczek.Kierunek == "BUY") KierunekPrzeciwny = "SELL"; else KierunekPrzeciwny = "BUY";

  if (AnalizaSwieczek.Wchodzic == "TAK"){
    //Sprawdzenie aktualnego trendu
    AktualnyTrend = await _01SprawdzAktualnyTrend(Para,30);
    if (AktualnyTrend == AnalizaSwieczek.Kierunek){
      //postawienie pozycji
      console.log("Zlecenie ",AnalizaSwieczek.Kierunek);
      WystawZlecenie = await _21WystawZlecenie(Para,AnalizaSwieczek.Kierunek,IloscCoina); 
      IdPozycji = WystawZlecenie.orderId;
      CenaEntry = Number(WystawZlecenie.avgPrice);
      lockBTCUSDT = true;
      console.log("idPozycji ",IdPozycji, "Srednia Cena", CenaEntry);

      //ustawienie stoplossa
      if (AnalizaSwieczek.Kierunek == "BUY") 
        CenaSL = CenaEntry - SLPierwszyRoznicaOdPozycji;
      else 
        CenaSL = CenaEntry + SLPierwszyRoznicaOdPozycji;
      
      resultjs = await _22UstawStoploss(Para,KierunekPrzeciwny,CenaSL);
      console.log("StopLoss:",resultjs);
      
    }
  }
  

}


async function testAsync(){
  wyniktest = await _00PobierzSwieczki("ALICEUSDT","1m",10);
  await _10AnalizaSwieczek(wyniktest,3,200);
}

//testAsync();


_333Hellbot("BTCUSDT");


