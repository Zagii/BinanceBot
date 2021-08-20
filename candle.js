var candle=
{
    init: function(arr){
            let r={
                'time':arr[0], 'timeStr':new Date(arr[0]).toLocaleString(),
                'open':arr[1], 'high':arr[2], 'low':arr[3], 'close':arr[4], 'volume':arr[5], 
                'closeTime':arr[6], 'closeTimeStr':new Date(arr[6]).toLocaleString(), 
               // 'assetVolume':arr[7], 
                //'trades':arr[8], 'buyBaseVolume':arr[9], 'buyAssetVolume':arr[10], 'ignored':arr[11]
            };
            
            return r;
        },
      
    initWS: function(arr){
   /*     "k": {
            "t": 123400000,     // Kline start time
            "T": 123460000,     // Kline close time
            "s": "ABC_0DX-BNB",      // Symbol
            "i": "1m",          // Interval
            "f": "100",         // First trade ID
            "L": "200",         // Last trade ID
            "o": "0.0010",      // Open price
            "c": "0.0020",      // Close price
            "h": "0.0025",      // High price
            "l": "0.0015",      // Low price
            "v": "1000",        // Base asset volume
            "n": 100,           // Number of trades
            "x": false,         // Is this kline closed?
            "q": "1.0000",      // Quote asset volume
          }*/
        let r={
            'time':arr.t, 'timeStr':new Date(arr.t).toLocaleString(),
            'open':arr.o, 'high':arr.h, 'low':arr.l, 'close':arr.c, 'volume':arr.v, 
            'closeTime':arr.T, 'closeTimeStr':new Date(arr.T).toLocaleString(), 
            //'assetVolume':arr.v, 'trades':arr.n, 'buyBaseVolume':arr[9], 'buyAssetVolume':arr[10],
            'isFinal':arr.x //,'interwal':arr.i,symbol:arr.s
        };
        //return { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = arr;
        return r;
    },
    warning:function (warning) { 
        console.log('Warning: ' + warning);
    },
    error:function (error) { 
        console.log('Error: ' + error);
    },
    setSwieczke: function (e,symbol,interwal)
    {   
	    console.log("dodaje swieczke: "+symbol);
	    let o={'symbol':symbol, "interwal": interwal, "swieczki":e};
	    return o;
    }

};
module.exports = candle;