---
layout: single
author_profile: true
title: Redes virtuales
excerpt: "Vamos a crear una red virtual para entornos de pivoting. ¡Let's hack!"
date: 2023-03-29
classes: wide
header:
  teaser: /assets/images/virtualred/01-inicio.png
  teaser_home_page: true
categories:
  - Pivoting
tags:
  - Configuraciones
  - Virtualbox
---

<p align="center">
<img src="/assets/images/virtualred/02-tarjeta.png">
</p>
 

¡Hola! En esta ocasión nos adentraremos en el mundo de la virtualización y configuración de entornos de red en `VirtualBox`, una herramienta muy útil para crear laboratorios de pruebas y ejercicios de pivoting como los que vamos a utilizar en próximos posts.

## ENTORNO

Para este ejercicio vamos a hacer uso de 3 máquinas virtuales, 2 Linux y 1 Windows, esto con el fin de diversificar y comprobar que la conectividad entre máquinas no será ningún problema por los entornos que nos encontremos manejando.

En circunstancias normales tenemos activas máquinas virtuales en conexiones `Puente` (bridge) o `NAT`, entraré un poco en detalle:
>
* **Puente (bridge):** Conexión de redes lógicas separadas que comparten una misma red física.
* **NAT:** Conexión de una red privada con acceso a Internet a través de una única dirección IP pública.
>

Con la nueva configuración, vamos a tener el siguiente ambiente compuesto por 2 redes internas, una por conexión `puente` (bridge) y otra por `Host Only Network Adapter` para crear redes privadas virtuales y limitar el acceso de la máquina virtual solo al host en el que se ejecuta.

<p align="center">
<img src="/assets/images/virtualred/03-virtual.png">
</p>

## CREAR NUEVA INTERFAZ
>
* Abrir `VirtualBox`
* Clic en `herramientas`
* Clic en `menú` de herramientas
* Clic en `Red`
>

<p align="center">
<img src="/assets/images/virtualred/04-virtual.png">
</p>

Una vez en el área de trabajo vemos una interfaz configurada por defecto, sin embargo, vamos a crear una desde cero y será la que vamos a utilizar.
>
* Clic en `Crear`
>

Automáticamente se crea una nueva interfaz.

**Nota:** _Es importante aclarar que necesitas permisos de administrador para crear la interfaz, por lo que te va a pedir una confirmación al momento de crearla._

<p align="center">
<img src="/assets/images/virtualred/05-virtual.png">
</p>

## CONFIGURACIÓN DE INTERFAZ
>
* Clic en `Propiedades`
* Clic en `Interfaz`
* Clic en `Adaptador`
* Clic en `Configurar adaptador manualmente`
* Configurar `Red` y `Mascara`
* Clic en `Aplicar`
>

<p align="center">
<img src="/assets/images/virtualred/06-virtual.png">
</p>

**Nota:** _Es importante aclarar que necesitas permisos de administrador para configurar la interfaz, por lo que te va a pedir una confirmación al momento de configurar._

## CONFIGURACIÓN INTERFAZ SERVIDOR DHCP
>
* Clic en `Interfaz`
* Clic en `Servidor DHCP`
* Clic en `Habilitar servidor`
* Modificar `Red` y `Mascara` (opcional)
* Clic en `Aplicar`
>

<p align="center">
<img src="/assets/images/virtualred/07-virtual.png">
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
<img src="/assets/images/virtualred/08-virtual.png">
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
<img src="/assets/images/virtualred/09-virtual.png">
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
<img src="/assets/images/virtualred/10-virtual.png">
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
<img src="/assets/images/virtualred/11-virtual.png">
</p>

## VALIDACIÓN DE CONEXIONES

Ya tenemos el entorno configurado, ahora vamos a validar si nuestras máquinas tienen la configuración de red correcta.

<p align="center">
<img src="/assets/images/virtualred/12-virtual.png">
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
<img src="/assets/images/virtualred/13-virtual.png">
</p>

Con esta configuración vamos a tener la posibilidad de crear nuevos entornos para practicar nuestros ejercicios de hacking orientados al pivoting, tema bastante importante para certificaciones como la `eCPPT`, crear laboratorios propios nos da una ventaja en no depender de otras infraestructuras para practicar, así que esperen una corta serie pero de mucho aprendizaje en los próximos posts.

_¡Que tengan un buen día en el planeta donde se encuentren!_

**Nos vemos en otro bit.**
