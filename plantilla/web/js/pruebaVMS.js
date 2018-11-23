"use strict"

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

function crearLista(elem) {
    return "<li class= 'list-group-item list-vms'> <input type='checkbox' ></input>" + elem +  "</li>";
}
$("#replace").click(e => {
    $("#listaVM").empty();
    data.vms.forEach(
        vm => $("#listaVM").append(crearLista(vm.name))
    )
})