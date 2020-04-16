var map;
function initMap() {
    let option = {center: { lat: lat0-0.002, lng: lng0 }, zoom: 13.5};
    map = new google.maps.Map(document.getElementById('map'), option);
    }
function addmarker(props) {
    var marker = new google.maps.Marker({
        position: props.coord,
        map: props.map,
    });
    // check the icon
    if (props.iconImage) {
        // set the icon
        marker.setIcon(props.iconImage);
    }
    // check the content
    if (props.content) {
        var infowindow = new google.maps.InfoWindow({
            content: props.content
        });

        marker.addListener("mouseover", function () {
            infowindow.open(map, marker);
        })
        marker.addListener("mouseout", function () {
            infowindow.close(map, marker);
        })
        marker.addListener('click', function(){
            $('#location1').val(props.name);
            singleshow();
            getgraphdata();
            adaptgraph();
        })
    }
}
$.ajax({
        url: "/add_markers",
        type: 'GET',
        dataType: "json",
        success: function (data) {
            props_list = [];
            for(var i=0; i < data.length; i++){
                props_list[i] = {
                    coord:{lat:data[i].loc.lat, lng:data[i].loc.lng},
                    iconImage: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                    content: data[i].info,
                    map:map,
                    name:data[i].name,
                    lastupdate:data[i].lastupdate,
                }
            }
            filldata(props_list[0]);
            for (var i=0; i<props_list.length; i++){
                addmarker(props_list[i]);
            }
        }
    })

function singleshow(){
    var selected_value = $("#location1").val();
    // var selected_value = $("#location option:selected");
    var data = {selected_value:selected_value};
    if(selected_value === "ALL"){
       $.ajax({
        url: "/add_markers",
        data: data,
        type: 'GET',
        dataType: "json",
        success: function (data) {
            props_list = [];
            let option = {center: {lat: data[0].loc.lat, lng: data[0].loc.lng}, zoom: 13.5};
            map3 = new google.maps.Map(document.getElementById('map'), option);
            for(var i=0; i < data.length; i++){
                props_list[i] = {
                    coord:{lat:data[i].loc.lat, lng:data[i].loc.lng},
                    iconImage: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                    content: data[i].info,
                    map:map3,
                    name:data[i].name
                }
            };
            for (var i=0; i<props_list.length; i++){
                addmarker(props_list[i]);
            };
            filldata(props_list[0]);
            // $('#location1').val(selected_value);
        },
        error: function (data) {
            alert(data);
        }
    })
    }
    else {
        $.ajax({
            url: "/singleshow",
            data: data,
            type: 'GET',
            dataType: "json",
            success: function (data) {
                let option = {center: {lat: data.lat0, lng: data.lng0}, zoom: 14};
                map2 = new google.maps.Map(document.getElementById('map'), option);
                props = {
                    coord: {lat: data.lat0, lng: data.lng0},
                    iconImage: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                    content: data.all_info,
                    map: map2,
                    name:data.ava_data.name
                };
                nums = {
                    name: selected_value,
                    bikes:data.ava_data.bikes,
                    stands:data.ava_data.stands,
                    status:data.ava_data.status,
                    lastupdate:data.lastupdate,
                };
                // $('#location1').val(selected_value);
                addmarker(props);
                filldata(nums);
            },
            error: function (data) {
                alert('singleshowerror');
            }
        })
    }
    // adaptgraph();
}

function getweather(){
    var selected_sta = $("#location1").val();
    // var selected_value = $("#location option:selected");
    var val = {selected_sta:selected_sta};
    var D = {};
    $.ajax({
        url: "/getweather",
        data: val,
        type: "GET",
        dataType: "json",
        async : false,
        success:function(data){
            D = {
                temp: data.temp,
                main: data.main,
                wind:data.wind,
            };
        },
        error:function () {
            alert("error");
        }
    });
    return D;
}

function filldata(station){
    var weather = {};
    weather = getweather();
    let name = $("#location1").val();
    if (station.lastupdate){
        document.getElementById('last_update').innerHTML = station.lastupdate;
    }
    if (name == 'ALL') {
        document.getElementById('avaliable_stands').innerHTML = "-";
        document.getElementById('avaliable_bikes').innerHTML = "-";
        document.getElementById('status').innerHTML = "-";
    } else {
        document.getElementById('avaliable_stands').innerHTML = station.stands;
        document.getElementById('avaliable_bikes').innerHTML = station.bikes;
        document.getElementById('status').innerHTML = station.status;
    };
    document.getElementById('weather').innerHTML = weather.main;// + ", " + weather.temp + ", wind:" + weather.wind;
}


function showprediction(){
    var staname = $("#location1").val();
    if (staname == 'ALL'){
        alert('No prediction for all stations together!');
        document.getElementById('pretime').innerHTML = '-';
        document.getElementById('prebikes').innerHTML = '-';
        document.getElementById("prestands").innerHTML = '-';
        document.getElementById("prestatus").innerHTML = '-';
        document.getElementById("preweather").innerHTML = '-';
    }
    else {
        var pt = $("#selecttime").val();
        var T = new Date(pt).getTime();
        var data = {
            staname: staname,
            time: T
        }
        $.ajax({
            url: '/showprediction',
            data: data,
            type: 'GET',
            dataType: 'json',
            success: function (result) {
                document.getElementById('pretime').innerHTML = pt;
                document.getElementById('prebikes').innerHTML = result.avabikes;
                document.getElementById("prestands").innerHTML = result.avastands;
                document.getElementById("prestatus").innerHTML = result.status;
                document.getElementById("preweather").innerHTML = result.weather;
            },
            error: function () {
                alert('prediction data missed')
            }
        })
    }
}