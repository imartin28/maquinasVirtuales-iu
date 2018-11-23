"use strict";


let data = {
    vms: [
        {
            name: "Linux1",
            ram: 2048,
            hdd: 20480,
            cpu: 100,
            cores: 1
        },
        {
            name: "Linux2",
            ram: 2048,
            hdd: 20480,
            cpu: 100,
            cores: 1
        },
        {
            name: "Linux3",
            ram: 2048,
            hdd: 20480,
            cpu: 100,
            cores: 1
        },
    ],
    groups: [
        {
            name: 'Linuxen', 
            members: ['Linux1', 'Linux2', 'Linux3']
        }
    ]
}

function creaLista(elem){
    return "<li class='list-group-item'>" + elem;
}


$("#replace").click(e => {
    $("#lista").empty();
     data.groups.forEach(
         m => $("#lista").append(creaLista(m.name))
     )
   
})



