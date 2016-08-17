
//animaciones data-ajax=false

//USER SATATE
function userSatate(estado){
	if (localStorage.userState == "false") {
		return false;
	}else{
		return true;
	}
}

//URL REDIRECT
function redirect(url) {
    var ua        = navigator.userAgent.toLowerCase(),
        isIE      = ua.indexOf('msie') !== -1,
        version   = parseInt(ua.substr(4, 2), 10);

    // Internet Explorer 8 and lower
    if (isIE && version < 9) {
        var link = document.createElement('a');
        link.href = url;
        document.body.appendChild(link);
        link.click();
    }

    // All other browsers can use the standard window.location.href (they don't lose HTTP_REFERER like IE8 & lower does)
    else { 
        window.location.href = url;
    }
}

//CARGAR Base
function cargarBase(){
	var base = window.openDatabase("TallerSqlStorage", "1.0", "Base de datos", 5*1024*1024);
	return base;
}

//CREAR CUENTA
function crearCuenta(idCuenta, nomCuenta, monCuenta, impCuenta){
	//FALTA CREAR LA CUENTAL	
	//redirige a cuentas
	localStorage.setItem('cuentaNueva', 'true');
	redirect('cuentas.html');
	return true;
}

//CARGAR CUENTAS
function cargarCuentas(){
	var arr = new Array();
	db = window.openDatabase("TallerSqlStorage", "1.0", "Base de datos", 5*1024*1024);
	db.transaction(function (tx) { 
		tx.executeSql('CREATE TABLE IF NOT EXISTS Cuentas (idnombre, nombre, moneda, importe, usuario)',[],function(tx,results){
			tx.executeSql('select * from Cuentas where usuario = ?',[localStorage.userName],function(tx,results){
				for(var i = 0; i<results.rows.length;i++)
				{
					//console.log(results.rows.item(i).nombre);
					//alert(results.rows.item(i).nombre);
					arr.push(results.rows.item(i).nombre);
				}
			});
		});
	});
	return arr;
}



//Detalle de cuenta
function cargar(nombreCuenta, importeCuenta){
	localStorage.setItem('nomCuenta', nombreCuenta);
	localStorage.setItem('ImporteActualCuenta', importeCuenta);			
	//$.mobile.loading("show");
	$('#nomCuenta').html(nombreCuenta);
	$('#impoCuenta').html(importeCuenta);
	cargarMovimientos(nombreCuenta);
}



//CREAR INGRESO
function crearIngreso(importe, tipo, dsc, usuario)
{
	db.transaction(function (tx) { 
		tx.executeSql('CREATE TABLE IF NOT EXISTS Movimientos (importe, tipo, dsc, usuario, nomCuenta, tipoMov)',[],function(tx,results){
			tx.executeSql('INSERT INTO Movimientos (importe, tipo, dsc, usuario, nomCuenta, tipoMov) VALUES (?, ?, ?, ?, ?, ?)',[importe, tipo, dsc, usuario, localStorage.nomCuenta, "Ingreso"],function(){
				alert("Ingreso creado con exito!");
				$('#movimientosCuenta').listview().listview('refresh');
				sumarIngreso(importe);
				cargarMovimientos(localStorage.nomCuenta);
				redirect('cuentas.html#detalle');
			});
		});
	});
}

//CREAR GASTO
function crearGasto(importe, tipo, dsc, usuario)
{
	db.transaction(function (tx) { 
		tx.executeSql('CREATE TABLE IF NOT EXISTS Movimientos (importe, tipo, dsc, usuario, nomCuenta, tipoMov)',[],function(tx,results){
			tx.executeSql('INSERT INTO Movimientos (importe, tipo, dsc, usuario, nomCuenta, tipoMov) VALUES (?, ?, ?, ?, ?, ?)',[importe, tipo, dsc, usuario, localStorage.nomCuenta, "Gasto"],function(){
				alert("Gasto creado con exito!");
				$('#movimientosCuenta').listview().listview('refresh');
				restarGasto(importe);
				cargarMovimientos(localStorage.nomCuenta);
				redirect('cuentas.html#detalle');						
			});
		});
	});
}		

//ACTUALIZAR EL IMPORTE DE LA CUENTA
function restarGasto(gasto, cuenta)
{
	var cuenta = cuenta || localStorage.nombreCuenta;
	db.transaction(function (tx) {
		tx.executeSql('update Cuentas set importe =? where usuario=? AND nombre=?',[localStorage.ImporteActualCuenta - gasto, localStorage.userName, cuenta],function(tx,results){
		});
	});
	cargar(localStorage.nomCuenta, localStorage.ImporteActualCuenta - gasto);
}

//ACTUALIZAR EL IMPORTE DE LA CUENTA
function sumarIngreso(ingreso)
{
	var cuenta = cuenta || localStorage.nombreCuenta;
	db.transaction(function (tx) {
	tx.executeSql('update Cuentas set importe =? where usuario=? AND nombre=?',[localStorage.ImporteActualCuenta + ingreso, localStorage.userName, cuenta],function(tx,results){
		});
	});
	cargar(localStorage.nomCuenta, localStorage.ImporteActualCuenta + ingreso);
}



//TRANSFERIR DINERO
function transferirDinero(cuentaOrigen, cuentaDestino, monto){
	//tiene que tener las 3 cosas
	if(cuentaOrigen == "" || cuentaDestino == "" || monto == ""){
		$('#errorMessage').show().html("<div class='alert alert-danger' role='alert'><strong>Oh Margot!!</strong> Asegurece de seleccionar cuenta de Origen y Destino tambien ingrese un Monto mayor a 0</div>");
	}else{
		//si origen y destino es igual muestra error
		if(cuentaOrigen == cuentaDestino){
			$('#errorMessage').show().html("<div class='alert alert-danger' role='alert'><strong>Oh Margot!!</strong> No se puede seleccionar la misma cuenta como origen y destino</div>");
		}else{
			var montoCambiado = cambiarDinero(cuentaOrigen, cuentaDestino, monto);
			//agrega gasto en cuenta
			crearGasto(monto, "Transferencia", "Transferencia entre Cuentas", localStorage.userName);
			//agrega ingreso en cuenta
			crearIngreso(montoCambiado, "Transferencia", "Transferencia entre Cuentas", localStorage.userName);
		}
	}
}

function cambiarDinero(deMoneda, aMoneda, monto){
	var resultado =-1;
	cotizar(deMoneda,aMoneda);
	var cotizacion = localStorage.cotizacion;
	if(cotizacion!=-1){
		var conversion = cotizacion*monto;
		resultado = conversion;
	}else{
		$('#errorMessage').show().html("<div class='alert alert-danger' role='alert'><strong>Oh Margot!!</strong>Ocurrio un error en la cotizacion, intente mas tarde</div>");
	}
	return resultado;
}

//GET COTIZACION
//Cotizaciones
function cotizar(MonedaA, MonedaB){
	var cotizacion = -1;
	$.ajax({
		type: "GET",
		dataType: "json",
		url: "http://finanzapersonal.tribus.com.uy/cotizaciones",
		data: {origen:MonedaA, destino:MonedaB},
		success: function(data){
			resul = data;
			if(resul.resultado_operacion == "OK"){					
				//Guardar en el LocalStorage sesion de variable
				localStorage.setItem('cotizacion', resul.monto);
			}else{
				$('#errorMessage').show().html("<div class='alert alert-danger' role='alert'><strong>Oh Margot!</strong> Las cotizaciones no estan disponibles actualmente, intente nuevamente en unos minutos</div>");
			}
		}
	});
	
}

//CARGAR MOVIMIENTOS
function cargarMovimientos(nombrecuenta){
	var listadoMovimientos = $('#movimientosCuenta');
	db.transaction(function (tx) { 				
		tx.executeSql('select * from movimientos where usuario=? AND nomCuenta=?',[localStorage.userName, localStorage.nomCuenta],function(tx,results){
			for(var i = 0; i < results.rows.length;i++){
				//var lista = $('#movimientosCuenta');
				var aux = results.rows.item(i);
				listadoMovimientos.prepend("<li><h4>"+ aux.importe + "</h4><p>" +aux.tipo+"</p><p>"+aux.tipoMov+"</p><p>"+aux.dsc+"</p></li>");							
				console.log(results.rows.item(i).nombre);							
				//$('#contenido').html(aux.nombre + aux.importe);							
			}
				listadoMovimientos.listview().listview('refresh');
		});
	});
}	









