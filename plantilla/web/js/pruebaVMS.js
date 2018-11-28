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




function comprobar(index, element) {

}


function crearLista(name, status) {
    if (status == "running") {
        return "<li class= 'list-group-item list-vms' checked name="+name+"> <input type='checkbox' checked name='chk'></input>" + name + "<span class='badge badge-success mt-1'> </span> </li>";
    }
    else if (status == "suspended"){
        return "<li class= 'list-group-item list-vms' name="+name+"> <input type='checkbox' name='chk'></input>" + name + "<span class='badge badge-warning mt-1'> </span> </li>";
    }
    else{
        return "<li class= 'list-group-item list-vms' name="+name+"> <input type='checkbox' name='chk'></input>" + name + "<span class='badge badge-danger mt-1'> </span> </li>";
    }

}
$("#replace").click(e => {
    $("#listaVM").empty();
    data.vms.forEach(
        vm => $("#listaVM").append(crearLista(vm.name, vm.status))
    )
})

$("#play").click(e => {
    let listaChecks = $("#listaVM > li > input");

    for(let elem of listaChecks) {
        if($(elem).get()[0].checked) {
            let state = $(elem).parent().find(".badge");
            state.removeClass("badge-warning");
            state.removeClass("badge-danger");
            state.addClass("badge-success");
        }
    }
})

$("#restart").click(e => {
    let listaChecks = $("#listaVM > li > input");

    for(let elem of listaChecks) {
        if($(elem).get()[0].checked) {
            let state = $(elem).parent().find(".badge");
            state.removeClass("badge-warning");
            state.removeClass("badge-danger");
            state.addClass("badge-danger");
            setTimeout(function() { 
                state.removeClass("badge-danger");
                state.addClass("badge-success");
            }, 2000);
            
        }
    }
})

$("#suspend").click(e => {
    let listaChecks = $("#listaVM > li > input");

    for(let elem of listaChecks) {
        if($(elem).get()[0].checked) {
            let state = $(elem).parent().find(".badge");
            state.removeClass("badge-success");
            state.removeClass("badge-danger");
            state.addClass("badge-warning");
        }
    }
})

$("#stop").click(e => {
    let listaChecks = $("#listaVM > li > input");
    
    for(let elem of listaChecks) {
        if($(elem).get()[0].checked) {
            let state = $(elem).parent().find(".badge");
            state.removeClass("badge-success");
            state.removeClass("badge-danger");
            state.addClass("badge-danger");
        }
    }
})

let range = document.getElementById('formControlRange');
let field = document.getElementById('inputRAM');

range.addEventListener('input', function (e) {
    field.value = e.target.value;
  });
  field.addEventListener('input', function (e) {
    range.value = e.target.value;
  });

$("#formControlRange").attr("max", navigator.deviceMemory*1024);

let localStorageSpace = function(){
    var allStrings = '';
    for(var key in window.localStorage){
        if(window.localStorage.hasOwnProperty(key)){
            allStrings += window.localStorage[key];
        }
    }
    return allStrings ? 3 + ((allStrings.length*16)/(8*1024*1024*1024)) + ' GB' : 'Empty (0 GB)';
};




let range2 = document.getElementById('storageRange');
let field2 = document.getElementById('inputHDD');

range2.addEventListener('input', function (e) {
    field2.value = e.target.value;
  });
  field2.addEventListener('input', function (e) {
    range2.value = e.target.value;
  });
$("#storageRange").attr("max", localStorageSpace);