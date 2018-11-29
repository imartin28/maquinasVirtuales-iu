"use strict"


$(function(){

    let data = {
        vms: [
            {
                name: "Linux1",
                ram: 2048,
                hdd: 20480,
                status: "running",
                cpu: 100,
                cores: 1,
                ip:"192.168.1.1",
                iso: "/User/isoFiles/Linux1.iso"
            },
            {
                name: "Linux2",
                ram: 2048,
                hdd: 5,
                status: "suspended",
                cpu: 100,
                cores: 1,
                ip:"192.168.1.2",
                iso: "/User/isoFiles/Linux2.iso"
            },
            {
                name: "Linux3",
                ram: 2048,
                hdd: 20480,
                status: "off",
                cpu: 100,
                cores: 1,
                ip:"192.168.1.3",
                iso: "/User/isoFiles/Linux3.iso"
            },
        ],
        groups: [
            {
                name: 'Linuxen', 
                members: ['Linux1', 'Linux2', 'Linux3']
            }
        ]
    }

    init();

    function init() {
        loadVmData();

        //handle buttons
        $("#play").click(onClickPlayButton);
        $("#restart").click(onClickRestartButton);
        $("#suspend").click(onClickSuspendButton);
        $("#stop").click(onClickStopButton);
        //$("#buscador").blur(onClickSearchButton);
        $("#botonBuscar").click(onClickSearchButton);

        //handle ranges
        
        handleRangeChange('#formControlRange', '#inputRAM', navigator.deviceMemory*1024, 20);
        handleRangeChange('#storageRange', '#inputHDD', 500, 80);
        handleRangeChange('#rangeCPU', '#inputCPUNumber', 100, 40);
        handleRangeChange('#rangeCores', '#inputCoresNumber', navigator.hardwareConcurrency, 1);

        $(".list-vms").change(function(){
            let index = $(this).attr("index");
            let vm = data.vms[index];

            if($("#listaVM > li > .checked").length === 0){
                $("#panelDerechoBotones").addClass('d-none');
            }
            else {
                $("#panelDerechoBotones").removeClass('d-none');
            }

            if($(this).find("input").get()[0].checked) {
                $(this).find("input").addClass("checked");
                $("#nameVM").val(vm.name);
                $("#inputRAM").val(vm.ram);
                $("#inputHDD").val(vm.hdd);
                $("#inputCPUNumber").val(vm.cpu);
                $("#inputCoresNumber").val(vm.cores);
                $("#inputIP").val(vm.ip);
                //$("#isoVM").val(vm.iso);
            }
            else{
                $(this).find("input").removeClass("checked");
                $("#nameVM").val($("#nameVM").attr("default"));
                $("#inputRAM").val($("#inputRAM").attr("default"));
                $("#inputHDD").val($("#inputHDD").attr("default"));
                $("#inputCPUNumber").val($("#inputCPUNumber").attr("default"));
                $("#inputCoresNumber").val($("#inputCoresNumber").attr("default"));
                $("#inputIP").val($("#inputIP").attr("default"));
            }
        });

    }

    function loadVmData() {
        $("#listaVM").empty();
        for(let i = 0; i < data.vms.length; i++) {
            let vm = data.vms[i];
            $("#listaVM").append(crearLista(vm.name, vm.status, i));
        }
    };

    function crearLista(name, status, index) {
        if (status == "running") {
            return "<li class= 'list-group-item list-vms' name="+name+" index="+index+"> <input type='checkbox' name='chk'></input>" + name + "<span class='badge badge-success mt-1'> </span> </li>";
        }
        else if (status == "suspended"){
            return "<li class= 'list-group-item list-vms' name="+name+" index="+index+"> <input type='checkbox' name='chk'></input>" + name + "<span class='badge badge-warning mt-1'> </span> </li>";
        }
        else{
            return "<li class= 'list-group-item list-vms' name="+name+" index="+index+"> <input type='checkbox' name='chk'></input>" + name + "<span class='badge badge-danger mt-1'> </span> </li>";
        }
    
    }


    function onClickPlayButton() {
        let listaChecks = $("#listaVM > li > input");
    
        for(let elem of listaChecks) {
            if($(elem).get()[0].checked) {
                let state = $(elem).parent().find(".badge");
                state.removeClass("badge-warning");
                state.removeClass("badge-danger");
                state.addClass("badge-success");
            }
        }
    }
    
    function onClickRestartButton() {
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
    }
    
    function onClickSuspendButton() {
        let listaChecks = $("#listaVM > li > input");
    
        for(let elem of listaChecks) {
            if($(elem).get()[0].checked) {
                let state = $(elem).parent().find(".badge");
                state.removeClass("badge-success");
                state.removeClass("badge-danger");
                state.addClass("badge-warning");
            }
        }
    }
    
    function onClickStopButton() {
        let listaChecks = $("#listaVM > li > input");
        
        for(let elem of listaChecks) {
            if($(elem).get()[0].checked) {
                let state = $(elem).parent().find(".badge");
                state.removeClass("badge-success");
                state.removeClass("badge-danger");
                state.addClass("badge-danger");
            }
        }
    }

    function onClickSearchButton() {
        
        let listaChecks = $("#listaVM > li");
        
        if($("#buscador").val() === "" || $("#buscador").val() === null) {
            for(let elem of listaChecks) {
                $(elem).removeClass("d-none");
            }
        }
        else {
            for(let i = 0; i < listaChecks.length; i++) {
                if($(listaChecks[i]).attr("name") !== $("#buscador").val()){
                    $(listaChecks[i]).addClass("d-none");
                }
            }
        }
    }

    function handleRangeChange(rangeId, inputNumberId, max, defaultValue) {
        $(rangeId).on('input', function (e) {
            $(inputNumberId).val(e.target.value);
        });

        $(inputNumberId).on('input', function (e) {
            $(rangeId).val(e.target.value);
        });

        let min = 0;
        $(rangeId).val(defaultValue);
        $(inputNumberId).val(defaultValue);
        $(rangeId).attr("default", defaultValue);
        $(inputNumberId).attr("default", defaultValue);
        $(rangeId).attr("min", min);
        $(inputNumberId).attr("min", min);
        $(rangeId).attr("max", max);
        $(inputNumberId).attr("max", max);
    }
       
    
});





