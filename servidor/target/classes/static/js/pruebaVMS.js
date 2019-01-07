//import * as Vt from './vtapi.js'
"use strict"
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
  function update(result, ids) {
      
    handleResult(result, 
      r => {
        state = r; 
        console.log("New state: ", state); 
        try {
          for (const id of ids) {
        	  
	          $(id).empty();
	          for(let i = 0; i < state.vms.length; i++) {
	        	  
	        	  let o = $(crearLista(state.vms[i].name, state.vms[i].status,i));
	        	  $(id).append(o);
	          }
          }
    	  $(".draggableVm").draggable({
              tolerance: "touch"
          }).disableSelection();
    	  
    	  $("#listaVM > li > input").on("change", function(){
              let index = $( "input:checked" ).attr("index");
             //console.log($("#listaVM > li").length);
             
              let vm = state.vms[index];
              //console.log($( "input:checked" ).val())
    		  //console.log($( "input:checked" ).attr("index"))
              if( $(this).is(':checked') ) {
            	  /*$( "#listaVM > li" ).each(function() {
            		  
            		  if( !$(this).find("input").is(':checked')){
            			  $(this).find("input").attr('disabled', true);
            		  }
            		});*/
            	 
                  $("#nameVM").val(vm.name);
                  $("#nameVM").prop('disabled', true);
                  $("#inputRAM").val(vm.ram);
                  $("#inputRAM").prop('disabled', true);
                  $("#formControlRange").val(vm.ram);
                  $("#formControlRange").prop('disabled', true);
                  $("#inputHDD").val(vm.hdd);
                  $("#inputHDD").prop('disabled', true);
                  $("#storageRange").val(vm.hdd);
                  $("#storageRange").prop('disabled', true);
                  $("#inputCPUNumber").val(vm.cpu);
                  $("#inputCPUNumber").prop('disabled', true);
                  $("#rangeCPU").val(vm.cpu);
                  $("#rangeCPU").prop('disabled', true);
                  $("#inputCoresNumber").val(vm.cores);
                  $("#inputCoresNumber").prop('disabled', true);
                  $("#rangeCores").val(vm.cores);
                  $("#rangeCores").prop('disabled', true);
                  $("#inputIP").val(vm.ip);
                  $("#inputIP").prop('disabled', true);
                  $("#isoVM").prop('disabled', true);
                  $("#panelDerechoBotones").addClass('d-none');
                  
              }
              else{
            	  	/*$( "#listaVM > li" ).each(function() {
            		  
            		 
            			  $(this).find("input").attr('disabled', false);
            		  
            		});*/
                 // $("#listaVM").find("input").removeClass("checked");
                  $("#nameVM").val($("#nameVM").attr("default"));
                  $("#nameVM").prop('disabled', false);
                  $("#inputRAM").val($("#inputRAM").attr("default"));
                  $("#inputRAM").prop('disabled', false);
                  $("#formControlRange").val($("#formControlRange").attr("default"));
                  $("#formControlRange").prop('disabled', false);
                  $("#inputHDD").val($("#inputHDD").attr("default"));
                  $("#inputHDD").prop('disabled', false);
                  $("#storageRange").val($("#storageRange").attr("default"));
                  $("#storageRange").prop('disabled', false);
                  $("#inputCPUNumber").val($("#inputCPUNumber").attr("default"));
                  $("#inputCPUNumber").prop('disabled', false);
                  $("#rangeCPU").val($("#rangeCPU").attr("default"));
                  $("#rangeCPU").prop('disabled', false);
                  $("#inputCoresNumber").val($("#inputCoresNumber").attr("default"));
                  $("#inputCoresNumber").prop('disabled', false);
                  $("#rangeCores").val($("#rangeCores").attr("default"));
                  $("#rangeCores").prop('disabled', false);
                  $("#inputIP").val($("#inputIP").attr("default"));
                  $("#inputIP").prop('disabled', false);
                  $("#isoVM").prop('disabled', false);
                  $("#panelDerechoBotones").removeClass('d-none');
         
              }
/*
              if( $("#inputRAM").val($("#inputRAM").attr("default"))){
                  $("#panelDerechoBotones").addClass('d-none');
              }
              else {
                  $("#panelDerechoBotones").removeClass('d-none');
              }*/
          });
        } catch (e) {
          console.log(e);
        }
      },
      m => console.log("BUAAAAA - ", m))
  }


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
        //loadVmData("#listaVM");
        //loadGruposData("#listaGruposVM");
        list(url).then(r => update(r, ["#listaVM", "#listaVMModal"]));
        handleDrop();

        //let url = apiServer + "404250";
        console.log(url);
        //handle buttons
        $("#play").click(onClickPlayButton);
        $("#restart").click(onClickRestartButton);
        $("#suspend").click(onClickSuspendButton);
        $("#stop").click(onClickStopButton);
        //$("#btnExport").click(loadVmData("#listaVMModal"));
        $("#botonBuscar").click(onClickSearchButton);
        $("#botonModificar").click(onClickModifyButton);

        //handle ranges
        
        handleRangeChange('#formControlRange', '#inputRAM', navigator.deviceMemory, navigator.deviceMemory/2);
        handleRangeChange('#storageRange', '#inputHDD', 500, 80);
        handleRangeChange('#rangeCPU', '#inputCPUNumber', 100, 40);
        handleRangeChange('#rangeCores', '#inputCoresNumber', navigator.hardwareConcurrency, 1);

        

    }

    function loadVmData(ulId) {
        $(ulId).empty();
       
        for(let i = 0; i < state.vms.length; i++) {
            let vm = data.vms[i];
            $(ulId).append(crearLista(vm.name, vm.status, i));
        }
    };
    

    function loadGruposData(ulId) {
        $(ulId).empty();
        for(let i = 0; i < data.groups.length; i++) {
            $(ulId).append(crearListaGrupos(data.groups[i].name, i));
        }
    };
    
    function crearLista(name, status, index) {
       
        if (status == "start" || status == "reset") {
            return "<li class= 'list-group-item list-vms draggableVm' name="+name+" index="+index+"> <input type='checkbox' id='chk' name='chk' value="+name+" index="+index+"></input>" + name + "<span class='badge badge-success mt-1'> </span> </li>";
        } 
        else if (status == "suspend"){
            return "<li class= 'list-group-item list-vms draggableVm' name="+name+" index="+index+"> <input type='checkbox' id='chk' name='chk' value="+name+" index="+index+"></input>" + name + "<span class='badge badge-warning mt-1'> </span> </li>";
        }
        else{
            return "<li class='list-group-item list-vms draggableVm' name="+name+" index="+index+"> <input type='checkbox' id='chk' name='chk' value="+name+" index="+index+"></input>" + name + "<span class='badge badge-danger mt-1'> </span> </li>";
        }
    
    }

    function crearListaGrupos(name, status, index) {
        
        return "<li class= 'list-group-item list-vms' name="+name+" index="+index+"> <input type='checkbox' name='chk'></input>" + name + "</li>";
    }



    function onClickPlayButton() {
        let listaChecks = $("#listaVM > li > input");
    
        for(let elem of listaChecks) {
            if($(elem).get()[0].checked) {
            	let indexVm = $(elem).parent().attr("index");
            	state.vms[indexVm].state = 'start';
                let status = $(elem).parent().find(".badge");
                status.removeClass("badge-warning");
                status.removeClass("badge-danger");
                status.addClass("badge-success");
                //list(url).then(r => update(r, ["#listaVM", "#listaVMModal"]));
            }
        }
    }
    
    function onClickRestartButton() {
        let listaChecks = $("#listaVM > li > input");
    
        for(let elem of listaChecks) {
            if($(elem).get()[0].checked) {
            	let indexVm = $(elem).parent().attr("index");
            	state.vms[indexVm].state = 'reset';
                let status = $(elem).parent().find(".badge");
                status.removeClass("badge-warning");
                status.removeClass("badge-danger");
                status.addClass("badge-danger");
                setTimeout(function() { 
                    status.removeClass("badge-danger");
                    status.addClass("badge-success");
                }, 2000);
                
            }
        }
    }
    
    function onClickSuspendButton() {
        let listaChecks = $("#listaVM > li > input");
    
        for(let elem of listaChecks) {
            if($(elem).get()[0].checked) {
            	let indexVm = $(elem).parent().attr("index");
            	state.vms[indexVm].state = 'suspend';
                let status = $(elem).parent().find(".badge");
                status.removeClass("badge-success");
                status.removeClass("badge-danger");
                status.addClass("badge-warning");
               
            }
        }
    }
    
    function onClickStopButton() {
        let listaChecks = $("#listaVM > li > input");
        
        for(let elem of listaChecks) {
            if($(elem).get()[0].checked) {
            	let indexVm = $(elem).parent().attr("index");
            	state.vms[indexVm].state = 'stop';
                let status = $(elem).parent().find(".badge");
                status.removeClass("badge-success");
                status.removeClass("badge-danger");
                status.addClass("badge-danger");
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

    function onClickModifyButton() {
        $("#nameVM").prop('disabled', false);
        $("#inputRAM").prop('disabled', false);
        $("#formControlRange").prop('disabled', false);
        $("#inputHDD").prop('disabled', false);
        $("#storageRange").prop('disabled', false);
        $("#inputCPUNumber").prop('disabled', false);
        $("#rangeCPU").prop('disabled', false);
        $("#inputCoresNumber").prop('disabled', false);
        $("#rangeCores").prop('disabled', false);
        $("#inputIP").prop('disabled', false);
        $("#isoVM").prop('disabled', false);
        

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
    
    function handleDrop() {
    
        $(".droppable").droppable({
            drop: function(event, ui) {
            	const name = $(ui.draggable).attr("name");
            	    
                rm(url,[name]).then(r => update(r, ["#listaVM", "#listaVMModal"]));
                $(ui.draggable).remove();
            }
        });
    }

    $("#botonCrear").click(e => {     
    	 
        const name = $("#nameVM").val();
        const ram = $("#inputRAM").val();
        const hdd = $("#inputHDD").val();
        const cpu = $("#inputCPUNumber").val();
        const cores = $("#inputCoresNumber").val();
        const ip = $("#inputIP").val();
        const iso = $("#isoVM").val();
        const sampleParams = new Params(
          name, ram, hdd, cpu, cores, ip, iso

        );
       
        add(url, sampleParams).then(r => update(r, ["#listaVM", "#listaVMModal"]));
        
        //return false; // <-- evita que se envie el formulario y recargue la pagina
      });

});





