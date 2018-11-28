"use strict";


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
            status: "running",
            cpu: 100,
            cores: 1
        },
        {
            name: "Linux3",
            ram: 2048,
            hdd: 20480,
            status: "running",
            cpu: 100,
            cores: 1
        },
    ],
    groups: [
        {
            name: 'Linuxen', 
            members: ['Linux1', 'Linux2', 'Linux3'],
           
            
        },
        {
            name: 'Linuxenssss', 
            members: ['Linusssssx1', 'Linssssux2', 'Linussssx3'],
            
            
        },
    ]
}

function crearLista(elem){
    return "<h3 input type='checkbox'> " + elem + "</h3>";
}

function crearListaMiembros(members){
    
    let html = [];
    //html.push( " <ul class='list-group-item'> " + name_group + "</ul>");
    console.log(members);
    console.log("pablo cara de culo");
  // for(let i = 0; i < members.length; i++){ 
        
    return "<li class='list-group-item'><input type='checkbox'>" + members +  "</li>";
  // }
  
    //return html;
}


$("#replace").click(a => {
    $("#listaMiembros").empty();
    
    for(let i = 0; i < data.groups.length; i++){          
        $("#lista").append(crearLista(data.groups[i].name));
        console.log("darki perfecto");
        console.log(data.groups[i].name);

        for(let j = 0; j < data.groups[i].members.length; j++){    
           // console.log(data.groups[i].members[j]);                  
            $("#listaMiembros").append(crearListaMiembros(data.groups[i].members[j]));
            //console.log(data.groups[1].members);
        } 
       
    }
    console.log("irene ganadora y preciosa");
})





$(".accordionUI")
    .accordion({
        collapsible: true,
        heightStyle: "content",
        header: "> div > h3",
    })
    .sortable({
        axis:"y",
        handle: "h3",
        connectWith: ".accordionUI",
        placeholder: "ui-state-highlight",
        stop: function( event, ui ) {
            // IE doesn't register the blur when sorting
            // so trigger focusout handlers to remove .ui-state-focus
            ui.item.children( "h3" ).triggerHandler( "focusout" );
    
            // Refresh accordion to handle new order
            $( this ).accordion( "refresh" );
        },
        sort: function( event, ui ) {
            $(ui.item).css("color", "red");
        }
    });



