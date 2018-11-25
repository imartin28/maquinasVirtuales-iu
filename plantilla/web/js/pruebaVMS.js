"use strict"

let data = {
    vms: [
        {
            name: "Linux1",
            ram: 2048,
            hdd: 20480,
            status: "running",
            cpu: 100,
            cores: 1
        },
        {
            name: "Linux2",
            ram: 2048,
            hdd: 20480,
            status: "suspended",
            cpu: 100,
            cores: 1
        },
        {
            name: "Linux3",
            ram: 2048,
            hdd: 20480,
            status: "off",
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


function functionCheck(){

}

//index se supone que es el id que le asignamos dinamicamente a cada fila de la tabla pero todavia no se como hacerlo
function crearLista(name, status, index) {
    if (status == "running") {
        return "<li class= 'list-group-item list-vms'> <input type='checkbox' onclick='functionCheck()' id="+index+"></input>" + name + "<span class='badge badge-success mt-1'> </span> </li>";
    }
    else if (status == "suspended"){
        return "<li class= 'list-group-item list-vms'> <input type='checkbox' onclick='functionCheck()' id="+index+"></input>" + name + "<span class='badge badge-warning mt-1'> </span> </li>";
    }
    else{
        return "<li class= 'list-group-item list-vms'> <input type='checkbox' onclick='functionCheck()' id="+index+"></input>" + name + "<span class='badge badge-danger mt-1'> </span> </li>";
    }

}
$("#replace").click(e => {
    $("#listaVM").empty();
    data.vms.forEach(
        vm => $("#listaVM").append(crearLista(vm.name, vm.status))
    )
})