
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

//TRANSFERIR DINERO
// function transferirDinero(cuentaOrigen, cuentaDestino, monto){
	// //tiene que tener las 3 cosas
	// if(cuentaOrigen == "" || cuentaDestino == "" || monto == ""){
		// $('#errorMessage').show().html("<div class='alert alert-danger' role='alert'><strong>Oh Margot!!</strong> Asegurece de seleccionar cuenta de Origen y Destino tambien ingrese un Monto mayor a 0</div>");
	// }else{
		// //si origen y destino es igual muestra error
		// if(cuentaOrigen == cuentaDestino){
			// $('#errorMessage').show().html("<div class='alert alert-danger' role='alert'><strong>Oh Margot!!</strong> No se puede seleccionar la misma cuenta como origen y destino</div>");
		// }else{

		// }
	// }
// }


// function cambiarDinero(deMoneda, aMoneda, monto){
	// //
	// var moneda1 = deMoneda;
	// var moneda2 = aMoneda;

	// catizacion = ;
// }




//GET COTIZACION
//Cotizaciones










