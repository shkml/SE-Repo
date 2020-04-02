var map;
function initMap() {
    let option = {center: { lat: lat0, lng: lng0 }, zoom: 13.5};
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
        marker.addListener('click', function () {
            $('#location').val(props.name);
            singleshow();
        })
    }
}
$.ajax({
        url: "http://127.0.0.1:5000/add_markers",
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
                    name:data[i].name
                }
            }
            for (var i=0; i<props_list.length; i++){
                addmarker(props_list[i]);
            }
        }
    })

function singleshow(){
    var selected_value = $("#location").val();
    // var selected_value = $("#location option:selected");
    var data = {selected_value:JSON.stringify(selected_value)};
    if(selected_value === "ALL"){
       $.ajax({
        url: "http://127.0.0.1:5000/add_markers",
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
            }
            for (var i=0; i<props_list.length; i++){
                addmarker(props_list[i]);
            }
        }
    })
    }
    else {
        $.ajax({
            url: "http://127.0.0.1:5000/singleshow",
            data: data,
            type: 'POST',
            dataType: "json",
            success: function (data) {
                let option = {center: {lat: data.lat0, lng: data.lng0}, zoom: 14};
                map2 = new google.maps.Map(document.getElementById('map'), option);
                props = {
                    coord: {lat: data.lat0, lng: data.lng0},
                    iconImage: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                    content: data.all_info,
                    map: map2,
                    name: selected_value,
                };
                addmarker(props);
            }
        })
    }
    // $("#location option[value='"+selected_value+"']").attr("selected", true);
}
