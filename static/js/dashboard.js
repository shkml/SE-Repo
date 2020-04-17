function getgraphdata() {
    var staname = $('#location1').val();
    if (staname == 'ALL') {adaptgraph(); return;}
    else {
        // adaptgraph();
        var postdata = {selected_sta: staname};
        $.ajax({
            url: "/graphdata",
            data: postdata,
            type: "GET",
            dataType: "json",
            // async: false,
            success: function (data) {
              initData(data,"figure1");
              // initData(data,"figure2");
              linechart(data);
                // linechart(data);
            },
            error: function () {
                alert(" grpah error");
            }
        })
    }
}

function initData(gd,id) {
  var legendData = ['available bikes', 'available stands'];
  var bgColorList = ['#FBB730', '#31BDF2'];
  var axisLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var seriesValue = [];

  for (var i = 0; i < legendData.length; i++) {
    var arrData = [];
    var seriesDataVal = null;
    for (var j = 0; j < axisLabel.length; j++) {
      for (var k in gd) {
        if (k == axisLabel[j]) {
          if (i == 0) {arrData.push(gd[k].ab)}
          else {arrData.push(gd[k].abs)}
        }
      }
    }
      seriesDataVal = {
        barWidth: 10,//bar width
        name: legendData[i],
        type: 'bar',
        itemStyle: {
          normal: {
            show: true,//show data when hover
            barBorderRadius: [10, 10, 10, 10],//the looks of bar
            color: bgColorList[i]
          }
        },
        label: {
          normal: {
            show: true, //showdata
            position: 'top'//show data at the top.  'top/right/left/insideLeft/insideRight/insideTop/insideBottom'
          }
        },
        data: arrData
      };
      seriesValue.push(seriesDataVal);
    }
    buildChart(legendData, axisLabel, seriesValue, id);
  }


  //generate Echarts graph
function buildChart(legendData, axisLabel, seriesValue, id) {
    var chart = document.getElementById(id);
    var echart = echarts.init(chart);
    var option = {
      title: {
        text: $('#location1').val(),//title
        x: "center", //horizontal position of the title
        y: "0", //
        textStyle: {
          fontSize: 15,
          fontWeight: 'normal',
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'//shade, can also be 'line'
        }
      },
      // toolbox: {
      //   show: true,
      //   feature: {
      //     saveAsImage: {show: true}
      //   }
      // },
      legend: {
        data: legendData,
        y: 'bottom'//

      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: [{
        min: 0,
        type: 'category',
        data: axisLabel
      }],
      yAxis: [{
        min: 0,
        type: 'value',
        splitArea: {show: false}
      }],
      label: {
        normal: {
          show: true,
          position: 'top'
        }
      },
      series: seriesValue
    };
    echart.setOption(option);
}

function linechart(gd) {
  var week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  var day = $("#selecttime").val();
  var D = (new Date(day)).getDay();
  var Day = week[D-1];
  var nextDay = week[D];
  var pday = {};
  var pnday = {};
  for( var i in gd){
    if(Day == i){pday = gd[i]}
    if(nextDay == i){pnday = gd[i]}
  }
  var xdata = [];
  for (let i =0; i<24; i++){xdata.push(i.toString())};
  var LC = echarts.init(document.getElementById("figure2"));
  var lineoption = {
    title: {
      text: 'Avaliable Bikes/Stands - Time ('+Day+')',
      x: "left", //horizontal position of the title
      y: "0", //
      textStyle: {
        fontSize: 15,
        fontWeight: 'normal',
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      x: 'right',  //控制图例显示方向
      y: '10',
      data: ['Avaliable Bikes', 'Avaliable Stands'], //定义都有哪些图例显示
      selected: {
        'Avaliable Bikes': true,
        'Avaliable Stands': true,
      }    //设置为false的代表初始化的时候隐藏，只有点击的时候折线才出来显示

    },
    //右上角工具条
    toolbox: {
            show : true,
            feature : {
                // mark : {show: true},
                // dataView : {show: true, readOnly: false},
                // magicType : {show: true, type: ['line', 'bar']},
                // restore : {show: true},
                // saveAsImage : {show: true}
            }
        },
    calculable: false,
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: function () {
            let l = [];
            for (i in xdata){
              l.push(i+":00")
            }
            return l;
        }(),
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: 'Avaliable Bikes',
        type: 'line',
        data: function () {
            let l = [];
            for (i in xdata){
              l.push(pday.ab_time_usage[i]);
            }
            return l;
        }(),
        markPoint: {
          data: [
            {type: 'max', name: '最大值'},
            {type: 'min', name: '最小值'}
          ]
        }
      },
      {
        name: 'Avaliable Stands',
        type: 'line',
        data: function () {
            let l = [];
            for (i in xdata){
              l.push(pday.abs_time_usage[i]);
            }
            return l;
        }(),
        markPoint: {
          data: [
            {type: 'max', name: '最大值'},
            {type: 'min', name: '最小值'}
          ]
        }
      },
    ]
  };
  LC.setOption(lineoption);
}