// ═══════════════════════════════════════════════════════════════
//  NCM Database — Capítulos, Notas de Sección y Reglas
//  Esta base es reemplazable. Cuando tengas tu CSV/Excel propio,
//  convertilo a este formato y reemplazá este archivo.
// ═══════════════════════════════════════════════════════════════

/** Reglas Generales de Interpretación (RGI) del SA */
export const REGLAS_GENERALES = [
  { id: "RGI 1", text: "Los títulos de las Secciones, Capítulos o Subcapítulos solo tienen valor indicativo. La clasificación se determina por los textos de las partidas y Notas de Sección o Capítulo." },
  { id: "RGI 2a", text: "Cualquier referencia a un artículo incluye ese artículo incompleto o sin terminar, siempre que presente las características esenciales del artículo completo o terminado." },
  { id: "RGI 2b", text: "Cualquier referencia a una materia incluye las mezclas o asociaciones de dicha materia con otras materias. La clasificación se hace por la materia que confiera el carácter esencial." },
  { id: "RGI 3a", text: "Cuando sean aplicables dos o más partidas, la partida más específica tendrá prioridad sobre las más genéricas." },
  { id: "RGI 3b", text: "Los productos mezclados, surtidos o compuestos se clasifican según la materia o artículo que les confiera carácter esencial." },
  { id: "RGI 3c", text: "Cuando las reglas 3a y 3b no permitan la clasificación, se clasifica en la última partida por orden de numeración." },
  { id: "RGI 4", text: "Las mercancías que no puedan clasificarse aplicando las reglas anteriores se clasifican en la partida más análoga." },
  { id: "RGI 5a", text: "Los estuches y continentes especialmente concebidos se clasifican con el artículo al que están destinados." },
  { id: "RGI 5b", text: "Los envases que normalmente contengan las mercancías se clasifican con ellas." },
  { id: "RGI 6", text: "La clasificación en subpartidas se determina por sus textos y notas, con las reglas anteriores aplicadas mutatis mutandis." },
];

/** Secciones del NCM con notas clave */
export const SECCIONES: Record<number, { title: string; chapters: number[]; key_notes: string[] }> = {
  1: { title: "Animales vivos y productos del reino animal", chapters: [1,2,3,4,5], key_notes: [
    "Comprende todos los animales vivos excepto: peces/crustáceos vivos del Cap 3, cultivos de microorganismos (30.02), animales de la partida 95.08."
  ]},
  2: { title: "Productos del reino vegetal", chapters: [6,7,8,9,10,11,12,13,14], key_notes: [
    "Los productos vegetales se clasifican según su estado: frescos, secos, congelados, en conserva provisional."
  ]},
  3: { title: "Grasas y aceites", chapters: [15], key_notes: [
    "Comprende grasas y aceites animales, vegetales o de origen microbiano, y sus productos de desdoblamiento."
  ]},
  4: { title: "Productos de industrias alimentarias, bebidas, tabaco", chapters: [16,17,18,19,20,21,22,23,24], key_notes: [
    "Las preparaciones alimenticias se clasifican en esta sección solo si no están comprendidas más específicamente en la Sección I o II."
  ]},
  5: { title: "Productos minerales", chapters: [25,26,27], key_notes: [
    "Cap 27 comprende combustibles minerales, aceites minerales y productos de su destilación."
  ]},
  6: { title: "Productos de industrias químicas", chapters: [28,29,30,31,32,33,34,35,36,37,38], key_notes: [
    "NOTA 1: Salvo disposición en contrario, las partidas solo comprenden productos aislados químicamente definidos y sus disoluciones acuosas.",
    "Los medicamentos (Cap 30) prevalecen sobre los productos químicos en general."
  ]},
  7: { title: "Plástico y caucho", chapters: [39,40], key_notes: [
    "NOTA 2: Esta sección no comprende artículos de las partidas 83.09-83.10, ni artículos de la Sección XVII (vehículos y partes).",
    "Los artículos de plástico se clasifican en Cap 39 salvo que estén más específicamente comprendidos en otro capítulo."
  ]},
  8: { title: "Pieles, cueros, marroquinería", chapters: [41,42,43], key_notes: [
    "Cap 42 comprende artículos de viaje, bolsos, carteras independientemente del material."
  ]},
  9: { title: "Madera, corcho, cestería", chapters: [44,45,46], key_notes: [] },
  10: { title: "Pasta de madera, papel, cartón", chapters: [47,48,49], key_notes: [] },
  11: { title: "Materias textiles y sus manufacturas", chapters: [50,51,52,53,54,55,56,57,58,59,60,61,62,63], key_notes: [
    "NOTA IMPORTANTE: Los textiles confeccionados se clasifican en Cap 61 (punto) o 62 (no punto) según el tipo de tejido, no por el artículo.",
    "Cap 63 comprende artículos textiles confeccionados n.e.p."
  ]},
  12: { title: "Calzado, sombreros, paraguas", chapters: [64,65,66,67], key_notes: [
    "Cap 64: el calzado se clasifica por el material de la suela y la parte superior."
  ]},
  13: { title: "Piedra, cemento, cerámica, vidrio", chapters: [68,69,70], key_notes: [] },
  14: { title: "Perlas, piedras preciosas, metales preciosos", chapters: [71], key_notes: [] },
  15: { title: "Metales comunes y manufacturas", chapters: [72,73,74,75,76,78,79,80,81,82,83], key_notes: [
    "NOTA 1: Esta sección no comprende las pinturas preparadas (Cap 32), productos químicos (Sección VI), ni artículos de la Sección XVII.",
    "Las manufacturas de metal se clasifican por el metal base salvo que el artículo esté comprendido más específicamente en otro capítulo."
  ]},
  16: { title: "Máquinas, aparatos, material eléctrico", chapters: [84,85], key_notes: [
    "NOTA 1.f: No comprende artículos de la Sección XII (calzado, etc.).",
    "NOTA 1.e: No comprende bobinas, carretes y soportes similares (Sección VII o XV según materia).",
    "NOTA 2: Las partes de máquinas se clasifican según notas 2.a (partes que constituyen artículos de partidas de Cap 84/85), 2.b (partes de uso general = partidas 73.07-73.25, 83.01-83.08) y 2.c (las demás = según la máquina a la que se destinen).",
    "NOTA 3: Las máquinas con funciones múltiples se clasifican según la función principal o, en su defecto, por RGI 3c.",
    "Cap 84 = mecánico/térmico. Cap 85 = eléctrico/electrónico. Si un aparato tiene ambas funciones, se clasifica por la función principal."
  ]},
  17: { title: "Material de transporte", chapters: [86,87,88,89], key_notes: [
    "Cap 87 comprende vehículos terrestres y sus partes. Las partes deben ser identificables como destinadas exclusiva o principalmente a vehículos."
  ]},
  18: { title: "Instrumentos de óptica, fotografía, medicina, relojería, música", chapters: [90,91,92], key_notes: [
    "Cap 90 prevalece para instrumentos de medición y control sobre otros capítulos."
  ]},
  19: { title: "Armas y municiones", chapters: [93], key_notes: [] },
  20: { title: "Mercancías diversas", chapters: [94,95,96], key_notes: [
    "Cap 94 comprende muebles independientemente del material.",
    "Cap 95: juguetes, juegos y artículos deportivos. Nota: no incluye artículos que tengan carácter utilitario primordial."
  ]},
  21: { title: "Objetos de arte, colección, antigüedades", chapters: [97], key_notes: [] },
};

/** Capítulos con descripción y DI default */
export const CHAPTERS: Record<number, { description: string; di_default: number; iva_default: number; key_notes: string[] }> = {
  1: { description: "Animales vivos", di_default: 0, iva_default: 10.5, key_notes: ["No comprende peces vivos (Cap 3) ni animales de circo (95.08)."] },
  2: { description: "Carne y despojos comestibles", di_default: 9, iva_default: 10.5, key_notes: [] },
  3: { description: "Pescados, crustáceos, moluscos", di_default: 9, iva_default: 10.5, key_notes: [] },
  4: { description: "Leche, huevos, miel, productos comestibles de origen animal", di_default: 16, iva_default: 10.5, key_notes: [] },
  5: { description: "Demás productos de origen animal", di_default: 7.2, iva_default: 10.5, key_notes: [] },
  6: { description: "Plantas vivas y productos de floricultura", di_default: 0, iva_default: 10.5, key_notes: [] },
  7: { description: "Hortalizas, plantas, raíces y tubérculos alimenticios", di_default: 9, iva_default: 10.5, key_notes: [] },
  8: { description: "Frutas y frutos comestibles", di_default: 9, iva_default: 10.5, key_notes: [] },
  9: { description: "Café, té, yerba mate, especias", di_default: 9, iva_default: 10.5, key_notes: [] },
  10: { description: "Cereales", di_default: 0, iva_default: 10.5, key_notes: [] },
  11: { description: "Productos de molinería, malta, almidón", di_default: 9, iva_default: 10.5, key_notes: [] },
  12: { description: "Semillas y frutos oleaginosos", di_default: 7.2, iva_default: 10.5, key_notes: [] },
  13: { description: "Gomas, resinas y demás jugos vegetales", di_default: 7.2, iva_default: 10.5, key_notes: [] },
  14: { description: "Materias trenzables y demás productos vegetales", di_default: 5.4, iva_default: 10.5, key_notes: [] },
  15: { description: "Grasas y aceites animales o vegetales", di_default: 9, iva_default: 10.5, key_notes: [] },
  16: { description: "Preparaciones de carne, pescado, crustáceos", di_default: 16, iva_default: 10.5, key_notes: [] },
  17: { description: "Azúcares y artículos de confitería", di_default: 16, iva_default: 10.5, key_notes: [] },
  18: { description: "Cacao y sus preparaciones", di_default: 20, iva_default: 10.5, key_notes: [] },
  19: { description: "Preparaciones a base de cereales, pastelería", di_default: 16, iva_default: 10.5, key_notes: [] },
  20: { description: "Preparaciones de hortalizas, frutas", di_default: 12.6, iva_default: 10.5, key_notes: [] },
  21: { description: "Preparaciones alimenticias diversas", di_default: 16, iva_default: 10.5, key_notes: [] },
  22: { description: "Bebidas, líquidos alcohólicos, vinagre", di_default: 20, iva_default: 21, key_notes: ["Agua mineral y jugos naturales = IVA 10.5%. Bebidas alcohólicas y gaseosas = IVA 21%."] },
  23: { description: "Residuos de industrias alimentarias, alimentos para animales", di_default: 5.4, iva_default: 10.5, key_notes: [] },
  24: { description: "Tabaco y sucedáneos del tabaco elaborados", di_default: 12.6, iva_default: 21, key_notes: [] },
  25: { description: "Sal, azufre, tierras, piedras, yesos, cales, cementos", di_default: 3.6, iva_default: 21, key_notes: [] },
  26: { description: "Minerales metalíferos, escorias, cenizas", di_default: 0, iva_default: 21, key_notes: [] },
  27: { description: "Combustibles minerales, aceites minerales", di_default: 0, iva_default: 21, key_notes: [] },
  28: { description: "Productos químicos inorgánicos", di_default: 0, iva_default: 21, key_notes: [] },
  29: { description: "Productos químicos orgánicos", di_default: 0, iva_default: 21, key_notes: [] },
  30: { description: "Productos farmacéuticos", di_default: 12.6, iva_default: 21, key_notes: ["Nota: las preparaciones para diagnóstico van en Cap 38.22, no en Cap 30."] },
  31: { description: "Abonos", di_default: 0, iva_default: 21, key_notes: [] },
  32: { description: "Extractos curtientes, tintas, pinturas", di_default: 12.6, iva_default: 21, key_notes: [] },
  33: { description: "Aceites esenciales, perfumería, cosmética", di_default: 12.6, iva_default: 21, key_notes: ["NOTA: Cap 33 solo incluye productos acondicionados para venta al por menor. Los aceites esenciales a granel van en 33.01."] },
  34: { description: "Jabones, ceras, velas", di_default: 12.6, iva_default: 21, key_notes: [] },
  35: { description: "Materias albuminoideas, colas, enzimas", di_default: 12.6, iva_default: 21, key_notes: [] },
  36: { description: "Pólvoras y explosivos, artículos de pirotecnia", di_default: 10.8, iva_default: 21, key_notes: [] },
  37: { description: "Productos fotográficos o cinematográficos", di_default: 0, iva_default: 21, key_notes: [] },
  38: { description: "Productos diversos de industrias químicas", di_default: 12.6, iva_default: 21, key_notes: [] },
  39: { description: "Plástico y sus manufacturas", di_default: 12.6, iva_default: 21, key_notes: ["NOTA: Los artículos de plástico que constituyan partes de máquinas (Cap 84/85) se clasifican en esos capítulos, no en Cap 39."] },
  40: { description: "Caucho y sus manufacturas", di_default: 16, iva_default: 21, key_notes: [] },
  41: { description: "Pieles y cueros", di_default: 9, iva_default: 21, key_notes: [] },
  42: { description: "Manufacturas de cuero, artículos de viaje, bolsos", di_default: 20, iva_default: 21, key_notes: ["NOTA: Cap 42 comprende artículos de viaje, bolsos, carteras, etc. independientemente del material exterior."] },
  43: { description: "Peletería y confecciones de peletería", di_default: 9, iva_default: 21, key_notes: [] },
  44: { description: "Madera, carbón vegetal", di_default: 9, iva_default: 21, key_notes: [] },
  45: { description: "Corcho y sus manufacturas", di_default: 0, iva_default: 21, key_notes: [] },
  46: { description: "Manufacturas de espartería o cestería", di_default: 10.8, iva_default: 21, key_notes: [] },
  47: { description: "Pasta de madera, papel reciclado", di_default: 3.6, iva_default: 21, key_notes: [] },
  48: { description: "Papel y cartón", di_default: 10.8, iva_default: 21, key_notes: [] },
  49: { description: "Productos editoriales, prensa", di_default: 0, iva_default: 10.5, key_notes: [] },
  50: { description: "Seda", di_default: 3.6, iva_default: 21, key_notes: [] },
  51: { description: "Lana y pelo fino u ordinario", di_default: 18, iva_default: 21, key_notes: [] },
  52: { description: "Algodón", di_default: 18, iva_default: 21, key_notes: [] },
  53: { description: "Demás fibras textiles vegetales", di_default: 18, iva_default: 21, key_notes: [] },
  54: { description: "Filamentos sintéticos o artificiales", di_default: 18, iva_default: 21, key_notes: [] },
  55: { description: "Fibras sintéticas o artificiales discontinuas", di_default: 18, iva_default: 21, key_notes: [] },
  56: { description: "Guata, fieltro, telas sin tejer, cordeles", di_default: 18, iva_default: 21, key_notes: [] },
  57: { description: "Alfombras y demás revestimientos textiles para suelo", di_default: 20, iva_default: 21, key_notes: [] },
  58: { description: "Tejidos especiales, superficies textiles con pelo", di_default: 18, iva_default: 21, key_notes: [] },
  59: { description: "Telas impregnadas, recubiertas", di_default: 16, iva_default: 21, key_notes: [] },
  60: { description: "Tejidos de punto", di_default: 18, iva_default: 21, key_notes: [] },
  61: { description: "Prendas de vestir de punto", di_default: 20, iva_default: 21, key_notes: ["Cap 61 = prendas de tejido de PUNTO (knit). Si no es punto, va en Cap 62."] },
  62: { description: "Prendas de vestir excepto de punto", di_default: 20, iva_default: 21, key_notes: ["Cap 62 = prendas de tejido PLANO (woven). Si es punto, va en Cap 61."] },
  63: { description: "Demás artículos textiles confeccionados", di_default: 20, iva_default: 21, key_notes: [] },
  64: { description: "Calzado, polainas, botines", di_default: 20, iva_default: 21, key_notes: [
    "NOTA: La clasificación se determina por el material de la SUELA y de la PARTE SUPERIOR.",
    "64.01: Calzado impermeable con suela y parte superior de caucho o plástico.",
    "64.02: Demás calzado con suela y parte superior de caucho o plástico.",
    "64.03: Calzado con suela de caucho/plástico y parte superior de cuero.",
    "64.04: Calzado con suela de caucho/plástico y parte superior de materia textil.",
    "64.05: Los demás calzados."
  ]},
  65: { description: "Sombreros, demás tocados", di_default: 20, iva_default: 21, key_notes: [] },
  66: { description: "Paraguas, bastones", di_default: 20, iva_default: 21, key_notes: [] },
  67: { description: "Plumas y plumón preparados", di_default: 16, iva_default: 21, key_notes: [] },
  68: { description: "Manufacturas de piedra, yeso, cemento", di_default: 5.4, iva_default: 21, key_notes: [] },
  69: { description: "Productos cerámicos", di_default: 9, iva_default: 21, key_notes: [] },
  70: { description: "Vidrio y sus manufacturas", di_default: 9, iva_default: 21, key_notes: [] },
  71: { description: "Perlas, piedras preciosas, metales preciosos, bisutería", di_default: 0, iva_default: 21, key_notes: [] },
  72: { description: "Fundición, hierro y acero", di_default: 10.8, iva_default: 21, key_notes: [] },
  73: { description: "Manufacturas de fundición, hierro o acero", di_default: 12.6, iva_default: 21, key_notes: [] },
  74: { description: "Cobre y sus manufacturas", di_default: 10.8, iva_default: 21, key_notes: [] },
  75: { description: "Níquel y sus manufacturas", di_default: 10.8, iva_default: 21, key_notes: [] },
  76: { description: "Aluminio y sus manufacturas", di_default: 10.8, iva_default: 21, key_notes: [] },
  78: { description: "Plomo y sus manufacturas", di_default: 5.4, iva_default: 21, key_notes: [] },
  79: { description: "Cinc y sus manufacturas", di_default: 7.2, iva_default: 21, key_notes: [] },
  80: { description: "Estaño y sus manufacturas", di_default: 5.4, iva_default: 21, key_notes: [] },
  81: { description: "Demás metales comunes", di_default: 0, iva_default: 21, key_notes: [] },
  82: { description: "Herramientas y útiles, artículos de cuchillería", di_default: 18, iva_default: 21, key_notes: [] },
  83: { description: "Manufacturas diversas de metal común", di_default: 16, iva_default: 21, key_notes: [] },
  84: { description: "Reactores nucleares, calderas, máquinas", di_default: 12.6, iva_default: 21, key_notes: [
    "NOTA: Cap 84 comprende máquinas y aparatos mecánicos o térmicos.",
    "Las partes se clasifican según Nota 2 de Sección XVI."
  ]},
  85: { description: "Máquinas, aparatos y material eléctrico", di_default: 0, iva_default: 21, key_notes: [
    "NOTA: Cap 85 comprende aparatos eléctricos y electrónicos.",
    "BIT (Bienes de Informática y Telecomunicaciones) pueden tener DI reducido."
  ]},
  86: { description: "Vehículos y material para vías férreas", di_default: 12.6, iva_default: 21, key_notes: [] },
  87: { description: "Vehículos automóviles, tractores, velocípedos", di_default: 20, iva_default: 21, key_notes: [
    "NOTA: El DI varía significativamente según si el vehículo es CBU (armado), CKD (desarmado) o IKD (partes).",
    "Los vehículos eléctricos (8711.60) tienen régimen especial: IKD=0%, CKD=15%, CBU=20%."
  ]},
  88: { description: "Aeronaves, vehículos espaciales", di_default: 0, iva_default: 21, key_notes: [] },
  89: { description: "Barcos y demás artefactos flotantes", di_default: 12.6, iva_default: 21, key_notes: [] },
  90: { description: "Instrumentos y aparatos de óptica, fotografía, medición, medicina", di_default: 12.6, iva_default: 21, key_notes: [] },
  91: { description: "Aparatos de relojería", di_default: 18, iva_default: 21, key_notes: [] },
  92: { description: "Instrumentos musicales", di_default: 18, iva_default: 21, key_notes: [] },
  93: { description: "Armas, municiones y sus partes", di_default: 20, iva_default: 21, key_notes: [] },
  94: { description: "Muebles, mobiliario médico-quirúrgico, iluminación", di_default: 18, iva_default: 21, key_notes: [
    "NOTA: Cap 94 comprende muebles independientemente del material constitutivo."
  ]},
  95: { description: "Juguetes, juegos, artículos de deporte", di_default: 20, iva_default: 21, key_notes: [
    "NOTA: No comprende artículos que tengan carácter utilitario primordial."
  ]},
  96: { description: "Manufacturas diversas", di_default: 18, iva_default: 21, key_notes: [] },
  97: { description: "Objetos de arte, colección, antigüedades", di_default: 3.6, iva_default: 21, key_notes: [] },
};

/** Obtener sección de un capítulo */
export function getSectionForChapter(ch: number): { section: number; title: string; key_notes: string[] } | null {
  for (const [secStr, sec] of Object.entries(SECCIONES)) {
    if (sec.chapters.includes(ch)) {
      return { section: parseInt(secStr), title: sec.title, key_notes: sec.key_notes };
    }
  }
  return null;
}
