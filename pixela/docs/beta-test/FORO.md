# Foro de la beta de Pixela (simulado)

# Foro privado beta de Pixela · «Leyendo vuestras reseñas (hilo largo)»

---

## Hilo 1: Reseñas, comunidad y qué va primero

**Lucía** (hilo 1):
He leído las seis reseñas. Me consuela no ser la única a la que el toast de «Marcado como WATCHING» le pareció una broma. Aun así, hay algo más grave: mis reseñas no las lee nadie. Iván, tú lo llamas «escaparate», pero para mí es la razón de existir de la app.

**Iván** (hilo 1):
> mis reseñas no las lee nadie

Estoy de acuerdo, y además es una incoherencia técnica. El servidor ya carga las reseñas (`getMediaReviewsSafe`) y luego `ReviewSection` las esconde al anónimo. Se trabaja para ocultarlas. Donde no estoy de acuerdo contigo es en el orden. Las listas personalizadas, el diario y la importación de Letterboxd son mucho trabajo de esquema y de producto. Antes de eso yo pondría tarjetas con `<Link>`, la URL de Categorías y tests. Un revisor mira los cimientos antes que los muebles.

**Lucía** (hilo 1):
Qué romántico, los cimientos. Un portfolio que nadie quiere usar también tiene cimientos. Pero vale, te compro una parte: lo de mostrar las reseñas sin sesión es casi gratis y arregla el README que tanto te molesta. Hago una propuesta conjunta: **reseñas públicas + nota media Pixela** como primer paso social, y las listas después.

**Iván** (hilo 1):
+1 a eso. Si además la ficha muestra la media de Pixela, el contenido de la comunidad sirve para el SEO. Ahí coincidimos.

**Marcos** (hilo 1):
+1 también. Y lo del upsert me pareció lo más feo de todo, tío. Escribí una segunda reseña pensando que era otra y me borró la primera. Con un «ya tienes una, ¿la editas?» se arregla.

**Sara** (hilo 1):
Lo mío fue peor: borré una reseña sin querer. Los botones de editar y borrar de `ReviewCard` solo tienen `title`, así que NVDA los lee como «botón» a secas. Pulsé uno a ciegas y se borró sin confirmación. Lucía, cuando hables de reseñas largas, mete también la confirmación de borrado en el paquete, por favor.

**Lucía** (hilo 1):
Hecho, Sara. Tu caso es mejor argumento que el mío. Yo perdí un matiz; tú perdiste la reseña entera sin saber qué botón era.

**Carmen** (hilo 1):
Yo de reseñas entiendo poco, pero me pasó lo de las tres estrellas puestas. Pensé que ya la había puntuado alguien. Lucía, ¿esto de que la nota venga puesta es grave o es manía de diseñadora?

**Lucía** (hilo 1):
> ¿es grave o es manía de diseñadora?

Las dos cosas, Carmen. Si guardas sin tocar, la app ha opinado por ti. Mejor que empiece vacía y que el botón no se active hasta que elijas.

---

## Hilo 2: El móvil, las tarjetas y el teclado (el mismo problema con tres caras)

**Marcos** (hilo 2):
Leyendo a Sara he flipado. Yo pensaba que lo de las tarjetas era cosa del móvil (el hover no existe, bro), pero resulta que es lo mismo que le pasa a ella con el teclado y a Carmen con la tablet.

**Sara** (hilo 2):
Exacto. Es el mismo `div onClick` con `router.push` en `TrendingMediaCard` y en `CategoriesContent`. Tú no ves el título porque solo aparece con `group-hover`, y yo no llego porque no recibe foco. Si fuera un enlace con el título dentro como nombre accesible, se arreglaría para los tres.

**Iván** (hilo 2):
Y para el SEO, y para el clic central. Es el cambio con más retorno de toda la beta. Lo pongo el primero de la lista.

**Carmen** (hilo 2):
Yo pedía que en los carteles estuviera escrito el título debajo, siempre. ¿Eso entra en lo mismo?

**Sara** (hilo 2):
Entra, y lo apoyo por partida doble. Con el zoom al 200 % un título siempre visible me ahorra adivinar. Una corrección pequeña, Carmen, sobre lo que escribiste de los iconos:
> En la ficha hay un marcador y un lápiz, y hasta que no pulsé no supe que el lápiz era para escribir una opinión.

Para el lector de pantalla, el lápiz de la ficha sí está bien hecho: tiene `aria-label` «Escribir una reseña de «título»». NVDA me lo lee perfecto. Lo que falta es el **texto visible**, que es lo que necesitas tú. Por eso no es un problema de accesibilidad técnica, sino de que cualquiera entienda los iconos. Tu queja sigue siendo válida, solo que es otra.

**Carmen** (hilo 2):
Pues gracias, Sara, no sabía que eso se podía «leer». Entonces que lo que oye usted lo vea yo escrito, y todos contentos.

**Marcos** (hilo 2):
Otra cosa que no había pensado hasta leer a Iván: a mí el buscador «se comía» letras con mala cobertura y pensaba que era el móvil. Era el `isLoadingRef` que descarta la búsqueda si hay otra en curso, ¿no?

**Iván** (hilo 2):
Sí. Y la nota técnica del propio repo ya lo reconoce: hay que cambiar el booleano por un contador de peticiones, que el proyecto ya tiene en `useAsyncResource`. Es una corrección de una tarde.

**Sara** (hilo 2):
Añado lo de `prefers-reduced-motion`. Las tarjetas que entran con fade escalonado, las partículas del footer y las marquesinas me marean. No pido quitarlas, solo que se apaguen si el sistema lo pide.

**Lucía** (hilo 2):
Aquí me pongo de tu lado aunque me duela como diseñadora. La estética de la app va por el movimiento, pero el buen diseño de movimiento sabe cuándo callarse. +1.

**Carmen** (hilo 2):
+1. A mí también me cansa la vista tanto movimiento por la noche.

---

## Hilo 3: Seguir series vs. «solo quiero saber qué ver esta noche»

**Diego** (hilo 3):
Marcos, tu reseña y la mía son casi la misma. Sin episodios no es una app de seguimiento. Propongo lo mínimo viable: temporadas desplegables en la ficha, un check por episodio y una barra de progreso. Luego el calendario con `next_episode_to_air` y el estado de emisión.

**Marcos** (hilo 3):
+1 mil. Y un botón de «siguiente episodio» en grande, que en el bus no voy a buscar el 4x07 en una lista.

**Carmen** (hilo 3):
Les voy a llevar un poco la contraria, con respeto. Leo «temporadas desplegables, checks por episodio, barras, calendario, estadísticas, importar de Trakt»... y me agobio. Yo entré porque la app es sencilla y bonita. Si se llena de casillas, la dejo.
> Para una serie de seis temporadas, «Viendo» no me dice nada.

A mí «Viendo» me dice justo lo que necesito.

**Diego** (hilo 3):
Lo entiendo, Carmen, pero no son excluyentes. TV Time lo resuelve escondiéndolo: si no tocas los episodios, no los ves. Lo que no puede ser es que yo, con 200 títulos, tenga que entrar en cada ficha para cambiar un estado.

**Carmen** (hilo 3):
Si va escondido y no me aparece por defecto, no me opongo. Pero que la primera pantalla siga respondiendo a «qué veo hoy y dónde».

**Iván** (hilo 3):
Mi parte de tech lead escéptico: lo de los episodios es la feature más cara de la lista. Hay que modelar la tabla de episodios vistos, sincronizar temporadas de TMDB y hacer un calendario sin cron ni push. Para un portfolio, prefiero ver tres cosas bien acabadas a una mitad de Trakt. No voto en contra, pero tampoco la pondría la primera.

**Diego** (hilo 3):
Discrepo en parte. Lo que diferencia un portfolio no es otro catálogo de TMDB, sino un modelo de datos con algo de chicha. El seguimiento por episodios demuestra más que una tarjeta con `<Link>`.

**Iván** (hilo 3):
Ese argumento lo acepto. Que se haga después de los tests, para que la migración tenga red de seguridad.

**Lucía** (hilo 3):
Y yo propongo un puente entre Diego y yo: un **diario de visionado** con fecha sirve para los revisionados de películas y, más adelante, para los episodios. Una sola tabla de «visto el X» en lugar de dos inventos.

**Diego** (hilo 3):
Me gusta mucho. Con eso además salen solas las estadísticas: horas vistas, géneros por mes, resumen anual. +1.

**Lucía** (hilo 3):
Y el resumen anual lo diseño yo para Instagram. Es lo único que haría que mis amigas descubrieran la app.

**Marcos** (hilo 3):
Oye, una cosa que yo pedía, «Similares» en la ficha: ¿alguien sabe si es muy difícil?

**Iván** (hilo 3):
He mirado el repo y casi me río. `tmdbDetails.ts` ya pide `similar` en el `append_to_response` de cada ficha: los datos llegan y no se pintan. Es pura interfaz, sin coste extra de API ni de peticiones. Lo subo a prioridad alta precisamente por eso.

**Marcos** (hilo 3):
Jajaja, lo tienen en la nevera y no lo sacan. +1.

**Diego** (hilo 3):
Carmen, otra cosa que creo que no viste: en Categorías, debajo, hay un bloque «¿No sabes qué ver ahora mismo?» que te propone una película y una serie al azar.

**Carmen** (hilo 3):
¡No lo había visto! Y es justo lo que pedía en mi reseña. Pero claro, si me propone algo que solo está en Filmin y en casa tenemos Netflix, no me sirve.

**Diego** (hilo 3):
Pues ahí está la combinación: **«¿Qué veo esta noche?» filtrado por mis plataformas**. Ya existe el botón aleatorio, `weekendService` ya filtra por tipo de monetización y la ficha ya sabe los proveedores. Falta guardar «mis plataformas» en el perfil y cruzarlo todo. Yo también lo quiero: solo me interesa lo que puedo ver con lo que ya pago.

**Carmen** (hilo 3):
Eso sí que lo usaría todos los días. Y que salga el logo en cada cartel del FINDE EN CASA, que es donde miro primero.

**Iván** (hilo 3):
Cuidado con el logo en cada cartel: si son llamadas de proveedores por tarjeta, en la portada salen decenas de peticiones a TMDB. Habría que traerlo ya en la llamada de descubrimiento del servidor, o se come el presupuesto de peticiones. Apoyo la idea con esa condición.

**Lucía** (hilo 3):
Mira, por fin una prioridad tuya que me gusta: que la feature bonita no salga cara.

---

## Cola del hilo: cosas rápidas

**Marcos**:
Login con Google, por favor. Rellenar formularios en el móvil me mata.

**Iván**:
Lo entiendo, pero antes que eso pondría rate limit en el login, que hoy no tiene. El proveedor OAuth es fácil; el agujero de fuerza bruta se queda igual.

**Carmen**:
Yo con el Google me apaño mejor que inventándome «carmen58». Pero lo primero es que me deje poner «Mª Carmen».

**Sara**:
Y que los campos del registro tengan `<label>` y el error con `role="alert"`, como ya pasa en el login. Además se recupere el foco visible: `TextInput` lo quita con `outline-none` y anula el anillo magenta global.

**Lucía**:
Arreglos de una hora que nos han molestado a los seis: toast en español, registro con tildes, eñes y espacios, placeholder en castellano. Que alguien lo haga ya.

**Diego**:
Y recuperar la contraseña. Si la olvido pierdo la biblioteca entera. Para mí eso es más grave que cualquier estética.

**Iván**:
De acuerdo, aunque requiere envío de correo y ahora mismo ni siquiera hay base de datos funcionando en producción. Es algo para cuando vuelva a estar desplegada.

---

## Votos de la comunidad

| Feature propuesta | Apoyos | Quién |
|---|---|---|
| Tarjetas como enlaces reales, con el título visible en táctil y como nombre accesible | 6/6 | Sara, Iván, Marcos, Carmen, Lucía, Diego |
| Arreglos rápidos: toast en español, registro con tildes, eñes y espacios, labels y foco visible en los formularios | 6/6 | Todos |
| Buscador global en la navbar, que encuentre también actores y directores | 6/6 | Marcos, Carmen, Sara, Lucía, Diego, Iván |
| Búsqueda, filtro y página de Categorías guardados en la URL | 5/6 | Iván, Marcos, Sara, Lucía, Diego |
| No machacar reseñas (precargar la existente) y confirmar antes de borrar | 5/6 | Lucía, Sara, Marcos, Carmen, Iván |
| «¿Qué veo esta noche?» con mis plataformas: botón aleatorio + filtro de plataformas + logo en el cartel | 5/6 | Carmen, Diego, Marcos, Lucía, Iván (con condición de coste) |
| Reseñas visibles sin sesión y nota media Pixela | 4/6 | Lucía, Iván, Marcos, Carmen |
| Mostrar «Similares» en la ficha (los datos ya llegan) | 4/6 | Marcos, Iván, Diego, Carmen |
| Enlace directo al título en la plataforma, separando suscripción de alquiler y compra | 4/6 | Carmen, Marcos, Diego, Lucía |
| Respetar `prefers-reduced-motion` | 4/6 | Sara, Lucía, Carmen, Iván |
| Diario de visionado con fecha, base para revisionados, episodios y estadísticas | 3/6 | Lucía, Diego, Marcos |
| Estadísticas personales y resumen anual compartible | 3/6 | Diego, Lucía, Marcos |
| Seguimiento por episodios y botón «siguiente episodio» (oculto por defecto) | 3/6 | Diego, Marcos, Carmen (si va escondido) |
| Tests de las rutas de API + CI en GitHub Actions | 2/6 | Iván, Diego (como red para migraciones) |
| Rate limit del login en un almacén compartido | 2/6 | Iván, Diego |
| Recuperación de contraseña | 2/6 | Diego, Carmen |
| Login con Google | 2/6 | Marcos, Carmen |
| Calendario de emisiones y avisos de estreno | 2/6 | Diego, Marcos |
| Listas personalizadas y públicas | 1/6 | Lucía |
| Importar el historial de Letterboxd, Trakt o TV Time | 2/6 | Lucía, Diego |