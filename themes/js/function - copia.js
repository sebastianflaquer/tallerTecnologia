
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
function cargarListaCuentas(){
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

//CARGAR CUENTAS
function cargarCuentas(){
	var listadoCuentas = $('ul:first');
	listadoCuentas.html("");
	db.transaction(function (tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS Cuentas (nombre, moneda, importe, usuario)',[],function(tx,results){
			tx.executeSql('select * from Cuentas where usuario = ?',[localStorage.userName],function(tx,results){
				if(results.rows.length == 0)
					$('#errorMessage').show().html("<div class='alert alert-danger' role='alert'><strong>Oh Margot!!</strong>Aun no tienen cuentas</div>");
				else
				{
					for(var i = 0; i < results.rows.length;i++){
						var lista = $('ul:first');
						var aux = results.rows.item(i);
						var cuentaNom = aux.nombre;
						var cuentaImpo = aux.importe;
						lista.append("<li><a href='#detalle' data-id='"+aux.nombre+"' data-importe='"+aux.importe+"' onclick='cargar($(this).attr(\"data-id\"),$(this).attr(\"data-importe\"))'><h2>"+aux.nombre+"</h2><p>"+aux.importe+"</p></a></li>");
						//console.log(results.rows.item(i).nombre);
						//$('#contenido').html(aux.nombre + aux.importe);
						lista.listview().listview('refresh');
					}
				}
			});
		});
	});
}



//Detalle de cuenta
function cargar(nombreCuenta, importeCuenta){
	localStorage.setItem('nomCuenta', nombreCuenta);
	localStorage.setItem('ImporteActualCuenta', importeCuenta);
	//$.mobile.loading("show");
	$('#nomCuenta').html(nombreCuenta);
	$('#impoCuenta').html(importeCuenta);
	$('#movimientosCuenta').html("");
	cargarMovimientos(localStorage.nomCuenta);
}



//CREAR INGRESO
function crearIngreso(importe, tipo, dsc, usuario)
{
	db.transaction(function (tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS Movimientos (importe, tipo, dsc, usuario, nomCuenta, tipoMov)',[],function(tx,results){
			tx.executeSql('INSERT INTO Movimientos (importe, tipo, dsc, usuario, nomCuenta, tipoMov) VALUES (?, ?, ?, ?, ?, ?)',[importe, tipo, dsc, usuario, localStorage.nomCuenta, "Ingreso"],function(){
				alert("Ingreso creado con exito!");
				sumarIngreso(importe);
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
				restarGasto(importe);
				redirect('cuentas.html#detalle');
			});
		});
	});
}

//ACTUALIZAR EL IMPORTE DE LA CUENTA
function restarGasto(gasto, cuenta)
{
	var cuenta = cuenta || localStorage.nomCuenta;
	var total = parseInt(localStorage.ImporteActualCuenta) - parseInt(gasto);
	db.transaction(function (tx) {
		tx.executeSql('update Cuentas set importe =? where usuario=? AND nombre=?',[total, localStorage.userName, cuenta],function(tx,results){
		});
	});
	cargar(localStorage.nomCuenta, total);
}

//ACTUALIZAR EL IMPORTE DE LA CUENTA
function sumarIngreso(ingreso)
{
	var cuenta = cuenta || localStorage.nomCuenta;
	var total = parseInt(localStorage.ImporteActualCuenta) + parseInt(ingreso);

	db.transaction(function (tx) {
		tx.executeSql('update Cuentas set importe =? where usuario=? AND nombre=?',[total, localStorage.userName, cuenta],function(tx,results){

		});
	});
	cargar(localStorage.nomCuenta, total);
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
			//averigua el tipo de moneda de las cuentas
			saberMoneda(cuentaOrigen);
			var deMoneda = localStorage.TipocuentaActual;
			saberMoneda(cuentaDestino);
			var aMoneda = localStorage.TipocuentaActual;
			var montoCambiado = cambiarDinero(deMoneda, aMoneda, monto);

			//agrega gasto en cuenta
			//crearGasto(monto, "Transferencia", "Transferencia entre Cuentas", localStorage.userName);
			//agrega ingreso en cuenta
			//crearIngreso(montoCambiado, "Transferencia", "Transferencia entre Cuentas", localStorage.userName);
		}
	}
}

function saberMoneda(cuenta){
	var tipoMoneda = "";

	db.transaction(function (tx) {
		tx.executeSql('select * from cuentas where nombre=?',[cuenta],function(tx,results){
			for(var i = 0; i<results.rows.length;i++)
			{
				//alert(results.rows.item(i).moneda);
				localStorage.setItem('TipocuentaActual', results.rows.item(i).nombre);
			}
		});
		// tx.executeSql('select * from cuentas where nombre=?',[cuenta],function(tx,results){
		// 	var auxMoneda = results.rows.item(1).text;
		// 	alert(auxMoneda);
		// 	localStorage.setItem("TipocuentaActual", auxMoneda)
		// });
	});
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
	listadoMovimientos.html("");
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


//EDITAR CUENTA
function editarCuenta(nuevoNombre)
{
	//actualiza cuenta
	db.transaction(function (tx) {
		tx.executeSql('update Cuentas set nombre =? where nombre=?',[nuevoNombre, localStorage.nomCuenta],function(tx,results){
		});
	});
	//actualiza movimiento
	db.transaction(function (tx) {
		tx.executeSql('update Movimientos set nomCuenta =? where nomCuenta=?',[nuevoNombre, localStorage.nomCuenta],function(tx,results){
		});
	});
	localStorage.setItem('nomCuenta', nuevoNombre);
	$('#listadoCuentas').listview().listview('refresh');
	redirect('cuentas.html#cuentas');
}

//EDITAR CUENTA
function eliminarCuenta()
{
	//eliminar movimientos
	db.transaction(function (tx) {
			tx.executeSql('Delete FROM Cuentas WHERE nombre =?',[localStorage.nomCuenta],function(tx,results){
		});
	});

	//eliminar cuenta
	db.transaction(function (tx) {
			tx.executeSql('Delete FROM Movimientos WHERE nomCuenta =?',[localStorage.nomCuenta],function(tx,results){
				$('#listadoCuentas').listview().listview('refresh');
				//CARGA TODAS LAS CUENTAS
				cargarCuentas();
				redirect('cuentas.html#cuentas');
		});
	});
}









