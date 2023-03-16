---
layout: single
author_profile: true
title: SafeWebHeaders.py
excerpt: "Vamos a conocer la utilidad SafeWebHeaders.py creada por The Game 008 para auditar cabeceras web. ¡Let's hack!"
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

<p align="center">
<img src="/assets/images/safewebheaders/06-virtual.png">
</p>

## SafeWebHeaders.py EN ACCIÓN

Luego de instalar la herramienta, vamos a hacer una prueba para ver que tan seguro es nuestro blog a nivel `web`

```bash
python3 SafeWebHeaders.py
Introduce la URL a escanear: https://bast1ant1c.github.io
```
```bash
Cabeceras correctamente implementadas:

Cabeceras con configuración incorrecta:
- Strict-Transport-Security:
	- Valor recomendado por OWASP: max-age=63072000; includeSubDomains; preload
	- Configuración actual en la URL: max-age=31556952
	- Riesgo: Vulnerabilidad a ataques de MITM

Cabeceras que deberían estar implementadas, pero no se ven implementadas:
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy: default-src 'self'; base-uri 'self'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'

Divulgación de información en cabecera:
- Server: GitHub.com
```
```bash
python3 SafeWebHeaders.py
Introduce la URL a escanear: <URL_INSEGURA>
```
```bash
Cabeceras correctamente implementadas:

Cabeceras con configuración incorrecta:

Cabeceras que deberían estar implementadas, pero no se ven implementadas:
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy: default-src 'self'; base-uri 'self'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'

Divulgación de información en cabecera:
- Server: SimpleHTTP/0.6 Python/3.9.2
```

Como podemos evidenciar, esta utilidad nos permite identificar cabeceras correctamente implementadas, con configuración incorrecta, no implementadas y divulgación de información sensible, en esta oportunidad podemos ver que nuestro blog necesita un ajuste a nivel de cabeceras para que sea un sitio seguro.

<p align="center">
<img src="/assets/images/safewebheaders/05-virtual.png">
</p>

## CONFIGURACIÓN MÁQUINA 1

Nuestra primera máquina tendrá conexión directa con la interfaz física, por lo tanto, solo requerimos de un adaptador de red en adaptador puente.
>
* Clic en la `máquina`
* Clic en `Configuración`
* Clic en `Red`
* Clic en `Adaptador 1`
* Clic en `Enable Network Adapter`
* Escoger `Adaptador puente`
* Escoger `Interfaz` física
* Clic en `Aceptar`
>

<p align="center">
<img src="/assets/images/safewebheaders/08-virtual.png">
</p>

## CONFIGURACIÓN MÁQUINA 2

Nuestra segunda máquina tendrá la misma conexión con adaptador puente y otro adaptador de red para la nueva interfaz configurada anteriormente.

### CONFIGURACIÓN INTERFAZ PUENTE
>
* Clic en la `máquina`
* Clic en `Configuración`
* Clic en `Red`
* Clic en `Adaptador 1`
* Clic en `Enable Network Adapter`
* Escoger `Adaptador puente`
* Escoger `Interfaz` física
* Clic en `Aceptar`
>

<p align="center">
<img src="/assets/images/safewebheaders/09-virtual.png">
</p>

### CONFIGURACIÓN INTERFAZ CREADA
>
* Clic en la `máquina`
* Clic en `Configuración`
* Clic en `Red`
* Clic en `Adaptador 2`
* Clic en `Enable Network Adapter`
* Escoger `Adaptador sólo-anfitrión`
* Escoger `Interfaz creada`
* Clic en `Aceptar`
>

<p align="center">
<img src="/assets/images/safewebheaders/10-virtual.png">
</p>

## CONFIGURACIÓN MÁQUINA 3

Nuestra tercera máquina tendrá conexión directa con la interfaz creada, por lo tanto, solo requerimos de un adaptador de red en adaptador sólo-anfitrión.
>
* Clic en la `máquina`
* Clic en `Configuración`
* Clic en `Red`
* Clic en `Adaptador 2`
* Clic en `Enable Network Adapter`
* Escoger `Adaptador sólo-anfitrión`
* Escoger `Interfaz creada`
* Clic en `Aceptar`
>

<p align="center">
<img src="/assets/images/safewebheaders/11-virtual.png">
</p>

## VALIDACIÓN DE CONEXIONES

Ya tenemos el entorno configurado, ahora vamos a validar si nuestras máquinas tienen la configuración de red correcta.

<p align="center">
<img src="/assets/images/safewebheaders/12-virtual.png">
</p>

Como podemos ver, la primera máquina tiene una dirección asociada a la primera red únicamente, la segunda máquina tiene esta misma red y adicionalmente la red nueva creada a través de la interfaz, por último, la tercera máquina se encuentra asociada a la segunda red interna, también generada por la nueva interfaz.

## PRUEBA DE CONECTIVIDAD

Nuestra configuración ha sido exitosa, tenemos que hacer pruebas de conectividad para corroborar que nuestras redes sean operativas, debemos tener en cuenta lo siguiente:
>
* La `máquina 1` solo puede tener conectividad por el mismo segmento de la `máquina 2`
* La `máquina 2` tiene conectividad por el mismo segmento de las `máquinas 1 y 2`
* La `máquina 3` solo puede tener conectividad por el mismo segmento de la `máquina 2`
>

<p align="center">
<img src="/assets/images/safewebheaders/13-virtual.png">
</p>

Con esta configuración vamos a tener la posibilidad de crear nuevos entornos para practicar nuestros ejercicios de hacking orientados al pivoting, tema bastante importante para certificaciones como la `eCPPT`, crear laboratorios propios nos da una ventaja en no depender de otras infraestructuras para practicar, así que esperen una corta serie pero de mucho aprendizaje en los próximos posts.

_¡Que tengan un buen día en el planeta donde se encuentren!_

**Nos vemos en otro bit.**
