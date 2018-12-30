"use strict";

/**
* Valid states and actions.
*/
const Action = {
    START: 'start',
    STOP: 'stop',
    SUSPEND: 'suspend',
    RESET: 'reset'
  }
  
  /**
  * A set of VMs, possibly grouped. 
  * Groups may contain other groups, no names (of either VMs or groups)
  * will be duplicated, and VMs and groups may appear in several VMs
  * and groups.
  */
  class GlobalState {
    /**
    * Creates a GlobalState from its component VMs and Groups
    * @param {Params[]} vms initial vms
    * @param {Group[]} groups initial groups
    */
    constructor(vms, groups) {
      this.vms = vms;
      this.groups = groups;
    }
  }
  
  /**
  * A group of VMs.
  */
  class Group {
    /**
    * Creates a Group, which starts empty
    * @param {String} name
    */
    constructor(name) {
      this.name = name;
      this.members = []; // names of vms or groups
     }
  }
  
  /**
  * Parameters for a VM.
  * Used to initialize, describe and modify parameters.
  * You can extend this declaring your own extension class: see
  * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends
  */
  class Params {
    /**
    * Creates a Params object.
    * You can leave any value empty (setting it to undefined)
    * undefined values are useful when setting values for groups or 
    * multiple vms at the same time.
    * @param {String} name
    * @param {Number} ram in kb
    * @param {Number} hdd in kb
    * @param {Number} cpu as percentage of max
    * @param {String} ip, in IPv4 dotted-decimal notation
    * @param {String} iso, the name of an existing iso-file to be used as DVD contents
    * @param {String} action, one of the valid actions.
    */
    constructor(name, ram, hdd, cpu, cores, ip, iso, action) {
      this.name = name;
      this.ram = Params.checkRange(ram, 0, 1024*64, "ram");
      this.hdd = Params.checkRange(hdd, 0, undefined, "hdd");
      this.cpu = Params.checkRange(cpu, 0, 100, "cpu");
      this.cores = Params.checkRange(cpu, 1, undefined, "cores");
      this.ip = Params.checkIp(ip);
      this.iso = iso;
      this.action = action;
      this.status = Action.STOP;
    }
  
    static checkAction(a) {
      const valid = Object.values(Action);
      if (a === undefined) {
        return;
      }
      if (valid.indexOf(a) === -1) {
        throw Error(
          "Invalid action name " + a + 
          ", expected one of " + valid.join(", "));
      }
    }
  
    // min and max form an inclusive range
    static checkRange(num, min, max, errName) {
      if (num === undefined) {
        // some methods will allow blank (=undefined) fields
        return;
      }
      let ok = true &&
        num >= min &&
        (max === undefined || num <= max);
      if ( ! ok) {
        throw Error(
          "Invalid value " + num + " for " + errName +
          ((max !== undefined) ? 
          ", expected integer  between " + min + " and " + max :
          " greater than " + min));
      } else {
        return num;
      }
    }
  
    // ipv4 validation
    static checkIp(ip) {
      // regexp from from https://stackoverflow.com/a/30520584/15472
      const zeroTo255 = '([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])';
      const ipv4 = new RegExp(['^',
      zeroTo255, '\\.', zeroTo255, '\\.', zeroTo255, '\\.', zeroTo255,
      '$'].join(''));
  
      if ( ! ipv4.test(ip)) {
        throw Error(
          "Invalid IPv4 address: " + ip);
      } else {
        return ip;
      }
    }
  }
  
  // uploads json via GET or POST and expects json in return
  function send(url, method, data = {}) {
    let params = {
      method: method, // POST, GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(data)	  
    };  
    if (method === "GET") {
        // GET requests cannot have body; I could URL-encode, but it would not be used here
        delete params.body;
    } 
    console.log("sending", url, params)
    return fetch(url, params)
    .then(response => response.json()) // parses response to JSON
    .catch(error => console.error('Error:', error))
  }
  
  // uploads key-values from data, and file: contentsOfFileField, via POST
  function upload(url, data, fileField) {
    const formData = new FormData();
    formData.append('file', fileField.files[0]);
    for (let [key, value] of data) {
      formData.append(key, value);
    }
    fetch(url + '/file/' + fileField.files[0], {
      method: 'POST',
      body: formData
    })
    .then(response => response.json()) // parses response to JSON
    .catch(error => console.error('Error:', error))
  }
  
  /**
  * retrieves lists of vms and groups
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @throws {Exception} on error or other failure
  */
  function list(conn, options) {
    return send(conn + '/list', "GET");
  }
  
  /**
  * lists valid uploaded files
  * note: to read it, use GET request to same full URL
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @throws {Exception} on error or other failure
  */
  function listfiles(conn, options) {
    return send(conn + '/file', "GET");
  }
  
  /**
  * removes an uploaded file
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @throws {Exception} on error or other failure
  */
  function rmfile(conn, options, name) {
    return send(conn + '/file/' + name, "DELETE");
  }
  
  
  /**
  * adds a machine
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @param {Params} options for chosen VM. All must be set.
  * @throws {Exception} on error or other failure
  */
  function add(conn, options) {
    return send(conn + '/add', "POST", options);
  }
  
  /**
  * imports a machine
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @param {String} name of machine that will be created
  * @param {Element} fileField, a file input element (<input type='file'>)
  * @throws {Exception} on error or other failure
  */
  function vtimport(conn, name, fileField) {
    return response = upload(conn + '/import', {name: name}, fileField);
  }
  
  /**
  * exports a machine to a file. The file's URL is reported in the
  * response, and must be retrieved separately. Clients can have at most
  * 1 export file.
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @param {String} name of machine that will be created
  * @throws {Exception} on error or other failure
  */
  function vtexport(conn, name) {
    return response = send(conn + '/export', {name: name});
  }
  
  /**
  * changes options for one or more machines
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @param {Params} options for chosen VM. Use 'undefined' to ignore some
  * @param {String[]} names of VMs to modify
  * @throws {Exception} on error or other failure
  */
  function set(conn, options, names) {
    options.names = names;
    return send(conn + '/set', "POST", options);
  }
  
  /**
  * removes one or more vms or vm groups
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @param {String[]} names of VMs to remove
  * @throws {Exception} on error or other failure
  */
  function rm(conn, names) {
    return send(conn + '/rm', "POST", {name: 'toRemove', elements: names});
  }
  
  /**
  * links  properties of one or more vms or vm groups
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @param {String[]} sources, with names of VMs or groups to add to target group
  * @param {String} targetGroup to add them into
  * @throws {Exception} on error or other failure
  */
  function link(conn, vms, groupName) {
    return send(conn + '/link', "POST", {name: groupName, elements: vms});
  }
  
  /**
  * links  properties of one or more vms or vm groups
  * @param {String} conn url (with apikey as last path element) of endpoint
  * @param {String[]} sources, with names of VMs or groups to add to target group
  * @param {String} targetGroup to add them into
  * @throws {Exception} on error or other failure
  */
  function unlink(conn, vms, groupName) {
    return send(conn + '/unlink', "POST", {name: groupName, elements: vms});
  }
  
  // lists symbols that will be available outside this module
 /* export {
    Action,      // actions / states
    Params,      // VM parameters; used to display / alter parameters
    Group,       // a VM group
    GlobalState, // global state, includes state of all vms & all groups
  
    // All these use POST and return a GlobalState, or Exception on error
    add,
    rm,
    set,
    list,
    vtimport,    // import was ES6 reserved word
    vtexport,    // export was ES6 reserved word
    link, 
    unlink,
    upload,
    rmfile,
    listfiles
  };*/


//-------------------------------------------------------------------------------------------------------

/**
 * Actualiza la interfaz con el resultado de un envio
 * @param {Object} result recibido del servidor, construido a partir de JSON
 * @param {Function} successFn a llamar si no ha habido error
 * @param {Function} errorFn a llamar si el resultado describe un error
 */
function handleResult(result, successFn, errorFn) {
	console.log("result: ", result)
	if (result.error) {
		// error, .message nos indicará el problema
		errorFn(result.message);
  } else {
    successFn(result);
  }  
}

/**
 * Genera un entero aleatorio entre min y max, ambos inclusive
 * @param {Number} min 
 * @param {Number} max 
 */
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Envía todo un estado al servidor, como una secuencia de 'add' y 'link'
 * @param {Object} state 
 * @param {String} url 
 */
function sendJson(state, url) {
  function sequence(tasks, fn) {
    return tasks.reduce((promise, task) => promise.then(() => fn(task)), Promise.resolve());
  }
  sequence(state.vms, 
    // crea todas las VMs
    vm => Vt.add(url, vm).then(r => update(r))).then(
      () => sequence(state.groups, 
        // esto asume que no aparecen members antes de haberlos creado
        gr => Vt.link(url, gr.members, gr.name).then(r => update(r))));
}


$(function(){
    console.log("online!");
    
    $(document).ready(function(){
        $(document).tooltip({
            tooltipClass: "tooltip-styling"
        });
    });

  // activamos tooltips
  $('[data-toggle="tooltip"]').tooltip()
  
  // cambia esto a http://localhost:8000 si decides lanzar tú el servidor (vía mvn spring-boot:run)
  const apiServer = 'http://localhost:8080/';
 
  // aqui guardaremos siempre el estado de la aplicacion, por ejemplo para verificar si 
  // los nombres de vms existen o no; ver update()
  let state = { vms: [], groups: [] };

  // genera un apiKey aleartorio nada más empezar
  $('#apikey_input').val(randomInRange(1000000, 200000));
  let url = apiServer + "404250";
  
  // genera otro apikey aleatorio cuando se pulsa ese botón
  $("#apikey_button").click(e => {
    url = apiServer + $('#apikey_input').val();
    // actualiza la visualizacion
    Vt.list(url).then(r => update(r))    
    return false; // <-- evita que se recargue la pagina, tratandose de un formulario
  })

  /**
   * Usado para mostrar resultados de las operaciones. En tu código, deberá actualizar
   * toda la interfaz.
   * @param {Object} result 
   */
  function updateVm(result, ulId) {
    
  handleResult(result, 
    r => {
      state = r; 
      console.log("New state: ", state); 
      try {
        $(ulId).empty();
        for(let i = 0; i < state.vms.length; i++) {
        $(ulId).append(crearListaVm(state.vms[i].name, state.vms[i].status,i));
        }
      } catch (e) {
        console.log(e);
      }
    },
    m => console.log("BUAAAAA - ", m))
}

function updateGroupModal(result, ulId) {
    console.log("RESULT:"+ ulId);
  handleResult(result, 
    r => {
      state = r; 
      console.log("New state: ", state); 
      try {
        $(ulId).empty();
        for(let i = 0; i < state.groups.length; i++) {
        $(ulId).append(crearListaGroups(state.groups[i].name, i));
        }
      } catch (e) {
        console.log(e);
      }
    },
    m => console.log("BUAAAAA - ", m))
}
function updateVmModal(result, ulId) {
    
  handleResult(result, 
    r => {
      state = r; 
      console.log("New state: ", state); 
      try {
        $(ulId).empty();
        for(let i = 0; i < state.vms.length; i++) {
          $(ulId).append(crearListaVm(state.vms[i].name, state.vms[i].status,i));
          }
        for(let i = 0; i < state.groups.length; i++) {
           
          $(ulId).append(crearListaGroups(state.groups[i].name, i));
          }
      } catch (e) {
        console.log(e);
      }
    },
    m => console.log("BUAAAAA - ", m))
}

function crearListaVm(name, status, index) {
   
    if (status == "running") {
        return "<li class= 'list-group-item list-vms draggableVm ui-draggable ui-draggable-handle' name="+name+" index="+index+"> <input type='checkbox' name='chk'></input>" + name + "<span class='badge badge-success mt-1'> </span> </li>";
    } 
    else if (status == "suspended"){
        return "<li class= 'list-group-item list-vms draggableVm ui-draggable ui-draggable-handle' name="+name+" index="+index+"> <input type='checkbox' name='chk'></input>" + name + "<span class='badge badge-warning mt-1'> </span> </li>";
    }
    else{
        return "<li class='list-group-item list-vms draggableVm ui-draggable ui-draggable-handle' name="+name+" index="+index+"> <input type='checkbox' id='chk' name='chk'></input>" + name + "<span class='badge badge-danger mt-1'> </span> </li>";
    }

}

function crearListaGroups(name, index) {
    return "<li class= 'list-group-item list-vms draggableVm ui-draggable ui-draggable-handle' name="+name+" index="+index+"> <input type='checkbox' name='chk'></input>" + name + "</li>";
   

}

  function update(result, ulId) {
      
    handleResult(result, 
      r => {
        state = r; 
        console.log("New state: ", state); 
        try {
          $("#grupos").empty();
          state.groups.forEach(group =>  $("#grupos").append(createGroupItem(group)));
          $(ulId).empty();
          for(let i = 0; i < state.groups.length; i++) {
          $(ulId).append(crearLista(state.vms[i].name, state.vms[i].status,i));
          }
        } catch (e) {
          console.log(e);
        }
      },
     m => console.log("BUAAAAA - ", m))
  }
/** 
 * for(let i = 0; i < data.groups.length; i++){          
       // $("#lista").append(crearLista(data.groups[i].name));
       $("#acordeonC").append(crearLista(data.groups[i].name, i));
       let cont = i + 1; 
       $("#acordeonC").append("<div class='ui-accordion-content ui-corner-bottom ui-helper-reset ui-widget-content ui-accordion-content-active' id='ui-id-"+cont+"' aria-labelledby='lista' role='tabpanel' aria-hidden='false' style='display: block;'>");
             
       $("#ui-id-"+cont).append("<ul id=ul"+i+">");
        console.log("darki perfecto");
        console.log(data.groups[i].name);

        for(let j = 0; j < data.groups[i].members.length; j++){    
           // console.log(data.groups[i].members[j]);                  
            $("#ul"+i).append(crearListaMiembros(data.groups[i].members[j]));
            //console.log(data.groups[1].members);
        } 
        $("#ui-id-"+cont).append("</ul>");
        $("#acordeonC").append("</div>");
    }
*/
  function updateGroup(result) {
    
  handleResult(result, 
    r => {
      state = r; 
      console.log("New state: ", state); 
      try {
        $("#listaMiembros").empty();
        for(let i = 0; i < state.groups.length; i++){          
            // $("#lista").append(crearLista(data.groups[i].name));
            
            $("#acordeonC").append(crearLista(state.groups[i].name, i));
            let cont = i + 1; 
            $("#acordeonC").append("<div class='ui-accordion-content ui-corner-bottom ui-helper-reset ui-widget-content ui-accordion-content-active' id='ui-id-"+cont+"' aria-labelledby='lista' role='tabpanel' aria-hidden='false' style='display: block;'>");
                  
            $("#ui-id-"+cont).append("<ul id=ul"+i+">");
            if(state.groups[i].elements.length > 0) {
	             for(let j = 0; j < state.groups[i].elements.length; j++){                     
	                $("#ul"+i).append(crearListaMiembros(state.groups[i].elements[j]));
	                 //console.log(data.groups[1].members);
	             } 
            }
             $("#ui-id-"+cont).append("</ul>");
             $("#acordeonC").append("</div>");
         }
        $(".draggableGroup").draggable({
            tolerance: "touch"
        }).disableSelection();
        
      } catch (e) {
        console.log(e);
      }
    })
    //m => console.log("BUAAAAA - ", m))
}

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


function init(){
    
   // updateGroup();
    list(url).then(r => updateGroup(r));
    list(url).then(r => updateVm(r, "#listaVMModal"));
    list(url).then(r => updateGroupModal(r, "#addNewGroup"));
    list(url).then(r => updateGroupModal(r, "#groupsTolink"));
    list(url).then(r => updateVmModal(r, "#listaGruposM"));
    $("#botonBuscar").click(onClickSearchButton);
    $("#botonBuscarGroup").click(onClickSearchButtonGroup);
    $("#botonBuscarGroupVm").click(onClickSearchButtonGroupVm);
    $("#botonBuscarVm").click(onClickSearchButtonVm);
    $("#linkVm").click(onClickLinkVm);
      
    handleDrop();
    

}

init();

function crearLista(elem, i){
    
   return  "<h3 id='lista"+i+"' class='badge draggableGroup badge-danger ui-accordion-header ui-corner-top ui-state-default ui-accordion-header-active ui-state-active ui-accordion-icons ui-sortable-handle' role='tab' aria-selected='true' aria-expanded='true' tabindex='0'><span class='ui-accordion-header-icon ui-icon ui-icon-triangle-1-s'></span>"+elem+ "</h3>"
    
}

function crearListaMiembros(members){
    
    let html = [];
    //html.push( " <ul class='list-group-item'> " + name_group + "</ul>");
  // for(let i = 0; i < members.length; i++){ 
        
    return "<li class='list-group-item'><input type='checkbox'>" + members +  "</li>";
  // }
  
    //return html;
}

function loadGroup(){
    $("#listaMiembros").empty();
    
    for(let i = 0; i < data.groups.length; i++){          
       // $("#lista").append(crearLista(data.groups[i].name));
       $("#acordeonC").append(crearLista(data.groups[i].name, i));
       let cont = i + 1; 
       $("#acordeonC").append("<div class='ui-accordion-content ui-corner-bottom ui-helper-reset ui-widget-content ui-accordion-content-active' id='ui-id-"+cont+"' aria-labelledby='lista' role='tabpanel' aria-hidden='false' style='display: block;'>");
             
       $("#ui-id-"+cont).append("<ul id=ul"+i+">");
        

        //for(let j = 0; j < data.groups[i].members.length; j++){    
           // console.log(data.groups[i].members[j]);                  
            //$("#ul"+i).append(crearListaMiembros(data.groups[i].members[j]));
            //console.log(data.groups[1].members);
      //  } 
        $("#ui-id-"+cont).append("</ul>");
        $("#acordeonC").append("</div>");
    }

};

$("#botonAddGroup").click(e => {  
	
	const name = $("#nombreGrupoM").val();
	$("#acordeonC").empty();
	link(url, [], name).then(r => updateGroup(r)).then(r => updateVmModal(r, "#listaGruposM")).then(r => updateGroupModal(r, "#groupsTolink"));
   
	
	
});

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
function onClickSearchButton() {
    
    let listaChecks = $("#acordeonC > h3");
    
    if($("#buscador").val() === "" || $("#buscador").val() === null) {
        for(let elem of listaChecks) {
            $(elem).removeClass("d-none");
        }
    }
    else {
        for(let i = 0; i < listaChecks.length; i++) {
        	
            if($(listaChecks[i]).text() !== $("#buscador").val()){
                $(listaChecks[i]).addClass("d-none");
            }
        }
    }
}

function onClickSearchButtonVm() {
    
    let listaChecks = $("#listaVMModal > li");
    
    if($("#buscadorVm").val() === "" || $("#buscadorVm").val() === null) {
        for(let elem of listaChecks) {
            $(elem).removeClass("d-none");
        }
    }
    else {
        for(let i = 0; i < listaChecks.length; i++) {
            if($(listaChecks[i]).attr("name") !== $("#buscadorVm").val()){
                $(listaChecks[i]).addClass("d-none");
            }
        }
    }
}

function onClickSearchButtonGroup() {
    
    let listaChecks = $("#addNewGroup > li");
    
    if($("#buscadorGroup").val() === "" || $("#buscadorGroup").val() === null) {
        for(let elem of listaChecks) {
            $(elem).removeClass("d-none");
        }
    }
    else {
        for(let i = 0; i < listaChecks.length; i++) {
            if($(listaChecks[i]).attr("name") !== $("#buscadorGroup").val()){
                $(listaChecks[i]).addClass("d-none");
            }
        }
    }
}
function onClickSearchButtonGroupVm() {
    
    let listaChecks = $("#listaGruposM > li");
    
    if($("#buscadorGroupVm").val() === "" || $("#buscadorGroupVm").val() === null) {
        for(let elem of listaChecks) {
            $(elem).removeClass("d-none");
        }
    }
    else {
        for(let i = 0; i < listaChecks.length; i++) {
            if($(listaChecks[i]).attr("name") !== $("#buscadorGroupVm").val()){
                $(listaChecks[i]).addClass("d-none");
            }
        }
    }
}
function onClickLinkVm() {
    
    let listaChecks = $("#listaVMModal > li > input");
    let grupo = $("#groupsTolink > li > input");
    let arrayVm = [];
    let nombreGrupo = "";
    for(let elem of listaChecks) {
        if($(elem).get()[0].checked) {
        	let nameVm = $(elem).parent().attr("name");
        	arrayVm.push(nameVm);
        	
        }
    }
    for(let elem of grupo) {
        if($(elem).get()[0].checked) {
        	let nombreGrupo = $(elem).parent().attr("name");
        	link(url, arrayVm, nombreGrupo);
        	
        }
    }
    
    list(url).then(r => updateGroup(r));
}
function handleDrop() {
    
    $(".droppable").droppable({
        drop: function(event, ui) {
            let index = $(ui.draggable).attr('index');
            data.vms.splice(index, 1);
            $(ui.draggable).remove();
        }
    });
}

});