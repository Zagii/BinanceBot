async function bot() {
    // console.info( await binance.futuresPrices() );
    // let ticker = await binance.prices();
    // console.info(ticker);
     //console.info(Price of BNB: ${ticker.BNBUSDT});
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


   #!/bin/bash
source configuration.profile

if [ $# -lt 3 ]; then echo "UZYCIE: $0 <BTCUSDT> <BUY|SELL> <cena market>"; exit 1; fi

apiMethod="POST"
apiCall="fapi/v1/order"

Symbol=$1;
Side=$2;
Quantity=1;
StopPrice=$3;

apiParams="symbol=$Symbol
&side=$Side&
type=STOP_MARKET&
quantity=$Quantity&
stopPrice=$StopPrice&
closePosition=true&
workingType=CONTRACT_PRICE&
recvWindow=10000";

ts=$(date +%s%3N)
paramsWithTs="$apiParams&timestamp=$ts"
rawSignature=$(echo -n $paramsWithTs | openssl dgst -sha256 -hmac "$SECRET_API" | sed -e 's/.* //');

curl --silent -H "X-MBX-APIKEY: $API_KEY" -X $apiMethod "$URL/$apiCall?$paramsWithTs&signature=$rawSignature" | tee -a logzapytan.log | jq .orderId


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