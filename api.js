const Binance = require('node-binance-api');
const Secrets = require('./secrets.json');
const Utils = require('./utils')

const binance = new Binance().options({
    APIKEY: Secrets.API_KEY,
    APISECRET: Secrets.API_SECRET,
    test: true,
    useServerTime: true,
  });
  

var api={

    setOrderStopLoss: async function (stopOrder,symbol,quantity,price,liczba_prob,config)
    {
        console.log('setOrderStopLoss(',stopOrder,', ',symbol,', q:',quantity,', price:',price,', n:',liczba_prob,')');
       
        let mnoznikprob=liczba_prob;
        do{	
            price=parseFloat(price).toFixed(config.exInfo.pricePrecision);
            let params={
                type:'STOP_MARKET',
                stopPrice: price,
                closePosition:true,
                quantity:quantity,
                newOrderRespType: 'RESULT',        
            };
            console.log('setOrderStopLoss::',stopOrder,'slPrice: ',params.stopPrice,'-> Pozostalo prob: ',liczba_prob);
            try {
                if(stopOrder=='BUY')
                    log=await binance.futuresMarketSell( symbol,quantity,params );
                else
                    log=await binance.futuresMarketBuy( symbol,quantity,params );
            } catch (error) {
                console.log(error)
            }
            console.log(log);
            liczba_prob --;
            if(log.code == -2021) //msg:'Order would immediately trigger.'
            { //sellMarket //buyMarket
                let x=0.01 *(mnoznikprob-liczba_prob);
                if(stopOrder=='BUY')
                  price-= parseFloat(params.stopPrice)* x;
                else
                  price+= parseFloat(params.stopPrice)* x;
                
            }
            if(log.code<0) await Utils.delay(1);
            else log.code = 0;
               
        }while(log.code<0 && liczba_prob>0) 	
    	return log;
    },
    setOrderMarket: async function (order,symbol,quantity,liczba_prob/*,closePosition=false*/)
    { 
       
        let log={};
        do{	
            let params={
                type:'MARKET',
                quantity: quantity,
                newOrderRespType: 'RESULT',
            };
            try {
                if(order=='BUY')
                    log=await binance.futuresMarketBuy( symbol,quantity,params );
                else
                        log=await binance.futuresMarketSell( symbol,quantity,params );
            } catch (error) {
                console.log('orderMarket(',order,', ',symbol,',',quantity,')')
                console.log(error)
            }	
            console.log(log);
            liczba_prob --;
            if(log.code<0) await Utils.delay(1);
                else log.code = 0;
            console.log('orderMarket::',order,'-> Pozostalo prob: ',liczba_prob);
        }while(log.code<0 && liczba_prob>0) 
        return log;
    },
    setOrderWithStopLoss: async function (order, symbol,quantity,diff_price,liczba_prob,config)
    {
        console.log('setOrderWithStopLoss(',order,',',symbol,', ',quantity,',',diff_price,', ',liczba_prob,')')
        quantity=parseFloat(quantity).toFixed(config.exInfo.quantityPrecision);
        const ord=await this.setOrderMarket(order,symbol,quantity,liczba_prob);
        if( ord.code == 0)
        {
            const znak= order =='BUY'? -1: 1;
            const SL_price=parseFloat(+ord.avgPrice + diff_price*znak).toFixed( config.exInfo.pricePrecision );
            console.log(order,' avrg price: ',ord.avgPrice,', diffPrice: ',diff_price,', planned SL price: ',SL_price);
            const ordClose =await this.setOrderStopLoss(order,symbol,quantity,SL_price,liczba_prob,config);
            console.log('SL avgPrice: ',ordClose.avgPrice);
        }
    },
    getMyPositions: async function()
    {
        let p={};
        try{
            p = await binance.futuresPositionRisk();
            p = p.filter(x=>x.positionAmt!=0);
        }catch(err){
		    console.log('ERROR: getMyPositions()')
		    console.log(err);
	    }
        return p;
    },
    getMyOpenOrders: async function()
    {
        let o={};
        try{
            o = await binance.futuresOpenOrders();
        }catch(err){
	    	console.log('ERROR: getMyOpenOrders()')
	    	console.log(err);
	     }
         return o;
    },
    cancelOrderList: async function(symbol,orderList)
    {
        let o=[];
        if(orderList.length<=0) return "brak orderow";
        for(const ord of orderList)
        {
       
        try{
          o.push( await binance.futuresCancel(symbol, ord) );
        }catch(err){
            console.log('ERROR: cancelOrderList() - ',ord.orderId)
	    	console.log(err);
	     }
        }
         return o;
        
    },
    setOrderJesliTrzeba: async function(symbol,conf,swieczki,pozycje)
    {	
        let ma=swieczki.dataMA[swieczki.dataMA.length-1];
        let pr=swieczki.swieczki[swieczki.swieczki.length-1].close;
        let roznica =(pr - ma)*Math.pow(10,conf.exInfo.pricePrecision);
        console.log('setOrderJesliTrzeba,',symbol,'- ma5: ',ma, 'currPrice:',pr,', roznica:', roznica);
        let orderType='brak';
        if(roznica>conf.maOrderTrigger)
        {
            orderType='BUY';
        }
        if(roznica<conf.maOrderTrigger*(-1))
        {
            orderType='SELL';
        }	
        let p=pozycje.find(x=>x.symbol==symbol);
        if((!p || p.positionAmt==0) && orderType!='brak')
        {
            console.log('symbol ',symbol,' zlec order: ',orderType, ', curPrice: ',pr);
            let diff= conf.slPips*Math.pow(10,-conf.exInfo.pricePrecision);
            let	liczba_prob=10;
            await this.setOrderWithStopLoss(orderType,symbol,conf.quantity,diff,liczba_prob,conf);
        }}
};
module.exports = api;