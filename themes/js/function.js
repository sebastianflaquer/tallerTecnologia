
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
function redirect (url) {
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

//CREAR CUENTA
function crearCuenta(nomCuenta, monCuenta, impCuenta){
	//FALTA CREAR LA CUENTAL
	
	//redirige a cuentas
	localStorage.setItem('cuentaNueva', 'true');
	redirect('cuentas.html');
	return true;
}

//CARGAR CUENTAS
function cargarCuentas(){
	var hola = "";
	db = window.openDatabase("TallerSqlStorage", "1.0", "Base de datos", 5*1024*1024);
	db.transaction(function (tx) { 
		tx.executeSql('CREATE TABLE IF NOT EXISTS Cuentas (nombre, moneda, importe, usuario)',[],function(tx,results){
			tx.executeSql('select * from Cuentas where usuario = ?',[localStorage.userName],function(tx,results){
				for(var i = 0; i<results.rows.length;i++)
				{
					//console.log(results.rows.item(i).nombre);
					//alert(results.rows.item(i).nombre);
					hola += results.rows.item(i).nombre;
				}
			});
		});
	});
	return hola;
}


//GET COTIZACION
//Cotizaciones










