const moment = require('moment');
var updateDates = function(start_date, end_date) {
      var date = start_date
      var dateArr = [];

      do {
            var datex = moment(date).format('DD-MM-YYYY');
            date = moment(date).add(1, 'days');
            dateArr.push(datex)
            console.log(datex);
      } while(moment(date).format('DD-MM-YYYY') != moment(end_date).add(1, 'days').format('DD-MM-YYYY'))

}

var d1 = new Date("23-08-2018")
var d2 = new Date("23-10-2018")

updateDates(d1.toISOString(), d2.toISOString())