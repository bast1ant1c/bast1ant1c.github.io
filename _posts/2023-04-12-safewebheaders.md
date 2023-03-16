---
layout: single
author_profile: true
title: SafeWebHeaders.py
excerpt: "Vamos a conocer la utilidad SafeWebHeaders.py de The Game 008 para auditar cabeceras web. ¡Let's hack!"
date: 2023-04-12
classes: wide
header:
  teaser: /assets/images/safewebheaders/01-inicio.png
  teaser_home_page: true
categories:
  - Programacion
tags:
  - Python
  - Script
---

<p align="center">
<img src="/assets/images/safewebheaders/02-tarjeta.png">
</p>


¡Hola! En esta ocasión vamos a conocer la utilidad [SafeWebHeaders.py](https://raw.githubusercontent.com/Thegame008/Secure-Headers-OWASP/main/SafeWebHeaders.py) creada por [The Game 008](https://github.com/Thegame008/), para auditar las cabeceras de una pagina web basada en las recomendaciones de `OWASP` (Open Web Application Security Project).

## CABECERAS WEB

Las cabeceras web, son parte de los datos que se envían desde un servidor web al cliente en una respuesta `HTTP`. Estas cabeceras **pueden** contienen información adicional sobre la respuesta, incluyendo información sobre el servidor, la caché, el tipo de contenido, la codificación de caracteres, entre otros. Estas son indispensables porque permiten que los navegadores web y otros clientes logren procesar la respuesta del servidor y representar la información al usuario final. 

Algunos de los riesgos que se pueden presentar a nivel de seguridad en cabeceras son las siguientes:

* Divulgación de información
* Inyecciones de código
* Secuestros de sesiones o clicks (hijacking)
* Exposición de información confidencial

<p align="center">
<img src="/assets/images/safewebheaders/03-header.png">
</p>

## OWASP

**Open Web Application Security Project** es una organización sin ánimo de lucro con el objetivo de mejorar la seguridad del software y las aplicaciones web. Gracias a esto se han podido identificar los riesgos de seguridad más críticos y comunes a nivel `web` y han proporcionado recursos y recomendaciones para ayudar a las comunidades a proteger sus aplicativos y páginas web. 

<p align="center">
<img src="/assets/images/safewebheaders/04-header.png">
</p>

OWASP tiene una lista de los [diez riesgos de seguridad más críticos en aplicaciones web](https://owasp.org/www-project-top-ten/), conocida como `OWASP Top Ten`. Entre este top se encuentra la falta de protección adecuada en las cabeceras web.

A continuación, las **recomendaciones** proporcionadas por OWASP para mejorar la seguridad de las aplicaciones web:

* `Strict-Transport-Security (HSTS)` que obliga al navegador a utilizar solo HTTPS para las solicitudes futuras a la misma dirección web
* `X-Frame-Options` que evita la incrustación no deseada de páginas web en un marco (frame) y ayuda a prevenir el clickjacking
* `X-XSS-Protection` que activa una protección integrada contra ataques XSS (Cross-Site Scripting) en los navegadores modernos
* `X-Content-Type-Options` que evita la interpretación automática del contenido cargado para prevenir ataques MIME sniffing
* `Content-Security-Policy` que limita los recursos que un sitio web puede cargar en su página, lo que ayuda a prevenir los ataques de inyección de código

## INSTALAR SafeWebHeaders.py

En el [repositorio](https://github.com/Thegame008/Secure-Headers-OWASP) puedes encontrar el paso a paso de como instalar la herramienta, sin embargo, acá tambien te mostramos el proceso.

```bash
git clone https://github.com/Thegame008/Secure-Headers-OWASP.git
cd Secure-Headers-OWASP
python3 SafeWebHeaders.py
```

## testingHeaders.py

Hemos tomado el tiempo de hacer una prueba de concepto que puede ayudarles a validar cabeceras en un entorno local, por eso vamos a compartir el script `testingHeaders.py` desarrollado en `python`, para que puedan hacerlo en sus entornos.

```bash
# -*- coding: utf-8 -*-

import sys
import signal
from http.server import BaseHTTPRequestHandler, HTTPServer
from colorama import Fore, Style
from tqdm import tqdm


class MyHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):

        #### !! COMENTAR ESTAS 2 LINEAS PARA VER DIVULGACIÓN DE SOFTWARE !! ###
        self.server_version = ''
        self.sys_version = ''

        # Obtiene las cabeceras personalizadas

        #### !! MODIFICAR CABECERAS DE SEGURIDAD SI ES NECESARIO !! ####
        headers = {
            'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-XSS-Protection': '1; mode=block',
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "default-src 'self'; base-uri 'self'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'"
        }

        # Imprime las cabeceras actuales
        print('')
        print(Fore.YELLOW + '[i] Cabeceras actuales:' + Style.RESET_ALL)
        print('')
        for header, value in headers.items():
            print(f'{Fore.CYAN}{header}:{Style.RESET_ALL} {value}')
        print('')

        # Envía las cabeceras personalizadas
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        for header, value in headers.items():
            self.send_header(header, value)
        self.end_headers()

        html = """
        <html>
<head>
	<meta charset="UTF-8">
	<title>Testing Headers PoC</title>
	<style>
		body {
			background-color: #222;
            color: #eee;
			margin: 0;
			padding: 0;
		}
		h1 {
			text-align: center;
			font-family: Arial, sans-serif;
			color: #fff;
			background-color: #333;
			margin: 0;
			padding: 20px;
		}
		.container {
            background-color: #333;
            color: #eee;
			width: 80%;
			margin: auto;
			border: 1px solid #ccc;
			padding: 20px;
			box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2);
			margin-top: 50px;
		}
		p {
			font-family: Arial, sans-serif;
			font-size: 16px;
			line-height: 1.5;
			color: #eee;
			margin: 0;
			padding: 0;
		}
		footer {
			background-color: #333;
            color: #eee;
			padding: 10px;
			text-align: center;
			font-size: 12px;
			font-family: Arial, sans-serif;
			margin-top: 50px;
		}
		footer a {
			color: #fff;
		}
	</style>
</head>
<body>
	<h1>Testing Headers PoC</h1>
	<div class="container">
		<p>¡Bienvenido al servidor HTTP de prueba!</p>
		<p>Esta página es una demostración de cómo se pueden enviar cabeceras personalizadas desde un servidor HTTP Python.</p>
		<p>Puedes personalizar el contenido de esta página como desees.</p>
	</div>
	<footer>
		Powered by bast1ant1c &copy; 2023
	</footer>
</body>
</html>
        """
        self.wfile.write(bytes(html, "utf-8"))



def run(ip, port):
    # Especifica el puerto y la dirección del servidor
    address = (ip, int(port))
    httpd = HTTPServer(address, MyHandler)
    print(Fore.GREEN + f'[>] Iniciando servidor en el puerto {port}...' + Style.RESET_ALL)

    # Captura la señal SIGINT para salir graciosamente con Ctrl+C
    def signal_handler(sig, frame):
         print(Fore.RED + '\n[!] Saliendo ...' + Style.RESET_ALL)
         sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    httpd.serve_forever()

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(Fore.RED + '\n[x] Se requiere la dirección IP y el puerto como argumentos\n' + Style.RESET_ALL)
        sys.exit(1)
    ip = sys.argv[1]
    port = sys.argv[2]
    run(ip, port)
```

De esta manera solo tendras que ejecutar el script con tu **dirección IP** y el **puerto** de preferencia para activar un servidor web con cabeceras de seguridad implementadas, para que puedas auditarlo con `SafeWebHeaders.py`.

```bash
python3 testingHeaders.py <IP> <PUERTO>
```

<p align="center">
<img src="/assets/images/safewebheaders/05-header.png">
</p>

## SafeWebHeaders.py + testingHeaders.py (SIN CABECERAS)

Se ha modificado `testingHeaders.py` para que no tenga cabeceras de seguridad implementadas, luego auditamos nuestra web de prueba con `SafeWebHeaders.py` mostrando las cabeceras que deberían estar implementadas, pero no se evidencian en el servidor.

<p align="center">
<img src="/assets/images/safewebheaders/06-header.png">
</p>

## SafeWebHeaders.py + testingHeaders.py (CABECERAS PARCIALMENTE IMPLEMENTADAS)

Se ha modificado `testingHeaders.py` para que tenga algunas cabeceras de seguridad implementadas y otras con configuración diferente, luego auditamos nuestra web de prueba con `SafeWebHeaders.py` mostrando las cabeceras correctas, las de configuración incorrecta y las cabeceras faltantes en el servidor.

<p align="center">
<img src="/assets/images/safewebheaders/07-header.png">
</p>

## SafeWebHeaders.py + testingHeaders.py (CABECERAS TOTALMENTE IMPLEMENTADAS)

Se ha modificado `testingHeaders.py` para que tenga todas las cabeceras de seguridad implementadas, luego auditamos nuestra web de prueba con `SafeWebHeaders.py` mostrando las cabeceras correctas en el servidor.

<p align="center">
<img src="/assets/images/safewebheaders/08-header.png">
</p>

Este es el review de la herramienta `SafeWebHeaders.py` del colega [The Game 008](https://github.com/thegame008), los invito a que lo sigan, a que miren sus repositorios y apoyen sus herramientas con una **estrella** y también es una invitación para animarlos a hacer nuevas herramientas, algo que puede ser útil para ustedes, puede ser útil para alguién más y podemos generar muy buenos repositorios en comunidad, compartir conocimiento hace que seamos mejores en nuestro campo!

<p align="center">
<img src="/assets/images/safewebheaders/09-finish.png">
</p>

_¡Que tengan un buen día en el planeta donde se encuentren!_

**Nos vemos en otro bit.**
