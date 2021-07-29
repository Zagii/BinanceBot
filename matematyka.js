var matematyka={
/** tab tablica, start,end zakres rozpatrywanych pol */
maxKurs: function(tab,pole, start, end) {
    let s = 0,
      e = tab.length - 1;
    if (start) s = start;
    if (end) e = end;
    let t = tab.slice(s, e);
    return Math.max.apply(Math, t.map(o => +o[pole]));
  },
  /** tab tablica, start,end zakres rozpatrywanych pol */
  minKurs: function(tab, pole,  start, end) {
    let s = 0,
      e = tab.length - 1;
    if (start) s = start;
    if (end) e = end;
    let t = tab.slice(s, e);
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
 }

};
module.exports = matematyka;