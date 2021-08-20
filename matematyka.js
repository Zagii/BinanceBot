var matematyka={
/** tab tablica, start,end zakres rozpatrywanych pol */
getMax: function(tab,pole, start, end) {
    let s = 0,
      e = tab.length - 1;
    if (start) s = start;
    if (end) e = end;
    let t=tab;
    if(s!=e)  
      t = tab.slice(s, e);
    return Math.max.apply(Math, t.map(o => +o[pole]));
  },
  /** tab tablica, start,end zakres rozpatrywanych pol */
getMin: function(tab, pole,  start, end) {
    let s = 0,
      e = tab.length - 1;
    if (start) s = start;
    if (end) e = end;
    let t=tab;
    if(s!=e) 
     t = tab.slice(s, e);
    return Math.min.apply(Math, t.map(o => +o[pole]));
  },
 calculateMA: function(objCount, tab,pole) {
    var result = [];
    let data= tab;//obiekt[pole];
    // console.log(data)
    if (data === null) return result;
    for (var i = 0, len = data.length; i < len; i++) {
      if (i < objCount) {
        result.push('-');
        continue;
      }
      var sum = 0;
      for (var j = 0; j < objCount; j++) {
        sum += +data[i - j][pole];//+data[i - j][1];
      }
      result.push(sum / objCount); //.toFixed(2));
    }
    return result;
 },
 przeliczSymbol: function(dane,config)
 {
	dane.maxKurs = this.getMax(dane.swieczki,"high");
	dane.minKurs = this.getMin(dane.swieczki,"low");
	dane.dataMA = this.calculateMA(config.maLiczba,dane.swieczki,"close");
	return dane;
 },
 getNowySL(p,sl,conf,orderType,ma)
 {

  let delta=p.entryPrice - p.markPrice;
  let deltaAbs=Math.abs(delta);
  
  let znak=orderType=='BUY'? -1:1;

  let zmiana = p.unRealizedProfit>0 ? deltaAbs * 0.1 : 0;
  let pips= conf.slPips + zmiana;
  
  let retSL=parseFloat(p.markPrice)+znak*pips*Math.pow(10,-conf.exInfo.pricePrecision);
  
  if(sl==Infinity || sl==-Infinity){  sl=retSL; console.log('Inf SL');}
  
  let deltaSL;
  if( orderType=='BUY' )
  {
    retSL = Math.min(retSL,ma);
    deltaSL =  retSL - sl;
  }
  else
  {
    retSL= Math.max(retSL,ma)
    deltaSL=  sl - retSL; 
  }


 // console.info('e: ',p.entryPrice,', m: ',parseFloat(p.markPrice).toFixed(2),', profit: ',p.unRealizedProfit,', delta: ',delta.toFixed(0),', zmiana: ',zmiana.toFixed(0),
 // ', pips: ',pips.toFixed(0),', retSL: ',retSL.toFixed(2),' deltaSL: ',deltaSL.toFixed(2), ', delta5%: ',parseFloat(delta*0.1).toFixed(2),', sl: ',sl);

  if(deltaSL < deltaAbs*0.1 || deltaSL<0) //jesli zmiana sl jest mniejsza niz 5% zysku to nic nie rob
  {
      retSL=sl;
  }
   return retSL;
 }

};
module.exports = matematyka;