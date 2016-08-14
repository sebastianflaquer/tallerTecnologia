
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
	//item = "<li><a onclick='redirect(detalle-cuenta.html)'>" + e.nomCuenta + "</a></li>"
	//return list;
}










