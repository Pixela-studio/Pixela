# Reseñas de los beta testers (simuladas)

## Muy mona por fuera, pero para quien vive de reseñas y listas se queda en escaparate — 2.5★

*Lucía, 34 años, Madrid, diseñadora gráfica y cinéfila; usa Letterboxd a diario, escribe reseñas largas y cuida mucho la estética, las listas y las valoraciones. Exigente y algo sarcástica.*

Entré con ganas, lo confieso. Fondo negro, acento magenta, un carrusel a pantalla completa que da gusto mirar: Pixela tiene pose. Como diseñadora le compro el envoltorio. El problema llega cuando intento usarla como uso Letterboxd, que es todos los días.

Primer intento: registrarme como "Lucía". Error, pero solo después de enviar. Nada de tildes, ni eñes, ni espacios, y encima el campo dice "Username" en inglés en una app que presume de ser española. Empezamos bien.

Luego fui a lo mío, escribir. El modal de reseña está bien resuelto: cinco estrellas con medias estrellas y 2.000 caracteres. Pero viene con tres estrellas puestas por defecto. Si me despisto, mi nota la ha decidido la app. Escribí una reseña larga de una película, con párrafos, volví días después a matizarla desde la ficha, y el modal se abrió vacío. Guardé y la anterior desapareció sin preguntarme. Ni un "ya tenías una reseña, ¿la reemplazas?". Para quien escribe tres párrafos, eso duele.

En mi perfil las reseñas salen cortadas a tres líneas, con los saltos de párrafo aplastados y sin "leer más". Y la fecha sale con el formato del navegador, sin más. El borrado, sin confirmación: un clic en la papelera y adiós.

Lo peor es que mis reseñas no las ve nadie. Si no inicias sesión, la ficha te dice "Inicia sesión para ver y escribir reseñas". No hay perfil público, ni likes, ni nota media de la comunidad. Escribo para el cajón.

Listas: solo hay cuatro estados fijos (Planeado, Viendo, Completado, Abandonado). Ni listas propias, ni orden, ni fechas de visionado, ni diario. Al marcar algo como Viendo me saltó un aviso que decía literalmente "Marcado como WATCHING". Encantador.

La ficha de actor me hizo reír. La filmografía se ordena por nota a secas, así que una rareza con un 10 y cuatro votos va por delante de sus películas importantes. Y casi ningún título se puede pulsar. Parece rota.

En el buscador de Categorías, si recargo o vuelvo atrás pierdo la búsqueda, la página y el género. No puedo compartir un enlace a "terror, página 3". Tampoco puedo buscar por director ni por actor, que es justo como busco yo.

Lo bueno: el "Disponible en" para España me resulta útil (aunque te lleva a la portada de Netflix, no a la película), los trailers y la galería de pósters están bien montados, y la estética tiene personalidad. Pero hoy Pixela es un catálogo bonito con algo de seguimiento. Para quedarme necesito que mis reseñas importen.

**Casos de uso**
- Registrarme con mi nombre real 'Lucía': no pude. El nombre se rechaza por la tilde y el error solo aparece al enviar (regex de app/api/auth/register/route.ts).
- Escribir una reseña larga con párrafos y nota con media estrella: lo conseguí, pero el modal arranca con 3 estrellas por defecto (rating: 6).
- Corregir una reseña que ya había escrito, desde la ficha: el modal se abrió vacío y al guardar sustituyó la anterior sin avisar (upsert).
- Releer mis reseñas en el perfil: salen cortadas a 3 líneas, sin saltos de párrafo y sin 'leer más'. Editar en línea sí funciona.
- Organizar lo que quiero ver y lo que he visto: solo hay 4 estados fijos. El toast mostró 'Marcado como WATCHING' y desde la biblioteca no se puede reordenar ni cambiar el estado.
- Explorar la filmografía de un actor desde el reparto: está ordenada por nota sin tener en cuenta los votos y la mayoría de títulos no se pueden pulsar.
- Buscar 'películas de Kelly Reichardt' y compartir una búsqueda de género: no se puede buscar por personas y la búsqueda no se guarda en la URL.

**Lo mejor**
- Estética oscura con acento magenta y hero a pantalla completa: tiene personalidad visual.
- El modal de reseña admite medias estrellas y textos de hasta 2.000 caracteres. En la ficha la reseña respeta los saltos de línea (whitespace-pre-line).
- 'Disponible en' con las plataformas de España, más la sección FINDE EN CASA para decidir qué ver.
- Trailers con lista lateral y galería de fondos y pósters con vista ampliada, muy agradecida para alguien que colecciona pósters.
- Estados vacíos bien escritos en la biblioteca, las reseñas y los favoritos.

**Críticas**
- **[alta]** Una reseña nueva sustituye a la anterior sin avisar, y el modal no precarga la que ya existía — _upsert en src/app/api/reviews/route.ts. ReviewModal.tsx arranca siempre con defaultValues { rating: 6, review: '' }_
- **[alta]** Las reseñas no las ve nadie sin sesión, así que no tienen valor social ni sirven de escaparate — _features/media/components/review/ReviewSection.tsx:105 muestra 'Inicia sesión para ver y escribir reseñas.' aunque el servidor ya ha cargado las reseñas_
- **[media]** Nota por defecto de 3 estrellas en el modal: si te despistas, la app ha puntuado por ti — _ReviewModal.tsx: defaultValues rating: 6 // Default: 3 estrellas_
- **[media]** En el perfil las reseñas largas salen cortadas a 3 líneas, sin 'leer más' y sin saltos de párrafo — _features/profile/components/layout/ProfileReviews.tsx:321 usa 'line-clamp-3' sin whitespace-pre-line_
- **[media]** Borrar reseñas, favoritos o entradas de la biblioteca no pide confirmación — _No hay confirm ni modal de confirmación en src/. Sección 7.6 del mapa de producto_
- **[baja]** Toast con el estado en inglés crudo — _features/media/hooks/useLibraryStatus.ts:56 toast.success(`Marcado como ${newStatus}`) // Could map to label if needed_
- **[media]** El registro rechaza tildes, eñes y espacios en el nombre, y el error llega después de enviar; el placeholder dice 'Username' — _regex ^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$ en src/app/api/auth/register/route.ts_
- **[media]** Filmografía del actor ordenada por nota sin tener en cuenta los votos, y casi toda sin enlace — _features/actor/pages/ActorPage.tsx:62 .sort((a,b) => b.vote_average - a.vote_average). filterLinkableCredits según lib/api/tmdbAllowlist.ts_
- **[alta]** Sin listas personalizadas, sin diario ni fechas de visionado, y sin orden en la biblioteca — _LibraryItem en prisma/schema.prisma solo tiene 4 estados. ProfileLibrary.tsx no tiene orden, búsqueda ni fechas_
- **[media]** La búsqueda y los filtros de Categorías no se guardan en la URL: se pierden al recargar o al ir atrás, y no se pueden compartir — _features/categories/*, sin ?q=, ?genre= ni ?page=_
- **[baja]** 'Disponible en' abre la portada genérica de la plataforma, no la película — _features/media/components/platforms/platformUtils.ts_

**Features que pide**
- **Listas personalizadas y públicas, ordenables y con notas por entrada**: Es lo que más uso de Letterboxd ('Neo-noir para domingo', 'Top 2024'). Cuatro estados fijos no son listas.
- **Diario de visionado con fecha, revisionados y su propia reseña**: Veo películas más de una vez y mi opinión cambia. Hoy una reseña nueva borra la anterior.
- **Perfiles públicos, reseñas visibles sin sesión, likes y nota media de la comunidad Pixela**: Sin lectores, escribir aquí no tiene sentido.
- **Importar el CSV de Letterboxd**: No voy a volver a puntuar 1.200 películas a mano. Sin importación no me mudo.
- **Marcar spoilers en las reseñas**: Mis reseñas largas destripan finales y necesito poder ocultarlos.
- **Búsqueda de personas (directores y actores) y filmografía completa ordenable por año**: Busco cine por autor, no por título.
- **Estadísticas personales y resumen anual con buen diseño**: Es el tipo de cosa que compartiría en Instagram, y encaja con la estética de la app.
- **Enlace directo al título en la plataforma, distinguiendo suscripción, alquiler y compra**: Para saber si la tengo incluida o si toca pagar, en un clic.

**¿Seguiría usándola?** Como app principal, no. Me quedo en Letterboxd. Volvería a Pixela de vez en cuando para mirar qué hay en las plataformas en España y la sección FINDE EN CASA, que eso sí lo resuelve con gracia. Me pasaría si llegan listas propias, el diario de visionado, las reseñas públicas y la importación desde Letterboxd.

---

## Muy bonita, pero para seguir series se queda cortísima — 2.5★

*Marcos, 19 años, Sevilla, estudiante. Todo desde el móvil Android en el bus, ve series en maratón, impaciente, odia cargas lentas y formularios. Escribe informal, con jerga.*

A ver, os cuento. La abrí en el bus volviendo de la facu porque buscaba algo tipo TV Time pero en español, y lo primero: la portada entra fuertísimo. El carrusel a pantalla completa, el rosa ese, las tendencias... muy aesthetic, lo reconozco. Pero luego empiezas a usarla de verdad y se te cae un poco.

En las tarjetas de Tendencias en el móvil solo ves el póster. El título, la nota y el botón de guardar aparecen al pasar el ratón por encima, y en el móvil no hay ratón, bro. Toco y me manda directamente a la ficha. O sea, para guardar algo desde la portada no hay manera; tengo que entrar en cada ficha.

Busqué "the bear" y bien, sale bastante rápido. Pero el buscador solo está en Categorías, no arriba del todo como en cualquier app. Y si entro en una serie y le doy atrás, vuelvo a "Todos", página 1, y sin la búsqueda. Me pasó tres veces y casi cierro la app. Una vez escribí rápido con mala cobertura y me salieron los resultados de lo que había escrito a medias.

Lo del registro me tocó un poco: el campo de nombre pone "Username" en inglés y no me dejó usar "Marcos García" con espacio. Me enteré cuando ya le había dado a enviar. Y no hay entrar con Google, todo a mano. Pereza máxima.

La ficha de la serie es lo mejor que tiene: tráiler, reparto, galería y dónde verla. Pero le das a Netflix y te abre la portada de Netflix, no la serie. ¿Para qué? Y lo peor para mí: en una serie solo pone "5 temporadas, 50 episodios" y ya. No puedo marcar por qué episodio voy, que es literalmente lo único que quiero. Hay un "Viendo" y punto. La primera vez que lo cambié me salió el aviso "Marcado como WATCHING", en inglés y en mayúsculas, como si fuera un error.

Escribí una reseña y está chula lo de las medias estrellas, pero ya viene puesta en 3 estrellas por defecto. Luego volví a escribir otra de la misma serie y se cargó la primera sin decirme nada. Y si no estás logueado no puedes leer ninguna reseña, así que de que sirve que haya comunidad.

En el perfil hay un apartado de "Actividad Reciente" que siempre está vacío, aunque había guardado cosas. Y en Mi biblioteca no puedo cambiar nada, tengo que volver a la ficha de cada serie.

Resumen: preciosa y con buena info de cada peli, pero ahora mismo es más una web para curiosear que una app para seguir tus series. Si meten episodios y un buscador de verdad me quedo.

**Casos de uso**
- Guardar series desde la portada en el móvil: no pudo. En las tarjetas de Tendencias el título, la nota y el marcador solo salen al pasar el ratón (opacity-0 group-hover:opacity-100 en TrendingMediaCard.tsx), y al tocar se va a la ficha con router.push.
- Buscar una serie concreta: lo consiguió, pero tuvo que ir a Categorías porque no hay buscador en la navbar. Al volver atrás desde la ficha perdía la búsqueda y la página, porque no se guardan en la URL. Con mala cobertura, el texto escrito durante una carga podía no buscarse (isLoadingRef en useContentLoader.ts).
- Registrarse: lo consiguió al segundo intento. El nombre con espacio fue rechazado por la regex de la API y solo lo vio después de enviar. No hay login social.
- Marcar una serie como Viendo y llevar el seguimiento de episodios: solo pudo hacer la mitad. Hay estado, pero no episodios ni temporadas, y el aviso salió como 'Marcado como WATCHING' (useLibraryStatus.ts).
- Ir a ver una serie a su plataforma desde 'Disponible en': no le sirvió. Abre la portada genérica de la plataforma, no el título (platformUtils.ts).
- Escribir una reseña tras terminar una temporada: la publicó. Al escribir otra del mismo título sustituyó a la anterior sin avisar (upsert en app/api/reviews/route.ts).

**Lo mejor**
- La portada es muy visual y tiene personalidad: el hero a pantalla completa, el acento magenta y las citas de cine.
- La ficha está completa: tráiler de YouTube, reparto con foto, galería y plataformas de España.
- El menú móvil a pantalla completa queda bien y es fácil de tocar.
- Las reseñas con medias estrellas y texto opcional, sin obligar a escribir.
- La búsqueda en tiempo real responde rápido cuando hay buena conexión, con un debounce de 500 ms.

**Críticas**
- **[alta]** En móvil, las tarjetas de Tendencias no muestran título, nota ni botón de favorito porque solo aparecen al pasar el ratón. Al tocar se navega directamente, así que no se puede guardar nada desde la portada. — _src/features/trending/components/content/TrendingMediaCard.tsx: OverlayContent con 'opacity-0 group-hover:opacity-100' y la tarjeta como div onClick={router.push}_
- **[alta]** No se pueden seguir episodios ni temporadas. La ficha de una serie solo muestra los totales. — _MediaMetadata.tsx muestra solo el número de temporadas y episodios; LibraryItem solo tiene 4 estados (prisma/schema.prisma)_
- **[alta]** Categorías no guarda la búsqueda, el filtro ni la página en la URL. Al volver atrás o recargar todo vuelve a 'Todos', página 1. — _features/categories/components/core/CategoriesContainer.tsx (initializeContent → handleMediaTypeChange('all')), sin ?q= ni ?page=_
- **[media]** Solo se puede buscar desde Categorías: no hay buscador en la navbar. — _shared/components/Navbar.tsx y links/navigation.ts no tienen campo de búsqueda_
- **[media]** Si se escribe mientras hay una carga en curso, la nueva búsqueda se descarta y quedan los resultados del texto a medias. Con mala red, como en el bus, pasa más. — _features/categories/hooks/useContentLoader.ts: 'if (isLoadingRef.current) return;' en las funciones de carga_
- **[media]** El aviso de la biblioteca sale con el enum en inglés: 'Marcado como WATCHING'. — _features/media/hooks/useLibraryStatus.ts: toast.success(`Marcado como ${newStatus}`)_
- **[media]** 'Disponible en' abre la portada de la plataforma y no la serie. — _features/media/components/platforms/platformUtils.ts_
- **[media]** Una segunda reseña del mismo título machaca la anterior sin avisar, y el modal no precarga la existente. — _app/api/reviews/route.ts (upsert) y ReviewModal.tsx_
- **[media]** El registro rechaza nombres con espacios o tildes, y el error solo aparece después de enviar. El placeholder 'Username' está en inglés. — _app/api/auth/register/route.ts, regex ^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$_
- **[baja]** Las reseñas no se ven sin sesión, aunque ya se han cargado en el servidor. — _features/media/components/review/ReviewSection.tsx: 'Inicia sesión para ver y escribir reseñas.'_
- **[baja]** 'Actividad Reciente' del perfil siempre está vacía. — _features/profile/components/ProfileClient.tsx, texto fijo 'No hay actividad reciente para mostrar.'_
- **[baja]** Desde la biblioteca del perfil no se puede cambiar el estado de un título ni quitarlo. — _features/profile/components/layout/ProfileLibrary.tsx: 'Cambia el estado de un título desde su ficha'_

**Features que pide**
- **Seguimiento por episodios y botón de 'siguiente episodio'**: Es lo que uso a diario cuando hago maratones. Sin esto me quedo con TV Time.
- **Buscador global siempre visible en la barra de arriba**: En el bus quiero buscar en dos toques, sin pasar por Categorías.
- **Acciones rápidas en las tarjetas para móvil, como mantener pulsado o un botón visible para guardar**: El hover no existe en una pantalla táctil.
- **Login con Google**: Odio rellenar formularios desde el móvil.
- **Calendario de nuevos episodios con avisos push**: Para enterarme de cuándo sale el siguiente capítulo de lo que estoy viendo.
- **Enlace directo a la serie en Netflix, HBO, etc.**: Para pasar de la ficha a verla sin buscarla otra vez.
- **Que la app recuerde la búsqueda y la página al volver atrás**: Cada vez que vuelvo de una ficha empiezo de cero.
- **Mostrar 'Similares' en la ficha**: Al acabar una serie quiero la siguiente sin pensar.

**¿Seguiría usándola?** Para cotillear fichas y tráilers, sí, de vez en cuando. Para llevar mis series, no: sin seguimiento de episodios, sin buscador a mano y con las tarjetas que no responden bien en el móvil, sigo con TV Time. Si añaden episodios y el buscador global, le doy otra oportunidad.

---

## Muy bonita, pero para saber dónde ver algo tengo que entrar película por película — 3★

*Carmen, 58 años, Valladolid, profesora jubilada, poco tecnológica. Usa la tablet del salón y a veces el portátil. Quiere saber qué ver esta noche y en qué plataforma está. Se pierde con iconos sin texto.*

Mi hija me dijo que probara Pixela porque yo siempre le pregunto "¿y esto en qué canal lo echan?". Así que voy a ser franca, que para eso me han pedido opinión.

Lo primero que te encuentras es precioso, eso no se lo quita nadie. Fotos grandes, mucho negro y ese rosa fuerte que llama la atención. Lo que me interesaba era el apartado "FINDE EN CASA", porque el nombre es justo lo que yo busco: algo para ver esta noche en casa. Pero ahí solo hay carteles. No pone en ningún sitio si la película está en Netflix, en Movistar o en Filmin. Para saberlo tengo que entrar en cada una, bajar hasta "Disponible en", volver atrás y empezar con la siguiente. Una noche lo hice con cinco películas y se me fue la mitad del rato de ver la tele.

En la tablet me pasa otra cosa. Debajo de los carteles no sale el título ni la nota. Mi hija me explicó que eso aparece "al pasar el ratón por encima", pero en la tablet no hay ratón. Toco el cartel y ya me lleva a la ficha, así que muchas veces no sé ni qué estoy abriendo hasta que entro.

Las fichas, en cambio, me gustan. Salen la sinopsis, el director, los actores con su foto y el tráiler sin tener que irte a YouTube. Cuando le di al recuadro de Netflix pensé que me abriría la película, pero me llevó a la página principal de Netflix y tuve que buscarla otra vez. Tampoco sé si una plataforma la incluye en lo que ya pago o si es de alquiler, porque salen todas juntas, como si fueran lo mismo.

Con los iconos me lío. Arriba hay un muñequito que resulta ser "iniciar sesión". En la ficha hay un marcador y un lápiz, y hasta que no pulsé no supe que el lápiz era para escribir una opinión. Encima, en mi perfil los favoritos salen con un corazón. ¿Es lo mismo o no? Y ya registrada, al marcar una serie como "Viendo", me salió un aviso que decía "Marcado como WATCHING". En inglés, oiga.

Por cierto, al registrarme puse "Mª Carmen" y me dio error después de rellenarlo todo. Tampoco me dejaba "Carmen García". Al final puse "carmen58", que no me gusta nada.

Para buscar, que es lo que más haría, hay que ir a "Categorías". No lo habría encontrado si no me lo dicen. Y no puedo decirle "enséñame solo lo que hay en Netflix", que es lo único que pagamos en casa.

En resumen: muy bonita, pero ahora mismo me sirve más para cotillear fichas que para decidir qué ver esta noche. Si en cada cartel pusieran la plataforma y me dejaran elegir las mías, la usaría todos los días.

**Casos de uso**
- Decidir qué ver esta noche desde 'FINDE EN CASA' en la portada: vi los carteles, pero no la plataforma de cada título. Tuve que entrar ficha por ficha. Lo conseguí a medias y con mucho esfuerzo.
- Ver en qué plataforma está una película concreta: en la ficha, la sección 'Disponible en' sí lo dice. Al pulsar Netflix me abrió la portada de Netflix, no la película, y no distingue lo incluido en la suscripción del alquiler o la compra.
- Buscar un título que me recomendaron: no hay buscador arriba. Tuve que descubrir que estaba dentro de 'Categorías'. Una vez allí lo encontré, pero buscando por nombre de actor no sale nada.
- Navegar desde la tablet: los títulos y las notas de los carteles no aparecen porque dependen de pasar el ratón por encima. Toco a ciegas y me lleva a la ficha.
- Registrarme con mi nombre ('Mª Carmen', 'Carmen García'): me lo rechazó después de enviar el formulario. Tuve que inventarme un nombre sin tildes ni espacios.
- Apuntar una serie como 'Viendo': funcionó, pero el aviso salió en inglés ('Marcado como WATCHING'). Y no entendí la diferencia entre el marcador de favorito y 'Añadir a mi lista'.

**Lo mejor**
- La ficha de cada película está muy completa y es clara: sinopsis, director con foto, reparto y tráiler dentro de la misma página.
- La sección 'Disponible en' usa plataformas de España, que es justo lo que necesito, con su logo y su nombre escritos.
- El nombre 'FINDE EN CASA' y 'TOP CARTELERA' se entienden a la primera, en mi idioma y sin tecnicismos.
- El menú del móvil o la tablet tiene las palabras bien grandes, con texto y no solo dibujitos.
- Es muy bonita y cuidada a la vista: da gusto entrar.

**Críticas**
- **[alta]** En 'FINDE EN CASA', las tendencias y la cartelera, los carteles no dicen en qué plataforma está cada título. Para saberlo hay que entrar ficha por ficha. — _features/weekend/components/WeekendHeader.tsx pinta TrendingMediaCard con póster, nota y año, sin proveedores. Los tipos WeekendMovie y WeekendSerie no incluyen plataformas, aunque weekendService.ts ya filtra con with_watch_monetization_types._
- **[alta]** En la tablet y el móvil no se ven el título ni la nota de los carteles, porque solo aparecen al pasar el ratón por encima. — _features/trending/components/content/TrendingMediaCard.tsx: OverlayContent usa 'opacity-0 group-hover:opacity-100'. En una pantalla táctil, al tocar se ejecuta directamente router.push a la ficha._
- **[media]** Al pulsar una plataforma en 'Disponible en' se abre la página principal de esa plataforma, no la película. Si la plataforma no está en la lista, se inventa una dirección que puede no existir. — _features/media/components/platforms/platformUtils.ts: PLATFORM_URLS solo guarda la portada de cada plataforma, y el último recurso construye `https://www.${normalizedName}.com`._
- **[media]** No se distingue si el título está incluido en la suscripción o hay que alquilarlo o comprarlo. — _features/media/components/platforms/StreamingProviders.tsx pinta una única lista de PlatformCard, sin agrupar por suscripción, alquiler o compra._
- **[media]** Hay iconos sin texto (el muñequito de iniciar sesión, el marcador, el lápiz) y además el favorito cambia de icono según la pantalla. — _shared/components/Navbar.tsx: un FiUser con aria-label 'Iniciar sesión' y ninguna etiqueta visible. features/media/components/hero/actions/ActionButtons.tsx: FaBookmark y FaPen sin texto. En el perfil, useProfileStats.ts usa FiHeart._
- **[media]** Al registrarse, el nombre no admite tildes, la ñ, 'Mª' ni espacios, y el error solo aparece después de enviar el formulario. — _app/api/auth/register/route.ts valida el nombre con ^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$, y el placeholder del campo es 'Username', en inglés._
- **[baja]** Al cambiar el estado de un título sale un aviso en inglés ('Marcado como WATCHING'). — _features/media/hooks/useLibraryStatus.ts usa toast.success(`Marcado como ${newStatus}`) con el valor interno del estado, sin traducirlo._
- **[media]** El buscador está escondido dentro de 'Categorías' y no encuentra actores. — _La navbar (links/navigation.ts) no tiene buscador. La búsqueda de /categories solo llama a /api/movies/search y /api/series/search._
- **[baja]** Pulsar en una plataforma con el teclado no hace nada (lo cuento porque mi hija lo probó con el tabulador). — _features/media/components/platforms/PlatformCard.tsx tiene role='button' y tabIndex=0, pero solo onClick, sin onKeyDown._

**Features que pide**
- **Elegir mis plataformas (por ejemplo, solo Netflix y RTVE) y ver solo lo que hay en ellas**: Es la pregunta que me hago cada noche. Ahora tengo que mirar título por título.
- **Logo de la plataforma visible en cada cartel de la portada**: Así sabría de un vistazo dónde está cada cosa sin entrar en todas las fichas.
- **Que el botón de la plataforma abra directamente la película o serie**: Si no, tengo que volver a buscarla dentro de Netflix y me pierdo.
- **Separar 'Incluido en tu suscripción' de 'Alquiler o compra', con precio**: No quiero pagar sin darme cuenta por algo que creía incluido.
- **Buscador visible arriba en todas las páginas, que también encuentre actores**: Muchas veces me acuerdo del actor y no del título.
- **Título y nota siempre visibles bajo cada cartel, y etiquetas de texto junto a los iconos**: En la tablet no hay ratón y los dibujitos solos no me dicen qué hacen.
- **Un botón '¿Qué veo esta noche?' que proponga dos o tres opciones de mis plataformas, con duración**: Es justo para lo que vine a la aplicación.

**¿Seguiría usándola?** Para mirar fichas y tráileres, sí, de vez en cuando. Para decidir qué ver esta noche, de momento no: tardo menos preguntándole a mi hija o mirando directamente en Netflix. Si pusieran la plataforma en cada cartel y me dejaran elegir las mías, me quedaría.

---

## Backend más sólido de lo habitual, pero el front todavía tiene cosas de proyecto de clase — 3.5★

*Iván, 38 años, tech lead que revisa portfolios para contratar juniors. Abre DevTools, mira rendimiento, SEO, accesibilidad, seguridad, manejo de errores y calidad del código.*

Reviso unos veinte portfolios al mes y casi todos son un clon de Netflix con la API de TMDB. Pixela también lo es, pero cuando abrí el repo me llevé una sorpresa, y no fue mala.

Lo bueno primero. Las cabeceras de seguridad están puestas en `proxy.ts`: CSP, HSTS, frame-ancestors y nosniff. Eso no lo veo casi nunca en un junior. En las rutas de API hay validación con zod, guards `requireUser`/`requireAdmin` centralizados, bcrypt con coste 12, el P2002 controlado cuando dos registros llegan a la vez y un límite de tamaño para el avatar en base64. Las fichas usan ISR con `generateStaticParams` y el loader de imágenes va directo a la CDN de TMDB, y los comentarios explican el porqué de cada decisión (coste en Vercel, rastreadores). Eso es criterio, no un tutorial copiado.

Ahora lo que me hizo bajar la nota. Le pasé el tabulador a la portada y no llegué a ninguna tarjeta: son `div onClick` con `router.push`. No se pueden abrir en otra pestaña con clic central y, desde el punto de vista del SEO, el rastreador no ve enlaces a las fichas. `PlatformCard` tiene `role="button"` y `tabIndex=0`, pero Enter no hace nada. Un ARIA a medias es peor que no ponerlo.

Con la sesión iniciada, en la pestaña Network vi una ráfaga de llamadas a `/api/favorites/details`. Hay una caché de 30 s, pero no deduplica las peticiones en vuelo: al montar, todas las tarjetas fallan la caché a la vez y cada petición vuelve a enriquecer los datos con TMDB. Para eso existe SWR o React Query, o al menos una promesa compartida.

El login no tiene rate limit (solo lo tienen el registro y las reseñas), y el limitador guarda los contadores en memoria. El propio comentario reconoce que en serverless no se comparte entre instancias. Que lo documente está bien; que el endpoint más atacable sea el que no tiene límite, no tanto. Tampoco hay `error.tsx`: cualquier excepción en tiempo de ejecución muestra la pantalla por defecto de Next.

Lo que más me pesa como revisor: no hay ni un test ni CI. El README dice "Next.js 15" en un párrafo y "Next.js 16" en el siguiente, y presume de "búsqueda avanzada" y de una "comunidad activa de reseñas" cuando las reseñas no se ven sin iniciar sesión. Si te contrato, quiero que lo que vendes coincida con lo que hay.

Además, en la URL de `/categories` no se guarda nada: si recargo vuelvo a la página 1 y a "Todos". Es lo primero que pruebo en cualquier listado.

¿Le haría una entrevista? Sí. Hay criterio de backend y de costes por encima de la media. Pero antes le pediría tres cosas: tarjetas con `<Link>`, tests de las rutas de API con un pipeline en GitHub Actions, y un README honesto.

**Casos de uso**
- Navegar la portada solo con teclado: no pude, porque las tarjetas de Tendencias son div onClick sin foco (TrendingMediaCard.tsx:95) y el tabulador se las salta.
- Clic central en una tarjeta para abrirla en otra pestaña: no funciona, porque son router.push y no <Link>.
- Revisar en Network la portada con sesión: varias peticiones paralelas a /api/favorites/details, porque la caché de 30 s de favorites.ts no deduplica las que están en vuelo.
- Auditar la seguridad: encontré una CSP completa, HSTS y X-Frame-Options en src/proxy.ts, y guards centralizados en lib/api/guards.ts. Correcto, aunque con 'unsafe-eval' en script-src.
- Comprobar la fuerza bruta en el login: el authorize de auth.ts no tiene rate limit; enforceRateLimit solo se aplica en register, reviews y tmdbProxy.
- Filtrar en /categories, recargar y compartir la URL: se pierden la página y el filtro, porque no hay estado en la URL.
- Buscar tests y CI en el repo: no hay ningún .test ni .spec, ni workflows de GitHub.

**Lo mejor**
- Cabeceras de seguridad reales en src/proxy.ts (CSP, HSTS, frame-ancestors 'none', Permissions-Policy).
- Rutas de API con zod, guards centralizados (requireUser/requireAdmin), control de P2002 y validación del esquema de las imágenes (bloquea javascript: y http:).
- Fichas con ISR, generateStaticParams sobre la allowlist y loader de imágenes que salta /_next/image: está pensado para los costes de despliegue.
- Comentarios que explican el porqué de cada decisión, no el qué.
- El 404 está bien resuelto y la caída de la base de datos no rompe las fichas (getMediaReviewsSafe).

**Críticas**
- **[alta]** Las tarjetas de contenido no son enlaces: no se puede llegar a ellas con el teclado, no se abren en otra pestaña y los rastreadores no ven enlaces internos a las fichas. — _src/features/trending/components/content/TrendingMediaCard.tsx:95 `<div className={STYLES.card} onClick={handleCardClick}>` con router.push_
- **[alta]** No hay ni un test ni CI. Para un portfolio que quiere demostrar nivel, es lo primero que miro. — _No existe ningún *.test.* ni *.spec.* en el repo; package.json no tiene script de test; no hay carpeta .github/workflows_
- **[media]** El login no tiene rate limit y el limitador existente guarda los contadores en memoria por proceso. — _src/auth.ts authorize no llama a enforceRateLimit; src/lib/api/rateLimit.ts usa un Map en memoria (lo reconoce su propio comentario)_
- **[media]** Ráfaga de peticiones de favoritos al montar la rejilla: la caché no deduplica las peticiones en vuelo y cada una vuelve a enriquecer los datos con TMDB. — _src/api/favorites/favorites.ts (caché de 30 s sin promesa compartida) + src/hooks/useFavoriteToggle.ts llamado por cada tarjeta + api/favorites/details/route.ts con enrichWithTmdb_
- **[media]** role=button sin manejador de teclado: Enter no hace nada sobre una plataforma con el foco puesto. — _features/media/components/platforms/PlatformCard.tsx (div role="button" tabIndex=0 sin onKeyDown)_
- **[media]** No hay error boundary: un error en tiempo de ejecución muestra la pantalla por defecto de Next. — _No existen app/error.tsx ni app/global-error.tsx; en app/errors solo están not-found y error-403_
- **[media]** README incoherente y con afirmaciones que el producto no cumple. — _README.md dice 'Next.js 15' y 'Next.js 16' en párrafos seguidos; promete 'búsqueda avanzada' y 'comunidad activa de reseñas', pero las reseñas se ocultan a los anónimos (ReviewSection.tsx)_
- **[media]** Los listados no guardan el estado en la URL: ni se comparten ni sobreviven a una recarga o al botón Atrás. — _features/categories (store zustand, sin ?q= ni ?page=); CategoriesContainer fuerza 'all' al montar_
- **[baja]** Validaciones de contraseña incoherentes entre capas. — _auth.ts CREDENTIALS_SCHEMA min(6), register/route.ts min(8), formulario de perfil exige mayúscula, número y símbolo_
- **[baja]** La CSP incluye 'unsafe-eval' y 'unsafe-inline' en script-src, lo que le resta buena parte del valor. — _src/proxy.ts CSP_DIRECTIVES_

**Features que pide**
- **Tests de las rutas de API (auth, reviews, favorites) y un pipeline en GitHub Actions con lint, typecheck y tests**: Es la señal más rápida de que el candidato trabaja como en un equipo real.
- **Tarjetas con <Link> de Next y foco visible**: Arregla de golpe la accesibilidad, el SEO interno, el clic central y el prefetch.
- **Estado de búsqueda, filtro y página en la URL de /categories**: Permite compartir, recargar y usar el botón Atrás; en cualquier listado lo pruebo lo primero.
- **Una capa de datos en el cliente (SWR/React Query) o un contexto de favoritos con una sola petición**: Elimina las peticiones duplicadas y el retraso del marcador en las tarjetas.
- **Rate limit en el login, guardado en un almacén compartido (Upstash/Redis)**: Es el endpoint más expuesto y ahora mismo es el único sin protección.
- **Páginas error.tsx con reintento**: Muestran que el candidato piensa en cómo falla la app, no solo en el caso feliz.
- **Reseñas visibles para anónimos y una nota media de Pixela**: Convierte el contenido de la comunidad en escaparate y en SEO, y hace verdad lo que promete el README.

**¿Seguiría usándola?** Como usuario de catálogo, no: para eso uso JustWatch o Letterboxd. Como revisor, el candidato pasaría a la entrevista técnica. El backend y el trabajo de costes están por encima de lo habitual en un junior. Si en la siguiente versión veo tests, CI, enlaces de verdad en las tarjetas y un README honesto, lo pondría en la parte alta de la lista.

---

## Bonita a la vista, pero con el teclado me quedo en la puerta — 2★

*Sara, 27 años, Barcelona. Baja visión, usa NVDA con Firefox, zoom al 200% y navega solo con teclado. Se fija mucho en el contraste, el foco visible y las etiquetas.*

Probé Pixela porque una amiga me la enseñó en su móvil y se veía preciosa. Yo la uso con NVDA, el zoom al 200% y solo teclado. Para mí la experiencia es otra.

Empiezo por lo bueno, que lo hay. El carrusel de la portada tiene botón de pausa, y lo agradezco muchísimo, porque las imágenes que se mueven solas me marean. En el login, cuando me equivoqué de contraseña, NVDA me leyó el error al momento. También hay un botón para mostrar la contraseña con su nombre bien puesto. En la ficha de una película, el botón "Añadir a mi lista" me anuncia que abre un menú y si está abierto, y lo puedo cerrar con Escape. Se nota que alguien se ha puesto con esto.

Ahora, lo que me hizo cerrar la pestaña. En Tendencias y en Categorías voy tabulando y lo único que NVDA me lee es "Añadir a favoritos, botón", quince veces seguidas, sin decirme de qué película. Al póster no llego: no hay manera de entrar en la ficha con el teclado. Tuve que buscar el título en Categorías, y tampoco pude abrir el resultado. La única forma de llegar a una ficha fue por un enlace del pie de página. No exagero: el corazón de la app no se puede usar con teclado.

En el registro, los campos no tienen etiqueta, solo el texto gris que hay dentro. Al escribir desaparece y ya no sé en qué campo estoy. Uno dice "Username", en inglés. Puse "Sara Núñez" y me lo rechazó después de enviar. Además, el mensaje de error no se anuncia, cosa que en el login sí pasa. Tampoco veo bien dónde está el foco: en esos campos la línea de foco está quitada y solo cambia un poco el borde gris.

Cuando conseguí escribir una reseña, las estrellas se leen como "Puntuar con 3,5 estrellas", pero no sé cuál está marcada hasta que encuentro el texto "3/5". El tabulador se me escapa del diálogo y acabo detrás, en la página. En mi reseña ya publicada, los botones de editar y borrar se leen solo como "botón". Pulsé uno sin saber cuál era y me borró la reseña sin preguntar.

Las pestañas del perfil y los contadores de favoritos tampoco funcionan bien con teclado. El "¿Olvidaste tu contraseña?" está en gris oscuro sobre negro y casi no lo distingo, aunque tampoco hace nada.

Le doy un 2 porque se ve que hay voluntad y algunas piezas están bien hechas. Pero para mí ahora mismo no es una app usable.

**Casos de uso**
- Entrar desde la portada a la ficha de una película de Tendencias usando solo el tabulador. No pude: la tarjeta es un div con onClick y el foco solo cae en el botón de favorito, que dice 'Añadir a favoritos' sin el título.
- Buscar 'Dune' en Categorías y abrir el resultado. Pude escribir en el buscador, aunque NVDA no lo anuncia con una etiqueta propia, solo con el placeholder. No pude abrir la tarjeta del resultado con Enter.
- Crear una cuenta con el nombre 'Sara Núñez'. Conseguí rellenar el formulario a ciegas, porque los campos solo tienen placeholder. El nombre se rechazó después de enviar y el error no se anunció.
- Iniciar sesión. Funcionó: el error se anuncia con role=alert y el botón de mostrar contraseña tiene aria-label.
- Escribir una reseña con estrellas desde el teclado. La guardé, pero las estrellas no anuncian cuál está seleccionada, el foco se escapa del modal y luego borré la reseña sin querer, porque los iconos no tienen nombre accesible y no hay confirmación.
- Marcar una película como 'Viendo' desde la ficha. Pude abrir el menú y elegir, pero las flechas no navegan entre opciones y el aviso dijo 'Marcado como WATCHING'.

**Lo mejor**
- El carrusel del hero tiene botón Pausar/Reproducir con aria-label, y los puntos tienen 'Ir a imagen N' (features/hero/components/ui/ProgressIndicator.tsx).
- El login anuncia los errores con role=alert y el aviso 'Cuenta creada' con role=status (app/(auth)/login/page.tsx).
- TextInput incluye un botón para mostrar u ocultar la contraseña con aria-label correcto.
- El menú de biblioteca tiene aria-haspopup, aria-expanded, role=menuitemradio con aria-checked y se cierra con Escape (features/media/components/actions/LibraryButton.tsx).
- El html tiene lang='es' y hay un anillo global :focus-visible magenta en globals.css.
- La paginación de Categorías tiene etiquetas claras: 'Página anterior', 'Ir a página N' y 'Página siguiente'.

**Críticas**
- **[bloqueante]** No se puede abrir ninguna película o serie desde las tarjetas con teclado ni con lector de pantalla: no son enlaces ni tienen foco. — _features/trending/components/content/TrendingMediaCard.tsx: <div className={STYLES.card} onClick={handleCardClick}> con router.push. Pasa lo mismo en features/categories/components/core/CategoriesContent.tsx, líneas 308 y 602._
- **[alta]** El botón de favorito de cada tarjeta se anuncia como 'Añadir a favoritos' sin decir el título, así que tabular por Tendencias es una lista de botones idénticos. — _shared/components/ActionButtons.tsx: const label = isFavorited ? 'Quitar de favoritos' : 'Añadir a favoritos'. El aria-label no incluye el título._
- **[alta]** Los campos de login y registro no tienen etiqueta, solo placeholder, que desaparece al escribir y tiene muy poco contraste (placeholder-gray-500/50). — _app/(auth)/register/page.tsx y login/page.tsx: TextInput solo con placeholder='Email', 'Contraseña' o 'Username', sin <label> ni aria-label._
- **[alta]** El foco visible está anulado en campos de texto clave: login y registro, buscador de Categorías y textarea de reseña. — _features/auth/components/TextInput.tsx: 'outline-none focus:outline-none focus:ring-0'. Lo mismo en CategoriesContent.tsx (searchInput 'focus:outline-none') y ReviewModal.tsx (textarea). Esas clases sobrescriben el :focus-visible global de app/globals.css._
- **[alta]** Los botones de editar y borrar reseña no tienen nombre accesible y el borrado es inmediato, sin confirmación. — _features/media/components/review/ReviewCard.tsx, líneas 100-118: botones con solo title='Editar reseña' o 'Eliminar reseña' y un icono sin texto. onDelete se ejecuta directamente._
- **[media]** El modal de reseña no atrapa el foco, y el estado de las estrellas no se anuncia: son botones invisibles superpuestos sin aria-pressed ni radiogroup. — _features/media/components/review/ReviewModal.tsx: role='dialog' aria-modal pero sin focus trap. Los botones de estrella con aria-label='Puntuar con N estrellas' no tienen estado seleccionado. Los <label> de Puntuación y Reseña no tienen htmlFor._
- **[media]** El error de registro no se anuncia al lector de pantalla, al contrario que en el login. — _app/(auth)/register/page.tsx: {error && <div className='text-[#ec1b69] ...'>} sin role='alert'._
- **[media]** No se respeta prefers-reduced-motion en ningún sitio: tarjetas con fade-in escalonado, partículas en el footer, marquesinas de Descubre y escalados al pasar el ratón. — _grep de 'reduced-motion' o 'motion-reduce' en src/: solo aparece en hooks/README.md. CategoriesContent.tsx usa 'opacity-0 animate-fade-in-up' con animationDelay en cada tarjeta._
- **[media]** El menú de estado de biblioteca no mueve el foco al abrirse ni permite usar las flechas, aunque se declara como role='menu'. — _features/media/components/actions/LibraryButton.tsx: solo maneja Escape en keydown. No hay ArrowUp ni ArrowDown, ni foco al primer menuitemradio._
- **[media]** Las tarjetas de 'Disponible en' dicen ser botones pero Enter no hace nada. — _features/media/components/platforms/PlatformCard.tsx: div role='button' tabIndex={0} con onClick y sin onKeyDown._
- **[media]** Las pestañas del perfil y las tarjetas de estadísticas clicables no tienen semántica de pestañas ni de botón. — _features/profile/components/ProfileClient.tsx, línea 222: botones sin role=tab ni aria-selected. features/profile/components/layout/ProfileStatsBar.tsx, línea 47: div con onClick._
- **[baja]** El aviso de cambio de estado lee el valor interno en inglés. — _features/media/hooks/useLibraryStatus.ts, línea 56: toast.success(`Marcado como ${newStatus}`) muestra 'Marcado como WATCHING'._
- **[baja]** '¿Olvidaste tu contraseña?' en gris muy oscuro sobre fondo casi negro: contraste muy bajo. Además, con el teclado no se puede llegar al motivo de que esté deshabilitado. — _app/(auth)/login/page.tsx: span con 'text-gray-600' sobre #0F0F0F y title='Disponible próximamente', que no es accesible con teclado._

**Features que pide**
- **Tarjetas de película y serie como enlaces reales (<a>) con el título como nombre accesible**: Es lo mínimo para que una persona con teclado o lector de pantalla pueda entrar en una ficha, y de paso permite abrir en otra pestaña.
- **Enlace 'Saltar al contenido' y encabezados bien jerarquizados por sección**: Con NVDA navego por encabezados. Tener que pasar por la navbar y el carrusel en cada página es agotador.
- **Respetar prefers-reduced-motion: apagar autoplay del hero, partículas, marquesinas y fade-ins**: Con baja visión y zoom alto, el movimiento constante me desorienta y me cansa la vista.
- **Modo de alto contraste o modo claro**: El gris sobre negro y los textos con opacidad reducida se me pierden incluso al 200%.
- **Confirmación accesible antes de borrar reseñas, favoritos o entradas de la biblioteca**: Con lector de pantalla es fácil pulsar el botón equivocado, y ahora no hay vuelta atrás.
- **Buscador global en la navbar, con resultados anunciados (aria-live: 'N resultados')**: Ahora solo hay búsqueda en Categorías y no me entero de cuándo han cargado los resultados ni de cuántos hay.
- **Filtros y página reflejados en la URL**: Si me pierdo con el teclado y vuelvo atrás, pierdo la búsqueda y tengo que empezar de cero.

**¿Seguiría usándola?** De momento no. Si arreglan las tarjetas para que sean enlaces, ponen etiquetas en los formularios y devuelven el foco visible, volvería a probarla, porque el catálogo y lo de "dónde verla en España" me interesan de verdad.

---

## Muy bonita para descubrir, pero no sirve para seguir series — 2★

*Diego, 42 años, Bilbao. Power user de series, usa TV Time y Trakt a diario, analítico, quiere estadísticas, recordatorios de estrenos y seguimiento por episodio.*

Llevo años con TV Time y Trakt, así que entré en Pixela buscando una cosa concreta: si me podía llevar mi seguimiento de series a algo en castellano y con mejor pinta. La pinta la tiene. La portada es espectacular, el "Finde en casa" con lo que hay en las plataformas españolas me parece una idea muy buena, y la ficha de una serie con tráilers, galería y reparto está bien montada.

El problema llega cuando intento hacer lo que hago cada noche. Abro la ficha de una serie que estoy viendo y lo único que encuentro es "3 temporadas · 24 episodios". No puedo entrar en las temporadas, no puedo marcar el episodio 5 como visto y no sé cuándo sale el siguiente. Tampoco me dice si la serie sigue en emisión o ya terminó, que es lo primero que miro. Para seguir una serie tengo un desplegable con cuatro estados: Planeado, Viendo, Completado y Abandonado. Eso me sirve para películas. Para una serie de seis temporadas, "Viendo" no me dice nada.

Cuando cambié una serie de Planeado a Viendo me salió un aviso que ponía "Marcado como WATCHING", en inglés y en mayúsculas. Es un detalle pequeño, pero da sensación de cosa a medio terminar.

Fui al perfil a ver mis estadísticas y encontré tres números: favoritos, reseñas y un "nivel". La biblioteca ni siquiera cuenta. No hay horas vistas, ni géneros, ni resumen del año. "Actividad reciente" sale siempre vacía. En la biblioteca no puedo ordenar por fecha, buscar ni separar películas de series, y para cambiar el estado de algo tengo que volver a abrir su ficha. Con 200 títulos eso no se puede usar.

Busqué cómo importar mi historial de Trakt y no existe. Tampoco hay ningún tipo de aviso, ni por email ni push, así que de recordatorios de estrenos nada. No hay calendario ni sección de "próximamente". Otra cosa: el buscador solo está dentro de Categorías y si recargo la página vuelvo a la página 1 sin filtros.

Lo de "Disponible en" me ilusionó, pero el logo de la plataforma me lleva a la portada de Netflix, no a la serie, y no distingue entre lo que entra en la suscripción y lo que hay que alquilar.

Y algo que me preocupa como usuario: no hay forma de recuperar la contraseña. Si la olvido, pierdo la biblioteca.

Como escaparate para descubrir qué ver este finde, le pondría un 4. Como herramienta para seguir series, que es lo que yo busco, todavía no está. Si algún día llegan el seguimiento por episodios, el calendario y la importación de Trakt, vuelvo sin dudarlo.

**Casos de uso**
- Marcar en qué episodio voy de una serie: no pude. La ficha solo muestra totales de temporadas y episodios (MediaMetadata.tsx) y no tiene navegación por temporadas.
- Pasar una serie de Planeado a Viendo: lo conseguí desde el desplegable de la ficha, pero el aviso salió como 'Marcado como WATCHING' (useLibraryStatus.ts:56).
- Ver mis estadísticas de consumo: solo hay Favoritos, Reseñas y Nivel; la biblioteca no cuenta (useProfileStats.ts) y Actividad reciente siempre está vacía.
- Organizar una biblioteca grande: solo se puede filtrar por estado. No se puede ordenar, buscar, separar películas de series ni cambiar el estado desde la propia rejilla (ProfileLibrary.tsx).
- Saber cuándo sale el próximo episodio y recibir un aviso: no existe. No hay calendario, sección de próximos estrenos ni notificaciones.
- Importar mi historial desde Trakt o TV Time: no existe importación ni exportación.
- Ver dónde está disponible una serie: los logos aparecen, pero el enlace lleva a la portada de la plataforma y no distingue suscripción de alquiler (platformUtils.ts).

**Lo mejor**
- La sección 'Finde en casa' muestra lo más popular en streaming en España y separa películas de series: muy útil para decidir qué ver.
- La ficha de cada título es visualmente rica: tráilers de YouTube, galería de fondos y pósters, y reparto con personaje.
- Todo está en castellano y las plataformas son las de España, cosa que Trakt no tiene.
- Los filtros de la biblioteca muestran el recuento de cada estado antes de pulsarlos, y los estados vacíos están bien explicados.
- Los cuatro estados (Planeado, Viendo, Completado, Abandonado) cubren lo básico para películas.

**Críticas**
- **[bloqueante]** No hay seguimiento por temporadas ni por episodios: no se pueden marcar episodios vistos ni ver el progreso de una serie. — _src/features/media/components/hero/metadata/MediaMetadata.tsx solo pinta serie.temporadas y serie.episodios como totales. LibraryItem en prisma/schema.prisma solo guarda status, sin temporada ni episodio._
- **[alta]** No hay calendario de emisiones, próximos episodios ni avisos de estreno. — _No hay ninguna llamada a on_the_air, airing_today ni upcoming en src/. El mapper de series no expone next_episode_to_air ni el estado de emisión. No existe ningún sistema de notificaciones._
- **[alta]** Las estadísticas personales son mínimas y no tienen en cuenta la biblioteca. — _src/features/profile/hooks/useProfileStats.ts solo calcula Favoritos, Reseñas y Nivel. El bloque 'Actividad Reciente' tiene el texto fijo en ProfileClient.tsx._
- **[alta]** No se puede importar el historial de Trakt o TV Time ni exportar datos. — _No hay ninguna ruta de importación o exportación en src/app/api. El mapa de producto lo confirma en la sección 6, apartado Cuenta._
- **[media]** La biblioteca no se puede gestionar a escala: no permite ordenar, buscar, separar películas de series ni cambiar el estado desde ella, y no muestra fechas aunque la base de datos las guarda. — _ProfileLibrary.tsx solo filtra por estado y muestra el texto 'Cambia el estado de un título desde su ficha'. LibraryItem tiene createdAt y updatedAt, pero no se muestran._
- **[media]** El aviso al cambiar de estado muestra el valor interno en inglés. — _src/features/media/hooks/useLibraryStatus.ts:56: toast.success(`Marcado como ${newStatus}`), que produce 'Marcado como WATCHING'._
- **[media]** No hay recuperación de contraseña, así que olvidarla significa perder la biblioteca y las reseñas. — _El enlace '¿Olvidaste tu contraseña?' de app/(auth)/login está deshabilitado con el texto 'Disponible próximamente', y CLAUDE.md lo documenta como deuda técnica._
- **[media]** 'Disponible en' no lleva al título dentro de la plataforma y mezcla suscripción, alquiler y compra. — _src/features/media/components/platforms/platformUtils.ts construye la URL de la portada de la plataforma, y StreamingProviders.tsx junta todos los tipos de oferta._
- **[baja]** La búsqueda y los filtros de Categorías se pierden al recargar o al volver atrás, y no hay buscador global. — _No se guarda nada en la URL en features/categories. La Navbar no tiene buscador._

**Features que pide**
- **Seguimiento por episodios: lista de temporadas, marcar episodios o temporadas completas como vistos y barra de progreso de cada serie**: Es lo básico de TV Time y Trakt. Sin esto no puedo cambiarme.
- **Pantalla 'Siguiente episodio' y calendario de emisiones de mis series**: Cada noche miro qué toca ver y qué sale esta semana.
- **Avisos de estreno de temporada y de 'ya disponible en' mi plataforma, por email o push**: Es la razón por la que tengo TV Time instalado.
- **Importar el historial desde Trakt o TV Time, por CSV o API**: Tengo años de historial y no voy a volver a marcarlo a mano.
- **Estadísticas de verdad: horas vistas, episodios por mes, géneros más vistos y resumen anual**: Soy analítico y es lo que más disfruto de Trakt.
- **Mostrar el estado de emisión de la serie (en emisión, finalizada o cancelada) y la fecha del próximo episodio en la ficha**: Decido si empiezo una serie según si ya ha terminado.
- **Biblioteca con orden por fecha de añadido o actualización, búsqueda, filtro película/serie y cambio rápido de estado**: Con cientos de títulos, tener que entrar en cada ficha no es viable.
- **Filtrar el catálogo por mis plataformas**: Solo me interesa lo que puedo ver con lo que ya pago.

**¿Seguiría usándola?** De momento no como herramienta principal. La usaría de vez en cuando para descubrir qué ver el finde en las plataformas españolas, pero seguiré con Trakt y TV Time hasta que tenga seguimiento por episodios, calendario y avisos, e importación de mi historial.

---

