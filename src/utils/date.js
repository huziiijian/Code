
export function formatDate(date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
};

function padLeftZero(str) {
  return ('00' + str).substr(str.length);
}

//专门用于几分钟、几小时的时间格式化
export function formatDate2(thisTime){
  var now =new Date().getTime(),
    diffValue = now - thisTime,
    result='',
    minute = 1000 * 60,
    hour = minute * 60,
    day = hour * 24,
    halfamonth = day * 15,
    month = day * 30,
    year = month * 12,

    _year = diffValue/year,
    _month =diffValue/month,
    _week =diffValue/(7*day),
    _day =diffValue/day,
    _hour =diffValue/hour,
    _min =diffValue/minute;

  if(_year>=1) result=parseInt(_year) + "年前";
  else if(_month>=1) result=parseInt(_month) + "个月前";
  else if(_week>=1) result=parseInt(_week) + "周前";
  else if(_day>=1) result=parseInt(_day) +"天前";
  else if(_hour>=1) result=parseInt(_hour) +"个小时前";
  else if(_min>=1) result=parseInt(_min) +"分钟前";
  else result="刚刚";
  return result;
}
